import { cache } from 'react'
import { getMembershipExperience } from '@/lib/membership-experience'
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

  const [{ data: profile }, { data: memberships }] = await Promise.all([
    supabase.from('profiles').select('full_name').eq('id', user.id).maybeSingle(),
    supabase
      .from('customer_memberships')
      .select('plan_name,status')
      .eq('customer_id', user.id)
      .order('created_at', { ascending: false })
      .limit(1),
  ])

  const membership = memberships?.[0] ?? null
  const membershipExperience = getMembershipExperience(membership?.plan_name, membership?.status)

  return {
    isLoading: false,
    isLoggedIn: true,
    displayName: getDisplayName(profile?.full_name, user.user_metadata?.full_name),
    membershipPlanName: membership?.plan_name ?? null,
    membershipStatus: membership?.status ?? null,
    membershipTier: membershipExperience.tier,
  }
})
