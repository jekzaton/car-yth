'use client';

import {
  AlertTriangle,
  Loader2,
  Trash2,
  X,
  CarFront,
  CalendarDays,
  Wallet,
  Wrench,
} from 'lucide-react';

import type { CarMaintainItem } from '@/types/carMaintainType';
import { formatThaiDate } from '@/utils/formatters';

type MaintainDeleteModalProps = {
  isOpen: boolean;
  item: CarMaintainItem | null;
  isDeleting: boolean;
  onClose: () => void;
  onConfirm: () => void;
};

function formatMoney(value: number): string {
  return new Intl.NumberFormat('th-TH', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(Number(value) || 0);
}

export default function MaintainDeleteModal({
  isOpen,
  item,
  isDeleting,
  onClose,
  onConfirm,
}: MaintainDeleteModalProps) {
  if (!isOpen || !item) {
    return null;
  }

  const carName =
    [item.carBrand, item.carBrandSub].filter(Boolean).join(' ') || item.carCode;

  return (
    <div
      className="z-9999 fixed inset-0 flex items-center justify-center bg-black/45 p-4 backdrop-blur-[2px]"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget && !isDeleting) {
          onClose();
        }
      }}
    >
      <div className="w-full max-w-md overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-2xl dark:border-gray-800 dark:bg-gray-900">
        {/* HEADER */}
        <div className="bg-linear-to-r relative border-b border-gray-100 from-rose-50/80 via-white to-red-50/50 px-5 py-5 dark:border-gray-800 dark:from-rose-500/10 dark:via-gray-900 dark:to-red-500/5">
          <button
            type="button"
            onClick={onClose}
            disabled={isDeleting}
            className="absolute right-4 top-4 flex h-9 w-9 items-center justify-center rounded-xl text-gray-400 transition hover:bg-white hover:text-gray-700 disabled:pointer-events-none disabled:opacity-50 dark:hover:bg-white/10 dark:hover:text-white"
          >
            <X className="h-5 w-5" />
          </button>

          <div className="flex flex-col items-center text-center">
            <div className="relative mb-3">
              <div className="absolute inset-0 rounded-full bg-rose-500/20 blur-xl" />

              <div className="relative flex h-14 w-14 items-center justify-center rounded-2xl bg-rose-500 text-white shadow-lg shadow-rose-500/20">
                <Trash2 className="h-6 w-6" />
              </div>
            </div>

            <h3 className="text-lg font-bold text-gray-900 dark:text-white">
              ยืนยันการลบข้อมูล
            </h3>

            <p className="mt-1 max-w-sm text-xs leading-5 text-gray-500 dark:text-gray-400">
              ตรวจสอบข้อมูลรายการซ่อมบำรุงก่อนยืนยันการลบ
            </p>
          </div>
        </div>

        {/* CONTENT */}
        <div className="p-5">
          <div className="dark:bg-white/3 overflow-hidden rounded-2xl border border-gray-200 bg-gray-50/60 dark:border-gray-800">
            {/* CAR */}
            <div className="border-b border-gray-100 p-4 dark:border-gray-800">
              <div className="flex items-start gap-3">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-amber-50 text-amber-600 dark:bg-amber-500/10 dark:text-amber-300">
                  <CarFront className="h-5 w-5" />
                </div>

                <div className="min-w-0 flex-1">
                  <p className="text-[10px] font-semibold text-gray-400">
                    รถยนต์
                  </p>

                  <p className="mt-1 truncate text-sm font-bold text-gray-900 dark:text-white">
                    {carName}
                  </p>

                  <div className="mt-2 flex flex-wrap items-center gap-2">
                    {item.licensePlate && (
                      <span className="rounded-lg bg-white px-2.5 py-1 text-[11px] font-semibold text-gray-700 shadow-sm dark:bg-white/10 dark:text-gray-300">
                        ทะเบียน {item.licensePlate}
                      </span>
                    )}

                    {item.carCode && (
                      <span className="rounded-lg bg-amber-50 px-2.5 py-1 text-[11px] font-bold text-amber-700 dark:bg-amber-500/10 dark:text-amber-300">
                        {item.carCode}
                      </span>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* DATE + PRICE */}
            <div className="grid grid-cols-2 divide-x divide-gray-100 dark:divide-gray-800">
              <div className="p-4">
                <div className="flex items-center gap-2">
                  <CalendarDays className="h-4 w-4 text-blue-500" />

                  <p className="text-[10px] font-semibold text-gray-400">
                    วันที่ซ่อม
                  </p>
                </div>

                <p className="mt-2 text-sm font-semibold text-gray-800 dark:text-gray-200">
                  {formatThaiDate(item.dateMaintain)}
                </p>
              </div>

              <div className="p-4">
                <div className="flex items-center gap-2">
                  <Wallet className="h-4 w-4 text-emerald-500" />

                  <p className="text-[10px] font-semibold text-gray-400">
                    ค่าใช้จ่าย
                  </p>
                </div>

                <p className="mt-2 text-sm font-bold tabular-nums text-emerald-600 dark:text-emerald-400">
                  ฿{formatMoney(item.priceMaintain)}
                </p>
              </div>
            </div>

            {/* DETAIL */}
            {item.detailMaintain && (
              <div className="border-t border-gray-100 p-4 dark:border-gray-800">
                <div className="flex items-center gap-2">
                  <Wrench className="h-4 w-4 text-amber-500" />

                  <p className="text-[10px] font-semibold text-gray-400">
                    รายละเอียด
                  </p>
                </div>

                <p className="mt-2 line-clamp-3 text-sm font-medium leading-6 text-gray-700 dark:text-gray-300">
                  {item.detailMaintain}
                </p>
              </div>
            )}
          </div>

          {/* WARNING */}
          <div className="mt-4 flex items-start gap-3 rounded-xl border border-amber-200 bg-amber-50 px-3.5 py-3 dark:border-amber-500/20 dark:bg-amber-500/10">
            <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0 text-amber-600 dark:text-amber-400" />

            <p className="text-xs leading-5 text-amber-800 dark:text-amber-200">
              เมื่อลบข้อมูลแล้วจะไม่สามารถเรียกคืนรายการนี้ได้
              กรุณาตรวจสอบข้อมูลก่อนยืนยัน
            </p>
          </div>
        </div>

        {/* FOOTER */}
        <div className="dark:bg-white/2 flex gap-2 border-t border-gray-100 bg-gray-50/50 px-5 py-4 dark:border-gray-800">
          <button
            type="button"
            onClick={onClose}
            disabled={isDeleting}
            className="h-10 flex-1 rounded-xl border border-gray-200 bg-white px-4 text-sm font-semibold text-gray-600 transition hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-300"
          >
            ยกเลิก
          </button>

          <button
            type="button"
            onClick={onConfirm}
            disabled={isDeleting}
            className="bg-linear-to-r inline-flex h-10 flex-1 items-center justify-center gap-2 rounded-xl from-rose-500 to-red-600 px-4 text-sm font-bold text-white shadow-md shadow-rose-500/20 transition hover:-translate-y-0.5 hover:shadow-lg disabled:cursor-not-allowed disabled:opacity-60 disabled:hover:translate-y-0"
          >
            {isDeleting ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                กำลังลบ...
              </>
            ) : (
              <>
                <Trash2 className="h-4 w-4" />
                ยืนยันการลบ
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
