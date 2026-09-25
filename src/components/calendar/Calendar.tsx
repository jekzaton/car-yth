'use client';

import { useEffect, useMemo, useState } from 'react';

import FullCalendar from '@fullcalendar/react';
import dayGridPlugin from '@fullcalendar/daygrid';
import timeGridPlugin from '@fullcalendar/timegrid';
import interactionPlugin from '@fullcalendar/interaction';
import thLocale from '@fullcalendar/core/locales/th';

import type {
  DatesSetArg,
  EventClickArg,
  EventContentArg,
  EventInput,
} from '@fullcalendar/core';

import {
  ArrowLeft,
  CalendarDays,
  CarFront,
  Clock3,
  MapPin,
  Phone,
  PhoneCall,
  UserRound,
  UsersRound,
  X,
} from 'lucide-react';

import { Modal } from '@/components/ui/modal';
import { useModal } from '@/hooks/useModal';

import api from '@/lib/axios';

import type { BookingCalendarItem } from '@/types/bookingCalendarType';

import CalendarHeader from './CalendarHeader';

import { getCarTypeColor } from '@/utils/carTypeColor';

type CalendarExtendedProps = {
  bookings: BookingCalendarItem[];

  typeCarId: number;

  typeName: string;

  count: number;

  typeColor: string;
};

type CalendarEvent = EventInput & {
  extendedProps: CalendarExtendedProps;
};

