'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import Image from 'next/image';
import {
  LayoutDashboard,
  BookOpen,
  RotateCcw,
  Languages,
  Settings,
  LogOut,
  PanelLeftClose,
  X,
} from 'lucide-react';
import { useSidebar } from '@/context/SidebarContext';
import { useLanguage } from '@/context/LanguageContext';
import { SignOutConfirmModal } from '@/components/SignOutConfirmModal';

export interface SidebarUser {
  id?: string | null;
  email?: string | null;
  name?: string | null;
}

export interface SidebarProps {
  user?: SidebarUser | null;
  collapsed?: boolean;
  onCollapsedChange?: (next: boolean) => void;
  mobileOpen?: boolean;
  onMobileClose?: () => void;
  onOpenSignOutConfirm?: () => void;
}

const itemBase =
  'w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-semibold transition-colors cursor-pointer relative';
const itemActive =
  'bg-primary-50 dark:bg-primary-950/60 text-primary-700 dark:text-primary-300 font-bold';
const itemIdle =
  'text-zinc-700 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-800/80';

export const Sidebar: React.FC<SidebarProps> = ({
  user,
  collapsed: propCollapsed,
  onCollapsedChange: propOnCollapsedChange,
  mobileOpen: propMobileOpen,
  onMobileClose: propOnMobileClose,
  onOpenSignOutConfirm: propOnOpenSignOutConfirm,
}) => {
  const pathname = usePathname();
  const { t } = useLanguage();
  const sidebarContext = useSidebar();

  const collapsed = propCollapsed !== undefined ? propCollapsed : sidebarContext.sidebarCollapsed;
  const onCollapsedChange = propOnCollapsedChange || sidebarContext.setSidebarCollapsed;
  const mobileOpen = propMobileOpen !== undefined ? propMobileOpen : sidebarContext.mobileSidebarOpen;
  const onMobileClose = propOnMobileClose || (() => sidebarContext.setMobileSidebarOpen(false));

  const [localSignOutOpen, setLocalSignOutOpen] = useState(false);
  const [pendingPath, setPendingPath] = useState<string | null>(null);

  // Clear pendingPath whenever pathname updates
  React.useEffect(() => {
    setPendingPath(null);
  }, [pathname]);

  const currentPath = pendingPath || pathname;

  const toggle = () => onCollapsedChange(!collapsed);

  const handleOpenSignOut = () => {
    if (propOnOpenSignOutConfirm) {
      propOnOpenSignOutConfirm();
    } else {
      setLocalSignOutOpen(true);
    }
  };

  const menuItems = [
    { href: '/dashboard', label: t.nav.home, icon: LayoutDashboard, exact: true },
    { href: '/vocabulary', label: t.nav.vocabulary, icon: BookOpen, exact: false },
    { href: '/languages', label: t.nav.languages, icon: Languages, exact: false },
    { href: '/review', label: t.nav.review, icon: RotateCcw, exact: false },
    { href: '/settings', label: t.nav.settings, icon: Settings, exact: false },
  ];

  const isItemActive = (item: { href: string; exact?: boolean }) => {
    if (item.href === '/dashboard') {
      return currentPath === '/dashboard' || currentPath === '/';
    }
    if (item.exact) {
      return currentPath === item.href;
    }
    return currentPath.startsWith(item.href);
  };

  return (
    <>
      {/* Mobile Backdrop Overlay */}
      <div
        className={`fixed inset-0 z-[9998] bg-black/60 backdrop-blur-xs md:hidden transition-opacity duration-300 ${
          mobileOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'
        }`}
        onClick={onMobileClose}
        aria-hidden="true"
      />

      {/* Main Sidebar */}
      <aside
        className={`fixed md:sticky top-0 left-0 z-[9999] md:z-auto h-[100dvh] md:h-screen shrink-0 border-r border-zinc-200 dark:border-zinc-800 bg-white/95 dark:bg-zinc-900/95 backdrop-blur-md transition-all duration-300 flex flex-col shadow-2xl md:shadow-none ${
          mobileOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'
        } ${collapsed ? 'md:w-16' : 'md:w-64'} w-[280px] max-w-[85vw]`}
      >
        {/* Sidebar Header */}
        <div
          className={`flex items-center h-16 min-h-16 shrink-0 px-3 ${
            collapsed ? 'md:justify-center justify-between' : 'justify-between'
          }`}
        >
          <Link
            href="/dashboard"
            onClick={(e) => {
              if (collapsed) {
                e.preventDefault();
                onCollapsedChange(false);
                return;
              }
              if (onMobileClose) onMobileClose();
            }}
            aria-label={collapsed ? t.nav.openSidebar : 'Lingo Fox'}
            title={collapsed ? t.nav.openSidebar : 'Lingo Fox'}
            className="flex items-center gap-2.5 min-w-0 text-left group cursor-pointer"
          >
            <div className="w-9 h-9 flex items-center justify-center group-hover:scale-110 active:scale-95 transition-transform shrink-0">
              <Image
                src="/logo.png"
                alt="Lingo Fox Logo"
                width={40}
                height={40}
                className="w-full h-full object-contain"
                priority
              />
            </div>
            <span
              className={`font-bold text-base text-zinc-900 dark:text-zinc-100 tracking-tight truncate ${
                collapsed ? 'md:hidden' : 'inline'
              }`}
            >
              Lingo Fox
            </span>
          </Link>

          {/* Desktop Collapse Toggle */}
          {!collapsed && (
            <button
              onClick={toggle}
              aria-label={t.nav.collapse}
              title={t.nav.collapse}
              className="hidden md:flex w-8 h-8 rounded-lg items-center justify-center text-zinc-500 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors cursor-pointer"
            >
              <PanelLeftClose className="w-4 h-4" />
            </button>
          )}

          {/* Mobile Close Button */}
          <button
            onClick={onMobileClose}
            aria-label="Close menu"
            title="Close menu"
            className="md:hidden w-8 h-8 rounded-lg flex items-center justify-center text-zinc-500 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="mx-3 border-t border-zinc-200/70 dark:border-zinc-800/70" />

        {/* Navigation Items */}
        <nav className="flex-1 min-h-0 overflow-y-auto p-3 space-y-1">
          <p
            className={`px-3 pt-1 pb-1 text-[11px] font-bold text-zinc-400 dark:text-zinc-500 select-none ${
              collapsed ? 'md:hidden' : 'block'
            }`}
          >
            {t.nav.mainMenu}
          </p>

          {menuItems.map((item) => {
            const active = isItemActive(item);
            const Icon = item.icon;
            return (
              <Link
                key={item.href}
                href={item.href}
                prefetch={true}
                onClick={() => {
                  setPendingPath(item.href);
                  if (onMobileClose) onMobileClose();
                }}
                title={collapsed ? item.label : undefined}
                className={`${itemBase} ${active ? itemActive : itemIdle} ${
                  collapsed ? 'md:justify-center md:px-0' : ''
                }`}
              >
                <Icon className="w-4 h-4 shrink-0" />
                <span className={`flex-1 text-left ${collapsed ? 'md:hidden' : 'inline'}`}>
                  {item.label}
                </span>
              </Link>
            );
          })}
        </nav>

        <div className="mx-3 border-t border-zinc-200/70 dark:border-zinc-800/70 shrink-0" />

        {/* Footer Account & Logout */}
        <div className="p-3 pt-3.5 shrink-0 pb-[calc(0.75rem+env(safe-area-inset-bottom,0px))]">
          {user?.email && (
            <div className={`mb-2.5 px-3 min-w-0 ${collapsed ? 'md:hidden' : 'block'}`}>
              <p className="text-[11px] font-bold text-zinc-400 dark:text-zinc-500">
                {t.nav.accountDetail}
              </p>
              <p
                className="text-xs font-medium text-zinc-700 dark:text-zinc-200 truncate mt-0.5"
                title={user.email}
              >
                {user.email}
              </p>
            </div>
          )}
          <button
            onClick={() => {
              if (onMobileClose) onMobileClose();
              handleOpenSignOut();
            }}
            title={collapsed ? t.nav.signOut : undefined}
            className={`${itemBase} text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/30 ${
              collapsed ? 'md:justify-center md:px-0' : ''
            }`}
          >
            <LogOut className="w-4 h-4 shrink-0" />
            <span className={`flex-1 text-left ${collapsed ? 'md:hidden' : 'inline'}`}>
              {t.nav.signOut}
            </span>
          </button>
        </div>
      </aside>

      {/* Local Sign Out Modal (if not controlled by parent) */}
      {!propOnOpenSignOutConfirm && (
        <SignOutConfirmModal
          isOpen={localSignOutOpen}
          onClose={() => setLocalSignOutOpen(false)}
          userEmail={user?.email}
        />
      )}
    </>
  );
};
