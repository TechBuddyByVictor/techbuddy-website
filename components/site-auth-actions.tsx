'use client'

import Link from 'next/link'
import { useEffect, useMemo, useState } from 'react'
import { ArrowRight, LogIn, LogOut, Plus, UserRound } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { signedOutPortalAuthState, type PortalAuthState } from '@/lib/portal-auth-state'

function getDisplayName(profileName?: string | null, metadataName?: unknown) {
  const metadataFullName = typeof metadataName === 'string' ? metadataName.trim() : ''
  const name = profileName?.trim() || metadataFullName
  return name || 'Customer'
}

function getFirstName(displayName: string) {
  return displayName.trim().split(/\s+/)[0] || 'Customer'
}

function usePortalSession(initialAuthState?: PortalAuthState) {
  const supabase = useMemo(() => createClient(), [])
  const [authState, setAuthState] = useState<PortalAuthState>(
    initialAuthState ?? {
      ...signedOutPortalAuthState,
      isLoading: true,
    },
  )

  useEffect(() => {
    let isMounted = true

    const loadSession = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser()

      if (!isMounted) return

      if (!user) {
        setAuthState(signedOutPortalAuthState)
        return
      }

      const { data: profile } = await supabase.from('profiles').select('full_name').eq('id', user.id).maybeSingle()

      if (!isMounted) return

      setAuthState({
        isLoading: false,
        isLoggedIn: true,
        displayName: getDisplayName(profile?.full_name, user.user_metadata?.full_name),
      })
    }

    void loadSession()

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(() => {
      void loadSession()
    })

    return () => {
      isMounted = false
      subscription.unsubscribe()
    }
  }, [supabase])

  return { authState, setAuthState, supabase }
}

export function SiteAuthActions({ initialAuthState }: { initialAuthState?: PortalAuthState }) {
  const { authState } = usePortalSession(initialAuthState)

  if (authState.isLoading) {
    return (
      <div className="flex items-center gap-2">
        <span className="hidden h-9 w-20 animate-pulse rounded-full bg-black/[0.04] sm:inline-flex" />
        <span className="h-9 w-24 animate-pulse rounded-full bg-black" />
      </div>
    )
  }

  if (authState.isLoggedIn) {
    return (
      <div className="flex min-w-0 shrink-0 items-center rounded-full border border-[#5372FE]/18 bg-[#F4F6FF] p-1 shadow-sm shadow-[#5372FE]/10">
        <Link
          href="/dashboard"
          className="inline-flex min-w-0 items-center gap-2 rounded-full bg-black px-3.5 py-2 text-sm font-bold text-white transition hover:bg-[#2a2a2a] sm:px-4"
          title={`Open ${authState.displayName}'s portal`}
        >
          <UserRound size={15} aria-hidden="true" />
          <span className="hidden sm:inline">My portal</span>
          <span className="sm:hidden">Portal</span>
          <ArrowRight className="hidden sm:block" size={15} aria-hidden="true" />
        </Link>
        <form action="/auth/signout" method="post" className="hidden lg:block">
          <button type="submit" className="rounded-full px-3 py-2 text-sm font-bold text-black/54 transition hover:bg-white/80 hover:text-black" aria-label="Sign out">
            <LogOut size={15} aria-hidden="true" />
          </button>
        </form>
      </div>
    )
  }

  return (
    <div className="flex items-center gap-2">
      <Link href="/login" className="hidden rounded-full px-4 py-2 text-sm font-bold text-black/64 transition hover:bg-black/[0.04] sm:inline-flex">
        Log in
      </Link>
      <Link href="/login" className="inline-flex items-center gap-2 rounded-full bg-black px-4 py-2 text-sm font-bold text-white transition hover:bg-[#2a2a2a]">
        Portal
        <ArrowRight size={15} aria-hidden="true" />
      </Link>
    </div>
  )
}

export function HeaderLoginButton({ initialAuthState, compact = false }: { initialAuthState?: PortalAuthState; compact?: boolean }) {
  const { authState } = usePortalSession(initialAuthState)
  const firstName = getFirstName(authState.displayName)

  if (authState.isLoading) {
    return <span className={`${compact ? 'h-9 w-20' : 'h-10 w-24'} animate-pulse rounded-full bg-black/[0.08]`} />
  }

  const label = authState.isLoggedIn ? `Hi, ${firstName}` : 'Log in'

  return (
    <Link
      href={authState.isLoggedIn ? '/dashboard' : '/login'}
      className={`interactive-lift inline-flex shrink-0 items-center justify-center gap-1.5 rounded-full bg-black text-xs font-bold text-white transition hover:bg-[#2a2a2a] ${
        compact ? 'h-9 px-3 shadow-sm shadow-black/[0.08]' : 'px-3 py-2 shadow-[0_10px_22px_rgba(0,0,0,0.12)] sm:px-3.5'
      }`}
      title={authState.isLoggedIn ? `Open ${authState.displayName}'s dashboard` : 'Log in'}
    >
      {authState.isLoggedIn ? <UserRound size={14} aria-hidden="true" /> : <LogIn size={14} aria-hidden="true" />}
      <span>{label}</span>
      {compact ? null : <ArrowRight size={13} aria-hidden="true" />}
    </Link>
  )
}

