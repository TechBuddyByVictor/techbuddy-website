import Image from "next/image";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { businessInfo } from "@/lib/business-info";

export function BusinessShell({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-white text-black">
      <header className="animate-header-drop sticky top-0 z-40 border-b border-black/8 bg-white/82 backdrop-blur-2xl">
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-5 py-4 sm:px-8 lg:px-10">
          <Link href="/business" className="flex min-w-0 items-center" aria-label="TechBuddy Business home">
            <Image
              src="/techbuddy-business-logo.png"
              alt="TechBuddy Business"
              width={1940}
              height={642}
              priority
              className="h-10 w-auto max-w-[180px] object-contain sm:h-12 sm:max-w-[220px]"
            />
          </Link>

          <Link href="/" className="interactive-lift inline-flex shrink-0 items-center justify-center gap-2 rounded-full bg-black px-3 py-2 text-xs font-bold text-white hover:bg-[#2a2a2a] sm:px-4 sm:text-sm">
            Personal
            <ArrowRight size={15} aria-hidden="true" />
          </Link>
        </div>
      </header>

      {children}

      <footer className="border-t border-black/8 bg-white px-5 py-8 sm:px-8 lg:px-10">
        <div className="mx-auto flex max-w-7xl flex-col gap-4 text-sm text-black/50 sm:flex-row sm:items-center sm:justify-between">
          <p>TechBuddy Business is currently available by request only.</p>
          <div className="flex flex-wrap gap-3 font-semibold">
            <a href={businessInfo.phoneHref} className="transition hover:text-[#3D60FE]">{businessInfo.phone}</a>
            <a href={businessInfo.emailHref} className="transition hover:text-[#3D60FE]">{businessInfo.email}</a>
          </div>
        </div>
      </footer>
    </div>
  );
}
