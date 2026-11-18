import { z } from "zod";

export const eventRegistrationFields = z.object({
  event_id: z.string().uuid(),
  participant_count: z.number().int().positive().max(2147483647),
});

export function eventRegistrationUrl(id: string) {
  return `/su-kien/${encodeURIComponent(id)}#event-register`;
}