export default function Calendar() {
  const [bookings, setBookings] = useState<BookingCalendarItem[]>([]);

  const [loading, setLoading] = useState(true);

  const [selectedBookings, setSelectedBookings] = useState<
    BookingCalendarItem[]
  >([]);

  const [selectedBooking, setSelectedBooking] =
    useState<BookingCalendarItem | null>(null);

  const { isOpen, openModal, closeModal } = useModal();
  const [visibleRange, setVisibleRange] = useState<{
    start: string;
    end: string;
  } | null>(null);

  useEffect(() => {
    const loadCalendar = async () => {
      try {
        setLoading(true);

        const response = await api.get('/api/car-bookings/cdBooking', {
          params: {
            _t: Date.now(),
          },
        });

        const data: BookingCalendarItem[] = Array.isArray(response.data?.data)
          ? response.data.data
          : [];

        setBookings(data);
      } catch (error) {
        console.error('Load calendar error:', error);

        setBookings([]);
      } finally {
        setLoading(false);
      }
    };

    loadCalendar();
  }, []);

  const events = useMemo<CalendarEvent[]>(() => {
    const groups = new Map<
      string,
      {
        date: string;

        typeCarId: number;

        typeName: string;

        bookings: BookingCalendarItem[];
      }
    >();

    bookings.forEach((booking) => {
      const date = getCalendarDate(booking.startDate);

      // console.log('BOOKING DATE:', {
      //   bookingId: booking.bookingId,

      //   raw: booking.startDate,

      //   parsed: date,

      //   typeCarId: booking.typeCarId,

      //   typeName: booking.typeName,
      // });

      if (!date) {
        console.warn('Invalid booking date:', booking);

        return;
      }

      const typeCarId = Number(booking.typeCarId ?? booking.typeCar ?? 0);

      const typeName = booking.typeName?.trim() || 'ไม่ระบุประเภทรถ';

      /*
       * วันที่เดียวกัน + ประเภทเดียวกัน
       * จะรวมเป็น event เดียว
       */
      const key = `${date}-${typeCarId}`;

      const existing = groups.get(key);

      if (existing) {
        existing.bookings.push(booking);

        return;
      }

      groups.set(key, {
        date,

        typeCarId,

        typeName,

        bookings: [booking],
      });
    });

    const result: CalendarEvent[] = Array.from(groups.values()).map((group) => {
      return {
        id: `${group.date}-${group.typeCarId}`,

        title: `${group.typeName} ${group.bookings.length} คัน`,

        start: group.date,

        allDay: true,

        extendedProps: {
          bookings: group.bookings,

          typeCarId: group.typeCarId,

          typeName: group.typeName,

          count: group.bookings.length,

          typeColor: getCarTypeColor(group.typeCarId),
        },
      };
    });

    // console.log('FULL CALENDAR EVENTS:', result);

    return result;
  }, [bookings]);

  const handleEventClick = (info: EventClickArg) => {
    const eventBookings = info.event.extendedProps
      .bookings as BookingCalendarItem[];

    if (!eventBookings?.length) {
      return;
    }

    setSelectedBookings(eventBookings);

    // มีรายการเดียว เปิดรายละเอียดทันที
    if (eventBookings.length === 1) {
      setSelectedBooking(eventBookings[0]);
    } else {
      // มีหลายรายการ เปิดหน้ารวมก่อน
      setSelectedBooking(null);
    }

    openModal();
  };

  const handleDatesSet = (info: DatesSetArg) => {
    const start = getCalendarDate(info.view.currentStart);
    const end = getCalendarDate(info.view.currentEnd);

    setVisibleRange({
      start,
      end,
    });
  };

  const visibleBookings = useMemo(() => {
    if (!visibleRange) {
      return bookings;
    }

    return bookings.filter((booking) => {
      const bookingStart = getCalendarDate(booking.startDate);

      const bookingEnd = getCalendarDate(booking.endDate) || bookingStart;

      if (!bookingStart) {
        return false;
      }

      return (
        bookingStart < visibleRange.end && bookingEnd >= visibleRange.start
      );
    });
  }, [bookings, visibleRange]);

  return (
    <>
      <div className="overflow-hidden rounded-3xl border border-gray-200 bg-white shadow-sm dark:border-gray-800 dark:bg-gray-900">
        {/* HEADER */}

        <CalendarHeader bookings={visibleBookings} />

        {/* CALENDAR */}

        <div className="w-full p-4 md:p-6">
          {loading ? (
            <CalendarLoading />
          ) : (
            <div className="custom-calendar w-full max-w-none">
              <FullCalendar
                plugins={[dayGridPlugin, timeGridPlugin, interactionPlugin]}
                locale={thLocale}
                initialView="dayGridMonth"
                firstDay={0}
                height="auto"
                contentHeight="auto"
                events={events}
                datesSet={handleDatesSet}
                eventDisplay="block"
                displayEventTime={false}
                eventClick={handleEventClick}
                eventContent={renderEventContent}
                dayMaxEvents={true}
                nowIndicator
                headerToolbar={{
                  left: 'prev,next today',
                  center: 'title',
                  right: 'dayGridMonth,timeGridWeek,timeGridDay',
                }}
                buttonText={{
                  today: 'วันนี้',
                  month: 'เดือน',
                  week: 'สัปดาห์',
                  day: 'วัน',
                }}
              />
            </div>
          )}
        </div>
      </div>

      {/* DETAIL MODAL */}

      <Modal
        isOpen={isOpen}
        onClose={() => {
          closeModal();
          setSelectedBooking(null);
          setSelectedBookings([]);
        }}
        showCloseButton={false}
        className="max-w-180 overflow-hidden p-0"
      >
        {selectedBooking ? (
          <BookingDetail
            booking={selectedBooking}
            onBack={
              selectedBookings.length > 1
                ? () => setSelectedBooking(null)
                : undefined
            }
            onClose={() => {
              closeModal();
              setSelectedBooking(null);
              setSelectedBookings([]);
            }}
          />
        ) : selectedBookings.length > 0 ? (
          <BookingList
            bookings={selectedBookings}
            onSelect={setSelectedBooking}
            onClose={() => {
              closeModal();
              setSelectedBooking(null);
              setSelectedBookings([]);
            }}
          />
        ) : null}
      </Modal>
    </>
  );
}

