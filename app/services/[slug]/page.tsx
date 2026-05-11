import { notFound } from "next/navigation";
import { CheckCircle2 } from "lucide-react";
import { PageHero, PrimaryLink, SecondaryLink, SiteChrome } from "@/components/site-shell";
import { servicePages } from "@/lib/site-data";

export function generateStaticParams() {
  return servicePages.map((service) => ({ slug: service.slug }));
}

export function generateMetadata({ params }: { params: { slug: string } }) {
  const service = servicePages.find((item) => item.slug === params.slug);

  if (!service) return {};

  return {
    title: `${service.title} | TechBuddy by Victor`,
    description: service.description,
  };
}

export default function ServiceDetailPage({ params }: { params: { slug: string } }) {
  const service = servicePages.find((item) => item.slug === params.slug);

  if (!service) notFound();

  return (
    <SiteChrome>
      <main>
        <PageHero eyebrow={service.eyebrow} title={service.hero} description={service.description}>
          <div className="mt-8 flex flex-col gap-3 sm:flex-row">
            <PrimaryLink href="/register">Start a ticket</PrimaryLink>
            <SecondaryLink href="/services">All services</SecondaryLink>
          </div>
        </PageHero>

        <section className="px-5 py-20 sm:px-8 lg:px-10">
          <div className="mx-auto grid max-w-7xl gap-12 lg:grid-cols-[0.92fr_1.08fr]">
            <div>
              <service.icon className="text-[#5372FE]" size={42} aria-hidden="true" />
              <h2 className="font-display mt-8 text-5xl font-semibold leading-tight text-black">{service.title}</h2>
              <p className="mt-5 text-lg leading-8 text-black/58">{service.overview}</p>
            </div>

            <div className="grid gap-5">
              <div className="rounded-[2.2rem] bg-[#F4F6FF] p-7">
                <h3 className="text-2xl font-bold text-black">What this covers</h3>
                <div className="mt-6 grid gap-3 sm:grid-cols-2">
                  {service.highlights.map((highlight) => (
                    <div key={highlight} className="flex items-center gap-3 rounded-2xl bg-white p-4 text-sm font-bold text-black/68">
                      <CheckCircle2 className="text-[#5372FE]" size={18} aria-hidden="true" />
                      {highlight}
                    </div>
                  ))}
                </div>
              </div>

              <div className="rounded-[2.2rem] border border-black/8 bg-white p-7 shadow-sm shadow-black/[0.03]">
                <h3 className="text-2xl font-bold text-black">Typical deliverables</h3>
                <div className="mt-6 grid gap-4">
                  {service.deliverables.map((item) => (
                    <div key={item} className="flex gap-4 border-b border-black/8 pb-4 last:border-0 last:pb-0">
                      <span className="mt-1 h-2 w-2 shrink-0 rounded-full bg-[#5372FE]" />
                      <p className="text-sm leading-6 text-black/58">{item}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="bg-black px-5 py-20 text-white sm:px-8 lg:px-10">
          <div className="mx-auto grid max-w-7xl gap-8 lg:grid-cols-[1fr_auto] lg:items-center">
            <div>
              <p className="text-sm font-bold text-[#6B85FE]">Ready when you are</p>
              <h2 className="font-display mt-3 max-w-3xl text-5xl font-semibold leading-tight">
                Open a ticket and attach photos so Victor can see what is happening.
              </h2>
            </div>
            <PrimaryLink href="/register">Open customer portal</PrimaryLink>
          </div>
        </section>
      </main>
    </SiteChrome>
  );
}
