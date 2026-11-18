import { createFileRoute, Link } from "@tanstack/react-router";
import { queryOptions, useSuspenseQuery } from "@tanstack/react-query";
import { BookOpen, GraduationCap, UserRound, Users } from "lucide-react";
import { Area, AreaChart, CartesianGrid, XAxis, YAxis } from "recharts";
import { supabase } from "@/integrations/supabase/client";
import { t, getLocale } from "@/content/i18n";
import { ChartContainer, ChartLegend, ChartLegendContent, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart";
import { registrationQuantity } from "@/lib/registrations";

async function fetchStats() {
  const [courses, experts, customers, leads] = await Promise.all([
    supabase.from("courses").select("published"),
    supabase.from("experts").select("published"),
    supabase.from("customers").select("created_at,status"),
    supabase.from("leads").select("created_at,source,participant_count,message,interest"),
  ]);
  for (const r of [courses, experts, customers, leads]) if (r.error) throw new Error(r.error.message);
  return { courses: courses.data!, experts: experts.data!, customers: customers.data!, leads: leads.data! };
}

const statsQuery = queryOptions({ queryKey: ["admin-dashboard"], queryFn: fetchStats, refetchInterval: 30_000 });

export const Route = createFileRoute("/_authenticated/quan-tri")({
  head: () => ({
    meta: [
      { title: "Tổng quan quản trị – Viện Doanh Trí" },
      { name: "description", content: "Bảng tổng quan khóa học, học viên, chuyên gia và khách hàng." },
      { property: "og:title", content: "Tổng quan quản trị – Viện Doanh Trí" },
      { property: "og:description", content: "Bảng tổng quan khóa học, học viên, chuyên gia và khách hàng." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
      { name: "robots", content: "noindex" },
    ],
  }),
  loader: ({ context }) => context.queryClient.ensureQueryData(statsQuery),
  component: Dashboard,
  errorComponent: ({ error }) => <p className="p-10 text-destructive">{t.dashboard.loadError}: {String((error as Error)?.message ?? error)}</p>,
  notFoundComponent: () => <p className="p-10">{t.dashboard.loadError}</p>,
});

const monthKey = (d: Date) => `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;

function Dashboard() {
  const d = t.dashboard;
  const { data } = useSuspenseQuery(statsQuery);
  const courseLeads = data.leads.filter((l) => l.source === "course");
  const qty = (l: (typeof data.leads)[number]) => l.participant_count ?? registrationQuantity(l.message) ?? 1;
  const students = courseLeads.reduce((s, l) => s + qty(l), 0);

  const now = new Date();
  const months = Array.from({ length: 12 }, (_, i) => new Date(now.getFullYear(), now.getMonth() - 11 + i, 1));
  const fmt = new Intl.DateTimeFormat(getLocale() === "en" ? "en-US" : "vi-VN", { month: "short", year: "2-digit" });
  const series = months.map((m) => ({ key: monthKey(m), label: fmt.format(m), customers: 0, students: 0 }));
  const idx = new Map(series.map((s, i) => [s.key, i]));
  for (const c of data.customers) { const i = idx.get(monthKey(new Date(c.created_at))); const s = i === undefined ? undefined : series[i]; if (s) s.customers++; }
  for (const l of courseLeads) { const i = idx.get(monthKey(new Date(l.created_at))); const s = i === undefined ? undefined : series[i]; if (s) s.students += qty(l); }

  const count = (arr: string[]) => Object.entries(arr.reduce<Record<string, number>>((a, k) => ((a[k] = (a[k] ?? 0) + 1), a), {})).sort((a, b) => b[1] - a[1]);
  const sources = count(data.leads.map((l) => l.source));
  const statuses = count(data.customers.map((c) => c.status));
  const statusLabel = (s: string) => (t.crm.status as Record<string, string>)[s] ?? s;

  const cards = [
    { icon: BookOpen, label: d.courses, value: data.courses.length, sub: `${data.courses.filter((c) => c.published).length} ${d.published}` },
    { icon: GraduationCap, label: d.students, value: students, sub: `${courseLeads.length} ${d.requests}` },
    { icon: UserRound, label: d.experts, value: data.experts.length, sub: `${data.experts.filter((e) => e.published).length} ${d.published}` },
    { icon: Users, label: d.customers, value: data.customers.length, sub: `${data.leads.length} ${d.requests}` },
  ];
  const config = { customers: { label: d.customers, color: "var(--primary)" }, students: { label: d.students, color: "var(--brand-green, var(--chart-2))" } };

  return (
    <div className="mx-auto max-w-6xl px-4 py-10 md:px-8">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="font-display text-2xl font-semibold text-navy md:text-3xl">{d.title}</h1>
          <p className="mt-1 text-sm text-muted-foreground">{d.subtitle}</p>
        </div>
        <div className="flex gap-2">
          <Link to="/cms" className="rounded-md border border-border px-4 py-2.5 text-sm hover:bg-muted">{d.toCms}</Link>
          <Link to="/crm" className="rounded-md border border-border px-4 py-2.5 text-sm hover:bg-muted">{d.toCrm}</Link>
        </div>
      </div>

      <div className="mt-8 grid grid-cols-2 gap-4 lg:grid-cols-4">
        {cards.map(({ icon: Icon, label, value, sub }) => (
          <div key={label} className="rounded-lg border border-border bg-card p-5 shadow-soft">
            <div className="flex items-center justify-between text-sm text-muted-foreground"><span>{label}</span><Icon className="h-4 w-4 text-primary" /></div>
            <p className="mt-3 font-display text-3xl font-semibold text-navy">{value.toLocaleString()}</p>
            <p className="mt-1 text-xs text-muted-foreground">{sub}</p>
          </div>
        ))}
      </div>

      <section className="mt-8 rounded-lg border border-border bg-card p-5 shadow-soft">
        <h2 className="font-semibold text-navy">{d.chartTitle}</h2>
        <p className="text-sm text-muted-foreground">{d.chartSub}</p>
        <ChartContainer config={config} className="mt-4 h-72 w-full">
          <AreaChart data={series} margin={{ left: -16, right: 8 }}>
            <CartesianGrid vertical={false} />
            <XAxis dataKey="label" tickLine={false} axisLine={false} fontSize={12} />
            <YAxis allowDecimals={false} tickLine={false} axisLine={false} fontSize={12} />
            <ChartTooltip content={<ChartTooltipContent />} />
            <ChartLegend content={<ChartLegendContent />} />
            <Area dataKey="customers" type="monotone" stroke="var(--color-customers)" fill="var(--color-customers)" fillOpacity={0.15} strokeWidth={2} />
            <Area dataKey="students" type="monotone" stroke="var(--color-students)" fill="var(--color-students)" fillOpacity={0.15} strokeWidth={2} />
          </AreaChart>
        </ChartContainer>
      </section>

      <div className="mt-8 grid gap-4 md:grid-cols-2">
        {[{ title: d.sources, rows: sources, label: (s: string) => s }, { title: d.statuses, rows: statuses, label: statusLabel }].map((b) => {
          const max = Math.max(1, ...b.rows.map((r) => r[1]));
          return (
            <section key={b.title} className="rounded-lg border border-border bg-card p-5 shadow-soft">
              <h2 className="font-semibold text-navy">{b.title}</h2>
              <ul className="mt-4 space-y-3">
                {b.rows.map(([k, v]) => (
                  <li key={k} className="text-sm">
                    <div className="flex justify-between"><span>{b.label(k)}</span><span className="font-medium">{v}</span></div>
                    <div className="mt-1 h-2 rounded-full bg-muted"><div className="h-2 rounded-full bg-primary" style={{ width: `${(v / max) * 100}%` }} /></div>
                  </li>
                ))}
              </ul>
            </section>
          );
        })}
      </div>
    </div>
  );
}
