import { createFileRoute, Link, useNavigate, useRouter } from "@tanstack/react-router";
import { useQueryClient, useSuspenseQuery } from "@tanstack/react-query";
import { CalendarDays, Crown, LogOut, MessageSquare, RefreshCw, UserRound, ReceiptText } from "lucide-react";
import { memberDashboardQuery } from "@/lib/members.functions";
import { t, useLocale } from "@/content/i18n";
import { L } from "@/lib/localized";
import { Section, Tag } from "@/components/site/Layout";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { NextVipDinner } from "@/components/site/NextVipDinner";

export const Route = createFileRoute("/_authenticated/hoi-vien")({
  loader: ({ context }) => context.queryClient.ensureQueryData(memberDashboardQuery),
  head: () => ({ meta: [
    { title: "Trang cá nhân hội viên – Viện Doanh Trí" },
    { name: "description", content: "Gói đang đăng ký, trạng thái hội viên, lịch sử thanh toán, tư vấn và lịch VIP Dinner tại Viện Doanh Trí." },
    { property: "og:title", content: "Trang cá nhân hội viên – Viện Doanh Trí" },
    { property: "og:description", content: "Theo dõi gói hội viên, lịch sử thanh toán và trạng thái cá nhân tại Viện Doanh Trí." },
    { property: "og:type", content: "website" }, { name: "twitter:card", content: "summary" }, { name: "robots", content: "noindex, nofollow" },
  ] }),
  component: MemberPage,
  errorComponent: MemberError,
  notFoundComponent: () => <Section className="py-16"><p>{t.memberPage.missing}</p></Section>,
});

function MemberError() {
  const router = useRouter();
  return <Section className="space-y-4 py-16"><p role="alert">{t.memberPage.error}</p><Button onClick={() => router.invalidate()}>{t.memberPage.retry}</Button></Section>;
}

