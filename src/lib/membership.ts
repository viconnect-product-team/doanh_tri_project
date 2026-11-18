import { z } from "zod";

export const MEMBERSHIP_IDS = ["standard", "vip", "vvip", "diamond"] as const;
export const MEMBERSHIP_PLANS = [
  { id: "standard", fee: 3000000, knowledge: 4, dinners: 1, press: 1, visits: 1, flowers: 0, mentoring: 0, speaking: 0, overseas: 0, ceo: 0 },
  { id: "vip", fee: 10000000, knowledge: 4, dinners: 3, press: 1, visits: 1, flowers: 1, mentoring: 0, speaking: 0, overseas: 0, ceo: 0 },
  { id: "vvip", fee: 30000000, knowledge: 4, dinners: 5, press: 1, visits: 1, flowers: 1, mentoring: 1, speaking: 1, overseas: 0, ceo: 0 },
  { id: "diamond", fee: 50000000, knowledge: 4, dinners: 5, press: 1, visits: 1, flowers: 1, mentoring: 1, speaking: 1, overseas: 1, ceo: 1 },
] as const;
export type MembershipTier = string;
export const membershipTierSchema = z.string().trim().min(1).max(100).regex(/^[a-zA-Z0-9_-]+$/);
export const membershipAmountSchema = z.coerce.number().int().min(0).max(2147483647);
export function isMembershipTier(id: string): id is MembershipTier {
  return membershipTierSchema.safeParse(id).success;
}
export const membershipRegistrationSchema = z.object({
  full_name: z.string().trim().min(1).max(100),
  email: z.string().trim().email().max(255),
  phone: z.string().trim().min(7).max(20).regex(/^[+\d\s().-]+$/),
  organization: z.string().trim().max(150),
  membership_tier: membershipTierSchema,
  message: z.string().trim().max(1800),
  consent: z.literal(true),
});