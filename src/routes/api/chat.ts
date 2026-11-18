import { createFileRoute } from "@tanstack/react-router";
import { handleAssistant } from "@/lib/assistant/chat.server";
export const Route = createFileRoute("/api/chat")({ server: { handlers: { POST: ({ request }) => handleAssistant(request) } } });