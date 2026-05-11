import {
  BookOpen,
  Camera,
  FileText,
  HomeIcon,
  Laptop,
  LifeBuoy,
  LockKeyhole,
  MonitorSmartphone,
  Printer,
  Router,
  ShieldCheck,
  Sparkles,
  Smartphone,
  Tv,
  Users,
  Wifi,
} from "lucide-react";

export const servicePages = [
  {
    slug: "wifi-networking",
    title: "Wi-Fi & Home Networking",
    shortTitle: "Wi-Fi",
    eyebrow: "Reliable coverage",
    description:
      "Router setup, speed troubleshooting, dead-zone fixes, secure passwords, mesh systems, and better coverage for the whole home.",
    icon: Wifi,
    hero: "Fast, stable Wi-Fi without the guessing.",
    overview:
      "Most people do not need a corporate IT department. They need someone who can walk in, understand the home, test the signal, clean up the setup, and explain what changed in plain English.",
    highlights: ["Router setup", "Mesh Wi-Fi planning", "Speed checks", "Password cleanup"],
    deliverables: ["Coverage review", "Router and device setup", "Secure network naming", "Simple notes for future reference"],
  },
  {
    slug: "computer-device-support",
    title: "Computer & Device Support",
    shortTitle: "Devices",
    eyebrow: "Everyday troubleshooting",
    description:
      "Help with laptops, desktops, phones, tablets, email, updates, backups, transfers, and the issues that slow people down.",
    icon: Laptop,
    hero: "Patient help for the devices you use every day.",
    overview:
      "TechBuddy focuses on practical fixes, clean setup, and patient support so customers leave knowing what happened and what to do next.",
    highlights: ["Laptop tune-ups", "Phone setup", "Email help", "Data transfer"],
    deliverables: ["Computer setup", "Slow computer cleanup", "Virus and malware removal", "File transfers and backups"],
  },
  {
    slug: "phone-tablet-support",
    title: "Phone & Tablet Services",
    shortTitle: "Phones",
    eyebrow: "Mobile help",
    description:
      "Setup, transfers, troubleshooting, app help, Bluetooth pairing, smartwatch pairing, cloud backup, and storage cleanup.",
    icon: Smartphone,
    hero: "Phones and tablets set up without the stress.",
    overview:
      "New devices, account sign-ins, app installs, transfers, and cloud settings can get tangled quickly. TechBuddy helps make the device feel ready to use.",
    highlights: ["New phone setup", "Data transfer", "App help", "Cloud backup"],
    deliverables: ["Phone or tablet setup", "Account and email support", "Bluetooth and smartwatch pairing", "Storage and backup cleanup"],
  },
  {
    slug: "printer-home-office",
    title: "Printer & Home Office Setup",
    shortTitle: "Printers",
    eyebrow: "Work-ready setup",
    description:
      "Wireless printer setup, scanner help, driver cleanup, home office devices, and practical support for remote work.",
    icon: Printer,
    hero: "A home office that feels less fragile.",
    overview:
      "Printers and work-from-home tools should not take over your day. TechBuddy gets the basics connected, tested, and easier to use.",
    highlights: ["Printer setup", "Scanner help", "Driver fixes", "Workstation setup"],
    deliverables: ["Print and scan testing", "Computer connection", "Wi-Fi print setup", "Basic workflow cleanup"],
  },
  {
    slug: "smart-home-setup",
    title: "Smart Home Setup",
    shortTitle: "Smart home",
    eyebrow: "Connected living",
    description:
      "Setup and troubleshooting for TVs, cameras, doorbells, speakers, lighting, streaming devices, and smart home apps.",
    icon: HomeIcon,
    hero: "Smart home gear, set up neatly.",
    overview:
      "Connected devices are only helpful when they are reliable and understandable. TechBuddy helps connect the pieces and keeps the setup approachable.",
    highlights: ["TV setup", "Camera setup", "Doorbells", "Smart speakers"],
    deliverables: ["App pairing", "Device naming", "Connectivity testing", "Basic privacy review"],
  },
  {
    slug: "security-cleanup",
    title: "Security, Cleanup & Scam Recovery",
    shortTitle: "Security",
    eyebrow: "Safer technology",
    description:
      "Virus checks, suspicious popup cleanup, scam recovery guidance, password cleanup, privacy settings, and safer account habits.",
    icon: ShieldCheck,
    hero: "Calm help when something feels wrong.",
    overview:
      "Security issues can feel personal and stressful. TechBuddy brings a calm process: check the device, secure the accounts, and explain the safer path forward.",
    highlights: ["Virus checks", "Popup cleanup", "Password review", "Account safety"],
    deliverables: ["Device scan review", "Account hardening", "Browser cleanup", "Prevention guidance"],
  },
  {
    slug: "tv-entertainment",
    title: "TV & Entertainment Services",
    shortTitle: "Entertainment",
    eyebrow: "Streaming ready",
    description:
      "TV setup, Roku, Fire TV, Apple TV, soundbars, Bluetooth speakers, universal remotes, streaming apps, and entertainment troubleshooting.",
    icon: Tv,
    hero: "Streaming, sound, and TV setup that just works.",
    overview:
      "TechBuddy helps connect TVs, remotes, speakers, and streaming apps so the entertainment setup is easier to use day to day.",
    highlights: ["TV setup", "Roku and Fire TV", "Soundbars", "Streaming apps"],
    deliverables: ["TV and streaming setup", "Soundbar and speaker pairing", "Remote setup", "App troubleshooting"],
  },
  {
    slug: "tech-help-training",
    title: "Tech Help & Training",
    shortTitle: "Training",
    eyebrow: "Patient lessons",
    description:
      "One-on-one tech lessons, senior-friendly support, basic computer lessons, phone training, smart TV lessons, app tutorials, and Q&A.",
    icon: BookOpen,
    hero: "Patient tech lessons built around your questions.",
    overview:
      "Some problems are not just fixes. Sometimes you want to understand the device better. TechBuddy offers patient, practical help without making things intimidating.",
    highlights: ["One-on-one lessons", "Phone training", "App tutorials", "Tech Q&A"],
    deliverables: ["Personalized lesson", "Step-by-step guidance", "Practice time", "Plain-English notes"],
  },
];

