'use client'

import Image from 'next/image'
import Link from 'next/link'
import type { Route } from 'next'
import { usePathname } from 'next/navigation'
import { useState } from 'react'
import { Menu, X } from 'lucide-react'
import { HeaderLoginButton } from '@/components/site-auth-actions'
import type { PortalAuthState } from '@/lib/portal-auth-state'

export function SiteMobileHeader({
  navItems,
  initialAuthState,
}: {
  navItems: Array<{ href: Route; label: string }>
  initialAuthState: PortalAuthState
}) {
  const [isOpen, setIsOpen] = useState(false)
  const pathname = usePathname()

  return (
    <div className="relative lg:hidden">
      <div className="mx-auto flex max-w-7xl items-center justify-between gap-3 px-4 py-3 sm:px-6">
        <Link href="/" className="flex min-w-0 items-center" aria-label="TechBuddy home">
          <Image
            src="/techbuddy-logo.png"
            alt="TechBuddy"
            width={850}
            height={252}
            priority
            className="h-10 w-auto max-w-[148px] object-contain"
          />
        </Link>

        <div className="flex shrink-0 items-center gap-2">
          <HeaderLoginButton initialAuthState={initialAuthState} compact />
          <button
            type="button"
            onClick={() => setIsOpen((current) => !current)}
            className="grid h-10 w-10 place-items-center rounded-full border border-black/10 bg-white text-black shadow-sm shadow-black/[0.03] transition active:scale-95"
            aria-label={isOpen ? 'Close navigation menu' : 'Open navigation menu'}
            aria-expanded={isOpen}
            aria-controls="site-mobile-menu-panel"
          >
            {isOpen ? <X size={19} aria-hidden="true" /> : <Menu size={19} aria-hidden="true" />}
          </button>
        </div>
      </div>

      {isOpen ? (
        <nav id="site-mobile-menu-panel" className="absolute inset-x-0 top-full z-[70] border-t border-black/8 bg-white px-4 py-3 shadow-[0_18px_40px_rgba(20,28,60,0.12)] sm:px-6">
          <div className="mx-auto grid max-w-7xl gap-2">
            {navItems.map((item) => {
              const active = pathname === item.href

              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setIsOpen(false)}
                  className={`flex items-center justify-between rounded-2xl px-4 py-3.5 text-sm font-bold transition ${
                    active ? 'bg-black text-white' : 'bg-[#F4F6FF] text-black/68 active:bg-[#E9EDFF]'
                  }`}
                >
                  {item.label}
                  <span className={`h-2 w-2 rounded-full ${active ? 'bg-white' : 'bg-[#5372FE]'}`} aria-hidden="true" />
                </Link>
              )
            })}
          </div>
        </nav>
      ) : null}
    </div>
  )
}
