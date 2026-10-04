// supabase/functions/upload-to-drive/index.ts
//
// Google Drive upload via Service Account.
// Environment secrets required in Supabase Dashboard:
//   GOOGLE_SERVICE_ACCOUNT_JSON  — full service account JSON string
//   GOOGLE_DRIVE_PARENT_FOLDER_ID — the parent folder ID from the Drive URL
//
// What this function does:
//   1. Receives: candidateName, passportNumber, file (multipart/form-data)
//   2. Gets a Google OAuth2 access token using the service account JWT
//   3. Creates (or finds) a subfolder named "CandidateName_PassportNumber"
//   4. Uploads the file into that subfolder
//   5. Returns: { folderId, folderUrl, fileId, webViewLink }

import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://deno.land/x/supabase_js@2.45.1/mod.ts";
import { create, getNumericDate } from "https://deno.land/x/djwt@v3.0.2/mod.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

// ── Google OAuth2 JWT helper ──────────────────────────────────────────────────

async function getAccessToken(serviceAccountJson: string): Promise<string> {
  const sa = JSON.parse(serviceAccountJson);

  // Import the private key
  const pemKey = sa.private_key as string;
  const keyData = pemKey
    .replace(/-----BEGIN PRIVATE KEY-----/, "")
    .replace(/-----END PRIVATE KEY-----/, "")
    .replace(/\n/g, "");
  const binaryKey = Uint8Array.from(atob(keyData), (c) => c.charCodeAt(0));

  const privateKey = await crypto.subtle.importKey(
    "pkcs8",
    binaryKey.buffer,
    { name: "RSASSA-PKCS1-v1_5", hash: "SHA-256" },
    false,
    ["sign"]
  );

  const now = Math.floor(Date.now() / 1000);
  const payload = {
    iss: sa.client_email,
    scope: "https://www.googleapis.com/auth/drive.file",
    aud: "https://oauth2.googleapis.com/token",
    iat: now,
    exp: now + 3600,
  };

  const jwt = await create(
    { alg: "RS256", typ: "JWT" },
    payload,
    privateKey
  );

  const tokenResp = await fetch("https://oauth2.googleapis.com/token", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      grant_type: "urn:ietf:params:oauth:grant-type:jwt-bearer",
      assertion: jwt,
    }),
  });

  const tokenData = await tokenResp.json();
  if (!tokenData.access_token) {
    throw new Error(`Token error: ${JSON.stringify(tokenData)}`);
  }
  return tokenData.access_token;
}

// ── Create Drive folder ───────────────────────────────────────────────────────

async function createDriveFolder(
  accessToken: string,
  folderName: string,
  parentId: string
): Promise<{ id: string; webViewLink: string }> {
  // First check if folder already exists (idempotent)
  const searchResp = await fetch(
    `https://www.googleapis.com/drive/v3/files?q=${encodeURIComponent(
      `name='${folderName}' and '${parentId}' in parents and mimeType='application/vnd.google-apps.folder' and trashed=false`
    )}&fields=files(id,webViewLink)`,
    { headers: { Authorization: `Bearer ${accessToken}` } }
  );
  const searchData = await searchResp.json();

  if (searchData.files?.length > 0) {
    return searchData.files[0];
  }

  // Create new folder
  const createResp = await fetch(
    "https://www.googleapis.com/drive/v3/files?fields=id,webViewLink",
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${accessToken}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        name: folderName,
        mimeType: "application/vnd.google-apps.folder",
        parents: [parentId],
      }),
    }
  );
  return await createResp.json();
}

// ── Upload file to Drive folder ───────────────────────────────────────────────

async function uploadFileToDrive(
  accessToken: string,
  folderId: string,
  fileName: string,
  fileBuffer: ArrayBuffer,
  mimeType: string
): Promise<{ id: string; webViewLink: string }> {
  const metadata = JSON.stringify({
    name: fileName,
    parents: [folderId],
  });

  const body = new FormData();
  body.append(
    "metadata",
    new Blob([metadata], { type: "application/json" })
  );
  body.append("file", new Blob([fileBuffer], { type: mimeType }));

  const uploadResp = await fetch(
    "https://www.googleapis.com/upload/drive/v3/files?uploadType=multipart&fields=id,webViewLink",
    {
      method: "POST",
      headers: { Authorization: `Bearer ${accessToken}` },
      body,
    }
  );
  return await uploadResp.json();
}

