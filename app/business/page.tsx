import Link from "next/link";
import { ArrowRight, Clock3, Mail, Phone } from "lucide-react";
import { BusinessShell } from "@/components/business-shell";
import { businessInfo } from "@/lib/business-info";

export default function BusinessPage() {
  return (
    <BusinessShell>
      <main>
        <section className="tech-grid-bg min-h-[calc(100vh-88px)] bg-[linear-gradient(180deg,#F4F6FF_0%,#ffffff_88%)] px-5 py-16 sm:px-8 lg:px-10">
          <div className="mx-auto grid max-w-5xl gap-8">
            <div className="animate-reveal">
              <p className="text-sm font-bold text-[#5372FE]">TechBuddy Business</p>
              <h1 className="font-display mt-4 max-w-4xl text-5xl font-semibold leading-[0.98] text-black sm:text-6xl lg:text-7xl">
                Business support is available by request only.
              </h1>
              <p className="mt-6 max-w-3xl text-lg leading-8 text-black/58">
                Full business plans are not available yet. If a local business needs help, TechBuddy can review the request first and confirm whether it is something I can support.
              </p>
            </div>

            <div className="animate-reveal-delay-1 rounded-[2rem] border border-black/8 bg-white p-6 shadow-[0_24px_70px_rgba(20,28,60,0.1)] sm:p-8">
              <div className="flex items-start gap-4">
                <span className="grid h-12 w-12 shrink-0 place-items-center rounded-2xl bg-[#5372FE]/10 text-[#5372FE]">
                  <Clock3 size={24} aria-hidden="true" />
                </span>
                <div>
                  <h2 className="text-2xl font-bold text-black">Coming soon</h2>
                  <p className="mt-3 text-sm leading-6 text-black/56">
                    Business services, monthly plans, and service menus are still being worked out. Right now, requests are handled one at a time so expectations stay clear.
                  </p>
                </div>
              </div>

              <div className="mt-7 grid gap-3 sm:grid-cols-2">
                <a href={businessInfo.phoneHref} className="interactive-lift inline-flex items-center justify-center gap-2 rounded-full bg-black px-5 py-3 text-sm font-bold text-white transition hover:bg-[#2a2a2a]">
                  <Phone size={16} aria-hidden="true" />
                  {businessInfo.phone}
                </a>
                <a href={businessInfo.emailHref} className="interactive-lift inline-flex items-center justify-center gap-2 rounded-full border border-black/10 bg-white px-5 py-3 text-sm font-bold text-black transition hover:bg-black/[0.025]">
                  <Mail size={16} aria-hidden="true" />
                  Email a request
                </a>
              </div>
            </div>

            <Link href="/" className="inline-flex w-fit items-center gap-2 text-sm font-bold text-black/56 transition hover:text-[#3D60FE]">
              Back to personal support
              <ArrowRight size={15} aria-hidden="true" />
            </Link>
          </div>
        </section>
      </main>
    </BusinessShell>
  );
}
