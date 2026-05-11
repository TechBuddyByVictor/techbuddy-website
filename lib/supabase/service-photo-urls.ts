import type { SupabaseClient } from '@supabase/supabase-js'
import type { Database } from './types'

type ServicePhoto = Database['public']['Tables']['service_record_photos']['Row']

const PHOTO_BUCKET = 'service-record-photos'
const SIGNED_URL_TTL_SECONDS = 60 * 60

export async function resolveServicePhotoUrls(
  supabase: SupabaseClient<Database>,
  photos: ServicePhoto[],
) {
  return Promise.all(
    photos.map(async (photo) => {
      const { data, error } = await supabase.storage
        .from(PHOTO_BUCKET)
        .createSignedUrl(photo.storage_path, SIGNED_URL_TTL_SECONDS)

      if (error) {
        console.error('Service photo preview URL failed', error)
      }

      return {
        ...photo,
        public_url: data?.signedUrl ?? photo.public_url,
      }
    }),
  )
}

