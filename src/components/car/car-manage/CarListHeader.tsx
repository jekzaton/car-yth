'use client';

import { BookingStatus } from '@/types/carBookingType';
import {
  CalendarCheck2,
  CalendarDays,
  CheckCircle2,
  ChevronDown,
  CirclePlus,
  Clock3,
  Search,
  X,
  XCircle,
} from 'lucide-react';

type CarListHeaderProps = {
  search: string;
  onSearchChange: (value: string) => void;

  statusFilter: 'all' | BookingStatus;
  onStatusFilterChange: (value: 'all' | BookingStatus) => void;

  dateFrom: string;
  dateTo: string;
  onDateFromChange: (value: string) => void;
  onDateToChange: (value: string) => void;
  onClearDate: () => void;

  total: number;
  resultCount: number;

  pendingCount: number;
  approvedCount: number;
  cancelledCount: number;

  onCreate: () => void;
};

export default function CarListHeader({
  search,
  onSearchChange,

  statusFilter,
  onStatusFilterChange,

  dateFrom,
  dateTo,
  onDateFromChange,
  onDateToChange,
  onClearDate,

  total,
  resultCount, // <-- เพิ่มตรงนี้

  pendingCount,
  approvedCount,
  cancelledCount,

  onCreate,
}: CarListHeaderProps) {
  const openDatePicker = (event: React.MouseEvent<HTMLInputElement>) => {
    const input = event.currentTarget;

    if ('showPicker' in input) {
      try {
        input.showPicker();
      } catch {
        // fallback ใช้ native behavior
      }
    }
  };
  return (
    <div className="bg-linear-to-r relative overflow-hidden rounded-3xl border border-gray-100 from-white via-white to-blue-50/70 p-6 shadow-sm dark:border-white/10 dark:from-gray-900 dark:via-gray-900 dark:to-blue-950/20">
      {/* GLOW */}
      <div className="pointer-events-none absolute -right-20 -top-20 h-56 w-56 rounded-full bg-blue-500/10 blur-3xl" />

      <div className="pointer-events-none absolute -bottom-24 left-1/3 h-48 w-48 rounded-full bg-indigo-500/10 blur-3xl" />

      <div className="relative space-y-6">
        {/* ================= HEADER ================= */}
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div className="flex items-center gap-4">
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-blue-600 text-white shadow-lg shadow-blue-500/20">
              <CalendarCheck2 className="h-6 w-6" />
            </div>

            <div>
              <h1 className="text-xl font-bold text-gray-900 dark:text-white">
                รายการจองรถ
              </h1>

              <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                ตรวจสอบ อนุมัติ และจัดการรายการจองรถราชการ
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <span className="inline-flex h-10 items-center rounded-xl border border-blue-100 bg-blue-50 px-4 text-xs font-semibold text-blue-700 dark:border-blue-500/20 dark:bg-blue-500/10 dark:text-blue-300">
              ทั้งหมด {total} รายการ
            </span>

            <button
              type="button"
              onClick={onCreate}
              className="bg-linear-to-r inline-flex h-10 items-center justify-center gap-2 rounded-xl from-blue-500 via-blue-600 to-indigo-600 px-4 text-sm font-semibold text-white shadow-md shadow-blue-500/15 transition hover:-translate-y-0.5 hover:shadow-lg active:translate-y-0"
            >
              <CirclePlus className="h-4 w-4" />
              จองรถ
            </button>
          </div>
        </div>

        {/* ================= KPI ================= */}
        <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
          {/* TOTAL */}
          <div className="rounded-2xl border border-gray-100 bg-white/80 p-4 shadow-sm backdrop-blur dark:border-white/10 dark:bg-white/5">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-medium text-gray-500">ทั้งหมด</p>

                <p className="mt-1 text-2xl font-bold text-gray-900 dark:text-white">
                  {total}
                </p>
              </div>

              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gray-100 text-gray-500 dark:bg-white/10 dark:text-gray-300">
                <CalendarCheck2 className="h-5 w-5" />
              </div>
            </div>
          </div>

          {/* PENDING */}
          <div className="rounded-2xl border border-amber-100 bg-amber-50/70 p-4 dark:border-amber-500/10 dark:bg-amber-500/10">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-medium text-amber-700 dark:text-amber-300">
                  รออนุมัติ
                </p>

                <p className="mt-1 text-2xl font-bold text-amber-700 dark:text-amber-300">
                  {pendingCount}
                </p>
              </div>

              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-amber-100 text-amber-600 dark:bg-amber-500/15 dark:text-amber-300">
                <Clock3 className="h-5 w-5" />
              </div>
            </div>
          </div>

          {/* APPROVED */}
          <div className="rounded-2xl border border-emerald-100 bg-emerald-50/70 p-4 dark:border-emerald-500/10 dark:bg-emerald-500/10">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-medium text-emerald-700 dark:text-emerald-300">
                  อนุมัติแล้ว
                </p>

                <p className="mt-1 text-2xl font-bold text-emerald-700 dark:text-emerald-300">
                  {approvedCount}
                </p>
              </div>

              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-100 text-emerald-600 dark:bg-emerald-500/15 dark:text-emerald-300">
                <CheckCircle2 className="h-5 w-5" />
              </div>
            </div>
          </div>

          {/* CANCELLED */}
          <div className="rounded-2xl border border-red-100 bg-red-50/70 p-4 dark:border-red-500/10 dark:bg-red-500/10">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-medium text-red-600 dark:text-red-300">
                  ยกเลิก
                </p>

                <p className="mt-1 text-2xl font-bold text-red-600 dark:text-red-300">
                  {cancelledCount}
                </p>
              </div>

              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-red-100 text-red-500 dark:bg-red-500/15 dark:text-red-300">
                <XCircle className="h-5 w-5" />
              </div>
            </div>
          </div>
        </div>

        {/* ================= CONTROLS ================= */}
        {/* ================= CONTROLS ================= */}
        <div className="space-y-3">
          {/* FILTER ROW */}
          <div className="flex w-full flex-col gap-3 lg:flex-row lg:items-end">
            {/* ================= SEARCH ================= */}
            <div className="min-w-0 flex-1">
              <label className="mb-1.5 block text-xs font-medium text-gray-500 dark:text-gray-400">
                ค้นหารายการ
              </label>

              <div className="relative">
                <Search className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />

                <input
                  type="text"
                  value={search}
                  onChange={(e) => onSearchChange(e.target.value)}
                  placeholder="ค้นหา ผู้จอง รถ ทะเบียน เรื่อง หรือสถานที่..."
                  className={`h-11 w-full rounded-xl border border-gray-200 bg-white/80 pl-10 text-sm text-gray-800 shadow-sm outline-none transition placeholder:text-gray-400 hover:border-blue-300 focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 dark:border-white/10 dark:bg-white/5 dark:text-white ${
                    search ? 'pr-10' : 'pr-4'
                  }`}
                />

                {search && (
                  <button
                    type="button"
                    onClick={() => onSearchChange('')}
                    title="ล้างการค้นหา"
                    className="absolute right-2 top-1/2 flex h-7 w-7 -translate-y-1/2 items-center justify-center rounded-lg text-gray-400 transition hover:bg-red-50 hover:text-red-500 dark:hover:bg-red-500/10"
                  >
                    <X className="h-4 w-4" />
                  </button>
                )}
              </div>
            </div>

            {/* ================= STATUS ================= */}
            <div className="w-full shrink-0 sm:w-44">
              <label className="mb-1.5 block text-xs font-medium text-gray-500 dark:text-gray-400">
                สถานะ
              </label>

              <div className="relative">
                <select
                  value={statusFilter}
                  onChange={(e) =>
                    onStatusFilterChange(
                      e.target.value as 'all' | BookingStatus,
                    )
                  }
                  className="h-11 w-full appearance-none rounded-xl border border-gray-200 bg-white/80 px-4 pr-10 text-sm font-medium text-gray-700 shadow-sm outline-none transition hover:border-blue-300 focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 dark:border-white/10 dark:bg-white/5 dark:text-gray-200"
                >
                  <option value="all">ทุกสถานะ</option>
                  <option value="pending">รออนุมัติ</option>
                  <option value="approved">อนุมัติแล้ว</option>
                  <option value="cancelled">ยกเลิก</option>
                </select>

                <ChevronDown className="pointer-events-none absolute right-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
              </div>
            </div>

            {/* ================= DATE FROM ================= */}
            <div className="w-full shrink-0 sm:w-48">
              <label className="mb-1.5 flex items-center gap-1.5 text-xs font-medium text-gray-500 dark:text-gray-400">
                <CalendarDays className="h-3.5 w-3.5 text-blue-500" />
                วันที่เริ่มต้น
              </label>

              <input
                type="date"
                value={dateFrom}
                max={dateTo || undefined}
                onChange={(e) => onDateFromChange(e.target.value)}
                onClick={openDatePicker}
                className="h-11 w-full cursor-pointer rounded-xl border border-gray-200 bg-white/80 px-3 text-sm font-medium text-gray-700 shadow-sm outline-none transition hover:border-blue-300 focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 dark:border-white/10 dark:bg-white/5 dark:text-gray-200"
              />
            </div>

            {/* ================= DATE TO ================= */}
            <div className="w-full shrink-0 sm:w-48">
              <label className="mb-1.5 flex items-center gap-1.5 text-xs font-medium text-gray-500 dark:text-gray-400">
                <CalendarDays className="h-3.5 w-3.5 text-indigo-500" />
                วันที่สิ้นสุด
              </label>

              <input
                type="date"
                value={dateTo}
                min={dateFrom || undefined}
                onChange={(e) => onDateToChange(e.target.value)}
                onClick={openDatePicker}
                className="h-11 w-full cursor-pointer rounded-xl border border-gray-200 bg-white/80 px-3 text-sm font-medium text-gray-700 shadow-sm outline-none transition hover:border-indigo-300 focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 dark:border-white/10 dark:bg-white/5 dark:text-gray-200"
              />
            </div>

            {/* ================= CLEAR DATE ================= */}
            {(dateFrom || dateTo) && (
              <button
                type="button"
                onClick={onClearDate}
                title="ล้างช่วงวันที่"
                className="inline-flex h-11 shrink-0 items-center justify-center gap-1.5 rounded-xl border border-gray-200 bg-white px-3 text-xs font-semibold text-gray-500 shadow-sm transition hover:border-red-200 hover:bg-red-50 hover:text-red-500 dark:border-white/10 dark:bg-white/5 dark:hover:bg-red-500/10"
              >
                <X className="h-4 w-4" />
                <span className="lg:hidden 2xl:inline">ล้างวันที่</span>
              </button>
            )}
          </div>

          {/* ================= RESULT ================= */}
          <div className="dark:bg-white/3 flex items-center justify-between rounded-xl bg-gray-50/70 px-3 py-2">
            <div className="flex flex-wrap items-center gap-2">
              <p className="text-xs text-gray-500 dark:text-gray-400">
                พบผลลัพธ์
                <span className="mx-1 font-bold text-blue-600 dark:text-blue-400">
                  {resultCount}
                </span>
                รายการ
              </p>

              {/* แสดงว่ากำลังกรองวันที่ */}
              {(dateFrom || dateTo) && (
                <span className="inline-flex items-center gap-1 rounded-lg bg-indigo-50 px-2 py-1 text-[10px] font-semibold text-indigo-600 dark:bg-indigo-500/10 dark:text-indigo-300">
                  <CalendarDays className="h-3 w-3" />

                  {dateFrom && dateTo
                    ? `${dateFrom} ถึง ${dateTo}`
                    : dateFrom
                      ? `ตั้งแต่ ${dateFrom}`
                      : `ถึง ${dateTo}`}
                </span>
              )}

              {/* แสดงสถานะที่กำลังกรอง */}
              {statusFilter !== 'all' && (
                <span className="rounded-lg bg-blue-50 px-2 py-1 text-[10px] font-semibold text-blue-600 dark:bg-blue-500/10 dark:text-blue-300">
                  {statusFilter === 'pending' && 'รออนุมัติ'}
                  {statusFilter === 'approved' && 'อนุมัติแล้ว'}
                  {statusFilter === 'cancelled' && 'ยกเลิก'}
                </span>
              )}
            </div>

            <span className="hidden text-[11px] text-gray-400 sm:block">
              จากทั้งหมด {total} รายการ
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
