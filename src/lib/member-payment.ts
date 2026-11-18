import { z } from "zod";
import { membershipTierSchema } from "./membership";
export const memberPaymentInput = z.object({ tier_id: membershipTierSchema, full_name: z.string().trim().min(1).max(100), organization: z.string().trim().max(150), phone: z.string().trim().max(20), consent: z.literal(true) });
export function memberPaymentAmount(plan: { fee: number; published: boolean } | null, bank: { enabled: boolean; fees_confirmed: boolean; bank_name: string; account_number: string; account_holder: string } | null) {
  if (!plan?.published || !Number.isInteger(plan.fee) || plan.fee <= 0 || !bank?.enabled || !bank.fees_confirmed || !bank.bank_name.trim() || !bank.account_number.trim() || !bank.account_holder.trim()) throw new Error("Payment not ready");
  return plan.fee;
}