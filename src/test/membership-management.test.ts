import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

const sql = readFileSync("drizzle/migrations/0017_membership_plan_management.sql", "utf8");
const original = readFileSync("drizzle/migrations/0007_member_private_data.sql", "utf8");
const requests = readFileSync("drizzle/migrations/0012_link_membership_registration.sql", "utf8");

describe("Membership catalog permissions and retention", () => {
  it("allows authenticated staff to create and delete plans without granting visitor writes", () => {
    expect(sql).toMatch(/GRANT INSERT, DELETE ON public\.membership_plans TO authenticated/);
    expect(sql).toMatch(/FOR INSERT TO authenticated WITH CHECK \(public\.has_role\(auth\.uid\(\), 'admin'\) OR public\.has_role\(auth\.uid\(\), 'staff'\)\)/);
    expect(sql).toMatch(/FOR DELETE TO authenticated USING \(public\.has_role\(auth\.uid\(\), 'admin'\) OR public\.has_role\(auth\.uid\(\), 'staff'\)\)/);
    expect(sql).not.toMatch(/TO anon/);
  });
  it("generates IDs for newly created plans and removes the four-ID restriction", () => {
    expect(sql).toContain("DROP CONSTRAINT membership_plans_id_check");
    expect(sql).toContain("ALTER COLUMN id SET DEFAULT gen_random_uuid()::text");
  });
  it("retains foreign keys so deleting a referenced plan cannot erase membership history", () => {
    expect(original).toContain("tier_id text NOT NULL REFERENCES public.membership_plans(id)");
    expect(requests).toContain("membership_tier text REFERENCES public.membership_plans(id)");
    expect(sql).not.toMatch(/DROP.*(?:FOREIGN|leads|member_profiles)|ON DELETE CASCADE/i);
  });
});