function MemberPage() {
  const { data, isFetching } = useSuspenseQuery(memberDashboardQuery);
  const qc = useQueryClient();
  const nav = useNavigate();
  const locale = useLocale();
  const m = t.memberPage;
  const date = (value: string | null) => value ? new Intl.DateTimeFormat(locale === "vi" ? "vi-VN" : "en-GB", { day: "2-digit", month: "short", year: "numeric", timeZone: "UTC" }).format(new Date(`${value}T00:00:00Z`)) : m.unspecified;
  async function signOut() {
    await qc.cancelQueries(); qc.clear();
    await supabase.auth.signOut();
    await nav({ to: "/auth", search: { member: true }, replace: true });
  }
  const records = (items: NonNullable<typeof data>["consultations"], empty: string) => items.length ? <div className="divide-y divide-border">{items.map(record => <article key={record.id} className="flex flex-wrap items-start justify-between gap-3 py-5"><div className="min-w-0"><h3 className="break-words font-semibold text-foreground">{record.title}</h3><p className="mt-2 text-sm text-muted-foreground">{date(record.event_date ?? record.created_at.slice(0, 10))}</p></div><div className="text-sm"><p>{m.status}: {record.status || m.unspecified}</p><p className="mt-1 text-muted-foreground">{m.quantity}: {record.quantity}</p></div></article>)}</div> : <p className="py-6 text-sm text-muted-foreground">{empty}</p>;
  return <Section className="py-10 md:py-14">
    <div className="flex flex-wrap items-center justify-between gap-4 border-b border-border pb-6">
      <div><p className="mb-2 text-sm font-semibold text-primary">{t.brand.name}</p><h1 className="font-display text-3xl font-semibold text-navy md:text-4xl">{m.title}</h1></div>
      <div className="flex flex-wrap gap-2"><Button asChild variant="outline"><Link to="/thanh-toan-hoi-vien">{t.memberPayment.title}</Link></Button><Button variant="outline" size="icon" title={m.refresh} aria-label={m.refresh} disabled={isFetching} onClick={() => qc.invalidateQueries({ queryKey: memberDashboardQuery.queryKey })}><RefreshCw className={`h-4 w-4 ${isFetching ? "motion-safe:animate-spin" : ""}`} /></Button><Button variant="outline" onClick={signOut}><LogOut className="h-4 w-4" />{t.crm.signOut}</Button></div>
    </div>
    {!data ? <div className="space-y-6 py-12"><p className="max-w-xl text-muted-foreground">{m.empty}</p><div className="flex flex-wrap gap-3"><Button asChild><Link to="/dang-ky-hoi-vien" search={{ tier: "standard" }}>{m.register}</Link></Button><Button asChild variant="outline"><Link to="/lien-he">{m.contact}</Link></Button></div></div> : <>
      {!data.isActive && <p role="status" className="mt-6 text-sm text-muted-foreground">{m.empty}</p>}
      {data.isActive && <NextVipDinner suggestion={data.nearestDinner} />}
      <div className="grid gap-8 border-b border-border py-8 lg:grid-cols-2">
        <div><UserRound className="mb-4 h-7 w-7 text-brand-green" /><p className="text-muted-foreground">{m.greeting},</p><h2 className="mt-1 break-words text-2xl font-semibold text-navy">{data.profile.full_name}</h2><p className="mt-2 break-words text-muted-foreground">{data.profile.organization}</p><div className="mt-4 flex flex-wrap gap-2"><Tag>{data.profile.approval_status === "approved" ? m.approved : m.pendingApproval}</Tag><Tag>{data.isActive ? m.active : m.inactive}</Tag></div><dl className="mt-5 space-y-3 text-sm">{data.profile.approved_at && <div><dt className="text-muted-foreground">{m.approvedOn}</dt><dd className="mt-1 font-medium">{date(data.profile.approved_at.slice(0, 10))}</dd></div>}<div><dt className="text-muted-foreground">{m.term}</dt><dd className="mt-1 font-medium">{date(data.profile.starts_on)} – {date(data.profile.ends_on)}</dd></div><div><dt className="text-muted-foreground">{t.member.fields.phone}</dt><dd className="mt-1">{data.profile.phone || m.unspecified}</dd></div></dl></div>
        <div className="border-l-2 border-brand-green pl-6"><Crown className="mb-4 h-7 w-7 text-brand-green" /><p className="text-sm text-muted-foreground">{m.plan}</p><h2 className="mt-2 text-2xl font-semibold text-navy">{data.plan ? L(data.plan, "title") : data.profile.tier_id}</h2>{data.plan ? <><p className="mt-3 text-sm leading-relaxed text-muted-foreground">{L(data.plan, "description")}</p><p className="mt-5 text-xl font-semibold text-primary">{new Intl.NumberFormat(locale === "vi" ? "vi-VN" : "en-GB", { style: "currency", currency: "VND", maximumFractionDigits: 0 }).format(data.plan.fee)}</p><p className="mt-1 text-xs text-muted-foreground">{m.draftFee}</p><p className="mt-4 text-sm">{m.dinnerAllowance}: <strong>{data.plan.dinners}</strong></p></> : <p className="mt-3 text-muted-foreground">{m.noPlan}</p>}</div>
      </div>
      <section className="border-b border-border py-8" aria-labelledby="payment-history-title">
        <h2 id="payment-history-title" className="flex items-center gap-3 text-xl font-semibold text-navy"><ReceiptText className="h-5 w-5 text-primary" />{m.paymentHistory}</h2>
        {data.payments.length ? <div className="mt-4 divide-y divide-border">{data.payments.map(payment => <article key={payment.id} className="grid min-w-0 gap-4 py-5 md:grid-cols-[1fr_auto]">
          <div className="min-w-0"><h3 className="break-words font-semibold text-foreground">{payment.package_title}</h3><p className="mt-1 break-all text-sm text-muted-foreground">{t.partnership.reference}: {payment.reference}</p><dl className="mt-3 flex flex-wrap gap-x-8 gap-y-3 text-sm"><div><dt className="text-muted-foreground">{m.paymentCreated}</dt><dd>{date(payment.created_at.slice(0, 10))}</dd></div>{payment.confirmed_at && <div><dt className="text-muted-foreground">{m.paymentConfirmed}</dt><dd>{date(payment.confirmed_at.slice(0, 10))}</dd></div>}{payment.starts_on && payment.ends_on && <div><dt className="text-muted-foreground">{t.memberPayment.term}</dt><dd>{date(payment.starts_on)} – {date(payment.ends_on)}</dd></div>}</dl></div>
          <div className="min-w-0 space-y-2 md:max-w-xs md:text-right"><p className="text-lg font-semibold text-primary">{new Intl.NumberFormat(locale === "vi" ? "vi-VN" : "en-GB", { style: "currency", currency: "VND", maximumFractionDigits: 0 }).format(payment.amount)}</p><p role="status" className="break-words text-sm font-medium">{payment.status === "paid" ? t.memberPayment.paid : payment.status === "cancelled" ? t.memberPayment.cancelled : payment.status === "pending" ? t.memberPayment.pending : m.unspecified}</p></div>
        </article>)}</div> : <p className="py-6 text-sm text-muted-foreground">{t.memberPayment.empty}</p>}
      </section>
      <div className="grid gap-10 py-10 lg:grid-cols-[1.1fr_1fr]">
        <div className="min-w-0"><h2 className="flex items-center gap-3 text-xl font-semibold text-navy"><MessageSquare className="h-5 w-5 text-primary" />{m.consultations}</h2>{records(data.consultations, m.noConsultations)}<h2 className="mt-8 border-t border-border pt-6 text-xl font-semibold text-navy">{m.registrations}</h2>{records(data.registrations, m.noRegistrations)}</div>
        <div className="min-w-0"><h2 className="mb-5 flex items-center gap-3 text-xl font-semibold text-navy"><CalendarDays className="h-5 w-5 text-primary" />{m.dinners}</h2>{!data.dinners.upcoming.length && <p className="py-4 text-sm text-muted-foreground">{m.noDinners}</p>}{data.dinners.upcoming.map(event => <article key={event.id} className="editorial-card mb-4 p-5"><Tag>{m.upcoming}</Tag><h3 className="mt-3 text-lg font-semibold text-navy">{L(event, "title")}</h3><p className="mt-3 text-sm font-medium">{date(event.event_date)} · {event.time_range || m.unspecified}</p><p className="mt-2 text-sm text-muted-foreground">{L(event, "place") || m.unspecified}</p>{event.capacity && <p className="mt-2 text-sm text-muted-foreground">{m.seats}: {event.capacity}</p>}<Button asChild variant="outline" className="mt-4"><Link to="/tin-tuc" hash={`events-${event.id}`}>{m.viewEvent}</Link></Button></article>)}{!!data.dinners.past.length && <details className="mt-5 border-t border-border pt-4"><summary className="cursor-pointer text-sm font-semibold text-muted-foreground">{m.past}</summary>{data.dinners.past.map(event => <article key={event.id} className="border-b border-border py-4"><h3 className="font-medium">{L(event, "title")}</h3><p className="mt-1 text-sm text-muted-foreground">{date(event.event_date)}</p></article>)}</details>}</div>
      </div>
    </>}
  </Section>;
}