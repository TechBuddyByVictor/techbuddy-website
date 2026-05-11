'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useEffect, useMemo, useState } from 'react'
import { ArrowRight, CheckCircle2, X } from 'lucide-react'
import { getMembershipExperience } from '@/lib/membership-experience'
import { membershipPlans } from '@/lib/membership-plans'
import { createClient } from '@/lib/supabase/client'
import type { Database } from '@/lib/supabase/types'

type CustomerMembership = Database['public']['Tables']['customer_memberships']['Row']

export function MembershipPromoPopup() {
  const pathname = usePathname()
  const supabase = useMemo(() => createClient(), [])
  const [membership, setMembership] = useState<CustomerMembership | null>(null)
  const [isCheckingMembership, setIsCheckingMembership] = useState(true)
  const popularPlan = membershipPlans.find((plan) => plan.slug === 'plus') ?? membershipPlans[1]
  const memberExperience = getMembershipExperience(membership?.plan_name, membership?.status)
  const isActiveMember = Boolean(membership?.status === 'active' && memberExperience.tier !== 'none')

  useEffect(() => {
    const loadMembership = async () => {
      const {
        data: { user },
        error: userError,
      } = await supabase.auth.getUser()

      if (userError) {
        console.error('Membership popup auth check failed', userError)
      }

      if (!user) {
        setIsCheckingMembership(false)
        return
      }

      const { data, error } = await supabase
        .from('customer_memberships')
        .select('*')
        .eq('customer_id', user.id)
        .order('created_at', { ascending: false })
        .limit(1)

      if (error) {
        console.error('Membership popup lookup failed', error)
      }

      setMembership(data?.[0] ?? null)
      setIsCheckingMembership(false)
    }

    void loadMembership()
  }, [supabase])

  if (pathname === '/memberships' || isCheckingMembership) return null

  return (
    <>
      <div className="membership-promo-shell pointer-events-none fixed inset-x-0 bottom-0 z-[90] px-4 pb-4 sm:bottom-6 sm:px-6 lg:left-auto lg:right-6 lg:w-[27rem] lg:px-0">
        <input id="membership-promo-dismiss" type="checkbox" className="membership-dismiss-toggle" />
        <aside className="membership-pop pointer-events-auto relative overflow-hidden rounded-[1.5rem] border border-black/8 bg-white p-5 shadow-[0_26px_80px_rgba(20,28,60,0.22)]">
          <label
            htmlFor="membership-promo-dismiss"
            role="button"
            tabIndex={0}
            className="absolute right-3 top-3 grid h-8 w-8 cursor-pointer place-items-center rounded-full bg-black/[0.04] text-black/46 transition hover:bg-black/[0.08] hover:text-black"
            aria-label="Close membership promotion"
          >
            <X size={16} aria-hidden="true" />
          </label>

          {isActiveMember ? (
            <>
              <p className="text-xs font-black uppercase tracking-[0.16em] text-[#5372FE]">{memberExperience.badge}</p>
              <h2 className="mt-3 pr-8 text-2xl font-bold tracking-tight text-black">Thanks for being a TechBuddy member.</h2>
              <p className="mt-2 text-sm leading-6 text-black/56">
                Your {membership?.plan_name} benefits are active. {memberExperience.portalMessage}
              </p>

              <div className="mt-4 rounded-2xl bg-[#F4F6FF] p-4">
                <p className="text-sm font-bold text-black">Your member experience</p>
                <div className="mt-3 grid gap-2">
                  {[memberExperience.responseLabel, memberExperience.includedSessions, memberExperience.memberPricing].map((feature) => (
                    <div key={feature} className="flex gap-2 text-xs font-bold text-black/62">
                      <CheckCircle2 className="mt-0.5 shrink-0 text-[#5372FE]" size={15} aria-hidden="true" />
                      <span>{feature}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="mt-5 flex gap-2">
                <Link
                  href="/dashboard"
                  className="interactive-lift inline-flex flex-1 items-center justify-center gap-2 rounded-full bg-black px-4 py-3 text-sm font-bold text-white transition hover:bg-[#2a2a2a]"
                >
                  Open portal
                  <ArrowRight size={15} aria-hidden="true" />
                </Link>
                <Link
                  href="/dashboard/new-ticket"
                  className="rounded-full border border-black/10 px-4 py-3 text-sm font-bold text-black/58 transition hover:border-black/18 hover:bg-black/[0.025] hover:text-black"
                >
                  Get help
                </Link>
              </div>
            </>
          ) : (
            <>
              <p className="text-xs font-black uppercase tracking-[0.16em] text-[#5372FE]">TechBuddy memberships</p>
              <h2 className="mt-3 pr-8 text-2xl font-bold tracking-tight text-black">Need faster support next time?</h2>
              <p className="mt-2 text-sm leading-6 text-black/56">
                {popularPlan.name} gives you {popularPlan.features[0].toLowerCase()}, faster response times, and better member discounts.
              </p>

              <div className="mt-4 rounded-2xl bg-[#F4F6FF] p-4">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="text-lg font-bold text-black">{popularPlan.name}</p>
                    <p className="mt-1 text-2xl font-bold text-[#5372FE]">{popularPlan.priceLabel}</p>
                  </div>
                  <span className="rounded-full bg-[#5372FE] px-3 py-1 text-xs font-black uppercase text-white">
                    {popularPlan.badge}
                  </span>
                </div>
                <div className="mt-3 grid gap-2">
                  {popularPlan.features.slice(0, 3).map((feature) => (
                    <div key={feature} className="flex gap-2 text-xs font-bold text-black/62">
                      <CheckCircle2 className="mt-0.5 shrink-0 text-[#5372FE]" size={15} aria-hidden="true" />
                      <span>{feature}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="mt-5 flex gap-2">
                <Link
                  href="/memberships"
                  className="interactive-lift inline-flex flex-1 items-center justify-center gap-2 rounded-full bg-black px-4 py-3 text-sm font-bold text-white transition hover:bg-[#2a2a2a]"
                >
                  View memberships
                  <ArrowRight size={15} aria-hidden="true" />
                </Link>
                <label
                  htmlFor="membership-promo-dismiss"
                  role="button"
                  tabIndex={0}
                  className="cursor-pointer rounded-full border border-black/10 px-4 py-3 text-sm font-bold text-black/58 transition hover:border-black/18 hover:bg-black/[0.025] hover:text-black"
                >
                  Later
                </label>
              </div>
            </>
          )}
        </aside>
      </div>
    </>
  )
}
