'use client'

export const dynamic = 'force-dynamic'

import Link from 'next/link'
import type { Route } from 'next'
import { useRouter } from 'next/navigation'
import { useEffect, useMemo, useState } from 'react'
import { ArrowLeft, Sparkles } from 'lucide-react'
import { CustomerPortalShell } from '@/components/customer-portal-shell'
import { getMembershipExperience } from '@/lib/membership-experience'
import { createClient } from '@/lib/supabase/client'
import type { Database } from '@/lib/supabase/types'

const categories = ['Wi-Fi', 'Computer', 'Printer', 'Smart Home', 'Security', 'Other']
const urgencies = ['low', 'normal', 'high', 'urgent']
type CustomerMembership = Database['public']['Tables']['customer_memberships']['Row']

export default function NewTicketPage() {
  const [title, setTitle] = useState('')
  const [category, setCategory] = useState(categories[0])
  const [urgency, setUrgency] = useState('normal')
  const [description, setDescription] = useState('')
  const [membership, setMembership] = useState<CustomerMembership | null>(null)
  const [notice, setNotice] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const router = useRouter()
  const supabase = useMemo(() => createClient(), [])
  const experience = getMembershipExperience(membership?.plan_name, membership?.status)

  useEffect(() => {
    const loadMembership = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser()

      if (!user) {
        router.push('/login')
        return
      }

      const { data } = await supabase
        .from('customer_memberships')
        .select('*')
        .eq('customer_id', user.id)
        .order('created_at', { ascending: false })
        .limit(1)

      const activeMembership = data?.[0] ?? null
      setMembership(activeMembership)

      const activeExperience = getMembershipExperience(activeMembership?.plan_name, activeMembership?.status)
      if (activeExperience.tier === 'premium') {
        setUrgency('high')
      }
    }

    void loadMembership()
  }, [router, supabase])

  const createTicket = async (event: React.FormEvent) => {
    event.preventDefault()
    setNotice('')
    setIsSubmitting(true)

    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      router.push('/login')
      return
    }

    const { data: profile } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', user.id)
      .single()

    const { data, error } = await supabase
      .from('support_tickets')
      .insert({
        customer_id: user.id,
        customer_name: profile?.full_name ?? user.user_metadata?.full_name ?? null,
        customer_email: profile?.email ?? user.email ?? null,
        customer_phone: profile?.phone ?? null,
        title,
        category,
        urgency,
        description,
      })
      .select('*')
      .single()

    if (error || !data) {
      setNotice(error?.message ?? 'Could not create ticket')
      setIsSubmitting(false)
      return
    }

    await supabase.from('ticket_messages').insert({
      ticket_id: data.id,
      sender_id: user.id,
      sender_role: 'customer',
      message: description,
    })

    router.push(`/dashboard/tickets/${data.id}` as Route)
    router.refresh()
  }

  return (
    <CustomerPortalShell title="Submit a new ticket">
      <section className="mx-auto max-w-3xl">
        <Link href="/dashboard" className="mb-5 inline-flex items-center gap-2 text-sm font-bold text-[#5372FE] transition hover:text-black">
          <ArrowLeft size={16} aria-hidden="true" />
          Back to your portal
        </Link>
        <form onSubmit={createTicket} className="rounded-[2rem] border border-black/8 bg-white p-6 shadow-[0_24px_70px_rgba(20,28,60,0.08)]">
          <p className="text-sm font-bold text-[#5372FE]">Support request</p>
          <h2 className="mt-2 text-3xl font-bold tracking-tight text-black">Tell Victor what is happening.</h2>
          <p className="mt-3 text-sm leading-6 text-black/56">This ticket stays inside your TechBuddy account, alongside your messages, photos, services, and invoices.</p>
          <div className="mt-5 rounded-2xl border border-[#5372FE]/18 bg-[#F4F6FF] p-4">
            <p className="flex items-center gap-2 text-sm font-bold text-[#3D60FE]">
              <Sparkles size={16} aria-hidden="true" />
              {experience.badge}
            </p>
            <p className="mt-2 text-sm leading-6 text-black/60">{experience.responseLabel}. {experience.scheduling}. {experience.includedSessions}.</p>
          </div>
          <div className="mt-6 grid gap-4">
            <input value={title} onChange={(event) => setTitle(event.target.value)} required className="rounded-2xl border border-black/10 bg-[#FAFBFF] px-4 py-3 text-black outline-none placeholder:text-black/30 focus:border-[#5372FE]" placeholder="Ticket title" />
            <div className="grid gap-4 sm:grid-cols-2">
              <select value={category} onChange={(event) => setCategory(event.target.value)} className="rounded-2xl border border-black/10 bg-[#FAFBFF] px-4 py-3 text-black outline-none focus:border-[#5372FE]">
                {categories.map((item) => <option key={item}>{item}</option>)}
              </select>
              <select value={urgency} onChange={(event) => setUrgency(event.target.value)} className="rounded-2xl border border-black/10 bg-[#FAFBFF] px-4 py-3 text-black capitalize outline-none focus:border-[#5372FE]">
                {urgencies.map((item) => <option key={item} value={item}>{item}</option>)}
              </select>
            </div>
            <textarea value={description} onChange={(event) => setDescription(event.target.value)} required className="min-h-36 rounded-2xl border border-black/10 bg-[#FAFBFF] px-4 py-3 text-black outline-none placeholder:text-black/30 focus:border-[#5372FE]" placeholder="Describe the issue, what you've tried, and what device is affected." />
            {notice ? <p className="rounded-2xl border border-red-400/20 bg-red-500/10 px-4 py-3 text-sm text-red-200">{notice}</p> : null}
            <button disabled={isSubmitting} className="rounded-full bg-[linear-gradient(135deg,#3D60FE,#6B85FE)] px-5 py-3 text-sm font-bold text-white disabled:cursor-not-allowed disabled:opacity-60">
              {isSubmitting ? 'Creating ticket...' : 'Create ticket'}
            </button>
          </div>
        </form>
      </section>
    </CustomerPortalShell>
  )
}
