'use client';

import axios from 'axios';
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
    <div className="space-y-5">
      {/* HEADER */}

      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => router.back()}
            className="flex h-10 w-10 items-center justify-center rounded-xl border border-gray-200 bg-white text-gray-500 transition hover:border-blue-200 hover:text-blue-600 dark:border-white/10 dark:bg-white/5"
          >
            <ArrowLeft className="h-5 w-5" />
          </button>

          <div>
            <h1 className="text-xl font-bold text-gray-900 dark:text-white">
              รายละเอียดการจองรถ
            </h1>

            <p className="mt-0.5 text-xs text-gray-400">
              เลขที่การจอง #{booking.bookingId}
            </p>
          </div>
        </div>

        <StatusBadge status={booking.status} />
      </div>

      {/* MAIN */}

      <div className="grid gap-5 xl:grid-cols-3">
        {/* LEFT */}

        <div className="space-y-5 xl:col-span-2">
          {/* CAR */}

          <Section title="ข้อมูลรถ">
            <div className="flex items-center gap-4">
              <CarImageCell
                src={getMainCarImage(booking.carImage)}
                alt={booking.carName || 'car'}
              />

              <div>
                <div className="flex items-center gap-2">
                  <h2 className="font-bold text-gray-900 dark:text-white">
                    {booking.carName || '-'}
                  </h2>

                  <span className="rounded-lg bg-blue-50 px-2 py-1 text-xs font-semibold text-blue-600">
                    {booking.carCode}
                  </span>
                </div>

                <p className="mt-1 text-sm text-gray-500">
                  {booking.carBrand || '-'}
                </p>

                <p className="mt-1 flex items-center gap-1 text-sm text-gray-500">
                  <CarFront className="h-4 w-4" />
                  ทะเบียน {booking.licensePlate || '-'}
                </p>

                <p className="mt-1 text-xs text-gray-400">
                  ประเภท {booking.typeName || '-'}
                </p>
              </div>
            </div>
          </Section>

          {/* PURPOSE */}

          <Section title="รายละเอียดการเดินทาง">
            <Info
              icon={<MapPin />}
              label="เรื่อง / วัตถุประสงค์"
              value={booking.subject}
            />

            <Info
              icon={<MapPin />}
              label="สถานที่ / จุดหมาย"
              value={booking.destination}
            />

            <Info
              icon={<UsersRound />}
              label="จำนวนผู้โดยสาร"
              value={`${booking.countPeople || 1} คน`}
            />

            {booking.listPeople && (
              <Info
                icon={<UsersRound />}
                label="รายชื่อผู้ร่วมเดินทาง"
                value={booking.listPeople}
              />
            )}
          </Section>

          {/* DATE */}

          <Section title="วันและเวลาใช้งาน">
            <div className="grid gap-4 sm:grid-cols-2">
              <DateCard
                title="เริ่มใช้งาน"
                date={booking.startDate}
                time={booking.startTime}
              />

              <DateCard
                title="สิ้นสุด"
                date={booking.endDate}
                time={booking.endTime}
              />
            </div>
          </Section>
        </div>

        {/* RIGHT */}

        <div className="space-y-5">
          {/* BOOKER */}

          <Section title="ผู้จอง">
            <PersonCard
              name={booking.bookingName}
              code={booking.userCode}
              phone={booking.phone}
              telDep={booking.telDep}
            />
          </Section>

          {/* DRIVER */}

          <Section title="พนักงานขับรถ">
            {booking.cUCode ? (
              <div className="flex items-start gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600">
                  <UserRound className="h-5 w-5" />
                </div>

                <div>
                  <p className="font-semibold text-gray-800 dark:text-gray-200">
                    {booking.driverName || '-'}
                  </p>

                  <p className="mt-1 text-xs text-gray-400">
                    รหัสผู้ขับ {booking.cUCode}
                  </p>

                  <p className="mt-1 flex items-center gap-1 text-xs text-gray-500">
                    <Phone className="h-3.5 w-3.5" />

                    {formatPhone(booking.driverPhone)}
                  </p>
                </div>
              </div>
            ) : (
              <div className="rounded-xl bg-amber-50 px-4 py-3 text-sm text-amber-700">
                ยังไม่ได้กำหนดคนขับรถ
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
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <div className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm dark:border-white/10 dark:bg-white/5">
      <h3 className="mb-4 text-sm font-bold text-gray-800 dark:text-gray-200">
        {title}
      </h3>

      <div className="space-y-4">{children}</div>
    </div>
  );
}

function Info({
  icon,
  label,
  value,
}: {
  icon: React.ReactElement;
  label: string;
  value?: string | null;
}) {
  return (
    <div className="flex gap-3">
      <div className="mt-0.5 [&>svg]:h-4 [&>svg]:w-4 [&>svg]:text-blue-500">
        {icon}
      </div>

      <div>
        <p className="text-xs text-gray-400">{label}</p>

        <p className="mt-1 text-sm font-medium text-gray-700 dark:text-gray-300">
          {value || '-'}
        </p>
      </div>
    </div>
  );
}

function DateCard({
  title,
  date,
  time,
}: {
  title: string;
  date: unknown;
  time: unknown;
}) {
  return (
    <div className="rounded-xl bg-gray-50 p-4 dark:bg-white/5">
      <p className="text-xs font-medium text-gray-400">{title}</p>

      <div className="mt-2 flex items-center gap-2 text-sm font-semibold text-gray-800 dark:text-gray-200">
        <CalendarDays className="h-4 w-4 text-blue-500" />

        {formatThaiDate(date)}
      </div>

      <div className="mt-1 flex items-center gap-2 text-sm text-gray-500">
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
    <div className="flex items-start gap-3">
      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-indigo-50 text-indigo-600">
        <UserRound className="h-5 w-5" />
      </div>

      <div>
        <p className="font-semibold text-gray-800 dark:text-gray-200">
          {name || '-'}
        </p>

        <p className="mt-1 text-xs text-gray-400">รหัสผู้จอง {code || '-'}</p>

        <p className="mt-2 text-xs text-gray-500">
          เบอร์ภายใน : {telDep || '-'}
        </p>

        <p className="mt-1 text-xs text-gray-500">
          มือถือ : {formatPhone(phone)}
        </p>
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
      className: 'bg-amber-50 text-amber-700',
    },

    approved: {
      text: 'อนุมัติแล้ว',
      className: 'bg-emerald-50 text-emerald-700',
    },

    cancelled: {
      text: 'ยกเลิก',
      className: 'bg-red-50 text-red-600',
    },
  };

  const current = config[status];

  return (
    <span
      className={`rounded-full px-3 py-1.5 text-xs font-semibold ${current.className}`}
    >
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
