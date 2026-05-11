import Link from "next/link";
import type { Route } from "next";
import { ArrowRight } from "lucide-react";
import { PageHero, PrimaryLink, SecondaryLink, SiteChrome } from "@/components/site-shell";
import { personalServiceCatalog, servicePages } from "@/lib/site-data";

export default function ServicesPage() {
  return (
    <SiteChrome>
      <main>
        <PageHero
          eyebrow="Services"
          title="Premium support for the technology regular people actually use."
          description="Each TechBuddy service has a clear place, clear purpose, and a customer-friendly path into the portal."
        >
          <div className="mt-8 flex flex-col gap-3 sm:flex-row">
            <PrimaryLink href="/register">Start a request</PrimaryLink>
            <SecondaryLink href="/contact">Ask a question</SecondaryLink>
          </div>
        </PageHero>

        <section className="px-5 py-20 sm:px-8 lg:px-10">
          <div className="mx-auto grid max-w-7xl gap-5 md:grid-cols-2 lg:grid-cols-3">
            {servicePages.map((service) => (
              <Link key={service.slug} href={`/services/${service.slug}` as Route} className="tech-card interactive-lift group rounded-[2.2rem] border border-black/8 bg-white p-7 shadow-sm shadow-black/[0.03] hover:shadow-[0_24px_60px_rgba(20,28,60,0.1)]">
                <div className="flex items-start justify-between gap-4">
                  <span className="grid h-13 w-13 place-items-center rounded-2xl bg-[#5372FE]/10 text-[#5372FE]">
                    <service.icon size={25} aria-hidden="true" />
                  </span>
                  <ArrowRight className="text-black/24 transition group-hover:text-[#5372FE]" size={20} aria-hidden="true" />
                </div>
                <p className="mt-9 text-xs font-bold uppercase tracking-[0.14em] text-[#5372FE]">{service.eyebrow}</p>
                <h2 className="mt-2 text-2xl font-bold text-black">{service.title}</h2>
                <p className="mt-3 text-sm leading-6 text-black/54">{service.description}</p>
                <div className="mt-6 flex flex-wrap gap-2">
                  {service.highlights.map((highlight) => (
                    <span key={highlight} className="rounded-full bg-[#F4F6FF] px-3 py-1 text-xs font-bold text-black/55">
                      {highlight}
                    </span>
                  ))}
                </div>
              </Link>
            ))}
          </div>
        </section>

        <section className="bg-[#F4F6FF] px-5 py-20 sm:px-8 lg:px-10">
          <div className="mx-auto max-w-7xl">
            <div className="grid gap-8 lg:grid-cols-[0.82fr_1.18fr] lg:items-end">
              <div>
                <p className="text-sm font-bold text-[#5372FE]">Full service list</p>
                <h2 className="font-display mt-3 text-5xl font-semibold leading-tight text-black">Everything TechBuddy can help with.</h2>
              </div>
              <p className="text-lg leading-8 text-black/56">
                A practical menu of setup, troubleshooting, cleanup, training, security, and everyday home technology support.
              </p>
            </div>

            <div className="mt-10 grid gap-5 lg:grid-cols-2">
              {personalServiceCatalog.map((category) => (
                <article key={category.title} className="support-line tech-card interactive-lift overflow-hidden rounded-[2rem] border border-black/8 bg-white p-6 shadow-sm shadow-black/[0.03] hover:shadow-[0_20px_55px_rgba(20,28,60,0.1)]">
                  <div className="flex items-start gap-4">
                    <span className="grid h-12 w-12 shrink-0 place-items-center rounded-2xl bg-[#5372FE]/10 text-[#5372FE]">
                      <category.icon size={24} aria-hidden="true" />
                    </span>
                    <div>
                      <h3 className="text-2xl font-bold text-black">{category.title}</h3>
                      <div className="mt-5 grid gap-2 sm:grid-cols-2">
                        {category.items.map((item) => (
                          <div key={item} className="rounded-2xl bg-[#FAFBFF] px-4 py-3 text-sm font-semibold leading-5 text-black/62">
                            {item}
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </article>
              ))}
            </div>
          </div>
        </section>
      </main>
    </SiteChrome>
  );
}