export function SitePortalCardAction({ initialAuthState }: { initialAuthState?: PortalAuthState }) {
  const { authState } = usePortalSession(initialAuthState)

  if (authState.isLoading) {
    return <span className="mt-5 inline-flex h-10 w-28 animate-pulse rounded-full bg-[#5372FE]/20" />
  }

  return (
    <Link href={authState.isLoggedIn ? '/dashboard' : '/login'} className="mt-5 inline-flex items-center gap-2 rounded-full bg-[#5372FE] px-4 py-2 text-sm font-bold text-white">
      {authState.isLoggedIn ? 'Dashboard' : 'Log in'}
      <ArrowRight size={15} aria-hidden="true" />
    </Link>
  )
}

export function SiteAccountSummary({ initialAuthState }: { initialAuthState?: PortalAuthState }) {
  const { authState } = usePortalSession(initialAuthState)
  const firstName = getFirstName(authState.displayName)

  if (authState.isLoading) {
    return (
      <div className="rounded-3xl bg-[#F4F6FF] p-5">
        <span className="block h-4 w-32 animate-pulse rounded-full bg-[#5372FE]/16" />
        <span className="mt-3 block h-16 w-full animate-pulse rounded-2xl bg-white/70" />
        <span className="mt-5 inline-flex h-9 w-24 animate-pulse rounded-full bg-[#5372FE]/20" />
      </div>
    )
  }

  return (
    <div className="rounded-3xl bg-[#F4F6FF] p-5">
      <p className="text-sm font-bold text-black">{authState.isLoggedIn ? `Welcome back, ${firstName}` : 'Existing customers'}</p>
      <p className="mt-2 text-sm leading-6 text-black/54">
        {authState.isLoggedIn ? 'Your account is ready when you need service history, invoices, or a new request.' : 'Log in to manage requests, account details, and invoices.'}
      </p>
      <Link href={authState.isLoggedIn ? '/dashboard' : '/login'} className="mt-5 inline-flex items-center gap-2 rounded-full bg-[#5372FE] px-4 py-2 text-sm font-bold text-white">
        {authState.isLoggedIn ? 'Go to dashboard' : 'Log in'}
        <ArrowRight size={15} aria-hidden="true" />
      </Link>
    </div>
  )
}

export function PortalLandingActions({ initialAuthState }: { initialAuthState?: PortalAuthState }) {
  const { authState } = usePortalSession(initialAuthState)

  if (authState.isLoading) {
    return (
      <div className="mt-8 flex flex-col gap-3 sm:flex-row">
        <span className="h-[50px] w-44 animate-pulse rounded-full bg-[#5372FE]/20" />
        <span className="h-[50px] w-28 animate-pulse rounded-full bg-black/[0.06]" />
      </div>
    )
  }

  if (authState.isLoggedIn) {
    return (
      <div className="mt-8 flex flex-col gap-3 sm:flex-row">
        <Link href="/dashboard" className="interactive-lift inline-flex items-center justify-center gap-2 rounded-full bg-[linear-gradient(135deg,#3D60FE,#6B85FE)] px-6 py-3.5 text-sm font-bold text-white shadow-[0_14px_34px_rgba(83,114,254,0.24)]">
          Open my portal
          <ArrowRight size={17} aria-hidden="true" />
        </Link>
        <Link href="/dashboard/new-ticket" className="interactive-lift inline-flex items-center justify-center gap-2 rounded-full border border-black/10 bg-white px-6 py-3.5 text-sm font-bold text-black hover:border-black/18 hover:bg-black/[0.025]">
          <Plus size={17} aria-hidden="true" />
          New ticket
        </Link>
      </div>
    )
  }

  return (
    <div className="mt-8 flex flex-col gap-3 sm:flex-row">
      <Link href="/login" className="interactive-lift inline-flex items-center justify-center gap-2 rounded-full bg-[linear-gradient(135deg,#3D60FE,#6B85FE)] px-6 py-3.5 text-sm font-bold text-white shadow-[0_14px_34px_rgba(83,114,254,0.24)]">
        Log in to portal
        <ArrowRight size={17} aria-hidden="true" />
      </Link>
      <Link href="/register" className="interactive-lift inline-flex items-center justify-center rounded-full border border-black/10 bg-white px-6 py-3.5 text-sm font-bold text-black hover:border-black/18 hover:bg-black/[0.025]">
        Create account
      </Link>
    </div>
  )
}

export function PortalCtaButton({
  signedOutLabel = 'Open portal',
  signedInLabel = 'Open my portal',
  className = 'inline-flex items-center justify-center gap-2 rounded-full bg-white px-6 py-3.5 text-sm font-bold text-black',
  initialAuthState,
}: {
  signedOutLabel?: string
  signedInLabel?: string
  className?: string
  initialAuthState?: PortalAuthState
}) {
  const { authState } = usePortalSession(initialAuthState)

  if (authState.isLoading) {
    return <span className="inline-flex h-[50px] w-36 animate-pulse rounded-full bg-white/20" />
  }

  return (
    <Link href={authState.isLoggedIn ? '/dashboard' : '/login'} className={className}>
      {authState.isLoggedIn ? signedInLabel : signedOutLabel}
      <ArrowRight size={17} aria-hidden="true" />
    </Link>
  )
}
