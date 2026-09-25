'use client';

import { ArrowLeft, ArrowRight, Fuel, Pencil, Trash2 } from 'lucide-react';

export type OilBrandItem = {
  id: number;
  oilName: string;
};

type OilBrandTableProps = {
  data: OilBrandItem[];
  isLoading: boolean;

  currentPage: number;
  rowsPerPage: number;
  totalPages: number;
  totalItems: number;

  onPageChange: (page: number) => void;
  onRowsPerPageChange: (rows: number) => void;

  onEdit: (item: OilBrandItem) => void;
  onDelete: (item: OilBrandItem) => void;
};

export default function OilBrandTable({
  data,
  isLoading,
  currentPage,
  rowsPerPage,
  totalPages,
  totalItems,
  onPageChange,
  onRowsPerPageChange,
  onEdit,
  onDelete,
}: OilBrandTableProps) {
  return (
    <div className="overflow-hidden rounded-3xl border border-gray-100 bg-white shadow-sm dark:border-white/10 dark:bg-gray-900">
      {/* ================= TABLE ================= */}
      <div className="w-full overflow-x-auto">
        <table className="w-full table-fixed">
          {/* TABLE HEADER */}

          <thead>
            <tr className="dark:bg-white/3 border-b border-gray-100 bg-gray-50/80 dark:border-white/10">
              <th className="w-20 px-4 py-4 text-left text-xs font-semibold text-gray-400 sm:px-6">
                ลำดับ
              </th>

              <th className="px-4 py-4 text-left text-xs font-semibold text-gray-400 sm:px-6">
                ยี่ห้อ / ชนิดน้ำมัน
              </th>

              <th className="w-28 px-4 py-4 text-right text-xs font-semibold text-gray-400 sm:w-44 sm:px-6">
                จัดการ
              </th>
            </tr>
          </thead>

          {/* TABLE BODY */}

          <tbody className="divide-y divide-gray-100 dark:divide-white/5">
            {isLoading ? (
              <LoadingRow />
            ) : data.length === 0 ? (
              <EmptyRow />
            ) : (
              data.map((item, index) => (
                <tr
                  key={item.id}
                  className="dark:hover:bg-white/3 group bg-white transition-colors duration-200 hover:bg-amber-50/40 dark:bg-transparent"
                >
                  {/* ================= INDEX ================= */}
                  <td className="px-4 py-4 sm:px-6">
                    <div className="flex h-9 w-9 items-center justify-center rounded-xl border border-gray-100 bg-gray-50 text-xs font-bold text-gray-500 transition group-hover:border-amber-100 group-hover:bg-amber-50 group-hover:text-amber-600 dark:border-white/10 dark:bg-white/5 dark:text-gray-400">
                      {(currentPage - 1) * rowsPerPage + index + 1}
                    </div>
                  </td>

                  {/* ================= OIL ================= */}
                  <td className="px-4 py-4 sm:px-6">
                    <div className="flex min-w-0 items-center gap-3 sm:gap-4">
                      {/* ICON */}
                      <div className="bg-linear-to-br flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl from-amber-50 to-orange-50 text-amber-600 ring-1 ring-amber-100 transition-all group-hover:scale-105 group-hover:shadow-sm dark:from-amber-500/10 dark:to-orange-500/10 dark:text-amber-300 dark:ring-amber-500/20">
                        <Fuel className="h-5 w-5" />
                      </div>

                      {/* INFO */}
                      <div className="min-w-0 flex-1">
                        <p className="truncate text-sm font-bold text-gray-900 sm:text-[15px] dark:text-white">
                          {item.oilName || '-'}
                        </p>

                        {/* <div className="mt-1 flex flex-wrap items-center gap-2">
                          <span className="inline-flex items-center rounded-md bg-gray-100 px-2 py-0.5 text-[10px] font-semibold text-gray-500 dark:bg-white/10 dark:text-gray-400">
                            ID #{item.id}
                          </span>

                          <span className="hidden text-[10px] text-gray-400 sm:inline">
                            ใช้สำหรับบันทึกการเติมน้ำมัน
                          </span>
                        </div> */}
                      </div>
                    </div>
                  </td>

                  {/* ================= ACTION ================= */}
                  <td className="px-4 py-4 sm:px-6">
                    <div className="flex items-center justify-end gap-2">
                      {/* EDIT */}
                      <button
                        type="button"
                        onClick={() => onEdit(item)}
                        title={`แก้ไข ${item.oilName}`}
                        className="group/edit inline-flex h-9 items-center justify-center gap-1.5 rounded-xl border border-blue-100 bg-blue-50 px-2.5 text-xs font-semibold text-blue-600 transition-all hover:border-blue-200 hover:bg-blue-100 hover:shadow-sm sm:px-3 dark:border-blue-500/20 dark:bg-blue-500/10 dark:text-blue-300 dark:hover:bg-blue-500/20"
                      >
                        <Pencil className="h-3.5 w-3.5 transition-transform group-hover/edit:rotate-6" />

                        <span className="hidden sm:inline">แก้ไข</span>
                      </button>

                      {/* DELETE */}
                      <button
                        type="button"
                        onClick={() => onDelete(item)}
                        title={`ลบ ${item.oilName}`}
                        aria-label={`ลบ ${item.oilName}`}
                        className="group/delete flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border border-red-100 bg-red-50 text-red-500 transition-all hover:border-red-200 hover:bg-red-100 hover:text-red-600 hover:shadow-sm dark:border-red-500/20 dark:bg-red-500/10 dark:text-red-400 dark:hover:bg-red-500/20"
                      >
                        <Trash2 className="h-3.5 w-3.5 transition-transform group-hover/delete:scale-110" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* =====================================================
          PAGINATION
      ===================================================== */}
      {!isLoading && totalItems > 0 && (
        <div className="dark:bg-white/2 flex flex-col gap-4 border-t border-gray-100 bg-gray-50/40 px-4 py-3.5 sm:flex-row sm:items-center sm:justify-between sm:px-6 dark:border-white/10">
          {/* ================= LEFT ================= */}
          <div className="flex flex-wrap items-center gap-2.5">
            <span className="text-xs text-gray-400">แสดง</span>

            <select
              value={rowsPerPage}
              onChange={(event) =>
                onRowsPerPageChange(Number(event.target.value))
              }
              className="h-9 rounded-xl border border-gray-200 bg-white px-3 text-xs font-semibold text-gray-700 shadow-sm outline-none transition hover:border-amber-300 focus:border-amber-500 focus:ring-4 focus:ring-amber-500/10 dark:border-white/10 dark:bg-gray-900 dark:text-gray-200"
            >
              {[5, 10, 20, 50].map((number) => (
                <option key={number} value={number}>
                  {number}
                </option>
              ))}
            </select>

            <span className="text-xs text-gray-400">รายการ</span>

            <span className="mx-1 hidden h-4 w-px bg-gray-200 sm:block dark:bg-white/10" />

            <span className="text-xs text-gray-400">
              ทั้งหมด{' '}
              <strong className="font-semibold text-gray-700 dark:text-gray-200">
                {totalItems}
              </strong>{' '}
              รายการ
            </span>
          </div>

          {/* ================= RIGHT ================= */}
          <div className="flex items-center justify-between gap-2 sm:justify-end">
            {/* PREVIOUS */}
            <button
              type="button"
              onClick={() => onPageChange(Math.max(1, currentPage - 1))}
              disabled={currentPage === 1}
              className="inline-flex h-9 items-center justify-center gap-1.5 rounded-xl border border-gray-200 bg-white px-3 text-xs font-medium text-gray-600 shadow-sm transition hover:border-amber-200 hover:bg-amber-50 hover:text-amber-600 disabled:cursor-not-allowed disabled:opacity-40 dark:border-white/10 dark:bg-white/5 dark:text-gray-300"
            >
              <ArrowLeft className="h-4 w-4" />

              <span className="hidden sm:inline">ก่อนหน้า</span>
            </button>

            {/* PAGE */}
            <div className="min-w-18 inline-flex h-9 items-center justify-center rounded-xl border border-gray-100 bg-white px-3 text-xs shadow-sm dark:border-white/10 dark:bg-white/5">
              <span className="font-bold text-amber-600 dark:text-amber-400">
                {currentPage}
              </span>

              <span className="mx-1.5 text-gray-300">/</span>

              <span className="text-gray-500 dark:text-gray-300">
                {totalPages}
              </span>
            </div>

            {/* NEXT */}
            <button
              type="button"
              onClick={() =>
                onPageChange(Math.min(totalPages, currentPage + 1))
              }
              disabled={currentPage >= totalPages}
              className="bg-linear-to-r inline-flex h-9 items-center justify-center gap-1.5 rounded-xl from-amber-500 to-orange-600 px-3 text-xs font-semibold text-white shadow-sm shadow-amber-500/20 transition-all hover:-translate-y-0.5 hover:shadow-md disabled:translate-y-0 disabled:cursor-not-allowed disabled:opacity-40"
            >
              <span className="hidden sm:inline">ถัดไป</span>

              <ArrowRight className="h-4 w-4" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

/* =====================================================
   LOADING
===================================================== */

function LoadingRow() {
  return (
    <tr>
      <td colSpan={3} className="px-6 py-20">
        <div className="flex flex-col items-center justify-center">
          <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-amber-50 dark:bg-amber-500/10">
            <div className="h-7 w-7 animate-spin rounded-full border-[3px] border-amber-100 border-t-amber-500 dark:border-amber-500/20 dark:border-t-amber-400" />
          </div>

          <p className="mt-4 text-sm font-medium text-gray-500 dark:text-gray-400">
            กำลังโหลดข้อมูลยี่ห้อน้ำมัน...
          </p>
        </div>
      </td>
    </tr>
  );
}

/* =====================================================
   EMPTY
===================================================== */

function EmptyRow() {
  return (
    <tr>
      <td colSpan={3} className="px-6 py-20">
        <div className="flex flex-col items-center justify-center text-center">
          <div className="bg-linear-to-br flex h-16 w-16 items-center justify-center rounded-2xl from-amber-50 to-orange-50 text-amber-500 ring-1 ring-amber-100 dark:from-amber-500/10 dark:to-orange-500/10 dark:ring-amber-500/20">
            <Fuel className="h-7 w-7" />
          </div>

          <p className="mt-4 text-sm font-semibold text-gray-700 dark:text-gray-300">
            ไม่พบข้อมูลยี่ห้อน้ำมัน
          </p>

          <p className="mt-1 text-xs text-gray-400">
            ยังไม่มีรายการ หรือไม่พบข้อมูลจากคำค้นหา
          </p>
        </div>
      </td>
    </tr>
  );
}
