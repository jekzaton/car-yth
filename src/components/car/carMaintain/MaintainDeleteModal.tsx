'use client';

import { AlertTriangle, Loader2, Trash2, X } from 'lucide-react';

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

  return (
    <div
      className="z-9999 fixed inset-0 flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget && !isDeleting) {
          onClose();
        }
      }}
    >
      <div className="border-border bg-card w-full max-w-md overflow-hidden rounded-3xl border shadow-2xl">
        {/* HEADER */}

        <div className="border-border relative border-b px-6 pb-5 pt-6">
          <button
            type="button"
            onClick={onClose}
            disabled={isDeleting}
            className="text-muted-foreground hover:bg-muted hover:text-foreground absolute right-4 top-4 inline-flex h-9 w-9 items-center justify-center rounded-xl transition disabled:pointer-events-none disabled:opacity-50"
          >
            <X className="h-5 w-5" />
          </button>

          <div className="flex flex-col items-center text-center">
            <div className="relative mb-4">
              <div className="absolute inset-0 rounded-full bg-rose-500/20 blur-xl" />

              <div className="relative flex h-16 w-16 items-center justify-center rounded-2xl bg-rose-500/10 text-rose-600 ring-1 ring-rose-500/15 dark:text-rose-400">
                <Trash2 className="h-7 w-7" />
              </div>
            </div>

            <h3 className="text-foreground text-xl font-bold">
              ยืนยันการลบข้อมูล
            </h3>

            <p className="text-muted-foreground mt-1.5 text-sm">
              ต้องการลบประวัติการซ่อมบำรุงรายการนี้หรือไม่?
            </p>
          </div>
        </div>

        {/* CONTENT */}

        <div className="p-6">
          <div className="border-border bg-muted/30 overflow-hidden rounded-2xl border">
            {/* CAR */}

            <div className="border-border border-b p-4">
              <p className="text-muted-foreground mb-1 text-xs font-medium">
                รถยนต์
              </p>

              <p className="text-foreground font-bold">
                {[item.carBrand, item.carName].filter(Boolean).join(' ') ||
                  item.carCode}
              </p>

              <div className="text-muted-foreground mt-1 flex flex-wrap items-center gap-2 text-xs">
                {item.licensePlate && <span>ทะเบียน {item.licensePlate}</span>}

                <span>•</span>

                <span>{item.carCode}</span>
              </div>
            </div>

            {/* DETAIL */}

            <div className="divide-border grid grid-cols-2 divide-x">
              <div className="p-4">
                <p className="text-muted-foreground mb-1 text-xs">วันที่ซ่อม</p>

                <p className="text-foreground text-sm font-semibold">
                  {formatThaiDate(item.dateMaintain)}
                </p>
              </div>

              <div className="p-4">
                <p className="text-muted-foreground mb-1 text-xs">ค่าใช้จ่าย</p>

                <p className="text-sm font-bold tabular-nums text-rose-600 dark:text-rose-400">
                  ฿{formatMoney(item.priceMaintain)}
                </p>
              </div>
            </div>

            {/* MAINTAIN DETAIL */}

            {item.detailMaintain && (
              <div className="border-border border-t p-4">
                <p className="text-muted-foreground mb-1 text-xs">รายละเอียด</p>

                <p className="text-foreground line-clamp-2 text-sm font-medium leading-6">
                  {item.detailMaintain}
                </p>
              </div>
            )}
          </div>

          {/* WARNING */}

          <div className="mt-4 flex items-start gap-3 rounded-2xl border border-amber-500/15 bg-amber-500/10 p-3.5">
            <AlertTriangle className="h-4.5 w-4.5 mt-0.5 shrink-0 text-amber-600 dark:text-amber-400" />

            <p className="text-xs leading-5 text-amber-800 dark:text-amber-200">
              เมื่อลบข้อมูลแล้วจะไม่สามารถเรียกคืนรายการนี้ได้
              กรุณาตรวจสอบข้อมูลก่อนยืนยัน
            </p>
          </div>
        </div>

        {/* FOOTER */}

        <div className="border-border bg-muted/20 flex gap-3 border-t px-6 py-4">
          <button
            type="button"
            onClick={onClose}
            disabled={isDeleting}
            className="border-border bg-background text-foreground hover:bg-muted h-11 flex-1 rounded-xl border px-4 text-sm font-semibold transition disabled:cursor-not-allowed disabled:opacity-50"
          >
            ยกเลิก
          </button>

          <button
            type="button"
            onClick={onConfirm}
            disabled={isDeleting}
            className="bg-linear-to-r inline-flex h-11 flex-1 items-center justify-center gap-2 rounded-xl from-rose-500 to-red-600 px-4 text-sm font-bold text-white shadow-lg shadow-rose-500/20 transition hover:-translate-y-0.5 hover:shadow-xl hover:shadow-rose-500/25 disabled:cursor-not-allowed disabled:opacity-60 disabled:hover:translate-y-0"
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
