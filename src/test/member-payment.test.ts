import { expect,it } from "vitest";
import { memberPaymentAmount,memberPaymentInput } from "@/lib/member-payment";
const bank={enabled:true,fees_confirmed:true,bank_name:"Institute bank",account_number:"123",account_holder:"Institute"};
it("uses the membership catalog price",()=>expect(memberPaymentAmount({published:true,fee:10000000},bank)).toBe(10000000));
it("does not accept member identity or paid status from the browser",()=>{const values=memberPaymentInput.parse({tier_id:"vip",full_name:"Member",organization:"",phone:"",consent:true,member_id:"other",status:"paid",amount:1}); expect(values).not.toHaveProperty("member_id");expect(values).not.toHaveProperty("status");expect(values).not.toHaveProperty("amount");});
it("blocks fees not approved for collection",()=>expect(()=>memberPaymentAmount({published:true,fee:10000000},{...bank,fees_confirmed:false})).toThrow());
it("blocks unpublished plans",()=>expect(()=>memberPaymentAmount({published:false,fee:10000000},bank)).toThrow());
it("blocks incomplete bank details",()=>expect(()=>memberPaymentAmount({published:true,fee:10000000},{...bank,account_number:""})).toThrow());