function BookingList({
  bookings,
  onSelect,
  onClose,
}: {
  bookings: BookingCalendarItem[];
  onSelect: (booking: BookingCalendarItem) => void;
  onClose: () => void;
}) {
  const firstBooking = bookings[0];

  return (
    <div className="overflow-hidden rounded-3xl bg-white dark:bg-gray-900">
      {/* HEADER */}
      <div className="bg-linear-to-r relative from-blue-600 via-indigo-600 to-purple-600 px-6 py-6 text-white">
        <button
          type="button"
          onClick={onClose}
          className="absolute right-4 top-4 flex h-9 w-9 items-center justify-center rounded-xl bg-white/10 transition hover:bg-white/20"
        >
          <X className="h-5 w-5" />
        </button>

        <div className="flex items-center gap-4">
          <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-white/15">
            <CarFront className="h-7 w-7" />
          </div>

          <div>
            <p className="text-xs text-blue-100">รายการจองรถ</p>

            <h2 className="mt-1 text-xl font-bold">
              {firstBooking?.typeName || 'รายการจองรถ'}
            </h2>

            <p className="mt-1 text-sm text-blue-100">
              มีทั้งหมด {bookings.length} รายการ
            </p>
          </div>
        </div>
      </div>

      {/* LIST */}
      <div className="max-h-[70vh] space-y-3 overflow-y-auto p-5">
        {bookings.map((booking, index) => (
          <button
            key={booking.bookingId}
            type="button"
            onClick={() => onSelect(booking)}
            className="group w-full rounded-2xl border border-gray-200 bg-white p-4 text-left transition hover:border-blue-300 hover:bg-blue-50/50 hover:shadow-md dark:border-gray-800 dark:bg-gray-900 dark:hover:border-blue-500/40 dark:hover:bg-blue-500/5"
          >
            <div className="flex items-start gap-4">
              {/* NUMBER */}
              <div
                className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border ${getCarTypeColor(
                  Number(booking.typeCarId ?? booking.typeCar ?? 0),
                )} `}
              >
                <span className="text-sm font-bold">{index + 1}</span>
              </div>

              <div className="min-w-0 flex-1">
                {/* CAR */}
                <div className="flex items-center justify-between gap-3">
                  <div className="min-w-0">
                    <p className="truncate font-bold text-gray-900 dark:text-white">
                      {booking.carName || booking.carCode}
                    </p>

                    <p className="mt-0.5 text-xs text-gray-500 dark:text-gray-400">
                      {booking.licensePlate
                        ? `ทะเบียน ${booking.licensePlate}`
                        : booking.carCode}
                    </p>
                  </div>

                  <span
                    className={`shrink-0 rounded-full border px-2.5 py-1 text-[10px] font-semibold ${getCarTypeColor(
                      Number(booking.typeCarId ?? booking.typeCar ?? 0),
                    )} `}
                  >
                    {booking.typeName || 'ไม่ระบุประเภท'}
                  </span>
                </div>

                {/* DETAILS */}
                <div className="mt-3 grid grid-cols-1 gap-2 text-xs text-gray-600 sm:grid-cols-2 dark:text-gray-300">
                  <div className="flex items-center gap-2">
                    <UserRound className="h-3.5 w-3.5 shrink-0 text-gray-400" />

                    <span className="truncate">
                      {booking.bookingName || '-'}
                    </span>
                  </div>

                  <div className="flex items-center gap-2">
                    <Clock3 className="h-3.5 w-3.5 shrink-0 text-gray-400" />

                    <span>
                      {formatTime(booking.startTime)}
                      {' - '}
                      {formatTime(booking.endTime)} น.
                    </span>
                  </div>

                  <div className="flex items-center gap-2 sm:col-span-2">
                    <MapPin className="h-3.5 w-3.5 shrink-0 text-gray-400" />

                    <span className="truncate">
                      {booking.destination || '-'}
                    </span>
                  </div>
                </div>

                <div className="mt-3 flex items-center justify-between border-t border-gray-100 pt-3 dark:border-gray-800">
                  <div className="flex items-center gap-1.5 text-xs text-gray-500">
                    <UsersRound className="h-3.5 w-3.5" />
                    {booking.countPeople || 0} คน
                  </div>

                  <span className="text-xs font-semibold text-blue-600 group-hover:text-blue-700 dark:text-blue-400">
                    ดูรายละเอียด →
                  </span>
                </div>
              </div>
            </div>
          </button>
        ))}
      </div>
    </div>
  );
}

function CalendarLoading() {
  return (
    <div className="min-h-150 flex items-center justify-center">
      <div className="text-center">
        <div className="mx-auto h-9 w-9 animate-spin rounded-full border-4 border-blue-100 border-t-blue-600" />

        <p className="mt-3 text-sm text-gray-500">กำลังโหลดปฏิทิน...</p>
      </div>
    </div>
  );
}

function renderEventContent(eventInfo: EventContentArg) {
  const props = eventInfo.event.extendedProps as CalendarExtendedProps;

  return (
    <div
      className={`w-full min-w-0 cursor-pointer overflow-hidden rounded-md border px-1.5 py-1 sm:rounded-lg sm:px-2 sm:py-1.5 ${props.typeColor} `}
    >
      <div className="flex min-w-0 items-center gap-1">
        <CarFront className="hidden h-3.5 w-3.5 shrink-0 sm:block" />

        <span className="min-w-0 flex-1 truncate text-[9px] font-bold sm:text-[11px]">
          {props.typeName}
        </span>

        <span className="shrink-0 text-[9px] font-bold sm:text-[11px]">
          {props.count}
          <span className="hidden sm:inline"> คัน</span>
        </span>
      </div>
    </div>
  );
}

//  BOOKING DETAIL

function BookingDetail({
  booking,
  onClose,
  onBack,
}: {
  booking: BookingCalendarItem;
  onClose: () => void;
  onBack?: () => void;
}) {
  const startDate = getCalendarDate(booking.startDate);
  const endDate = getCalendarDate(booking.endDate);

  const typeCarId = Number(booking.typeCarId ?? booking.typeCar ?? 0);

  return (
    <div className="overflow-hidden bg-white dark:bg-gray-900">
      {/* HEADER */}
      <div className="bg-linear-to-r from-blue-600 via-indigo-600 to-purple-600 px-6 py-5 text-white">
        <div className="mb-4 flex items-center justify-between">
          {onBack ? (
            <button
              type="button"
              onClick={onBack}
              className="inline-flex h-10 items-center gap-2 rounded-xl bg-white/10 px-3 text-sm font-medium transition hover:bg-white/20"
            >
              <ArrowLeft className="h-4 w-4" />
              ย้อนกลับ
            </button>
          ) : (
            <div />
          )}

          <button
            type="button"
            onClick={onClose}
            className="flex h-10 w-10 items-center justify-center rounded-xl bg-white/10 transition hover:bg-white/20"
            title="ปิด"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="flex items-center gap-4">
          <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-white/15">
            <CarFront className="h-7 w-7" />
          </div>

          <div className="min-w-0">
            <p className="text-xs text-blue-100">รายละเอียดการจองรถ</p>

            <h2 className="mt-1 truncate text-xl font-bold">
              {booking.carName || booking.carCode}
            </h2>

            <p className="mt-1 text-sm text-blue-100">
              {booking.licensePlate
                ? `ทะเบียน ${booking.licensePlate}`
                : booking.carCode}
            </p>
          </div>
        </div>
      </div>

      {/* CONTENT */}
      <div className="max-h-[75vh] space-y-5 overflow-y-auto p-6">
        {/* STATUS */}
        <div className="flex flex-wrap items-center gap-2">
          <div className="inline-flex items-center gap-2 rounded-full bg-green-50 px-3 py-1.5 text-xs font-semibold text-green-700 dark:bg-green-500/10 dark:text-green-300">
            <span className="h-2 w-2 rounded-full bg-green-500" />
            อนุมัติแล้ว
          </div>

          <div
            className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-xs font-semibold ${getCarTypeColor(
              typeCarId,
            )}`}
          >
            <CarFront className="h-3.5 w-3.5" />

            {booking.typeName || 'ไม่ระบุประเภทรถ'}
          </div>
        </div>

        {/* BOOKER */}
        <DetailCard icon={<UserRound className="h-5 w-5" />} title="ผู้จอง">
          <p className="font-semibold text-gray-900 dark:text-white">
            {booking.bookingName || 'ไม่พบข้อมูลชื่อผู้จอง'}
          </p>
        </DetailCard>

        {/* DATE + TIME */}
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <DetailCard
            icon={<CalendarDays className="h-5 w-5" />}
            title="วันเดินทาง"
          >
            <p className="font-semibold">
              {startDate && endDate
                ? startDate === endDate
                  ? formatThaiDate(startDate)
                  : `${formatThaiDate(startDate)} - ${formatThaiDate(endDate)}`
                : '-'}
            </p>
          </DetailCard>

          <DetailCard icon={<Clock3 className="h-5 w-5" />} title="เวลาเดินทาง">
            <p className="font-semibold">
              {formatTime(booking.startTime)} - {formatTime(booking.endTime)} น.
            </p>
          </DetailCard>
        </div>

        {/* SUBJECT */}
        <DetailCard
          icon={<CarFront className="h-5 w-5" />}
          title="เรื่อง / วัตถุประสงค์"
        >
          <p className="font-medium">{booking.subject || '-'}</p>
        </DetailCard>

        {/* DESTINATION */}
        <DetailCard icon={<MapPin className="h-5 w-5" />} title="สถานที่ไป">
          <p className="font-medium">{booking.destination || '-'}</p>
        </DetailCard>

        {/* PEOPLE */}
        <DetailCard
          icon={<UsersRound className="h-5 w-5" />}
          title="จำนวนผู้เดินทาง"
        >
          <p className="font-semibold">{booking.countPeople ?? 0} คน</p>

          {booking.listPeople?.trim() && (
            <div className="mt-3 whitespace-pre-line rounded-xl bg-gray-50 p-3 text-sm leading-6 text-gray-600 dark:bg-gray-800 dark:text-gray-300">
              {booking.listPeople}
            </div>
          )}
        </DetailCard>

        {/* PHONE */}
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <DetailCard
            icon={<PhoneCall className="h-5 w-5" />}
            title="เบอร์โทรภายใน"
          >
            <p className="font-semibold">{booking.telDep || '-'}</p>
          </DetailCard>

          <DetailCard
            icon={<Phone className="h-5 w-5" />}
            title="เบอร์โทรส่วนตัว"
          >
            <p className="font-semibold">{booking.phone || '-'}</p>
          </DetailCard>
        </div>
      </div>
    </div>
  );
}

//  DETAIL CARD

function DetailCard({
  icon,
  title,
  children,
}: {
  icon: React.ReactNode;

  title: string;

  children: React.ReactNode;
}) {
  return (
    <div className="rounded-2xl border border-gray-100 bg-gray-50/70 p-4 dark:border-gray-800 dark:bg-gray-800/50">
      <div className="mb-2 flex items-center gap-2 text-blue-600 dark:text-blue-400">
        {icon}

        <span className="text-xs font-semibold text-gray-500 dark:text-gray-400">
          {title}
        </span>
      </div>

      <div className="text-sm text-gray-800 dark:text-gray-200">{children}</div>
    </div>
  );
}

//  DATE FOR FULLCALENDAR

function getCalendarDate(value: unknown): string {
  if (!value) {
    return '';
  }

  /*
   * กรณีเป็น Date object
   */
  if (value instanceof Date) {
    if (Number.isNaN(value.getTime())) {
      return '';
    }

    const year = value.getFullYear();

    const month = String(value.getMonth() + 1).padStart(2, '0');

    const day = String(value.getDate()).padStart(2, '0');

    return `${year}-${month}-${day}`;
  }

  const raw = String(value).trim();

  /*
   * รองรับ
   *
   * 2026-09-03
   * 2026-09-03T00:00:00
   * 2026-09-03T00:00:00.000Z
   */
  const isoMatch = raw.match(/(\d{4})-(\d{2})-(\d{2})/);

  if (isoMatch) {
    return `${isoMatch[1]}-${isoMatch[2]}-${isoMatch[3]}`;
  }

  /*
   * รองรับ JS Date String
   *
   * Thu Sep 03 2026 ...
   */
  const parsed = new Date(raw);

  if (Number.isNaN(parsed.getTime())) {
    return '';
  }

  const year = parsed.getFullYear();

  const month = String(parsed.getMonth() + 1).padStart(2, '0');

  const day = String(parsed.getDate()).padStart(2, '0');

  return `${year}-${month}-${day}`;
}

/* =========================================================
   TIME
========================================================= */

function formatTime(value: unknown): string {
  if (!value) {
    return '-';
  }

  const raw = String(value).trim();

  const match = raw.match(/^(\d{1,2}):(\d{2})/);

  if (!match) {
    return raw;
  }

  return `${match[1].padStart(2, '0')}:${match[2]}`;
}

/* =========================================================
   THAI DATE
========================================================= */

function formatThaiDate(value: unknown): string {
  const dateValue = getCalendarDate(value);

  if (!dateValue) {
    return '-';
  }

  const [year, month, day] = dateValue.split('-').map(Number);

  const date = new Date(year, month - 1, day);

  if (Number.isNaN(date.getTime())) {
    return '-';
  }

  return new Intl.DateTimeFormat('th-TH', {
    day: 'numeric',

    month: 'long',

    year: 'numeric',
  }).format(date);
}
