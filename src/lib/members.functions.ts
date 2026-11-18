import { createServerFn } from "@tanstack/react-start";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import { z } from "zod";
import { membershipTierSchema } from "./membership";
import { memberIsActive } from "./member-access";
import { queryOptions } from "@tanstack/react-query";
import { MEMBER_DASHBOARD_REFRESH_MS, nearestVipDinner, vipDinnerSchedule } from "./member-dashboard";
import { approvedRequestProfile } from "./membership-request";
import { confirmedMembership, memberInvitationUrl } from "./member-confirmation";

export const issueMemberAccount = createServerFn({ method: "POST" }).middleware([requireSupabaseAuth])
  .inputValidator((d: unknown) => z.object({ registration_request_id: z.string().uuid().optional(), email: z.string().email(), full_name: z.string().trim().min(1).max(100), organization: z.string().max(150), phone: z.string().max(20), tier_id: membershipTierSchema, starts_on: z.string().date(), ends_on: z.string().date() }).refine(d => d.ends_on >= d.starts_on).parse(d))
  .handler(async ({ data, context }) => {
    const { data: admin } = await context.supabase.rpc("has_role", { _user_id: context.userId, _role: "admin" });
    if (!admin) throw new Error("Forbidden");
    let approved = data;
    if (data.registration_request_id) {
      const { data: request, error: requestError } = await context.supabase.from("leads").select("id,source,membership_tier,full_name,email,phone,organization").eq("id", data.registration_request_id).single();
      if (requestError || !request) throw new Error("Registration unavailable");
      const { data: linked, error: linkedError } = await context.supabase.from("member_profiles").select("id").eq("registration_request_id", request.id).maybeSingle();
      if (linkedError || linked) throw new Error("Registration already processed");
      approved = { ...data, ...approvedRequestProfile(request) };
    }
    const { data: plan, error: planError } = await context.supabase.from("membership_plans").select("id").eq("id", approved.tier_id).single();
    if (planError || !plan) throw new Error("Membership plan unavailable");
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { getRequest } = await import("@tanstack/react-start/server");
    const redirectTo = memberInvitationUrl(getRequest().url);
    const { data: invited, error } = await supabaseAdmin.auth.admin.inviteUserByEmail(approved.email, { redirectTo, data: { full_name: approved.full_name, tier_id: approved.tier_id, starts_on: approved.starts_on, ends_on: approved.ends_on } });
    if (error || !invited.user) throw new Error(error?.message || "Invitation failed");
    const { email: _email, registration_request_id, ...profile } = approved;
    const confirmation = confirmedMembership(true, new Date().toISOString());
    const { error: saveError } = await supabaseAdmin.from("member_profiles").insert({ ...profile, ...confirmation, active: true, registration_request_id: registration_request_id ?? null, user_id: invited.user.id });
    if (saveError) throw new Error("Account invited but profile could not be saved");
    return { ok: true };
  });

export const memberAccess = createServerFn({ method: "GET" }).middleware([requireSupabaseAuth]).handler(async ({ context }) => {
  const { data, error } = await context.supabase.from("member_profiles").select("active,approval_status,starts_on,ends_on").eq("user_id", context.userId).maybeSingle();
  if (error) throw new Error(error.message);
  return memberIsActive(data, new Date().toISOString().slice(0,10));
});

export const getMemberDashboard = createServerFn({ method: "GET" }).middleware([requireSupabaseAuth]).handler(async ({ context }) => {
  const { data: profile, error } = await context.supabase.from("member_profiles")
    .select("id,full_name,organization,phone,tier_id,starts_on,ends_on,active,approval_status,approved_at,invitation_sent_at").eq("user_id", context.userId).maybeSingle();
  if (error) throw new Error("Member data unavailable");
  const today = new Date().toISOString().slice(0, 10);
  if (!profile) return null;
  const isActive = memberIsActive(profile, today);
  const [planResult, recordResult, eventResult, paymentResult] = await Promise.all([
    context.supabase.from("membership_plans").select("id,title,title_en,description,description_en,fee,dinners").eq("id", profile.tier_id).maybeSingle(),
    context.supabase.from("member_records").select("id,kind,title,event_date,status,quantity,created_at").eq("member_id", profile.id).in("kind", ["consultation", "registration"]).order("created_at", { ascending: false }),
    context.supabase.from("events").select("id,title,title_en,event_date,time_range,place,place_en,capacity,published").eq("published", true).or("title.ilike.%VIP Dinner%,title_en.ilike.%VIP Dinner%"),
    context.supabase.from("member_payment_orders").select("id,reference,tier_id,package_title,amount,status,created_at,confirmed_at,starts_on,ends_on").eq("member_id", profile.id).order("created_at", { ascending: false }),
  ]);
  if (planResult.error || recordResult.error || eventResult.error || paymentResult.error) throw new Error("Member data unavailable");
  return {
    profile, isActive, plan: planResult.data, payments: paymentResult.data ?? [],
    consultations: isActive ? (recordResult.data ?? []).filter(record => record.kind === "consultation") : [],
    registrations: isActive ? (recordResult.data ?? []).filter(record => record.kind === "registration") : [],
    dinners: vipDinnerSchedule(isActive ? eventResult.data ?? [] : [], today),
    nearestDinner: isActive ? nearestVipDinner(eventResult.data ?? [], today) : null,
  };
});

export const memberDashboardQuery = queryOptions({ queryKey: ["member-dashboard"], queryFn: () => getMemberDashboard(), staleTime: 0, refetchInterval: MEMBER_DASHBOARD_REFRESH_MS, refetchOnWindowFocus: "always" });