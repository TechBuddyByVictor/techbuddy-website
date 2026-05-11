export type PortalAuthState = {
  isLoading: boolean
  isLoggedIn: boolean
  displayName: string
}

export const signedOutPortalAuthState: PortalAuthState = {
  isLoading: false,
  isLoggedIn: false,
  displayName: 'Customer',
}
