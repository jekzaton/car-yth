'use client';

import { useRouter } from 'next/navigation';
import {
  BadgeCheck,
  Building2,
  CalendarDays,
  CarFront,
  Eye,
  Loader2,
  MapPin,
  Phone,
  SearchX,
  UserRound,
  UsersRound,
} from 'lucide-react';

import CarImageCell from './CarImageCell';
import { CarBookingItem } from '@/types/bookingCarType';
import DriverSelect from './DriverSelect';

import { BookingStatus } from '@/types/carBookingType';
import BookingStatusSelect from './BookingStatusSelect';
import { formatThaiDate, formatTime, normalizeDate } from '@/utils/formatters';
import { formatPhone } from '@/utils/formatPhone';

type CarBookingTableProps = {
  data: CarBookingItem[];
  isLoading: boolean;
  currentPage: number;
  rowsPerPage: number;

  onDriverChange: (bookingId: number, userCode: string) => Promise<void>;

  onStatusChange: (bookingId: number, status: BookingStatus) => Promise<void>;
};

type BookingRowProps = {
  item: CarBookingItem;
  index: number;

  onDetail: () => void;

  onDriverChange: (userCode: string) => Promise<void>;

  onStatusChange: (status: BookingStatus) => Promise<void>;
};

export default function CarBookingTable({
  data,
  isLoading,
  currentPage,
  rowsPerPage,
  onDriverChange,
  onStatusChange,
}: CarBookingTableProps) {
  const router = useRouter();

  return (
    <div className="overflow-hidden rounded-2xl border border-gray-100 bg-white shadow-sm dark:border-white/10 dark:bg-white/5">
      <div className="overflow-x-auto">
        <table className="min-w-295 w-full">
          {/* ================= HEADER ================= */}
          <thead>
            <tr className="border-b border-gray-100 bg-gray-50/80 text-left dark:border-white/10 dark:bg-white/5">
              <th className="w-16 px-5 py-4 text-xs font-semibold text-gray-500">
                #
              </th>

              <th className="min-w-64 px-5 py-4 text-xs font-semibold text-gray-500">
                รถ
              </th>

              <th className="min-w-80 px-5 py-4 text-xs font-semibold text-gray-500">
                ผู้จอง
              </th>

              <th className="min-w-52 px-5 py-4 text-xs font-semibold text-gray-500">
                วันเวลาใช้งาน
              </th>

              <th className="min-w-80 px-5 py-4 text-xs font-semibold text-gray-500">
                รายละเอียด
              </th>
              <th className="min-w-60 px-5 py-4 text-xs font-semibold text-gray-500">
                คนขับรถ
              </th>

              <th className="w-36 px-5 py-4 text-xs font-semibold text-gray-500">
                สถานะ
              </th>

              <th className="w-36 px-5 py-4 text-right text-xs font-semibold text-gray-500">
                จัดการ
              </th>
            </tr>
          </thead>

          {/* ================= BODY ================= */}
          <tbody className="divide-y divide-gray-100 dark:divide-white/5">
            {isLoading ? (
              <LoadingRow />
            ) : data.length === 0 ? (
              <EmptyRow />
            ) : (
              data.map((item, index) => (
                <BookingRow
                  key={item.bookingId}
                  item={item}
                  index={(currentPage - 1) * rowsPerPage + index + 1}
                  onDetail={() =>
                    router.push(`/booking-cars/${item.bookingId}`)
                  }
                  onDriverChange={(userCode) =>
                    onDriverChange(item.bookingId, userCode)
                  }
                  onStatusChange={(status) =>
                    onStatusChange(item.bookingId, status)
                  }
                />
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

/* =====================================================
   BOOKING ROW
===================================================== */

function BookingRow({
  item,
  index,
  onDetail,
  onDriverChange,
  onStatusChange,
}: BookingRowProps) {
  const mainImage = getMainCarImage(item.carImage);

  const isMultipleDays =
    normalizeDate(item.endDate) !== normalizeDate(item.startDate);

  return (
    <tr className="group transition-colors hover:bg-blue-50/40 dark:hover:bg-white/5">
      {/* INDEX */}
      <td className="px-5 py-4">
        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gray-100 text-xs font-semibold text-gray-600 dark:bg-white/10 dark:text-gray-300">
          {index}
        </div>
      </td>

      {/* ================= CAR ================= */}
      <td className="px-5 py-4">
        <div className="min-w-75 group flex items-center gap-3.5">
          {/* ================= CAR IMAGE ================= */}
          <div className="relative shrink-0">
            <div className="overflow-hidden rounded-2xl ring-1 ring-black/5 transition-all duration-200 group-hover:ring-orange-500/20 dark:ring-white/10">
              <CarImageCell src={mainImage} alt={item.carName || 'car'} />
            </div>

            {/* STATUS DOT */}
            <span className="absolute -bottom-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full border-2 border-white bg-emerald-500 dark:border-gray-900">
              <span className="h-1.5 w-1.5 rounded-full bg-white" />
            </span>
          </div>

          {/* ================= INFO ================= */}
          <div className="min-w-0 flex-1">
            {/* NAME + CODE */}
            <div className="flex flex-wrap items-center gap-2">
              <p className="text-foreground truncate text-sm font-bold">
                {item.carName || '-'}
              </p>

              <span className="inline-flex shrink-0 items-center rounded-lg border border-orange-500/15 bg-orange-500/10 px-2 py-0.5 text-[10px] font-bold text-orange-700 dark:text-orange-300">
                {item.carCode || '-'}
              </span>
            </div>

            {/* ================= BRAND ================= */}
            <div className="mt-1.5 flex flex-wrap items-center gap-x-2 gap-y-1 text-xs">
              <span className="text-muted-foreground font-medium">
                {item.carBrand || 'ไม่ระบุยี่ห้อ'}
              </span>

              <span className="bg-border h-1 w-1 rounded-full" />

              {/* LICENSE PLATE */}
              <div className="flex items-center gap-1.5">
                <span className="text-muted-foreground text-[10px]">
                  ทะเบียน
                </span>

                <span className="bg-muted text-foreground rounded-md px-2 py-0.5 text-[11px] font-bold tracking-wide">
                  {item.licensePlate || '-'}
                </span>
              </div>
            </div>

            {/* ================= CAR TYPE ================= */}
            <div className="mt-2">
              <span className="inline-flex items-center gap-1.5 rounded-lg border border-amber-500/15 bg-amber-500/5 px-2 py-1 text-[10px] font-semibold text-amber-700 dark:text-amber-300">
                <CarFront className="h-3 w-3" strokeWidth={2.2} />

                {item.typeName || 'ไม่ระบุประเภท'}
              </span>
            </div>
          </div>
        </div>
      </td>

      {/* ================= BOOKER ================= */}
      <td className="min-w-72 px-5 py-4">
        <div className="flex items-start gap-3">
          <div className="bg-linear-to-br flex h-10 w-10 shrink-0 items-center justify-center rounded-xl from-indigo-50 to-blue-50 text-indigo-600 ring-1 ring-indigo-100 dark:from-indigo-500/15 dark:to-blue-500/10 dark:text-indigo-300 dark:ring-indigo-500/20">
            <UserRound className="h-5 w-5" />
          </div>

          <div className="min-w-0 flex-1">
            <p className="whitespace-nowrap text-sm font-semibold text-gray-900 dark:text-white">
              {item.bookingName || '-'}
            </p>

            <div className="mt-1.5">
              <span className="inline-flex items-center gap-1 rounded-md bg-indigo-50 px-2 py-0.5 text-[10px] font-semibold text-indigo-600 dark:bg-indigo-500/10 dark:text-indigo-300">
                <BadgeCheck className="h-3 w-3" />
                รหัสผู้จอง {item.userCode || '-'}
              </span>
            </div>

            <div className="mt-2 space-y-1.5">
              <div className="flex items-center gap-1.5 whitespace-nowrap text-xs text-gray-500 dark:text-gray-400">
                <Building2 className="h-3.5 w-3.5 shrink-0 text-gray-400" />

                <span className="text-gray-400">ภายใน</span>

                <span className="font-medium text-gray-700 dark:text-gray-300">
                  {item.telDep || '-'}
                </span>
              </div>

              <div className="flex items-center gap-1.5 whitespace-nowrap text-xs text-gray-500 dark:text-gray-400">
                <Phone className="h-3.5 w-3.5 shrink-0 text-emerald-500" />

                <span className="text-gray-400">มือถือ</span>

                <span className="font-medium text-gray-700 dark:text-gray-300">
                  {formatPhone(item.phone)}
                </span>
              </div>
            </div>
          </div>
        </div>
      </td>

      {/* ================= DATE / TIME ================= */}
      <td className="px-5 py-4">
        <div className="rounded-xl bg-gray-50 px-3 py-2.5 dark:bg-white/5">
          <div className="flex items-center gap-2 text-sm font-medium text-gray-800 dark:text-gray-200">
            <CalendarDays className="h-4 w-4 shrink-0 text-blue-500" />

            {formatThaiDate(item.startDate)}
          </div>

          <p className="mt-1 pl-6 text-xs text-gray-500">
            {formatTime(item.startTime)}
            {' - '}
            {formatTime(item.endTime)} น.
          </p>

          {isMultipleDays && (
            <p className="mt-1 pl-6 text-[11px] font-medium text-orange-600">
              ถึง {formatThaiDate(item.endDate)}
            </p>
          )}
        </div>
      </td>

      {/* ================= DETAIL ================= */}
      <td className="px-5 py-4">
        <div className="max-w-xs">
          <p className="line-clamp-2 text-sm font-semibold text-gray-800 dark:text-gray-200">
            {item.subject || '-'}
          </p>

          <div className="mt-2 flex items-start gap-1.5 text-xs text-gray-500">
            <MapPin className="mt-0.5 h-3.5 w-3.5 shrink-0 text-red-400" />

            <span className="line-clamp-2">{item.destination || '-'}</span>
          </div>

          <div className="mt-2 inline-flex items-center gap-1.5 rounded-lg bg-gray-100 px-2 py-1 text-[11px] font-medium text-gray-600 dark:bg-white/5 dark:text-gray-300">
            <UsersRound className="h-3.5 w-3.5" />
            ผู้โดยสาร {item.countPeople || 1} คน
          </div>
        </div>
      </td>

      {/* ================= คนขับรถ ================= */}
      <td className="px-5 py-4">
        <DriverSelect
          value={item.cUCode}
          bookingId={item.bookingId}
          startDate={String(item.startDate)}
          startTime={String(item.startTime)}
          endDate={String(item.endDate)}
          endTime={String(item.endTime)}
          onChange={onDriverChange}
        />
      </td>
      {/* ================= STATUS ================= */}
      <td className="px-5 py-4">
        <BookingStatusSelect value={item.status} onChange={onStatusChange} />
      </td>

      {/* ================= ACTION ================= */}
      <td className="px-5 py-4">
        <div className="flex justify-end">
          <button
            type="button"
            onClick={onDetail}
            className="inline-flex h-9 items-center gap-1.5 rounded-xl border border-blue-100 bg-blue-50 px-3 text-xs font-semibold text-blue-600 transition hover:border-blue-200 hover:bg-blue-100 dark:border-blue-500/20 dark:bg-blue-500/10 dark:text-blue-300"
          >
            <Eye className="h-4 w-4" />
            รายละเอียด
          </button>
        </div>
      </td>
    </tr>
  );
}

/* =====================================================
   LOADING
===================================================== */

function LoadingRow() {
  return (
    <tr>
      <td colSpan={8} className="px-6 py-20">
        <div className="flex flex-col items-center justify-center">
          <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-blue-50 dark:bg-blue-500/10">
            <Loader2 className="h-7 w-7 animate-spin text-blue-600" />
          </div>

          <p className="mt-4 text-sm font-medium text-gray-600 dark:text-gray-300">
            กำลังโหลดรายการจองรถ...
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
      <td colSpan={8} className="px-6 py-20">
        <div className="flex flex-col items-center justify-center text-center">
          <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-gray-100 text-gray-400 dark:bg-white/5">
            <SearchX className="h-7 w-7" />
          </div>

          <p className="mt-4 font-semibold text-gray-700 dark:text-gray-300">
            ไม่พบรายการจองรถ
          </p>

          <p className="mt-1 text-sm text-gray-400">
            ลองเปลี่ยนคำค้นหาหรือสถานะ
          </p>
        </div>
      </td>
    </tr>
  );
}

/* =====================================================
   HELPERS
===================================================== */

function getMainCarImage(carImage: unknown): string | null {
  if (!carImage) return null;

  if (Array.isArray(carImage)) {
    return typeof carImage[0] === 'string' ? carImage[0] : null;
  }

  if (typeof carImage !== 'string') {
    return null;
  }

  const value = carImage.trim();

  if (!value) return null;

  try {
    const parsed: unknown = JSON.parse(value);

    if (parsed && typeof parsed === 'object' && !Array.isArray(parsed)) {
      const imageData = parsed as {
        main?: unknown;
        images?: unknown;
      };

      if (typeof imageData.main === 'string' && imageData.main.trim()) {
        return imageData.main;
      }

      if (
        Array.isArray(imageData.images) &&
        typeof imageData.images[0] === 'string'
      ) {
        return imageData.images[0];
      }
    }

    if (Array.isArray(parsed) && typeof parsed[0] === 'string') {
      return parsed[0];
    }
  } catch {
    if (
      value.startsWith('/') ||
      value.startsWith('http://') ||
      value.startsWith('https://')
    ) {
      return value;
    }
  }

  return null;
}
