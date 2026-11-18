import type { UIMessage } from "ai";
export function authoritativeHistory(stored: UIMessage[], incoming: UIMessage[]): UIMessage[] {
  const last = incoming.at(-1);
  if (!last || last.role !== "user" || last.parts.some(p => p.type !== "text")) throw new Error("INVALID_MESSAGE");
  return [...stored, last];
}