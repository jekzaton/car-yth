'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
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
  Building2,
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
import BookingListHeader from './BookingListHeader';

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
        startDate: string;
        endDate: string;
        typeCarId: number;
        typeName: string;
        bookings: BookingCalendarItem[];
      }
    >();
    bookings.forEach((booking) => {
      const startDate = getCalendarDate(booking.startDate);
      const endDate = getCalendarDate(booking.endDate) || startDate;
      if (!startDate) {
        console.warn('Invalid booking date:', booking);
        return;
      }
      const typeCarId = Number(booking.typeCarId ?? booking.typeCar ?? 0);
      const typeName = booking.typeName?.trim() || 'ไม่ระบุประเภทรถ';
      /*
       * รวมเฉพาะรายการที่
       * - ประเภทรถเดียวกัน
       * - วันเริ่มเดียวกัน
       * - วันสิ้นสุดเดียวกัน
       *
       * ตัวอย่าง:
       * รถวิชาการ 2 คัน
       * จอง 8 - 9 เหมือนกัน
       * => แสดงเป็นแถบเดียว "วิชาการ 2 คัน"
       */
      const key = `${startDate}-${endDate}-${typeCarId}`;
      const existing = groups.get(key);
      if (existing) {
        existing.bookings.push(booking);
        return;
      }
      groups.set(key, {
        startDate,
        endDate,
        typeCarId,
        typeName,
        bookings: [booking],
      });
    });
    return Array.from(groups.values()).map((group) => {
      /*
       * FullCalendar end date เป็น exclusive
       *
       * จอง:
       * 8 - 9
       *
       * ต้องส่ง:
       * start = 8
       * end   = 10
       *
       * ถึงจะแสดงครอบ 8 และ 9
       */
      const calendarEnd = addDays(group.endDate, 1);
      return {
        id: `${group.startDate}-${group.endDate}-${group.typeCarId}`,
        title: `${group.typeName} ${group.bookings.length} คัน`,
        start: group.startDate,
        end: calendarEnd,
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

  const calendarRef = useRef<FullCalendar | null>(null);
  const calendarContainerRef = useRef<HTMLDivElement | null>(null);

  const [calendarWidth, setCalendarWidth] = useState(1024);

  useEffect(() => {
    const container = calendarContainerRef.current;

    if (!container) return;

    const observer = new ResizeObserver(([entry]) => {
      const width = Math.round(entry.contentRect.width);
      setCalendarWidth((previous) => (previous === width ? previous : width));
    });

    observer.observe(container);

    return () => observer.disconnect();
  }, []);

  const isMobile = calendarWidth < 640;
  const isTablet = calendarWidth >= 640 && calendarWidth < 1024;

  return (
    <>
      <div className="border-border bg-card overflow-hidden rounded-2xl border shadow-sm">
        {/* HEADER */}
        <CalendarHeader bookings={visibleBookings} />
        {/* CALENDAR */}

        <div
          ref={calendarContainerRef}
          className="flex min-h-0 w-full min-w-0 flex-1 flex-col p-2 sm:p-3 lg:p-4"
        >
          {loading ? (
            <CalendarLoading />
          ) : (
            <div className="custom-calendar bg-card text-foreground flex h-full min-h-0 w-full min-w-0 flex-1 flex-col overflow-hidden rounded-xl">
              <FullCalendar
                ref={calendarRef}
                plugins={[dayGridPlugin, timeGridPlugin, interactionPlugin]}
                locale={thLocale}
                initialView="dayGridMonth"
                firstDay={0}
                height="100%"
                fixedWeekCount={false}
                showNonCurrentDates={!isMobile}
                dayMaxEvents={isMobile ? 1 : isTablet ? 2 : 3}
                stickyHeaderDates={false}
                expandRows={true}
                handleWindowResize={true}
                windowResizeDelay={100}
                events={events}
                datesSet={handleDatesSet}
                eventDisplay="block"
                displayEventTime={false}
                eventClick={handleEventClick}
                eventContent={renderEventContent}
                nowIndicator={true}
                headerToolbar={
                  isMobile
                    ? {
                        left: 'prev,next',
                        center: 'title',
                        right: 'today',
                      }
                    : isTablet
                      ? {
                          left: 'prev,next today',
                          center: 'title',
                          right: 'dayGridMonth,timeGridWeek',
                        }
                      : {
                          left: 'prev,next today',
                          center: 'title',
                          right: 'dayGridMonth,timeGridWeek,timeGridDay',
                        }
                }
                buttonText={{
                  today: 'วันนี้',
                  month: 'เดือน',
                  week: 'สัปดาห์',
                  day: 'วัน',
                }}
                views={{
                  dayGridMonth: {
                    dayMaxEventRows: isMobile ? 2 : isTablet ? 3 : 4,
                  },
                  timeGridWeek: {
                    dayHeaderFormat: {
                      weekday: isMobile ? 'short' : 'long',
                      day: 'numeric',
                      month: 'numeric',
                    },
                  },
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
    <div className="border-border bg-card flex min-h-[650px] flex-col overflow-hidden rounded-2xl border shadow-sm lg:h-[calc(100dvh-110px)]">
      {/* HEADER */}
      <BookingListHeader
        typeName={firstBooking?.typeName}
        bookingCount={bookings.length}
        onClose={onClose}
      />
      {/* LIST */}
      <div className="bg-background/60 max-h-[70vh] space-y-3 overflow-y-auto p-4 sm:p-5">
        {bookings.map((booking, index) => (
          <button
            key={booking.bookingId}
            type="button"
            onClick={() => onSelect(booking)}
            className="border-border bg-card group w-full rounded-2xl border p-4 text-left shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:border-blue-400/50 hover:bg-blue-500/5 hover:shadow-md focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-500"
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
                      {booking.carCode}
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
                  <div className="flex min-w-0 items-center gap-2">
                    <Building2 className="size-3.5 shrink-0 text-indigo-500" />
                    <span className="truncate">
                      {booking.departmentName?.trim() || 'ไม่ระบุแผนก'}
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
      className={`group w-full min-w-0 cursor-pointer overflow-hidden rounded-lg border px-2 py-1.5 shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md ${props.typeColor}`}
    >
      <div className="flex min-w-0 items-center gap-1.5">
        <div className="hidden h-5 w-5 shrink-0 items-center justify-center rounded-md bg-white/60 sm:flex dark:bg-black/10">
          <CarFront className="h-3 w-3" />
        </div>
        <span className="min-w-0 flex-1 truncate text-[10px] font-bold sm:text-xs">
          {props.typeName}
        </span>
        <span className="flex shrink-0 items-center justify-center rounded-md bg-white/60 px-1.5 py-0.5 text-[9px] font-bold sm:text-[10px] dark:bg-black/10">
          {props.count}
          <span className="ml-0.5 hidden lg:inline">คัน</span>
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
    <div className="bg-card text-foreground overflow-hidden">
      {/* HEADER */}
      <div className="bg-linear-to-br relative overflow-hidden from-blue-600 via-indigo-600 to-violet-700 px-5 py-5 text-white sm:px-6">
        {/* DECORATION */}
        <div className="pointer-events-none absolute -right-10 -top-12 size-40 rounded-full bg-white/10 blur-2xl" />
        <div className="pointer-events-none absolute -bottom-16 left-1/3 size-32 rounded-full bg-blue-300/10 blur-2xl" />
        <div className="relative">
          {/* ACTIONS */}
          <div className="mb-5 flex items-center justify-between">
            {onBack ? (
              <button
                type="button"
                onClick={onBack}
                className="inline-flex h-9 items-center gap-2 rounded-xl border border-white/15 bg-white/10 px-3 text-xs font-semibold text-white transition hover:bg-white/20"
              >
                <ArrowLeft className="size-4" />
                ย้อนกลับ
              </button>
            ) : (
              <div />
            )}
            <button
              type="button"
              onClick={onClose}
              aria-label="ปิดรายละเอียดการจอง"
              className="flex size-9 items-center justify-center rounded-xl border border-white/15 bg-white/10 text-white transition hover:bg-white/20"
            >
              <X className="size-4.5" />
            </button>
          </div>
          {/* CAR INFORMATION */}
          <div className="flex items-center gap-3.5">
            <div className="size-13 flex shrink-0 items-center justify-center rounded-2xl border border-white/20 bg-white/15 shadow-sm">
              <CarFront className="size-6.5" />
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-[11px] font-medium text-blue-100">
                รายละเอียดการจองรถราชการ
              </p>
              <h2 className="mt-1 truncate text-lg font-bold sm:text-xl">
                {booking.carBrandSub || booking.carCode || 'ไม่ระบุชื่อรถ'}
              </h2>
              <div className="mt-1.5 flex flex-wrap items-center gap-2 text-xs text-blue-100">
                <span>
                  {booking.licensePlate
                    ? `ทะเบียน ${booking.licensePlate}`
                    : `รหัสรถ ${booking.carCode || '-'}`}
                </span>
                {booking.carCode && (
                  <span className="rounded-md bg-white/15 px-2 py-0.5 font-semibold text-white">
                    {booking.carCode}
                  </span>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
      {/* SCROLLABLE CONTENT */}
      <div className="bg-background/60 max-h-[75vh] space-y-4 overflow-y-auto p-4 sm:p-5">
        {/* STATUS + CAR TYPE */}
        <div className="flex flex-wrap items-center gap-2">
          <span className="inline-flex items-center gap-2 rounded-full border border-emerald-500/20 bg-emerald-500/10 px-3 py-1.5 text-[11px] font-bold text-emerald-600 dark:text-emerald-400">
            <span className="size-2 rounded-full bg-emerald-500" />
            อนุมัติแล้ว
          </span>
          <span
            className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-[11px] font-semibold ${getCarTypeColor(typeCarId)}`}
          >
            <CarFront className="size-3.5" />
            {booking.typeName || 'ไม่ระบุประเภทรถ'}
          </span>
        </div>
        {/* BOOKER CONTACT CARD */}
        <section className="border-border bg-card overflow-hidden rounded-2xl border shadow-sm">
          <div className="border-border bg-muted/30 flex items-center gap-3 border-b px-4 py-3.5 sm:px-5">
            <div className="flex size-9 items-center justify-center rounded-xl bg-blue-500/10 text-blue-600 dark:text-blue-400">
              <UserRound className="size-4.5" />
            </div>
            <div>
              <h3 className="text-foreground text-sm font-bold">
                ข้อมูลผู้จองรถ
              </h3>
              <p className="text-muted-foreground text-xs">
                ผู้จอง หน่วยงาน และข้อมูลติดต่อ
              </p>
            </div>
          </div>
          <div className="space-y-4 p-4 sm:p-5">
            <div className="flex items-start gap-3">
              <div className="flex size-11 shrink-0 items-center justify-center rounded-xl bg-indigo-500/10 text-indigo-600 dark:text-indigo-400">
                <UserRound className="size-5" />
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-muted-foreground text-xs">ชื่อผู้จอง</p>
                <p className="text-foreground mt-1 break-words text-sm font-bold leading-6">
                  {booking.bookingName || 'ไม่พบข้อมูลชื่อผู้จอง'}
                </p>
                {booking.userCode && (
                  <p className="text-muted-foreground mt-1 text-xs">
                    รหัสผู้จอง {booking.userCode}
                  </p>
                )}
              </div>
            </div>
            <div className="flex items-start gap-3 rounded-xl border border-blue-500/15 bg-blue-500/5 p-3">
              <div className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-blue-500/10 text-blue-600 dark:text-blue-400">
                <Building2 className="size-4.5" />
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-muted-foreground text-xs">
                  แผนก / หน่วยงานผู้จอง
                </p>
                <p className="text-foreground mt-1 break-words text-sm font-semibold leading-6">
                  {booking.departmentName?.trim() || 'ไม่ระบุแผนก'}
                </p>
              </div>
            </div>
            <div className="border-border grid grid-cols-1 gap-3 border-t pt-4 sm:grid-cols-2">
              <div className="bg-muted/40 flex min-w-0 items-start gap-3 rounded-xl p-3">
                <div className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
                  <PhoneCall className="size-4.5" />
                </div>
                <div className="min-w-0">
                  <p className="text-muted-foreground text-xs">เบอร์โทรภายใน</p>
                  <p className="text-foreground mt-1 break-all text-sm font-bold">
                    {booking.telDep || booking.departmentPhone || '-'}
                  </p>
                </div>
              </div>
              <div className="bg-muted/40 flex min-w-0 items-start gap-3 rounded-xl p-3">
                <div className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-violet-500/10 text-violet-600 dark:text-violet-400">
                  <Phone className="size-4.5" />
                </div>
                <div className="min-w-0">
                  <p className="text-muted-foreground text-xs">
                    เบอร์โทรส่วนตัว
                  </p>
                  <p className="text-foreground mt-1 break-all text-sm font-bold">
                    {booking.phone || '-'}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>
        {/* DATE + TIME */}
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          <div className="rounded-2xl border border-blue-500/15 bg-blue-500/[0.04] p-4">
            <div className="mb-3 flex items-center gap-2 text-blue-600 dark:text-blue-400">
              <CalendarDays className="size-4" />
              <span className="text-xs font-bold">วันเดินทาง</span>
            </div>
            <p className="text-foreground text-sm font-semibold leading-6">
              {startDate && endDate
                ? startDate === endDate
                  ? formatThaiDate(startDate)
                  : `${formatThaiDate(startDate)} - ${formatThaiDate(endDate)}`
                : '-'}
            </p>
          </div>
          <div className="rounded-2xl border border-indigo-500/15 bg-indigo-500/[0.04] p-4">
            <div className="mb-3 flex items-center gap-2 text-indigo-600 dark:text-indigo-400">
              <Clock3 className="size-4" />
              <span className="text-xs font-bold">เวลาเดินทาง</span>
            </div>
            <p className="text-foreground text-sm font-semibold">
              {formatTime(booking.startTime)} - {formatTime(booking.endTime)} น.
            </p>
          </div>
        </div>
        {/* TRAVEL DETAILS */}
        <div className="border-border bg-card overflow-hidden rounded-2xl border shadow-sm">
          <div className="border-border bg-muted/25 border-b px-4 py-3">
            <div className="flex items-center gap-2">
              <div className="flex size-8 items-center justify-center rounded-lg bg-indigo-500/10 text-indigo-600 dark:text-indigo-400">
                <MapPin className="size-4" />
              </div>
              <h3 className="text-foreground text-xs font-bold">
                รายละเอียดการเดินทาง
              </h3>
            </div>
          </div>
          <div className="space-y-3 p-4">
            <div className="bg-muted/30 rounded-xl p-3">
              <p className="text-muted-foreground text-[11px]">
                เรื่อง / วัตถุประสงค์
              </p>
              <p className="text-foreground mt-1 whitespace-pre-line text-sm font-semibold leading-6">
                {booking.subject || '-'}
              </p>
            </div>
            <div className="bg-muted/30 rounded-xl p-3">
              <p className="text-muted-foreground text-[11px]">
                สถานที่ / จุดหมายปลายทาง
              </p>
              <div className="mt-1 flex items-start gap-2">
                <MapPin className="mt-0.5 size-4 shrink-0 text-rose-500" />
                <p className="text-foreground whitespace-pre-line text-sm font-semibold leading-6">
                  {booking.destination || '-'}
                </p>
              </div>
            </div>
            <div className="bg-muted/30 rounded-xl p-3">
              <div className="flex items-center gap-2">
                <UsersRound className="size-4 text-blue-600 dark:text-blue-400" />
                <p className="text-muted-foreground text-xs">จำนวนผู้เดินทาง</p>
                <span className="text-foreground ml-auto text-sm font-bold">
                  {booking.countPeople ?? 0} คน
                </span>
              </div>
              {booking.listPeople?.trim() && (
                <div className="border-border mt-3 border-t pt-3">
                  <p className="text-muted-foreground mb-1.5 text-[11px] font-medium">
                    รายชื่อผู้ร่วมเดินทาง
                  </p>
                  <p className="text-foreground whitespace-pre-line text-xs leading-6">
                    {booking.listPeople}
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
function addDays(dateString: string, days: number): string {
  const [year, month, day] = dateString.split('-').map(Number);
  const date = new Date(year, month - 1, day);
  date.setDate(date.getDate() + days);
  const newYear = date.getFullYear();
  const newMonth = String(date.getMonth() + 1).padStart(2, '0');
  const newDay = String(date.getDate()).padStart(2, '0');
  return `${newYear}-${newMonth}-${newDay}`;
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
\========================================================= */
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
\========================================================= */
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
