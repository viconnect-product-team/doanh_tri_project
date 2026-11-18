import { Suspense, useEffect, useState } from "react";
import { Link } from "@tanstack/react-router";
import { useQueryClient, useSuspenseQuery } from "@tanstack/react-query";
import { MessageCircle, X } from "lucide-react";
import type { UIMessage } from "ai";
import { t } from "@/content/i18n";
import { supabase } from "@/integrations/supabase/client";
import { assistantThreadQuery, assistantThreadsQuery, createAssistantThread } from "@/lib/assistant.functions";
import { AssistantIdentity, ChatWindow } from "@/components/site/AssistantChat";
import { Button } from "@/components/ui/button";

function WidgetThread({ threadId }: { threadId: string }) {
  const { data } = useSuspenseQuery(assistantThreadQuery(threadId));
  return <ChatWindow threadId={threadId} initialMessages={JSON.parse(data.transcript) as UIMessage[]} className="min-h-0 flex-1" />;
}

function WidgetChat() {
  const { data: threads } = useSuspenseQuery(assistantThreadsQuery);
  const qc = useQueryClient();
  const [created, setCreated] = useState<string | null>(null);
  const [failed, setFailed] = useState(false);
  const threadId = created ?? threads[0]?.id;
  useEffect(() => {
    if (threadId) return;
    let alive = true;
    createAssistantThread()
      .then(async (row) => { await qc.invalidateQueries({ queryKey: ["assistant-threads"] }); if (alive) setCreated(row.id); })
      .catch(() => { if (alive) setFailed(true); });
    return () => { alive = false; };
  }, [threadId, qc]);
  if (failed) return <p role="alert" className="p-4 text-sm text-destructive">{t.assistant.error}</p>;
  if (!threadId) return <p className="p-4 text-sm text-muted-foreground">{t.assistant.loading}</p>;
  return (
    <Suspense fallback={<p className="p-4 text-sm text-muted-foreground">{t.assistant.loading}</p>}>
      <WidgetThread threadId={threadId} />
    </Suspense>
  );
}

export function AssistantWidget() {
  const [open, setOpen] = useState(false);
  const [mode, setMode] = useState<"guest" | "member">("guest");
  const [signedIn, setSignedIn] = useState<boolean | null>(null);
  useEffect(() => {
    void supabase.auth.getUser().then(({ data }) => setSignedIn(!!data.user));
    const { data } = supabase.auth.onAuthStateChange((event, session) => { if (event === "SIGNED_IN" || event === "SIGNED_OUT") setSignedIn(!!session); });
    return () => data.subscription.unsubscribe();
  }, []);
  return (
    <>
      {open && (
        <div role="dialog" aria-label={t.assistant.title}
          className="fixed inset-x-3 bottom-24 z-50 flex h-[min(600px,calc(100dvh-8rem))] flex-col overflow-hidden rounded-lg border border-border bg-background shadow-lg sm:inset-x-auto sm:right-5 sm:w-[400px]">
          <div className="flex shrink-0 items-center gap-3 border-b border-border px-4 py-3">
            <AssistantIdentity className="h-9 w-9" />
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-bold text-navy">{t.assistant.title}</p>
              <p className="truncate text-xs text-muted-foreground">{t.assistant.description}</p>
            </div>
            <Button variant="ghost" size="icon" className="h-9 w-9 shrink-0" aria-label={t.assistant.close} title={t.assistant.close} onClick={() => setOpen(false)}><X className="h-5 w-5" /></Button>
          </div>
          <div className="flex min-h-0 flex-1 flex-col px-4 pb-4 pt-2">
            <div className="mb-3 flex shrink-0 gap-1 border-b border-border pb-2">
              <Button variant={mode === "guest" ? "secondary" : "ghost"} onClick={() => setMode("guest")} aria-pressed={mode === "guest"}>{t.assistant.guestMode}</Button>
              <Button variant={mode === "member" ? "secondary" : "ghost"} onClick={() => setMode("member")} aria-pressed={mode === "member"}>{t.assistant.memberMode}</Button>
            </div>
            {mode === "member" && signedIn && <Button asChild variant="link" className="mb-2 justify-start px-0"><Link to="/hoi-vien" onClick={() => setOpen(false)}>{t.memberPage.title}</Link></Button>}
            {mode === "guest" ? <ChatWindow threadId="guest-widget" initialMessages={[]} guest className="min-h-0 flex-1" /> : signedIn ? <Suspense fallback={<p>{t.assistant.loading}</p>}><WidgetChat /></Suspense> : <div className="flex flex-1 flex-col items-center justify-center gap-4 text-center"><p className="text-sm text-muted-foreground">{t.assistant.memberUnavailable}</p><Button asChild><Link to="/auth" search={{ assistant: true }}>{t.assistant.signIn}</Link></Button></div>}

          </div>
        </div>
      )}
      <Button size="icon" aria-label={open ? t.assistant.close : t.assistant.open} title={t.assistant.title} aria-expanded={open}
        onClick={() => setOpen(!open)}
        className={`fixed bottom-5 right-5 z-50 h-16 w-16 overflow-hidden rounded-full shadow-lg ring-2 ring-background ${open ? "" : "p-0"}`}>
        {open ? <X className="h-6 w-6" /> : <AssistantIdentity className="h-full w-full" />}
      </Button>
    </>
  );
}
