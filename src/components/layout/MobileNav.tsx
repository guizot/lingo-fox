"use client";

import * as React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  BookOpen,
  RotateCcw,
  Languages as LanguagesIcon,
  Settings,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useLanguage } from "@/context/LanguageContext";

export function MobileNav() {
  const pathname = usePathname();
  const { t } = useLanguage();
  const [pendingPath, setPendingPath] = React.useState<string | null>(null);

  React.useEffect(() => {
    setPendingPath(null);
  }, [pathname]);

  const currentPath = pendingPath || pathname;

  const navItems = [
    { href: "/dashboard", label: t.nav.home, icon: LayoutDashboard },
    { href: "/vocabulary", label: t.nav.vocabulary, icon: BookOpen },
    { href: "/languages", label: t.nav.languages, icon: LanguagesIcon },
    { href: "/review", label: t.nav.review, icon: RotateCcw },
    { href: "/settings", label: t.nav.settings, icon: Settings },
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-40 flex h-[calc(3.75rem+env(safe-area-inset-bottom,0px))] items-start justify-around border-t border-zinc-200/80 bg-white/95 px-1 pt-1.5 pb-[env(safe-area-inset-bottom,0px)] backdrop-blur-md md:hidden dark:border-zinc-800 dark:bg-zinc-900/95 transition-colors">
      {navItems.map((item) => {
        const Icon = item.icon;
        const isActive =
          item.href === "/dashboard"
            ? currentPath === "/dashboard" || currentPath === "/"
            : currentPath.startsWith(item.href);

        return (
          <Link
            key={item.href}
            href={item.href}
            prefetch={true}
            onClick={() => setPendingPath(item.href)}
            className={cn(
              "flex flex-1 flex-col items-center justify-center gap-0.5 py-0.5 text-[10px] font-medium transition-all active:scale-90 select-none",
              isActive
                ? "text-primary-600 font-bold dark:text-primary-400"
                : "text-zinc-500 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-100"
            )}
          >
            <div
              className={cn(
                "flex h-7 w-11 items-center justify-center rounded-xl transition-all",
                isActive
                  ? "bg-primary-50 dark:bg-primary-950/60"
                  : "bg-transparent"
              )}
            >
              <Icon className={cn("h-4 w-4 transition-transform", isActive && "scale-110")} />
            </div>
            <span>{item.label}</span>
          </Link>
        );
      })}
    </nav>
  );
}
