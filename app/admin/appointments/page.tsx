'use client'

export const dynamic = 'force-dynamic'

import Link from 'next/link'
import type { Route } from 'next'
import { useRouter } from 'next/navigation'
import { useEffect, useMemo, useState } from 'react'
import { CalendarDays, Clock3, MapPin, Plus } from 'lucide-react'
import { AdminShell } from '@/components/admin-shell'
import { createClient } from '@/lib/supabase/client'
import type { Database } from '@/lib/supabase/types'

type Profile = Database['public']['Tables']['profiles']['Row']
type Appointment = Database['public']['Tables']['appointments']['Row']

const statuses = ['scheduled', 'confirmed', 'completed', 'cancelled']

export default function AdminAppointmentsPage() {
  const router = useRouter()
  const supabase = useMemo(() => createClient(), [])
  const [customers, setCustomers] = useState<Profile[]>([])
  const [appointments, setAppointments] = useState<Appointment[]>([])
  const [customerId, setCustomerId] = useState('')
  const [appointmentType, setAppointmentType] = useState('service')
  const [scheduledAt, setScheduledAt] = useState('')
  const [duration, setDuration] = useState(60)
  const [address, setAddress] = useState('')
  const [technician, setTechnician] = useState('Victor')
  const [notes, setNotes] = useState('')
  const [notice, setNotice] = useState('')
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)

  const loadAppointments = async () => {
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      router.push('/login?redirectTo=/admin/appointments')
      return
    }

    const [{ data: customerData, error: customerError }, { data: appointmentData, error: appointmentError }] = await Promise.all([
      supabase.from('profiles').select('*').eq('role', 'customer').order('full_name', { ascending: true }),
      supabase.from('appointments').select('*').order('scheduled_at', { ascending: false }),
    ])

    const error = customerError ?? appointmentError
    if (error) {
      setNotice(error.message)
    }

    setCustomers(customerData ?? [])
    setAppointments(appointmentData ?? [])
    setCustomerId((current) => current || customerData?.[0]?.id || '')
    setIsLoading(false)
  }

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    void loadAppointments()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const customerById = new Map(customers.map((customer) => [customer.id, customer]))

  const createAppointment = async (event: React.FormEvent) => {
    event.preventDefault()
    if (!customerId || !scheduledAt) return

    setIsSaving(true)
    setNotice('')

    const { error } = await supabase.from('appointments').insert({
      customer_id: customerId,
      appointment_type: appointmentType,
      scheduled_at: new Date(scheduledAt).toISOString(),
      duration_minutes: duration,
      status: 'scheduled',
      notes: notes || null,
      address: address || null,
      technician: technician || null,
    })

    if (error) {
      setNotice(error.message)
    } else {
      setNotice('Appointment created.')
      setAppointmentType('service')
      setScheduledAt('')
      setAddress('')
      setTechnician('Victor')
      setNotes('')
      await loadAppointments()
    }

    setIsSaving(false)
  }

  const updateStatus = async (appointment: Appointment, status: string) => {
    const { error } = await supabase.from('appointments').update({ status }).eq('id', appointment.id)
    if (error) {
      setNotice(error.message)
    } else {
      setAppointments((current) => current.map((item) => item.id === appointment.id ? { ...item, status } : item))
    }
  }

  return (
    <AdminShell title="Appointments" description="Schedule customer appointments and update visit status.">
      {notice ? <p className="mb-5 rounded-2xl border border-[#6B85FE]/20 bg-[#5372FE]/10 px-4 py-3 text-sm text-blue-100">{notice}</p> : null}

      <div className="grid gap-6 xl:grid-cols-[0.7fr_1fr]">
        <form onSubmit={createAppointment} className="rounded-[2rem] border border-white/10 bg-white/[0.06] p-6 shadow-2xl shadow-black/20">
          <div className="flex items-center gap-3">
            <Plus className="text-[#6B85FE]" size={24} aria-hidden="true" />
            <h2 className="text-2xl font-bold">Set appointment</h2>
          </div>
          <div className="mt-6 grid gap-4">
            <select value={customerId} onChange={(event) => setCustomerId(event.target.value)} className="rounded-2xl border border-white/10 bg-black/40 px-4 py-3 text-white outline-none">
              {customers.map((customer) => <option key={customer.id} value={customer.id}>{customer.full_name || customer.email}</option>)}
            </select>
            <select value={appointmentType} onChange={(event) => setAppointmentType(event.target.value)} className="rounded-2xl border border-white/10 bg-black/40 px-4 py-3 text-white outline-none">
              <option value="service">Service</option>
              <option value="remote_support">Remote support</option>
              <option value="consultation">Consultation</option>
              <option value="follow_up">Follow-up</option>
              <option value="installation">Installation</option>
            </select>
            <input type="datetime-local" value={scheduledAt} onChange={(event) => setScheduledAt(event.target.value)} required className="rounded-2xl border border-white/10 bg-black/40 px-4 py-3 text-white outline-none" />
            <input type="number" min={15} step={15} value={duration} onChange={(event) => setDuration(Number(event.target.value))} className="rounded-2xl border border-white/10 bg-black/40 px-4 py-3 text-white outline-none" />
            <input value={address} onChange={(event) => setAddress(event.target.value)} placeholder="Appointment address" className="rounded-2xl border border-white/10 bg-black/40 px-4 py-3 text-white outline-none placeholder:text-white/30" />
            <input value={technician} onChange={(event) => setTechnician(event.target.value)} placeholder="Technician" className="rounded-2xl border border-white/10 bg-black/40 px-4 py-3 text-white outline-none placeholder:text-white/30" />
            <textarea value={notes} onChange={(event) => setNotes(event.target.value)} placeholder="Appointment notes" className="min-h-28 rounded-2xl border border-white/10 bg-black/40 px-4 py-3 text-white outline-none placeholder:text-white/30" />
            <button disabled={isSaving || customers.length === 0} className="rounded-full bg-white px-5 py-3 text-sm font-bold text-black disabled:cursor-not-allowed disabled:opacity-60">
              {isSaving ? 'Scheduling...' : 'Schedule appointment'}
            </button>
          </div>
        </form>

        <section className="overflow-hidden rounded-[2rem] border border-white/10 bg-white/[0.055] shadow-2xl shadow-black/20">
          <div className="border-b border-white/10 bg-black/40 px-5 py-4">
            <p className="text-sm font-bold text-[#b9c4ff]">Calendar</p>
            <h2 className="text-2xl font-bold">All appointments</h2>
          </div>

          {isLoading ? (
            <div className="grid gap-3 p-5">
              {[1, 2, 3].map((item) => <div key={item} className="h-24 animate-pulse rounded-2xl bg-white/[0.06]" />)}
            </div>
          ) : appointments.length === 0 ? (
            <div className="p-10 text-center">
              <CalendarDays className="mx-auto text-[#6B85FE]" size={34} aria-hidden="true" />
              <h2 className="mt-4 text-2xl font-bold">No appointments yet</h2>
            </div>
          ) : (
            <div className="divide-y divide-white/10">
              {appointments.map((appointment) => {
                const customer = customerById.get(appointment.customer_id)
                return (
                  <article key={appointment.id} className="grid gap-4 p-5 transition hover:bg-white/[0.035] lg:grid-cols-[1fr_0.7fr_0.5fr] lg:items-center">
                    <div>
                      <p className="font-bold capitalize">{appointment.appointment_type.replaceAll('_', ' ')}</p>
                      <p className="mt-1 text-sm text-white/46">{customer?.full_name ?? customer?.email ?? 'Unknown customer'}</p>
                      {appointment.address ? <p className="mt-1 flex items-center gap-2 text-sm text-white/46"><MapPin size={15} aria-hidden="true" />{appointment.address}</p> : null}
                      {appointment.technician ? <p className="mt-1 text-sm text-white/46">Technician: {appointment.technician}</p> : null}
                    </div>
                    <p className="flex items-center gap-2 text-sm text-white/60">
                      <Clock3 size={15} aria-hidden="true" />
                      {formatDateTime(appointment.scheduled_at)}
                    </p>
                    <div className="grid gap-2">
                      <select value={appointment.status} onChange={(event) => updateStatus(appointment, event.target.value)} className="rounded-2xl border border-white/10 bg-black/40 px-3 py-2 text-sm font-bold capitalize text-white outline-none">
                        {statuses.map((status) => <option key={status} value={status}>{status}</option>)}
                      </select>
                      <Link href={`/admin/customers/${appointment.customer_id}` as Route} className="text-center text-xs font-bold text-[#b9c4ff] hover:text-white">Open customer</Link>
                    </div>
                  </article>
                )
              })}
            </div>
          )}
        </section>
      </div>
    </AdminShell>
  )
}

function formatDateTime(value: string) {
  return new Intl.DateTimeFormat('en-US', {
    month: 'short',
    day: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
  }).format(new Date(value))
}
