# Edge Function Debugging Guide

**Purpose:** Troubleshoot and fix failing `supabase.functions.invoke()` calls in the Recruitly application.

---

## 🔍 Quick Diagnosis Process

### Step 1: Identify the Failing Function

Review the console in your browser (F12 → Console tab) when an action fails:
- **What action was performed?** (e.g., "Updated PCC status to Dispatched")
- **What error message appears?** (e.g., "Unauthorized", "Internal server error", 5xx response)
- **Which function is being called?** (Check the network tab → XHR/Fetch requests)

**Common Failure Points:**
1. **Unauthorized (401)** → Auth header missing or invalid token
2. **Forbidden (403)** → User role insufficient (e.g., expecting admin)
3. **Bad Request (400)** → Invalid payload / missing required fields
4. **Internal Server Error (500)** → Bug in function code or missing secret
5. **502/503 (Gateway)** → Function deployment failed or timeout

---

## 🛠️ Local Function Testing

### Prerequisites
```bash
# Install Supabase CLI (if not already)
brew install supabase/tap/supabase

# Login to your Supabase project
supabase login
# Follow prompts to authenticate with access token
```

### Start Local Function Server

```bash
cd /Users/khemrajadhikari/Downloads/recruitlynew

# Start the local Deno runtime for functions
supabase functions serve

# Expected output:
# ✓ Supabase functions server started
# http://localhost:54321/functions/v1/
```

Keep this terminal open. It will hot-reload functions as you edit them.

### Test a Function with curl

#### Example 1: Test `admin-actions` (Get Dashboard Stats)

```bash
# Get your auth token (from browser console after login):
# supabase.auth.session().then(s => console.log(s.access_token))

TOKEN="your_auth_token_here"

curl -X POST http://localhost:54321/functions/v1/admin-actions \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{ "action": "get_dashboard_stats" }'

# Expected response:
# {
#   "partners": 5,
#   "wisescoreLeads": 42,
#   ...
# }
```

#### Example 2: Test `submit-consultation` (Form Submission)

```bash
TOKEN="your_auth_token_here"

curl -X POST http://localhost:54321/functions/v1/submit-consultation \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "full_name": "John Doe",
    "email": "john@example.com",
    "service": "education",
    "message": "I want to study in Germany"
  }'

# Expected response:
# { "success": true, "consultation_id": "uuid-here" }
```

#### Example 3: Test `intent-router` (AI Routing)

```bash
TOKEN="your_auth_token_here"

curl -X POST http://localhost:54321/functions/v1/intent-router \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "query": "I want to hire 50 workers for Germany by June"
  }'

# Expected response:
# {
#   "service": "recruitment",
#   "suggestedAction": "Create job listing",
#   "confidence": 0.95
# }
```

---

## 🔒 Authentication Header Issues

### Problem: "Unauthorized (401)" Errors

**Root Cause:** Function not receiving valid auth header or user not authenticated.

**Fix:**

1. **Frontend: Ensure Bearer Token is Passed**
   
   Check the invoke call in your component:
   ```typescript
   const { data: { session } } = await supabase.auth.getSession();
   
   const resp = await supabase.functions.invoke("upload-to-drive", {
     body: fd,
     headers: {
       Authorization: `Bearer ${session?.access_token}` // ✅ Must be included
     },
   });
   ```

2. **Edge Function: Verify Auth Check**

   In the function (e.g., `supabase/functions/upload-to-drive/index.ts`):
   ```typescript
   const authHeader = req.headers.get("authorization");
   if (!authHeader) {
     return new Response(JSON.stringify({ error: "Unauthorized" }), { status: 401 });
   }

   const supabaseUser = createClient(supabaseUrl, supabaseAnon, {
     global: { headers: { Authorization: authHeader } },
   });
   const { data: { user }, error: userError } = await supabaseUser.auth.getUser();
   if (userError || !user) {
     return new Response(JSON.stringify({ error: "Unauthorized" }), { status: 401 });
   }
   ```

3. **Test Locally**
   ```bash
   # Without token (should fail 401)
   curl -X POST http://localhost:54321/functions/v1/upload-to-drive

   # With token (should succeed)
   TOKEN="your_session_token"
   curl -X POST http://localhost:54321/functions/v1/upload-to-drive \
     -H "Authorization: Bearer $TOKEN" \
     -H "Content-Type: application/json" \
     -d '{}'
   ```

---

## 🚨 Common Function Issues & Fixes

### Issue 1: Missing Environment Secrets

**Symptom:** Function returns "Internal server error" or `Cannot read property 'private_key'`