// ── Main handler ──────────────────────────────────────────────────────────────

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // ── Auth: verify the caller is an authenticated recruiter or admin ─────
    const supabaseUrl    = Deno.env.get("SUPABASE_URL")!;
    const supabaseAnon   = Deno.env.get("SUPABASE_ANON_KEY")!;
    const serviceKey     = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const saJson         = Deno.env.get("GOOGLE_SERVICE_ACCOUNT_JSON")!;
    const parentFolderId = Deno.env.get("GOOGLE_DRIVE_PARENT_FOLDER_ID") ?? "1wP9qTwiwCq7flVaEGicEwHmT51JLE3bd";

    const authHeader = req.headers.get("authorization");
    if (!authHeader) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const supabaseUser = createClient(supabaseUrl, supabaseAnon, {
      global: { headers: { Authorization: authHeader } },
    });
    const { data: { user }, error: userError } = await supabaseUser.auth.getUser();
    if (userError || !user) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Verify recruiter or admin role
    const supabaseAdmin = createClient(supabaseUrl, serviceKey);
    const { data: roleRow } = await supabaseAdmin
      .from("user_roles")
      .select("role")
      .eq("user_id", user.id)
      .maybeSingle();

    const role = roleRow?.role;
    if (role !== "recruiter" && role !== "admin") {
      return new Response(JSON.stringify({ error: "Forbidden" }), {
        status: 403, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // ── Parse form data ───────────────────────────────────────────────────
    const formData       = await req.formData();
    const candidateName  = (formData.get("candidateName") as string)?.trim();
    const passportNumber = (formData.get("passportNumber") as string)?.trim();
    const file           = formData.get("file") as File | null;

    if (!candidateName || !passportNumber || !file) {
      return new Response(
        JSON.stringify({ error: "candidateName, passportNumber, and file are required" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Validate file size (20MB max)
    if (file.size > 20 * 1024 * 1024) {
      return new Response(JSON.stringify({ error: "File too large. Max 20MB." }), {
        status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const allowedTypes = [
      "application/pdf",
      "application/zip",
      "application/x-zip-compressed",
      "application/msword",
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    ];
    if (!allowedTypes.includes(file.type)) {
      return new Response(
        JSON.stringify({ error: "Only PDF, ZIP, DOC, or DOCX files are allowed." }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // ── Google Drive operations ───────────────────────────────────────────
    const accessToken = await getAccessToken(saJson);

    // Sanitize folder name: "John Smith_AB123456"
    const safeName     = candidateName.replace(/[^a-zA-Z0-9 _-]/g, "").trim();
    const safePassport = passportNumber.replace(/[^a-zA-Z0-9-]/g, "").toUpperCase();
    const folderName   = `${safeName}_${safePassport}`;

    const folder = await createDriveFolder(accessToken, folderName, parentFolderId);
    if (!folder.id) {
      throw new Error(`Failed to create folder: ${JSON.stringify(folder)}`);
    }

    const fileBuffer  = await file.arrayBuffer();
    const timestamp   = new Date().toISOString().slice(0, 10);
    const uploadedFile = await uploadFileToDrive(
      accessToken,
      folder.id,
      `${timestamp}_${file.name}`,
      fileBuffer,
      file.type
    );

    return new Response(
      JSON.stringify({
        success:    true,
        folderId:   folder.id,
        folderUrl:  folder.webViewLink  ?? `https://drive.google.com/drive/folders/${folder.id}`,
        fileId:     uploadedFile.id,
        webViewLink: uploadedFile.webViewLink,
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );

  } catch (err) {
    console.error("upload-to-drive error:", err);
    return new Response(
      JSON.stringify({ error: "Internal server error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
