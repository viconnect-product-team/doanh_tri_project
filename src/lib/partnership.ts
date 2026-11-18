import { z } from "zod";
export const partnershipOrderSchema = z.object({ package_id: z.string().uuid(), full_name: z.string().trim().min(1).max(100), organization: z.string().trim().min(1).max(200), email: z.string().trim().email().max(255), phone: z.string().trim().max(30), message: z.string().trim().max(2000), consent: z.literal(true) });
export function partnershipAmount(plan: { fee: number; published: boolean } | null, bank: { enabled: boolean; bank_name: string; account_number: string; account_holder: string } | null) {
  if (!plan?.published || !Number.isInteger(plan.fee) || plan.fee <= 0 || !bank?.enabled || !bank.bank_name.trim() || !bank.account_number.trim() || !bank.account_holder.trim()) throw new Error("Not ready");
  return plan.fee;
}