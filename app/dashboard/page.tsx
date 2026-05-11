'use client'

export const dynamic = 'force-dynamic'

import Link from 'next/link'
import type { Route } from 'next'
import { useRouter } from 'next/navigation'
import { useEffect, useMemo, useState } from 'react'
import { ArrowRight, Clock3, CreditCard, Plus, ShieldCheck, Sparkles, UserRound } from 'lucide-react'
import { CustomerPortalShell } from '@/components/customer-portal-shell'
import { getMembershipExperience } from '@/lib/membership-experience'
import { createClient } from '@/lib/supabase/client'
import type { Database, TicketStatus } from '@/lib/supabase/types'

interface CustomerTicket {
  id: string
  title: string
  category: string
  status: TicketStatus
  created_at: string
  urgency: string
}

type CustomerMembership = Database['public']['Tables']['customer_memberships']['Row']

const statusLabels: Record<TicketStatus, string> = {
  open: 'Open',
  in_progress: 'In progress',
  waiting_on_customer: 'Waiting on customer',
  resolved: 'Resolved',
  closed: 'Closed',
}

const statusStyles: Record<TicketStatus, string> = {
  open: 'bg-blue-500/12 text-[#9fb0ff] ring-blue-400/25',
  in_progress: 'bg-cyan-500/12 text-cyan-200 ring-cyan-400/25',
  waiting_on_customer: 'bg-amber-500/12 text-amber-200 ring-amber-400/25',
  resolved: 'bg-emerald-500/12 text-emerald-200 ring-emerald-400/25',
  closed: 'bg-white/8 text-white/58 ring-white/15',
}

const urgencyStyles: Record<string, string> = {
  low: 'bg-white/8 text-white/60',
  normal: 'bg-[#5372FE]/12 text-[#b9c4ff]',
  high: 'bg-amber-500/12 text-amber-200',
  urgent: 'bg-red-500/12 text-red-200',
}

