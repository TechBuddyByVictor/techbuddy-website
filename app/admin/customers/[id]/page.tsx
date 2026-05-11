'use client'

export const dynamic = 'force-dynamic'

import Link from 'next/link'
import type { Route } from 'next'
import Image from 'next/image'
import { useParams, useRouter } from 'next/navigation'
import { useEffect, useMemo, useState } from 'react'
import { ArrowLeft, Camera, CalendarDays, ClipboardCheck, Save, Sparkles, Ticket, UserRound } from 'lucide-react'
import { AdminShell } from '@/components/admin-shell'
import { membershipPlans } from '@/lib/membership-plans'
import { createClient } from '@/lib/supabase/client'
import { resolveServicePhotoUrls } from '@/lib/supabase/service-photo-urls'
import type { Database } from '@/lib/supabase/types'

type Profile = Database['public']['Tables']['profiles']['Row']
type Address = Database['public']['Tables']['customer_addresses']['Row']
type Appointment = Database['public']['Tables']['appointments']['Row']
type Membership = Database['public']['Tables']['customer_memberships']['Row']
type Ticket = Database['public']['Tables']['support_tickets']['Row']
type ServiceRecord = Database['public']['Tables']['service_records']['Row']
type ServicePhoto = Database['public']['Tables']['service_record_photos']['Row']
type ServiceRecordWithPhotos = ServiceRecord & { photos: ServicePhoto[] }

const membershipStatuses = ['interested', 'active', 'paused', 'cancelled']
const appointmentStatuses = ['scheduled', 'confirmed', 'completed', 'cancelled']
const warrantyStatuses = ['active', 'no_warranty', 'parts_only', 'labor_only', 'expired']
const serviceRecordPhotosBucket = 'service-record-photos'
const allowedPhotoTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/gif']
const maxPhotoSize = 10 * 1024 * 1024

