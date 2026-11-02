'use client';

import { useEffect, useState, type ReactNode } from 'react';
import { useRouter } from 'next/navigation';
import {
  ArrowLeft,
  Building2,
  CalendarDays,
  CarFront,
  CheckCircle2,
  Clock3,
  FileText,
  Hash,
  Loader2,
  MapPin,
  Phone,
  Route,
  UserRound,
  UsersRound,
  AlertCircle,
} from 'lucide-react';

import CarImageCell from './CarImageCell';

import { formatPhone, formatThaiDate, formatTime } from '@/utils/formatters';

import type { CarBookingItem } from '@/types/bookingCarType';
import api from '@/lib/axios';

type BookingDetailProps = {
  bookingId: number;
};

type BookingDetailItem = CarBookingItem & {
  departmentName?: string | null;
  departmentPhone?: string | null;
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
    let active = true;

    async function fetchBooking() {
      try {
        setIsLoading(true);
        setError('');

        const response = await api.get(`/api/car-bookings/${bookingId}`, {
          headers: {
            'Cache-Control': 'no-cache',
          },
        });

        if (!active) return;

        setBooking(response.data?.data ?? null);
      } catch (error) {
        console.error('โหลดรายละเอียดไม่สำเร็จ:', error);

        if (active) {
          setError('ไม่สามารถโหลดรายละเอียดการจองได้');
          setBooking(null);
        }
      } finally {
        if (active) setIsLoading(false);
      }
    }

    if (bookingId) {
      void fetchBooking();
    } else {
      setError('เลขที่การจองไม่ถูกต้อง');
      setIsLoading(false);
    }

    return () => {
      active = false;
    };
  }, [bookingId]);

  if (isLoading) {
    return (
      <div className="min-h-100 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="mx-auto h-9 w-9 animate-spin text-blue-600" />
          <p className="text-muted-foreground mt-3 text-sm">
            กำลังโหลดรายละเอียดการจอง...
          </p>
        </div>
      </div>
    );
  }

  if (error || !booking) {
    return (
      <div className="rounded-2xl border border-red-500/20 bg-red-500/5 p-8 text-center">
        <AlertCircle className="mx-auto h-10 w-10 text-red-500" />
        <p className="mt-3 font-medium text-red-600">
          {error || 'ไม่พบรายการจองรถ'}
        </p>

        <button
          type="button"
          onClick={() => router.back()}
          className="border-border bg-card text-foreground hover:bg-muted mt-5 rounded-xl border px-5 py-2 text-sm font-semibold"
        >
          กลับหน้าก่อนหน้า
        </button>
      </div>
    );
  }

  const carName =
    booking.carName?.trim() ||
    [booking.carBrand, booking.carBrandSub].filter(Boolean).join(' ').trim() ||
    'ไม่ระบุชื่อรถ';

  const departmentName = booking.departmentName?.trim() || 'ไม่ระบุแผนก';

  return (
    <div className="mx-auto w-full max-w-7xl space-y-5 pb-8 pt-5">
      {/* HEADER */}
      <div className="border-border bg-card overflow-hidden rounded-2xl border shadow-sm">
        <div className="bg-linear-to-r via-card from-blue-500/10 to-indigo-500/5 p-5 sm:p-6">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-start gap-3">
              <button
                type="button"
                onClick={() => router.back()}
                aria-label="กลับหน้าก่อนหน้า"
                className="border-border bg-background text-muted-foreground flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border transition hover:border-blue-400 hover:text-blue-600"
              >
                <ArrowLeft className="h-5 w-5" />
              </button>

              <div className="min-w-0">
                <div className="flex flex-wrap items-center gap-2">
                  <h1 className="text-foreground text-xl font-bold tracking-tight sm:text-2xl">
                    รายละเอียดการจองรถ
                  </h1>

                  <span className="border-border bg-background text-muted-foreground rounded-lg border px-2.5 py-1 text-xs font-bold">
                    #{booking.bookingId}
                  </span>
                </div>

                <p className="text-muted-foreground mt-1 text-xs sm:text-sm">
                  ข้อมูลการจองรถราชการและรายละเอียดการเดินทาง
                </p>
              </div>
            </div>

            <StatusBadge status={booking.status} />
          </div>
        </div>
      </div>

      {/* CAR HERO */}
      <Section
        title="ข้อมูลรถที่ใช้เดินทาง"
        icon={<CarFront className="h-4 w-4" />}
      >
        <div className="flex flex-col gap-5 sm:flex-row sm:items-center">
          <div className="border-border bg-muted/30 sm:w-45 w-full shrink-0 overflow-hidden rounded-xl border">
            <div className="aspect-16/10 flex items-center justify-center overflow-hidden [&_img]:h-full [&_img]:w-full [&_img]:object-cover">
              <CarImageCell
                src={getMainCarImage(booking.carImage) ?? ''}
                width={180}
                height={112}
                priority
                alt={carName}
              />
            </div>
          </div>

          <div className="min-w-0 flex-1">
            <div className="flex flex-wrap items-center gap-2">
              <h2 className="text-foreground text-lg font-bold sm:text-xl">
                {carName}
              </h2>

              {booking.carCode && (
                <span className="rounded-lg bg-blue-500/10 px-2.5 py-1 text-xs font-bold text-blue-600 dark:text-blue-400">
                  {booking.carCode}
                </span>
              )}
            </div>

            {booking.carBrand && (
              <p className="text-muted-foreground mt-1 text-sm">
                {booking.carBrand}
              </p>
            )}

            <div className="mt-4 flex flex-wrap gap-2">
              <span className="border-border bg-muted/40 text-foreground inline-flex items-center gap-2 rounded-lg border px-3 py-2 text-xs font-semibold">
                <CarFront className="h-4 w-4 text-blue-500" />
                ทะเบียน {booking.licensePlate || '-'}
              </span>

              <span className="border-border bg-muted/40 text-foreground inline-flex items-center gap-2 rounded-lg border px-3 py-2 text-xs font-semibold">
                <CarFront className="h-4 w-4 text-indigo-500" />
                {booking.typeName || 'ไม่ระบุประเภทรถ'}
              </span>
            </div>
          </div>
        </div>
      </Section>

      {/* MAIN GRID */}
      <div className="grid items-start gap-5 xl:grid-cols-[1.5fr_1fr]">
        {/* LEFT */}
        <div className="space-y-5">
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
                title="สิ้นสุดการใช้งาน"
                date={booking.endDate}
                time={booking.endTime}
                variant="end"
              />
            </div>
          </Section>

          <Section
            title="รายละเอียดการเดินทาง"
            icon={<Route className="h-4 w-4" />}
          >
            <div className="grid gap-3 sm:grid-cols-2">
              <InfoCard
                icon={<FileText />}
                label="เรื่อง / วัตถุประสงค์"
                value={booking.subject}
              />

              <InfoCard
                icon={<MapPin />}
                label="สถานที่ / จุดหมายปลายทาง"
                value={booking.destination}
              />

              <InfoCard
                icon={<UsersRound />}
                label="จำนวนผู้ร่วมเดินทาง"
                value={`${booking.countPeople ?? 0} คน`}
              />

              <InfoCard
                icon={<UsersRound />}
                label="รายชื่อผู้ร่วมเดินทาง"
                value={booking.listPeople}
              />
            </div>
          </Section>
        </div>

        {/* RIGHT */}
        <div className="space-y-5">
          <Section
            title="ข้อมูลผู้จอง"
            icon={<UserRound className="h-4 w-4" />}
          >
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-indigo-500/10 text-indigo-600 dark:text-indigo-400">
                  <UserRound className="h-6 w-6" />
                </div>

                <div className="min-w-0 flex-1">
                  <p className="text-foreground truncate text-sm font-bold">
                    {booking.bookingName || '-'}
                  </p>
                  <p className="text-muted-foreground mt-1 text-xs">
                    รหัสผู้จอง {booking.userCode || '-'}
                  </p>
                </div>
              </div>

              {/* DEPARTMENT */}
              <div className="bg-blue-500/4 rounded-xl border border-blue-500/15 p-3.5">
                <div className="flex items-start gap-3">
                  <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-blue-500/10 text-blue-600 dark:text-blue-400">
                    <Building2 className="h-4.5 w-4.5" />
                  </div>

                  <div className="min-w-0 flex-1">
                    <p className="text-muted-foreground text-[11px] font-medium">
                      แผนก / หน่วยงานผู้จอง
                    </p>
                    <p className="text-foreground mt-1 text-sm font-bold leading-5">
                      {departmentName}
                    </p>
                  </div>
                </div>
              </div>

              <div className="grid gap-2 sm:grid-cols-2 xl:grid-cols-1 2xl:grid-cols-2">
                <MiniInfo
                  icon={<Phone className="h-4 w-4" />}
                  label="เบอร์ภายใน"
                  value={booking.telDep || booking.departmentPhone || '-'}
                />

                <MiniInfo
                  icon={<Phone className="h-4 w-4" />}
                  label="โทรศัพท์มือถือ"
                  value={formatPhone(booking.phone)}
                />
              </div>
            </div>
          </Section>

          <Section title="พนักงานขับรถ" icon={<CarFront className="h-4 w-4" />}>
            {booking.cUCode ? (
              <div className="rounded-xl border border-emerald-500/20 bg-emerald-500/5 p-4">
                <div className="flex items-start gap-3">
                  <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-emerald-500/15 text-emerald-600 dark:text-emerald-400">
                    <UserRound className="h-5 w-5" />
                  </div>

                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <p className="text-foreground text-sm font-bold">
                        {booking.driverName?.trim() || 'ไม่พบข้อมูลชื่อคนขับ'}
                      </p>

                      <CheckCircle2 className="h-4 w-4 text-emerald-500" />
                    </div>

                    <p className="text-muted-foreground mt-1 flex items-center gap-1 text-xs">
                      <Hash className="h-3 w-3" />
                      รหัสพนักงาน {booking.cUCode}
                    </p>
                  </div>
                </div>

                {booking.driverPhone && (
                  <div className="text-foreground mt-3 flex items-center gap-2 border-t border-emerald-500/15 pt-3 text-xs">
                    <Phone className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
                    {formatPhone(booking.driverPhone)}
                  </div>
                )}
              </div>
            ) : (
              <div className="rounded-xl border border-dashed border-amber-500/30 bg-amber-500/5 px-4 py-4">
                <div className="flex items-center gap-3">
                  <AlertCircle className="h-5 w-5 text-amber-500" />
                  <p className="text-foreground text-sm font-medium">
                    ยังไม่ได้กำหนดพนักงานขับรถ
                  </p>
                </div>
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
  icon: ReactNode;
  children: ReactNode;
}) {
  return (
    <section className="border-border bg-card overflow-hidden rounded-2xl border shadow-sm">
      <div className="border-border bg-muted/30 flex items-center gap-2.5 border-b px-4 py-3.5 sm:px-5">
        <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-blue-500/10 text-blue-600 dark:text-blue-400">
          {icon}
        </div>

        <h3 className="text-foreground text-sm font-bold">{title}</h3>
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
  icon: ReactNode;
  label: string;
  value?: string | null;
}) {
  return (
    <div className="border-border bg-muted/20 flex min-w-0 items-start gap-3 rounded-xl border p-3.5">
      <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-blue-500/10 text-blue-600 dark:text-blue-400 [&>svg]:h-4 [&>svg]:w-4">
        {icon}
      </div>

      <div className="min-w-0 flex-1">
        <p className="text-muted-foreground text-[11px] font-medium">{label}</p>

        <p className="wrap-break-word text-foreground mt-1 whitespace-pre-line text-sm font-semibold leading-6">
          {value || '-'}
        </p>
      </div>
    </div>
  );
}

function MiniInfo({
  icon,
  label,
  value,
}: {
  icon: ReactNode;
  label: string;
  value?: string | null;
}) {
  return (
    <div className="border-border bg-muted/20 rounded-xl border p-3">
      <div className="text-muted-foreground flex items-center gap-2">
        {icon}
        <span className="text-[11px]">{label}</span>
      </div>

      <p className="text-foreground mt-2 text-sm font-semibold">
        {value || '-'}
      </p>
    </div>
  );
}

function DateCard({
  title,
  date,
  time,
  variant,
}: {
  title: string;
  date: unknown;
  time: unknown;
  variant: 'start' | 'end';
}) {
  const isStart = variant === 'start';

  return (
    <div
      className={`rounded-xl border p-4 ${
        isStart
          ? 'border-blue-500/20 bg-blue-500/5'
          : 'border-indigo-500/20 bg-indigo-500/5'
      }`}
    >
      <div className="flex items-center justify-between">
        <p
          className={`text-xs font-bold ${
            isStart
              ? 'text-blue-600 dark:text-blue-400'
              : 'text-indigo-600 dark:text-indigo-400'
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

      <div className="text-foreground mt-3 flex items-center gap-2 text-sm font-bold">
        <CalendarDays className="h-4 w-4 shrink-0" />
        {formatThaiDate(date)}
      </div>

      <div className="text-muted-foreground mt-2 flex items-center gap-2 text-sm">
        <Clock3 className="h-4 w-4 shrink-0" />
        {formatTime(time)} น.
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
        'border-amber-500/20 bg-amber-500/10 text-amber-600 dark:text-amber-400',
    },
    approved: {
      text: 'อนุมัติแล้ว',
      dot: 'bg-emerald-500',
      className:
        'border-emerald-500/20 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400',
    },
    cancelled: {
      text: 'ยกเลิก',
      dot: 'bg-red-500',
      className:
        'border-red-500/20 bg-red-500/10 text-red-600 dark:text-red-400',
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

  if (typeof carImage !== 'string') return null;

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
