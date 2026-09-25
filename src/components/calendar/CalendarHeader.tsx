'use client';

import { useMemo } from 'react';
import { CalendarDays, CarFront } from 'lucide-react';

import type { BookingCalendarItem } from '@/types/bookingCalendarType';
import { getCarTypeColor } from '@/utils/carTypeColor';

type CalendarHeaderProps = {
  bookings: BookingCalendarItem[];
};

export default function CalendarHeader({ bookings }: CalendarHeaderProps) {
  const typeSummary = useMemo(() => {
    const summary = new Map<
      number,
      {
        typeCarId: number;
        typeName: string;
        count: number;
      }
    >();

    bookings.forEach((booking) => {
      const typeCarId = Number(booking.typeCarId);

      const current = summary.get(typeCarId);

      if (current) {
        current.count += 1;
        return;
      }

      summary.set(typeCarId, {
        typeCarId,
        typeName: booking.typeName || 'ไม่ระบุประเภท',
        count: 1,
      });
    });

    return Array.from(summary.values()).sort(
      (a, b) => a.typeCarId - b.typeCarId,
    );
  }, [bookings]);

  return (
    <div className="bg-linear-to-r border-b border-gray-100 from-blue-50 via-white to-indigo-50 px-6 py-5 dark:border-gray-800 dark:from-blue-950/20 dark:via-gray-900 dark:to-indigo-950/20">
      <div className="flex flex-col gap-5">
        {/* HEADER */}
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-4">
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-blue-600 text-white shadow-lg shadow-blue-500/20">
              <CalendarDays className="h-6 w-6" />
            </div>

            <div>
              <h1 className="text-lg font-bold text-gray-900 dark:text-white">
                ปฏิทินการใช้รถราชการ
              </h1>

              <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                แสดงรายการจองรถที่ได้รับการอนุมัติแล้ว
              </p>
            </div>
          </div>

          {/* TOTAL */}
          <div className="inline-flex w-fit items-center gap-2 rounded-xl bg-emerald-50 px-4 py-2 text-sm font-semibold text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-300">
            <span className="h-2 w-2 rounded-full bg-emerald-500" />
            ทั้งหมด {bookings.length} รายการ
          </div>
        </div>

        {/* TYPE SUMMARY */}
        {typeSummary.length > 0 && (
          <div className="flex flex-wrap items-center gap-2">
            <span className="mr-1 text-xs font-medium text-gray-400">
              ประเภทรถ
            </span>

            {typeSummary.map((item) => (
              <div
                key={item.typeCarId}
                className={`inline-flex items-center gap-2 rounded-xl border px-3 py-1.5 text-xs font-semibold ${getCarTypeColor(
                  item.typeCarId,
                )}`}
              >
                <CarFront className="h-3.5 w-3.5" />

                <span>{item.typeName}</span>

                <span className="flex h-5 min-w-5 items-center justify-center rounded-full bg-white/70 px-1.5 text-[10px] font-bold dark:bg-black/20">
                  {item.count}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
