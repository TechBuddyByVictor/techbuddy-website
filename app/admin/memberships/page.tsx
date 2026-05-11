'use client'

export const dynamic = 'force-dynamic'

import Link from 'next/link'
import type { Route } from 'next'
import { useRouter } from 'next/navigation'
import { useEffect, useMemo, useState } from 'react'
import { ArrowRight, Save, Sparkles } from 'lucide-react'
import { AdminShell } from '@/components/admin-shell'
import { membershipPlans } from '@/lib/membership-plans'
import { createClient } from '@/lib/supabase/client'
import type { Database } from '@/lib/supabase/types'

type Profile = Database['public']['Tables']['profiles']['Row']
type Membership = Database['public']['Tables']['customer_memberships']['Row']

const statuses = ['interested', 'active', 'paused', 'cancelled']

export default function AdminMembershipsPage() {
  const router = useRouter()
  const supabase = useMemo(() => createClient(), [])
  const [customers, setCustomers] = useState<Profile[]>([])
  const [memberships, setMemberships] = useState<Membership[]>([])
  const [notice, setNotice] = useState('')
  const [savingId, setSavingId] = useState('')
  const [isLoading, setIsLoading] = useState(true)

  const loadMemberships = async () => {
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      router.push('/login?redirectTo=/admin/memberships')
      return
    }

    const [{ data: customerData, error: customerError }, { data: membershipData, error: membershipError }] = await Promise.all([
      supabase.from('profiles').select('*').eq('role', 'customer').order('full_name', { ascending: true }),
      supabase.from('customer_memberships').select('*').order('created_at', { ascending: false }),
    ])

    const error = customerError ?? membershipError
    if (error) {
      setNotice(error.message)
    }

    setCustomers(customerData ?? [])
    setMemberships(membershipData ?? [])
    setIsLoading(false)
  }

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    void loadMemberships()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const customerById = new Map(customers.map((customer) => [customer.id, customer]))

  const updateMembership = async (membership: Membership, field: 'plan_name' | 'status', value: string) => {
    setSavingId(membership.id)
    setNotice('')

    const update = field === 'plan_name' ? { plan_name: value } : { status: value }
    const { error } = await supabase.from('customer_memberships').update(update).eq('id', membership.id)

    if (error) {
      setNotice(error.message)
    } else {
      setMemberships((current) => current.map((item) => item.id === membership.id ? { ...item, [field]: value } : item))
      setNotice('Membership updated.')
    }

    setSavingId('')
  }

  return (
    <AdminShell title="Membership management" description="Change customer membership plans and statuses from one admin screen.">
      {notice ? <p className="mb-5 rounded-2xl border border-[#6B85FE]/20 bg-[#5372FE]/10 px-4 py-3 text-sm text-blue-100">{notice}</p> : null}

      <div className="mb-8 grid gap-4 md:grid-cols-3">
        {membershipPlans.map((plan) => (
          <article key={plan.slug} className="rounded-[1.75rem] border border-white/10 bg-white/[0.06] p-5">
            <plan.icon className="text-[#6B85FE]" size={24} aria-hidden="true" />
            <h2 className="mt-5 text-2xl font-bold">{plan.name}</h2>
            <p className="mt-1 text-xl font-bold text-[#b9c4ff]">{plan.priceLabel}</p>
            <p className="mt-3 text-sm leading-6 text-white/54">{plan.description}</p>
          </article>
        ))}
      </div>

      <div className="overflow-hidden rounded-[2rem] border border-white/10 bg-white/[0.055] shadow-2xl shadow-black/20">
        <div className="hidden grid-cols-[1fr_0.9fr_0.7fr_0.35fr] gap-4 border-b border-white/10 bg-black/40 px-5 py-4 text-xs font-bold uppercase tracking-[0.14em] text-white/40 lg:grid">
          <span>Customer</span>
          <span>Plan</span>
          <span>Status</span>
          <span className="text-right">Open</span>
        </div>

        {isLoading ? (
          <div className="grid gap-3 p-5">
            {[1, 2, 3].map((item) => <div key={item} className="h-24 animate-pulse rounded-2xl bg-white/[0.06]" />)}
          </div>
        ) : memberships.length === 0 ? (
          <div className="p-10 text-center">
            <Sparkles className="mx-auto text-[#6B85FE]" size={34} aria-hidden="true" />
            <h2 className="mt-4 text-2xl font-bold">No membership requests yet</h2>
            <p className="mt-3 text-sm text-white/54">Customer membership requests will appear here.</p>
          </div>
        ) : (
          <div className="divide-y divide-white/10">
            {memberships.map((membership) => {
              const customer = customerById.get(membership.customer_id)

              return (
                <article key={membership.id} className="grid gap-4 p-5 transition hover:bg-white/[0.035] lg:grid-cols-[1fr_0.9fr_0.7fr_0.35fr] lg:items-center">
                  <div>
                    <p className="font-bold">{customer?.full_name ?? 'Unknown customer'}</p>
                    <p className="mt-1 break-all text-sm text-white/46">{customer?.email ?? membership.customer_id}</p>
                  </div>
                  <select value={membership.plan_name} onChange={(event) => updateMembership(membership, 'plan_name', event.target.value)} className="rounded-2xl border border-white/10 bg-black/40 px-4 py-3 text-sm font-bold text-white outline-none">
                    {membershipPlans.map((plan) => <option key={plan.slug} value={plan.name}>{plan.name}</option>)}
                  </select>
                  <select value={membership.status} onChange={(event) => updateMembership(membership, 'status', event.target.value)} className="rounded-2xl border border-white/10 bg-black/40 px-4 py-3 text-sm font-bold capitalize text-white outline-none">
                    {statuses.map((status) => <option key={status} value={status}>{status}</option>)}
                  </select>
                  <Link href={`/admin/customers/${membership.customer_id}` as Route} className="inline-flex items-center justify-center gap-2 rounded-full bg-white px-4 py-2 text-sm font-bold text-black lg:justify-self-end">
                    {savingId === membership.id ? <Save size={15} aria-hidden="true" /> : <ArrowRight size={15} aria-hidden="true" />}
                    Open
                  </Link>
                </article>
              )
            })}
          </div>
        )}
      </div>
    </AdminShell>
  )
}
