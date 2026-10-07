'use client';

import {
  CalendarDays,
  CarFront,
  ChevronLeft,
  ChevronRight,
  Pencil,
  Trash2,
  UserRound,
  Wrench,
} from 'lucide-react';

import type { CarMaintainItem } from '@/types/carMaintainType';

type MaintainTableProps = {
  data: CarMaintainItem[];

  isLoading: boolean;

  currentPage: number;
  rowsPerPage: number;
  totalPages: number;
  totalItems: number;

  onPageChange: (page: number) => void;
  onRowsPerPageChange: (rows: number) => void;

  onEdit: (item: CarMaintainItem) => void;
  onDelete: (item: CarMaintainItem) => void;
};

const ROW_OPTIONS = [10, 20, 50];

export default function MaintainTable({
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
}: MaintainTableProps) {
  const safeCurrentPage = Math.min(
    Math.max(currentPage, 1),
    Math.max(totalPages, 1),
  );

  return (
    <section className="overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm dark:border-gray-800 dark:bg-gray-900">
      {/* TABLE */}

      <div className="overflow-x-auto">
        <table className="min-w-250 w-full">
          {/* HEADER */}

          <thead>
            <tr className="dark:bg-white/3 border-b border-gray-200 bg-gray-50/80 dark:border-gray-800">
              <TableHead className="w-16">#</TableHead>

              <TableHead>รถยนต์</TableHead>

              <TableHead>วันที่ / รายละเอียดการซ่อม</TableHead>
              <TableHead>ผู้ดำเนินการ</TableHead>

              <TableHead className="text-right">ค่าใช้จ่าย</TableHead>

              <TableHead className="w-32 text-center">จัดการ</TableHead>
            </tr>
          </thead>

          {/* =================================================
              BODY
          ================================================== */}

          <tbody className="divide-border divide-y">
            {isLoading ? (
              <LoadingRow />
            ) : data.length === 0 ? (
              <EmptyRow />
            ) : (
              data.map((item, index) => {
                const rowNumber =
                  (safeCurrentPage - 1) * rowsPerPage + index + 1;

                return (
                  <tr
                    key={item.id}
                    className="dark:hover:bg-white/3 group transition-colors duration-150 hover:bg-gray-50/80"
                  >
                    {/* =======================================
                        NUMBER
                    ======================================== */}
                    <td className="px-5 py-4">
                      <span className="text-muted-foreground text-sm font-medium">
                        {rowNumber}
                      </span>
                    </td>
                    {/* =======================================
                        CAR
                    ======================================== */}
                    <td className="px-5 py-4">
                      <CarCell item={item} />
                    </td>
                    {/* DATE + DETAIL */}

                    <td className="max-w-105 px-5 py-4">
                      <div className="flex min-w-72 items-start gap-3">
                        {/* ICON */}

                        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-amber-50 text-amber-600 dark:bg-amber-500/10 dark:text-amber-300">
                          <Wrench className="h-4.5 w-4.5" />
                        </div>

                        {/* CONTENT */}

                        <div className="min-w-0 flex-1">
                          {/* DATE */}

                          <div className="mb-1.5 flex flex-wrap items-center gap-2">
                            <div className="inline-flex items-center gap-1.5 rounded-lg bg-amber-50 px-2.5 py-1 text-[11px] font-semibold text-amber-700 dark:bg-amber-500/10 dark:text-amber-300">
                              <CalendarDays className="h-3.5 w-3.5" />

                              <span>{formatThaiDate(item.dateMaintain)}</span>
                            </div>

                            <span className="text-muted-foreground text-[10px] font-medium">
                              วันที่ซ่อมบำรุง
                            </span>
                          </div>

                          {/* DETAIL */}

                          <p
                            className="text-foreground line-clamp-2 text-sm font-medium leading-6"
                            title={item.detailMaintain || undefined}
                          >
                            {item.detailMaintain ||
                              'ไม่ระบุรายละเอียดการซ่อมบำรุง'}
                          </p>
                        </div>
                      </div>
                    </td>
                    {/* USER */}
                    <td className="px-5 py-4">
                      <UserCell item={item} />
                    </td>
                    {/* PRICE */}
                    <td className="px-5 py-4 text-right">
                      <div className="inline-flex flex-col items-end">
                        <p className="text-sm font-bold tabular-nums text-emerald-600 dark:text-emerald-400">
                          {formatMoney(item.priceMaintain)}
                        </p>

                        <p className="text-muted-foreground mt-0.5 text-[10px] font-medium">
                          บาท
                        </p>
                      </div>
                    </td>
                    {/* =======================================
                        ACTION
                    ======================================== */}
                    <td className="px-5 py-4">
                      <div className="flex items-center justify-center gap-2">
                        <button
                          type="button"
                          onClick={() => onEdit(item)}
                          title="แก้ไข"
                          className="inline-flex h-8 w-8 items-center justify-center rounded-lg border border-blue-100 bg-blue-50 text-blue-600 transition hover:border-blue-500 hover:bg-blue-600 hover:text-white dark:border-blue-500/20 dark:bg-blue-500/10 dark:text-blue-300"
                        >
                          <Pencil className="h-3.5 w-3.5" />
                        </button>

                        <button
                          type="button"
                          onClick={() => onDelete(item)}
                          title="ลบ"
                          className="inline-flex h-8 w-8 items-center justify-center rounded-lg border border-rose-100 bg-rose-50 text-rose-600 transition hover:border-rose-500 hover:bg-rose-600 hover:text-white dark:border-rose-500/20 dark:bg-rose-500/10 dark:text-rose-300"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {/* PAGINATION */}

      {!isLoading && totalItems > 0 && (
        <Pagination
          currentPage={safeCurrentPage}
          rowsPerPage={rowsPerPage}
          totalPages={totalPages}
          totalItems={totalItems}
          onPageChange={onPageChange}
          onRowsPerPageChange={onRowsPerPageChange}
        />
      )}
    </section>
  );
}

// CAR CELL

function CarCell({ item }: { item: CarMaintainItem }) {
  const carTitle =
    [item.carBrand, item.carBrandSub].filter(Boolean).join(' ') ||
    'ไม่ระบุข้อมูลรถ';

  return (
    <div className="min-w-64">
      <div className="flex items-center gap-3">
        {/* ICON */}
        <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border border-amber-200 bg-amber-50 text-amber-600 shadow-sm dark:border-amber-500/20 dark:bg-amber-500/10 dark:text-amber-300">
          <CarFront className="h-5 w-5" />
        </div>

        {/* INFO */}
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <p
              className="max-w-56 truncate text-sm font-bold text-gray-900 dark:text-white"
              title={carTitle}
            >
              {carTitle}
            </p>

            {item.carCode && (
              <span className="inline-flex shrink-0 items-center rounded-lg bg-amber-50 px-2 py-1 text-[10px] font-bold text-amber-700 dark:bg-amber-500/10 dark:text-amber-300">
                {item.carCode}
              </span>
            )}
          </div>

          <div className="mt-1.5 flex flex-wrap items-center gap-2">
            <span className="inline-flex items-center rounded-lg bg-gray-100 px-2.5 py-1 text-[11px] font-semibold text-gray-700 dark:bg-white/10 dark:text-gray-300">
              ทะเบียน {item.licensePlate || '-'}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}

// USER CELL

function UserCell({ item }: { item: CarMaintainItem }) {
  return (
    <div className="flex min-w-44 items-center gap-3">
      <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-blue-50 text-blue-600 dark:bg-blue-500/10 dark:text-blue-300">
        <UserRound className="h-4 w-4" />
      </div>

      <div className="min-w-0">
        <p className="max-w-48 truncate text-sm font-semibold text-gray-900 dark:text-white">
          {item.userName || 'ไม่พบข้อมูล'}
        </p>

        <p className="mt-1 text-[10px] font-medium text-gray-400">
          รหัส {item.userCode || '-'}
        </p>
      </div>
    </div>
  );
}

// TABLE HEAD

function TableHead({
  children,
  className = '',
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <th
      className={`px-5 py-3.5 text-left text-[11px] font-bold uppercase tracking-wide text-gray-500 dark:text-gray-400 ${className}`}
    >
      {children}
    </th>
  );
}

// LOADING

function LoadingRow() {
  return (
    <tr>
      <td colSpan={7} className="px-5 py-20 text-center">
        <div className="mx-auto h-9 w-9 animate-spin rounded-full border-4 border-amber-500/15 border-t-amber-500" />

        <p className="text-muted-foreground mt-3 text-sm font-medium">
          กำลังโหลดข้อมูล...
        </p>
      </td>
    </tr>
  );
}

// EMPTY

function EmptyRow() {
  return (
    <tr>
      <td colSpan={7} className="px-5 py-20 text-center">
        <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-amber-500/10 text-amber-600 dark:text-amber-300">
          <Wrench className="h-6 w-6" />
        </div>

        <p className="text-foreground mt-3 font-semibold">
          ไม่พบข้อมูลการซ่อมบำรุง
        </p>

        <p className="text-muted-foreground mt-1 text-sm">
          ลองเปลี่ยนคำค้นหา หรือเพิ่มข้อมูลใหม่
        </p>
      </td>
    </tr>
  );
}

// PAGINATION

function Pagination({
  currentPage,
  rowsPerPage,
  totalPages,
  totalItems,
  onPageChange,
  onRowsPerPageChange,
}: {
  currentPage: number;
  rowsPerPage: number;
  totalPages: number;
  totalItems: number;

  onPageChange: (page: number) => void;
  onRowsPerPageChange: (rows: number) => void;
}) {
  const from = (currentPage - 1) * rowsPerPage + 1;

  const to = Math.min(currentPage * rowsPerPage, totalItems);

  return (
    <div className="border-border bg-muted/10 flex flex-col gap-3 border-t px-5 py-4 sm:flex-row sm:items-center sm:justify-between">
      {/* LEFT */}

      <div className="text-muted-foreground flex flex-wrap items-center gap-2 text-xs">
        <span>แสดง</span>

        <select
          value={rowsPerPage}
          onChange={(event) => onRowsPerPageChange(Number(event.target.value))}
          className="border-border bg-background text-foreground h-9 rounded-lg border px-2 font-semibold outline-none transition focus:border-amber-500 focus:ring-2 focus:ring-amber-500/10"
        >
          {ROW_OPTIONS.map((value) => (
            <option key={value} value={value}>
              {value}
            </option>
          ))}
        </select>

        <span>รายการ</span>

        <span className="text-border hidden sm:inline">•</span>

        <span>
          {from.toLocaleString('th-TH')}
          {' - '}
          {to.toLocaleString('th-TH')}
          {' จาก '}
          {totalItems.toLocaleString('th-TH')}
          {' รายการ'}
        </span>
      </div>

      {/* RIGHT */}

      <div className="flex items-center gap-2">
        <button
          type="button"
          disabled={currentPage <= 1}
          onClick={() => onPageChange(Math.max(1, currentPage - 1))}
          title="หน้าก่อนหน้า"
          className="border-border bg-background text-foreground inline-flex h-9 items-center justify-center gap-1.5 rounded-lg border px-3 text-xs font-semibold shadow-sm transition hover:border-amber-500/30 hover:bg-amber-500/5 disabled:cursor-not-allowed disabled:opacity-40"
        >
          <ChevronLeft className="h-3.5 w-3.5" />

          <span className="hidden sm:inline">ก่อนหน้า</span>
        </button>

        <div className="min-w-18 inline-flex h-9 items-center justify-center rounded-lg border border-amber-500/10 bg-amber-500/10 px-3 text-xs font-bold text-amber-700 dark:text-amber-300">
          {currentPage} / {totalPages}
        </div>

        <button
          type="button"
          disabled={currentPage >= totalPages}
          onClick={() => onPageChange(Math.min(totalPages, currentPage + 1))}
          title="หน้าถัดไป"
          className="border-border bg-background text-foreground inline-flex h-9 items-center justify-center gap-1.5 rounded-lg border px-3 text-xs font-semibold shadow-sm transition hover:border-amber-500/30 hover:bg-amber-500/5 disabled:cursor-not-allowed disabled:opacity-40"
        >
          <span className="hidden sm:inline">ถัดไป</span>

          <ChevronRight className="h-3.5 w-3.5" />
        </button>
      </div>
    </div>
  );
}

// FORMAT MONEY

function formatMoney(value: number | string | null | undefined): string {
  const amount = Number(value ?? 0);

  if (!Number.isFinite(amount)) {
    return '0.00';
  }

  return new Intl.NumberFormat('th-TH', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(amount);
}

// FORMAT DATE

function formatThaiDate(value: unknown): string {
  if (!value) {
    return '-';
  }

  const raw = String(value).trim();

  const match = raw.match(/^(\d{4})-(\d{2})-(\d{2})/);

  if (!match) {
    return '-';
  }

  const year = Number(match[1]);
  const month = Number(match[2]);
  const day = Number(match[3]);

  const date = new Date(year, month - 1, day);

  if (Number.isNaN(date.getTime())) {
    return '-';
  }

  return new Intl.DateTimeFormat('th-TH', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  }).format(date);
}
