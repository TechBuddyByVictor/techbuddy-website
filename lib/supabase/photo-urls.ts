import type { SupabaseClient } from '@supabase/supabase-js'
import type { Database } from './types'

type TicketPhoto = Database['public']['Tables']['ticket_photos']['Row']

const PHOTO_BUCKET = 'ticket-photos'
const SIGNED_URL_TTL_SECONDS = 60 * 60

export async function resolveTicketPhotoUrls(
  supabase: SupabaseClient<Database>,
  photos: TicketPhoto[],
) {
  return Promise.all(
    photos.map(async (photo) => {
      const { data, error } = await supabase.storage
        .from(PHOTO_BUCKET)
        .createSignedUrl(photo.storage_path, SIGNED_URL_TTL_SECONDS)

      if (error) {
        console.error('Ticket photo preview URL failed', error)
      }

      return {
        ...photo,
        public_url: data?.signedUrl ?? photo.public_url,
      }
    }),
  )
}

