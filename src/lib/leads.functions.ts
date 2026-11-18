import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import { attachRequests, type Customer, type RequestRow } from "./customers";
import { membershipTierSchema, membershipRegistrationSchema } from "./membership";
import { vi } from "@/content/vi";
import { CONTACT_DEPARTMENTS, contactMessageSchema } from "./contact";
import { eventRegistrationFields } from "./event-registration";
import { eventIsPast } from "./event-schedule";

export const LEAD_STATUSES = ["new", "contacted", "consulting", "enrolled", "lost"] as const;

const leadSchema = z.object({
  full_name: z.string().trim().min(1).max(100),
  email: z.string().trim().email().max(255),
  phone: z.string().trim().max(20).optional().or(z.literal("")),
  organization: z.string().trim().max(150).optional().or(z.literal("")),
  source: z.enum(["contact", "ai_advisor", "subscribe", "event", "consulting", "course", "community"]),
  department: z.enum(CONTACT_DEPARTMENTS).optional(),
  membership_tier: membershipTierSchema.optional(),
  consent: z.literal(true).optional(),
  event_id: z.string().uuid().optional(),
  course_ids: z.array(z.string().uuid()).max(10).optional(),
  participant_count: z.number().int().positive().max(2147483647).optional(),
  interest: z.string().trim().max(200).optional().or(z.literal("")),
  message: z.string().trim().max(2000).optional().or(z.literal("")),
  ai_suggestions: z
    .object({
      summary: z.string().max(2000),
      recommendations: z.array(z.object({ kind: z.string().max(20), name: z.string().max(200), match: z.number().optional(), reason: z.string().max(1000), benefit: z.string().max(1000).optional() })).max(5),
      nextStep: z.string().max(1000),
    })
    .optional(),
}).superRefine((data, ctx) => {
  if (data.event_id || data.participant_count !== undefined) {
    const result = eventRegistrationFields.safeParse(data);
    if (data.source !== "event" || !result.success) ctx.addIssue({ code: "custom", message: "Invalid event registration" });
  }
  if (data.department) {
    const result = contactMessageSchema.safeParse(data);
    if (!result.success) for (const issue of result.error.issues) ctx.addIssue({ code: "custom", path: issue.path, message: issue.message });
  }
  if (data.source === "community") {
    const result = membershipRegistrationSchema.safeParse(data);
    if (!result.success) for (const issue of result.error.issues) ctx.addIssue({ code: "custom", path: issue.path, message: issue.message });
  }
});
export type LeadInput = z.infer<typeof leadSchema>;

// Public: website visitors submit forms. Validated, then inserted server-side.
export const submitLead = createServerFn({ method: "POST" })
  .validator((d: unknown) => leadSchema.parse(d))
  .handler(async ({ data }) => {
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    let communityInterest: string | null = null;
    let eventInterest: string | null = null;
    if (data.event_id) {
      const { data: event, error } = await supabaseAdmin.from("events").select("title,event_date").eq("id", data.event_id).eq("published", true).single();
      const today = new Date().toLocaleDateString("en-CA", { timeZone: "Asia/Ho_Chi_Minh" });
      if (error || !event || eventIsPast(event.event_date, today)) return { ok: false as const };
      eventInterest = event.title;
    }
    if (data.source === "community" && data.membership_tier) {
      const { data: plan, error: planError } = await supabaseAdmin.from("membership_plans").select("id,title").eq("id", data.membership_tier).eq("published", true).single();
      if (planError || !plan) return { ok: false as const };
      communityInterest = `${vi.community.name} • ${plan.title} (${plan.id})`;
    }
    let courseNote = "";
    if (data.source === "community" && data.course_ids?.length) {
      const { data: courses, error: courseError } = await supabaseAdmin.from("courses").select("title").in("id", data.course_ids).eq("published", true);
      if (courseError || !courses || courses.length !== new Set(data.course_ids).size) return { ok: false as const };
      courseNote = `${vi.memberSignup.coursesLabel}: ${courses.map((c) => c.title).join("; ")}\n`;
    }
    const { error } = await supabaseAdmin.from("leads").insert({
      full_name: data.full_name,
      email: data.email,
      phone: data.phone || null,
      organization: data.organization || null,
      source: data.source,
      event_id: data.event_id ?? null,
      participant_count: data.participant_count ?? null,
      membership_tier: data.source === "community" ? data.membership_tier ?? null : null,
      interest: eventInterest ?? communityInterest ?? (data.interest || null),
      message: data.department ? `${vi.contact.department}: ${vi.contact.departments[CONTACT_DEPARTMENTS.indexOf(data.department)]?.title ?? data.department}\n${data.message ?? ""}` : (courseNote + (data.message ?? "")).trim() || null,
      ai_suggestions: data.ai_suggestions ?? null,
    });
    if (error) {
      console.error("submitLead", error.message);
      return { ok: false as const };
    }
    return { ok: true as const };
  });

export const listLeads = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const customers: Customer[] = [];
    const requests: RequestRow[] = [];
    for (let start = 0; ; start += 1000) {
      const { data, error } = await context.supabase.from("customers").select("*").order("updated_at", { ascending: false }).order("id").range(start, start + 999);
      if (error) throw new Error(error.message);
      customers.push(...data);
      if (data.length < 1000) break;
    }
    for (let start = 0; ; start += 1000) {
      const { data, error } = await context.supabase.from("leads").select("*").order("created_at", { ascending: false }).order("id").range(start, start + 999);
      if (error) throw new Error(error.message);
      requests.push(...data);
      if (data.length < 1000) break;
    }
    return attachRequests(customers, requests);
  });

export const updateLead = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .validator((d: unknown) =>
    z.object({ id: z.string().uuid(), status: z.enum(LEAD_STATUSES).optional(), notes: z.string().max(5000).optional() }).parse(d),
  )
  .handler(async ({ data, context }) => {
    const patch: { status?: (typeof LEAD_STATUSES)[number]; notes?: string } = {};
    if (data.status) patch.status = data.status;
    if (data.notes !== undefined) patch.notes = data.notes;
    const { error } = await context.supabase.from("customers").update(patch).eq("id", data.id).select("id").single();
    if (error) throw new Error(error.message);
    return { ok: true };
  });
