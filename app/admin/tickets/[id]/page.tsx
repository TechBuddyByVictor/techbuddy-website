'use client'

export const dynamic = 'force-dynamic'

import Image from 'next/image'
import Link from 'next/link'
import { useParams, useRouter } from 'next/navigation'
import { useEffect, useMemo, useState } from 'react'
import { ArrowLeft, MessageSquare, Send } from 'lucide-react'
import { AdminShell } from '@/components/admin-shell'
import { createClient } from '@/lib/supabase/client'
import { resolveTicketPhotoUrls } from '@/lib/supabase/photo-urls'
import type { TicketStatus, TicketWithRelations } from '@/lib/supabase/types'

const statuses: TicketStatus[] = ['open', 'in_progress', 'waiting_on_customer', 'resolved', 'closed']

const statusLabels: Record<TicketStatus, string> = {
  open: 'Open',
  in_progress: 'In progress',
  waiting_on_customer: 'Waiting on customer',
  resolved: 'Resolved',
  closed: 'Closed',
}

function formatDate(value: string) {
  return new Intl.DateTimeFormat('en-US', {
    month: 'long',
    day: 'numeric',
    year: 'numeric',
  }).format(new Date(value))
}

export default function AdminTicketDetailPage() {
  const params = useParams<{ id: string }>()
  const router = useRouter()
  const supabase = useMemo(() => createClient(), [])
  const [ticket, setTicket] = useState<TicketWithRelations | null>(null)
  const [message, setMessage] = useState('')
  const [adminId, setAdminId] = useState('')
  const [notice, setNotice] = useState('')
  const [isLoading, setIsLoading] = useState(true)

  const loadTicket = async () => {
    setIsLoading(true)

    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      router.push('/login')
      return
    }

    setAdminId(user.id)

    const { data, error } = await supabase
      .from('support_tickets')
      .select('*')
      .eq('id', params.id)
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

  const updateStatus = async (status: TicketStatus) => {
    if (!ticket) return

    const { error } = await supabase.from('support_tickets').update({ status }).eq('id', ticket.id)

    if (error) {
      setNotice(error.message)
      return
    }

    await loadTicket()
  }

  const sendMessage = async (event: React.FormEvent) => {
    event.preventDefault()

    if (!ticket || !message.trim()) return

    const { error } = await supabase.from('ticket_messages').insert({
      ticket_id: ticket.id,
      sender_id: adminId,
      sender_role: 'admin',
      message: message.trim(),
    })

    if (error) {
      setNotice(error.message)
      return
    }

    setMessage('')
    await loadTicket()
  }

  return (
    <AdminShell title="Ticket detail" description="Manage customer ticket status, conversation, and uploaded photos.">
      <section>
        <Link href="/admin" className="mb-5 inline-flex items-center gap-2 text-sm font-bold text-[#b9c4ff] transition hover:text-white">
          <ArrowLeft size={16} aria-hidden="true" />
          Back to admin
        </Link>
        {isLoading ? (
          <div className="h-96 animate-pulse rounded-[2rem] border border-white/10 bg-white/[0.06]" />
        ) : ticket ? (
          <div className="grid gap-6 lg:grid-cols-[1fr_0.82fr]">
            <div className="grid gap-6">
              <article className="rounded-[2rem] border border-white/10 bg-white/[0.06] p-6 shadow-2xl shadow-black/25">
                <p className="text-sm font-bold text-[#6B85FE]">{ticket.customer_name ?? 'Customer'} · {ticket.customer_email ?? 'No email on ticket'}</p>
                <h2 className="mt-2 text-4xl font-bold tracking-tight">{ticket.title}</h2>
                <p className="mt-4 text-sm leading-6 text-white/58">{ticket.description}</p>
                <div className="mt-6 flex flex-wrap gap-2">
                  <span className="rounded-full bg-[#5372FE]/16 px-4 py-2 text-sm font-bold text-[#b9c4ff]">{ticket.category}</span>
                  <span className="rounded-full bg-white/8 px-4 py-2 text-sm font-bold capitalize text-white/70">{ticket.urgency}</span>
                  <span className="rounded-full bg-white/8 px-4 py-2 text-sm font-bold text-white/70">Created {formatDate(ticket.created_at)}</span>
                </div>
              </article>

              <article className="rounded-[2rem] border border-white/10 bg-white/[0.06] p-6 shadow-2xl shadow-black/25">
                <h3 className="flex items-center gap-2 text-xl font-bold">
                  <MessageSquare size={20} aria-hidden="true" />
                  Conversation
                </h3>
                <div className="mt-5 max-h-[460px] space-y-3 overflow-y-auto pr-1">
                  {(ticket.ticket_messages ?? []).map((item) => (
                    <div key={item.id} className={`rounded-2xl p-4 ${item.sender_id === adminId ? 'bg-[#5372FE] text-white' : 'bg-black/45 text-white'}`}>
                      <p className="text-xs font-bold capitalize opacity-65">{item.sender_role === 'admin' ? 'TechBuddy' : 'Customer'}</p>
                      <p className="mt-1 text-sm leading-6">{item.message}</p>
                    </div>
                  ))}
                </div>
                <form onSubmit={sendMessage} className="mt-5 flex gap-2">
                  <input value={message} onChange={(event) => setMessage(event.target.value)} className="min-w-0 flex-1 rounded-full border border-white/10 bg-black/40 px-4 py-3 outline-none placeholder:text-white/30 focus:border-[#5372FE]" placeholder="Reply to customer..." />
                  <button className="grid h-12 w-12 place-items-center rounded-full bg-[#5372FE] text-white">
                    <Send size={18} aria-hidden="true" />
                  </button>
                </form>
              </article>
            </div>

            <aside className="grid gap-6">
              <article className="rounded-[2rem] border border-white/10 bg-white/[0.06] p-6 shadow-2xl shadow-black/25">
                <h3 className="text-xl font-bold">Status updates</h3>
                <p className="mt-2 text-sm text-white/52">Change the customer-visible ticket status.</p>
                <div className="mt-5 grid gap-2">
                  {statuses.map((status) => (
                    <button key={status} onClick={() => updateStatus(status)} className={`rounded-full px-4 py-3 text-left text-sm font-bold transition ${ticket.status === status ? 'bg-[#5372FE] text-white' : 'bg-black/40 text-white/64 hover:bg-white/10'}`}>
                      {statusLabels[status]}
                    </button>
                  ))}
                </div>
              </article>

              <article className="rounded-[2rem] border border-white/10 bg-white/[0.06] p-6 shadow-2xl shadow-black/25">
                <h3 className="text-xl font-bold">Photos</h3>
                {(ticket.ticket_photos ?? []).length > 0 ? (
                  <div className="mt-5 grid gap-3">
                    {(ticket.ticket_photos ?? []).map((item) => (
                      <a key={item.id} href={item.public_url} target="_blank" rel="noreferrer" className="block overflow-hidden rounded-2xl border border-white/10 bg-black/40">
                        <Image src={item.public_url} alt={item.file_name} width={520} height={320} className="h-44 w-full object-cover" unoptimized />
                        <span className="block truncate px-3 py-2 text-xs font-semibold text-white/54">{item.file_name}</span>
                      </a>
                    ))}
                  </div>
                ) : (
                  <p className="mt-5 rounded-2xl border border-dashed border-white/12 bg-black/24 p-5 text-sm text-white/48">No customer photos yet.</p>
                )}
              </article>
            </aside>
          </div>
        ) : (
          <div className="rounded-[2rem] border border-dashed border-white/14 bg-white/[0.05] p-10 text-center">
            <h2 className="text-2xl font-bold">Ticket not found</h2>
            <p className="mx-auto mt-3 max-w-xl text-sm leading-6 text-white/58">This ticket may not exist or you may not have admin access.</p>
            <Link href="/admin" className="mt-6 inline-flex rounded-full bg-white px-5 py-3 text-sm font-bold text-black">Back to admin</Link>
          </div>
        )}
        {notice ? <p className="mt-5 rounded-2xl border border-red-400/20 bg-red-500/10 px-4 py-3 text-sm text-red-200">{notice}</p> : null}
      </section>
    </AdminShell>
  )
}
