import {
  AlertTriangle,
  Camera,
  CheckCircle2,
  Church,
  Computer,
  Globe,
  Headphones,
  Network,
  Printer,
  ReceiptText,
  Router,
  ShoppingBag,
  Store,
  Truck,
  Utensils,
  Wifi,
} from "lucide-react";

export const businessServices = [
  {
    title: "POS support",
    description: "Setup and troubleshooting for point-of-sale stations, card readers, receipt printers, tablets, and checkout workflows.",
    icon: ReceiptText,
  },
  {
    title: "Business Wi-Fi",
    description: "Reliable Wi-Fi for customers, staff, kitchens, offices, patios, food trucks, and point-of-sale devices.",
    icon: Wifi,
  },
  {
    title: "Printer support",
    description: "Receipt printers, label printers, office printers, scanner setup, paper jams, drivers, and connection issues.",
    icon: Printer,
  },
  {
    title: "Computer support",
    description: "Workstations, laptops, shared computers, onboarding, cleanup, updates, backups, and everyday troubleshooting.",
    icon: Computer,
  },
  {
    title: "Camera support",
    description: "Security camera connection help, app access, Wi-Fi camera stability, viewing issues, and basic recording checks.",
    icon: Camera,
  },
  {
    title: "Website and ordering",
    description: "Website edits, online ordering checks, menu updates, domain help, and the tech around your digital storefront.",
    icon: Globe,
  },
];

export const businessServiceCatalog = [
  {
    title: "Small Business Services",
    icon: Store,
    items: [
      "POS system setup",
      "Receipt printer setup",
      "Restaurant tablet setup",
      "Food truck technology support",
      "Business Wi-Fi setup",
      "Customer display setup",
      "TV menu screen setup",
      "Security camera system assistance",
      "Business computer maintenance",
      "Office printer setup",
      "Email setup for businesses",
      "Google Business Profile assistance",
      "Basic technology consulting",
    ],
  },
  {
    title: "Operations Support",
    icon: ReceiptText,
    items: [
      "Checkout device setup",
      "Ordering tablet support",
      "Staff device troubleshooting",
      "Printer and label workflow help",
      "Customer-facing display support",
      "Menu screen setup",
    ],
  },
  {
    title: "Network & Workplace Tech",
    icon: Network,
    items: [
      "Business Wi-Fi setup",
      "Guest Wi-Fi setup",
      "Router and modem setup",
      "Office computer maintenance",
      "Security camera connection help",
      "Basic technology consulting",
    ],
  },
];

export const businessIndustries = [
  { title: "Food trucks", description: "Mobile Wi-Fi, POS, receipt printers, ordering tablets, and event-day emergency support.", icon: Truck },
  { title: "Restaurants", description: "Dining room Wi-Fi, kitchen printers, checkout devices, cameras, menus, and online ordering.", icon: Utensils },
  { title: "Churches", description: "Office computers, livestream basics, Wi-Fi, printers, member systems, and event support.", icon: Church },
  { title: "Local shops", description: "POS stations, inventory devices, customer Wi-Fi, cameras, printers, and website updates.", icon: Store },
  { title: "Small offices", description: "Computers, email, shared printers, network reliability, onboarding, and support plans.", icon: Network },
  { title: "Pop-ups and vendors", description: "Quick setup for payments, tablets, hotspots, labels, and temporary locations.", icon: ShoppingBag },
];

export const businessPlans = [
  {
    name: "Business Essentials",
    price: "$99/mo",
    description: "For solo owners and small teams that need a reliable support lane.",
    features: ["Priority ticket support", "Monthly tech check-in", "Printer and Wi-Fi help", "Basic website and ordering support"],
  },
  {
    name: "Operations Plus",
    price: "$199/mo",
    description: "For restaurants, shops, offices, and churches that rely on tech every day.",
    features: ["Faster response priority", "Quarterly system review", "POS and camera support", "Service documentation and warranty tracking"],
  },
  {
    name: "Local Business Partner",
    price: "$349/mo",
    description: "For businesses that want ongoing, organized help without hiring internal IT.",
    features: ["Highest priority support", "Device and vendor inventory", "Emergency support coordination", "Monthly improvement plan"],
  },
];

export const emergencyItems = [
  { title: "POS down", icon: AlertTriangle },
  { title: "Wi-Fi outage", icon: Router },
  { title: "Printer failure", icon: Printer },
  { title: "Online ordering issue", icon: Globe },
  { title: "Camera access problem", icon: Camera },
  { title: "Staff device trouble", icon: Headphones },
];

export const businessProof = [
  { value: "POS", label: "Checkout and ordering support" },
  { value: "Wi-Fi", label: "Guest and staff network help" },
  { value: "Plans", label: "Monthly support options" },
];

export const businessChecklist = [
  "Restaurants and food trucks",
  "Church offices and event spaces",
  "Retail shops and local services",
  "POS, Wi-Fi, printer, and computer support",
  "Website, online ordering, and camera support",
  "Emergency tech support when operations are stuck",
];

export const CheckIcon = CheckCircle2;
