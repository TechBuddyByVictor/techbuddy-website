'use client'

export const dynamic = 'force-dynamic'

import { CheckCircle2, ShieldCheck, Settings } from 'lucide-react'
import { AdminShell } from '@/components/admin-shell'

const settingsChecks = [
  'Admin pages require an authenticated Supabase session.',
  'Only profiles with admin role can enter /admin routes.',
  'Customer dashboard routes redirect admin users back to the admin CRM.',
  'Customer records, memberships, appointments, tickets, service records, and invoices are protected with RLS policies.',
]

export default function AdminSettingsPage() {
  return (
    <AdminShell title="Settings" description="Operational settings and access checks for the TechBuddy admin CRM.">
      <div className="grid gap-6 lg:grid-cols-[0.85fr_1.15fr]">
        <section className="rounded-[2rem] border border-white/10 bg-white/[0.06] p-6 shadow-2xl shadow-black/20">
          <Settings className="text-[#6B85FE]" size={28} aria-hidden="true" />
          <h2 className="mt-6 text-2xl font-bold">Admin access model</h2>
          <p className="mt-3 text-sm leading-6 text-white/56">
            Make an account an admin by setting its profile role to admin in Supabase. Customer accounts stay limited to the customer dashboard.
          </p>
          <code className="mt-5 block rounded-2xl bg-black/45 p-4 text-xs leading-6 text-white/70">
            {"update public.profiles set role = 'admin' where email = 'victor@example.com';"}
          </code>
        </section>

        <section className="rounded-[2rem] border border-white/10 bg-white/[0.06] p-6 shadow-2xl shadow-black/20">
          <ShieldCheck className="text-[#6B85FE]" size={28} aria-hidden="true" />
          <h2 className="mt-6 text-2xl font-bold">Protection checklist</h2>
          <div className="mt-5 grid gap-3">
            {settingsChecks.map((item) => (
              <div key={item} className="flex gap-3 rounded-2xl bg-black/30 px-4 py-3 text-sm text-white/72">
                <CheckCircle2 className="mt-0.5 shrink-0 text-[#6B85FE]" size={17} aria-hidden="true" />
                <span>{item}</span>
              </div>
            ))}
          </div>
        </section>
      </div>
    </AdminShell>
  )
}
