'use client'

export const dynamic = 'force-dynamic'

import { useRouter } from 'next/navigation'
import { useEffect, useMemo, useState } from 'react'
import { ArrowRight, CheckCircle2 } from 'lucide-react'
import { CustomerPortalShell } from '@/components/customer-portal-shell'
import { getMembershipExperience, membershipExperiences } from '@/lib/membership-experience'
import { membershipPlans, type MembershipPlan } from '@/lib/membership-plans'
import { createClient } from '@/lib/supabase/client'
import type { Database } from '@/lib/supabase/types'

type DatabasePlan = Database['public']['Tables']['membership_plans']['Row']
type CustomerMembership = Database['public']['Tables']['customer_memberships']['Row']

export default function MembershipsPage() {
  const supabase = useMemo(() => createClient(), [])
  const router = useRouter()
  const [userId, setUserId] = useState('')
  const [databasePlans, setDatabasePlans] = useState<DatabasePlan[]>([])
  const [memberships, setMemberships] = useState<CustomerMembership[]>([])
  const [notice, setNotice] = useState('')
  const [isLoading, setIsLoading] = useState(true)
  const [savingPlan, setSavingPlan] = useState('')

  const loadMemberships = async () => {
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      router.push('/login')
      return
    }

    setUserId(user.id)

    const [{ data: planData, error: planError }, { data: membershipData, error: membershipError }] = await Promise.all([
      supabase.from('membership_plans').select('*').eq('is_active', true).order('priority_level', { ascending: true }),
      supabase.from('customer_memberships').select('*').eq('customer_id', user.id).order('created_at', { ascending: false }),
    ])

    if (planError || membershipError) {
      setNotice(planError?.message ?? membershipError?.message ?? '')
    }

    setDatabasePlans(planData ?? [])
    setMemberships(membershipData ?? [])
    setIsLoading(false)
  }

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    void loadMemberships()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const requestPlan = async (plan: MembershipPlan) => {
    if (!userId) return
    setSavingPlan(plan.slug)
    setNotice('')
    const databasePlan = databasePlans.find((item) => item.slug === plan.slug)

    const { error } = await supabase.from('customer_memberships').insert({
      customer_id: userId,
      plan_id: databasePlan?.id ?? null,
      plan_name: plan.name,
      status: 'interested',
      notes: `Customer requested information about ${plan.name}.`,
    })

    if (error) {
      setNotice(error.message)
    } else {
      setNotice(`${plan.name} was added to your portal. Victor can follow up and activate it.`)
      await loadMemberships()
    }

    setSavingPlan('')
  }

  const current = memberships[0]
  const currentPlan = current ? membershipPlans.find((plan) => plan.name === current.plan_name) : undefined
  const currentExperience = getMembershipExperience(current?.plan_name, current?.status)

  return (
    <CustomerPortalShell title="Memberships">
      <section className="mb-8 grid gap-5 lg:grid-cols-[1fr_0.72fr]">
        <div className="rounded-[2rem] border border-white/10 bg-[linear-gradient(135deg,rgba(83,114,254,0.2),rgba(255,255,255,0.055))] p-6 shadow-2xl shadow-black/20">
          <p className="text-sm font-bold text-[#6B85FE]">TechBuddy memberships</p>
          <h2 className="mt-2 max-w-3xl text-4xl font-bold tracking-tight">Choose the support level that gives your home real backup.</h2>
          <p className="mt-3 max-w-3xl text-sm leading-6 text-white/58">
            Included remote support, priority scheduling, member pricing, and clearer next steps are all available from inside your account.
          </p>
        </div>

        <div className="rounded-[2rem] border border-white/10 bg-white/[0.06] p-6 shadow-2xl shadow-black/20">
          <p className="text-sm font-semibold text-white/48">Current membership</p>
          <p className="mt-2 text-2xl font-bold">{current ? current.plan_name : 'No membership selected yet'}</p>
          <p className="mt-2 text-sm font-semibold capitalize text-[#b9c4ff]">{current ? current.status : 'Choose a plan below'}</p>
          {currentPlan ? <p className="mt-3 text-sm leading-6 text-white/54">{currentPlan.priceLabel} · {currentPlan.description}</p> : null}
          <div className="mt-4 rounded-2xl bg-black/26 px-4 py-3">
            <p className="text-xs font-black uppercase tracking-[0.12em] text-[#9fb0ff]">{currentExperience.badge}</p>
            <p className="mt-2 text-sm leading-6 text-white/66">{currentExperience.portalMessage}</p>
          </div>
          {current?.renewal_date ? <p className="mt-3 text-sm text-white/52">Renews {formatDate(current.renewal_date)}</p> : null}
        </div>
      </section>

      {notice ? <p className="mb-5 rounded-2xl border border-[#5372FE]/20 bg-[#5372FE]/10 px-4 py-3 text-sm text-blue-100">{notice}</p> : null}

      {isLoading ? (
        <div className="grid gap-4 lg:grid-cols-3">
          {[1, 2, 3].map((item) => <div key={item} className="h-96 animate-pulse rounded-[2rem] bg-white/[0.06]" />)}
        </div>
      ) : (
        <div className="grid gap-4 lg:grid-cols-3">
          {membershipPlans.map((plan) => {
            const experience = membershipExperiences[plan.slug as keyof typeof membershipExperiences]

            return (
              <article key={plan.slug} className={`flex min-h-[32rem] flex-col rounded-[2rem] border p-6 shadow-2xl shadow-black/20 ${plan.badge ? 'border-[#6B85FE]/40 bg-[#5372FE]/12' : 'border-white/10 bg-white/[0.06]'}`}>
                <div className="flex items-start justify-between gap-4">
                  <plan.icon className="text-[#6B85FE]" size={26} aria-hidden="true" />
                  {plan.badge ? <span className="rounded-full bg-[#6B85FE] px-3 py-1 text-xs font-black uppercase text-white">{plan.badge}</span> : null}
                </div>
                <h2 className="mt-5 text-3xl font-bold tracking-tight">{plan.name}</h2>
                <p className="mt-2 text-4xl font-bold text-[#b9c4ff]">{plan.priceLabel}</p>
                <p className="mt-4 text-sm leading-6 text-white/58">{plan.description}</p>
                <div className="mt-5 rounded-2xl bg-black/26 px-4 py-3">
                  <p className="text-xs font-black uppercase tracking-[0.12em] text-[#9fb0ff]">Portal experience</p>
                  <p className="mt-2 text-sm leading-6 text-white/68">{experience.portalMessage}</p>
                  <div className="mt-3 grid gap-2 text-xs font-bold text-white/62">
                    <span>{experience.responseLabel}</span>
                    <span>{experience.includedSessions}</span>
                    <span>{experience.scheduling}</span>
                  </div>
                </div>
                <div className="mt-5 rounded-2xl bg-black/26 px-4 py-3">
                  <p className="text-xs font-black uppercase tracking-[0.12em] text-[#9fb0ff]">Best for</p>
                  <p className="mt-2 text-sm leading-6 text-white/68">{plan.bestFor}</p>
                </div>
                <div className="mt-6 grid gap-3">
                  {plan.features.map((feature) => (
                    <div key={feature} className="flex gap-3 rounded-2xl bg-black/30 px-4 py-3 text-sm text-white/72">
                      <CheckCircle2 className="mt-0.5 shrink-0 text-[#6B85FE]" size={17} aria-hidden="true" />
                      {feature}
                    </div>
                  ))}
                </div>
                <button onClick={() => requestPlan(plan)} disabled={savingPlan === plan.slug} className="mt-auto inline-flex items-center justify-center gap-2 rounded-full bg-white px-5 py-3 text-sm font-bold text-black transition hover:bg-blue-50 disabled:cursor-not-allowed disabled:opacity-60">
                  {savingPlan === plan.slug ? 'Adding...' : 'Request this membership'}
                  <ArrowRight size={16} aria-hidden="true" />
                </button>
              </article>
            )
          })}
        </div>
      )}
    </CustomerPortalShell>
  )
}

function formatDate(value: string) {
  return new Intl.DateTimeFormat('en-US', {
    month: 'long',
    day: 'numeric',
    year: 'numeric',
  }).format(new Date(value))
}
