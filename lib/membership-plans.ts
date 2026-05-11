import { ShieldCheck, Sparkles, Wifi } from "lucide-react";

export const membershipPlans = [
  {
    slug: "basic",
    name: "Basic",
    priceLabel: "$14.99/month",
    badge: "",
    description: "A simple safety net for customers who want help available before small tech problems become stressful.",
    bestFor: "Occasional help with everyday devices, email, printers, Wi-Fi, phones, and tablets.",
    features: [
      "1 remote support session every month",
      "Priority scheduling before non-members",
      "Member-only pricing on additional services",
      "Help choosing the right next step before booking a visit",
    ],
    priorityLevel: 1,
    icon: Sparkles,
  },
  {
    slug: "plus",
    name: "Plus",
    priceLabel: "$24.99/month",
    badge: "Most Popular",
    description: "The best fit for most homes that want faster answers, better savings, and support that feels easy to reach.",
    bestFor: "Families, seniors, and households that need tech help more than once in a while.",
    features: [
      "2 remote support sessions every month",
      "Faster response priority for common issues",
      "Priority support for Wi-Fi, printers, computers, phones, and accounts",
      "Better member pricing on extra visits and setup work",
      "Quick guidance before buying new tech or replacing equipment",
    ],
    priorityLevel: 2,
    icon: Wifi,
  },
  {
    slug: "premium",
    name: "Premium",
    priceLabel: "$39.99/month",
    badge: "Best Value",
    description: "Premium support access for households that depend on their devices, internet, accounts, and smart home setup every day.",
    bestFor: "Busy homes, remote workers, seniors with multiple devices, and families who want the most peace of mind.",
    features: [
      "4 remote support sessions every month",
      "Highest priority support for urgent everyday issues",
      "Same-day response when availability allows",
      "Biggest member pricing advantage on additional services",
      "Annual tech checkup for devices, Wi-Fi, accounts, and security basics",
      "Help keeping household technology organized and easier to manage",
    ],
    priorityLevel: 3,
    icon: ShieldCheck,
  },
];

export type MembershipPlan = (typeof membershipPlans)[number];
