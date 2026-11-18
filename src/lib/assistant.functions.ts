import { createServerFn } from "@tanstack/react-start";
import { queryOptions } from "@tanstack/react-query";
import { z } from "zod";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";

const threadId = z.object({ id: z.string().uuid() });
export const listAssistantThreads = createServerFn({ method: "GET" }).middleware([requireSupabaseAuth]).handler(async ({ context }) => {
  const { data, error } = await context.supabase.from("assistant_threads").select("id,title,updated_at").eq("user_id", context.userId).order("updated_at", { ascending: false });
  if (error) throw new Error(error.message);
  return data;
});
export const createAssistantThread = createServerFn({ method: "POST" }).middleware([requireSupabaseAuth]).handler(async ({ context }) => {
  const { data, error } = await context.supabase.from("assistant_threads").insert({ user_id: context.userId }).select("id").single();
  if (error) throw new Error(error.message);
  return data;
});
export const getAssistantThread = createServerFn({ method: "GET" }).middleware([requireSupabaseAuth]).inputValidator((d: unknown) => threadId.parse(d)).handler(async ({ data, context }) => {
  const { data: row, error } = await context.supabase.from("assistant_threads").select("id,title,messages").eq("id", data.id).eq("user_id", context.userId).single();
  if (error) throw new Error(error.message);
  return { id: row.id, title: row.title, transcript: JSON.stringify(row.messages) };
});
export const deleteAssistantThread = createServerFn({ method: "POST" }).middleware([requireSupabaseAuth]).inputValidator((d: unknown) => threadId.parse(d)).handler(async ({ data, context }) => {
  const { error } = await context.supabase.from("assistant_threads").delete().eq("id", data.id).eq("user_id", context.userId);
  if (error) throw new Error(error.message);
  return { ok: true };
});
export const assistantThreadsQuery = queryOptions({ queryKey: ["assistant-threads"], queryFn: () => listAssistantThreads() });
export const assistantThreadQuery = (id: string) => queryOptions({ queryKey: ["assistant-thread", id], queryFn: () => getAssistantThread({ data: { id } }) });