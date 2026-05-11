import { membershipPlans } from './membership-plans'

export type MembershipTier = 'none' | 'basic' | 'plus' | 'premium'

export interface MembershipExperience {
  tier: MembershipTier
  name: string
  badge: string
  headline: string
  portalMessage: string
  dashboardMessage: string
  responseLabel: string
  includedSessions: string
  scheduling: string
  memberPricing: string
  nextStep: string
  supportStyle: string
  portalPerks: string[]
  websiteModeLabel: string
  websiteHeadline: string
  websiteMessage: string
  websiteCtaLabel: string
  websiteHighlights: string[]
}

export const membershipExperiences: Record<MembershipTier, MembershipExperience> = {
  none: {
    tier: 'none',
    name: 'No membership',
    badge: 'Guest portal',
    headline: 'Your support hub is ready when you need help.',
    portalMessage: 'Your tickets, services, invoices, and account details stay organized in one place.',
    dashboardMessage: 'Choose a membership to unlock a more guided support experience inside your portal.',
    responseLabel: 'Standard response',
    includedSessions: 'Pay as you go',
    scheduling: 'Standard scheduling',
    memberPricing: 'Standard service pricing',
    nextStep: 'Compare memberships',
    supportStyle: 'Best for one-time support and occasional service requests.',
    portalPerks: ['Ticket tracking', 'Service history', 'Invoices and account details'],
    websiteModeLabel: 'Guest website',
    websiteHeadline: 'Explore TechBuddy like a new customer.',
    websiteMessage: 'The public website keeps services, memberships, and the portal easy to compare before you choose a support plan.',
    websiteCtaLabel: 'Compare memberships',
    websiteHighlights: ['Browse services', 'Review monthly plans', 'Create a portal account'],
  },
  basic: {
    tier: 'basic',
    name: 'Basic',
    badge: 'Basic care',
    headline: 'A simple safety net for everyday tech issues.',
    portalMessage: 'You have monthly remote support, priority scheduling, and member pricing available from your account.',
    dashboardMessage: 'Basic keeps occasional tech issues from becoming stressful with a simple monthly support safety net.',
    responseLabel: 'Priority before non-members',
    includedSessions: '1 remote session/month',
    scheduling: 'Priority scheduling',
    memberPricing: 'Member pricing on services',
    nextStep: 'Use your monthly remote session',
    supportStyle: 'Best for occasional help with phones, email, printers, Wi-Fi, and everyday devices.',
    portalPerks: ['Monthly remote support prompt', 'Member service pricing reminder', 'Simple warranty and service tracking'],
    websiteModeLabel: 'Basic website',
    websiteHeadline: 'A calmer website path for occasional tech help.',
    websiteMessage: 'Basic members see reminders for their monthly remote session, priority scheduling, and the services most likely to solve everyday issues.',
    websiteCtaLabel: 'Use your remote session',
    websiteHighlights: ['Monthly remote session prompt', 'Priority scheduling reminders', 'Member pricing callouts'],
  },
  plus: {
    tier: 'plus',
    name: 'Plus',
    badge: 'Plus priority',
    headline: 'Faster help and better savings for busy households.',
    portalMessage: 'Your portal prioritizes faster support, extra remote help, and clearer next steps for common tech problems.',
    dashboardMessage: 'Plus gives your household faster response priority, more monthly remote help, and better member savings.',
    responseLabel: 'Faster response priority',
    includedSessions: '2 remote sessions/month',
    scheduling: 'Priority support queue',
    memberPricing: 'Better member discounts',
    nextStep: 'Start a priority support request',
    supportStyle: 'Best for households that need support more than once in a while.',
    portalPerks: ['Priority support prompts', 'Extra remote support capacity', 'Buying guidance before replacing tech'],
    websiteModeLabel: 'Plus website',
    websiteHeadline: 'A faster website experience for busy households.',
    websiteMessage: 'Plus members get a priority-first path with extra remote support capacity, clearer service recommendations, and buying guidance before replacing tech.',
    websiteCtaLabel: 'Start priority support',
    websiteHighlights: ['Priority support shortcuts', 'Extra remote support capacity', 'Buying guidance before upgrades'],
  },
  premium: {
    tier: 'premium',
    name: 'Premium',
    badge: 'Premium access',
    headline: 'The most complete TechBuddy experience.',
    portalMessage: 'Your portal highlights highest-priority support, same-day response when available, and annual tech checkup planning.',
    dashboardMessage: 'Premium gives your household the strongest support access, biggest savings, and proactive tech checkup planning.',
    responseLabel: 'Highest priority support',
    includedSessions: '4 remote sessions/month',
    scheduling: 'Same-day response when available',
    memberPricing: 'Biggest member discounts',
    nextStep: 'Plan your annual tech checkup',
    supportStyle: 'Best for homes that rely heavily on devices, internet, accounts, and smart home equipment.',
    portalPerks: ['Highest-priority support path', 'Annual tech checkup reminder', 'Household technology organization guidance'],
    websiteModeLabel: 'Premium website',
    websiteHeadline: 'The most proactive TechBuddy website experience.',
    websiteMessage: 'Premium members see the fastest support path, same-day response messaging when available, and reminders for annual tech checkup planning.',
    websiteCtaLabel: 'Plan your tech checkup',
    websiteHighlights: ['Highest-priority support path', 'Annual checkup planning', 'Household tech organization'],
  },
}

export function getMembershipTier(planName?: string | null): MembershipTier {
  const normalized = planName?.trim().toLowerCase()
  const plan = membershipPlans.find((item) => item.name.toLowerCase() === normalized || item.slug === normalized)
  return (plan?.slug as MembershipTier | undefined) ?? 'none'
}

export function getMembershipExperience(planName?: string | null, status?: string | null) {
  if (status && status !== 'active') {
    return membershipExperiences.none
  }

  return membershipExperiences[getMembershipTier(planName)]
}
