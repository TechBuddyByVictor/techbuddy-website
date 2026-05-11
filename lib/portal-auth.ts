import { cache } from 'react'
import { signedOutPortalAuthState, type PortalAuthState } from '@/lib/portal-auth-state'
import { createClient } from '@/lib/supabase/server'

function getDisplayName(profileName?: string | null, metadataName?: unknown) {
  const metadataFullName = typeof metadataName === 'string' ? metadataName.trim() : ''
  const name = profileName?.trim() || metadataFullName
  return name || 'Customer'
}

export const getPortalAuthState = cache(async (): Promise<PortalAuthState> => {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return signedOutPortalAuthState
  }

  const { data: profile } = await supabase.from('profiles').select('full_name').eq('id', user.id).maybeSingle()

  return {
    isLoading: false,
    isLoggedIn: true,
    displayName: getDisplayName(profile?.full_name, user.user_metadata?.full_name),
  }
})
