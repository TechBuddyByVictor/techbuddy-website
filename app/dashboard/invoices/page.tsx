'use client'

export const dynamic = 'force-dynamic'

import { useRouter } from 'next/navigation'
import { useEffect, useMemo, useState } from 'react'
import { CreditCard, ExternalLink, ReceiptText } from 'lucide-react'
import { CustomerPortalShell } from '@/components/customer-portal-shell'
import { createClient } from '@/lib/supabase/client'
import type { Database } from '@/lib/supabase/types'

type Invoice = Database['public']['Tables']['invoices']['Row']

const statusStyles: Record<string, string> = {
  draft: 'bg-white/8 text-white/58',
  sent: 'bg-blue-500/12 text-[#b9c4ff]',
  due: 'bg-amber-500/12 text-amber-200',
  paid: 'bg-emerald-500/12 text-emerald-200',
  overdue: 'bg-red-500/12 text-red-200',
  void: 'bg-white/8 text-white/42',
}

export default function InvoicesPage() {
  const supabase = useMemo(() => createClient(), [])
  const router = useRouter()
  const [invoices, setInvoices] = useState<Invoice[]>([])
  const [notice, setNotice] = useState('')
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const loadInvoices = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser()

      if (!user) {
        router.push('/login')
        return
      }

      const { data, error } = await supabase
        .from('invoices')
        .select('*')
        .eq('customer_id', user.id)
        .order('created_at', { ascending: false })

      if (error) {
        setNotice(error.message)
      }

      setInvoices(data ?? [])
      setIsLoading(false)
    }

    void loadInvoices()
  }, [router, supabase])

  const totalDue = invoices
    .filter((invoice) => !['paid', 'void'].includes(invoice.status))
    .reduce((sum, invoice) => sum + invoice.amount_cents, 0)

  return (
    <CustomerPortalShell title="Invoices">
      <section className="mb-8 grid gap-4 lg:grid-cols-[1fr_0.38fr]">
        <div className="rounded-[2rem] border border-white/10 bg-[linear-gradient(135deg,rgba(83,114,254,0.2),rgba(255,255,255,0.055))] p-6 shadow-2xl shadow-black/20">
          <p className="text-sm font-bold text-[#6B85FE]">Billing</p>
          <h2 className="mt-2 max-w-3xl text-4xl font-bold tracking-tight">Invoices sent through your TechBuddy portal.</h2>
          <p className="mt-3 max-w-3xl text-sm leading-6 text-white/58">
            Customers can review invoice status, due dates, payment links, and notes connected to completed services.
          </p>
        </div>
        <div className="rounded-[2rem] border border-white/10 bg-white/[0.06] p-6 shadow-2xl shadow-black/20">
          <CreditCard className="text-[#6B85FE]" size={24} aria-hidden="true" />
          <p className="mt-4 text-sm font-semibold text-white/48">Balance shown</p>
          <p className="mt-1 text-4xl font-bold">{formatMoney(totalDue)}</p>
        </div>
      </section>

      {notice ? <p className="mb-5 rounded-2xl border border-red-400/20 bg-red-500/10 px-4 py-3 text-sm text-red-200">{notice}</p> : null}

      <section className="overflow-hidden rounded-[2rem] border border-white/10 bg-white/[0.055] shadow-2xl shadow-black/20">
        <div className="hidden grid-cols-[0.8fr_0.7fr_0.7fr_0.7fr_1fr_0.5fr] gap-4 border-b border-white/10 bg-black/40 px-5 py-4 text-xs font-bold uppercase tracking-[0.14em] text-white/40 lg:grid">
          <span>Invoice</span>
          <span>Status</span>
          <span>Amount</span>
          <span>Due</span>
          <span>Notes</span>
          <span className="text-right">Open</span>
        </div>
        {isLoading ? (
          <div className="grid gap-3 p-5">
            {[1, 2, 3].map((item) => <div key={item} className="h-24 animate-pulse rounded-2xl bg-white/[0.06]" />)}
          </div>
        ) : invoices.length === 0 ? (
          <div className="p-10 text-center">
            <ReceiptText className="mx-auto text-[#6B85FE]" size={30} aria-hidden="true" />
            <h2 className="mt-4 text-2xl font-bold">No invoices yet</h2>
            <p className="mx-auto mt-3 max-w-xl text-sm leading-6 text-white/54">When Victor sends an invoice, it will appear here with its status and payment link.</p>
          </div>
        ) : (
          <div className="divide-y divide-white/10">
            {invoices.map((invoice) => (
              <article key={invoice.id} className="grid gap-4 p-5 lg:grid-cols-[0.8fr_0.7fr_0.7fr_0.7fr_1fr_0.5fr] lg:items-center">
                <div>
                  <p className="text-sm font-bold text-white">{invoice.invoice_number}</p>
                  <p className="mt-1 text-xs text-white/42">Created {formatDate(invoice.created_at)}</p>
                </div>
                <span className={`w-fit rounded-full px-3 py-1 text-xs font-bold capitalize ${statusStyles[invoice.status] ?? statusStyles.sent}`}>{invoice.status}</span>
                <p className="text-sm font-bold text-white/78">{formatMoney(invoice.amount_cents)}</p>
                <p className="text-sm text-white/62">{invoice.due_date ? formatDate(invoice.due_date) : 'No due date'}</p>
                <p className="text-sm leading-6 text-white/52">{invoice.notes || 'No notes attached.'}</p>
                {invoice.hosted_url ? (
                  <a href={invoice.hosted_url} target="_blank" rel="noreferrer" className="inline-flex items-center justify-center gap-2 rounded-full bg-white px-4 py-2 text-sm font-bold text-black transition hover:bg-blue-50 lg:justify-self-end">
                    Open
                    <ExternalLink size={15} aria-hidden="true" />
                  </a>
                ) : (
                  <span className="rounded-full bg-black/30 px-4 py-2 text-center text-sm font-bold text-white/36 lg:justify-self-end">Pending</span>
                )}
              </article>
            ))}
          </div>
        )}
      </section>
    </CustomerPortalShell>
  )
}

function formatMoney(cents: number) {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
  }).format(cents / 100)
}

function formatDate(value: string) {
  return new Intl.DateTimeFormat('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  }).format(new Date(value))
}

