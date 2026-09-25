'use client';

import { CarUsageItem } from '@/types/carUsageType';
import {
  formatBookingDate,
  formatDateTime,
  formatTime,
} from '@/utils/formatters';

import {
  ArrowLeft,
  ArrowRight,
  CarFront,
  Gauge,
  MapPin,
  Pencil,
  Trash2,
  UserRound,
} from 'lucide-react';

type UsageTableProps = {
  data: CarUsageItem[];
  isLoading: boolean;

  currentPage: number;
  rowsPerPage: number;
  totalPages: number;
  totalItems: number;

  onPageChange: (page: number) => void;
  onRowsPerPageChange: (rows: number) => void;

  onCreateUsage?: (item: CarUsageItem) => void;
  onEdit?: (item: CarUsageItem) => void;
  onDelete?: (item: CarUsageItem) => void;
};

export default function UsageTable({
  data,
  isLoading,

  currentPage,
  rowsPerPage,
  totalPages,
  totalItems,

  onPageChange,
  onRowsPerPageChange,

  onCreateUsage,
  onEdit,
  onDelete,
}: UsageTableProps) {
  return (
    <div className="overflow-hidden rounded-2xl border border-gray-100 bg-white shadow-sm dark:border-white/10 dark:bg-gray-900">
      <div className="overflow-x-auto">
        <table className="min-w-7xl w-full">
          <thead>
            <tr className="border-b border-gray-100 bg-gray-50/80 text-left dark:border-white/10 dark:bg-white/5">
              <th className="w-16 px-5 py-4 text-xs font-semibold text-gray-500">
                #
              </th>

              <th className="min-w-56 px-5 py-4 text-xs font-semibold text-gray-500">
                พนักงานขับรถ
              </th>

              <th className="min-w-64 px-5 py-4 text-xs font-semibold text-gray-500">
                ข้อมูลรถ
              </th>

              <th className="min-w-64 px-5 py-4 text-xs font-semibold text-gray-500">
                วันที่จอง / เวลา
              </th>
              <th className="min-w-64 px-5 py-4 text-xs font-semibold text-gray-500">
                วันเวลาเดินทาง / กลับ
              </th>

              <th className="min-w-56 px-5 py-4 text-xs font-semibold text-gray-500">
                เลขไมล์
              </th>

              <th className="min-w-72 px-5 py-4 text-xs font-semibold text-gray-500">
                หน่วยงาน / สถานที่
              </th>

              <th className="min-w-48 px-5 py-4 text-right text-xs font-semibold text-gray-500">
                จัดการ
              </th>
            </tr>
          </thead>

          <tbody className="divide-y divide-gray-100 dark:divide-white/5">
            {isLoading ? (
              <LoadingRow />
            ) : data.length === 0 ? (
              <EmptyRow />
            ) : (
              data.map((item, index) => {
                const kmGo = Number(item.kmGo ?? 0);
                const kmBack = Number(item.kmBack ?? 0);

                const totalKm =
                  kmGo > 0 && kmBack > 0 ? Math.max(0, kmBack - kmGo) : 0;

                return (
                  <tr
                    key={item.bookingId}
                    className="group transition-colors hover:bg-blue-50/40 dark:hover:bg-white/5"
                  >
                    {/* INDEX */}
                    <td className="px-5 py-4">
                      <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gray-100 text-xs font-semibold text-gray-600 dark:bg-white/10 dark:text-gray-300">
                        {(currentPage - 1) * rowsPerPage + index + 1}
                      </div>
                    </td>

                    {/* DRIVER */}
                    <td className="px-5 py-4">
                      <div className="flex items-start gap-3">
                        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-indigo-50 text-indigo-500 dark:bg-indigo-500/10">
                          <UserRound className="h-4 w-4" />
                        </div>

                        <div className="min-w-0">
                          <p className="truncate text-sm font-semibold text-gray-900 dark:text-white">
                            {item.driverName || '-'}
                          </p>

                          <p className="mt-1 text-xs text-gray-400">
                            รหัส {item.driverCode || '-'}
                          </p>
                        </div>
                      </div>
                    </td>

                    {/* CAR */}
                    <td className="px-5 py-4">
                      <div className="flex items-start gap-3">
                        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-blue-50 text-blue-600 dark:bg-blue-500/10 dark:text-blue-300">
                          <CarFront className="h-4 w-4" />
                        </div>

                        <div className="min-w-0">
                          <p className="text-sm font-semibold text-gray-900 dark:text-white">
                            {item.carName || '-'}
                          </p>

                          <p className="mt-1 text-xs text-gray-500">
                            {item.carBrand || '-'}
                          </p>

                          <span className="mt-1 inline-flex rounded-lg bg-gray-100 px-2 py-1 text-[11px] font-semibold text-gray-700 dark:bg-white/10 dark:text-gray-300">
                            ทะเบียน {item.licensePlate || '-'}
                          </span>
                        </div>
                      </div>
                    </td>

                    {/* DATE BOOKING */}
                    <td className="px-5 py-4">
                      <TravelDateBooking item={item} />
                    </td>
                    {/* DATE GO / BACK */}
                    <td className="px-5 py-4">
                      <TravelDateTimeBox item={item} />
                    </td>

                    {/* KM */}
                    <td className="px-5 py-4">
                      <div className="min-w-52 overflow-hidden rounded-xl border border-gray-100 bg-gray-50/70 dark:border-white/5 dark:bg-white/5">
                        {/* ไมล์เริ่ม */}
                        <div className="flex items-center justify-between gap-4 px-3 py-2">
                          <div className="flex items-center gap-2 text-xs text-gray-500">
                            <Gauge className="h-3.5 w-3.5 shrink-0 text-blue-500" />
                            <span>ไมล์เริ่ม</span>
                          </div>

                          <span className="whitespace-nowrap text-xs font-semibold text-gray-800 dark:text-gray-200">
                            {formatNumber(kmGo)} กม.
                          </span>
                        </div>

                        {/* ไมล์กลับ */}
                        <div className="flex items-center justify-between gap-4 border-t border-gray-100 px-3 py-2 dark:border-white/10">
                          <div className="flex items-center gap-2 text-xs text-gray-500">
                            <Gauge className="h-3.5 w-3.5 shrink-0 text-emerald-500" />
                            <span>ไมล์กลับ</span>
                          </div>

                          <span className="whitespace-nowrap text-xs font-semibold text-gray-800 dark:text-gray-200">
                            {formatNumber(kmBack)} กม.
                          </span>
                        </div>

                        {/* ระยะทางรวม */}
                        <div className="flex items-center justify-between gap-4 border-t border-blue-100 bg-blue-50/70 px-3 py-2.5 dark:border-blue-500/10 dark:bg-blue-500/10">
                          <span className="text-xs font-semibold text-blue-600 dark:text-blue-400">
                            ระยะทางรวม
                          </span>

                          <span className="whitespace-nowrap text-sm font-bold text-blue-700 dark:text-blue-300">
                            {formatNumber(totalKm)} กม.
                          </span>
                        </div>
                      </div>
                    </td>

                    {/* DEPARTMENT / DESTINATION */}
                    <td className="px-5 py-4">
                      <div className="min-w-0 max-w-sm space-y-2.5">
                        {/* หน่วยงาน */}
                        <div>
                          <span className="inline-flex rounded-lg bg-sky-50 px-2.5 py-1.5 text-xs font-semibold text-sky-700 dark:bg-sky-500/10 dark:text-sky-300">
                            {item.departmentName || 'ไม่ระบุหน่วยงาน'}
                          </span>
                        </div>

                        {/* สถานที่ */}
                        <div className="flex items-start gap-2">
                          <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-red-400" />

                          <div className="min-w-0">
                            <p className="text-[10px] font-medium text-gray-400">
                              สถานที่เดินทาง
                            </p>

                            <p className="mt-0.5 line-clamp-2 text-sm font-medium text-gray-700 dark:text-gray-300">
                              {item.destination || '-'}
                            </p>
                          </div>
                        </div>
                      </div>
                    </td>

                    {/* ACTION */}
                    <td className="px-5 py-4">
                      <div className="flex min-w-40 justify-end">
                        {!item.hasUsage ? (
                          /* ================= ยังไม่ได้ลงรายละเอียด ================= */
                          <div className="flex flex-col items-end gap-1.5">
                            <span className="inline-flex items-center gap-1.5 text-[10px] font-medium text-amber-600 dark:text-amber-400">
                              <span className="h-1.5 w-1.5 rounded-full bg-amber-500" />
                              รอลงข้อมูล
                            </span>

                            <button
                              type="button"
                              onClick={() => onCreateUsage?.(item)}
                              className="group/btn bg-linear-to-r inline-flex h-10 items-center justify-center gap-2 rounded-xl from-blue-600 to-indigo-600 px-4 text-xs font-semibold text-white shadow-sm shadow-blue-500/20 transition-all hover:-translate-y-0.5 hover:shadow-md hover:shadow-blue-500/25 active:translate-y-0"
                            >
                              <Pencil className="h-3.5 w-3.5 transition-transform group-hover/btn:rotate-6" />
                              ลงรายละเอียด
                            </button>
                          </div>
                        ) : (
                          /* ================= ลงรายละเอียดแล้ว ================= */
                          <div className="flex flex-col items-end gap-1.5">
                            <span className="inline-flex items-center gap-1.5 text-[10px] font-medium text-emerald-600 dark:text-emerald-400">
                              <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
                              บันทึกข้อมูลแล้ว
                            </span>

                            <div className="flex items-center gap-1.5">
                              {/* EDIT */}
                              <button
                                type="button"
                                onClick={() => onEdit?.(item)}
                                className="group/btn inline-flex h-9 items-center justify-center gap-1.5 rounded-xl border border-blue-100 bg-blue-50 px-3 text-xs font-semibold text-blue-600 transition-all hover:border-blue-200 hover:bg-blue-100 dark:border-blue-500/20 dark:bg-blue-500/10 dark:text-blue-300 dark:hover:bg-blue-500/20"
                              >
                                <Pencil className="h-3.5 w-3.5 transition-transform group-hover/btn:rotate-6" />
                                แก้ไข
                              </button>

                              {/* DELETE */}
                              {/* <button
                                type="button"
                                onClick={() => onDelete?.(item)}
                                title="ลบข้อมูลการใช้งาน"
                                aria-label="ลบข้อมูลการใช้งาน"
                                className="group/btn flex h-9 w-9 items-center justify-center rounded-xl border border-red-100 bg-red-50 text-red-500 transition-all hover:border-red-200 hover:bg-red-100 hover:text-red-600 dark:border-red-500/20 dark:bg-red-500/10 dark:text-red-400 dark:hover:bg-red-500/20"
                              >
                                <Trash2 className="h-3.5 w-3.5 transition-transform group-hover/btn:scale-110" />
                              </button> */}
                            </div>
                          </div>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {/* ================= PAGINATION ================= */}
      {!isLoading && totalItems > 0 && (
        <div className="dark:bg-white/2 flex flex-col gap-4 border-t border-gray-100 bg-gray-50/40 px-4 py-3 sm:flex-row sm:items-center sm:justify-between dark:border-white/10">
          <div className="flex items-center gap-3">
            <span className="text-xs text-gray-500">แสดง</span>

            <select
              value={rowsPerPage}
              onChange={(event) =>
                onRowsPerPageChange(Number(event.target.value))
              }
              className="h-9 rounded-lg border border-gray-200 bg-white px-3 text-xs font-medium text-gray-700 outline-none transition hover:border-blue-300 focus:border-blue-500 dark:border-white/10 dark:bg-gray-900 dark:text-gray-200"
            >
              {[5, 10, 20, 50].map((number) => (
                <option key={number} value={number}>
                  {number}
                </option>
              ))}
            </select>

            <span className="text-xs text-gray-500">รายการ</span>

            <span className="hidden text-xs text-gray-400 sm:inline">
              ทั้งหมด {totalItems} รายการ
            </span>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => onPageChange(Math.max(1, currentPage - 1))}
              disabled={currentPage === 1}
              className="inline-flex h-9 items-center gap-1 rounded-lg border border-gray-200 bg-white px-3 text-xs text-gray-600 transition hover:border-blue-200 hover:text-blue-600 disabled:cursor-not-allowed disabled:opacity-40 dark:border-white/10 dark:bg-white/5 dark:text-gray-300"
            >
              <ArrowLeft className="h-4 w-4" />
              ก่อนหน้า
            </button>

            <div className="inline-flex h-9 items-center rounded-lg border border-gray-100 bg-white px-3 text-xs dark:border-white/10 dark:bg-white/5">
              <span className="font-bold text-blue-600">{currentPage}</span>

              <span className="mx-1.5 text-gray-300">/</span>

              <span className="text-gray-600 dark:text-gray-300">
                {totalPages}
              </span>
            </div>

            <button
              type="button"
              onClick={() =>
                onPageChange(Math.min(totalPages, currentPage + 1))
              }
              disabled={currentPage >= totalPages}
              className="bg-linear-to-r inline-flex h-9 items-center gap-1 rounded-lg from-blue-500 to-indigo-600 px-3 text-xs font-medium text-white shadow-sm transition hover:shadow-md disabled:cursor-not-allowed disabled:opacity-40"
            >
              ถัดไป
              <ArrowRight className="h-4 w-4" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

function LoadingRow() {
  return (
    <tr>
      <td colSpan={8} className="px-6 py-16 text-center">
        <div className="flex flex-col items-center justify-center">
          <div className="h-9 w-9 animate-spin rounded-full border-4 border-blue-100 border-t-blue-600" />

          <p className="mt-3 text-sm text-gray-500">กำลังโหลดข้อมูล...</p>
        </div>
      </td>
    </tr>
  );
}

function EmptyRow() {
  return (
    <tr>
      <td colSpan={8} className="px-6 py-16 text-center">
        <p className="text-sm font-medium text-gray-500 dark:text-gray-400">
          ไม่พบข้อมูลการใช้งานรถ
        </p>
      </td>
    </tr>
  );
}

function formatNumber(value?: number | null) {
  if (value == null) {
    return '-';
  }

  return new Intl.NumberFormat('th-TH', {
    maximumFractionDigits: 1,
  }).format(value);
}

function TravelDateTimeBox({ item }: { item: CarUsageItem }) {
  const go = item.hasUsage && item.dateGo ? formatDateTime(item.dateGo) : null;

  const back =
    item.hasUsage && item.dateBack ? formatDateTime(item.dateBack) : null;

  return (
    <div className="min-w-60 overflow-hidden rounded-xl border border-gray-100 bg-gray-50/70 dark:border-white/5 dark:bg-white/5">
      {/* เดินทาง */}
      <div className="px-3 py-2.5">
        <div className="flex items-center justify-between gap-3">
          <span className="text-[10px] font-semibold text-blue-600 dark:text-blue-400">
            เดินทาง
          </span>

          <span className="text-[10px] text-gray-400">
            {go ? `${go.time} น.` : '-'}
          </span>
        </div>

        <p className="mt-1 text-sm font-semibold text-gray-800 dark:text-gray-200">
          {go?.date ?? '-'}
        </p>
      </div>

      {/* กลับ */}
      <div className="border-t border-gray-200 px-3 py-2.5 dark:border-white/10">
        <div className="flex items-center justify-between gap-3">
          <span className="text-[10px] font-semibold text-emerald-600 dark:text-emerald-400">
            กลับ
          </span>

          <span className="text-[10px] text-gray-400">
            {back ? `${back.time} น.` : '-'}
          </span>
        </div>

        <p className="mt-1 text-sm font-semibold text-gray-800 dark:text-gray-200">
          {back?.date ?? '-'}
        </p>
      </div>
    </div>
  );
}

function TravelDateBooking({ item }: { item: CarUsageItem }) {
  const start =
    item.hasUsage && item.dateGo
      ? formatDateTime(item.dateGo)
      : {
          date: formatBookingDate(item.startDate),
          time: formatTime(item.startTime),
        };

  const end =
    item.hasUsage && item.dateBack
      ? formatDateTime(item.dateBack)
      : {
          date: formatBookingDate(item.endDate),
          time: formatTime(item.endTime),
        };

  const isSameDate = start.date === end.date;

  return (
    <div className="min-w-68 overflow-hidden rounded-2xl border border-gray-100 bg-white shadow-sm dark:border-white/10 dark:bg-white/5">
      <div className="relative px-4 py-3">
        {/* DURATION LINE */}
        <div className="flex items-center gap-2 pb-3">
          <span className="text-[10px] text-gray-400">
            {isSameDate ? 'ภายในวันเดียวกัน' : 'ต่อเนื่องหลายวัน'}
          </span>
        </div>
        {/* เส้น timeline */}
        <div className="left-5.75 absolute bottom-7 top-7 w-px bg-gray-200 dark:bg-white/10" />

        {/* START */}
        <div className="relative flex items-start gap-3">
          <div className="relative z-10 mt-1 flex h-4 w-4 shrink-0 items-center justify-center rounded-full border-2 border-blue-500 bg-white dark:bg-gray-900">
            <div className="h-1.5 w-1.5 rounded-full bg-blue-500" />
          </div>

          <div className="min-w-0 flex-1">
            <div className="flex items-center justify-between gap-3">
              <span className="text-[10px] font-semibold text-blue-600 dark:text-blue-400">
                เริ่มเดินทาง
              </span>

              <span className="rounded-md bg-blue-50 px-2 py-0.5 text-[10px] font-bold text-blue-700 dark:bg-blue-500/10 dark:text-blue-300">
                {start.time} น.
              </span>
            </div>

            <p className="mt-1 text-sm font-semibold text-gray-900 dark:text-white">
              {start.date}
            </p>
          </div>
        </div>

        {/* END */}
        <div className="relative mt-2 flex items-start gap-3">
          <div className="relative z-10 mt-1 flex h-4 w-4 shrink-0 items-center justify-center rounded-full border-2 border-emerald-500 bg-white dark:bg-gray-900">
            <div className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
          </div>

          <div className="min-w-0 flex-1">
            <div className="flex items-center justify-between gap-3">
              <span className="text-[10px] font-semibold text-emerald-600 dark:text-emerald-400">
                สิ้นสุด / กลับ
              </span>

              <span className="rounded-md bg-emerald-50 px-2 py-0.5 text-[10px] font-bold text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-300">
                {end.time} น.
              </span>
            </div>

            <p className="mt-1 text-sm font-semibold text-gray-900 dark:text-white">
              {end.date}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
