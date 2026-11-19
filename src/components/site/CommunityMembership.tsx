import { richTextPlain } from "@/lib/rich-text";
import { useState } from "react";
import { ArrowRight, BookOpen, MessagesSquare, Building2, Handshake, Check } from "lucide-react";
import { t, getLocale } from "@/content/i18n";
import { isMembershipTier, type MembershipTier } from "@/lib/membership";
import { Section, Eyebrow } from "@/components/site/Layout";
import { Button } from "@/components/ui/button";
import { MembershipForm } from "./MembershipForm";
import { useSuspenseQuery } from "@tanstack/react-query";
import { publicContentQuery } from "@/lib/cms.functions";
import { L } from "@/lib/localized";
import { Link, useNavigate } from "@tanstack/react-router";

const icons = [BookOpen, MessagesSquare, Building2, Handshake];
const benefits = ["knowledge", "dinners", "press", "visits", "flowers", "mentoring", "speaking", "overseas", "ceo"] as const;

export function CommunityMembership() {
  const c = t.community;
  const navigate = useNavigate();
  const { data } = useSuspenseQuery(publicContentQuery);
  const plans = data.membership_plans;
  const [tier, setTier] = useState<MembershipTier>("standard");
  const [showCompare, setShowCompare] = useState(false);
  function choose(id: MembershipTier) { void navigate({ to: "/dang-ky-hoi-vien", search: { tier: id } }); }
  return <>
    <Section><div className="max-w-3xl"><Eyebrow>{c.name}</Eyebrow><h2 className="mt-4 font-display text-3xl font-semibold text-navy md:text-4xl">{c.title}</h2><p className="mt-4 leading-relaxed text-muted-foreground">{c.lead}</p><p className="mt-5 text-sm font-medium text-brand-green">{c.location}</p></div>
      <h3 className="mt-10 text-xl font-semibold text-navy">{c.activitiesTitle}</h3><div className="mt-6 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">{c.activities.map((a, i) => { const Icon = icons[i] ?? BookOpen; return <article key={a.title} className="border-t-2 border-primary pt-5"><Icon className="h-7 w-7 text-primary" /><p className="mt-5 text-xs font-semibold text-brand-green">{a.rhythm}</p><h4 className="mt-2 text-lg font-semibold text-navy">{a.title}</h4><p className="mt-3 text-sm leading-relaxed text-muted-foreground">{a.desc}</p></article>; })}</div>
    </Section>
    <div className="border-y border-border bg-muted"><Section id="membership-plans" className="scroll-mt-28"><Eyebrow>{c.draft}</Eyebrow><h2 className="mt-4 font-display text-3xl font-semibold text-navy md:text-4xl">{c.plansTitle}</h2><p className="mt-3 text-muted-foreground">{c.plansLead}</p><Button asChild className="mt-5"><Link to="/dang-ky-hoi-vien">{t.memberSignup.nav}<ArrowRight /></Link></Button>
      <div className="mt-8 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">{plans.map(p => <article key={p.id} className="editorial-card flex flex-col rounded-lg border border-border bg-card p-6"><h3 className="text-xl font-semibold text-navy">{L(p, "title")}</h3><p className="mt-3 text-3xl font-semibold text-primary">{p.fee.toLocaleString(getLocale() === "en" ? "en-US" : "vi-VN")}</p><p className="mt-1 text-xs text-muted-foreground">{c.annual}</p><p className="mt-5 min-h-12 text-sm text-muted-foreground">{richTextPlain(L(p, "description"))}</p><ul className="my-6 space-y-3 text-sm">{["knowledge", "dinners", ...(p.mentoring ? ["mentoring"] : ["visits"])] .map(key => { const k = key as "knowledge" | "dinners" | "mentoring" | "visits"; return <li key={k} className="flex items-start gap-2"><Check className="mt-0.5 h-4 w-4 shrink-0 text-brand-green" /><span>{p[k]} {c.benefits[k]}</span></li>; })}</ul><Button className="mt-auto h-auto min-h-12 whitespace-normal" onClick={() => isMembershipTier(p.id) && choose(p.id)}>{c.choose}<ArrowRight /></Button></article>)}</div>
      <Button variant="outline" className="mt-6 min-h-12" aria-expanded={showCompare} onClick={() => setShowCompare(!showCompare)}>{c.compare}</Button>
      {showCompare && <div className="mt-6 overflow-x-auto"><table className="w-full min-w-[700px] text-sm"><caption className="sr-only">{c.compare}</caption><thead><tr className="border-b-2 border-primary"><th scope="col" className="p-4 text-left">{c.benefit}</th>{plans.map(p => <th scope="col" className="p-4 text-center" key={p.id}>{L(p, "title")}</th>)}</tr></thead><tbody>{benefits.map(b => <tr key={b} className="border-b border-border"><th scope="row" className="p-4 text-left font-normal">{c.benefits[b]}</th>{plans.map(p => <td key={p.id} className="p-4 text-center">{p[b] || <span className="text-xs text-muted-foreground">{c.notIncluded}</span>}</td>)}</tr>)}</tbody></table></div>}
      <p className="mt-6 text-sm leading-relaxed text-muted-foreground">{c.conditions}</p><p className="mt-3 text-sm leading-relaxed text-muted-foreground">{c.partnerNote}</p>
    </Section></div>
    <Section id="membership-register" className="grid scroll-mt-28 gap-8 lg:grid-cols-[1fr_1.4fr]"><div><Eyebrow>{c.name}</Eyebrow><h2 className="mt-4 font-display text-3xl font-semibold text-navy">{c.form.title}</h2><p className="mt-4 leading-relaxed text-muted-foreground">{c.form.lead}</p></div><MembershipForm tier={tier} onTier={setTier} /></Section>
  </>;
}