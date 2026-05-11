'use client'

export const dynamic = 'force-dynamic'

import Link from 'next/link'
import type { Route } from 'next'
import { useRouter } from 'next/navigation'
import { useEffect, useMemo, useState } from 'react'
import { ArrowRight, Mail, Phone, UserRound } from 'lucide-react'
import { AdminShell } from '@/components/admin-shell'
import { createClient } from '@/lib/supabase/client'
import type { Database } from '@/lib/supabase/types'

type Profile = Database['public']['Tables']['profiles']['Row']

export default function AdminCustomersPage() {
  const router = useRouter()
  const supabase = useMemo(() => createClient(), [])
  const [customers, setCustomers] = useState<Profile[]>([])
  const [notice, setNotice] = useState('')
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const loadCustomers = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser()

      if (!user) {
        router.push('/login?redirectTo=/admin/customers')
        return
      }

      const { data, error } = await supabase.from('profiles').select('*').eq('role', 'customer').order('created_at', { ascending: false })

      if (error) {
        setNotice(error.message)
      }

      setCustomers(data ?? [])
      setIsLoading(false)
    }

    void loadCustomers()
  }, [router, supabase])

  return (
    <AdminShell title="Customers" description="View customer records, edit contact details, change memberships, and schedule appointments.">
      {notice ? <p className="mb-5 rounded-2xl border border-red-400/20 bg-red-500/10 px-4 py-3 text-sm text-red-200">{notice}</p> : null}

      <div className="overflow-hidden rounded-[2rem] border border-white/10 bg-white/[0.055] shadow-2xl shadow-black/20">
        <div className="hidden grid-cols-[1fr_1fr_0.8fr_0.35fr] gap-4 border-b border-white/10 bg-black/40 px-5 py-4 text-xs font-bold uppercase tracking-[0.14em] text-white/40 lg:grid">
          <span>Name</span>
          <span>Email</span>
          <span>Phone</span>
          <span className="text-right">Open</span>
        </div>

        {isLoading ? (
          <div className="grid gap-3 p-5">
            {[1, 2, 3].map((item) => <div key={item} className="h-24 animate-pulse rounded-2xl bg-white/[0.06]" />)}
          </div>
        ) : customers.length === 0 ? (
          <div className="p-10 text-center">
            <h2 className="text-2xl font-bold">No customer records yet</h2>
            <p className="mt-3 text-sm text-white/54">Customer profiles appear here after registration.</p>
          </div>
        ) : (
          <div className="divide-y divide-white/10">
            {customers.map((customer) => (
              <article key={customer.id} className="grid gap-4 p-5 transition hover:bg-white/[0.035] lg:grid-cols-[1fr_1fr_0.8fr_0.35fr] lg:items-center">
                <div>
                  <p className="flex items-center gap-2 font-bold">
                    <UserRound className="text-[#6B85FE]" size={17} aria-hidden="true" />
                    {customer.full_name || 'Unnamed customer'}
                  </p>
                  <p className="mt-1 text-xs text-white/42">ID: {customer.id.slice(0, 8)}</p>
                </div>
                <p className="flex items-center gap-2 break-all text-sm font-semibold text-white/66">
                  <Mail size={15} aria-hidden="true" />
                  {customer.email}
                </p>
                <p className="flex items-center gap-2 text-sm font-semibold text-white/66">
                  <Phone size={15} aria-hidden="true" />
                  {customer.phone || 'No phone'}
                </p>
                <Link href={`/admin/customers/${customer.id}` as Route} className="inline-flex items-center justify-center gap-2 rounded-full bg-[#6B85FE] px-4 py-2 text-sm font-bold text-white lg:justify-self-end">
                  Open
                  <ArrowRight size={15} aria-hidden="true" />
                </Link>
              </article>
            ))}
          </div>
        )}
      </div>
    </AdminShell>
  )
}
