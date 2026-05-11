import Link from "next/link";
import { CheckCircle2, HeartHandshake, HomeIcon, ShieldCheck, Sparkles, UserRound } from "lucide-react";
import { PageHero, PrimaryLink, SecondaryLink, SiteChrome } from "@/components/site-shell";
import { businessInfo } from "@/lib/business-info";

const principles = [
  {
    title: "Plain-English support",
    description: "Customers should understand what was fixed, what changed, and what to do next.",
    icon: HeartHandshake,
  },
  {
    title: "Patient by default",
    description: "TechBuddy is built for real homes, busy families, seniors, and everyday devices.",
    icon: UserRound,
  },
  {
    title: "Security-minded work",
    description: "Accounts, passwords, Wi-Fi, and devices get handled with care and practical guidance.",
    icon: ShieldCheck,
  },
];

const experiencePoints = [
  "Local help from Victor in and around Fort Worth",
  "Support for computers, phones, Wi-Fi, printers, TVs, and smart home gear",
  "Customer tickets, photos, service history, and invoices kept organized",
  "Calm troubleshooting instead of rushed, confusing tech talk",
];

export default function AboutPage() {
  return (
    <SiteChrome>
      <main>
        <PageHero
          eyebrow="About TechBuddy"
          title="Friendly technology help, built around real people."
          description={`${businessInfo.name} is local, plain-English technology support from ${businessInfo.owner} for homes, families, seniors, and small everyday setups around ${businessInfo.serviceArea}.`}
        >
          <div className="mt-8 flex flex-col gap-3 sm:flex-row">
            <PrimaryLink href="/services">Explore services</PrimaryLink>
            <SecondaryLink href="/contact">Contact Victor</SecondaryLink>
          </div>
        </PageHero>

        <section className="px-5 py-20 sm:px-8 lg:px-10">
          <div className="mx-auto grid max-w-7xl gap-10 lg:grid-cols-[0.85fr_1.15fr] lg:items-center">
            <div>
              <p className="text-sm font-bold text-[#5372FE]">Why it exists</p>
              <h2 className="font-display mt-3 text-5xl font-semibold leading-tight text-black">
                Tech support should feel calm before anything gets fixed.
              </h2>
              <p className="mt-5 text-lg leading-8 text-black/58">
                Most people do not need a corporate help desk. They need someone who can listen, diagnose the setup, explain the issue clearly, and leave the technology easier to live with.
              </p>
            </div>

            <div className="rounded-[2.2rem] border border-black/8 bg-[#FAFBFF] p-7 shadow-sm shadow-black/[0.03]">
              <HomeIcon className="text-[#5372FE]" size={34} aria-hidden="true" />
              <h3 className="mt-8 text-3xl font-bold text-black">Built for the home version of IT.</h3>
              <div className="mt-6 grid gap-3">
                {experiencePoints.map((point) => (
                  <div key={point} className="flex gap-3 rounded-2xl bg-white px-4 py-3 text-sm font-bold text-black/68">
                    <CheckCircle2 className="mt-0.5 shrink-0 text-[#5372FE]" size={18} aria-hidden="true" />
                    <span>{point}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        <section className="bg-[#F4F6FF] px-5 py-20 sm:px-8 lg:px-10">
          <div className="mx-auto max-w-7xl">
            <div className="max-w-3xl">
              <p className="text-sm font-bold text-[#5372FE]">How TechBuddy works</p>
              <h2 className="font-display mt-3 text-5xl font-semibold leading-tight text-black">Practical help, polished experience.</h2>
            </div>
            <div className="mt-10 grid gap-5 md:grid-cols-3">
              {principles.map((principle) => (
                <article key={principle.title} className="tech-card interactive-lift rounded-[2rem] border border-black/8 bg-white p-7 shadow-sm shadow-black/[0.03]">
                  <principle.icon className="text-[#5372FE]" size={32} aria-hidden="true" />
                  <h3 className="mt-8 text-2xl font-bold text-black">{principle.title}</h3>
                  <p className="mt-3 text-sm leading-6 text-black/56">{principle.description}</p>
                </article>
              ))}
            </div>
          </div>
        </section>

        <section className="px-5 py-20 sm:px-8 lg:px-10">
          <div className="mx-auto rounded-[2.4rem] bg-black p-8 text-white sm:p-12 lg:max-w-7xl">
            <div className="grid gap-8 lg:grid-cols-[1fr_auto] lg:items-center">
              <div>
                <p className="text-sm font-bold text-[#6B85FE]">Ready when the tech is not</p>
                <h2 className="font-display mt-3 max-w-3xl text-5xl font-semibold leading-tight">
                  Get help with the devices and setups you use every day.
                </h2>
              </div>
              <Link href="/contact" className="interactive-lift inline-flex items-center justify-center gap-2 rounded-full bg-white px-6 py-3.5 text-sm font-bold text-black">
                Start with contact
                <Sparkles size={17} aria-hidden="true" />
              </Link>
            </div>
          </div>
        </section>
      </main>
    </SiteChrome>
  );
}
