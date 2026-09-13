'use client';

import React, { createContext, useContext, useState, ReactNode } from 'react';

interface SidebarContextType {
  sidebarCollapsed: boolean;
  setSidebarCollapsed: (collapsed: boolean) => void;
  toggleSidebar: () => void;
  mobileSidebarOpen: boolean;
  setMobileSidebarOpen: (open: boolean) => void;
}

const SidebarContext = createContext<SidebarContextType | undefined>(undefined);

export function SidebarProvider({
  children,
  initialCollapsed = false,
}: {
  children: ReactNode;
  initialCollapsed?: boolean;
}) {
  const [sidebarCollapsed, setSidebarCollapsedState] = useState<boolean>(initialCollapsed);
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);

  // Sync with localStorage on client after mount if available
  React.useEffect(() => {
    try {
      const saved = localStorage.getItem('sidebar.collapsed');
      if (saved !== null) {
        const isCollapsed = saved === '1';
        if (isCollapsed !== initialCollapsed) {
          setSidebarCollapsedState(isCollapsed);
        }
        document.cookie = 'sidebar_collapsed=' + (isCollapsed ? '1' : '0') + '; path=/; max-age=31536000; SameSite=Lax';
      }
    } catch {}
  }, [initialCollapsed]);

  const setSidebarCollapsed = (collapsed: boolean) => {
    setSidebarCollapsedState(collapsed);
    try {
      localStorage.setItem('sidebar.collapsed', collapsed ? '1' : '0');
      document.cookie = 'sidebar_collapsed=' + (collapsed ? '1' : '0') + '; path=/; max-age=31536000; SameSite=Lax';
    } catch {}
  };

  const toggleSidebar = () => {
    setSidebarCollapsed(!sidebarCollapsed);
  };

  return (
    <SidebarContext.Provider
      value={{
        sidebarCollapsed,
        setSidebarCollapsed,
        toggleSidebar,
        mobileSidebarOpen,
        setMobileSidebarOpen,
      }}
    >
      {children}
    </SidebarContext.Provider>
  );
}

export function useSidebar() {
  const context = useContext(SidebarContext);
  if (!context) {
    throw new Error('useSidebar must be used within a SidebarProvider');
  }
  return context;
}
