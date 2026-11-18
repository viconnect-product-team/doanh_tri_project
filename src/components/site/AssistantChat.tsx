import { useChat } from "@ai-sdk/react";
import { DefaultChatTransport, type UIMessage, isToolUIPart } from "ai";
import { Link, useNavigate } from "@tanstack/react-router";
import { useQueryClient, useSuspenseQuery } from "@tanstack/react-query";
import { Suspense, useEffect, useMemo, useRef, useState } from "react";
import { Plus, Trash2, LogOut } from "lucide-react";
import { t, getLocale } from "@/content/i18n";
import { supabase } from "@/integrations/supabase/client";
import { assistantThreadsQuery, createAssistantThread, deleteAssistantThread } from "@/lib/assistant.functions";
import { Button } from "@/components/ui/button";
import { Conversation, ConversationContent, ConversationScrollButton } from "@/components/ai-elements/conversation";
import { Message, MessageContent, MessageResponse } from "@/components/ai-elements/message";
import { PromptInput, PromptInputTextarea, PromptInputFooter, PromptInputSubmit } from "@/components/ai-elements/prompt-input";
import { Shimmer } from "@/components/ai-elements/shimmer";
import { Tool, ToolHeader, ToolContent, ToolOutput } from "@/components/ai-elements/tool";
import { Reasoning, ReasoningTrigger, ReasoningContent } from "@/components/ai-elements/reasoning";
import chatbotUrl from "@/assets/chatbot-girl.jpg";
import { memberDashboardQuery } from "@/lib/members.functions";
import { NextVipDinner } from "@/components/site/NextVipDinner";
import { AssistantSuggestions } from "@/components/site/AssistantSuggestions";

function MemberDinnerSuggestion() {
  const { data } = useSuspenseQuery(memberDashboardQuery);
  return data ? <NextVipDinner suggestion={data.nearestDinner} /> : null;
}

export function AssistantIdentity({ className = "h-12 w-12" }: { className?: string }) {
  return <img src={chatbotUrl} alt={t.assistant.title} className={`${className} shrink-0 rounded-full object-cover`} />;
}

export function AssistantChat({ threadId, initialMessages = [] }: { threadId?: string; initialMessages?: UIMessage[] }) {
  const { data: threads } = useSuspenseQuery(assistantThreadsQuery);
  const nav = useNavigate(), qc = useQueryClient();
  const [error, setError] = useState("");
  const [creating, setCreating] = useState(false);
  async function newThread() {
    setCreating(true);
    try { const row = await createAssistantThread(); await qc.invalidateQueries({ queryKey: ["assistant-threads"] }); await nav({ to: "/tro-ly/$threadId", params: { threadId: row.id } }); }
    catch { setError(t.assistant.error); } finally { setCreating(false); }
  }
  return <section className="mx-auto max-w-7xl px-4 py-8 md:px-8">
    <div className="mb-6 flex items-center gap-4"><AssistantIdentity /><div className="min-w-0"><h1 className="text-2xl font-bold text-navy md:text-3xl">{t.assistant.title}</h1><p className="mt-1 text-sm text-muted-foreground">{t.assistant.description}</p></div><Button variant="ghost" size="icon" className="ml-auto shrink-0" title={t.assistant.signOut} aria-label={t.assistant.signOut} onClick={async () => { await supabase.auth.signOut(); qc.removeQueries({ queryKey: ["assistant-threads"] }); qc.removeQueries({ queryKey: ["assistant-thread"] }); await nav({ to: "/tro-ly" }); }}><LogOut /></Button></div>
    <div className="grid min-w-0 gap-6 md:grid-cols-[240px_minmax(0,1fr)]">
      <aside className="min-w-0 border-b border-border pb-4 md:border-b-0 md:border-r md:pr-5"><Button className="h-11 w-full" disabled={creating} onClick={newThread}><Plus />{t.assistant.newChat}</Button><h2 className="mb-3 mt-6 text-xs font-semibold uppercase text-muted-foreground">{t.assistant.history}</h2><div className="flex max-h-32 gap-2 overflow-auto md:max-h-[600px] md:flex-col">{threads.map(thread => <div key={thread.id} className={`flex min-w-48 items-center rounded-md md:min-w-0 ${thread.id === threadId ? "bg-accent text-primary" : "text-foreground"}`}><Link to="/tro-ly/$threadId" params={{ threadId: thread.id }} className="min-w-0 flex-1 truncate p-3 text-sm">{thread.title || t.assistant.newChat}</Link><Button variant="ghost" size="icon-sm" aria-label={t.assistant.delete} title={t.assistant.delete} className="mr-1 shrink-0" onClick={async () => { if (!window.confirm(t.assistant.confirmDelete)) return; try { await deleteAssistantThread({ data: { id: thread.id } }); await qc.invalidateQueries({ queryKey: ["assistant-threads"] }); qc.removeQueries({ queryKey: ["assistant-thread", thread.id] }); if (thread.id === threadId) await nav({ to: "/tro-ly" }); } catch { setError(t.assistant.error); } }}><Trash2 /></Button></div>)}</div>{error && <p role="alert" className="mt-3 text-sm text-destructive">{error}</p>}</aside>
      {threadId ? <ChatWindow key={threadId} threadId={threadId} initialMessages={initialMessages} /> : <div className="min-w-0"><AssistantSuggestions /><div className="flex min-h-96 flex-col items-center justify-center gap-5 text-center"><AssistantIdentity /><h2 className="text-xl font-semibold">{t.assistant.empty}</h2><Button disabled={creating} onClick={newThread}><Plus />{t.assistant.newChat}</Button></div></div>}
    </div>
  </section>;
}