**Cause:** Secret not configured in Supabase Dashboard

**Fix:**

1. Go to **Supabase Dashboard** → Your Project → **Settings** → **Edge Functions** (or **Environment Variables**)
2. Add required secrets:
   ```
   GOOGLE_SERVICE_ACCOUNT_JSON = <full JSON from Google Cloud>
   GOOGLE_DRIVE_PARENT_FOLDER_ID = <folder ID from Drive URL>
   SUPABASE_URL = <your project URL>
   SUPABASE_ANON_KEY = <public anon key>
   SUPABASE_SERVICE_ROLE_KEY = <service role key>
   ```
3. Redeploy the function:
   ```bash
   supabase functions deploy upload-to-drive
   ```
4. Test again with curl

### Issue 2: Invalid Payload / Missing Fields

**Symptom:** Function returns "candidateName, passportNumber, and file are required"

**Cause:** Frontend not sending required fields in the correct format

**Fix:** In RecruiterDashboard.tsx, verify the FormData is built correctly:
```typescript
const fd = new FormData();
fd.append("candidateName", form.full_name);           // ✅ String
fd.append("passportNumber", form.passport_number);    // ✅ String
fd.append("file", file);                              // ✅ File object

const resp = await supabase.functions.invoke("upload-to-drive", {
  body: fd,  // ✅ FormData, not JSON
  headers: { Authorization: `Bearer ${session?.access_token}` },
});
```

### Issue 3: RLS Policy Violation

**Symptom:** Function succeeds but data doesn't persist, or "permission denied" on DB query

**Cause:** User doesn't have SELECT/UPDATE/INSERT permission on the table

**Fix:** Check/update RLS policies in Supabase Dashboard → SQL Editor:
```sql
-- For candidates table, check policy:
SELECT * FROM pg_policies WHERE schemaname='public' AND tablename='candidates';

-- Example policy (if missing):
CREATE POLICY candidates_recruiter_access ON candidates FOR SELECT
  USING (recruiter_id = auth.uid() OR EXISTS(SELECT 1 FROM user_roles WHERE user_id = auth.uid() AND role = 'admin'));

CREATE POLICY candidates_recruiter_insert ON candidates FOR INSERT
  WITH CHECK (recruiter_id = auth.uid());

CREATE POLICY candidates_admin_full ON candidates FOR ALL
  USING (EXISTS(SELECT 1 FROM user_roles WHERE user_id = auth.uid() AND role = 'admin'));
```

### Issue 4: Timeout / Slow Response

**Symptom:** Function takes >30 seconds or times out

**Cause:** External API call (e.g., Google Drive) taking too long, or infinite loop

**Fix:**
1. Add timeout to external requests:
   ```typescript
   const controller = new AbortController();
   const timeout = setTimeout(() => controller.abort(), 10000); // 10s timeout
   
   const tokenResp = await fetch("https://oauth2.googleapis.com/token", {
     method: "POST",
     signal: controller.signal,
     // ... rest of request
   });
   
   clearTimeout(timeout);
   ```
2. Monitor function logs:
   ```bash
   supabase functions logs upload-to-drive --follow
   ```

---

## 📊 Function-by-Function Debugging

### Function: `admin-actions`

**Used by:** AdminDashboard, AdminDataTab, AdminPartnersTab, AdminConsultationsTab

**Actions:**
- `get_dashboard_stats` → fetches summary data
- `verify_partner` → marks partner as verified
- `create_broadcast` → sends broadcast message
- (others as needed)

**Test:**
```bash
curl -X POST http://localhost:54321/functions/v1/admin-actions \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{ "action": "get_dashboard_stats" }'
```

**Debug Checklist:**
- [ ] User has `admin` role in `user_roles` table
- [ ] Authorization header is valid
- [ ] Action string matches function implementation
- [ ] Function logs show no errors: `supabase functions logs admin-actions`

---

### Function: `upload-to-drive`

**Used by:** RecruiterDashboard.tsx → handleUpload()

**Expects:**
- `candidateName` (FormData string)
- `passportNumber` (FormData string)
- `file` (FormData File object)

**Test (with file):**
```bash
TOKEN="your_auth_token"

curl -X POST http://localhost:54321/functions/v1/upload-to-drive \
  -H "Authorization: Bearer $TOKEN" \
  -F "candidateName=John Doe" \
  -F "passportNumber=AB123456" \
  -F "file=@/path/to/your/file.pdf"

# Expected response:
# {
#   "success": true,
#   "folderId": "Google Drive folder ID",
#   "folderUrl": "Drive folder URL",
#   "fileId": "uploaded file ID",
#   "webViewLink": "https://drive.google.com/file/d/..."
# }
```

