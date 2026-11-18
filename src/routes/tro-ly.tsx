import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState, Suspense } from "react";
import { supabase } from "@/integrations/supabase/client";
import { AssistantChat, AssistantIdentity, ChatWindow } from "@/components/site/AssistantChat";
import { Button } from "@/components/ui/button";
import { t } from "@/content/i18n";
export const Route = createFileRoute("/tro-ly")({
  head: () => ({ meta: [{ title: "Trợ lý khách hàng – Viện Doanh Trí" }, { name: "description", content: "Tìm hiểu khóa học, sự kiện, chuyên gia và cộng đồng cùng trợ lý Viện Doanh Trí." }, { property: "og:title", content: "Trợ lý khách hàng – Viện Doanh Trí" }, { property: "og:description", content: "Tra cứu thông tin Viện và lưu cuộc trò chuyện theo tài khoản." }, { property: "og:type", content: "website" }, { name: "twitter:card", content: "summary" }] }),
  component: AssistantPage,
});
function AssistantPage() {
  const [signedIn, setSignedIn] = useState<boolean | null>(null);
  useEffect(() => { void supabase.auth.getUser().then(({ data }) => setSignedIn(!!data.user)); const { data } = supabase.auth.onAuthStateChange((event, session) => { if (event === "SIGNED_IN" || event === "SIGNED_OUT") setSignedIn(!!session); }); return () => data.subscription.unsubscribe(); }, []);
  if (signedIn === null) return <p className="p-8 text-center text-muted-foreground">{t.assistant.loading}</p>;
  if (signedIn) return <Suspense fallback={<p className="p-8">{t.assistant.loading}</p>}><AssistantChat /></Suspense>;
  return <section className="mx-auto max-w-4xl px-5 py-8"><div className="mb-6 flex flex-wrap items-center gap-4"><AssistantIdentity /><h1 className="flex-1 text-3xl font-bold text-navy">{t.assistant.title}</h1><Button asChild variant="outline"><Link to="/auth" search={{ assistant: true }}>{t.assistant.memberMode}</Link></Button></div><ChatWindow threadId="guest-page" initialMessages={[]} guest /></section>;
}
