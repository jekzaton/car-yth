import GridShape from '@/components/common/GridShape';
import { ArrowLeft, Home, TriangleAlert } from 'lucide-react';
import Link from 'next/link';
import React from 'react';

export default function NotFound() {
  return (
    <main className="bg-linear-to-br relative flex min-h-screen items-center justify-center overflow-hidden from-slate-50 via-blue-50/80 to-indigo-100/70 px-4 py-10 sm:px-6 lg:px-8 dark:from-gray-950 dark:via-slate-950 dark:to-blue-950/80">
      {/* Background grid */}
      <div className="pointer-events-none absolute inset-0 opacity-40 dark:opacity-20">
        <GridShape />
      </div>

      {/* Gradient blur decorations */}
      <div className="pointer-events-none absolute -left-24 -top-24 h-72 w-72 rounded-full bg-blue-400/25 blur-3xl sm:h-96 sm:w-96 dark:bg-blue-600/15" />

      <div className="pointer-events-none absolute -bottom-24 -right-24 h-72 w-72 rounded-full bg-indigo-400/25 blur-3xl sm:h-96 sm:w-96 dark:bg-indigo-600/15" />

      <div className="pointer-events-none absolute left-1/2 top-1/2 h-64 w-64 -translate-x-1/2 -translate-y-1/2 rounded-full bg-cyan-300/10 blur-3xl sm:h-96 sm:w-96 dark:bg-cyan-500/5" />

      {/* Content */}
      <div className="relative z-10 mx-auto w-full max-w-xl">
        <div className="overflow-hidden rounded-[28px] border border-white/70 bg-white/80 shadow-2xl shadow-blue-950/10 backdrop-blur-xl dark:border-white/10 dark:bg-gray-900/75 dark:shadow-black/30">
          {/* Top accent */}
          <div className="bg-linear-to-r h-1.5 w-full from-blue-500 via-cyan-400 to-indigo-500" />

          <div className="px-6 py-9 text-center sm:px-10 sm:py-12 lg:px-12">
            {/* Icon */}
            <div className="relative mx-auto mb-7 flex h-20 w-20 items-center justify-center sm:h-24 sm:w-24">
              <div className="bg-linear-to-br absolute inset-0 rounded-3xl from-blue-500 to-indigo-600 opacity-20 blur-xl" />

              <div className="bg-linear-to-br relative flex h-full w-full items-center justify-center rounded-3xl from-blue-500 to-indigo-600 shadow-lg shadow-blue-500/20">
                <TriangleAlert
                  className="h-9 w-9 text-white sm:h-11 sm:w-11"
                  strokeWidth={1.8}
                />
              </div>
            </div>

            {/* Error code */}
            <div className="mb-4 flex items-center justify-center gap-3">
              <span className="bg-linear-to-r h-px w-8 from-transparent to-blue-400 sm:w-12" />

              <span className="bg-linear-to-r from-blue-600 via-cyan-500 to-indigo-600 bg-clip-text text-sm font-bold uppercase tracking-[0.3em] text-transparent dark:from-blue-400 dark:via-cyan-300 dark:to-indigo-400">
                Error 404
              </span>

              <span className="bg-linear-to-l h-px w-8 from-transparent to-indigo-400 sm:w-12" />
            </div>

            {/* Title */}
            <h1 className="mb-4 text-2xl font-bold tracking-tight text-gray-900 sm:text-3xl lg:text-4xl dark:text-white">
              ไม่พบหน้าที่คุณต้องการ
            </h1>

            {/* Description */}
            <p className="mx-auto max-w-md text-sm leading-7 text-gray-500 sm:text-base dark:text-gray-400">
              หน้าที่คุณกำลังค้นหาอาจถูกย้าย ลบออก หรือ URL
              ที่เรียกใช้งานไม่ถูกต้อง
            </p>

            {/* Error number */}
            <div className="my-8">
              <span className="bg-linear-to-b select-none from-gray-200 to-gray-100 bg-clip-text text-7xl font-black tracking-tighter text-transparent sm:text-8xl dark:from-gray-700 dark:to-gray-800">
                404
              </span>
            </div>

            {/* Buttons */}
            <div className="flex flex-col gap-3 sm:flex-row sm:justify-center">
              <Link
                href="/signin"
                className="bg-linear-to-r group inline-flex min-h-12 items-center justify-center gap-2 rounded-xl from-blue-600 to-indigo-600 px-6 py-3 text-sm font-semibold text-white shadow-lg shadow-blue-500/20 transition duration-200 hover:-translate-y-0.5 hover:from-blue-700 hover:to-indigo-700 hover:shadow-xl hover:shadow-blue-500/25 focus:outline-none focus:ring-4 focus:ring-blue-500/20"
              >
                <ArrowLeft className="h-4 w-4 transition-transform group-hover:-translate-x-0.5" />
                กลับหน้าเข้าสู่ระบบ
              </Link>

              <Link
                href="/"
                className="inline-flex min-h-12 items-center justify-center gap-2 rounded-xl border border-gray-200 bg-white/80 px-6 py-3 text-sm font-semibold text-gray-700 shadow-sm transition duration-200 hover:-translate-y-0.5 hover:bg-gray-50 hover:shadow-md dark:border-gray-700 dark:bg-gray-800/80 dark:text-gray-200 dark:hover:bg-gray-800"
              >
                <Home className="h-4 w-4" />
                กลับหน้าหลัก
              </Link>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="mt-6 text-center">
          <p className="text-xs text-gray-400 sm:text-sm dark:text-gray-500">
            © {new Date().getFullYear()}{' '}
            <span className="font-medium text-gray-500 dark:text-gray-400">
              CAR-YTH
            </span>{' '}
            | Yangtalad Hospital
          </p>

          <p className="mt-1 text-[11px] text-gray-400/80 dark:text-gray-600">
            By Ton Thanatnin
          </p>
        </div>
      </div>
    </main>
  );
}
