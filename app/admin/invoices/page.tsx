'use client'

export const dynamic = 'force-dynamic'

import Link from 'next/link'
import type { Route } from 'next'
import { useRouter } from 'next/navigation'
import { useEffect, useMemo, useState } from 'react'
import { CheckCircle2, ExternalLink, Plus, ReceiptText, Search, Send, UserRound } from 'lucide-react'
import { AdminShell } from '@/components/admin-shell'
import { createClient } from '@/lib/supabase/client'
import type { Database } from '@/lib/supabase/types'

type Profile = Database['public']['Tables']['profiles']['Row']
type Invoice = Database['public']['Tables']['invoices']['Row']
type ServiceRecord = Database['public']['Tables']['service_records']['Row']
type InvoiceUpdate = Database['public']['Tables']['invoices']['Update']

const invoiceStatuses = ['draft', 'sent', 'due', 'paid', 'overdue', 'void']

const statusStyles: Record<string, string> = {
  draft: 'bg-white/8 text-white/58 ring-white/12',
  sent: 'bg-blue-500/12 text-[#b9c4ff] ring-blue-400/25',
  due: 'bg-amber-500/12 text-amber-200 ring-amber-400/25',
  paid: 'bg-emerald-500/12 text-emerald-200 ring-emerald-400/25',
  overdue: 'bg-red-500/12 text-red-200 ring-red-400/25',
  void: 'bg-white/8 text-white/42 ring-white/10',
}

