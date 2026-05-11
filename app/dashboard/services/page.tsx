'use client'

export const dynamic = 'force-dynamic'

import Link from 'next/link'
import type { Route } from 'next'
import Image from 'next/image'
import { useRouter } from 'next/navigation'
import { useEffect, useMemo, useState } from 'react'
import { CalendarDays, Camera, CheckCircle2, Clock3, MapPin, PackageCheck, ShieldCheck, UserRound, Wrench } from 'lucide-react'
import { CustomerPortalShell } from '@/components/customer-portal-shell'
import { createClient } from '@/lib/supabase/client'
import { resolveServicePhotoUrls } from '@/lib/supabase/service-photo-urls'
import type { Database } from '@/lib/supabase/types'

type ServiceRecord = Database['public']['Tables']['service_records']['Row']
type ServicePhoto = Database['public']['Tables']['service_record_photos']['Row']
type ServiceRecordWithPhotos = ServiceRecord & { photos: ServicePhoto[] }
type Ticket = Database['public']['Tables']['support_tickets']['Row']

const statusStyles: Record<string, string> = {
  scheduled: 'bg-blue-500/12 text-[#b9c4ff]',
  in_progress: 'bg-cyan-500/12 text-cyan-200',
  completed: 'bg-emerald-500/12 text-emerald-200',
  follow_up: 'bg-amber-500/12 text-amber-200',
  canceled: 'bg-white/8 text-white/58',
}

