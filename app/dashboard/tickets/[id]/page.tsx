'use client'

export const dynamic = 'force-dynamic'

import Image from 'next/image'
import Link from 'next/link'
import { useParams, useRouter } from 'next/navigation'
import { useEffect, useMemo, useState } from 'react'
import { ArrowLeft, MessageSquare, Send, UploadCloud } from 'lucide-react'
import { CustomerPortalShell } from '@/components/customer-portal-shell'
import { createClient } from '@/lib/supabase/client'
import { resolveTicketPhotoUrls } from '@/lib/supabase/photo-urls'
import type { TicketStatus, TicketWithRelations } from '@/lib/supabase/types'

const statusLabels: Record<TicketStatus, string> = {
  open: 'Open',
  in_progress: 'In progress',
  waiting_on_customer: 'Waiting on customer',
  resolved: 'Resolved',
  closed: 'Closed',
}

const allowedPhotoTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/gif']
const maxPhotoSize = 10 * 1024 * 1024

function formatDate(value: string) {
  return new Intl.DateTimeFormat('en-US', {
    month: 'long',
    day: 'numeric',
    year: 'numeric',
  }).format(new Date(value))
}

export default function TicketDetailPage() {
  const params = useParams<{ id: string }>()
  const router = useRouter()
  const supabase = useMemo(() => createClient(), [])
  const [ticket, setTicket] = useState<TicketWithRelations | null>(null)
  const [message, setMessage] = useState('')
  const [photo, setPhoto] = useState<File | null>(null)
  const [userId, setUserId] = useState('')
  const [notice, setNotice] = useState('')
  const [isLoading, setIsLoading] = useState(true)
  const [isUploading, setIsUploading] = useState(false)

  const loadTicket = async () => {
    setIsLoading(true)

    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      router.push('/login')
      return
    }

    setUserId(user.id)

    const { data, error } = await supabase
      .from('support_tickets')
      .select('*')
      .eq('id', params.id)
      .eq('customer_id', user.id)
      .maybeSingle()

    if (error) {
      setNotice(error.message)
      setTicket(null)
    } else {
      const [{ data: messages, error: messagesError }, { data: photos, error: photosError }] = await Promise.all([
        supabase.from('ticket_messages').select('*').eq('ticket_id', params.id).order('created_at', { ascending: true }),
        supabase.from('ticket_photos').select('*').eq('ticket_id', params.id).order('created_at', { ascending: true }),
      ])

      if (messagesError || photosError) {
        setNotice(messagesError?.message ?? photosError?.message ?? '')
        setTicket(null)
      } else {
        const resolvedPhotos = await resolveTicketPhotoUrls(supabase, photos ?? [])

        setTicket(
          data
            ? ({
                ...data,
                ticket_messages: messages ?? [],
                ticket_photos: resolvedPhotos,
              } as TicketWithRelations)
            : null,
        )
      }
    }

    setIsLoading(false)
  }

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    void loadTicket()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [params.id])

  const sendMessage = async (event: React.FormEvent) => {
    event.preventDefault()

    if (!ticket || !message.trim()) return

    const { error } = await supabase.from('ticket_messages').insert({
      ticket_id: ticket.id,
      sender_id: userId,
      sender_role: 'customer',
      message: message.trim(),
    })

    if (error) {
      setNotice(error.message)
      return
    }

    setMessage('')
    await loadTicket()
  }

  const uploadPhoto = async () => {
    if (!ticket || !photo || !userId) return

    setNotice('')

    if (!allowedPhotoTypes.includes(photo.type)) {
      setNotice('Please upload a JPG, PNG, WebP, or GIF photo so it can be previewed in the portal.')
      return
    }

    if (photo.size > maxPhotoSize) {
      setNotice('Please upload a photo smaller than 10 MB.')
      return
    }

    const safeName = photo.name.replace(/[^a-zA-Z0-9._-]/g, '-')
    const storagePath = `${userId}/${ticket.id}/${crypto.randomUUID()}-${safeName}`
    setIsUploading(true)

    const { error: uploadError } = await supabase.storage.from('ticket-photos').upload(storagePath, photo, {
      cacheControl: '3600',
      contentType: photo.type,
      upsert: false,
    })

    if (uploadError) {
      setNotice(uploadError.message)
      setIsUploading(false)
      return
    }

    const [{ data: publicData }, { data: signedData, error: signedError }] = await Promise.all([
      Promise.resolve(supabase.storage.from('ticket-photos').getPublicUrl(storagePath)),
      supabase.storage.from('ticket-photos').createSignedUrl(storagePath, 60 * 60),
    ])

    if (signedError) {
      console.error('Uploaded ticket photo preview URL failed', signedError)
    }

    const { error } = await supabase.from('ticket_photos').insert({
      ticket_id: ticket.id,
      uploaded_by: userId,
      customer_id: userId,
      file_name: photo.name,
      file_type: photo.type || null,
      file_size: photo.size,
      storage_path: storagePath,
      public_url: signedData?.signedUrl ?? publicData.publicUrl,
    })

    if (error) {
      setNotice(error.message)
      setIsUploading(false)
      return
    }

    setPhoto(null)
    await loadTicket()
    setIsUploading(false)
  }

  return (
    <CustomerPortalShell title="Ticket details">
      <section className="mx-auto max-w-5xl">
        <Link href="/dashboard" className="mb-5 inline-flex items-center gap-2 text-sm font-bold text-[#5372FE] transition hover:text-black">
          <ArrowLeft size={16} aria-hidden="true" />
          Back to your portal
        </Link>
        {isLoading ? (
          <div className="h-96 animate-pulse rounded-[2rem] border border-black/8 bg-[#F4F6FF]" />
        ) : ticket ? (
          <div className="grid gap-6">
            <article className="rounded-[2rem] border border-black/8 bg-white p-6 text-black shadow-[0_24px_70px_rgba(20,28,60,0.08)]">
              <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                <div>
                  <p className="text-sm font-bold text-[#6B85FE]">{ticket.category}</p>
                  <h2 className="mt-2 text-4xl font-bold tracking-tight">{ticket.title}</h2>
                  <p className="mt-4 max-w-3xl text-sm leading-6 text-black/58">{ticket.description}</p>
                </div>
                <div className="flex flex-wrap gap-2">
                  <span className="rounded-full bg-[#5372FE]/16 px-4 py-2 text-sm font-bold text-[#b9c4ff]">{statusLabels[ticket.status]}</span>
                  <span className="rounded-full bg-black/[0.04] px-4 py-2 text-sm font-bold capitalize text-black/60">{ticket.urgency}</span>
                </div>
              </div>
              <p className="mt-6 text-sm text-black/42">Created {formatDate(ticket.created_at)}</p>
            </article>

            <article className="rounded-[2rem] border border-black/8 bg-white p-6 text-black shadow-[0_24px_70px_rgba(20,28,60,0.08)]">
              <h3 className="flex items-center gap-2 text-xl font-bold">
                <MessageSquare size={20} aria-hidden="true" />
                Messages
              </h3>
              <div className="mt-5 space-y-3">
                {(ticket.ticket_messages ?? []).map((item) => (
                  <div key={item.id} className={`rounded-2xl p-4 ${item.sender_id === userId ? 'bg-[#5372FE] text-white' : 'bg-[#F4F6FF] text-black'}`}>
                    <p className="text-xs font-bold capitalize opacity-65">{item.sender_role === 'admin' ? 'TechBuddy' : 'Customer'}</p>
                    <p className="mt-1 text-sm leading-6">{item.message}</p>
                  </div>
                ))}
              </div>
              <form onSubmit={sendMessage} className="mt-5 flex gap-2">
                <input value={message} onChange={(event) => setMessage(event.target.value)} className="min-w-0 flex-1 rounded-full border border-black/10 bg-[#FAFBFF] px-4 py-3 text-black outline-none placeholder:text-black/30 focus:border-[#5372FE]" placeholder="Write a message..." />
                <button className="grid h-12 w-12 place-items-center rounded-full bg-[#5372FE] text-white">
                  <Send size={18} aria-hidden="true" />
                </button>
              </form>
            </article>

            <article className="rounded-[2rem] border border-black/8 bg-white p-6 text-black shadow-[0_24px_70px_rgba(20,28,60,0.08)]">
              <h3 className="text-xl font-bold">Photos</h3>
              <p className="mt-2 text-sm text-black/52">Upload screenshots, router labels, device photos, or error messages for Victor.</p>
              {(ticket.ticket_photos ?? []).length > 0 ? (
                <div className="mt-5 grid gap-3 sm:grid-cols-3">
                  {(ticket.ticket_photos ?? []).map((item) => (
                    <a key={item.id} href={item.public_url} target="_blank" rel="noreferrer" className="block overflow-hidden rounded-2xl border border-black/8 bg-[#F4F6FF]">
                      <Image src={item.public_url} alt={item.file_name} width={360} height={240} className="h-36 w-full object-cover" unoptimized />
                      <span className="block truncate px-3 py-2 text-xs font-semibold text-black/54">{item.file_name}</span>
                    </a>
                  ))}
                </div>
              ) : (
                <p className="mt-5 rounded-2xl border border-dashed border-black/12 bg-[#F4F6FF] p-5 text-sm text-black/48">No photos uploaded yet.</p>
              )}
              <div className="mt-5 flex flex-col gap-3 sm:flex-row">
                <label className="flex flex-1 cursor-pointer items-center gap-3 rounded-full border border-black/10 bg-[#FAFBFF] px-4 py-3 text-sm text-black/58 transition hover:border-[#5372FE]/50">
                  <UploadCloud size={18} aria-hidden="true" />
                  {photo ? photo.name : 'Choose photo'}
                  <input type="file" accept="image/jpeg,image/png,image/webp,image/gif" className="hidden" onChange={(event) => setPhoto(event.target.files?.[0] ?? null)} />
                </label>
                <button type="button" onClick={uploadPhoto} disabled={!photo || isUploading} className="rounded-full bg-black px-5 py-3 text-sm font-bold text-white transition hover:bg-[#2a2a2a] disabled:cursor-not-allowed disabled:opacity-50">
                  {isUploading ? 'Uploading...' : 'Upload photo'}
                </button>
              </div>
            </article>
          </div>
        ) : (
          <div className="rounded-[2rem] border border-dashed border-black/14 bg-white p-10 text-center shadow-sm">
            <h2 className="text-2xl font-bold">Ticket not found</h2>
            <p className="mx-auto mt-3 max-w-xl text-sm leading-6 text-black/58">This ticket may not exist, or it may not belong to your account.</p>
            <Link href="/dashboard" className="mt-6 inline-flex rounded-full bg-black px-5 py-3 text-sm font-bold text-white">Back to dashboard</Link>
          </div>
        )}
        {notice ? <p className="mt-5 rounded-2xl border border-red-400/20 bg-red-500/10 px-4 py-3 text-sm text-red-200">{notice}</p> : null}
      </section>
    </CustomerPortalShell>
  )
}
