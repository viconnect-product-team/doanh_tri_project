export function memberIsActive(profile: { active: boolean; approval_status?: string; starts_on: string | null; ends_on: string | null } | null, today: string) {
  return !!profile?.active && (profile.approval_status === undefined || profile.approval_status === "approved") && (!profile.starts_on || profile.starts_on <= today) && (!profile.ends_on || profile.ends_on >= today);
}
export function remainingBenefits(plan: Record<string, unknown>, records: { kind: string; benefit_key: string | null; quantity: number; event_date: string | null }[], start: string | null, end: string | null) {
  const keys = ["knowledge", "dinners", "press", "visits", "flowers", "mentoring", "speaking", "overseas", "ceo"];
  return Object.fromEntries(keys.map(key => {
    const used = records.filter(r => r.kind === "benefit" && r.benefit_key === key && r.event_date && (!start || r.event_date >= start) && (!end || r.event_date <= end)).reduce((sum,r) => sum + r.quantity, 0);
    const included = Number(plan[key] ?? 0);
    return [key, { included, used, remaining: Math.max(0, included - used) }];
  }));
}