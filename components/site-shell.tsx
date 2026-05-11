import Image from "next/image";
import Link from "next/link";
import type { Route } from "next";
import { ArrowRight } from "lucide-react";
import { businessInfo } from "@/lib/business-info";
import { getPortalAuthState } from "@/lib/portal-auth";
import type { PortalAuthState } from "@/lib/portal-auth-state";
import { servicePages } from "@/lib/site-data";
import { HeaderLoginButton, SiteAccountSummary } from "@/components/site-auth-actions";
import { MembershipPromoPopup } from "@/components/membership-promo-popup";
import { SiteMobileHeader } from "@/components/site-mobile-header";

const navItems: Array<{ href: Route; label: string }> = [
  { href: "/", label: "Home" },
  { href: "/memberships", label: "Memberships" },
  { href: "/services", label: "Services" },
  { href: "/contact", label: "Contact" },
  { href: "/business", label: "Business" },
];

export function SiteHeader({ initialAuthState }: { initialAuthState: PortalAuthState }) {
  return (
    <header className="animate-header-drop sticky top-0 z-[80] border-b border-black/8 bg-white/82 backdrop-blur-2xl">
      <SiteMobileHeader navItems={navItems} initialAuthState={initialAuthState} />

      <div className="mx-auto hidden max-w-7xl items-center gap-4 px-10 py-4 lg:grid lg:grid-cols-[1fr_auto_1fr]">
        <Link href="/" className="flex min-w-0 items-center" aria-label="TechBuddy home">
          <Image
            src="/techbuddy-logo.png"
            alt="TechBuddy"
            width={850}
            height={252}
            priority
            className="h-11 w-auto max-w-[158px] object-contain sm:h-12 sm:max-w-[184px]"
          />
        </Link>

        <nav className="flex items-center justify-center gap-1 rounded-full border border-black/8 bg-white/74 p-1 shadow-sm shadow-black/[0.03]">
          {navItems.map((item) => (
            <Link key={item.href} href={item.href} className="interactive-lift nav-motion shrink-0 rounded-full px-4 py-2 text-sm font-bold text-black/58 hover:bg-[#F4F6FF] hover:text-[#3D60FE]">
              {item.label}
            </Link>
          ))}
        </nav>

        <div className="flex justify-end">
          <HeaderLoginButton initialAuthState={initialAuthState} />
        </div>
      </div>
    </header>
  );
}

export function SiteFooter({ initialAuthState }: { initialAuthState: PortalAuthState }) {
  return (
    <footer className="border-t border-black/8 bg-white px-5 py-12 sm:px-8 lg:px-10">
      <div className="mx-auto grid max-w-7xl gap-10 lg:grid-cols-[1.1fr_1.4fr_0.8fr]">
        <div>
          <div className="flex items-center gap-3">
            <Image
              src="/techbuddy-logo.png"
              alt="TechBuddy"
              width={850}
              height={252}
              className="h-13 w-auto max-w-[210px] object-contain"
            />
          </div>
          <p className="mt-5 max-w-sm text-sm leading-6 text-black/54">
            Friendly, professional technology help from {businessInfo.owner} for homes, seniors, families, and everyday devices around {businessInfo.serviceArea}.
          </p>
          <div className="mt-5 grid gap-2 text-sm font-semibold text-black/55">
            <a href={businessInfo.phoneHref} className="transition hover:text-[#3D60FE]">{businessInfo.phone}</a>
            <a href={businessInfo.emailHref} className="transition hover:text-[#3D60FE]">{businessInfo.email}</a>
          </div>
        </div>

        <div className="grid gap-8 sm:grid-cols-2">
          <div>
            <p className="text-sm font-bold text-black">Services</p>
            <div className="mt-4 grid gap-3">
              {servicePages.slice(0, 4).map((service) => (
                <Link key={service.slug} href={`/services/${service.slug}` as Route} className="text-sm text-black/55 transition hover:text-[#3D60FE]">
                  {service.title}
                </Link>
              ))}
            </div>
          </div>
          <div>
            <p className="text-sm font-bold text-black">Company</p>
            <div className="mt-4 grid gap-3">
              {navItems.filter((item) => item.href !== "/business").map((item) => (
                <Link key={item.href} href={item.href} className="text-sm text-black/55 transition hover:text-[#3D60FE]">
                  {item.label}
                </Link>
              ))}
            </div>
          </div>
        </div>

        <SiteAccountSummary initialAuthState={initialAuthState} />
      </div>
      <div className="mx-auto mt-10 max-w-7xl border-t border-black/8 pt-6 text-sm text-black/40">
        {businessInfo.name}. Built for real-life tech support.
      </div>
    </footer>
  );
}

export async function SiteChrome({ children }: { children: React.ReactNode }) {
  const portalAuthState = await getPortalAuthState();

  return (
    <div className="min-h-screen bg-white text-black">
      <SiteHeader initialAuthState={portalAuthState} />
      {children}
      <SiteFooter initialAuthState={portalAuthState} />
      <MembershipPromoPopup />
    </div>
  );
}

export function PageHero({
  eyebrow,
  title,
  description,
  children,
}: {
  eyebrow: string;
  title: string;
  description: string;
  children?: React.ReactNode;
}) {
  return (
    <section className="relative overflow-hidden bg-[linear-gradient(180deg,#F4F6FF_0%,#ffffff_82%)] px-5 py-20 sm:px-8 lg:px-10">
      <div className="mx-auto max-w-7xl">
        <p className="text-sm font-bold text-[#5372FE]">{eyebrow}</p>
        <h1 className="font-display mt-4 max-w-4xl text-5xl font-semibold leading-[0.98] tracking-normal text-black sm:text-6xl lg:text-7xl">
          {title}
        </h1>
        <p className="mt-6 max-w-2xl text-lg leading-8 text-black/58">{description}</p>
        {children}
      </div>
    </section>
  );
}

export function PrimaryLink({ href, children }: { href: Route; children: React.ReactNode }) {
  return (
    <Link href={href} className="interactive-lift inline-flex items-center justify-center gap-2 rounded-full bg-[linear-gradient(135deg,#3D60FE,#6B85FE)] px-6 py-3.5 text-sm font-bold text-white shadow-[0_14px_34px_rgba(83,114,254,0.24)]">
      {children}
      <ArrowRight size={17} aria-hidden="true" />
    </Link>
  );
}

export function SecondaryLink({ href, children }: { href: Route; children: React.ReactNode }) {
  return (
    <Link href={href} className="interactive-lift inline-flex items-center justify-center rounded-full border border-black/10 bg-white px-6 py-3.5 text-sm font-bold text-black hover:border-black/18 hover:bg-black/[0.025]">
      {children}
    </Link>
  );
}
