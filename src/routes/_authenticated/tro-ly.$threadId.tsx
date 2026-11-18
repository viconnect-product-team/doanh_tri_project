import { createFileRoute } from "@tanstack/react-router";
import { useSuspenseQuery } from "@tanstack/react-query";
import { assistantThreadQuery, assistantThreadsQuery } from "@/lib/assistant.functions";
import { AssistantChat } from "@/components/site/AssistantChat";
import type { UIMessage } from "ai";
export const Route = createFileRoute("/_authenticated/tro-ly/$threadId")({
  loader: async ({ context, params }) => { await Promise.all([context.queryClient.ensureQueryData(assistantThreadQuery(params.threadId)), context.queryClient.ensureQueryData(assistantThreadsQuery)]); },
  head: () => ({ meta: [{ title: "Cuộc trò chuyện – Trợ lý Viện Doanh Trí" }, { name: "description", content: "Cuộc trò chuyện riêng về khóa học, sự kiện và mạng lưới Viện Doanh Trí." }, { property: "og:title", content: "Cuộc trò chuyện – Viện Doanh Trí" }, { property: "og:description", content: "Lịch sử trò chuyện riêng theo tài khoản khách hàng." }, { property: "og:type", content: "website" }, { name: "twitter:card", content: "summary" }, { name: "robots", content: "noindex" }] }),
  component: ThreadPage,
});
function ThreadPage() { const { threadId } = Route.useParams(); const { data } = useSuspenseQuery(assistantThreadQuery(threadId)); return <AssistantChat threadId={threadId} initialMessages={JSON.parse(data.transcript) as UIMessage[]} />; }