function formatDate(value: string) {
  return new Intl.DateTimeFormat('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  }).format(new Date(value))
}

export default function DashboardPage() {
  const [tickets, setTickets] = useState<CustomerTicket[]>([])
  const [serviceCount, setServiceCount] = useState(0)
  const [invoiceCount, setInvoiceCount] = useState(0)
  const [membershipStatus, setMembershipStatus] = useState('No active membership')
  const [currentMembership, setCurrentMembership] = useState<CustomerMembership | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [notice, setNotice] = useState('')
  const router = useRouter()
  const supabase = useMemo(() => createClient(), [])

  useEffect(() => {
    const loadTickets = async () => {
      setIsLoading(true)

      const {
        data: { user },
      } = await supabase.auth.getUser()

      if (!user) {
        router.push('/login')
        return
      }

      const [
        { data, error },
        { data: services },
        { data: invoices },
        { data: memberships },
      ] = await Promise.all([
        supabase.from('support_tickets').select('*').eq('customer_id', user.id).order('created_at', { ascending: false }),
        supabase.from('service_records').select('*').eq('customer_id', user.id).order('created_at', { ascending: false }),
        supabase.from('invoices').select('*').eq('customer_id', user.id).order('created_at', { ascending: false }),
        supabase.from('customer_memberships').select('*').eq('customer_id', user.id).order('created_at', { ascending: false }),
      ])

      if (error) {
        setNotice(error.message)
        setTickets([])
      } else {
        setTickets((data ?? []) as CustomerTicket[])
        setServiceCount(services?.length ?? 0)
        setInvoiceCount(invoices?.length ?? 0)
        setCurrentMembership(memberships?.[0] ?? null)
        setMembershipStatus(memberships?.[0]?.status ? `${memberships[0].plan_name} - ${memberships[0].status}` : 'No active membership')
      }

      setIsLoading(false)
    }

    void loadTickets()
  }, [router, supabase])

  const experience = getMembershipExperience(currentMembership?.plan_name, currentMembership?.status)

  return (
    <CustomerPortalShell title="Your TechBuddy home">
        <div className="mb-8 flex flex-col gap-4 rounded-[2rem] border border-white/10 bg-[linear-gradient(135deg,rgba(83,114,254,0.18),rgba(255,255,255,0.055))] p-6 shadow-2xl shadow-black/25 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-sm font-semibold text-white/58">Customer dashboard</p>
            <h2 className="mt-2 max-w-3xl text-4xl font-bold tracking-tight">{experience.headline}</h2>
            <p className="mt-3 max-w-2xl text-sm leading-6 text-white/58">
              {experience.dashboardMessage}
            </p>
          </div>
          <Link href="/dashboard/new-ticket" className="inline-flex w-fit items-center gap-2 rounded-full bg-[linear-gradient(135deg,#3D60FE,#6B85FE)] px-5 py-3 text-sm font-bold text-white shadow-[0_14px_34px_rgba(83,114,254,0.24)]">
            <Plus size={17} aria-hidden="true" />
            New ticket
          </Link>
        </div>

        <div className="mb-8 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          {[
            { href: '/dashboard/profile', label: 'Profile and address', value: 'Edit info', icon: UserRound },
            { href: '/dashboard/memberships', label: 'Membership', value: membershipStatus, icon: Sparkles },
            { href: '/dashboard/services', label: 'Services received', value: `${serviceCount} records`, icon: ShieldCheck },
            { href: '/dashboard/invoices', label: 'Invoices', value: `${invoiceCount} sent`, icon: CreditCard },
          ].map((item) => {
            const Icon = item.icon
            return (
              <Link key={item.href} href={item.href as Route} className="group rounded-[1.75rem] border border-white/10 bg-white/[0.06] p-5 transition hover:-translate-y-1 hover:border-[#5372FE]/45 hover:bg-white/[0.09]">
                <Icon className="text-[#6B85FE]" size={22} aria-hidden="true" />
                <p className="mt-5 text-sm font-semibold text-white/48">{item.label}</p>
                <p className="mt-1 text-xl font-bold text-white">{item.value}</p>
              </Link>
            )
          })}
        </div>

        <section className="mb-8 grid gap-4 lg:grid-cols-[1fr_0.78fr]">
          <div className="rounded-[2rem] border border-[#6B85FE]/24 bg-[linear-gradient(135deg,rgba(83,114,254,0.24),rgba(255,255,255,0.07))] p-6 shadow-2xl shadow-black/20">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
              <div>
                <p className="text-sm font-black uppercase tracking-[0.12em] text-[#b9c4ff]">{experience.badge}</p>
                <h2 className="mt-2 text-3xl font-bold tracking-tight">{experience.name} experience</h2>
                <p className="mt-3 max-w-2xl text-sm leading-6 text-white/62">{experience.supportStyle}</p>
              </div>
              <Link href={(experience.tier === 'none' ? '/dashboard/memberships' : '/dashboard/new-ticket') as Route} className="inline-flex w-fit items-center gap-2 rounded-full bg-white px-5 py-3 text-sm font-bold text-black">
                {experience.nextStep}
                <ArrowRight size={16} aria-hidden="true" />
              </Link>
            </div>
            <div className="mt-6 grid gap-3 sm:grid-cols-3">
              <ExperienceMetric label="Support speed" value={experience.responseLabel} />
              <ExperienceMetric label="Included support" value={experience.includedSessions} />
              <ExperienceMetric label="Member pricing" value={experience.memberPricing} />
            </div>
          </div>

          <div className="rounded-[2rem] border border-white/10 bg-white/[0.06] p-6 shadow-2xl shadow-black/20">
            <p className="text-sm font-bold text-[#b9c4ff]">What changes for you</p>
            <div className="mt-4 grid gap-3">
              {experience.portalPerks.map((perk) => (
                <div key={perk} className="flex gap-3 rounded-2xl bg-black/30 px-4 py-3 text-sm text-white/70">
                  <Sparkles className="mt-0.5 shrink-0 text-[#6B85FE]" size={16} aria-hidden="true" />
                  {perk}
                </div>
              ))}
            </div>
          </div>
        </section>

        {notice ? <p className="mb-5 rounded-2xl border border-red-400/20 bg-red-500/10 px-4 py-3 text-sm text-red-200">{notice}</p> : null}

        {isLoading ? (
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            {[1, 2, 3].map((item) => (
              <div key={item} className="h-56 animate-pulse rounded-[2rem] border border-white/10 bg-white/[0.06]" />
            ))}
          </div>
        ) : tickets.length === 0 ? (
          <div className="rounded-[2rem] border border-dashed border-white/14 bg-white/[0.05] p-10 text-center">
            <h2 className="text-2xl font-bold">No tickets yet</h2>
            <p className="mx-auto mt-3 max-w-xl text-sm leading-6 text-white/58">
              When you submit a support request, it will show up here with its category, status, created date, and urgency.
            </p>
            <Link href="/dashboard/new-ticket" className="mt-6 inline-flex items-center gap-2 rounded-full bg-white px-5 py-3 text-sm font-bold text-black">
              <Plus size={17} aria-hidden="true" />
              Submit first ticket
            </Link>
          </div>
        ) : (
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            {tickets.map((ticket) => {
              const urgency = ticket.urgency?.toLowerCase() || 'normal'

              return (
                <article key={ticket.id} className="group flex min-h-64 flex-col justify-between rounded-[2rem] border border-white/10 bg-white/[0.06] p-6 shadow-2xl shadow-black/20 transition hover:-translate-y-1 hover:border-[#5372FE]/45 hover:bg-white/[0.08]">
                  <div>
                    <div className="flex items-start justify-between gap-3">
                      <span className="rounded-full bg-[#5372FE]/12 px-3 py-1 text-xs font-bold text-[#b9c4ff]">
                        {ticket.category}
                      </span>
                      <span className={`rounded-full px-3 py-1 text-xs font-bold capitalize ${urgencyStyles[urgency] ?? urgencyStyles.normal}`}>
                        {ticket.urgency || 'normal'}
                      </span>
                    </div>

                    <h2 className="mt-6 text-2xl font-bold leading-tight tracking-tight">{ticket.title}</h2>

                    <div className="mt-5 grid gap-3 text-sm">
                      <div className="flex items-center justify-between gap-3 rounded-2xl bg-black/32 px-4 py-3">
                        <span className="text-white/48">Status</span>
                        <span className={`rounded-full px-3 py-1 text-xs font-bold ring-1 ${statusStyles[ticket.status]}`}>
                          {statusLabels[ticket.status]}
                        </span>
                      </div>
                      <div className="flex items-center justify-between gap-3 rounded-2xl bg-black/32 px-4 py-3">
                        <span className="flex items-center gap-2 text-white/48">
                          <Clock3 size={15} aria-hidden="true" />
                          Created
                        </span>
                        <span className="font-semibold text-white/82">{formatDate(ticket.created_at)}</span>
                      </div>
                    </div>
                  </div>

                  <Link href={`/dashboard/tickets/${ticket.id}` as Route} className="mt-6 inline-flex items-center justify-center gap-2 rounded-full bg-white px-5 py-3 text-sm font-bold text-black transition group-hover:bg-[#5372FE] group-hover:text-white">
                    Open ticket
                    <ArrowRight size={17} aria-hidden="true" />
                  </Link>
                </article>
              )
            })}
          </div>
        )}
    </CustomerPortalShell>
  )
}

function ExperienceMetric({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-2xl bg-black/32 p-4">
      <p className="text-xs font-black uppercase tracking-[0.12em] text-white/38">{label}</p>
      <p className="mt-2 text-sm font-bold text-white/82">{value}</p>
    </div>
  )
}