export default function AdminCustomerDetailPage() {
  const params = useParams<{ id: string }>()
  const router = useRouter()
  const supabase = useMemo(() => createClient(), [])
  const [profile, setProfile] = useState<Profile | null>(null)
  const [address, setAddress] = useState<Address | null>(null)
  const [memberships, setMemberships] = useState<Membership[]>([])
  const [appointments, setAppointments] = useState<Appointment[]>([])
  const [tickets, setTickets] = useState<Ticket[]>([])
  const [serviceRecords, setServiceRecords] = useState<ServiceRecordWithPhotos[]>([])
  const [adminId, setAdminId] = useState('')
  const [membershipPlan, setMembershipPlan] = useState(membershipPlans[0].name)
  const [membershipStatus, setMembershipStatus] = useState('active')
  const [appointmentType, setAppointmentType] = useState('service')
  const [appointmentDate, setAppointmentDate] = useState('')
  const [appointmentDuration, setAppointmentDuration] = useState(60)
  const [appointmentAddress, setAppointmentAddress] = useState('')
  const [appointmentTechnician, setAppointmentTechnician] = useState('Victor')
  const [appointmentNotes, setAppointmentNotes] = useState('')
  const [serviceTitle, setServiceTitle] = useState('')
  const [serviceCategory, setServiceCategory] = useState('General Support')
  const [serviceDate, setServiceDate] = useState(new Date().toISOString().slice(0, 10))
  const [serviceTicketId, setServiceTicketId] = useState('')
  const [serviceLocation, setServiceLocation] = useState('')
  const [serviceTechnician, setServiceTechnician] = useState('Victor')
  const [devicesServiced, setDevicesServiced] = useState('')
  const [issueFound, setIssueFound] = useState('')
  const [workPerformed, setWorkPerformed] = useState('')
  const [partsUsed, setPartsUsed] = useState('')
  const [laborMinutes, setLaborMinutes] = useState(60)
  const [customerSummary, setCustomerSummary] = useState('')
  const [technicianNotes, setTechnicianNotes] = useState('')
  const [warrantyStatus, setWarrantyStatus] = useState('active')
  const [warrantyExpiresAt, setWarrantyExpiresAt] = useState('')
  const [warrantyTerms, setWarrantyTerms] = useState('30-day workmanship warranty unless otherwise noted.')
  const [followUpRecommended, setFollowUpRecommended] = useState(false)
  const [followUpNotes, setFollowUpNotes] = useState('')
  const [servicePhotos, setServicePhotos] = useState<File[]>([])
  const [servicePhotoCaption, setServicePhotoCaption] = useState('')
  const [notice, setNotice] = useState('')
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)

  const loadCustomer = async () => {
    setIsLoading(true)

    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      router.push(`/login?redirectTo=/admin/customers/${params.id}`)
      return
    }

    setAdminId(user.id)

    const [{ data: profileData, error: profileError }, { data: addressData, error: addressError }, { data: membershipData, error: membershipError }, { data: appointmentData, error: appointmentError }, { data: ticketData, error: ticketError }, { data: serviceData, error: serviceError }] = await Promise.all([
      supabase.from('profiles').select('*').eq('id', params.id).maybeSingle(),
      supabase.from('customer_addresses').select('*').eq('customer_id', params.id).order('created_at', { ascending: true }),
      supabase.from('customer_memberships').select('*').eq('customer_id', params.id).order('created_at', { ascending: false }),
      supabase.from('appointments').select('*').eq('customer_id', params.id).order('scheduled_at', { ascending: false }),
      supabase.from('support_tickets').select('*').eq('customer_id', params.id).order('created_at', { ascending: false }),
      supabase.from('service_records').select('*').eq('customer_id', params.id).order('service_date', { ascending: false }),
    ])

    const error = profileError ?? addressError ?? membershipError ?? appointmentError ?? ticketError ?? serviceError
    if (error) {
      setNotice(error.message)
    }

    let recordsWithPhotos: ServiceRecordWithPhotos[] = (serviceData ?? []).map((record) => ({ ...record, photos: [] }))
    const serviceIds = recordsWithPhotos.map((record) => record.id)

    if (serviceIds.length > 0) {
      const { data: photoData, error: photoError } = await supabase
        .from('service_record_photos')
        .select('*')
        .in('service_record_id', serviceIds)
        .order('created_at', { ascending: true })

      if (photoError) {
        setNotice(photoError.message)
      } else {
        const resolvedPhotos = await resolveServicePhotoUrls(supabase, photoData ?? [])
        recordsWithPhotos = recordsWithPhotos.map((record) => ({
          ...record,
          photos: resolvedPhotos.filter((photo) => photo.service_record_id === record.id),
        }))
      }
    }

    setProfile(profileData ?? null)
    setAddress(addressData?.[0] ?? null)
    setMemberships(membershipData ?? [])
    setAppointments(appointmentData ?? [])
    setTickets(ticketData ?? [])
    setServiceRecords(recordsWithPhotos)

    if (membershipData?.[0]) {
      setMembershipPlan(membershipData[0].plan_name)
      setMembershipStatus(membershipData[0].status)
    }

    setIsLoading(false)
  }

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    void loadCustomer()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [params.id])

  const saveCustomer = async (event: React.FormEvent) => {
    event.preventDefault()
    if (!profile) return

    setIsSaving(true)
    setNotice('')

    const profileUpdate = await supabase
      .from('profiles')
      .update({
        full_name: profile.full_name,
        email: profile.email,
        phone: profile.phone,
        alternate_phone: profile.alternate_phone,
        preferred_contact: profile.preferred_contact,
      })
      .eq('id', profile.id)

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
      ? await supabase.from('customer_addresses').update(addressFields).eq('id', address.id)
      : await supabase.from('customer_addresses').insert({ ...addressFields, customer_id: profile.id }).select('*').single()

    if (profileUpdate.error || addressUpdate.error) {
      setNotice(profileUpdate.error?.message ?? addressUpdate.error?.message ?? 'Could not save customer')
    } else {
      setNotice('Customer info saved.')
      await loadCustomer()
    }

    setIsSaving(false)
  }

  const createServiceRecord = async (event: React.FormEvent) => {
    event.preventDefault()
    if (!profile || !adminId || !serviceTitle.trim()) return

    setIsSaving(true)
    setNotice('')

    const invalidPhoto = servicePhotos.find((photo) => !allowedPhotoTypes.includes(photo.type) || photo.size > maxPhotoSize)
    if (invalidPhoto) {
      setNotice('Completed work photos must be JPG, PNG, WebP, or GIF and smaller than 10 MB each.')
      setIsSaving(false)
      return
    }

    const { data: record, error } = await supabase
      .from('service_records')
      .insert({
        customer_id: profile.id,
        ticket_id: serviceTicketId || null,
        title: serviceTitle.trim(),
        category: serviceCategory.trim() || 'General Support',
        status: 'completed',
        service_date: serviceDate || null,
        completed_at: new Date().toISOString(),
        service_location: serviceLocation || null,
        technician: serviceTechnician || null,
        devices_serviced: devicesServiced || null,
        issue_found: issueFound || null,
        work_performed: workPerformed || null,
        parts_used: partsUsed || null,
        labor_minutes: laborMinutes,
        customer_summary: customerSummary || null,
        technician_notes: technicianNotes || null,
        warranty_status: warrantyStatus,
        warranty_expires_at: warrantyExpiresAt || null,
        warranty_terms: warrantyTerms || null,
        follow_up_recommended: followUpRecommended,
        follow_up_notes: followUpNotes || null,
      })
      .select('*')
      .single()

    if (error || !record) {
      console.error('Completed service database insert failed', error)
      setNotice(error?.message ?? 'Could not save completed service.')
      setIsSaving(false)
      return
    }

    for (const photo of servicePhotos) {
      const safeName = photo.name.replace(/[^a-zA-Z0-9._-]/g, '-')
      const storagePath = `${profile.id}/${record.id}/${crypto.randomUUID()}-${safeName}`
      console.log('Uploading service record photo', { bucket: serviceRecordPhotosBucket, storagePath, fileName: photo.name })

      const { data: uploadedFile, error: uploadError } = await supabase.storage.from(serviceRecordPhotosBucket).upload(storagePath, photo, {
        cacheControl: '3600',
        contentType: photo.type,
        upsert: false,
      })

      if (uploadError) {
        console.error('Service record photo upload failed', uploadError)
        setNotice(uploadError.message)
        setIsSaving(false)
        return
      }

      const uploadedPath = uploadedFile?.path ?? storagePath
      const [{ data: publicData }, { error: signedError }] = await Promise.all([
        Promise.resolve(supabase.storage.from(serviceRecordPhotosBucket).getPublicUrl(uploadedPath)),
        supabase.storage.from(serviceRecordPhotosBucket).createSignedUrl(uploadedPath, 60 * 60),
      ])

      if (signedError) {
        console.error('Completed service photo preview URL failed', signedError)
      }

      console.log('Service record photo uploaded', { bucket: serviceRecordPhotosBucket, uploadedPath, publicUrl: publicData.publicUrl })

      const { error: photoError } = await supabase.from('service_record_photos').insert({
        service_record_id: record.id,
        customer_id: profile.id,
        uploaded_by: adminId,
        file_name: photo.name,
        file_type: photo.type || null,
        file_size: photo.size,
        file_path: uploadedPath,
        storage_path: uploadedPath,
        public_url: publicData.publicUrl,
        caption: servicePhotoCaption || null,
      })

      if (photoError) {
        console.error('Service record photo database insert failed', photoError)
        setNotice(photoError.message)
        setIsSaving(false)
        return
      }
    }

    if (serviceTicketId) {
      await supabase.from('support_tickets').update({ status: 'resolved' }).eq('id', serviceTicketId)
    }

    setNotice('Completed service saved and synced to the customer portal.')
    setServiceTitle('')
    setServiceCategory('General Support')
    setServiceDate(new Date().toISOString().slice(0, 10))
    setServiceTicketId('')
    setServiceLocation('')
    setServiceTechnician('Victor')
    setDevicesServiced('')
    setIssueFound('')
    setWorkPerformed('')
    setPartsUsed('')
    setLaborMinutes(60)
    setCustomerSummary('')
    setTechnicianNotes('')
    setWarrantyStatus('active')
    setWarrantyExpiresAt('')
    setWarrantyTerms('30-day workmanship warranty unless otherwise noted.')
    setFollowUpRecommended(false)
    setFollowUpNotes('')
    setServicePhotos([])
    setServicePhotoCaption('')
    await loadCustomer()
    setIsSaving(false)
  }

  const saveMembership = async () => {
    if (!profile) return
    setIsSaving(true)
    setNotice('')

    const existing = memberships[0]
    const selectedPlan = membershipPlans.find((plan) => plan.name === membershipPlan)
    const updatePayload = {
      plan_id: null,
      plan_name: membershipPlan,
      status: membershipStatus,
      notes: selectedPlan ? `${selectedPlan.priceLabel} - ${selectedPlan.description}` : null,
    }

    const result = existing
      ? await supabase.from('customer_memberships').update(updatePayload).eq('id', existing.id)
      : await supabase.from('customer_memberships').insert({ ...updatePayload, customer_id: profile.id })

    if (result.error) {
      setNotice(result.error.message)
    } else {
      setNotice('Membership status saved.')
      await loadCustomer()
    }

    setIsSaving(false)
  }

  const createAppointment = async (event: React.FormEvent) => {
    event.preventDefault()
    if (!profile || !appointmentDate) return

    setIsSaving(true)
    setNotice('')

    const { error } = await supabase.from('appointments').insert({
      customer_id: profile.id,
      appointment_type: appointmentType,
      scheduled_at: new Date(appointmentDate).toISOString(),
      duration_minutes: appointmentDuration,
      status: 'scheduled',
      notes: appointmentNotes || null,
      address: appointmentAddress || null,
      technician: appointmentTechnician || null,
    })

    if (error) {
      setNotice(error.message)
    } else {
      setNotice('Appointment scheduled.')
      setAppointmentType('service')
      setAppointmentDate('')
      setAppointmentAddress('')
      setAppointmentTechnician('Victor')
      setAppointmentNotes('')
      await loadCustomer()
    }

    setIsSaving(false)
  }

  const updateAppointmentStatus = async (appointment: Appointment, status: string) => {
    const { error } = await supabase.from('appointments').update({ status }).eq('id', appointment.id)
    if (error) {
      setNotice(error.message)
    } else {
      await loadCustomer()
    }
  }

  return (
    <AdminShell title={profile ? profile.full_name || 'Customer detail' : 'Customer detail'} description="Edit customer information, membership status, appointments, and customer support context.">
      <Link href="/admin/customers" className="mb-5 inline-flex items-center gap-2 text-sm font-bold text-[#b9c4ff] transition hover:text-white">
        <ArrowLeft size={16} aria-hidden="true" />
        Back to customers
      </Link>

      {notice ? <p className="mb-5 rounded-2xl border border-[#6B85FE]/20 bg-[#5372FE]/10 px-4 py-3 text-sm text-blue-100">{notice}</p> : null}

      {isLoading ? (
        <div className="h-[640px] animate-pulse rounded-[2rem] border border-white/10 bg-white/[0.06]" />
      ) : profile ? (
        <div className="grid gap-6 xl:grid-cols-[1fr_0.8fr]">
          <form onSubmit={saveCustomer} className="grid gap-6">
            <section className="rounded-[2rem] border border-white/10 bg-white/[0.06] p-6 shadow-2xl shadow-black/20">
              <div className="flex items-center gap-3">
                <UserRound className="text-[#6B85FE]" size={24} aria-hidden="true" />
                <h2 className="text-2xl font-bold">Customer info</h2>
              </div>
              <div className="mt-6 grid gap-4">
                <label className="grid gap-2 text-sm font-semibold text-white/60">
                  Full name
                  <input value={profile.full_name ?? ''} onChange={(event) => setProfile({ ...profile, full_name: event.target.value })} className="rounded-2xl border border-white/10 bg-black/40 px-4 py-3 text-white outline-none focus:border-[#6B85FE]" />
                </label>
                <label className="grid gap-2 text-sm font-semibold text-white/60">
                  Email
                  <input value={profile.email ?? ''} onChange={(event) => setProfile({ ...profile, email: event.target.value })} className="rounded-2xl border border-white/10 bg-black/40 px-4 py-3 text-white outline-none focus:border-[#6B85FE]" />
                </label>
                <div className="grid gap-4 sm:grid-cols-2">
                  <label className="grid gap-2 text-sm font-semibold text-white/60">
                    Phone
                    <input value={profile.phone ?? ''} onChange={(event) => setProfile({ ...profile, phone: event.target.value })} className="rounded-2xl border border-white/10 bg-black/40 px-4 py-3 text-white outline-none focus:border-[#6B85FE]" />
                  </label>
                  <label className="grid gap-2 text-sm font-semibold text-white/60">
                    Backup phone
                    <input value={profile.alternate_phone ?? ''} onChange={(event) => setProfile({ ...profile, alternate_phone: event.target.value })} className="rounded-2xl border border-white/10 bg-black/40 px-4 py-3 text-white outline-none focus:border-[#6B85FE]" />
                  </label>
                </div>
                <label className="grid gap-2 text-sm font-semibold text-white/60">
                  Preferred contact
                  <select value={profile.preferred_contact ?? 'email'} onChange={(event) => setProfile({ ...profile, preferred_contact: event.target.value })} className="rounded-2xl border border-white/10 bg-black/40 px-4 py-3 text-white outline-none focus:border-[#6B85FE]">
                    <option value="email">Email</option>
                    <option value="phone">Phone call</option>
                    <option value="text">Text message</option>
                  </select>
                </label>
              </div>
            </section>

            <section className="rounded-[2rem] border border-white/10 bg-white/[0.06] p-6 shadow-2xl shadow-black/20">
              <h2 className="text-2xl font-bold">Service address</h2>
              <div className="mt-6 grid gap-4">
                <input aria-label="Street address" placeholder="Street address" value={address?.street_line_1 ?? ''} onChange={(event) => setAddress((current) => ({ ...(current ?? blankAddress(profile.id)), street_line_1: event.target.value }))} className="rounded-2xl border border-white/10 bg-black/40 px-4 py-3 text-white outline-none placeholder:text-white/30 focus:border-[#6B85FE]" />
                <input aria-label="Apt, suite, notes" placeholder="Apt, suite, gate code" value={address?.street_line_2 ?? ''} onChange={(event) => setAddress((current) => ({ ...(current ?? blankAddress(profile.id)), street_line_2: event.target.value }))} className="rounded-2xl border border-white/10 bg-black/40 px-4 py-3 text-white outline-none placeholder:text-white/30 focus:border-[#6B85FE]" />
                <div className="grid gap-4 sm:grid-cols-[1fr_0.45fr_0.65fr]">
                  <input aria-label="City" placeholder="City" value={address?.city ?? ''} onChange={(event) => setAddress((current) => ({ ...(current ?? blankAddress(profile.id)), city: event.target.value }))} className="rounded-2xl border border-white/10 bg-black/40 px-4 py-3 text-white outline-none placeholder:text-white/30 focus:border-[#6B85FE]" />
                  <input aria-label="State" placeholder="State" value={address?.state ?? ''} onChange={(event) => setAddress((current) => ({ ...(current ?? blankAddress(profile.id)), state: event.target.value }))} className="rounded-2xl border border-white/10 bg-black/40 px-4 py-3 text-white outline-none placeholder:text-white/30 focus:border-[#6B85FE]" />
                  <input aria-label="ZIP" placeholder="ZIP" value={address?.postal_code ?? ''} onChange={(event) => setAddress((current) => ({ ...(current ?? blankAddress(profile.id)), postal_code: event.target.value }))} className="rounded-2xl border border-white/10 bg-black/40 px-4 py-3 text-white outline-none placeholder:text-white/30 focus:border-[#6B85FE]" />
                </div>
                <textarea aria-label="Service notes" placeholder="Service notes" value={address?.notes ?? ''} onChange={(event) => setAddress((current) => ({ ...(current ?? blankAddress(profile.id)), notes: event.target.value }))} className="min-h-24 rounded-2xl border border-white/10 bg-black/40 px-4 py-3 text-white outline-none placeholder:text-white/30 focus:border-[#6B85FE]" />
              </div>
              <button disabled={isSaving} className="mt-6 inline-flex items-center gap-2 rounded-full bg-white px-5 py-3 text-sm font-bold text-black disabled:cursor-not-allowed disabled:opacity-60">
                <Save size={16} aria-hidden="true" />
                Save customer info
              </button>
            </section>
          </form>

          <aside className="grid gap-6">
            <section className="rounded-[2rem] border border-white/10 bg-white/[0.06] p-6 shadow-2xl shadow-black/20">
              <div className="flex items-center gap-3">
                <Sparkles className="text-[#6B85FE]" size={24} aria-hidden="true" />
                <h2 className="text-2xl font-bold">Membership</h2>
              </div>
              <div className="mt-5 grid gap-3">
                <select value={membershipPlan} onChange={(event) => setMembershipPlan(event.target.value)} className="rounded-2xl border border-white/10 bg-black/40 px-4 py-3 text-white outline-none focus:border-[#6B85FE]">
                  {membershipPlans.map((plan) => <option key={plan.slug} value={plan.name}>{plan.name} - {plan.priceLabel}</option>)}
                </select>
                <select value={membershipStatus} onChange={(event) => setMembershipStatus(event.target.value)} className="rounded-2xl border border-white/10 bg-black/40 px-4 py-3 text-white capitalize outline-none focus:border-[#6B85FE]">
                  {membershipStatuses.map((status) => <option key={status} value={status}>{status}</option>)}
                </select>
                <button type="button" onClick={saveMembership} disabled={isSaving} className="rounded-full bg-[#6B85FE] px-5 py-3 text-sm font-bold text-white disabled:cursor-not-allowed disabled:opacity-60">
                  Save membership
                </button>
              </div>
            </section>

            <section className="rounded-[2rem] border border-white/10 bg-white/[0.06] p-6 shadow-2xl shadow-black/20">
              <div className="flex items-center gap-3">
                <CalendarDays className="text-[#6B85FE]" size={24} aria-hidden="true" />
                <h2 className="text-2xl font-bold">Set appointment</h2>
              </div>
              <form onSubmit={createAppointment} className="mt-5 grid gap-3">
                <select value={appointmentType} onChange={(event) => setAppointmentType(event.target.value)} className="rounded-2xl border border-white/10 bg-black/40 px-4 py-3 text-white outline-none focus:border-[#6B85FE]">
                  <option value="service">Service</option>
                  <option value="remote_support">Remote support</option>
                  <option value="consultation">Consultation</option>
                  <option value="follow_up">Follow-up</option>
                  <option value="installation">Installation</option>
                </select>
                <input type="datetime-local" value={appointmentDate} onChange={(event) => setAppointmentDate(event.target.value)} required className="rounded-2xl border border-white/10 bg-black/40 px-4 py-3 text-white outline-none focus:border-[#6B85FE]" />
                <input type="number" min={15} step={15} value={appointmentDuration} onChange={(event) => setAppointmentDuration(Number(event.target.value))} className="rounded-2xl border border-white/10 bg-black/40 px-4 py-3 text-white outline-none focus:border-[#6B85FE]" />
                <input value={appointmentAddress} onChange={(event) => setAppointmentAddress(event.target.value)} placeholder="Appointment address" className="rounded-2xl border border-white/10 bg-black/40 px-4 py-3 text-white outline-none placeholder:text-white/30 focus:border-[#6B85FE]" />
                <input value={appointmentTechnician} onChange={(event) => setAppointmentTechnician(event.target.value)} placeholder="Technician" className="rounded-2xl border border-white/10 bg-black/40 px-4 py-3 text-white outline-none placeholder:text-white/30 focus:border-[#6B85FE]" />
                <textarea value={appointmentNotes} onChange={(event) => setAppointmentNotes(event.target.value)} placeholder="Appointment notes" className="min-h-24 rounded-2xl border border-white/10 bg-black/40 px-4 py-3 text-white outline-none placeholder:text-white/30 focus:border-[#6B85FE]" />
                <button disabled={isSaving} className="rounded-full bg-white px-5 py-3 text-sm font-bold text-black disabled:cursor-not-allowed disabled:opacity-60">Schedule appointment</button>
              </form>
              <div className="mt-5 grid gap-3">
                {appointments.slice(0, 4).map((appointment) => (
                  <div key={appointment.id} className="rounded-2xl bg-black/30 p-4">
                    <p className="font-bold capitalize">{appointment.appointment_type.replaceAll('_', ' ')}</p>
                    <p className="mt-1 text-sm text-white/54">{formatDateTime(appointment.scheduled_at)} · {appointment.status}</p>
                    {appointment.address ? <p className="mt-1 text-sm text-white/46">{appointment.address}</p> : null}
                    {appointment.technician ? <p className="mt-1 text-sm text-white/46">Technician: {appointment.technician}</p> : null}
                    <select value={appointment.status} onChange={(event) => updateAppointmentStatus(appointment, event.target.value)} className="mt-3 w-full rounded-2xl border border-white/10 bg-black/40 px-3 py-2 text-sm text-white outline-none">
                      {appointmentStatuses.map((status) => <option key={status} value={status}>{status}</option>)}
                    </select>
                  </div>
                ))}
              </div>
            </section>

            <section className="rounded-[2rem] border border-white/10 bg-white/[0.06] p-6 shadow-2xl shadow-black/20">
              <div className="flex items-center gap-3">
                <ClipboardCheck className="text-[#6B85FE]" size={24} aria-hidden="true" />
                <h2 className="text-2xl font-bold">Complete service</h2>
              </div>
              <form onSubmit={createServiceRecord} className="mt-5 grid gap-3">
                <input value={serviceTitle} onChange={(event) => setServiceTitle(event.target.value)} required placeholder="Service title" className="rounded-2xl border border-white/10 bg-black/40 px-4 py-3 text-white outline-none placeholder:text-white/30 focus:border-[#6B85FE]" />
                <div className="grid gap-3 sm:grid-cols-2">
                  <input value={serviceCategory} onChange={(event) => setServiceCategory(event.target.value)} placeholder="Category" className="rounded-2xl border border-white/10 bg-black/40 px-4 py-3 text-white outline-none placeholder:text-white/30 focus:border-[#6B85FE]" />
                  <input type="date" value={serviceDate} onChange={(event) => setServiceDate(event.target.value)} className="rounded-2xl border border-white/10 bg-black/40 px-4 py-3 text-white outline-none focus:border-[#6B85FE]" />
                </div>
                <select value={serviceTicketId} onChange={(event) => setServiceTicketId(event.target.value)} className="rounded-2xl border border-white/10 bg-black/40 px-4 py-3 text-white outline-none focus:border-[#6B85FE]">
                  <option value="">No linked ticket</option>
                  {tickets.map((ticket) => <option key={ticket.id} value={ticket.id}>{ticket.title}</option>)}
                </select>
                <div className="grid gap-3 sm:grid-cols-2">
                  <input value={serviceLocation} onChange={(event) => setServiceLocation(event.target.value)} placeholder="Service location" className="rounded-2xl border border-white/10 bg-black/40 px-4 py-3 text-white outline-none placeholder:text-white/30 focus:border-[#6B85FE]" />
                  <input value={serviceTechnician} onChange={(event) => setServiceTechnician(event.target.value)} placeholder="Technician" className="rounded-2xl border border-white/10 bg-black/40 px-4 py-3 text-white outline-none placeholder:text-white/30 focus:border-[#6B85FE]" />
                </div>
                <textarea value={devicesServiced} onChange={(event) => setDevicesServiced(event.target.value)} placeholder="Devices serviced" className="min-h-20 rounded-2xl border border-white/10 bg-black/40 px-4 py-3 text-white outline-none placeholder:text-white/30 focus:border-[#6B85FE]" />
                <textarea value={issueFound} onChange={(event) => setIssueFound(event.target.value)} placeholder="Issue found / diagnosis" className="min-h-24 rounded-2xl border border-white/10 bg-black/40 px-4 py-3 text-white outline-none placeholder:text-white/30 focus:border-[#6B85FE]" />
                <textarea value={workPerformed} onChange={(event) => setWorkPerformed(event.target.value)} placeholder="Work performed" className="min-h-28 rounded-2xl border border-white/10 bg-black/40 px-4 py-3 text-white outline-none placeholder:text-white/30 focus:border-[#6B85FE]" />
                <textarea value={partsUsed} onChange={(event) => setPartsUsed(event.target.value)} placeholder="Parts, equipment, or apps used" className="min-h-20 rounded-2xl border border-white/10 bg-black/40 px-4 py-3 text-white outline-none placeholder:text-white/30 focus:border-[#6B85FE]" />
                <div className="grid gap-3 sm:grid-cols-2">
                  <input type="number" min={0} step={15} value={laborMinutes} onChange={(event) => setLaborMinutes(Number(event.target.value))} aria-label="Labor minutes" className="rounded-2xl border border-white/10 bg-black/40 px-4 py-3 text-white outline-none focus:border-[#6B85FE]" />
                  <select value={warrantyStatus} onChange={(event) => setWarrantyStatus(event.target.value)} className="rounded-2xl border border-white/10 bg-black/40 px-4 py-3 text-white capitalize outline-none focus:border-[#6B85FE]">
                    {warrantyStatuses.map((status) => <option key={status} value={status}>{status.replaceAll('_', ' ')}</option>)}
                  </select>
                </div>
                <input type="date" value={warrantyExpiresAt} onChange={(event) => setWarrantyExpiresAt(event.target.value)} aria-label="Warranty expiration date" className="rounded-2xl border border-white/10 bg-black/40 px-4 py-3 text-white outline-none focus:border-[#6B85FE]" />
                <textarea value={warrantyTerms} onChange={(event) => setWarrantyTerms(event.target.value)} placeholder="Warranty terms" className="min-h-20 rounded-2xl border border-white/10 bg-black/40 px-4 py-3 text-white outline-none placeholder:text-white/30 focus:border-[#6B85FE]" />
                <textarea value={customerSummary} onChange={(event) => setCustomerSummary(event.target.value)} placeholder="Customer-facing summary" className="min-h-24 rounded-2xl border border-white/10 bg-black/40 px-4 py-3 text-white outline-none placeholder:text-white/30 focus:border-[#6B85FE]" />
                <textarea value={technicianNotes} onChange={(event) => setTechnicianNotes(event.target.value)} placeholder="Internal technician notes" className="min-h-20 rounded-2xl border border-white/10 bg-black/40 px-4 py-3 text-white outline-none placeholder:text-white/30 focus:border-[#6B85FE]" />
                <label className="flex items-center gap-3 rounded-2xl border border-white/10 bg-black/40 px-4 py-3 text-sm font-semibold text-white/68">
                  <input type="checkbox" checked={followUpRecommended} onChange={(event) => setFollowUpRecommended(event.target.checked)} className="h-4 w-4 accent-[#6B85FE]" />
                  Follow-up recommended
                </label>
                <textarea value={followUpNotes} onChange={(event) => setFollowUpNotes(event.target.value)} placeholder="Follow-up notes" className="min-h-20 rounded-2xl border border-white/10 bg-black/40 px-4 py-3 text-white outline-none placeholder:text-white/30 focus:border-[#6B85FE]" />
                <label className="flex cursor-pointer items-center gap-3 rounded-2xl border border-dashed border-white/16 bg-black/30 px-4 py-3 text-sm text-white/62 transition hover:border-[#6B85FE]/50">
                  <Camera size={18} aria-hidden="true" />
                  {servicePhotos.length > 0 ? `${servicePhotos.length} photo${servicePhotos.length === 1 ? '' : 's'} selected` : 'Add completed work photos'}
                  <input type="file" multiple accept="image/jpeg,image/png,image/webp,image/gif" className="hidden" onChange={(event) => setServicePhotos(Array.from(event.target.files ?? []))} />
                </label>
                <input value={servicePhotoCaption} onChange={(event) => setServicePhotoCaption(event.target.value)} placeholder="Photo caption" className="rounded-2xl border border-white/10 bg-black/40 px-4 py-3 text-white outline-none placeholder:text-white/30 focus:border-[#6B85FE]" />
                <button disabled={isSaving} className="rounded-full bg-[#6B85FE] px-5 py-3 text-sm font-bold text-white disabled:cursor-not-allowed disabled:opacity-60">
                  {isSaving ? 'Saving service...' : 'Save completed service'}
                </button>
              </form>

              <div className="mt-6 grid gap-3">
                {serviceRecords.slice(0, 3).map((service) => (
                  <div key={service.id} className="rounded-2xl bg-black/30 p-4">
                    <p className="font-bold">{service.title}</p>
                    <p className="mt-1 text-sm capitalize text-white/54">{service.status.replaceAll('_', ' ')} · {service.service_date ? formatDate(service.service_date) : 'No date'}</p>
                    {service.customer_summary ? <p className="mt-2 text-sm leading-6 text-white/52">{service.customer_summary}</p> : null}
                    {service.photos.length > 0 ? (
                      <div className="mt-3 grid grid-cols-3 gap-2">
                        {service.photos.slice(0, 3).map((photo) => (
                          <a key={photo.id} href={photo.public_url} target="_blank" rel="noreferrer" className="relative aspect-square overflow-hidden rounded-xl bg-black/40">
                            <Image src={photo.public_url} alt={photo.file_name} fill className="object-cover" unoptimized />
                          </a>
                        ))}
                      </div>
                    ) : null}
                  </div>
                ))}
              </div>
            </section>

            <section className="rounded-[2rem] border border-white/10 bg-white/[0.06] p-6 shadow-2xl shadow-black/20">
              <div className="flex items-center gap-3">
                <Ticket className="text-[#6B85FE]" size={24} aria-hidden="true" />
                <h2 className="text-2xl font-bold">Tickets</h2>
              </div>
              <div className="mt-5 grid gap-3">
                {tickets.slice(0, 5).map((ticket) => (
                  <Link key={ticket.id} href={`/admin/tickets/${ticket.id}` as Route} className="rounded-2xl bg-black/30 p-4 transition hover:bg-white/10">
                    <p className="font-bold">{ticket.title}</p>
                    <p className="mt-1 text-sm capitalize text-white/54">{ticket.status}</p>
                  </Link>
                ))}
                {tickets.length === 0 ? <p className="rounded-2xl border border-dashed border-white/12 p-5 text-sm text-white/46">No tickets yet.</p> : null}
              </div>
            </section>
          </aside>
        </div>
      ) : (
        <div className="rounded-[2rem] border border-dashed border-white/14 bg-white/[0.05] p-10 text-center">
          <h2 className="text-2xl font-bold">Customer not found</h2>
        </div>
      )}
    </AdminShell>
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

function formatDateTime(value: string) {
  return new Intl.DateTimeFormat('en-US', {
    month: 'short',
    day: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
  }).format(new Date(value))
}

function formatDate(value: string) {
  return new Intl.DateTimeFormat('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  }).format(new Date(value))
}
