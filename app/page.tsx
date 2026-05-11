import Image from "next/image";
import Link from "next/link";
import type { Route } from "next";
import { ArrowRight, CheckCircle2 } from "lucide-react";
import { audienceCards, portalFeatures, processSteps, servicePages, trustStats, values } from "@/lib/site-data";
import { PrimaryLink, SecondaryLink, SiteChrome } from "@/components/site-shell";

export default function Home() {
  return (
    <SiteChrome>
      <main>
        <section className="tech-grid-bg relative overflow-hidden bg-[linear-gradient(180deg,#F4F6FF_0%,#ffffff_74%)] px-5 py-12 sm:px-8 lg:px-10">
          <div className="mx-auto grid min-h-[calc(100vh-86px)] max-w-7xl items-center gap-12 lg:grid-cols-[0.88fr_1.12fr]">
            <div className="animate-reveal">
              <p className="text-sm font-bold text-[#5372FE]">TechBuddy by Victor</p>
              <h1 className="font-display mt-5 max-w-4xl text-6xl font-semibold leading-[0.94] tracking-normal text-black sm:text-7xl lg:text-8xl">
                Personal IT support, elevated.
              </h1>
              <p className="mt-7 max-w-2xl text-xl leading-9 text-black/58">
                Premium, plain-English technology help for real people: Wi-Fi, computers, phones,
                printers, smart home devices, security cleanup, customer tickets, photos, and invoices.
              </p>
              <div className="mt-9 flex flex-col gap-3 sm:flex-row">
                <PrimaryLink href="/services">Explore services</PrimaryLink>
                <SecondaryLink href="/portal">See the portal</SecondaryLink>
              </div>
              <div className="mt-10 grid max-w-xl grid-cols-3 gap-3">
                {trustStats.map((stat) => (
                  <div key={stat.label} className="interactive-lift rounded-3xl border border-black/8 bg-white/72 p-4 shadow-sm shadow-black/[0.03] backdrop-blur">
                    <p className="font-display text-2xl font-semibold text-black">{stat.value}</p>
                    <p className="mt-1 text-xs font-semibold leading-5 text-black/45">{stat.label}</p>
                  </div>
                ))}
              </div>
            </div>

            <div className="animate-reveal-delay-1 diagnostic-frame relative">
              <div className="absolute -inset-6 rounded-[2.4rem] bg-[#5372FE]/12 blur-3xl" />
              <Image
                src="/techbuddy-hero.png"
                alt="Home technology setup with laptop, router, phone, and printer"
                width={1536}
                height={1024}
                priority
                className="relative aspect-[4/3] w-full rounded-[2.4rem] border border-black/8 object-cover shadow-[0_34px_90px_rgba(20,28,60,0.18)]"
              />
              <div className="absolute bottom-5 left-5 right-5 rounded-[1.6rem] border border-white/60 bg-white/82 p-5 shadow-xl shadow-black/10 backdrop-blur-xl">
                <p className="text-sm font-bold text-black">Today’s support desk</p>
                <div className="mt-4 grid gap-2 sm:grid-cols-3">
                  {["Wi-Fi", "Devices", "Invoices"].map((item) => (
                    <div key={item} className="status-pill rounded-2xl bg-[#F4F6FF] px-4 py-3 text-sm font-bold text-black/68">
                      {item}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="px-5 py-24 sm:px-8 lg:px-10">
          <div className="mx-auto max-w-7xl">
            <div className="grid gap-10 lg:grid-cols-[0.8fr_1.2fr] lg:items-end">
              <div>
                <p className="text-sm font-bold text-[#5372FE]">Built for people</p>
                <h2 className="font-display mt-3 text-5xl font-semibold leading-tight text-black">Not corporate IT. Personal IT.</h2>
              </div>
              <p className="text-lg leading-8 text-black/56">
                Most support websites feel either too technical or too cheap. TechBuddy should feel premium,
                calm, and clear: a professional service for the everyday technology customers actually live with.
              </p>
            </div>

            <div className="mt-12 grid gap-5 md:grid-cols-2 lg:grid-cols-4">
              {audienceCards.map((card) => (
                <article key={card.title} className="tech-card interactive-lift rounded-[2rem] border border-black/8 bg-[#FAFBFF] p-6 shadow-sm shadow-black/[0.03] hover:shadow-[0_18px_46px_rgba(20,28,60,0.08)]">
                  <card.icon className="text-[#5372FE]" size={30} aria-hidden="true" />
                  <h3 className="mt-8 text-xl font-bold text-black">{card.title}</h3>
                  <p className="mt-3 text-sm leading-6 text-black/54">{card.copy}</p>
                </article>
              ))}
            </div>
          </div>
        </section>

        <section className="bg-[#F4F6FF] px-5 py-24 sm:px-8 lg:px-10">
          <div className="mx-auto max-w-7xl">
            <div className="mx-auto max-w-3xl text-center">
              <p className="text-sm font-bold text-[#5372FE]">Services</p>
              <h2 className="font-display mt-3 text-5xl font-semibold leading-tight text-black">Every core service has its own place.</h2>
            </div>
            <div className="mt-12 grid gap-5 md:grid-cols-2 lg:grid-cols-3">
              {servicePages.map((service) => (
                <Link key={service.slug} href={`/services/${service.slug}` as Route} className="tech-card interactive-lift group rounded-[2rem] border border-black/8 bg-white p-6 shadow-sm shadow-black/[0.03] hover:shadow-[0_24px_60px_rgba(20,28,60,0.1)]">
                  <div className="flex items-start justify-between gap-4">
                    <span className="grid h-12 w-12 place-items-center rounded-2xl bg-[#5372FE]/10 text-[#5372FE]">
                      <service.icon size={24} aria-hidden="true" />
                    </span>
                    <ArrowRight className="text-black/24 transition group-hover:text-[#5372FE]" size={20} aria-hidden="true" />
                  </div>
                  <p className="mt-8 text-xs font-bold uppercase tracking-[0.14em] text-[#5372FE]">{service.eyebrow}</p>
                  <h3 className="mt-2 text-2xl font-bold text-black">{service.title}</h3>
                  <p className="mt-3 text-sm leading-6 text-black/54">{service.description}</p>
                </Link>
              ))}
            </div>
          </div>
        </section>

        <section className="px-5 py-24 sm:px-8 lg:px-10">
          <div className="mx-auto grid max-w-7xl gap-12 lg:grid-cols-[0.9fr_1.1fr] lg:items-center">
            <div>
              <p className="text-sm font-bold text-[#5372FE]">The TechBuddy process</p>
              <h2 className="font-display mt-3 text-5xl font-semibold leading-tight text-black">Calm from the first click.</h2>
              <p className="mt-5 text-lg leading-8 text-black/56">
                The support experience should be as organized as the technical work: clear requests,
                useful photos, simple updates, and invoices in one place.
              </p>
            </div>
            <div className="grid gap-4">
              {processSteps.map((step, index) => (
                <div key={step.title} className="support-line interactive-lift grid gap-5 overflow-hidden rounded-[2rem] border border-black/8 bg-white p-6 shadow-sm shadow-black/[0.03] sm:grid-cols-[auto_1fr]">
                  <span className="grid h-11 w-11 place-items-center rounded-full bg-black text-sm font-bold text-white">{index + 1}</span>
                  <div>
                    <h3 className="text-xl font-bold text-black">{step.title}</h3>
                    <p className="mt-2 text-sm leading-6 text-black/54">{step.description}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="bg-black px-5 py-24 text-white sm:px-8 lg:px-10">
          <div className="mx-auto max-w-7xl">
            <div className="grid gap-10 lg:grid-cols-[0.9fr_1.1fr] lg:items-center">
              <div>
                <p className="text-sm font-bold text-[#6B85FE]">Customer portal</p>
                <h2 className="font-display mt-3 text-5xl font-semibold leading-tight">A calm home base for support.</h2>
                <p className="mt-5 text-lg leading-8 text-white/58">
                  Customers can log in, create tickets, upload photos, and view invoices without digging through scattered texts or email threads.
                </p>
                <div className="mt-8 flex flex-col gap-3 sm:flex-row">
                  <PrimaryLink href="/portal">View portal page</PrimaryLink>
                  <Link href="/login" className="inline-flex items-center justify-center rounded-full border border-white/18 px-6 py-3.5 text-sm font-bold text-white transition hover:bg-white/10">
                    Customer login
                  </Link>
                </div>
              </div>
              <div className="grid gap-4 sm:grid-cols-2">
                {portalFeatures.map((feature) => (
                  <div key={feature.title} className="rounded-[2rem] border border-white/10 bg-white/[0.06] p-6">
                    <feature.icon className="text-[#6B85FE]" size={28} aria-hidden="true" />
                    <h3 className="mt-8 text-xl font-bold">{feature.title}</h3>
                    <p className="mt-3 text-sm leading-6 text-white/55">{feature.description}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        <section className="px-5 py-24 sm:px-8 lg:px-10">
          <div className="mx-auto max-w-7xl rounded-[2.4rem] bg-[linear-gradient(135deg,#F4F6FF,#ffffff)] p-8 shadow-[inset_0_0_0_1px_rgba(0,0,0,0.08)] sm:p-12">
            <div className="grid gap-10 lg:grid-cols-[1fr_auto] lg:items-end">
              <div>
                <p className="text-sm font-bold text-[#5372FE]">Professional by default</p>
                <h2 className="font-display mt-3 max-w-3xl text-5xl font-semibold leading-tight text-black">
                  A support experience that feels polished before the first appointment.
                </h2>
                <div className="mt-8 grid gap-3 sm:grid-cols-2">
                  {values.map((value) => (
                    <div key={value.title} className="flex items-center gap-3 rounded-2xl bg-white p-4 shadow-sm shadow-black/[0.03]">
                      <value.icon className="text-[#5372FE]" size={20} aria-hidden="true" />
                      <span className="text-sm font-bold text-black/72">{value.title}</span>
                    </div>
                  ))}
                </div>
              </div>
              <div className="grid gap-3">
                {["Create account", "Open ticket", "Upload photos", "Receive invoice"].map((item) => (
                  <div key={item} className="flex items-center gap-3 rounded-full bg-white px-5 py-3 text-sm font-bold text-black/68 shadow-sm shadow-black/[0.03]">
                    <CheckCircle2 className="text-[#5372FE]" size={18} aria-hidden="true" />
                    {item}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>
      </main>
    </SiteChrome>
  );
}
