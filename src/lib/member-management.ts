import { z } from "zod";
import { membershipTierSchema } from "@/lib/membership";

const date = z.string().regex(/^\d{4}-\d{2}-\d{2}$/).nullable();
export const memberUpdateSchema = z.object({
  full_name: z.string().trim().min(1).max(200),
  organization: z.string().trim().max(300),
  phone: z.string().trim().max(50),
  tier_id: membershipTierSchema,
  starts_on: date,
  ends_on: date,
  active: z.boolean(),
  approval_status: z.enum(["pending", "approved"]),
}).refine(v => !v.starts_on || !v.ends_on || v.ends_on >= v.starts_on, { path: ["ends_on"], message: "Invalid term" });

export function memberUpdate(input: unknown, previous: { approval_status: string; approved_at: string | null }, timestamp: string) {
  const values = memberUpdateSchema.parse(input);
  return { ...values, approved_at: values.approval_status === "pending" ? null : previous.approval_status === "approved" && previous.approved_at ? previous.approved_at : timestamp };
}