export default function ServicesPage() {
  const supabase = useMemo(() => createClient(), [])
  const router = useRouter()
  const [services, setServices] = useState<ServiceRecordWithPhotos[]>([])
  const [tickets, setTickets] = useState<Ticket[]>([])
  const [notice, setNotice] = useState('')
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const loadServices = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser()

      if (!user) {
        router.push('/login')
        return
      }

      const [{ data: serviceData, error: serviceError }, { data: ticketData, error: ticketError }] = await Promise.all([
        supabase.from('service_records').select('*').eq('customer_id', user.id).order('created_at', { ascending: false }),
        supabase.from('support_tickets').select('*').eq('customer_id', user.id).order('created_at', { ascending: false }),
      ])

      if (serviceError || ticketError) {
        setNotice(serviceError?.message ?? ticketError?.message ?? '')
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

      setServices(recordsWithPhotos)
      setTickets(ticketData ?? [])
      setIsLoading(false)
    }

    void loadServices()
  }, [router, supabase])

  return (
    <CustomerPortalShell title="Services and warranties">
      <section className="mb-8 rounded-[2rem] border border-white/10 bg-[linear-gradient(135deg,rgba(83,114,254,0.2),rgba(255,255,255,0.055))] p-6 shadow-2xl shadow-black/20">
        <p className="text-sm font-bold text-[#6B85FE]">Service history</p>
        <h2 className="mt-2 max-w-3xl text-4xl font-bold tracking-tight">Every visit, repair, warranty, and follow-up in one place.</h2>
        <p className="mt-3 max-w-3xl text-sm leading-6 text-white/58">
          This is where customers can see what TechBuddy completed, what is still active, warranty coverage, and open service requests.
        </p>
      </section>

      {notice ? <p className="mb-5 rounded-2xl border border-red-400/20 bg-red-500/10 px-4 py-3 text-sm text-red-200">{notice}</p> : null}

      {isLoading ? (
        <div className="h-96 animate-pulse rounded-[2rem] bg-white/[0.06]" />
      ) : (
        <div className="grid gap-6 lg:grid-cols-[1fr_0.72fr]">
          <section className="grid gap-4">
            {services.length === 0 ? (
              <div className="rounded-[2rem] border border-dashed border-white/14 bg-white/[0.05] p-10 text-center">
                <Wrench className="mx-auto text-[#6B85FE]" size={30} aria-hidden="true" />
                <h2 className="mt-4 text-2xl font-bold">No completed service records yet</h2>
                <p className="mx-auto mt-3 max-w-xl text-sm leading-6 text-white/58">
                  After Victor completes a service, it can appear here with notes, warranty status, and follow-up details.
                </p>
              </div>
            ) : (
              services.map((service) => (
                <article key={service.id} className="rounded-[2rem] border border-white/10 bg-white/[0.06] p-6 shadow-2xl shadow-black/20">
                  <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                    <div>
                      <p className="text-sm font-bold text-[#6B85FE]">{service.category}</p>
                      <h2 className="mt-2 text-2xl font-bold tracking-tight">{service.title}</h2>
                      <p className="mt-3 text-sm leading-6 text-white/58">{service.customer_summary || 'Service summary will appear here once Victor adds it.'}</p>
                    </div>
                    <span className={`w-fit rounded-full px-3 py-1 text-xs font-bold capitalize ${statusStyles[service.status] ?? statusStyles.scheduled}`}>
                      {service.status.replaceAll('_', ' ')}
                    </span>
                  </div>
                  <div className="mt-5 grid gap-3 sm:grid-cols-3">
                    <InfoTile icon={CalendarDays} label="Service date" value={service.service_date ? formatDate(service.service_date) : 'Not scheduled'} />
                    <InfoTile icon={ShieldCheck} label="Warranty" value={service.warranty_status.replaceAll('_', ' ')} />
                    <InfoTile icon={ShieldCheck} label="Warranty expires" value={service.warranty_expires_at ? formatDate(service.warranty_expires_at) : 'No date set'} />
                  </div>
                  <div className="mt-5 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                    <InfoTile icon={UserRound} label="Technician" value={service.technician || 'TechBuddy'} />
                    <InfoTile icon={MapPin} label="Location" value={service.service_location || 'Not listed'} />
                    <InfoTile icon={Clock3} label="Labor time" value={service.labor_minutes > 0 ? `${service.labor_minutes} minutes` : 'Not listed'} />
                  </div>
                  <div className="mt-5 grid gap-4">
                    <DetailBlock icon={Wrench} title="Devices serviced" value={service.devices_serviced} fallback="No device details were added." />
                    <DetailBlock icon={CheckCircle2} title="Issue found" value={service.issue_found} fallback="No diagnosis details were added." />
                    <DetailBlock icon={ClipboardIcon} title="Work completed" value={service.work_performed} fallback="Completed work details will appear here once added." />
                    <DetailBlock icon={PackageCheck} title="Parts and equipment" value={service.parts_used} fallback="No parts or equipment were listed." />
                    <DetailBlock icon={ShieldCheck} title="Warranty terms" value={service.warranty_terms} fallback="Warranty terms were not added for this service." />
                    {service.follow_up_recommended ? <DetailBlock icon={CalendarDays} title="Follow-up recommended" value={service.follow_up_notes} fallback="TechBuddy recommends a follow-up for this service." /> : null}
                  </div>
                  {service.photos.length > 0 ? (
                    <div className="mt-5">
                      <h3 className="flex items-center gap-2 text-sm font-bold text-white/72">
                        <Camera size={17} aria-hidden="true" />
                        Completed work photos
                      </h3>
                      <div className="mt-3 grid gap-3 sm:grid-cols-3">
                        {service.photos.map((photo) => (
                          <a key={photo.id} href={photo.public_url} target="_blank" rel="noreferrer" className="block overflow-hidden rounded-2xl border border-white/10 bg-black/32">
                            <Image src={photo.public_url} alt={photo.file_name} width={420} height={280} className="h-36 w-full object-cover" unoptimized />
                            <span className="block truncate px-3 py-2 text-xs font-semibold text-white/54">{photo.caption || photo.file_name}</span>
                          </a>
                        ))}
                      </div>
                    </div>
                  ) : null}
                </article>
              ))
            )}
          </section>

          <aside className="rounded-[2rem] border border-white/10 bg-white/[0.06] p-6 shadow-2xl shadow-black/20">
            <h2 className="text-2xl font-bold">Active requests</h2>
            <p className="mt-2 text-sm leading-6 text-white/52">Open tickets that may become service records after work is completed.</p>
            <div className="mt-5 grid gap-3">
              {tickets.slice(0, 6).map((ticket) => (
                <Link key={ticket.id} href={`/dashboard/tickets/${ticket.id}` as Route} className="rounded-2xl bg-black/32 p-4 transition hover:bg-white/10">
                  <p className="text-sm font-bold text-white">{ticket.title}</p>
                  <p className="mt-1 text-xs capitalize text-white/48">{ticket.status.replaceAll('_', ' ')} - {ticket.urgency}</p>
                </Link>
              ))}
              {tickets.length === 0 ? <p className="rounded-2xl border border-dashed border-white/12 p-5 text-sm text-white/48">No open requests yet.</p> : null}
            </div>
          </aside>
        </div>
      )}
    </CustomerPortalShell>
  )
}

function InfoTile({ icon: Icon, label, value }: { icon: typeof CalendarDays; label: string; value: string }) {
  return (
    <div className="rounded-2xl bg-black/32 p-4">
      <Icon className="text-[#6B85FE]" size={17} aria-hidden="true" />
      <p className="mt-3 text-xs font-semibold uppercase tracking-[0.12em] text-white/38">{label}</p>
      <p className="mt-1 text-sm font-bold capitalize text-white/78">{value}</p>
    </div>
  )
}

function DetailBlock({ icon: Icon, title, value, fallback }: { icon: typeof CalendarDays; title: string; value: string | null; fallback: string }) {
  return (
    <div className="rounded-2xl bg-black/32 p-4">
      <div className="flex items-center gap-2">
        <Icon className="text-[#6B85FE]" size={17} aria-hidden="true" />
        <h3 className="text-sm font-bold text-white/78">{title}</h3>
      </div>
      <p className="mt-2 whitespace-pre-line text-sm leading-6 text-white/56">{value || fallback}</p>
    </div>
  )
}

const ClipboardIcon = Wrench

function formatDate(value: string) {
  return new Intl.DateTimeFormat('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  }).format(new Date(value))
}
