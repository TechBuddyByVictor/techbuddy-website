import Link from "next/link";
import { CreditCard, Mail, MapPin, MessageSquare, Phone, UserPlus } from "lucide-react";
import { PageHero, PrimaryLink, SecondaryLink, SiteChrome } from "@/components/site-shell";
import { businessInfo } from "@/lib/business-info";

export default function ContactPage() {
  return (
    <SiteChrome>
      <main>
        <PageHero
          eyebrow="Contact"
          title="Tell TechBuddy what is going on."
          description="The fastest path is to create an account and open a ticket with photos. You can also use this page for simple questions before opening a request."
        >
          <div className="mt-8 flex flex-col gap-3 sm:flex-row">
            <PrimaryLink href="/register">Create customer account</PrimaryLink>
            <SecondaryLink href="/login">Log in</SecondaryLink>
          </div>
        </PageHero>

        <section className="px-5 py-20 sm:px-8 lg:px-10">
          <div className="mx-auto grid max-w-7xl gap-5 md:grid-cols-3">
            {[
              { title: "New customer", icon: UserPlus, copy: "Create an account, then open a ticket with the issue and any photos." },
              { title: "Existing customer", icon: MessageSquare, copy: "Log in to check tickets, upload more photos, or view invoices." },
              { title: "Direct inquiry", icon: Mail, copy: `${businessInfo.phone} or ${businessInfo.email}` },
            ].map((item) => (
              <article key={item.title} className="rounded-[2rem] border border-black/8 bg-white p-7 shadow-sm shadow-black/[0.03]">
                <item.icon className="text-[#5372FE]" size={32} aria-hidden="true" />
                <h2 className="mt-8 text-2xl font-bold text-black">{item.title}</h2>
                <p className="mt-3 text-sm leading-6 text-black/54">{item.copy}</p>
              </article>
            ))}
          </div>
        </section>

        <section className="px-5 pb-20 sm:px-8 lg:px-10">
          <div className="mx-auto grid max-w-7xl gap-5 lg:grid-cols-[0.9fr_1.1fr]">
            <div className="support-line overflow-hidden rounded-[2rem] border border-black/8 bg-white p-7 shadow-sm shadow-black/[0.03]">
              <MapPin className="text-[#5372FE]" size={32} aria-hidden="true" />
              <h2 className="mt-8 text-3xl font-bold text-black">Service area</h2>
              <p className="mt-3 text-sm leading-6 text-black/56">
                Based in {businessInfo.serviceArea}, serving nearby neighborhoods and surrounding areas.
              </p>
              <div className="mt-5 flex flex-wrap gap-2">
                {businessInfo.nearbyAreas.map((area) => (
                  <span key={area} className="rounded-full bg-[#F4F6FF] px-3 py-1.5 text-xs font-bold text-black/58">
                    {area}
                  </span>
                ))}
              </div>
            </div>

            <div className="grid gap-5 sm:grid-cols-2">
              <article className="tech-card interactive-lift rounded-[2rem] border border-black/8 bg-white p-7 shadow-sm shadow-black/[0.03]">
                <Phone className="text-[#5372FE]" size={30} aria-hidden="true" />
                <h2 className="mt-8 text-2xl font-bold text-black">Booking options</h2>
                <div className="mt-4 grid gap-2">
                  {businessInfo.bookingTypes.map((type) => (
                    <span key={type} className="rounded-2xl bg-[#FAFBFF] px-4 py-3 text-sm font-semibold text-black/62">{type}</span>
                  ))}
                </div>
              </article>
              <article className="tech-card interactive-lift rounded-[2rem] border border-black/8 bg-white p-7 shadow-sm shadow-black/[0.03]">
                <CreditCard className="text-[#5372FE]" size={30} aria-hidden="true" />
                <h2 className="mt-8 text-2xl font-bold text-black">Payment methods</h2>
                <div className="mt-4 grid gap-2">
                  {businessInfo.paymentMethods.map((method) => (
                    <span key={method} className="rounded-2xl bg-[#FAFBFF] px-4 py-3 text-sm font-semibold text-black/62">{method}</span>
                  ))}
                </div>
              </article>
            </div>
          </div>
        </section>

        <section className="bg-[#F4F6FF] px-5 py-20 sm:px-8 lg:px-10">
          <div className="mx-auto max-w-4xl rounded-[2.4rem] bg-white p-8 text-center shadow-sm shadow-black/[0.03] sm:p-12">
            <p className="text-sm font-bold text-[#5372FE]">Best first step</p>
            <h2 className="font-display mt-3 text-5xl font-semibold leading-tight text-black">Open a ticket with photos.</h2>
            <p className="mx-auto mt-5 max-w-2xl text-lg leading-8 text-black/58">
              Photos of router labels, error messages, printer screens, cable setups, or device screens can make the first response much faster.
            </p>
            <Link href="/register" className="mt-8 inline-flex items-center justify-center rounded-full bg-black px-6 py-3.5 text-sm font-bold text-white">
              Start now
            </Link>
          </div>
        </section>
      </main>
    </SiteChrome>
  );
}