export function ChatWindow({ threadId, initialMessages, className = "h-[680px] max-h-[85dvh] min-h-96", guest = false }: { threadId: string; initialMessages: UIMessage[]; className?: string; guest?: boolean }) {
  const qc = useQueryClient();
  const input = useRef<HTMLTextAreaElement>(null);
  const [text, setText] = useState("");
  const [membershipAnswer, setMembershipAnswer] = useState<"yes" | "no" | null>(null);
  const [error, setError] = useState("");
  const transport = useMemo(() => new DefaultChatTransport({ api: guest ? "/api/public/assistant" : "/api/chat", body: { conversationId: threadId }, headers: async () => { if (guest) return { "x-language": getLocale() }; const { data } = await supabase.auth.getSession(); return { Authorization: `Bearer ${data.session?.access_token || ""}`, "x-language": getLocale() }; } }), [threadId, guest]);
  const { messages, status, sendMessage, stop } = useChat({ id: threadId, messages: initialMessages, transport,
    onError: e => setError(e.message || t.assistant.error),
    onFinish: async () => { if (guest) return; await qc.invalidateQueries({ queryKey: ["assistant-threads"] }); await qc.invalidateQueries({ queryKey: ["assistant-thread", threadId] }); },
  });
  const busy = status === "submitted" || status === "streaming";
  useEffect(() => { if (!busy && !document.querySelector('[role="dialog"]')) input.current?.focus(); }, [busy, threadId]);
  const send = (value: string) => { if (busy || !value.trim()) return; setError(""); setText(""); void sendMessage({ text: value.trim() }); input.current?.focus(); };
  return <div className={`flex min-w-0 flex-col ${className}`}>
    <Conversation key={messages.length ? "conversation" : "welcome"} initial={messages.length ? "smooth" : false} className="min-h-0 flex-1"><ConversationContent className="gap-4 px-0 md:px-4">
      <AssistantSuggestions />
      {!guest && <Suspense fallback={null}><MemberDinnerSuggestion /></Suspense>}
      {guest && <div className="border-b border-border py-5">
        <p className="text-sm font-medium text-foreground">{t.assistant.membershipQuestion}</p>
        <div className="mt-3 flex flex-wrap gap-2"><Button variant={membershipAnswer === "yes" ? "secondary" : "outline"} onClick={() => setMembershipAnswer("yes")} aria-pressed={membershipAnswer === "yes"}>{t.assistant.membershipYes}</Button><Button variant={membershipAnswer === "no" ? "secondary" : "outline"} onClick={() => setMembershipAnswer("no")} aria-pressed={membershipAnswer === "no"}>{t.assistant.membershipNo}</Button></div>
        {membershipAnswer === "no" && <div className="mt-3" aria-live="polite"><p className="text-sm text-muted-foreground">{t.assistant.membershipGuide}</p><Button asChild variant="link" className="mt-2 h-auto whitespace-normal px-0"><Link to="/mang-luoi" hash="membership-register">{t.assistant.membershipRegister}</Link></Button></div>}
        {membershipAnswer === "yes" && <Button asChild variant="link" className="mt-3 h-auto whitespace-normal px-0"><Link to="/auth" search={{ assistant: true }}>{t.assistant.membershipLogin}</Link></Button>}
      </div>}
      {!messages.length && <div className="py-8"><h2 className="mb-6 text-2xl font-semibold text-navy">{t.assistant.empty}</h2><div className="grid gap-3 sm:grid-cols-2">{t.assistant.prompts.map(p => <Button key={p} variant="outline" className="h-auto min-h-14 justify-start whitespace-normal p-4 text-left" onClick={() => send(p)}>{p}</Button>)}</div></div>}
      {messages.map(message => <Message key={message.id} from={message.role}><MessageContent className={message.role === "user" ? "bg-primary text-primary-foreground" : "bg-transparent text-foreground"}>{message.parts.map((part, i) => {
        if (part.type === "text") return <MessageResponse key={i}>{part.text}</MessageResponse>;
        if (part.type === "reasoning") return <Reasoning key={i} defaultOpen={false} isStreaming={part.state === "streaming"}><ReasoningTrigger>{t.assistant.reasoning}</ReasoningTrigger><ReasoningContent>{part.text}</ReasoningContent></Reasoning>;
        if (isToolUIPart(part)) return <Tool key={i} defaultOpen={false}><ToolHeader title={t.assistant.thinking} type="tool-lookupInstitute" state={part.state} /><ToolContent><ToolOutput output={part.state === "output-available" ? part.output : undefined} errorText={part.state === "output-error" ? part.errorText : undefined} /></ToolContent></Tool>;
        return null;
      })}</MessageContent></Message>)}
      {status === "submitted" && <Shimmer>{t.assistant.thinking}</Shimmer>}
    </ConversationContent><ConversationScrollButton /></Conversation>
    {error && <p role="alert" className="my-3 break-words text-sm text-destructive">{error}</p>}
    <div className="mt-4 shrink-0"><PromptInput onSubmit={({ text: value }) => send(value)}><PromptInputTextarea ref={input} value={text} onChange={e => setText(e.target.value)} placeholder={t.assistant.placeholder} aria-label={t.assistant.placeholder} maxLength={6000} /><PromptInputFooter className="justify-end"><PromptInputSubmit className="h-10 w-10" status={status} onStop={() => { void stop(); input.current?.focus(); }} disabled={!busy && !text.trim()} aria-label={busy ? t.assistant.stop : t.assistant.send} title={busy ? t.assistant.stop : t.assistant.send} /></PromptInputFooter></PromptInput></div>
  </div>;
}