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

  const carTitle = [item.carBrand, item.carName].filter(Boolean).join(' ');

  return (
    <div
      className="z-999999 fixed inset-0 flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget && !isDeleting) {
          onClose();
        }
      }}
    >
      <div className="border-border bg-card text-card-foreground relative w-full max-w-md overflow-hidden rounded-3xl border shadow-2xl">
        {/* GLOW */}
        <div className="pointer-events-none absolute -right-16 -top-16 h-44 w-44 rounded-full bg-red-500/10 blur-3xl" />

        <div className="relative p-5 sm:p-6">
          {/* CLOSE */}
          <button
            type="button"
            onClick={onClose}
            disabled={isDeleting}
            className="border-border bg-background text-muted-foreground hover:bg-accent hover:text-foreground absolute right-4 top-4 flex h-9 w-9 items-center justify-center rounded-xl border transition disabled:cursor-not-allowed disabled:opacity-50"
          >
            <X className="h-4 w-4" />
          </button>

          {/* ICON */}
          <div className="flex justify-center">
            <div className="relative">
              <div className="absolute inset-0 rounded-full bg-red-500/20 blur-xl" />

              <div className="h-18 w-18 relative flex items-center justify-center rounded-full bg-red-500/10 ring-8 ring-red-500/5">
                <div
                  className="flex h-12 w-12 items-center justify-center rounded-2xl shadow-lg"
                  style={{
                    background:
                      'linear-gradient(135deg, rgb(249 115 22), rgb(239 68 68))',
                    boxShadow: '0 8px 20px rgba(239,68,68,0.22)',
                  }}
                >
                  <Trash2 size={23} strokeWidth={2.3} stroke="#ffffff" />
                </div>
              </div>
            </div>
          </div>

          {/* TITLE */}
          <div className="mt-6 text-center">
            <h2 className="text-foreground text-lg font-bold">
              ยืนยันการลบข้อมูล?
            </h2>

            <p className="text-muted-foreground mx-auto mt-2 max-w-sm text-sm leading-6">
              คุณต้องการลบข้อมูลการเติมน้ำมันรายการนี้ใช่หรือไม่?
            </p>
          </div>

          {/* CAR INFO */}
          <div className="mt-5 overflow-hidden rounded-2xl border border-orange-500/15 bg-orange-500/5">
            <div className="flex items-start gap-3 p-4">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-orange-500/10 text-orange-500">
                <CarFront className="h-5 w-5" />
              </div>

              <div className="min-w-0 flex-1">
                <p className="text-muted-foreground text-[11px] font-medium">
                  รถยนต์
                </p>

                <p className="text-foreground mt-0.5 truncate text-sm font-bold">
                  {carTitle || item.carCode}
                </p>

                <div className="text-muted-foreground mt-1.5 flex flex-wrap items-center gap-x-3 gap-y-1 text-[11px]">
                  <span>รหัส {item.carCode}</span>

                  {item.licensePlate && (
                    <span>ทะเบียน {item.licensePlate}</span>
                  )}
                </div>
              </div>
            </div>

            {/* OIL */}
            <div className="border-t border-orange-500/10 px-4 py-3">
              <div className="flex items-center gap-2 text-xs">
                <Fuel className="h-4 w-4 text-orange-500" />

                <span className="text-muted-foreground">น้ำมัน</span>

                <span className="text-foreground ml-auto font-semibold">
                  {item.oilName || '-'}
                </span>
              </div>
            </div>
          </div>

          {/* WARNING */}
          <div className="mt-4 flex items-start gap-3 rounded-xl border border-red-500/15 bg-red-500/5 p-3">
            <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0 text-red-500" />

            <p className="text-[11px] leading-5 text-red-600 dark:text-red-400">
              เมื่อลบข้อมูลแล้วจะไม่สามารถกู้คืนรายการนี้ได้
              กรุณาตรวจสอบข้อมูลก่อนยืนยัน
            </p>
          </div>

          {/* BUTTONS */}
          <div className="mt-6 grid grid-cols-2 gap-3">
            <button
              type="button"
              onClick={onClose}
              disabled={isDeleting}
              className="border-border bg-background text-foreground hover:bg-accent inline-flex h-11 items-center justify-center rounded-xl border px-4 text-sm font-semibold shadow-sm transition disabled:cursor-not-allowed disabled:opacity-50"
            >
              ยกเลิก
            </button>

            <button
              type="button"
              onClick={onConfirm}
              disabled={isDeleting}
              className="inline-flex h-11 items-center justify-center gap-2 rounded-xl px-4 text-sm font-semibold text-white shadow-md transition-all hover:-translate-y-0.5 hover:shadow-lg disabled:cursor-not-allowed disabled:opacity-60 disabled:hover:translate-y-0"
              style={{
                background:
                  'linear-gradient(90deg, rgb(249 115 22), rgb(239 68 68))',
                boxShadow: '0 8px 20px rgba(239,68,68,0.18)',
              }}
            >
              {isDeleting ? (
                <>
                  <LoaderCircle
                    size={17}
                    stroke="#ffffff"
                    className="animate-spin"
                  />

                  <span className="text-white">กำลังลบ...</span>
                </>
              ) : (
                <>
                  <Trash2 size={17} strokeWidth={2.3} stroke="#ffffff" />

                  <span className="text-white">ยืนยันการลบ</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
