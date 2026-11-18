import { z } from "zod";
import { membershipTierSchema } from "./membership";

export const membershipRequestSchema = z.object({
  id: z.string().uuid(), source: z.literal("community"),
  membership_tier: membershipTierSchema,
  full_name: z.string().trim().min(1).max(100),
  email: z.string().trim().email().max(255),
  phone: z.string().nullable(), organization: z.string().nullable(),
});
export function approvedRequestProfile(input: unknown) {
  const r = membershipRequestSchema.parse(input);
  return { email: r.email, full_name: r.full_name, phone: r.phone ?? "", organization: r.organization ?? "", tier_id: r.membership_tier, registration_request_id: r.id };
}