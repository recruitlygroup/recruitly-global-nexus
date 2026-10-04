// /blog/login/admin — admin sign-in + markdown blog editor.
//
// SECURITY: credentials are NOT stored in the front-end bundle. This is a static site, so any password in
// source would be public. Sign-in uses Supabase Auth (the account admin@recruitlygroup.com must exist there with
// the `admin` role), and the `blog-admin` edge function re-verifies admin status server-side before it commits
// the .md file to GitHub.
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Loader2, LogOut, Lock } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import AdminBlogTab from "@/components/admin/AdminBlogTab";
import { useSEO } from "@/hooks/useSEO";

type State = "checking" | "signed_out" | "not_admin" | "admin";

const BlogAdminLogin = () => {
  useSEO({ title: "Blog Admin | Recruitly Group", description: "Blog administration", canonicalUrl: "https://www.recruitlygroup.com/blog/login/admin" });
  const [state, setState] = useState<State>("checking");
  const [email, setEmail] = useState("admin@recruitlygroup.com");
  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // keep this page out of search engines
  useEffect(() => {
    const m = document.createElement("meta");
    m.name = "robots"; m.content = "noindex,nofollow";
    document.head.appendChild(m);
    return () => { document.head.removeChild(m); };
  }, []);

  const evaluate = async () => {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) { setState("signed_out"); return; }
    const { data: isAdmin } = await supabase.rpc("is_admin", { _user_id: session.user.id });
    setState(isAdmin ? "admin" : "not_admin");
  };

  useEffect(() => { evaluate(); /* eslint-disable-next-line react-hooks/exhaustive-deps */ }, []);

  const signIn = async (e: React.FormEvent) => {
    e.preventDefault();
    setBusy(true); setError(null);
    const { error } = await supabase.auth.signInWithPassword({ email: email.trim(), password });
    setBusy(false);
    setPassword("");
    if (error) { setError("Invalid email or password."); return; }
    await evaluate();
  };

  const signOut = async () => { await supabase.auth.signOut(); setState("signed_out"); };

  if (state === "checking") {
    return <div className="min-h-screen flex items-center justify-center"><Loader2 className="w-8 h-8 animate-spin text-accent" /></div>;
  }

  if (state === "admin") {
    return (
      <div className="min-h-screen bg-background">
        <header className="bg-primary text-white">
          <div className="max-w-6xl mx-auto px-4 h-14 flex items-center justify-between">
            <span className="font-extrabold">Recruitly · Blog Admin</span>
            <div className="flex items-center gap-4 text-sm">
              <Link to="/blog" className="text-white/80 hover:text-white">View blog</Link>
              <button onClick={signOut} className="flex items-center gap-1.5 text-white/80 hover:text-white"><LogOut className="w-4 h-4" />Sign out</button>
            </div>
          </div>
        </header>
        <main className="max-w-6xl mx-auto px-4 py-8"><AdminBlogTab /></main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background flex items-center justify-center px-4">
      <div className="w-full max-w-sm bg-white border border-border rounded-md p-8">
        <div className="w-10 h-10 rounded-full bg-primary text-white flex items-center justify-center mb-4"><Lock className="w-5 h-5" /></div>
        <h1 className="text-2xl font-extrabold text-primary mb-1">Blog admin</h1>
        <p className="text-sm text-slate-600 mb-6">Sign in to write and publish blog posts.</p>

        {state === "not_admin" && (
          <p className="text-sm text-accent mb-4" role="alert">This account does not have admin access. <button className="underline" onClick={signOut}>Sign out</button></p>
        )}

        <form onSubmit={signIn} className="space-y-4">
          <div><Label htmlFor="email">User ID</Label><Input id="email" type="email" autoComplete="username" value={email} onChange={(e) => setEmail(e.target.value)} required /></div>
          <div><Label htmlFor="pw">Password</Label><Input id="pw" type="password" autoComplete="current-password" value={password} onChange={(e) => setPassword(e.target.value)} required /></div>
          {error && <p className="text-sm text-accent" role="alert">{error}</p>}
          <Button type="submit" disabled={busy} className="w-full bg-accent hover:bg-accent/90 text-white font-bold">
            {busy ? <Loader2 className="w-4 h-4 animate-spin" /> : "Sign in"}
          </Button>
        </form>
      </div>
    </div>
  );
};
export default BlogAdminLogin;