export const portalFeatures = [
  { title: "Customer accounts", description: "Customers can log in and see their service history.", icon: Users },
  { title: "Support tickets", description: "Requests are organized by status and customer.", icon: LifeBuoy },
  { title: "Photo uploads", description: "Customers can send screenshots, labels, and setup photos.", icon: Camera },
  { title: "Invoices", description: "Victor can create invoices and customers can view them.", icon: FileText },
];

export const trustStats = [
  { label: "Support areas", value: "8" },
  { label: "Customer portal", value: "24/7" },
  { label: "Plain-English help", value: "100%" },
];

export const personalServiceCatalog = [
  {
    title: "Computer Services",
    icon: Laptop,
    items: [
      "Computer setup & first-time installation",
      "Slow computer cleanup & optimization",
      "Virus & malware removal",
      "Blue Screen / crash troubleshooting",
      "Windows reinstall & reset",
      "Mac setup & support",
      "Software installation",
      "Driver updates",
      "File transfer to new computer",
      "Printer setup & troubleshooting",
      "Email setup",
      "Password recovery assistance",
      "Data backup setup",
      "External hard drive setup",
      "Microsoft Office installation",
      "Computer tune-ups",
      "Custom PC troubleshooting",
      "Laptop performance upgrades",
      "Internet browser issues",
      "Pop-up & scam cleanup",
      "Remote support sessions",
    ],
  },
  {
    title: "Wi-Fi & Network Services",
    icon: Wifi,
    items: [
      "Wi-Fi troubleshooting",
      "Router setup",
      "Modem installation",
      "Mesh Wi-Fi setup",
      "Wi-Fi extender installation",
      "Smart home network setup",
      "Slow internet diagnosis",
      "Device connection issues",
      "Guest Wi-Fi setup",
      "Basic network organization",
      "Streaming device setup",
      "Coverage improvement recommendations",
    ],
  },
  {
    title: "Phone & Tablet Services",
    icon: Smartphone,
    items: [
      "New phone setup",
      "Data transfer between phones",
      "iPhone setup & troubleshooting",
      "Android setup & troubleshooting",
      "Tablet setup",
      "App installation assistance",
      "Email/account setup",
      "Bluetooth troubleshooting",
      "Smartwatch pairing",
      "Backup & cloud setup",
      "Storage cleanup",
      "Basic parental controls setup",
    ],
  },
  {
    title: "Smart Home Services",
    icon: HomeIcon,
    items: [
      "Smart TV setup",
      "Streaming device setup",
      "Ring camera installation assistance",
      "Smart doorbell setup",
      "Smart light setup",
      "Smart speaker setup",
      "Alexa setup",
      "Google Home setup",
      "Smart plug setup",
      "Home device connection troubleshooting",
    ],
  },
  {
    title: "TV & Entertainment Services",
    icon: Tv,
    items: [
      "TV setup",
      "Roku setup",
      "Fire TV setup",
      "Apple TV setup",
      "Soundbar setup",
      "Bluetooth speaker setup",
      "Universal remote setup",
      "Streaming app troubleshooting",
      "Home entertainment troubleshooting",
    ],
  },
  {
    title: "Security & Protection",
    icon: ShieldCheck,
    items: [
      "Scam protection assistance",
      "Basic online safety education",
      "Device security checks",
      "Antivirus installation",
      "Password manager setup",
      "Account recovery help",
      "Suspicious activity troubleshooting",
    ],
  },
  {
    title: "Tech Help & Training",
    icon: BookOpen,
    items: [
      "One-on-one tech lessons",
      "Senior-friendly tech support",
      "Basic computer lessons",
      "Phone training",
      "Smart TV lessons",
      "App tutorials",
      "Technology Q&A sessions",
      "Personalized tech help",
    ],
  },
];

export const processSteps = [
  { title: "Tell me what is happening", description: "Create a ticket or start a conversation with the symptoms, photos, and goals." },
  { title: "I diagnose the setup", description: "I look at the device, network, account, or workflow and find the practical next step." },
  { title: "We fix and document it", description: "The work gets handled, invoices stay in the portal, and you know what changed." },
];

export const audienceCards = [
  { title: "Homes and families", icon: Router, copy: "Wi-Fi, phones, printers, computers, streaming, smart home devices, and shared accounts." },
  { title: "Seniors", icon: MonitorSmartphone, copy: "Patient setup, scam guidance, video calls, email, passwords, photos, and day-to-day confidence." },
  { title: "Busy households", icon: HomeIcon, copy: "Shared devices, school laptops, streaming, printing, Wi-Fi reliability, and the setup details nobody wants to chase." },
  { title: "Safety-focused help", icon: LockKeyhole, copy: "Security cleanup, suspicious messages, password habits, account protection, and privacy basics." },
];

export const values = [
  { title: "Premium, not intimidating", icon: Sparkles },
  { title: "Built for regular people", icon: Users },
  { title: "Clear notes and invoices", icon: FileText },
  { title: "Security-minded by default", icon: ShieldCheck },
];