export default function AdminInvoicesPage() {
  const router = useRouter()
  const supabase = useMemo(() => createClient(), [])
  const [customers, setCustomers] = useState<Profile[]>([])
  const [serviceRecords, setServiceRecords] = useState<ServiceRecord[]>([])
  const [invoices, setInvoices] = useState<Invoice[]>([])
  const [customerId, setCustomerId] = useState('')
  const [serviceRecordId, setServiceRecordId] = useState('')
  const [invoiceNumber, setInvoiceNumber] = useState('')
  const [amount, setAmount] = useState('')
  const [status, setStatus] = useState('draft')
  const [dueDate, setDueDate] = useState('')
  const [hostedUrl, setHostedUrl] = useState('')
  const [notes, setNotes] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')
  const [query, setQuery] = useState('')
  const [notice, setNotice] = useState('')
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)
  const [savingId, setSavingId] = useState('')

  const loadInvoices = async () => {
    setIsLoading(true)

    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      router.push('/login?redirectTo=/admin/invoices')
      return
    }

    const [{ data: customerData, error: customerError }, { data: invoiceData, error: invoiceError }, { data: serviceData, error: serviceError }] = await Promise.all([
      supabase.from('profiles').select('*').eq('role', 'customer').order('full_name', { ascending: true }),
      supabase.from('invoices').select('*').order('created_at', { ascending: false }),
      supabase.from('service_records').select('*').order('created_at', { ascending: false }),
    ])

    const error = customerError ?? invoiceError ?? serviceError
    if (error) {
      setNotice(error.message)
    }

    const nextCustomers = customerData ?? []
    const nextInvoices = invoiceData ?? []
    setCustomers(nextCustomers)
    setInvoices(nextInvoices)
    setServiceRecords(serviceData ?? [])
    setCustomerId((current) => current || nextCustomers[0]?.id || '')
    setInvoiceNumber((current) => current || suggestInvoiceNumber(nextInvoices.length + 1))
    setIsLoading(false)
  }

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    void loadInvoices()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const customerById = new Map(customers.map((customer) => [customer.id, customer]))
  const serviceById = new Map(serviceRecords.map((service) => [service.id, service]))
  const customerServices = serviceRecords.filter((service) => service.customer_id === customerId)

  const outstandingTotal = invoices.filter((invoice) => !['paid', 'void'].includes(invoice.status)).reduce((sum, invoice) => sum + invoice.amount_cents, 0)
  const overdueTotal = invoices.filter((invoice) => invoice.status === 'overdue' || (!!invoice.due_date && new Date(invoice.due_date) < startOfToday() && !['paid', 'void'].includes(invoice.status))).reduce((sum, invoice) => sum + invoice.amount_cents, 0)
  const paidTotal = invoices.filter((invoice) => invoice.status === 'paid').reduce((sum, invoice) => sum + invoice.amount_cents, 0)
  const draftCount = invoices.filter((invoice) => invoice.status === 'draft').length

  const filteredInvoices = invoices.filter((invoice) => {
    const customer = customerById.get(invoice.customer_id)
    const haystack = `${invoice.invoice_number} ${invoice.status} ${invoice.notes ?? ''} ${customer?.full_name ?? ''} ${customer?.email ?? ''}`.toLowerCase()
    const matchesQuery = haystack.includes(query.trim().toLowerCase())
    const matchesStatus = statusFilter === 'all' || invoice.status === statusFilter
    return matchesQuery && matchesStatus
  })

  const createInvoice = async (event: React.FormEvent) => {
    event.preventDefault()
    if (!customerId || !invoiceNumber.trim()) return

    setIsSaving(true)
    setNotice('')

    const normalizedStatus = status.trim() || 'draft'
    const { error } = await supabase.from('invoices').insert({
      customer_id: customerId,
      service_record_id: serviceRecordId || null,
      invoice_number: invoiceNumber.trim(),
      status: normalizedStatus,
      amount_cents: toCents(amount),
      due_date: dueDate || null,
      hosted_url: hostedUrl || null,
      notes: notes || null,
      sent_at: ['sent', 'due', 'overdue'].includes(normalizedStatus) ? new Date().toISOString() : null,
      paid_at: normalizedStatus === 'paid' ? new Date().toISOString() : null,
    })

    if (error) {
      setNotice(error.message)
    } else {
      setNotice('Invoice created and visible in the customer portal.')
      setServiceRecordId('')
      setInvoiceNumber(suggestInvoiceNumber(invoices.length + 2))
      setAmount('')
      setStatus('draft')
      setDueDate('')
      setHostedUrl('')
      setNotes('')
      await loadInvoices()
    }

    setIsSaving(false)
  }

  const updateInvoice = async (invoice: Invoice, update: InvoiceUpdate) => {
    setSavingId(invoice.id)
    setNotice('')

    const nextUpdate = { ...update }
    if (typeof update.status === 'string') {
      if (update.status === 'paid' && !invoice.paid_at) {
        nextUpdate.paid_at = new Date().toISOString()
      }
      if (['sent', 'due', 'overdue'].includes(update.status) && !invoice.sent_at) {
        nextUpdate.sent_at = new Date().toISOString()
      }
      if (update.status !== 'paid') {
        nextUpdate.paid_at = null
      }
    }

    const { data, error } = await supabase.from('invoices').update(nextUpdate).eq('id', invoice.id).select('*').single()

    if (error) {
      setNotice(error.message)
    } else if (data) {
      setInvoices((current) => current.map((item) => item.id === invoice.id ? data : item))
      setNotice('Invoice updated.')
    }

    setSavingId('')
  }

  return (
    <AdminShell title="Invoices" description="Create, send, edit, and track every customer invoice from one billing command center.">
      {notice ? <p className="mb-5 rounded-2xl border border-[#6B85FE]/20 bg-[#5372FE]/10 px-4 py-3 text-sm text-blue-100">{notice}</p> : null}

      <div className="mb-8 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <MetricCard label="Outstanding" value={formatMoney(outstandingTotal)} />
        <MetricCard label="Overdue risk" value={formatMoney(overdueTotal)} tone="warning" />
        <MetricCard label="Paid total" value={formatMoney(paidTotal)} tone="success" />
        <MetricCard label="Drafts" value={isLoading ? '-' : String(draftCount)} />
      </div>

      <div className="grid gap-6 xl:grid-cols-[0.62fr_1fr]">
        <form onSubmit={createInvoice} className="rounded-[2rem] border border-white/10 bg-white/[0.06] p-6 shadow-2xl shadow-black/20">
          <div className="flex items-center gap-3">
            <Plus className="text-[#6B85FE]" size={24} aria-hidden="true" />
            <h2 className="text-2xl font-bold">Create invoice</h2>
          </div>
          <div className="mt-6 grid gap-4">
            <select value={customerId} onChange={(event) => { setCustomerId(event.target.value); setServiceRecordId('') }} className="rounded-2xl border border-white/10 bg-black/40 px-4 py-3 text-white outline-none focus:border-[#6B85FE]">
              {customers.map((customer) => <option key={customer.id} value={customer.id}>{customer.full_name || customer.email}</option>)}
            </select>
            <select value={serviceRecordId} onChange={(event) => setServiceRecordId(event.target.value)} className="rounded-2xl border border-white/10 bg-black/40 px-4 py-3 text-white outline-none focus:border-[#6B85FE]">
              <option value="">No linked service</option>
              {customerServices.map((service) => <option key={service.id} value={service.id}>{service.title}</option>)}
            </select>
            <div className="grid gap-4 sm:grid-cols-2">
              <input value={invoiceNumber} onChange={(event) => setInvoiceNumber(event.target.value)} required placeholder="Invoice number" className="rounded-2xl border border-white/10 bg-black/40 px-4 py-3 text-white outline-none placeholder:text-white/30 focus:border-[#6B85FE]" />
              <input inputMode="decimal" value={amount} onChange={(event) => setAmount(event.target.value)} placeholder="Amount, e.g. 149.00" className="rounded-2xl border border-white/10 bg-black/40 px-4 py-3 text-white outline-none placeholder:text-white/30 focus:border-[#6B85FE]" />
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <select value={status} onChange={(event) => setStatus(event.target.value)} className="rounded-2xl border border-white/10 bg-black/40 px-4 py-3 text-white capitalize outline-none focus:border-[#6B85FE]">
                {invoiceStatuses.map((item) => <option key={item} value={item}>{item}</option>)}
              </select>
              <input type="date" value={dueDate} onChange={(event) => setDueDate(event.target.value)} aria-label="Due date" className="rounded-2xl border border-white/10 bg-black/40 px-4 py-3 text-white outline-none focus:border-[#6B85FE]" />
            </div>
            <input value={hostedUrl} onChange={(event) => setHostedUrl(event.target.value)} placeholder="Payment link" className="rounded-2xl border border-white/10 bg-black/40 px-4 py-3 text-white outline-none placeholder:text-white/30 focus:border-[#6B85FE]" />
            <textarea value={notes} onChange={(event) => setNotes(event.target.value)} placeholder="Customer-visible invoice notes" className="min-h-28 rounded-2xl border border-white/10 bg-black/40 px-4 py-3 text-white outline-none placeholder:text-white/30 focus:border-[#6B85FE]" />
            <button disabled={isSaving || customers.length === 0} className="inline-flex items-center justify-center gap-2 rounded-full bg-white px-5 py-3 text-sm font-bold text-black disabled:cursor-not-allowed disabled:opacity-60">
              <Send size={16} aria-hidden="true" />
              {isSaving ? 'Creating...' : 'Create invoice'}
            </button>
          </div>
        </form>

        <section className="overflow-hidden rounded-[2rem] border border-white/10 bg-white/[0.055] shadow-2xl shadow-black/20">
          <div className="border-b border-white/10 bg-black/40 p-5">
            <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
              <div>
                <p className="text-sm font-bold text-[#b9c4ff]">Billing ledger</p>
                <h2 className="text-2xl font-bold">All invoices</h2>
              </div>
              <label className="flex min-w-0 items-center gap-2 rounded-full border border-white/10 bg-black/40 px-4 py-2 text-sm text-white/60 focus-within:border-[#6B85FE]">
                <Search size={16} aria-hidden="true" />
                <input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search invoices" className="min-w-0 bg-transparent text-white outline-none placeholder:text-white/30" />
              </label>
            </div>
            <div className="mt-4 flex gap-2 overflow-x-auto">
              {['all', ...invoiceStatuses].map((item) => (
                <button key={item} onClick={() => setStatusFilter(item)} className={`shrink-0 rounded-full px-4 py-2 text-xs font-bold capitalize transition ${statusFilter === item ? 'bg-white text-black' : 'bg-white/8 text-white/58 hover:bg-white/12 hover:text-white'}`}>
                  {item}
                </button>
              ))}
            </div>
          </div>

          {isLoading ? (
            <div className="grid gap-3 p-5">
              {[1, 2, 3].map((item) => <div key={item} className="h-36 animate-pulse rounded-2xl bg-white/[0.06]" />)}
            </div>
          ) : filteredInvoices.length === 0 ? (
            <div className="p-10 text-center">
              <ReceiptText className="mx-auto text-[#6B85FE]" size={34} aria-hidden="true" />
              <h2 className="mt-4 text-2xl font-bold">No invoices found</h2>
              <p className="mx-auto mt-3 max-w-xl text-sm leading-6 text-white/54">Create the first invoice or adjust the current search and status filters.</p>
            </div>
          ) : (
            <div className="divide-y divide-white/10">
              {filteredInvoices.map((invoice) => {
                const customer = customerById.get(invoice.customer_id)
                const service = invoice.service_record_id ? serviceById.get(invoice.service_record_id) : null

                return (
                  <article key={invoice.id} className="grid gap-5 p-5 transition hover:bg-white/[0.035]">
                    <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                      <div>
                        <div className="flex flex-wrap items-center gap-2">
                          <p className="text-lg font-bold">{invoice.invoice_number}</p>
                          <span className={`rounded-full px-3 py-1 text-xs font-bold capitalize ring-1 ${statusStyles[invoice.status] ?? statusStyles.sent}`}>{invoice.status}</span>
                        </div>
                        <p className="mt-1 flex items-center gap-2 text-sm text-white/52">
                          <UserRound size={15} aria-hidden="true" />
                          {customer?.full_name ?? customer?.email ?? 'Unknown customer'}
                        </p>
                        {service ? <p className="mt-1 text-xs text-white/38">Linked service: {service.title}</p> : null}
                      </div>
                      <div className="flex flex-wrap gap-2">
                        <Link href={`/admin/customers/${invoice.customer_id}` as Route} className="inline-flex items-center gap-2 rounded-full bg-white px-4 py-2 text-sm font-bold text-black">
                          Customer
                        </Link>
                        {invoice.hosted_url ? (
                          <a href={invoice.hosted_url} target="_blank" rel="noreferrer" className="inline-flex items-center gap-2 rounded-full bg-[#6B85FE] px-4 py-2 text-sm font-bold text-white">
                            Pay link
                            <ExternalLink size={15} aria-hidden="true" />
                          </a>
                        ) : null}
                      </div>
                    </div>

                    <div className="grid gap-3 lg:grid-cols-[0.55fr_0.55fr_0.55fr_1fr]">
                      <label className="grid gap-2 text-xs font-bold uppercase tracking-[0.12em] text-white/36">
                        Amount
                        <input defaultValue={(invoice.amount_cents / 100).toFixed(2)} onBlur={(event) => updateInvoice(invoice, { amount_cents: toCents(event.target.value) })} className="rounded-2xl border border-white/10 bg-black/40 px-4 py-3 text-sm text-white outline-none focus:border-[#6B85FE]" />
                      </label>
                      <label className="grid gap-2 text-xs font-bold uppercase tracking-[0.12em] text-white/36">
                        Due
                        <input type="date" value={invoice.due_date ?? ''} onChange={(event) => updateInvoice(invoice, { due_date: event.target.value || null })} className="rounded-2xl border border-white/10 bg-black/40 px-4 py-3 text-sm text-white outline-none focus:border-[#6B85FE]" />
                      </label>
                      <label className="grid gap-2 text-xs font-bold uppercase tracking-[0.12em] text-white/36">
                        Status
                        <select value={invoice.status} onChange={(event) => updateInvoice(invoice, { status: event.target.value })} className="rounded-2xl border border-white/10 bg-black/40 px-4 py-3 text-sm capitalize text-white outline-none focus:border-[#6B85FE]">
                          {invoiceStatuses.map((item) => <option key={item} value={item}>{item}</option>)}
                        </select>
                      </label>
                      <label className="grid gap-2 text-xs font-bold uppercase tracking-[0.12em] text-white/36">
                        Payment link
                        <input defaultValue={invoice.hosted_url ?? ''} onBlur={(event) => updateInvoice(invoice, { hosted_url: event.target.value || null })} placeholder="https://" className="rounded-2xl border border-white/10 bg-black/40 px-4 py-3 text-sm text-white outline-none placeholder:text-white/30 focus:border-[#6B85FE]" />
                      </label>
                    </div>

                    <label className="grid gap-2 text-xs font-bold uppercase tracking-[0.12em] text-white/36">
                      Notes
                      <textarea defaultValue={invoice.notes ?? ''} onBlur={(event) => updateInvoice(invoice, { notes: event.target.value || null })} className="min-h-20 rounded-2xl border border-white/10 bg-black/40 px-4 py-3 text-sm leading-6 text-white outline-none focus:border-[#6B85FE]" />
                    </label>
                    {savingId === invoice.id ? <p className="flex items-center gap-2 text-xs font-bold text-[#b9c4ff]"><CheckCircle2 size={14} aria-hidden="true" />Saving invoice...</p> : null}
                  </article>
                )
              })}
            </div>
          )}
        </section>
      </div>
    </AdminShell>
  )
}

