'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

import {
  ArrowLeft,
  CalendarDays,
  CarFront,
  Clock3,
  Loader2,
  MapPin,
  Phone,
  UserRound,
  UsersRound,
} from 'lucide-react';

import CarImageCell from './CarImageCell';

import { formatPhone, formatThaiDate, formatTime } from '@/utils/formatters';

import type { CarBookingItem } from '@/types/bookingCarType';
import api from '@/lib/axios';

type BookingDetailProps = {
  bookingId: number;
};

type BookingDetailItem = CarBookingItem & {
  driverName?: string | null;
  driverPhone?: string | null;
  listPeople?: string | null;
};

export default function BookingDetail({ bookingId }: BookingDetailProps) {
  const router = useRouter();

  const [booking, setBooking] = useState<BookingDetailItem | null>(null);

  const [isLoading, setIsLoading] = useState(true);

  const [error, setError] = useState('');

  useEffect(() => {
    async function fetchBooking() {
      try {
        setIsLoading(true);
        setError('');

        const response = await api.get(`/api/car-bookings/${bookingId}`);

        setBooking(response.data?.data ?? null);
        // console.log('response.data?.data', response.data?.data);
      } catch (error) {
        console.error('โหลดรายละเอียดไม่สำเร็จ:', error);

        setError('ไม่สามารถโหลดรายละเอียดการจองได้');
      } finally {
        setIsLoading(false);
      }
    }

    if (bookingId) {
      fetchBooking();
    }
  }, [bookingId]);

  if (isLoading) {
    return (
      <div className="min-h-100 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="mx-auto h-8 w-8 animate-spin text-blue-600" />

          <p className="mt-3 text-sm text-gray-500">กำลังโหลดรายละเอียด...</p>
        </div>
      </div>
    );
  }

  if (error || !booking) {
    return (
      <div className="rounded-2xl border border-red-100 bg-red-50 p-8 text-center">
        <p className="font-medium text-red-600">
          {error || 'ไม่พบรายการจองรถ'}
        </p>

        <button
          type="button"
          onClick={() => router.back()}
          className="mt-4 rounded-xl bg-white px-4 py-2 text-sm font-medium text-gray-700 shadow-sm"
        >
          กลับ
        </button>
      </div>
    );
  }

  return (
    <div className="mx-auto w-full max-w-6xl space-y-5 pt-10">
      {/* =====================================================
        HEADER
    ===================================================== */}
      <div className="overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm dark:border-gray-800 dark:bg-gray-900">
        <div className="bg-linear-to-r from-blue-50/80 via-white to-indigo-50/60 px-4 py-4 sm:px-6 dark:from-blue-500/10 dark:via-gray-900 dark:to-indigo-500/10">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={() => router.back()}
                className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-gray-200 bg-white text-gray-500 shadow-sm transition hover:border-blue-300 hover:bg-blue-50 hover:text-blue-600 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-300"
              >
                <ArrowLeft className="h-5 w-5" />
              </button>

              <div>
                <div className="flex flex-wrap items-center gap-2">
                  <h1 className="text-lg font-bold text-gray-900 sm:text-xl dark:text-white">
                    รายละเอียดการจองรถ
                  </h1>

                  <span className="rounded-lg bg-gray-100 px-2.5 py-1 text-xs font-semibold text-gray-500 dark:bg-white/10 dark:text-gray-300">
                    #{booking.bookingId}
                  </span>
                </div>

                <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                  ตรวจสอบรายละเอียดรถ การเดินทาง ผู้จอง และพนักงานขับรถ
                </p>
              </div>
            </div>

            <StatusBadge status={booking.status} />
          </div>
        </div>
      </div>

      {/* =====================================================
        CAR HERO
    ===================================================== */}
      <section className="overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm dark:border-gray-800 dark:bg-gray-900">
        <div className="border-b border-gray-100 px-4 py-3 dark:border-gray-800">
          <div className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-50 text-blue-600 dark:bg-blue-500/10 dark:text-blue-300">
              <CarFront className="h-4 w-4" />
            </div>

            <h2 className="text-sm font-bold text-gray-900 dark:text-white">
              รถที่ใช้ในการเดินทาง
            </h2>
          </div>
        </div>

        <div className="p-4 sm:p-5">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
            <div className="shrink-0">
              <CarImageCell
                src={getMainCarImage(booking.carImage) || ''}
                width={110}
                height={82}
                priority
                alt={
                  [booking.carBrand, booking.carBrandSub]
                    .filter(Boolean)
                    .join(' ') || 'รถยนต์'
                }
              />
            </div>

            <div className="min-w-0 flex-1">
              <div className="flex flex-wrap items-center gap-2">
                <h2 className="truncate text-lg font-bold text-gray-900 dark:text-white">
                  {[booking.carBrand, booking.carBrandSub]
                    .filter(Boolean)
                    .join(' ') || '-'}
                </h2>

                {booking.carCode && (
                  <span className="rounded-lg bg-blue-50 px-2.5 py-1 text-xs font-bold text-blue-600 dark:bg-blue-500/10 dark:text-blue-300">
                    {booking.carCode}
                  </span>
                )}
              </div>

              <div className="mt-3 flex flex-wrap gap-2">
                <span className="inline-flex items-center gap-1.5 rounded-lg bg-gray-100 px-3 py-1.5 text-xs font-semibold text-gray-700 dark:bg-white/10 dark:text-gray-300">
                  <CarFront className="h-3.5 w-3.5" />
                  ทะเบียน {booking.licensePlate || '-'}
                </span>

                <span className="inline-flex rounded-lg bg-indigo-50 px-3 py-1.5 text-xs font-semibold text-indigo-600 dark:bg-indigo-500/10 dark:text-indigo-300">
                  ประเภท {booking.typeName || '-'}
                </span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* =====================================================
        MAIN GRID
    ===================================================== */}
      <div className="grid gap-5 xl:grid-cols-[1.6fr_0.9fr]">
        {/* LEFT */}
        <div className="space-y-5">
          {/* DATE / TIME */}
          <Section
            title="วันและเวลาใช้งาน"
            icon={<CalendarDays className="h-4 w-4" />}
          >
            <div className="grid gap-3 sm:grid-cols-2">
              <DateCard
                title="เริ่มใช้งาน"
                date={booking.startDate}
                time={booking.startTime}
                variant="start"
              />

              <DateCard
                title="สิ้นสุด"
                date={booking.endDate}
                time={booking.endTime}
                variant="end"
              />
            </div>
          </Section>

          {/* TRAVEL */}
          <Section
            title="รายละเอียดการเดินทาง"
            icon={<MapPin className="h-4 w-4" />}
          >
            <div className="grid gap-3 sm:grid-cols-2">
              <InfoCard
                icon={<MapPin />}
                label="เรื่อง / วัตถุประสงค์"
                value={booking.subject}
              />

              <InfoCard
                icon={<MapPin />}
                label="สถานที่ / จุดหมาย"
                value={booking.destination}
              />

              <InfoCard
                icon={<UsersRound />}
                label="จำนวนผู้โดยสาร"
                value={`${booking.countPeople || 1} คน`}
              />

              {booking.listPeople && (
                <InfoCard
                  icon={<UsersRound />}
                  label="รายชื่อผู้ร่วมเดินทาง"
                  value={booking.listPeople}
                />
              )}
            </div>
          </Section>
        </div>

        {/* RIGHT */}
        <div className="space-y-5">
          {/* BOOKER */}
          <Section
            title="ข้อมูลผู้จอง"
            icon={<UserRound className="h-4 w-4" />}
          >
            <PersonCard
              name={booking.bookingName}
              code={booking.userCode}
              phone={booking.phone}
              telDep={booking.telDep}
            />
          </Section>

          {/* DRIVER */}
          <Section title="พนักงานขับรถ" icon={<CarFront className="h-4 w-4" />}>
            {booking.cUCode ? (
              <div className="rounded-xl border border-emerald-100 bg-emerald-50/60 p-4 dark:border-emerald-500/20 dark:bg-emerald-500/10">
                <div className="flex items-start gap-3">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-emerald-500 text-white shadow-sm">
                    <UserRound className="h-5 w-5" />
                  </div>

                  <div className="min-w-0">
                    <p className="truncate text-sm font-bold text-gray-900 dark:text-white">
                      {booking.driverName || '-'}
                    </p>

                    <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                      รหัสผู้ขับ {booking.cUCode}
                    </p>

                    <div className="mt-2 inline-flex items-center gap-1.5 rounded-lg bg-white px-2.5 py-1.5 text-xs font-medium text-gray-600 shadow-sm dark:bg-white/10 dark:text-gray-300">
                      <Phone className="h-3.5 w-3.5 text-emerald-500" />
                      {formatPhone(booking.driverPhone)}
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              <div className="rounded-xl border border-amber-200 bg-amber-50 px-4 py-3.5 text-sm font-medium text-amber-700 dark:border-amber-500/20 dark:bg-amber-500/10 dark:text-amber-300">
                ยังไม่ได้กำหนดพนักงานขับรถ
              </div>
            )}
          </Section>
        </div>
      </div>
    </div>
  );
}

