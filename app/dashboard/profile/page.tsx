'use client'

export const dynamic = 'force-dynamic'

import { useRouter } from 'next/navigation'
import { useEffect, useMemo, useState } from 'react'
import { MapPin, Save, UserRound } from 'lucide-react'
import { CustomerPortalShell } from '@/components/customer-portal-shell'
import { createClient } from '@/lib/supabase/client'
import type { Database } from '@/lib/supabase/types'

type Profile = Database['public']['Tables']['profiles']['Row']
type Address = Database['public']['Tables']['customer_addresses']['Row']

export default function ProfilePage() {
  const supabase = useMemo(() => createClient(), [])
  const router = useRouter()
  const [userId, setUserId] = useState('')
  const [profile, setProfile] = useState<Profile | null>(null)
  const [address, setAddress] = useState<Address | null>(null)
  const [notice, setNotice] = useState('')
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)

  useEffect(() => {
    const loadProfile = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser()

      if (!user) {
        router.push('/login')
        return
      }

      setUserId(user.id)

      const [{ data: profileData, error: profileError }, { data: addressData, error: addressError }] = await Promise.all([
        supabase.from('profiles').select('*').eq('id', user.id).single(),
        supabase.from('customer_addresses').select('*').eq('customer_id', user.id).order('created_at', { ascending: true }),
      ])

      if (profileError || addressError) {
        setNotice(profileError?.message ?? addressError?.message ?? '')
      }

      setProfile(profileData ?? null)
      setAddress(addressData?.[0] ?? null)
      setIsLoading(false)
    }

    void loadProfile()
  }, [router, supabase])

  const saveProfile = async (event: React.FormEvent) => {
    event.preventDefault()
    if (!profile || !userId) return

    setIsSaving(true)
    setNotice('')

    const profileUpdate = await supabase
      .from('profiles')
      .update({
        full_name: profile.full_name,
        phone: profile.phone,
        alternate_phone: profile.alternate_phone,
        preferred_contact: profile.preferred_contact,
      })
      .eq('id', userId)

    const addressFields = {
      label: address?.label ?? 'Home',
      street_line_1: address?.street_line_1 ?? '',
      street_line_2: address?.street_line_2 ?? null,
      city: address?.city ?? '',
      state: address?.state ?? '',
      postal_code: address?.postal_code ?? '',
      notes: address?.notes ?? null,
      is_primary: true,
    }

    const addressUpdate = address?.id
      ? await supabase.from('customer_addresses').update(addressFields).eq('id', address.id).eq('customer_id', userId)
      : await supabase.from('customer_addresses').insert({ ...addressFields, customer_id: userId }).select('*').single()

    if (profileUpdate.error || addressUpdate.error) {
      setNotice(profileUpdate.error?.message ?? addressUpdate.error?.message ?? 'Could not save profile')
    } else {
      if ('data' in addressUpdate && addressUpdate.data) {
        setAddress(addressUpdate.data)
      }
      setNotice('Your portal profile was saved.')
    }

    setIsSaving(false)
  }

  return (
    <CustomerPortalShell title="Profile and service address">
      {isLoading ? (
        <div className="h-[560px] animate-pulse rounded-[2rem] border border-white/10 bg-white/[0.06]" />
      ) : (
        <form onSubmit={saveProfile} className="grid gap-6 lg:grid-cols-[0.95fr_1.05fr]">
          <section className="rounded-[2rem] border border-white/10 bg-white/[0.06] p-6 shadow-2xl shadow-black/20">
            <div className="flex items-center gap-3">
              <UserRound className="text-[#6B85FE]" size={24} aria-hidden="true" />
              <div>
                <p className="text-sm font-bold text-[#6B85FE]">Customer info</p>
                <h2 className="text-2xl font-bold">How TechBuddy reaches you</h2>
              </div>
            </div>
            <div className="mt-6 grid gap-4">
              <label className="grid gap-2 text-sm font-semibold text-white/60">
                Full name
                <input value={profile?.full_name ?? ''} onChange={(event) => setProfile((current) => current ? { ...current, full_name: event.target.value } : current)} className="rounded-2xl border border-white/10 bg-black/40 px-4 py-3 text-white outline-none focus:border-[#5372FE]" />
              </label>
              <label className="grid gap-2 text-sm font-semibold text-white/60">
                Email
                <input value={profile?.email ?? ''} disabled className="rounded-2xl border border-white/10 bg-black/30 px-4 py-3 text-white/54 outline-none" />
              </label>
              <div className="grid gap-4 sm:grid-cols-2">
                <label className="grid gap-2 text-sm font-semibold text-white/60">
                  Phone
                  <input value={profile?.phone ?? ''} onChange={(event) => setProfile((current) => current ? { ...current, phone: event.target.value } : current)} className="rounded-2xl border border-white/10 bg-black/40 px-4 py-3 text-white outline-none focus:border-[#5372FE]" />
                </label>
                <label className="grid gap-2 text-sm font-semibold text-white/60">
                  Backup phone
                  <input value={profile?.alternate_phone ?? ''} onChange={(event) => setProfile((current) => current ? { ...current, alternate_phone: event.target.value } : current)} className="rounded-2xl border border-white/10 bg-black/40 px-4 py-3 text-white outline-none focus:border-[#5372FE]" />
                </label>
              </div>
              <label className="grid gap-2 text-sm font-semibold text-white/60">
                Preferred contact
                <select value={profile?.preferred_contact ?? 'email'} onChange={(event) => setProfile((current) => current ? { ...current, preferred_contact: event.target.value } : current)} className="rounded-2xl border border-white/10 bg-black/40 px-4 py-3 text-white outline-none focus:border-[#5372FE]">
                  <option value="email">Email</option>
                  <option value="phone">Phone call</option>
                  <option value="text">Text message</option>
                </select>
              </label>
            </div>
          </section>

          <section className="rounded-[2rem] border border-white/10 bg-white/[0.06] p-6 shadow-2xl shadow-black/20">
            <div className="flex items-center gap-3">
              <MapPin className="text-[#6B85FE]" size={24} aria-hidden="true" />
              <div>
                <p className="text-sm font-bold text-[#6B85FE]">Service address</p>
                <h2 className="text-2xl font-bold">Where appointments happen</h2>
              </div>
            </div>
            <div className="mt-6 grid gap-4">
              <label className="grid gap-2 text-sm font-semibold text-white/60">
                Address label
                <input value={address?.label ?? 'Home'} onChange={(event) => setAddress((current) => ({ ...(current ?? blankAddress(userId)), label: event.target.value }))} className="rounded-2xl border border-white/10 bg-black/40 px-4 py-3 text-white outline-none focus:border-[#5372FE]" />
              </label>
              <label className="grid gap-2 text-sm font-semibold text-white/60">
                Street address
                <input value={address?.street_line_1 ?? ''} onChange={(event) => setAddress((current) => ({ ...(current ?? blankAddress(userId)), street_line_1: event.target.value }))} className="rounded-2xl border border-white/10 bg-black/40 px-4 py-3 text-white outline-none focus:border-[#5372FE]" />
              </label>
              <label className="grid gap-2 text-sm font-semibold text-white/60">
                Apartment, suite, gate code
                <input value={address?.street_line_2 ?? ''} onChange={(event) => setAddress((current) => ({ ...(current ?? blankAddress(userId)), street_line_2: event.target.value }))} className="rounded-2xl border border-white/10 bg-black/40 px-4 py-3 text-white outline-none focus:border-[#5372FE]" />
              </label>
              <div className="grid gap-4 sm:grid-cols-[1fr_0.45fr_0.65fr]">
                <input aria-label="City" placeholder="City" value={address?.city ?? ''} onChange={(event) => setAddress((current) => ({ ...(current ?? blankAddress(userId)), city: event.target.value }))} className="rounded-2xl border border-white/10 bg-black/40 px-4 py-3 text-white outline-none placeholder:text-white/30 focus:border-[#5372FE]" />
                <input aria-label="State" placeholder="State" value={address?.state ?? ''} onChange={(event) => setAddress((current) => ({ ...(current ?? blankAddress(userId)), state: event.target.value }))} className="rounded-2xl border border-white/10 bg-black/40 px-4 py-3 text-white outline-none placeholder:text-white/30 focus:border-[#5372FE]" />
                <input aria-label="ZIP code" placeholder="ZIP" value={address?.postal_code ?? ''} onChange={(event) => setAddress((current) => ({ ...(current ?? blankAddress(userId)), postal_code: event.target.value }))} className="rounded-2xl border border-white/10 bg-black/40 px-4 py-3 text-white outline-none placeholder:text-white/30 focus:border-[#5372FE]" />
              </div>
              <label className="grid gap-2 text-sm font-semibold text-white/60">
                Notes for service visits
                <textarea value={address?.notes ?? ''} onChange={(event) => setAddress((current) => ({ ...(current ?? blankAddress(userId)), notes: event.target.value }))} className="min-h-28 rounded-2xl border border-white/10 bg-black/40 px-4 py-3 text-white outline-none focus:border-[#5372FE]" />
              </label>
            </div>
          </section>

          <div className="lg:col-span-2">
            {notice ? <p className="mb-4 rounded-2xl border border-[#5372FE]/20 bg-[#5372FE]/10 px-4 py-3 text-sm text-blue-100">{notice}</p> : null}
            <button disabled={isSaving} className="inline-flex items-center gap-2 rounded-full bg-[linear-gradient(135deg,#3D60FE,#6B85FE)] px-6 py-3 text-sm font-bold text-white shadow-[0_14px_34px_rgba(83,114,254,0.24)] disabled:cursor-not-allowed disabled:opacity-60">
              <Save size={17} aria-hidden="true" />
              {isSaving ? 'Saving...' : 'Save portal details'}
            </button>
          </div>
        </form>
      )}
    </CustomerPortalShell>
  )
}

function blankAddress(customerId: string): Address {
  return {
    id: '',
    customer_id: customerId,
    label: 'Home',
    street_line_1: '',
    street_line_2: null,
    city: '',
    state: '',
    postal_code: '',
    notes: null,
    is_primary: true,
    created_at: '',
    updated_at: '',
  }
}
