import type { Database } from "@/integrations/supabase/types";

export type Registration = Database["public"]["Tables"]["leads"]["Row"];

// Earlier registrations stored the quantity as the first line of the message.
export function registrationQuantity(message: string | null): number | null {
  const match = message?.match(/^(?:Số học viên|Participants):\s*(\d+)\s*(?:\r?\n|$)/i);
  if (!match) return null;
  const quantity = Number(match[1]);
  return Number.isSafeInteger(quantity) && quantity >= 1 && quantity <= 500 ? quantity : null;
}

export function filterRegistrations(rows: Registration[], status: string, search: string): Registration[] {
  const query = search.trim().toLocaleLowerCase();
  return rows.filter((row) => row.source === "course" && (status === "all" || row.status === status) &&
    [row.full_name, row.email, row.phone, row.organization, row.interest].filter(Boolean).join(" ").toLocaleLowerCase().includes(query));
}