import { expect,it } from "vitest";
import { partnershipAmount,partnershipOrderSchema } from "@/lib/partnership";
const bank={enabled:true,bank_name:"Bank",account_number:"123",account_holder:"Institute"};
it("uses the published catalog fee, not a visitor amount",()=>{expect(partnershipAmount({fee:3500000,published:true},bank)).toBe(3500000); const values=partnershipOrderSchema.parse({package_id:"11111111-1111-4111-8111-111111111111",full_name:"An",organization:"Company",email:"an@example.com",phone:"",message:"",consent:true,amount:1,status:"paid"}); expect(values).not.toHaveProperty("amount"); expect(values).not.toHaveProperty("status");});
it("blocks unpublished packages",()=>expect(()=>partnershipAmount({fee:3500000,published:false},bank)).toThrow());
it("blocks payment without configured bank details",()=>expect(()=>partnershipAmount({fee:3500000,published:true},{...bank,account_number:""})).toThrow());
it("blocks zero-priced packages from requesting transfers",()=>expect(()=>partnershipAmount({fee:0,published:true},bank)).toThrow());