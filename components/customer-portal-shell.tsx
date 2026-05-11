'use client'

import Image from 'next/image'
import Link from 'next/link'
import type { Route } from 'next'
import { usePathname } from 'next/navigation'
import { useEffect, useMemo, useState } from 'react'
import { ArrowRight, CreditCard, FileText, LayoutDashboard, LogOut, ShieldCheck, Sparkles, UserRound } from 'lucide-react'
import { getMembershipExperience } from '@/lib/membership-experience'
import { createClient } from '@/lib/supabase/client'

const portalLinks = [
  { href: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/dashboard/profile', label: 'Profile', icon: UserRound },
  { href: '/dashboard/memberships', label: 'Memberships', icon: Sparkles },
  { href: '/dashboard/services', label: 'Services', icon: ShieldCheck },
  { href: '/dashboard/invoices', label: 'Invoices', icon: CreditCard },
  { href: '/dashboard/new-ticket', label: 'New ticket', icon: FileText },
]

const websiteLinks = [
  { href: '/', label: 'Home' },
  { href: '/memberships', label: 'Memberships' },
  { href: '/services', label: 'Services' },
  { href: '/contact', label: 'Contact' },
  { href: '/business', label: 'Business' },
]

export function CustomerPortalShell({
  title,
  eyebrow = 'Your TechBuddy account',
  children,
}: {
  title: string
  eyebrow?: string
  children: React.ReactNode
}) {
  const pathname = usePathname()
  const supabase = useMemo(() => createClient(), [])
  const [customerName, setCustomerName] = useState('Customer')
  const [membershipName, setMembershipName] = useState<string | null>(null)
  const [membershipStatus, setMembershipStatus] = useState<string | null>(null)
  const experience = getMembershipExperience(membershipName, membershipStatus)

  useEffect(() => {
    const loadCustomer = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser()

      if (!user) return

      const { data } = await supabase.from('profiles').select('*').eq('id', user.id).maybeSingle()
      const { data: memberships } = await supabase
        .from('customer_memberships')
        .select('*')
        .eq('customer_id', user.id)
        .order('created_at', { ascending: false })
        .limit(1)

      const metadataName = typeof user.user_metadata?.full_name === 'string' ? user.user_metadata.full_name.trim() : ''
      setCustomerName(data?.full_name?.trim() || metadataName || 'Customer')
      setMembershipName(memberships?.[0]?.plan_name ?? null)
      setMembershipStatus(memberships?.[0]?.status ?? null)
    }

    void loadCustomer()
  }, [supabase])

  return (
    <div className="min-h-screen bg-white text-black">
      <header className="sticky top-0 z-40 border-b border-black/8 bg-white/86 backdrop-blur-2xl">
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-5 py-4 sm:px-8 lg:px-10">
          <Link href="/" className="flex min-w-0 items-center" aria-label="TechBuddy by Victor home">
            <Image
              src="/techbuddy-logo.png"
              alt="TechBuddy"
              width={850}
              height={252}
              priority
              className="h-11 w-auto max-w-[158px] object-contain sm:h-12 sm:max-w-[184px]"
            />
          </Link>

          <nav className="hidden items-center gap-1 rounded-full border border-black/8 bg-white/74 p-1 text-sm font-semibold text-black/56 shadow-sm shadow-black/[0.03] lg:flex">
            {websiteLinks.map((item) => (
              <Link key={item.href} href={item.href as Route} className="rounded-full px-4 py-2 transition hover:bg-[#F4F6FF] hover:text-[#3D60FE]">
                {item.label}
              </Link>
            ))}
          </nav>

          <div className="flex items-center gap-2">
            <Link href="/dashboard/memberships" className="hidden rounded-full border border-[#5372FE]/20 bg-[#F4F6FF] px-3 py-2 text-xs font-black uppercase text-[#3D60FE] transition hover:bg-[#EAF0FF] md:inline-flex">
              {experience.badge}
            </Link>
            <Link href="/dashboard/profile" className="hidden max-w-44 truncate rounded-full bg-[#F4F6FF] px-4 py-2 text-sm font-bold text-[#3D60FE] transition hover:bg-[#EAF0FF] sm:inline-flex">
              Hi, {customerName}
            </Link>
            <form action="/auth/signout" method="post">
              <button type="submit" className="inline-flex items-center gap-2 rounded-full bg-black px-3 py-2 text-xs font-bold text-white transition hover:bg-[#2a2a2a] sm:px-3.5">
                <LogOut size={15} aria-hidden="true" />
                Sign out
              </button>
            </form>
          </div>
        </div>
      </header>

      <main>
        <section className="border-b border-black/8 bg-[linear-gradient(180deg,#F4F6FF_0%,#ffffff_100%)] px-5 py-8 sm:px-8 lg:px-10">
          <div className="mx-auto max-w-7xl">
            <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
              <div>
                <p className="text-sm font-bold text-[#5372FE]">{eyebrow}</p>
                <h1 className="font-display mt-2 text-4xl font-semibold tracking-normal text-black sm:text-5xl">{title}</h1>
                <p className="mt-3 max-w-2xl text-sm leading-6 text-black/56">
                  Welcome back, {customerName}. {experience.portalMessage}
                </p>
              </div>
              <Link href="/dashboard/new-ticket" className="inline-flex w-fit items-center gap-2 rounded-full bg-[linear-gradient(135deg,#3D60FE,#6B85FE)] px-5 py-3 text-sm font-bold text-white shadow-[0_14px_34px_rgba(83,114,254,0.24)]">
                New ticket
                <ArrowRight size={16} aria-hidden="true" />
              </Link>
            </div>

            <nav className="mt-7 flex gap-2 overflow-x-auto pb-1">
              {portalLinks.map((item) => {
                const Icon = item.icon
                const active = pathname === item.href

                return (
                  <Link
                    key={item.href}
                    href={item.href as Route}
                    className={`inline-flex shrink-0 items-center gap-2 rounded-full px-4 py-2.5 text-sm font-bold transition ${
                      active ? 'bg-black text-white shadow-[0_12px_30px_rgba(0,0,0,0.12)]' : 'border border-black/8 bg-white text-black/58 hover:border-[#5372FE]/30 hover:text-[#3D60FE]'
                    }`}
                  >
                    <Icon size={16} aria-hidden="true" />
                    {item.label}
                  </Link>
                )
              })}
            </nav>
          </div>
        </section>

        <section className="bg-[#FAFBFF] px-5 py-8 sm:px-8 lg:px-10">
          <div className="mx-auto max-w-7xl rounded-[2rem] bg-[#050505] p-5 text-white shadow-[0_30px_90px_rgba(20,28,60,0.14)] sm:p-8">
            {children}
          </div>
        </section>
      </main>

      <footer className="border-t border-black/8 bg-white px-5 py-8 text-sm text-black/40 sm:px-8 lg:px-10">
        <div className="mx-auto max-w-7xl">
          TechBuddy by Victor. Built for real-life tech support.
        </div>
      </footer>
    </div>
  )
}
