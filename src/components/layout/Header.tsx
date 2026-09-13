"use client";

import * as React from "react";
import Link from "next/link";
import Image from "next/image";
import { Menu } from "lucide-react";
import { useSidebar } from "@/context/SidebarContext";
import { Language, UserLanguage } from "@/types";

export interface HeaderProps {
  userLanguages?: UserLanguage[];
  allLanguages?: Language[];
  activeLanguageId?: number;
  userName?: string | null;
  userEmail?: string | null;
}

export function Header({
  userName,
  userEmail,
}: HeaderProps) {
  const { setMobileSidebarOpen } = useSidebar();

  const initialLetter = (userName?.trim() || userEmail?.trim() || "U")
    .charAt(0)
    .toUpperCase();

  return (
    <header className="fixed top-0 left-0 right-0 z-30 flex md:hidden h-14 w-full shrink-0 items-center justify-between border-b border-zinc-200/80 bg-white/95 px-4 backdrop-blur-md dark:border-zinc-800 dark:bg-zinc-900/95 transition-colors">
      {/* Left: Mobile Hamburger & Brand */}
      <div className="flex items-center gap-2 min-w-0">
        <button
          onClick={() => setMobileSidebarOpen(true)}
          aria-label="Open navigation menu"
          title="Open navigation menu"
          className="md:hidden w-9 h-9 rounded-xl flex items-center justify-center text-zinc-700 dark:text-zinc-200 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors cursor-pointer shrink-0"
        >
          <Menu className="w-5 h-5 stroke-[2.3]" />
        </button>

        <Link href="/dashboard" className="flex items-center gap-2 md:hidden shrink-0">
          <div className="w-8 h-8 flex items-center justify-center">
            <Image
              src="/logo.png"
              alt="Lingo Fox Logo"
              width={36}
              height={36}
              className="w-full h-full object-contain"
              priority
            />
          </div>
          <span className="font-bold text-base text-zinc-900 dark:text-zinc-100 tracking-tight">
            Lingo Fox
          </span>
        </Link>
      </div>

      {/* Right: User Profile Avatar */}
      <div className="ml-auto flex items-center gap-2 sm:gap-3 shrink-0">
        <div
          title={userEmail || userName || "Profile"}
          aria-label="User Profile"
          className="w-8.5 h-8.5 sm:w-10 sm:h-10 rounded-full flex items-center justify-center font-black text-xs sm:text-sm text-white bg-primary-600 select-none shadow-xs cursor-default shrink-0"
        >
          {initialLetter}
        </div>
      </div>
    </header>
  );
}
