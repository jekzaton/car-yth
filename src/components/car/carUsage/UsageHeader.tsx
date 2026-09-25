'use client';

import { CalendarDays, CarFront, RotateCcw, Search } from 'lucide-react';
import { useRef } from 'react';

type UsageHeaderProps = {
  search: string;
  total: number;

  startDate: string;
  endDate: string;

  onSearchChange: (value: string) => void;
  onStartDateChange: (value: string) => void;
  onEndDateChange: (value: string) => void;
  onClearDate: () => void;
};

export default function UsageHeader({
  search,
  total,

  startDate,
  endDate,

  onSearchChange,
  onStartDateChange,
  onEndDateChange,
  onClearDate,
}: UsageHeaderProps) {
  return (
    <div className="bg-linear-to-r relative overflow-hidden rounded-3xl border border-gray-100 from-white via-white to-blue-50/60 p-5 shadow-sm dark:border-white/10 dark:from-gray-900 dark:via-gray-900 dark:to-blue-950/20">
      {/* GLOW */}
      <div className="pointer-events-none absolute -right-16 -top-16 h-48 w-48 rounded-full bg-blue-500/10 blur-3xl" />

      <div className="relative">
        {/* ================= HEADER ================= */}
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div className="flex items-center gap-4">
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-blue-600 text-white shadow-lg shadow-blue-500/20">
              <CarFront className="h-6 w-6" />
            </div>

            <div>
              <h1 className="text-lg font-bold text-gray-900 dark:text-white">
                รายการใช้งานรถยนต์
              </h1>

              <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                ตรวจสอบประวัติการเดินทาง เลขไมล์ และข้อมูลการใช้งานรถ
              </p>
            </div>
          </div>

          {/* TOTAL */}
          <div className="flex items-center gap-2">
            <span className="inline-flex h-10 items-center rounded-xl border border-blue-100 bg-blue-50 px-4 text-xs font-semibold text-blue-700 dark:border-blue-500/20 dark:bg-blue-500/10 dark:text-blue-300">
              ทั้งหมด {total} รายการ
            </span>
          </div>
        </div>

        {/* ================= FILTER ================= */}
        <div className="mt-5 flex flex-col gap-3 xl:flex-row xl:items-end">
          {/* SEARCH */}
          <div className="w-full xl:flex-1">
            <label className="mb-1.5 block text-[11px] font-semibold text-gray-500 dark:text-gray-400">
              ค้นหารายการ
            </label>

            <div className="relative">
              <Search className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />

              <input
                type="text"
                value={search}
                onChange={(event) => onSearchChange(event.target.value)}
                placeholder="ค้นหา คนขับ รถ ทะเบียน หน่วยงาน หรือสถานที่..."
                className="h-11 w-full rounded-xl border border-gray-200 bg-white/80 pl-10 pr-4 text-sm text-gray-800 shadow-sm outline-none transition placeholder:text-gray-400 hover:border-blue-300 focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 dark:border-white/10 dark:bg-white/5 dark:text-white"
              />
            </div>
          </div>
          {/* ================= DATE RANGE ================= */}
          <div className="mt-5">
            <label className="mb-2 block text-xs font-semibold text-gray-500 dark:text-gray-400">
              ช่วงวันที่การจองรถยนต์
            </label>

            <div className="flex w-full items-end gap-3">
              {/* START DATE */}
              <div className="min-w-0 flex-1">
                <label className="mb-1.5 block text-[11px] font-medium text-gray-400">
                  ตั้งแต่วันที่
                </label>

                <div className="relative">
                  <CalendarDays className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-blue-500" />

                  <input
                    type="date"
                    value={startDate}
                    max={endDate || undefined}
                    onChange={(event) => onStartDateChange(event.target.value)}
                    onClick={(event) => event.currentTarget.showPicker?.()}
                    className="h-11 w-full cursor-pointer rounded-xl border border-gray-200 bg-white pl-10 pr-3 text-sm font-medium text-gray-700 shadow-sm outline-none transition hover:border-blue-300 focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 dark:border-white/10 dark:bg-white/5 dark:text-gray-200"
                  />
                </div>
              </div>

              {/* END DATE */}
              <div className="min-w-0 flex-1">
                <label className="mb-1.5 block text-[11px] font-medium text-gray-400">
                  ถึงวันที่
                </label>

                <div className="relative">
                  <CalendarDays className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-indigo-500" />

                  <input
                    type="date"
                    value={endDate}
                    min={startDate || undefined}
                    onChange={(event) => onEndDateChange(event.target.value)}
                    onClick={(event) => event.currentTarget.showPicker?.()}
                    className="h-11 w-full cursor-pointer rounded-xl border border-gray-200 bg-white pl-10 pr-3 text-sm font-medium text-gray-700 shadow-sm outline-none transition hover:border-indigo-300 focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 dark:border-white/10 dark:bg-white/5 dark:text-gray-200"
                  />
                </div>
              </div>

              {/* CLEAR */}
              <button
                type="button"
                disabled={!search && !startDate && !endDate}
                onClick={onClearDate}
                className="inline-flex h-11 shrink-0 items-center justify-center gap-2 rounded-xl border border-gray-200 bg-white px-5 text-xs font-semibold text-gray-500 shadow-sm transition-all hover:border-red-200 hover:bg-red-50 hover:text-red-500 disabled:cursor-not-allowed disabled:bg-gray-50 disabled:text-gray-300 disabled:shadow-none dark:border-white/10 dark:bg-white/5 dark:text-gray-400 dark:hover:border-red-500/20 dark:hover:bg-red-500/10 dark:hover:text-red-400"
              >
                <RotateCcw className="h-4 w-4" />
                ล้างการค้นหา
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
