'use client';

import type { ReactNode } from 'react';

import { useSidebar } from '@/context/SidebarContext';
import AppHeader from '@/layout/AppHeader';
import AppSidebar from '@/layout/AppSidebar';
import Backdrop from '@/layout/Backdrop';

export default function AdminLayout({ children }: { children: ReactNode }) {
  const { isExpanded, isHovered } = useSidebar();

  const mainContentMargin =
    isExpanded || isHovered ? 'lg:ml-[240px]' : 'lg:ml-[76px]';

  return (
    <div className="bg-background min-h-screen">
      <AppSidebar />
      <Backdrop />

      <div
        className={`min-h-screen min-w-0 transition-[margin] duration-300 ease-in-out ${mainContentMargin} `}
      >
        <AppHeader />

        <main className="mx-auto w-full min-w-0 max-w-[1800px] px-3 py-4 sm:px-4 lg:px-5 lg:py-5">
          {children}
        </main>
      </div>
    </div>
  );
}
