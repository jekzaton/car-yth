'use client';

import {
  AlertTriangle,
  CarFront,
  Fuel,
  LoaderCircle,
  Trash2,
  X,
} from 'lucide-react';

import { CarOilItem } from '@/types/carOilType';

type DeleteCarOilModalProps = {
  isOpen: boolean;
  item: CarOilItem | null;
  isDeleting: boolean;
  onClose: () => void;
  onConfirm: () => void;
};

export default function DeleteCarOilModal({
  isOpen,
  item,
  isDeleting,
  onClose,
  onConfirm,
}: DeleteCarOilModalProps) {
  if (!isOpen || !item) return null;

  const carTitle =
    [item.carBrand, item.carBrandSub].filter(Boolean).join(' ') || item.carCode;

  return (
    <div
      className="z-999999 fixed inset-0 flex items-center justify-center bg-black/45 p-4 backdrop-blur-[2px]"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget && !isDeleting) {
          onClose();
        }
      }}
    >
      <div className="relative w-full max-w-md overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-2xl dark:border-gray-800 dark:bg-gray-900">
        {/* HEADER */}
        <div className="bg-linear-to-r relative border-b border-gray-100 from-orange-50/80 via-white to-red-50/60 px-5 py-5 dark:border-gray-800 dark:from-orange-500/10 dark:via-gray-900 dark:to-red-500/10">
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
              <div className="absolute inset-0 rounded-full bg-red-500/20 blur-xl" />

              <div className="bg-linear-to-br relative flex h-14 w-14 items-center justify-center rounded-2xl from-orange-500 to-red-500 text-white shadow-lg shadow-red-500/20">
                <Trash2 className="h-6 w-6" />
              </div>
            </div>

            <h2 className="text-lg font-bold text-gray-900 dark:text-white">
              ยืนยันการลบข้อมูล
            </h2>

            <p className="mt-1 max-w-sm text-xs leading-5 text-gray-500 dark:text-gray-400">
              ตรวจสอบข้อมูลการเติมน้ำมันก่อนยืนยันการลบ
            </p>
          </div>
        </div>

        {/* CONTENT */}
        <div className="p-5">
          {/* CAR */}
          <div className="dark:bg-white/3 overflow-hidden rounded-2xl border border-gray-200 bg-gray-50/60 dark:border-gray-800">
            <div className="p-4">
              <div className="flex items-start gap-3">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-orange-50 text-orange-600 dark:bg-orange-500/10 dark:text-orange-300">
                  <CarFront className="h-5 w-5" />
                </div>

                <div className="min-w-0 flex-1">
                  <p className="text-[10px] font-semibold text-gray-400">
                    รถยนต์
                  </p>

                  <p
                    className="mt-1 truncate text-sm font-bold text-gray-900 dark:text-white"
                    title={carTitle}
                  >
                    {carTitle}
                  </p>

                  <div className="mt-2 flex flex-wrap items-center gap-2">
                    {item.carCode && (
                      <span className="rounded-lg bg-orange-50 px-2.5 py-1 text-[11px] font-bold text-orange-700 dark:bg-orange-500/10 dark:text-orange-300">
                        {item.carCode}
                      </span>
                    )}

                    {item.licensePlate && (
                      <span className="rounded-lg bg-white px-2.5 py-1 text-[11px] font-semibold text-gray-700 shadow-sm dark:bg-white/10 dark:text-gray-300">
                        ทะเบียน {item.licensePlate}
                      </span>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* OIL */}
            <div className="border-t border-gray-100 px-4 py-3 dark:border-gray-800">
              <div className="flex items-center gap-2">
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-amber-50 text-amber-600 dark:bg-amber-500/10 dark:text-amber-300">
                  <Fuel className="h-4 w-4" />
                </div>

                <div className="min-w-0 flex-1">
                  <p className="text-[10px] font-semibold text-gray-400">
                    น้ำมัน
                  </p>

                  <p className="mt-0.5 truncate text-sm font-semibold text-gray-800 dark:text-gray-200">
                    {item.oilName || '-'}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* WARNING */}
          <div className="mt-4 flex items-start gap-3 rounded-xl border border-red-200 bg-red-50 px-3.5 py-3 dark:border-red-500/20 dark:bg-red-500/10">
            <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0 text-red-500" />

            <p className="text-xs leading-5 text-red-700 dark:text-red-300">
              เมื่อลบข้อมูลแล้วจะไม่สามารถกู้คืนรายการนี้ได้
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
            className="bg-linear-to-r inline-flex h-10 flex-1 items-center justify-center gap-2 rounded-xl from-orange-500 to-red-500 px-4 text-sm font-bold text-white shadow-md shadow-red-500/20 transition hover:-translate-y-0.5 hover:shadow-lg disabled:cursor-not-allowed disabled:opacity-60 disabled:hover:translate-y-0"
          >
            {isDeleting ? (
              <>
                <LoaderCircle className="h-4 w-4 animate-spin" />
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
