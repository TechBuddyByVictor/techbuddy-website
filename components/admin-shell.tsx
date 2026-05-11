'use client'

import Image from 'next/image'
import Link from 'next/link'
import type { Route } from 'next'
import { usePathname } from 'next/navigation'
import { CalendarDays, Home, LayoutDashboard, LogOut, Settings, Sparkles, Ticket, UsersRound } from 'lucide-react'

const adminLinks: Array<{ href: Route; label: string; icon: typeof LayoutDashboard }> = [
  { href: '/admin', label: 'Overview', icon: LayoutDashboard },
  { href: '/admin/customers', label: 'Customers', icon: UsersRound },
  { href: '/admin/memberships', label: 'Memberships', icon: Sparkles },
  { href: '/admin/appointments', label: 'Appointments', icon: CalendarDays },
  { href: '/admin/settings', label: 'Settings', icon: Settings },
]

export function AdminShell({
  title,
  description,
  children,
}: {
  title: string
  description?: string
  children: React.ReactNode
}) {
  const pathname = usePathname()

  return (
    <main className="min-h-screen bg-[#050505] text-white">
      <header className="sticky top-0 z-40 border-b border-white/10 bg-black/86 backdrop-blur-xl">
        <div className="mx-auto grid max-w-7xl grid-cols-[1fr_auto] items-center gap-4 px-5 py-4 sm:px-8 lg:grid-cols-[1fr_auto_1fr]">
          <Link href="/admin" className="flex min-w-0 items-center" aria-label="TechBuddy admin home">
            <Image
              src="/techbuddy-logo.png"
              alt="TechBuddy"
              width={850}
              height={252}
              priority
              className="h-11 w-auto max-w-[158px] object-contain brightness-0 invert sm:h-12 sm:max-w-[184px]"
            />
          </Link>

          <nav className="order-3 col-span-2 flex items-center justify-center gap-1 overflow-x-auto rounded-full border border-white/10 bg-white/[0.06] p-1 shadow-sm shadow-black/[0.2] lg:order-none lg:col-span-1">
            {adminLinks.map((item) => {
              const Icon = item.icon
              const active = pathname === item.href || (item.href !== '/admin' && pathname.startsWith(item.href))
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`inline-flex shrink-0 items-center gap-2 rounded-full px-4 py-2 text-sm font-bold transition ${
                    active ? 'bg-white text-black' : 'text-white/58 hover:bg-white/10 hover:text-white'
                  }`}
                >
                  <Icon size={16} aria-hidden="true" />
                  {item.label}
                </Link>
              )
            })}
          </nav>

          <div className="flex justify-end gap-2">
            <Link href="/" className="hidden items-center gap-2 rounded-full border border-white/10 px-3.5 py-2 text-xs font-bold text-white/64 transition hover:border-[#6B85FE]/40 hover:text-white sm:inline-flex">
              <Home size={14} aria-hidden="true" />
              Website
            </Link>
            <form action="/auth/signout" method="post">
              <button type="submit" className="inline-flex items-center gap-2 rounded-full bg-white px-3.5 py-2 text-xs font-bold text-black transition hover:bg-blue-50">
                <LogOut size={14} aria-hidden="true" />
                Sign out
              </button>
            </form>
          </div>
        </div>
      </header>

      <section className="border-b border-white/10 bg-[linear-gradient(180deg,rgba(83,114,254,0.16),rgba(255,255,255,0.02))] px-5 py-8 sm:px-8">
        <div className="mx-auto max-w-7xl">
          <p className="inline-flex items-center gap-2 rounded-full bg-[#5372FE]/16 px-3 py-1 text-xs font-black uppercase text-[#b9c4ff]">
            <Ticket size={14} aria-hidden="true" />
            Admin CRM
          </p>
          <h1 className="mt-4 text-4xl font-bold tracking-tight sm:text-5xl">{title}</h1>
          {description ? <p className="mt-3 max-w-3xl text-sm leading-6 text-white/56">{description}</p> : null}
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-5 py-8 sm:px-8">
        {children}
      </section>
    </main>
  )
}
