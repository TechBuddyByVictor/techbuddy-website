import Link from 'next/link'
import type { Route } from 'next'
import { ArrowRight, CheckCircle2, Sparkles } from 'lucide-react'
import { membershipExperiences, type MembershipTier } from '@/lib/membership-experience'
import { membershipPlans } from '@/lib/membership-plans'

const activeTiers = ['basic', 'plus', 'premium'] as const

const experienceStyles: Record<MembershipTier, { panel: string; accent: string; chip: string; surface: string }> = {
  none: {
    panel: 'border-black/8 bg-white',
    accent: 'text-[#5372FE]',
    chip: 'bg-[#F4F6FF] text-[#3D60FE]',
    surface: 'bg-[#FAFBFF]',
  },
  basic: {
    panel: 'border-emerald-500/18 bg-[linear-gradient(135deg,#F3FFF8,#ffffff)]',
    accent: 'text-emerald-600',
    chip: 'bg-emerald-500/10 text-emerald-700',
    surface: 'bg-emerald-50',
  },
  plus: {
    panel: 'border-[#5372FE]/24 bg-[linear-gradient(135deg,#F4F6FF,#ffffff)]',
    accent: 'text-[#5372FE]',
    chip: 'bg-[#5372FE]/10 text-[#3D60FE]',
    surface: 'bg-[#F4F6FF]',
  },
  premium: {
    panel: 'border-black/12 bg-[linear-gradient(135deg,#111111,#353B55)] text-white',
    accent: 'text-[#BFD0FF]',
    chip: 'bg-white/12 text-white',
    surface: 'bg-white/10',
  },
}

export function MembershipWebsiteExperienceGrid() {
  return (
    <section className="px-5 py-20 sm:px-8 lg:px-10">
      <div className="mx-auto max-w-7xl">
        <div className="grid gap-8 lg:grid-cols-[0.74fr_1.26fr] lg:items-end">
          <div>
            <p className="text-sm font-bold text-[#5372FE]">Website experiences</p>
            <h2 className="font-display mt-3 text-5xl font-semibold leading-tight text-black">
              Each membership changes what the website brings forward.
            </h2>
            <p className="mt-5 text-lg leading-8 text-black/58">
              Members do not just buy a discount. Their site and portal experience shifts toward the support path that matches their plan.
            </p>
          </div>
          <div className="grid gap-4 md:grid-cols-3">
            {activeTiers.map((tier) => {
              const experience = membershipExperiences[tier]
              const style = experienceStyles[tier]
              const plan = membershipPlans.find((item) => item.slug === tier)
              const Icon = plan?.icon ?? Sparkles

              return (
                <article key={tier} className={`flex min-h-[26rem] flex-col rounded-[2rem] border p-6 shadow-sm shadow-black/[0.04] ${style.panel}`}>
                  <div className="flex items-start justify-between gap-4">
                    <span className={`grid h-11 w-11 place-items-center rounded-2xl ${style.chip}`}>
                      <Icon size={22} aria-hidden="true" />
                    </span>
                    <span className={`rounded-full px-3 py-1 text-xs font-black uppercase ${style.chip}`}>
                      {plan?.priceLabel}
                    </span>
                  </div>
                  <p className={`mt-6 text-xs font-black uppercase tracking-[0.14em] ${style.accent}`}>{experience.websiteModeLabel}</p>
                  <h3 className="mt-2 text-2xl font-bold tracking-tight">{experience.websiteHeadline}</h3>
                  <p className={`mt-3 text-sm leading-6 ${tier === 'premium' ? 'text-white/66' : 'text-black/56'}`}>{experience.websiteMessage}</p>
                  <div className="mt-5 grid gap-2">
                    {experience.websiteHighlights.map((highlight) => (
                      <div key={highlight} className={`flex gap-2 rounded-2xl px-3 py-2 text-xs font-bold ${style.surface} ${tier === 'premium' ? 'text-white/72' : 'text-black/64'}`}>
                        <CheckCircle2 className={`mt-0.5 shrink-0 ${style.accent}`} size={15} aria-hidden="true" />
                        <span>{highlight}</span>
                      </div>
                    ))}
                  </div>
                  <Link
                    href={`/memberships#${tier}` as Route}
                    className={`mt-auto inline-flex items-center justify-center gap-2 rounded-full px-4 py-3 text-sm font-bold transition ${
                      tier === 'premium' ? 'bg-white text-black hover:bg-blue-50' : 'bg-black text-white hover:bg-[#2a2a2a]'
                    }`}
                  >
                    View {plan?.name}
                    <ArrowRight size={15} aria-hidden="true" />
                  </Link>
                </article>
              )
            })}
          </div>
        </div>
      </div>
    </section>
  )
}

export function MemberWebsiteExperienceStrip({
  tier,
  displayName,
}: {
  tier: MembershipTier
  displayName: string
}) {
  if (tier === 'none') return null

  const experience = membershipExperiences[tier]
  const style = experienceStyles[tier]
  const firstName = displayName.trim().split(/\s+/)[0] || 'there'
  const ctaHref = (tier === 'premium' ? '/dashboard/memberships' : '/dashboard/new-ticket') as Route

  return (
    <section className={`border-b px-5 py-3 sm:px-8 lg:px-10 ${tier === 'premium' ? 'border-white/10 bg-[#111111] text-white' : 'border-black/8 bg-white text-black'}`}>
      <div className="mx-auto flex max-w-7xl flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <div className="flex min-w-0 items-start gap-3">
          <span className={`mt-0.5 grid h-9 w-9 shrink-0 place-items-center rounded-full ${style.chip}`}>
            <Sparkles size={16} aria-hidden="true" />
          </span>
          <div>
            <p className={`text-xs font-black uppercase tracking-[0.14em] ${style.accent}`}>{experience.websiteModeLabel}</p>
            <p className={`mt-1 text-sm font-semibold leading-6 ${tier === 'premium' ? 'text-white/72' : 'text-black/62'}`}>
              Hi, {firstName}. {experience.websiteMessage}
            </p>
          </div>
        </div>
        <Link
          href={ctaHref}
          className={`inline-flex w-fit shrink-0 items-center justify-center gap-2 rounded-full px-4 py-2.5 text-sm font-bold transition ${
            tier === 'premium' ? 'bg-white text-black hover:bg-blue-50' : 'bg-black text-white hover:bg-[#2a2a2a]'
          }`}
        >
          {experience.websiteCtaLabel}
          <ArrowRight size={15} aria-hidden="true" />
        </Link>
      </div>
    </section>
  )
}
