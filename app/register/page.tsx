'use client'

export const dynamic = 'force-dynamic'

import Link from 'next/link'
import Image from 'next/image'
import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import { ArrowLeft, CheckCircle2, UserPlus } from 'lucide-react'
import type { Route } from 'next'
import { createClient } from '@/lib/supabase/client'

export default function RegisterPage() {
  const [fullName, setFullName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [message, setMessage] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const router = useRouter()

  useEffect(() => {
    let isMounted = true
    const supabase = createClient()

    const redirectSignedInUser = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser()

      if (!isMounted || !user) return

      const { data: profile } = await supabase.from('profiles').select('role').eq('id', user.id).maybeSingle()
      router.replace((profile?.role === 'admin' ? '/admin' : '/dashboard') as Route)
      router.refresh()
    }

    void redirectSignedInUser()

    return () => {
      isMounted = false
    }
  }, [router])

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault()
    setMessage('')
    setIsSubmitting(true)

    const supabase = createClient()
    const normalizedEmail = email.trim().toLowerCase()

    const { data, error } = await supabase.auth.signUp({
      email: normalizedEmail,
      password,
      options: {
        emailRedirectTo: `${window.location.origin}/auth/callback`,
        data: {
          full_name: fullName.trim(),
        },
      },
    })

    if (error) {
      setMessage(error.message)
      setIsSubmitting(false)
      return
    }

    if (data.user && data.session) {
      await supabase.from('profiles').upsert({
        id: data.user.id,
        email: normalizedEmail,
        full_name: fullName.trim(),
        role: 'customer',
      })
      router.push('/dashboard')
      router.refresh()
      return
    }

    setMessage('Check your email to confirm your account, then log in.')
    setIsSubmitting(false)
  }

  return (
    <main className="min-h-screen bg-[linear-gradient(180deg,#F4F6FF_0%,#ffffff_62%)] px-5 py-6 text-black sm:px-8 lg:px-10">
      <header className="mx-auto flex max-w-7xl items-center justify-between gap-4">
        <Link href="/" className="flex min-w-0 items-center" aria-label="TechBuddy home">
          <Image
            src="/techbuddy-logo.png"
            alt="TechBuddy"
            width={850}
            height={252}
            priority
            className="h-11 w-auto max-w-[158px] object-contain sm:h-12 sm:max-w-[184px]"
          />
        </Link>
        <Link href="/" className="inline-flex items-center gap-2 rounded-full border border-black/10 bg-white px-3.5 py-2 text-xs font-bold text-black/64 shadow-sm shadow-black/[0.03] transition hover:border-[#5372FE]/30 hover:text-[#3D60FE]">
          <ArrowLeft size={14} aria-hidden="true" />
          Website
        </Link>
      </header>

      <section className="mx-auto grid min-h-[calc(100vh-96px)] max-w-7xl items-center gap-10 py-12 lg:grid-cols-[0.9fr_1.1fr]">
        <div className="hidden lg:block">
          <p className="text-sm font-bold text-[#5372FE]">New customer setup</p>
          <h1 className="font-display mt-4 max-w-3xl text-6xl font-semibold leading-[0.96] tracking-normal text-black">
            Start with an account that keeps support organized.
          </h1>
          <p className="mt-6 max-w-xl text-lg leading-8 text-black/58">
            Create your account once, then use it whenever you need help with devices, Wi-Fi, invoices, or memberships.
          </p>
          <div className="mt-8 grid max-w-lg gap-3">
            {['Save your service details', 'Request help without starting over', 'Keep invoices and updates together'].map((item) => (
              <div key={item} className="flex items-center gap-3 rounded-2xl bg-white px-4 py-3 text-sm font-bold text-black/68 shadow-sm shadow-black/[0.03]">
                <CheckCircle2 className="text-[#5372FE]" size={18} aria-hidden="true" />
                {item}
              </div>
            ))}
          </div>
        </div>

        <section className="mx-auto w-full max-w-md rounded-[2rem] border border-black/8 bg-white p-7 shadow-[0_30px_90px_rgba(20,28,60,0.12)] sm:p-8">
          <div className="grid h-12 w-12 place-items-center rounded-2xl bg-[#F4F6FF] text-[#5372FE]">
            <UserPlus size={23} aria-hidden="true" />
          </div>
          <h2 className="mt-6 text-3xl font-bold tracking-tight">Create account</h2>
          <p className="mt-2 text-sm leading-6 text-black/56">
            Set up your TechBuddy account for requests, invoices, and service details.
          </p>

          <form onSubmit={handleSubmit} className="mt-8 space-y-5">
            <label className="block">
              <span className="text-sm font-bold text-black/70">Full name</span>
              <input
                value={fullName}
                onChange={(event) => setFullName(event.target.value)}
                required
                className="mt-2 block w-full rounded-2xl border border-black/10 bg-[#FAFBFF] px-4 py-3 text-black outline-none placeholder:text-black/34 focus:border-[#5372FE] focus:ring-2 focus:ring-[#5372FE]/20"
                placeholder="Full name"
              />
            </label>
            <label className="block">
              <span className="text-sm font-bold text-black/70">Email address</span>
              <input
                type="email"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                required
                className="mt-2 block w-full rounded-2xl border border-black/10 bg-[#FAFBFF] px-4 py-3 text-black outline-none placeholder:text-black/34 focus:border-[#5372FE] focus:ring-2 focus:ring-[#5372FE]/20"
                placeholder="you@example.com"
              />
            </label>
            <label className="block">
              <span className="text-sm font-bold text-black/70">Password</span>
              <input
                type="password"
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                required
                minLength={8}
                className="mt-2 block w-full rounded-2xl border border-black/10 bg-[#FAFBFF] px-4 py-3 text-black outline-none placeholder:text-black/34 focus:border-[#5372FE] focus:ring-2 focus:ring-[#5372FE]/20"
                placeholder="At least 8 characters"
              />
            </label>

            {message && <p className="rounded-2xl bg-[#F4F6FF] px-4 py-3 text-sm font-semibold text-black/68">{message}</p>}

            <button
              type="submit"
              disabled={isSubmitting}
              className="flex w-full justify-center rounded-full bg-black px-5 py-3 text-sm font-bold text-white transition hover:-translate-y-0.5 hover:bg-[#2a2a2a] disabled:cursor-not-allowed disabled:opacity-60"
            >
              {isSubmitting ? 'Creating account...' : 'Create account'}
            </button>
          </form>

          <p className="mt-6 text-center text-sm text-black/54">
            Already have an account?{' '}
            <Link href="/login" className="font-bold text-[#5372FE] hover:text-[#3D60FE]">
              Log in
            </Link>
          </p>
        </section>
      </section>
    </main>
  )
}
