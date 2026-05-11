import Image from 'next/image'
import Link from 'next/link'
import { redirect } from 'next/navigation'
import { ArrowLeft, CheckCircle2, LockKeyhole } from 'lucide-react'
import { createClient } from '@/lib/supabase/server'

export const dynamic = 'force-dynamic'

function getLoginErrorReason(message: string) {
  const lowerMessage = message.toLowerCase()

  if (lowerMessage.includes('invalid login credentials')) {
    return 'The email or password does not match a TechBuddy account.'
  }

  if (lowerMessage.includes('email not confirmed')) {
    return 'This account still needs email confirmation before it can log in.'
  }

  if (lowerMessage.includes('rate limit') || lowerMessage.includes('too many')) {
    return 'There have been too many login attempts. Please wait a moment and try again.'
  }

  return 'Supabase could not complete the login request. Please check the email and password, then try again.'
}

async function loginAction(formData: FormData) {
  'use server'

  const email = String(formData.get('email') ?? '').trim().toLowerCase()
  const password = String(formData.get('password') ?? '')

  if (!email || !password) {
    redirect('/login?error=Email%20and%20password%20are%20required.')
  }

  const supabase = await createClient()
  const { error } = await supabase.auth.signInWithPassword({
    email,
    password,
  })

  if (error) {
    console.error('Login error', error)
    const message = encodeURIComponent(error.message)
    redirect(`/login?error=${message}`)
  }

  redirect('/dashboard')
}

export default async function LoginPage({
  searchParams,
}: {
  searchParams?: Promise<{ error?: string }>
}) {
  const params = await searchParams
  const errorMessage = params?.error ? decodeURIComponent(params.error) : ''
  const errorReason = errorMessage ? getLoginErrorReason(errorMessage) : ''

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
          <p className="text-sm font-bold text-[#5372FE]">Welcome back</p>
          <h1 className="font-display mt-4 max-w-3xl text-6xl font-semibold leading-[0.96] tracking-normal text-black">
            Your TechBuddy account, right where the website is.
          </h1>
          <p className="mt-6 max-w-xl text-lg leading-8 text-black/58">
            Log in once and the site becomes personal: your dashboard is one click away, and your service history stays organized.
          </p>
          <div className="mt-8 grid max-w-lg gap-3">
            {['Service requests and updates', 'Invoices and account details', 'Membership and service history'].map((item) => (
              <div key={item} className="flex items-center gap-3 rounded-2xl bg-white px-4 py-3 text-sm font-bold text-black/68 shadow-sm shadow-black/[0.03]">
                <CheckCircle2 className="text-[#5372FE]" size={18} aria-hidden="true" />
                {item}
              </div>
            ))}
          </div>
        </div>

        <section className="mx-auto w-full max-w-md rounded-[2rem] border border-black/8 bg-white p-7 shadow-[0_30px_90px_rgba(20,28,60,0.12)] sm:p-8">
          <div className="grid h-12 w-12 place-items-center rounded-2xl bg-[#F4F6FF] text-[#5372FE]">
            <LockKeyhole size={23} aria-hidden="true" />
          </div>
          <h2 className="mt-6 text-3xl font-bold tracking-tight">Log in</h2>
          <p className="mt-2 text-sm leading-6 text-black/56">
            Continue to your personalized TechBuddy dashboard.
          </p>

          <form action={loginAction} className="mt-8 space-y-5">
            <label className="block">
              <span className="text-sm font-bold text-black/70">Email address</span>
              <input
                type="email"
                name="email"
                autoComplete="username"
                required
                className="mt-2 block w-full rounded-2xl border border-black/10 bg-[#FAFBFF] px-4 py-3 text-black outline-none placeholder:text-black/34 focus:border-[#5372FE] focus:ring-2 focus:ring-[#5372FE]/20"
                placeholder="you@example.com"
              />
            </label>
            <label className="block">
              <span className="text-sm font-bold text-black/70">Password</span>
              <input
                type="password"
                name="password"
                autoComplete="current-password"
                required
                className="mt-2 block w-full rounded-2xl border border-black/10 bg-[#FAFBFF] px-4 py-3 text-black outline-none placeholder:text-black/34 focus:border-[#5372FE] focus:ring-2 focus:ring-[#5372FE]/20"
                placeholder="Password"
              />
            </label>

            {errorMessage ? (
              <div className="rounded-2xl bg-red-50 px-4 py-3 text-sm text-red-800">
                <p className="font-bold">{errorMessage}</p>
                <p className="mt-1 leading-6 text-red-700">{errorReason}</p>
              </div>
            ) : null}

            <button
              type="submit"
              className="flex w-full justify-center rounded-full bg-black px-5 py-3 text-sm font-bold text-white transition hover:-translate-y-0.5 hover:bg-[#2a2a2a]"
            >
              Log in
            </button>
          </form>

          <p className="mt-6 text-center text-sm text-black/54">
            New customer?{' '}
            <Link href="/register" className="font-bold text-[#5372FE] hover:text-[#3D60FE]">
              Create an account
            </Link>
          </p>
        </section>
      </section>
    </main>
  )
}