function Section({
  title,
  icon,
  children,
}: {
  title: string;
  icon?: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <section className="overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm dark:border-gray-800 dark:bg-gray-900">
      <div className="dark:bg-white/2 border-b border-gray-100 bg-gray-50/60 px-4 py-3 dark:border-gray-800">
        <div className="flex items-center gap-2.5">
          {icon && (
            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-blue-50 text-blue-600 dark:bg-blue-500/10 dark:text-blue-300">
              {icon}
            </div>
          )}

          <h3 className="text-sm font-bold text-gray-900 dark:text-white">
            {title}
          </h3>
        </div>
      </div>

      <div className="p-4 sm:p-5">{children}</div>
    </section>
  );
}

function InfoCard({
  icon,
  label,
  value,
}: {
  icon: React.ReactElement;
  label: string;
  value?: string | null;
}) {
  return (
    <div className="dark:bg-white/3 rounded-xl border border-gray-100 bg-gray-50/60 p-3.5 dark:border-gray-800">
      <div className="flex items-start gap-3">
        <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-blue-50 text-blue-600 dark:bg-blue-500/10 dark:text-blue-300 [&>svg]:h-4 [&>svg]:w-4">
          {icon}
        </div>

        <div className="min-w-0">
          <p className="text-[11px] font-medium text-gray-400">{label}</p>

          <p className="mt-1 text-sm font-semibold leading-6 text-gray-800 dark:text-gray-200">
            {value || '-'}
          </p>
        </div>
      </div>
    </div>
  );
}

