import { Link, useLocation } from "@tanstack/react-router";
import { useState, useEffect, type ReactNode } from "react";
import { ArrowRight, Facebook, Mail, MapPin, Menu, X, BookOpen, GraduationCap, Lightbulb, Users, ShieldCheck } from "lucide-react";
import { t, setLocale, useLocale } from "@/content/i18n";
import { useServerFn } from "@tanstack/react-start";
import { submitLead } from "@/lib/leads.functions";
import { Button } from "@/components/ui/button";
import { SiteSearch } from "@/components/site/SiteSearch";
import logoUrl from "@/assets/viem-logo.webp";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { INSTITUTE_CONTACT } from "@/lib/contact";

export function Logo({ onClick }: { onClick?: () => void }) {
  return (
    <Link
      to="/"
      onClick={() => {
        onClick?.();
        if (typeof window !== "undefined") {
          window.scrollTo({ top: 0, behavior: "smooth" });
        }
      }}
      className="flex shrink-0 items-center gap-3 cursor-pointer"
      aria-label={t.brand.name}
    >
      <img src={logoUrl} alt={t.brand.name} className="h-11 w-auto" />
      <span className="hidden leading-tight sm:block">
        <span className="block text-xs font-bold text-navy sm:text-sm">{t.brand.name}</span>
        <span className="mt-1 hidden max-w-40 text-[9px] text-muted-foreground sm:block">{t.brand.sub}</span>
      </span>
    </Link>
  );
}

function LangSwitch() {
  const locale = useLocale();
  const btn = (l: "vi" | "en") => (
    <Button variant="ghost" size="sm" type="button" onClick={() => setLocale(l)} aria-pressed={locale === l}
      className={`h-10 px-2 ${locale === l ? "font-bold text-primary" : "text-muted-foreground"}`}>
      {l.toUpperCase()}
    </Button>
  );
  return <div aria-label={t.common.language} className="flex items-center text-xs text-muted-foreground">{btn("vi")}<span>|</span>{btn("en")}</div>;
}

