'use client';

import { Fuel, Plus, Search } from 'lucide-react';

type OilBrandHeaderProps = {
  search: string;
  total: number;

  onSearchChange: (value: string) => void;
  onCreate: () => void;
};

export default function OilBrandHeader({
  search,
  total,
  onSearchChange,
  onCreate,
}: OilBrandHeaderProps) {
  return (
    <div
      className="relative overflow-hidden rounded-3xl border border-amber-100/70 p-4 shadow-sm sm:p-5 dark:border-white/10"
      style={{
        background:
          'linear-gradient(135deg, rgba(255,251,235,1) 0%, rgba(255,255,255,1) 45%, rgba(255,247,237,1) 100%)',
      }}
    >
      {/* DECORATIVE GLOW */}
      <div className="pointer-events-none absolute -right-20 -top-20 h-56 w-56 rounded-full bg-amber-300/20 blur-3xl" />

      <div className="pointer-events-none absolute -bottom-24 left-1/4 h-56 w-56 rounded-full bg-orange-300/15 blur-3xl" />
      <div className="pointer-events-none absolute right-1/3 top-1/2 h-40 w-40 rounded-full bg-rose-300/10 blur-3xl" />

      <div className="relative space-y-6">
        {/* ================= TOP ================= */}
        <div className="flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
          {/* TITLE */}
          <div className="flex min-w-0 items-center gap-3 sm:gap-4">
            {/* ICON */}
            <div
              className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl text-white shadow-lg"
              style={{
                background:
                  'linear-gradient(135deg, rgb(245 158 11), rgb(249 115 22), rgb(244 63 94))',
                boxShadow: '0 10px 25px rgba(249,115,22,0.22)',
              }}
            >
              <Fuel
                size={24}
                strokeWidth={2.3}
                className="shrink-0 text-white"
              />
            </div>

            <div className="min-w-0">
              <div className="flex flex-wrap items-center gap-2">
                <h1 className="truncate text-lg font-bold text-gray-900 dark:text-white">
                  ประเภทน้ำมัน
                </h1>

                <span className="inline-flex items-center rounded-full border border-amber-200/70 bg-white/80 px-2.5 py-1 text-[10px] font-semibold text-amber-700 shadow-sm backdrop-blur dark:border-amber-500/20 dark:bg-amber-500/10 dark:text-amber-300">
                  {total} รายการ
                </span>
              </div>

              <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                จัดการประเภทน้ำมันสำหรับใช้บันทึกข้อมูลการเติมน้ำมันรถยนต์
              </p>
            </div>
          </div>

          {/* CREATE BUTTON */}
          <button
            type="button"
            onClick={onCreate}
            className="group inline-flex h-11 w-full items-center justify-center gap-2 rounded-xl px-5 text-sm font-semibold text-white shadow-md transition-all duration-200 hover:-translate-y-0.5 hover:shadow-lg active:translate-y-0 sm:w-auto"
            style={{
              background:
                'linear-gradient(90deg, rgb(245 158 11), rgb(249 115 22), rgb(244 63 94))',
              boxShadow: '0 8px 20px rgba(249,115,22,0.2)',
            }}
          >
            <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-white/15 ring-1 ring-white/20">
              <Plus className="h-4 w-4 text-white" />
            </span>

            <span className="text-white">เพิ่มประเภทน้ำมัน</span>
          </button>
        </div>

        {/* ================= SEARCH AREA ================= */}
        <div className="dark:bg-white/3 rounded-2xl border border-gray-100 bg-white/70 p-4 shadow-sm sm:p-5 dark:border-white/10">
          {/* LABEL */}
          <div className="mb-3">
            <p className="text-sm font-bold text-gray-800 dark:text-gray-100">
              ค้นหาประเภทน้ำมัน
            </p>

            <p className="mt-1 text-xs leading-5 text-gray-400">
              ค้นหาจากชื่อ เช่น E20, Gasohol 95 หรือ Diesel
            </p>
          </div>

          {/* SEARCH BOX */}
          <div className="flex h-12 w-full items-center gap-3 rounded-xl border border-gray-200 bg-white px-4 shadow-sm transition-all duration-200 focus-within:border-amber-400 focus-within:ring-4 focus-within:ring-amber-500/10 hover:border-amber-300 dark:border-white/10 dark:bg-white/5">
            {/* ICON */}
            <div className="flex shrink-0 items-center justify-center text-amber-500">
              <Search className="text-amber-700" size={19} strokeWidth={2} />
            </div>

            {/* INPUT */}
            <input
              type="text"
              value={search}
              onChange={(event) => onSearchChange(event.target.value)}
              placeholder="ค้นหาประเภทน้ำมัน..."
              className="h-full min-w-0 flex-1 border-0 bg-transparent p-0 text-sm font-medium text-gray-800 outline-none placeholder:font-normal placeholder:text-gray-400 focus:border-0 focus:outline-none focus:ring-0 dark:text-white dark:placeholder:text-gray-500"
            />

            {/* CLEAR */}
            {search && (
              <button
                type="button"
                onClick={() => onSearchChange('')}
                className="shrink-0 rounded-lg px-2.5 py-1.5 text-[11px] font-medium text-amber-700 transition hover:bg-gray-100 hover:text-gray-600 dark:hover:bg-white/10 dark:hover:text-gray-300"
              >
                ล้าง
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