function DateCard({
  title,
  date,
  time,
  variant = 'start',
}: {
  title: string;
  date: unknown;
  time: unknown;
  variant?: 'start' | 'end';
}) {
  const isStart = variant === 'start';

  return (
    <div
      className={`rounded-xl border p-4 ${
        isStart
          ? 'border-blue-100 bg-blue-50/50 dark:border-blue-500/20 dark:bg-blue-500/10'
          : 'border-indigo-100 bg-indigo-50/50 dark:border-indigo-500/20 dark:bg-indigo-500/10'
      }`}
    >
      <div className="flex items-center justify-between">
        <p
          className={`text-xs font-bold ${
            isStart
              ? 'text-blue-600 dark:text-blue-300'
              : 'text-indigo-600 dark:text-indigo-300'
          }`}
        >
          {title}
        </p>

        <span
          className={`h-2 w-2 rounded-full ${
            isStart ? 'bg-blue-500' : 'bg-indigo-500'
          }`}
        />
      </div>

      <div className="mt-3 flex items-center gap-2 text-sm font-bold text-gray-900 dark:text-white">
        <CalendarDays
          className={`h-4 w-4 ${isStart ? 'text-blue-500' : 'text-indigo-500'}`}
        />

        {formatThaiDate(date)}
      </div>

      <div className="mt-2 flex items-center gap-2 text-sm font-medium text-gray-600 dark:text-gray-300">
        <Clock3 className="h-4 w-4" />
        {formatTime(time)} น.
      </div>
    </div>
  );
}

function PersonCard({
  name,
  code,
  phone,
  telDep,
}: {
  name?: string | null;
  code?: string | null;
  phone?: string | null;
  telDep?: string | null;
}) {
  return (
    <div>
      <div className="flex items-center gap-3">
        <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-indigo-500 text-white shadow-sm">
          <UserRound className="h-5 w-5" />
        </div>

        <div className="min-w-0">
          <p className="truncate text-sm font-bold text-gray-900 dark:text-white">
            {name || '-'}
          </p>

          <p className="mt-1 text-xs text-gray-400">รหัสผู้จอง {code || '-'}</p>
        </div>
      </div>

      <div className="mt-4 grid grid-cols-1 gap-2 sm:grid-cols-2 xl:grid-cols-1">
        <div className="rounded-xl bg-gray-50 px-3 py-2.5 dark:bg-white/5">
          <p className="text-[10px] font-medium text-gray-400">เบอร์ภายใน</p>

          <p className="mt-1 text-sm font-semibold text-gray-700 dark:text-gray-300">
            {telDep || '-'}
          </p>
        </div>

        <div className="rounded-xl bg-gray-50 px-3 py-2.5 dark:bg-white/5">
          <p className="text-[10px] font-medium text-gray-400">
            โทรศัพท์มือถือ
          </p>

          <p className="mt-1 flex items-center gap-1.5 text-sm font-semibold text-gray-700 dark:text-gray-300">
            <Phone className="h-3.5 w-3.5 text-blue-500" />
            {formatPhone(phone)}
          </p>
        </div>
      </div>
    </div>
  );
}

function StatusBadge({
  status,
}: {
  status: 'pending' | 'approved' | 'cancelled';
}) {
  const config = {
    pending: {
      text: 'รออนุมัติ',
      dot: 'bg-amber-500',
      className:
        'border-amber-200 bg-amber-50 text-amber-700 dark:border-amber-500/20 dark:bg-amber-500/10 dark:text-amber-300',
    },

    approved: {
      text: 'อนุมัติแล้ว',
      dot: 'bg-emerald-500',
      className:
        'border-emerald-200 bg-emerald-50 text-emerald-700 dark:border-emerald-500/20 dark:bg-emerald-500/10 dark:text-emerald-300',
    },

    cancelled: {
      text: 'ยกเลิก',
      dot: 'bg-red-500',
      className:
        'border-red-200 bg-red-50 text-red-600 dark:border-red-500/20 dark:bg-red-500/10 dark:text-red-300',
    },
  };

  const current = config[status];

  return (
    <span
      className={`inline-flex w-fit items-center gap-2 rounded-full border px-3 py-1.5 text-xs font-bold ${current.className}`}
    >
      <span className={`h-2 w-2 rounded-full ${current.dot}`} />
      {current.text}
    </span>
  );
}

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
      const data = parsed as {
        main?: unknown;
        images?: unknown;
      };

      if (typeof data.main === 'string') {
        return data.main;
      }

      if (Array.isArray(data.images) && typeof data.images[0] === 'string') {
        return data.images[0];
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
