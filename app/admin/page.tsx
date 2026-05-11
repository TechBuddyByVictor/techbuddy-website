'use client'

export const dynamic = 'force-dynamic'

import Link from 'next/link'
import type { Route } from 'next'
import { useRouter } from 'next/navigation'
import { useEffect, useMemo, useState } from 'react'
import { ArrowRight, CalendarDays, Clock3, CreditCard, ReceiptText, Sparkles, Ticket, UsersRound } from 'lucide-react'
import { AdminShell } from '@/components/admin-shell'
import { createClient } from '@/lib/supabase/client'
import type { Database, TicketStatus } from '@/lib/supabase/types'

type Profile = Database['public']['Tables']['profiles']['Row']
type Appointment = Database['public']['Tables']['appointments']['Row']
type Membership = Database['public']['Tables']['customer_memberships']['Row']
type Invoice = Database['public']['Tables']['invoices']['Row']

interface AdminTicket {
  id: string
  title: string
  status: TicketStatus
  urgency: string
  created_at: string
  customer_name: string | null
  customer_email: string | null
}

const statusLabels: Record<TicketStatus, string> = {
  open: 'Open',
  in_progress: 'In progress',
  waiting_on_customer: 'Waiting on customer',
  resolved: 'Resolved',
  closed: 'Closed',
}

