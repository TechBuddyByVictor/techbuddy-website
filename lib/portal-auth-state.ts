import type { MembershipTier } from '@/lib/membership-experience'

export type PortalAuthState = {
  isLoading: boolean
  isLoggedIn: boolean
  displayName: string
  membershipPlanName: string | null
  membershipStatus: string | null
  membershipTier: MembershipTier
}

export const signedOutPortalAuthState: PortalAuthState = {
  isLoading: false,
  isLoggedIn: false,
  displayName: 'Customer',
  membershipPlanName: null,
  membershipStatus: null,
  membershipTier: 'none',
}