**Debug Checklist:**
- [ ] `GOOGLE_SERVICE_ACCOUNT_JSON` secret is set (Supabase Dashboard)
- [ ] `GOOGLE_DRIVE_PARENT_FOLDER_ID` secret is set or hardcoded fallback exists
- [ ] Service account JSON has valid `private_key` field
- [ ] Drive API is enabled in Google Cloud project
- [ ] Service account email is shared on the Drive folder
- [ ] File size < 20MB
- [ ] File type is PDF, ZIP, DOC, or DOCX

---

### Function: `document-status-alert`

**Used by:** RecruiterDashboard.tsx → updateField() when PCC/SLC dispatched  
**Also by:** AdminCandidatesTab.tsx → update() when PCC/SLC marked Received

**Expects:**
```json
{
  "candidate_id": "uuid",
  "candidate_name": "John Doe",
  "recruiter_id": "uuid",
  "field": "pcc_status",
  "new_value": "Dispatched to Admin",
  "actor_role": "recruiter",
  "actor_user_id": "uuid"
}
```

**Test:**
```bash
curl -X POST http://localhost:54321/functions/v1/document-status-alert \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "candidate_id": "550e8400-e29b-41d4-a716-446655440000",
    "candidate_name": "John Doe",
    "recruiter_id": "550e8400-e29b-41d4-a716-446655440001",
    "field": "pcc_status",
    "new_value": "Dispatched to Admin",
    "actor_role": "recruiter",
    "actor_user_id": "550e8400-e29b-41d4-a716-446655440001"
  }'
```

**Debug Checklist:**
- [ ] Payload includes all required fields
- [ ] User role is correctly identified (recruiter vs admin)
- [ ] Notification is inserted into `notifications` table
- [ ] RLS policy allows user to see their own notifications

---

### Function: `submit-consultation`

**Used by:** ApostilleServices.tsx, ToursAndTravels.tsx, useSubmitConsultation hook

**Expects:**
```json
{
  "full_name": "John Doe",
  "email": "john@example.com",
  "phone": "+44 20 7946 0958",
  "service": "apostille|education|travel|recruitment|other",
  "message": "I need help with ...",
  "data": { ... } // optional extra fields
}
```

**Test:**
```bash
curl -X POST http://localhost:54321/functions/v1/submit-consultation \
  -H "Content-Type: application/json" \
  -d '{
    "full_name": "Jane Smith",
    "email": "jane@example.com",
    "phone": "+1 650 253 0000",
    "service": "education",
    "message": "I want to study in Canada"
  }'
```

**Debug Checklist:**
- [ ] All required fields present
- [ ] Email is valid format
- [ ] Consultation is inserted into `consultation_requests` table
- [ ] Email notification is sent (if enabled)

---

## 🔧 Debugging Tools

### Browser DevTools

1. **Console Tab:**
   - Look for error messages when functions fail
   - Check for 401/403/500 responses

2. **Network Tab:**
   - Filter by XHR/Fetch
   - Right-click on failed request → Copy as cURL
   - Inspect request headers and response body

3. **Application Tab:**
   - Check `localStorage` for auth token
   - Verify session is valid (not expired)

### Supabase Dashboard

1. **Function Logs:**
   ```bash
   supabase functions logs <function-name> --follow
   ```

2. **Database Logs:**
   - Check for RLS violations: look for `policy violation` errors

3. **Edge Function Metrics:**
   - Dashboard → Functions → View execution logs

---

## 🚀 Deployment Checklist

Before deploying functions to production:

- [ ] All secrets are configured in Supabase Dashboard
- [ ] Function works locally with `supabase functions serve`
- [ ] Tested with curl using real payloads
- [ ] CORS headers are correct (allow frontend origin)
- [ ] Auth verification is in place
- [ ] Error messages are user-friendly (not exposing internals)
- [ ] Timeouts are set for external API calls
- [ ] Function logs are enabled and monitored

Deploy with:
```bash
supabase functions deploy <function-name>
```

---

## 📞 Need Help?

If a function is still failing after following this guide:

1. **Capture the full error:**
   - Browser console error message
   - Network response body (copy as cURL)
   - Supabase function logs (last 10 lines)

2. **Share this information:**
   - Function name
   - Action/payload being sent
   - Complete error message
   - Expected vs actual behavior

3. **Check GitHub Issues:**
   - Search Supabase docs for similar issues
   - Check Deno docs if it's a runtime error