function formatDate(value: string) {
  return new Intl.DateTimeFormat('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  }).format(new Date(value))
}

export default function AdminPage() {
  const router = useRouter()
  const supabase = useMemo(() => createClient(), [])
  const [tickets, setTickets] = useState<AdminTicket[]>([])
  const [customers, setCustomers] = useState<Profile[]>([])
  const [memberships, setMemberships] = useState<Membership[]>([])
  const [appointments, setAppointments] = useState<Appointment[]>([])
  const [invoices, setInvoices] = useState<Invoice[]>([])
  const [notice, setNotice] = useState('')
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const loadCrm = async () => {
      setIsLoading(true)

      const {
        data: { user },
      } = await supabase.auth.getUser()

      if (!user) {
        router.push('/login?redirectTo=/admin')
        return
      }

      const [{ data: ticketData, error: ticketError }, { data: customerData, error: customerError }, { data: membershipData, error: membershipError }, { data: appointmentData, error: appointmentError }, { data: invoiceData, error: invoiceError }] = await Promise.all([
        supabase.from('support_tickets').select('*').order('created_at', { ascending: false }),
        supabase.from('profiles').select('*').eq('role', 'customer').order('created_at', { ascending: false }),
        supabase.from('customer_memberships').select('*').order('created_at', { ascending: false }),
        supabase.from('appointments').select('*').order('scheduled_at', { ascending: true }),
        supabase.from('invoices').select('*').order('created_at', { ascending: false }),
      ])

      const error = ticketError ?? customerError ?? membershipError ?? appointmentError ?? invoiceError
      if (error) {
        setNotice(error.message)
      }

      setTickets((ticketData ?? []) as AdminTicket[])
      setCustomers(customerData ?? [])
      setMemberships(membershipData ?? [])
      setAppointments(appointmentData ?? [])
      setInvoices(invoiceData ?? [])
      setIsLoading(false)
    }

    void loadCrm()
  }, [router, supabase])

  const openTickets = tickets.filter((ticket) => ticket.status !== 'closed' && ticket.status !== 'resolved')
  const upcomingAppointments = appointments.filter((appointment) => new Date(appointment.scheduled_at) >= new Date()).slice(0, 5)
  const outstandingInvoices = invoices.filter((invoice) => !['paid', 'void'].includes(invoice.status))
  const outstandingTotal = outstandingInvoices.reduce((sum, invoice) => sum + invoice.amount_cents, 0)

  return (
    <AdminShell title="Admin dashboard" description="Manage tickets, customers, memberships, appointments, and customer account details from one CRM workspace.">
      {notice ? <p className="mb-5 rounded-2xl border border-red-400/20 bg-red-500/10 px-4 py-3 text-sm text-red-200">{notice}</p> : null}

      <div className="mb-8 grid gap-4 md:grid-cols-2 xl:grid-cols-5">
        {[
          { label: 'Customers', value: customers.length, href: '/admin/customers', icon: UsersRound },
          { label: 'Open tickets', value: openTickets.length, href: '/admin', icon: Ticket },
          { label: 'Invoices due', value: outstandingInvoices.length, href: '/admin/invoices', icon: ReceiptText },
          { label: 'Memberships', value: memberships.length, href: '/admin/memberships', icon: Sparkles },
          { label: 'Appointments', value: appointments.length, href: '/admin/appointments', icon: CalendarDays },
        ].map((item) => {
          const Icon = item.icon
          return (
            <Link key={item.label} href={item.href as Route} className="rounded-[1.75rem] border border-white/10 bg-white/[0.06] p-5 transition hover:-translate-y-1 hover:border-[#6B85FE]/45 hover:bg-white/[0.09]">
              <Icon className="text-[#6B85FE]" size={24} aria-hidden="true" />
              <p className="mt-5 text-sm font-semibold text-white/48">{item.label}</p>
              <p className="mt-1 text-3xl font-bold">{isLoading ? '-' : item.value}</p>
            </Link>
          )
        })}
      </div>

      <div className="grid gap-6 xl:grid-cols-[1.25fr_0.75fr]">
        <section className="overflow-hidden rounded-[2rem] border border-white/10 bg-white/[0.055] shadow-2xl shadow-black/20">
          <div className="flex items-center justify-between gap-4 border-b border-white/10 bg-black/36 px-5 py-4">
            <div>
              <p className="text-sm font-bold text-[#b9c4ff]">Tickets</p>
              <h2 className="text-2xl font-bold">Recent support work</h2>
            </div>
            <Link href="/admin" className="hidden rounded-full bg-white px-4 py-2 text-sm font-bold text-black sm:inline-flex">All tickets</Link>
          </div>

          {isLoading ? (
            <div className="grid gap-3 p-5">
              {[1, 2, 3].map((item) => <div key={item} className="h-20 animate-pulse rounded-2xl bg-white/[0.06]" />)}
            </div>
          ) : tickets.length === 0 ? (
            <div className="p-8 text-center text-sm text-white/52">No tickets yet.</div>
          ) : (
            <div className="divide-y divide-white/10">
              {tickets.slice(0, 8).map((ticket) => (
                <article key={ticket.id} className="grid gap-4 p-5 transition hover:bg-white/[0.035] lg:grid-cols-[1fr_0.65fr_0.45fr] lg:items-center">
                  <div>
                    <p className="font-bold">{ticket.title}</p>
                    <p className="mt-1 text-sm text-white/46">{ticket.customer_name ?? ticket.customer_email ?? 'Unknown customer'}</p>
                  </div>
                  <p className="text-sm font-semibold text-white/60">{statusLabels[ticket.status]}</p>
                  <Link href={`/admin/tickets/${ticket.id}` as Route} className="inline-flex items-center justify-center gap-2 rounded-full bg-[#6B85FE] px-4 py-2 text-sm font-bold text-white">
                    Open
                    <ArrowRight size={15} aria-hidden="true" />
                  </Link>
                </article>
              ))}
            </div>
          )}
        </section>

        <aside className="grid gap-6">
          <section className="rounded-[2rem] border border-white/10 bg-white/[0.055] p-5 shadow-2xl shadow-black/20">
            <div className="flex items-center justify-between gap-3">
              <div>
                <p className="text-sm font-bold text-[#b9c4ff]">Appointments</p>
                <h2 className="text-2xl font-bold">Upcoming</h2>
              </div>
              <Link href="/admin/appointments" className="rounded-full bg-white px-4 py-2 text-sm font-bold text-black">Manage</Link>
            </div>
            <div className="mt-5 grid gap-3">
              {upcomingAppointments.length === 0 ? (
                <p className="rounded-2xl border border-dashed border-white/12 p-5 text-sm text-white/46">No upcoming appointments.</p>
              ) : (
                upcomingAppointments.map((appointment) => (
                  <div key={appointment.id} className="rounded-2xl bg-black/30 p-4">
                    <p className="font-bold capitalize">{appointment.appointment_type}</p>
                    <p className="mt-1 flex items-center gap-2 text-sm text-white/54">
                      <Clock3 size={15} aria-hidden="true" />
                      {formatDate(appointment.scheduled_at)}
                    </p>
                  </div>
                ))
              )}
            </div>
          </section>

          <section className="rounded-[2rem] border border-white/10 bg-white/[0.055] p-5 shadow-2xl shadow-black/20">
            <p className="text-sm font-bold text-[#b9c4ff]">Membership status</p>
            <h2 className="text-2xl font-bold">Recent requests</h2>
            <div className="mt-5 grid gap-3">
              {memberships.slice(0, 5).map((membership) => (
                <Link key={membership.id} href="/admin/memberships" className="rounded-2xl bg-black/30 p-4 transition hover:bg-white/10">
                  <p className="font-bold">{membership.plan_name}</p>
                  <p className="mt-1 text-sm capitalize text-white/54">{membership.status}</p>
                </Link>
              ))}
              {memberships.length === 0 ? <p className="rounded-2xl border border-dashed border-white/12 p-5 text-sm text-white/46">No membership records yet.</p> : null}
            </div>
          </section>
        </aside>
      </div>

      <section className="mt-8 overflow-hidden rounded-[2rem] border border-white/10 bg-white/[0.055] shadow-2xl shadow-black/20">
        <div className="flex items-center justify-between gap-4 border-b border-white/10 bg-black/36 px-5 py-4">
          <div>
            <p className="text-sm font-bold text-[#b9c4ff]">Invoices</p>
            <h2 className="text-2xl font-bold">Billing control</h2>
          </div>
          <Link href="/admin/invoices" className="rounded-full bg-white px-4 py-2 text-sm font-bold text-black">Manage</Link>
        </div>
        <div className="grid gap-4 p-5 md:grid-cols-[0.7fr_1fr]">
          <div className="rounded-2xl bg-black/30 p-5">
            <p className="text-sm font-semibold text-white/48">Outstanding balance</p>
            <p className="mt-2 text-4xl font-bold">{formatMoney(outstandingTotal)}</p>
            <p className="mt-2 text-sm text-white/46">{outstandingInvoices.length} invoice{outstandingInvoices.length === 1 ? '' : 's'} waiting on payment or final action.</p>
          </div>
          <div className="grid gap-3">
            {invoices.slice(0, 3).map((invoice) => (
              <Link key={invoice.id} href="/admin/invoices" className="grid gap-3 rounded-2xl bg-black/30 p-4 transition hover:bg-white/10 sm:grid-cols-[1fr_0.45fr_0.45fr] sm:items-center">
                <div>
                  <p className="font-bold">{invoice.invoice_number}</p>
                  <p className="mt-1 text-sm text-white/46">{invoice.notes || 'No notes attached.'}</p>
                </div>
                <p className="text-sm font-bold text-white/72">{formatMoney(invoice.amount_cents)}</p>
                <p className="text-sm font-bold capitalize text-[#b9c4ff]">{invoice.status}</p>
              </Link>
            ))}
            {invoices.length === 0 ? <p className="rounded-2xl border border-dashed border-white/12 p-5 text-sm text-white/46">No invoices yet.</p> : null}
          </div>
        </div>
      </section>

      <div className="mt-8 grid gap-4 md:grid-cols-3">
        <Link href="/admin/customers" className="inline-flex items-center justify-center gap-2 rounded-full bg-white px-5 py-3 text-sm font-bold text-black">
          <UsersRound size={16} aria-hidden="true" />
          Manage customers
        </Link>
        <Link href="/admin/appointments" className="inline-flex items-center justify-center gap-2 rounded-full bg-white px-5 py-3 text-sm font-bold text-black">
          <CalendarDays size={16} aria-hidden="true" />
          Set appointments
        </Link>
        <Link href="/admin/memberships" className="inline-flex items-center justify-center gap-2 rounded-full bg-white px-5 py-3 text-sm font-bold text-black">
          <CreditCard size={16} aria-hidden="true" />
          Change memberships
        </Link>
      </div>
    </AdminShell>
  )
}

function formatMoney(cents: number) {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
  }).format(cents / 100)
}
