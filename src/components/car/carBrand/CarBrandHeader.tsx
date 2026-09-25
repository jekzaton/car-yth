'use client';

import { CarFront, Plus, Search, X } from 'lucide-react';

type CarBrandHeaderProps = {
  search: string;
  total: number;

  onSearchChange: (value: string) => void;
  onCreate: () => void;
};

export default function CarBrandHeader({
  search,
  total,
  onSearchChange,
  onCreate,
}: CarBrandHeaderProps) {
  return (
    <section className="relative overflow-hidden rounded-2xl border border-blue-100/80 bg-white p-4 shadow-sm sm:rounded-3xl sm:p-5 lg:p-6 dark:border-white/10 dark:bg-gray-900">
      {/* =====================================================
          DECORATIVE BACKGROUND
      ===================================================== */}
      <div className="pointer-events-none absolute -right-24 -top-24 h-72 w-72 rounded-full bg-blue-400/10 blur-3xl dark:bg-blue-500/10" />

      <div className="pointer-events-none absolute -bottom-28 left-1/4 h-64 w-64 rounded-full bg-indigo-400/10 blur-3xl dark:bg-indigo-500/10" />

      <div className="pointer-events-none absolute right-1/4 top-1/3 h-48 w-48 rounded-full bg-violet-400/5 blur-3xl dark:bg-violet-500/10" />

      <div className="relative space-y-5 sm:space-y-6">
        {/* =====================================================
            TOP HEADER
        ===================================================== */}
        <div className="flex flex-col gap-4 sm:gap-5 lg:flex-row lg:items-center lg:justify-between">
          {/* ================= TITLE ================= */}
          <div className="flex min-w-0 items-center gap-3 sm:gap-4">
            {/* ICON */}
            <div
              className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl text-white shadow-lg sm:h-14 sm:w-14"
              style={{
                background:
                  'linear-gradient(135deg, rgb(59 130 246), rgb(79 70 229), rgb(124 58 237))',
                boxShadow: '0 10px 26px rgba(79,70,229,0.22)',
              }}
            >
              <CarFront
                size={26}
                strokeWidth={2.2}
                stroke="#ffffff"
                className="shrink-0"
              />
            </div>

            {/* TEXT */}
            <div className="min-w-0 flex-1">
              <div className="flex flex-wrap items-center gap-2">
                <h1 className="truncate text-lg font-bold text-gray-900 sm:text-xl dark:text-white">
                  ยี่ห้อรถยนต์
                </h1>

                <span className="inline-flex shrink-0 items-center rounded-full border border-blue-200/80 bg-blue-50 px-2.5 py-1 text-[10px] font-bold text-blue-700 shadow-sm sm:text-[11px] dark:border-blue-500/20 dark:bg-blue-500/10 dark:text-blue-300">
                  {total.toLocaleString('th-TH')} รายการ
                </span>
              </div>

              <p className="mt-1 text-xs leading-5 text-gray-500 sm:text-sm dark:text-gray-400">
                จัดการ เพิ่ม แก้ไข และค้นหายี่ห้อรถยนต์ในระบบ
              </p>
            </div>
          </div>

          {/* ================= CREATE BUTTON ================= */}
          <button
            type="button"
            onClick={onCreate}
            className="group inline-flex h-11 w-full items-center justify-center gap-2 rounded-xl px-5 text-sm font-semibold text-white shadow-md transition-all duration-200 hover:-translate-y-0.5 hover:shadow-lg active:translate-y-0 sm:w-auto sm:min-w-44"
            style={{
              background:
                'linear-gradient(90deg, rgb(59 130 246), rgb(79 70 229), rgb(124 58 237))',
              color: '#ffffff',
              boxShadow: '0 8px 20px rgba(79,70,229,0.20)',
            }}
          >
            <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-white/15 ring-1 ring-white/20 transition-transform duration-200 group-hover:scale-105">
              <Plus size={17} strokeWidth={2.5} stroke="#ffffff" />
            </span>

            <span className="text-white">เพิ่มยี่ห้อรถยนต์</span>
          </button>
        </div>

        {/* SEARCH AREA */}
        <div className="rounded-2xl border border-gray-100 bg-white p-4 shadow-sm sm:p-5 dark:border-white/10 dark:bg-gray-800/70 dark:shadow-none">
          {/* ================= LABEL ================= */}
          <div className="mb-3 sm:mb-4">
            <div className="flex items-center gap-3">
              <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-blue-50 text-blue-600 dark:bg-blue-500/15 dark:text-blue-400">
                <Search size={17} strokeWidth={2.2} />
              </div>

              <div className="min-w-0">
                <p className="text-sm font-bold text-gray-800 dark:text-gray-100">
                  ค้นหายี่ห้อรถยนต์
                </p>

                <p className="mt-0.5 text-[11px] leading-5 text-gray-500 sm:text-xs dark:text-gray-400">
                  ค้นหาจากชื่อ เช่น Toyota, Honda, Isuzu หรือ Mitsubishi
                </p>
              </div>
            </div>
          </div>

          {/* ================= SEARCH BOX ================= */}
          <div className="flex h-12 w-full items-center gap-3 rounded-xl border border-gray-200 bg-white px-4 shadow-sm transition-all duration-200 focus-within:border-blue-500 focus-within:ring-4 focus-within:ring-blue-500/10 hover:border-blue-300 dark:border-gray-700 dark:bg-gray-900 dark:shadow-none dark:focus-within:border-blue-500 dark:focus-within:ring-blue-500/15 dark:hover:border-blue-500/50">
            <Search
              size={19}
              strokeWidth={2.2}
              className="shrink-0 text-blue-500 dark:text-blue-400"
            />

            <input
              type="text"
              value={search}
              onChange={(event) => onSearchChange(event.target.value)}
              placeholder="ค้นหายี่ห้อรถยนต์..."
              className="h-full min-w-0 flex-1 border-0 bg-transparent p-0 text-sm font-medium text-gray-800 outline-none placeholder:font-normal placeholder:text-gray-400 focus:border-0 focus:outline-none focus:ring-0 dark:text-gray-100 dark:placeholder:text-gray-500"
            />

            {search && (
              <button
                type="button"
                onClick={() => onSearchChange('')}
                aria-label="ล้างคำค้นหา"
                title="ล้างคำค้นหา"
                className="inline-flex h-8 shrink-0 items-center justify-center gap-1.5 rounded-lg px-2.5 text-[11px] font-semibold text-gray-500 transition hover:bg-gray-100 hover:text-gray-700 dark:text-gray-400 dark:hover:bg-white/10 dark:hover:text-gray-200"
              >
                <X size={14} strokeWidth={2.2} />

                <span className="hidden sm:inline">ล้าง</span>
              </button>
            )}
          </div>

          {/* ================= SEARCH RESULT ================= */}
          {search.trim() && (
            <div className="mt-3 flex flex-wrap items-center justify-between gap-2 rounded-xl border border-blue-100 bg-blue-50 px-3 py-2 dark:border-blue-500/20 dark:bg-blue-500/10">
              <p className="min-w-0 truncate text-[11px] text-gray-500 dark:text-gray-400">
                ผลการค้นหา
                <span className="mx-1 font-semibold text-gray-800 dark:text-gray-200">
                  “{search.trim()}”
                </span>
              </p>

              <span className="shrink-0 text-[11px] font-bold text-blue-600 dark:text-blue-400">
                พบ {total.toLocaleString('th-TH')} รายการ
              </span>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
