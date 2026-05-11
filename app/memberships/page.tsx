import Link from "next/link";
import { ArrowRight, CheckCircle2, Clock3 } from "lucide-react";
import { membershipPlans } from "@/lib/membership-plans";
import { PageHero, PrimaryLink, SecondaryLink, SiteChrome } from "@/components/site-shell";

export default function MembershipsPage() {
  return (
    <SiteChrome>
      <main>
        <PageHero
          eyebrow="TechBuddy memberships"
          title="Monthly tech support that actually feels useful."
          description="Memberships give customers faster help, included remote support, member pricing, and a calmer way to handle everyday technology problems."
        >
          <div className="mt-8 flex flex-col gap-3 sm:flex-row">
            <PrimaryLink href="/register">Request a membership</PrimaryLink>
            <SecondaryLink href="/login">Customer login</SecondaryLink>
          </div>
        </PageHero>

        <section className="px-5 py-20 sm:px-8 lg:px-10">
          <div className="mx-auto max-w-7xl">
            <div className="max-w-3xl">
              <p className="text-sm font-bold uppercase text-[#5372FE]">TechBuddy memberships</p>
              <h2 className="font-display mt-3 text-5xl font-semibold leading-tight text-black">
                Pick the support level that gives your home the right amount of backup.
              </h2>
            </div>

            <div className="mt-10 grid gap-5 lg:grid-cols-3">
              {membershipPlans.map((plan) => (
                <article key={plan.name} className={`tech-card interactive-lift flex min-h-[34rem] flex-col rounded-[2rem] border bg-white p-7 shadow-sm shadow-black/[0.03] ${plan.badge ? "border-[#5372FE]/28 ring-4 ring-[#5372FE]/8" : "border-black/8"}`}>
                  <div className="flex items-start justify-between gap-4">
                    <plan.icon className="text-[#5372FE]" size={32} aria-hidden="true" />
                    {plan.badge ? (
                      <span className="rounded-full bg-[#5372FE] px-3 py-1 text-xs font-black uppercase text-white">
                        {plan.badge}
                      </span>
                    ) : null}
                  </div>
                  <h3 className="mt-8 text-3xl font-bold tracking-tight text-black">{plan.name}</h3>
                  <p className="mt-2 text-4xl font-bold text-[#5372FE]">{plan.priceLabel}</p>
                  <p className="mt-4 text-sm leading-6 text-black/56">{plan.description}</p>
                  <div className="mt-5 rounded-2xl bg-[#F4F6FF] px-4 py-3">
                    <p className="text-xs font-black uppercase tracking-[0.12em] text-[#5372FE]">Best for</p>
                    <p className="mt-2 text-sm font-semibold leading-6 text-black/66">{plan.bestFor}</p>
                  </div>
                  <div className="mt-6 grid gap-3">
                    {plan.features.map((feature) => (
                      <div key={feature} className="flex gap-3 rounded-2xl bg-[#FAFBFF] px-4 py-3 text-sm font-semibold text-black/64">
                        <CheckCircle2 className="mt-0.5 shrink-0 text-[#5372FE]" size={17} aria-hidden="true" />
                        <span>{feature}</span>
                      </div>
                    ))}
                  </div>
                  <Link href="/register" className="mt-auto inline-flex items-center justify-center gap-2 rounded-full bg-black px-5 py-3 text-sm font-bold text-white transition hover:bg-[#2a2a2a]">
                    Request this plan
                    <ArrowRight size={16} aria-hidden="true" />
                  </Link>
                </article>
              ))}
            </div>
          </div>
        </section>

        <section className="bg-[#F4F6FF] px-5 py-20 sm:px-8 lg:px-10">
          <div className="mx-auto grid max-w-7xl gap-8 lg:grid-cols-[0.85fr_1.15fr] lg:items-center">
            <div>
              <p className="text-sm font-bold text-[#5372FE]">How it works</p>
              <h2 className="font-display mt-3 text-5xl font-semibold leading-tight text-black">
                Membership requests stay organized in the customer portal.
              </h2>
              <p className="mt-5 text-lg leading-8 text-black/58">
                Customers can request a plan, track status, open tickets, and keep invoices and service history in one place.
              </p>
            </div>
            <div className="rounded-[2.2rem] bg-white p-7 shadow-sm shadow-black/[0.03]">
              {["Create or log in to your account", "Request the membership that fits", "Victor follows up and activates service", "Use the portal for support and records"].map((step) => (
                <div key={step} className="flex items-center gap-4 border-b border-black/8 py-4 first:pt-0 last:border-0 last:pb-0">
                  <Clock3 className="text-[#5372FE]" size={20} aria-hidden="true" />
                  <span className="font-bold text-black/70">{step}</span>
                </div>
              ))}
            </div>
          </div>
        </section>
      </main>
    </SiteChrome>
  );
}
