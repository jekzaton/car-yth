import GridShape from '@/components/common/GridShape';
import ThemeTogglerTwo from '@/components/common/ThemeTogglerTwo';

import { ThemeProvider } from '@/context/ThemeContext';
import Image from 'next/image';
import Link from 'next/link';
import React from 'react';

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="z-1 relative bg-white dark:bg-gray-900">
      <ThemeProvider>
        <div className="flex h-screen w-full overflow-hidden lg:flex-row">
          {/* LEFT - LOGIN */}
          <div className="flex w-full items-center justify-center p-6">
            {children}
          </div>

          {/* RIGHT - HERO */}
          {/* <div className="bg-brand-950 hidden h-full items-center justify-center lg:flex lg:w-1/2 dark:bg-white/5">
            <div className="relative flex items-center justify-center">
              <GridShape />

              <div className="flex max-w-xs flex-col items-center">
                <Link href="/" className="mb-4 block">
                  <Image
                    width={231}
                    height={48}
                    src="./images/logo/auth-logo.svg"
                    alt="Logo"
                  />
                </Link>

                <p className="text-center text-gray-400 dark:text-white/60">
                  TON Free and Open-Source Tailwind CSS Admin Dashboard Template
                </p>
              </div>
            </div>
          </div> */}
        </div>

        {/* Theme toggle */}
        <div className="fixed bottom-6 right-6 z-50 hidden sm:block">
          <ThemeTogglerTwo />
        </div>
      </ThemeProvider>
    </div>
  );
}
