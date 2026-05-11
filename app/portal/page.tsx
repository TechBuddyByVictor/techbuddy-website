import { CheckCircle2, CreditCard, MapPin, ShieldCheck, Sparkles, UserRound, Wrench } from "lucide-react";
import { redirect } from "next/navigation";
import { PageHero, SiteChrome } from "@/components/site-shell";
import { PortalCtaButton, PortalLandingActions } from "@/components/site-auth-actions";
import { getPortalAuthState } from "@/lib/portal-auth";
import { membershipPlans } from "@/lib/membership-plans";
import { portalFeatures } from "@/lib/site-data";

const portalActions = [
  { title: "Edit customer info", description: "Customers can update phone numbers, preferred contact, and service address.", icon: UserRound },
  { title: "View invoices", description: "Invoices can be sent into the portal with payment status, due dates, and notes.", icon: CreditCard },
  { title: "Track services", description: "Completed work, active status, technician notes, and warranty dates stay organized.", icon: Wrench },
  { title: "Manage warranties", description: "Each service can show warranty status and expiration so customers know what is covered.", icon: ShieldCheck },
  { title: "Save addresses", description: "Service locations, apartment details, and appointment notes stay attached to the account.", icon: MapPin },
  { title: "Choose memberships", description: "Customers can review plans and request the membership that fits their home.", icon: Sparkles },
];

export default async function PortalPage() {
  const portalAuthState = await getPortalAuthState();

  if (portalAuthState.isLoggedIn) {
    redirect("/dashboard");
  }

  return (
    <SiteChrome>
      <main>
        <PageHero
          eyebrow="Customer portal"
          title="A complete home base for every TechBuddy customer."
          description="Customers can manage their account, request help, view invoices, track services, review warranty updates, upload photos, and explore memberships from one polished portal."
        >
          <PortalLandingActions initialAuthState={portalAuthState} />
        </PageHero>

        <section className="px-5 py-20 sm:px-8 lg:px-10">
          <div className="mx-auto max-w-7xl">
            <div className="max-w-3xl">
              <p className="text-sm font-bold text-[#5372FE]">What customers can do</p>
              <h2 className="font-display mt-3 text-5xl font-semibold leading-tight text-black">The portal is where support stays organized.</h2>
            </div>
            <div className="mt-10 grid gap-5 md:grid-cols-2 lg:grid-cols-3">
              {portalActions.map((feature) => (
                <article key={feature.title} className="rounded-[2rem] border border-black/8 bg-white p-6 shadow-sm shadow-black/[0.03]">
                  <feature.icon className="text-[#5372FE]" size={30} aria-hidden="true" />
                  <h2 className="mt-8 text-xl font-bold text-black">{feature.title}</h2>
                  <p className="mt-3 text-sm leading-6 text-black/54">{feature.description}</p>
                </article>
              ))}
            </div>
          </div>
        </section>

        <section className="bg-[#F4F6FF] px-5 py-20 sm:px-8 lg:px-10">
          <div className="mx-auto max-w-7xl">
            <div className="grid gap-8 lg:grid-cols-[0.75fr_1.25fr] lg:items-end">
              <div>
                <p className="text-sm font-bold text-[#5372FE]">Memberships</p>
                <h2 className="font-display mt-3 text-5xl font-semibold leading-tight text-black">Support plans regular people understand.</h2>
                <p className="mt-5 text-lg leading-8 text-black/58">
                  These plans give customers faster help, included remote sessions, member pricing, and a clear support path before something breaks.
                </p>
              </div>
              <div className="grid gap-4 md:grid-cols-3">
                {membershipPlans.map((plan) => (
                  <article key={plan.name} className="rounded-[2rem] bg-white p-6 shadow-sm shadow-black/[0.03]">
                    <plan.icon className="text-[#5372FE]" size={24} aria-hidden="true" />
                    <h3 className="mt-5 text-2xl font-bold text-black">{plan.name}</h3>
                    <p className="mt-2 text-3xl font-bold text-[#5372FE]">{plan.priceLabel}</p>
                    <p className="mt-4 text-sm leading-6 text-black/56">{plan.description}</p>
                    <p className="mt-4 text-sm font-semibold leading-6 text-black/66">{plan.bestFor}</p>
                  </article>
                ))}
              </div>
            </div>
          </div>
        </section>

        <section className="px-5 py-20 sm:px-8 lg:px-10">
          <div className="mx-auto grid max-w-7xl gap-5 md:grid-cols-2 lg:grid-cols-4">
            {portalFeatures.map((feature) => (
              <article key={feature.title} className="rounded-[2rem] border border-black/8 bg-white p-6 shadow-sm shadow-black/[0.03]">
                <feature.icon className="text-[#5372FE]" size={30} aria-hidden="true" />
                <h2 className="mt-8 text-xl font-bold text-black">{feature.title}</h2>
                <p className="mt-3 text-sm leading-6 text-black/54">{feature.description}</p>
              </article>
            ))}
          </div>
        </section>

        <section className="bg-white px-5 py-20 sm:px-8 lg:px-10">
          <div className="mx-auto grid max-w-7xl gap-10 lg:grid-cols-[0.9fr_1.1fr] lg:items-center">
            <div>
              <p className="text-sm font-bold text-[#5372FE]">Workflow</p>
              <h2 className="font-display mt-3 text-5xl font-semibold leading-tight text-black">From customer request to paid invoice.</h2>
              <p className="mt-5 text-lg leading-8 text-black/58">
                The portal is the beginning of a bigger system: tickets, photos, status, customer records, and invoices working together.
              </p>
            </div>
            <div className="rounded-[2.2rem] bg-white p-7 shadow-sm shadow-black/[0.03]">
              {["Customer creates account", "Customer opens ticket", "Customer uploads photos", "Victor creates invoice", "Customer views status"].map((item) => (
                <div key={item} className="flex items-center gap-4 border-b border-black/8 py-4 first:pt-0 last:border-0 last:pb-0">
                  <CheckCircle2 className="text-[#5372FE]" size={20} aria-hidden="true" />
                  <span className="font-bold text-black/70">{item}</span>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="px-5 py-20 sm:px-8 lg:px-10">
          <div className="mx-auto rounded-[2.4rem] bg-black p-8 text-white sm:p-12 lg:max-w-7xl">
            <div className="grid gap-8 lg:grid-cols-[1fr_auto] lg:items-center">
              <div>
                <p className="text-sm font-bold text-[#6B85FE]">Start here</p>
                <h2 className="font-display mt-3 max-w-3xl text-5xl font-semibold leading-tight">Give customers a polished first step.</h2>
              </div>
              <PortalCtaButton signedOutLabel="Open portal" initialAuthState={portalAuthState} />
            </div>
          </div>
        </section>
      </main>
    </SiteChrome>
  );
}