function MetricCard({ label, value, tone = 'default' }: { label: string; value: string; tone?: 'default' | 'warning' | 'success' }) {
  const toneClass = tone === 'warning' ? 'text-amber-200' : tone === 'success' ? 'text-emerald-200' : 'text-white'

  return (
    <article className="rounded-[1.75rem] border border-white/10 bg-white/[0.06] p-5">
      <ReceiptText className="text-[#6B85FE]" size={22} aria-hidden="true" />
      <p className="mt-5 text-sm font-semibold text-white/48">{label}</p>
      <p className={`mt-1 text-3xl font-bold ${toneClass}`}>{value}</p>
    </article>
  )
}

function toCents(value: string) {
  const numeric = Number(value.replace(/[^0-9.-]/g, ''))
  if (!Number.isFinite(numeric)) return 0
  return Math.max(0, Math.round(numeric * 100))
}

function formatMoney(cents: number) {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
  }).format(cents / 100)
}

function suggestInvoiceNumber(sequence: number) {
  const date = new Date()
  const stamp = `${date.getFullYear()}${String(date.getMonth() + 1).padStart(2, '0')}${String(date.getDate()).padStart(2, '0')}`
  return `TB-${stamp}-${String(sequence).padStart(3, '0')}`
}

function startOfToday() {
  const date = new Date()
  date.setHours(0, 0, 0, 0)
  return date
}
