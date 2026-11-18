import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { t } from "@/content/i18n";
import { Section } from "@/components/site/Layout";
import { Button } from "@/components/ui/button";

export const Route = createFileRoute("/auth")({
  validateSearch: (s: Record<string, unknown>): { assistant?: boolean; member?: boolean } => ({ ...(s["assistant"] === true || s["assistant"] === "true" ? { assistant: true } : {}), ...(s["member"] === true || s["member"] === "true" ? { member: true } : {}) }),
  head: () => ({
    meta: [
      { title: "Đăng nhập quản trị – Viện Doanh Trí" },
      { name: "description", content: "Đăng nhập khu vực quản trị khách hàng của Viện Doanh Trí." },
      { property: "og:title", content: "Đăng nhập quản trị – Viện Doanh Trí" },
      { property: "og:description", content: "Đăng nhập khu vực quản trị khách hàng của Viện Doanh Trí." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: AuthPage,
});

const field = "w-full rounded-md border border-input bg-background px-3 py-3 text-sm outline-none focus:border-primary";

function AuthPage() {
  const a = t.auth;
  const { assistant: assistantChat, member } = Route.useSearch();
  const assistant = assistantChat || member;
  const nav = useNavigate();
  useEffect(() => {
    if (!member) return;
    let cancelled = false;
    const checkSession = async () => {
      // Wait for invitation/session hydration before entering the protected page.
      const { data } = await supabase.auth.getUser();
      if (!cancelled && data.user) await nav({ to: "/hoi-vien", replace: true });
    };
    void checkSession();
    return () => { cancelled = true; };
  }, [member, nav]);
  const [mode, setMode] = useState<"in" | "up">("in");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [msg, setMsg] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true); setMsg(null);
    if (assistant) {
      const { error } = await supabase.auth.signInWithOtp({ email, options: { shouldCreateUser: false, emailRedirectTo: member ? `${window.location.origin}/auth?member=true` : `${window.location.origin}/tro-ly` } });
      setBusy(false); setMsg(error ? a.error : a.checkEmail); return;
    }
    if (mode === "in") {
      const { error } = await supabase.auth.signInWithPassword({ email, password });
      setBusy(false);
      if (error) return setMsg(a.error);
      nav({ to: assistant ? "/tro-ly" : "/crm" });
    } else {
      const { error } = await supabase.auth.signUp({ email, password, options: { emailRedirectTo: window.location.origin + (assistant ? "/tro-ly" : "/crm") } });
      setBusy(false);
      setMsg(error ? error.message : a.checkEmail);
    }
  }

  return (
    <Section className="flex justify-center py-20">
      <form onSubmit={submit} className="w-full max-w-md space-y-4 rounded-2xl border border-border bg-card p-8 shadow-soft">
        <h1 className="font-display text-3xl font-semibold text-navy">{member ? t.assistant.membershipLogin : assistant ? (mode === "in" ? t.assistant.signIn : t.assistant.signUp) : (mode === "in" ? a.signIn : a.signUp)}</h1>
        <p className="text-sm text-muted-foreground">{assistant ? t.assistant.accountLead : a.lead}</p>
        <input type="email" required value={email} onChange={(e) => setEmail(e.target.value)} placeholder="Email" className={field} />
        {!assistant && <input type="password" required minLength={8} value={password} onChange={(e) => setPassword(e.target.value)} placeholder={a.password} className={field} />}
        {msg && <p className="text-sm text-muted-foreground">{msg}</p>}
        <Button disabled={busy} className="h-12 w-full">{member ? t.assistant.membershipLogin : assistant ? (mode === "in" ? t.assistant.signIn : t.assistant.signUp) : (mode === "in" ? a.signIn : a.signUp)}</Button>
        {!assistant && <Button variant="link" type="button" onClick={() => setMode(mode === "in" ? "up" : "in")} className="w-full">{mode === "in" ? a.toSignUp : a.toSignIn}</Button>}
      </form>
    </Section>
  );
}