export function Header() {
  const [open, setOpen] = useState(false);
  const location = useLocation();
  const { data: signedIn } = useQuery({ queryKey: ["site-session"], queryFn: async () => !!(await supabase.auth.getUser()).data.user });

  useEffect(() => {
    setOpen(false);
  }, [location.pathname, location.search]);

  return (
    <header className="sticky top-0 z-50 border-b border-border bg-background shadow-soft">
      <div className="mx-auto flex h-20 max-w-[1440px] items-center justify-between gap-3 px-4 md:px-8">
        <Logo onClick={() => setOpen(false)} />
        <div className="flex shrink-0 items-center gap-1 sm:gap-2">
          <SiteSearch />
          <LangSwitch />
          <Button asChild variant="ghost" size="icon" className="shrink-0" title={signedIn ? t.memberPage.title : t.assistant.membershipLogin}><Link to={signedIn ? "/hoi-vien" : "/auth"} search={signedIn ? {} : { member: true }} aria-label={signedIn ? t.memberPage.title : t.assistant.membershipLogin}><Users className="h-5 w-5" /></Link></Button>
          <Button asChild variant="outline" size="sm" className="hidden h-10 shrink-0 gap-1.5 whitespace-nowrap px-3 text-xs font-semibold lg:inline-flex" title={signedIn ? t.common.adminArea : t.common.adminLogin}>
            <Link to={signedIn ? "/cms" : "/auth"} aria-label={signedIn ? t.common.adminArea : t.common.adminLogin}>
              <ShieldCheck className="h-4 w-4 shrink-0" />{signedIn ? t.common.adminArea : t.common.adminLogin}
            </Link>
          </Button>
          <Button asChild className="hidden h-11 shrink-0 whitespace-nowrap px-4 sm:inline-flex"><Link to="/lien-he">
            {t.common.connect} <ArrowRight className="h-4 w-4 shrink-0" />
          </Link></Button>
          <Button variant="ghost" size="icon" aria-label={t.common.menu} aria-expanded={open} aria-controls="mobile-navigation" onClick={() => setOpen(!open)} className="h-11 w-11 shrink-0">
            {open ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </Button>
        </div>
      </div>
      {open && (
        <nav id="mobile-navigation" className="max-h-[calc(100dvh-80px)] overflow-y-auto border-t border-border bg-background px-6 md:px-8 pb-6">
          <div className="mx-auto max-w-[1440px]">
            {[...t.nav, { to: "/lien-he", label: t.common.connect }].map((n) => (
              <Link key={n.to} to={n.to} onClick={() => setOpen(false)}
                className="block border-b border-border py-4 text-base text-foreground transition-colors hover:text-primary"
                activeProps={{ className: "block border-b border-border py-4 text-base font-medium text-primary" }}>
                {n.label}
              </Link>
            ))}
            <a href="https://uniworkos.com" target="_blank" rel="noopener noreferrer" onClick={() => setOpen(false)} className="block border-b border-border py-4 text-base text-foreground transition-colors hover:text-primary">Uniwork</a>
            <Link to="/tro-ly" onClick={() => setOpen(false)} className="block py-4 font-semibold text-primary">{t.assistant.title}</Link>
            <Link to={signedIn ? "/hoi-vien" : "/auth"} search={signedIn ? {} : { member: true }} onClick={() => setOpen(false)} className="block py-4 font-semibold text-primary">{signedIn ? t.memberPage.title : t.assistant.membershipLogin}</Link>
            <Link to={signedIn ? "/cms" : "/auth"} onClick={() => setOpen(false)} className="flex items-center gap-2 py-4 font-semibold text-primary"><ShieldCheck className="h-4 w-4" />{signedIn ? t.common.adminArea : t.common.adminLogin}</Link>
          </div>
        </nav>
      )}
    </header>
  );
}

function Newsletter() {
  const send = useServerFn(submitLead);
  const [done, setDone] = useState(false);
  if (done) return <p className="mt-4 text-sm">{t.footer.subscribed}</p>;
  return (
    <form onSubmit={async (e) => {
      e.preventDefault();
      const email = String(new FormData(e.currentTarget).get("email") || "").trim();
      if (!/^\S+@\S+\.\S+$/.test(email)) return;
      try { const r = await send({ data: { full_name: email.split("@")[0] ?? email, email, source: "subscribe" } }); if (r.ok) setDone(true); } catch { /* ignore */ }
    }} className="mt-4 flex overflow-hidden rounded-md bg-background">
      <input name="email" type="email" required maxLength={255} placeholder={t.footer.emailPh} className="min-w-0 flex-1 bg-transparent px-3 py-2.5 text-sm text-foreground outline-none" />
      <Button className="h-auto rounded-none px-4">{t.common.register}</Button>
    </form>
  );
}

export function Footer() {
  return (
    <footer className="mt-24 bg-navy text-navy-foreground">
      <div className="mx-auto grid max-w-7xl gap-10 px-4 py-16 md:grid-cols-3 md:px-8">
        <div>
          <p className="font-display text-3xl font-bold">{t.brand.name}</p>
          <p className="mt-2 text-xs">{t.brand.sub}</p>
          <p className="mt-5 max-w-sm text-sm leading-relaxed">{t.footer.about}</p>
          <ul className="mt-6 grid gap-3 text-sm">
            <li className="flex gap-2.5"><MapPin className="mt-0.5 h-4 w-4 shrink-0 opacity-70" /><span className="opacity-90">{t.contact.address}</span></li>
            <li className="flex gap-2.5"><Mail className="mt-0.5 h-4 w-4 shrink-0 opacity-70" /><a href={`mailto:${INSTITUTE_CONTACT.email}`} className="break-all opacity-90 hover:underline hover:opacity-100">{INSTITUTE_CONTACT.email}</a></li>
            <li className="flex gap-2.5"><Facebook className="mt-0.5 h-4 w-4 shrink-0 opacity-70" /><a href={INSTITUTE_CONTACT.fanpageUrl} target="_blank" rel="noopener noreferrer" className="opacity-90 hover:underline hover:opacity-100">{t.contact.fanpageLabel}: {t.contact.fanpageName}</a></li>
          </ul>
        </div>
        <div>
          <p className="text-xs uppercase tracking-[0.2em] opacity-60">{t.footer.cols}</p>
          <ul className="mt-4 grid grid-cols-2 gap-3 text-sm">
            {t.nav.map((n) => <li key={n.to}><Link to={n.to} className="opacity-80 hover:opacity-100">{n.label}</Link></li>)}
            <li><Link to="/lien-he" className="opacity-80 hover:opacity-100">{t.common.connect}</Link></li>
            <li><Link to="/thiet-ke" className="opacity-80 hover:opacity-100">{t.common.designs}</Link></li>
            <li><Link to="/crm" className="opacity-80 hover:opacity-100">{t.crm.title}</Link></li>
            <li><Link to="/tro-ly" className="opacity-80 hover:opacity-100">{t.assistant.title}</Link></li>
          </ul>
        </div>
        <div>
          <p className="text-xs uppercase tracking-[0.2em] opacity-60">{t.footer.newsletter}</p>
          <Newsletter />
        </div>
      </div>
      <div className="border-t border-navy-foreground/10 py-6 text-center text-xs opacity-60">{t.footer.rights}</div>
    </footer>
  );
}

export function Eyebrow({ children, light }: { children: ReactNode; light?: boolean }) {
  return (
    <p className={`flex items-center gap-3 text-xs font-semibold uppercase ${light ? "text-navy-foreground" : "text-brand-green"}`}>
      <span className="eyebrow-rule h-0.5 w-7 bg-brand-green" />{children}
    </p>
  );
}

export function Breadcrumb({ items }: { items: string[] }) {
  return (
    <p className="mb-5 flex flex-wrap items-center gap-2 text-sm text-muted-foreground">
      <Link to="/" className="hover:text-primary">{t.common.home}</Link>
      {items.map((i) => <span key={i} className="flex items-center gap-2"><span>›</span><span className="text-foreground">{i}</span></span>)}
    </p>
  );
}

export function PageHero({ crumbs, eyebrow, title, titleEm, lead, image, children }: {
  crumbs?: string[]; eyebrow?: string; title: string; titleEm?: string; lead: string; image: string; children?: ReactNode;
}) {
  return (
    <section className="site-hero relative overflow-hidden bg-navy text-hero-foreground">
      <img src={image} alt="" className="absolute inset-0 h-full w-full object-cover object-right" width={1408} height={912} />
      <div className="absolute inset-0 bg-hero-scrim" />
      <div className="relative mx-auto max-w-7xl px-5 py-12 md:px-8 md:py-16">
        <div className="hero-copy max-w-3xl">
          {crumbs && <Breadcrumb items={crumbs} />}
          {eyebrow && <div className="mb-4"><Eyebrow>{eyebrow}</Eyebrow></div>}
          <h1 className="font-display text-4xl leading-[1.15] md:text-5xl lg:text-6xl">
            {title} {titleEm && <em>{titleEm}</em>}
          </h1>
          <p className="mt-5 max-w-2xl text-base leading-relaxed md:text-lg">{lead}</p>
          {children && <div className="hero-actions mt-8 flex flex-wrap gap-3">{children}</div>}
        </div>
      </div>
    </section>
  );
}

export function BtnPrimary({ to, children }: { to: string; children: ReactNode }) {
  return <Button asChild className="h-auto min-h-12 whitespace-normal px-5 py-3 text-left font-semibold"><Link to={to}>{children}<ArrowRight className="h-4 w-4 shrink-0" /></Link></Button>;
}
export function BtnOutline({ to, children }: { to: string; children: ReactNode }) {
  return <Button asChild variant="outline" className="h-auto min-h-12 whitespace-normal px-5 py-3 text-left font-semibold text-primary"><Link to={to}>{children}<ArrowRight className="h-4 w-4 shrink-0" /></Link></Button>;
}

const icons = { book: BookOpen, cap: GraduationCap, bulb: Lightbulb, users: Users };
export function Pillars() {
  return (
    <div className="grid grid-cols-2 gap-6 lg:grid-cols-4">
      {t.pillars.map((p) => {
        const I = icons[p.icon as keyof typeof icons];
        return (
          <div key={p.title} className="border-t-2 border-brand-green pt-5">
            <I className="h-7 w-7 text-brand-green" strokeWidth={1.75} />
            <p className="mt-4 text-base font-semibold leading-snug text-navy">{p.title}</p>
            <p className="mt-2 text-sm text-muted-foreground">{p.desc}</p>
          </div>
        );
      })}
    </div>
  );
}

export function Tag({ children }: { children: ReactNode }) {
  return <span className="inline-block rounded-sm bg-accent px-2.5 py-1 text-[11px] font-semibold text-primary">{children}</span>;
}

export function Section({ children, className = "", id }: { children: ReactNode; className?: string; id?: string }) {
  return <section id={id} className={`site-section mx-auto max-w-7xl px-5 md:px-8 ${className}`}>{children}</section>;
}

export function H2({ children }: { children: ReactNode }) {
  return <h2 className="mt-3 font-display text-3xl font-semibold leading-[1.2] text-navy md:text-4xl [&_em]:not-italic">{children}</h2>;
}

export function CircleArrow() {
  return <span className="flex h-8 w-8 items-center justify-center rounded-full border border-brand-green text-brand-green transition group-hover:bg-brand-green group-hover:text-brand-green-foreground"><ArrowRight className="h-4 w-4" /></span>;
}
