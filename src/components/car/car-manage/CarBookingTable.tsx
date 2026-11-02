'use client';

import { useRouter } from 'next/navigation';
import {
  Building2,
  CalendarDays,
  CarFront,
  ChevronRight,
  Clock3,
  Eye,
  Loader2,
  MapPin,
  Phone,
  SearchX,
  UserRound,
  UsersRound,
} from 'lucide-react';

import CarImageCell from './CarImageCell';
import DriverSelect from './DriverSelect';
import BookingStatusSelect from './BookingStatusSelect';

import type { CarBookingItem } from '@/types/bookingCarType';
import type { BookingStatus } from '@/types/carBookingType';

import { formatThaiDate, formatTime, normalizeDate } from '@/utils/formatters';
import { formatPhone } from '@/utils/formatPhone';

type BookingTableItem = CarBookingItem & {
  departmentName?: string | null;
  departmentPhone?: string | null;
  driverName?: string | null;
  driverPhone?: string | null;
  carName?: string | null;
};

interface CarBookingTableProps {
  data: BookingTableItem[];
  isLoading: boolean;
  currentPage: number;
  rowsPerPage: number;
  onDriverChange: (bookingId: number, userCode: string) => Promise<void>;
  onStatusChange: (bookingId: number, status: BookingStatus) => Promise<void>;
}

interface BookingItemProps {
  item: BookingTableItem;
  index: number;
  onDetail: () => void;
  onDriverChange: (userCode: string) => Promise<void>;
  onStatusChange: (status: BookingStatus) => Promise<void>;
}

const thClass =
  'border-b border-border bg-muted/40 px-3 py-3 text-left text-xs font-semibold text-muted-foreground';

const tdClass = 'px-3 py-3.5 align-top';

export default function CarBookingTable({
  data,
  isLoading,
  currentPage,
  rowsPerPage,
  onDriverChange,
  onStatusChange,
}: CarBookingTableProps) {
  const router = useRouter();

  const getProps = (item: BookingTableItem, index: number) => ({
    item,
    index: (currentPage - 1) * rowsPerPage + index + 1,
    onDetail: () => router.push(`/booking-cars/${item.bookingId}`),
    onDriverChange: (userCode: string) =>
      onDriverChange(item.bookingId, userCode),
    onStatusChange: (status: BookingStatus) =>
      onStatusChange(item.bookingId, status),
  });

  return (
    <section className="border-border bg-card overflow-hidden rounded-2xl border shadow-sm">
      {/* HEADER */}
      <div className="border-border flex flex-wrap items-center justify-between gap-3 border-b px-4 py-4 sm:px-5">
        <div className="flex min-w-0 items-center gap-3">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-blue-500/10 text-blue-600 dark:text-blue-400">
            <CarFront className="h-5 w-5" />
          </div>

          <div className="min-w-0">
            <h2 className="text-foreground text-sm font-bold sm:text-base">
              รายการจองยานพาหนะ
            </h2>
            <p className="text-muted-foreground text-xs">
              จัดการข้อมูลการจองและพนักงานขับรถ
            </p>
          </div>
        </div>

        <span className="border-border bg-muted/50 text-foreground rounded-lg border px-3 py-1.5 text-xs font-semibold">
          {isLoading ? '...' : data.length} รายการ
        </span>
      </div>

      {/* DESKTOP TABLE */}
      <div className="hidden xl:block">
        <div className="h-200 w-full overflow-x-auto overflow-y-auto overscroll-contain">
          <table className="min-w-300 w-full table-fixed">
            <colgroup>
              <col style={{ width: '4%' }} />
              <col style={{ width: '17%' }} />
              <col style={{ width: '18%' }} />
              <col style={{ width: '13%' }} />
              <col style={{ width: '14%' }} />
              <col style={{ width: '19%' }} />
              <col style={{ width: '10%' }} />
              <col style={{ width: '5%' }} />
            </colgroup>

            <thead className="bg-card sticky top-0 z-10 shadow-[0_1px_0_0_var(--border)]">
              <tr>
                <th className={`${thClass} text-center`}>#</th>
                <th className={thClass}>ยานพาหนะ</th>
                <th className={thClass}>ผู้จอง / แผนก</th>
                <th className={thClass}>วันเวลาเดินทาง</th>
                <th className={thClass}>รายละเอียด</th>
                <th className={thClass}>พนักงานขับรถ</th>
                <th className={`${thClass} text-center`}>สถานะ</th>
                <th className={`${thClass} text-center`}>จัดการ</th>
              </tr>
            </thead>

            <tbody className="divide-border divide-y">
              {isLoading ? (
                <StateRow loading />
              ) : data.length === 0 ? (
                <StateRow />
              ) : (
                data.map((item, index) => (
                  <DesktopRow key={item.bookingId} {...getProps(item, index)} />
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* TABLET / MOBILE CARDS */}
      <div className="xl:hidden">
        {isLoading ? (
          <StatePanel loading />
        ) : data.length === 0 ? (
          <StatePanel />
        ) : (
          <div className="grid gap-3 p-3 md:grid-cols-2 lg:p-4">
            {data.map((item, index) => (
              <MobileCard key={item.bookingId} {...getProps(item, index)} />
            ))}
          </div>
        )}
      </div>
    </section>
  );
}

// ============================================================
// DESKTOP ROW
// ============================================================

function DesktopRow(props: BookingItemProps) {
  const { item, index, onDetail, onDriverChange, onStatusChange } = props;

  return (
    <tr className="hover:bg-muted/35 transition-colors">
      <td className={`${tdClass} text-center`}>
        <span className="bg-muted inline-flex h-7 min-w-7 items-center justify-center rounded-lg px-1 text-xs font-semibold">
          {index}
        </span>
      </td>

      <td className={tdClass}>
        <CarInfo item={item} />
      </td>

      <td className={tdClass}>
        <BookerInfo item={item} />
      </td>

      <td className={tdClass}>
        <DateInfo item={item} />
      </td>

      <td className={tdClass}>
        <TravelInfo item={item} />
      </td>

      <td className={tdClass}>
        <DriverInfo item={item} onDriverChange={onDriverChange} />
      </td>

      <td className={tdClass}>
        <div className="flex justify-center">
          <BookingStatusSelect value={item.status} onChange={onStatusChange} />
        </div>
      </td>

      <td className={tdClass}>
        <button
          type="button"
          onClick={onDetail}
          aria-label={`ดูรายละเอียดการจอง ${item.bookingId}`}
          className="mx-auto flex h-9 w-9 items-center justify-center rounded-xl border border-blue-500/20 bg-blue-500/10 text-blue-600 transition hover:bg-blue-500/20 dark:text-blue-400"
          title="ดูรายละเอียด"
        >
          <Eye className="h-4 w-4" />
        </button>
      </td>
    </tr>
  );
}

// ============================================================
// MOBILE CARD
// ============================================================

function MobileCard({
  item,
  index,
  onDetail,
  onDriverChange,
  onStatusChange,
}: BookingItemProps) {
  return (
    <article className="border-border bg-card min-w-0 overflow-hidden rounded-xl border shadow-sm">
      <div className="border-border bg-muted/20 flex items-start justify-between gap-2 border-b p-3">
        <div className="min-w-0 flex-1">
          <span className="mb-2 inline-flex rounded-md bg-blue-500/10 px-2 py-1 text-[11px] font-semibold text-blue-600 dark:text-blue-400">
            รายการ #{index}
          </span>
          <CarInfo item={item} />
        </div>

        <button
          type="button"
          onClick={onDetail}
          className="border-border bg-card text-foreground hover:bg-muted flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border transition"
          aria-label="ดูรายละเอียดการจอง"
        >
          <Eye className="h-4 w-4" />
        </button>
      </div>

      <div className="space-y-4 p-3">
        <InfoSection title="ผู้จอง / แผนก">
          <BookerInfo item={item} />
        </InfoSection>

        <div className="grid gap-4 sm:grid-cols-2">
          <InfoSection title="วันเวลาเดินทาง">
            <DateInfo item={item} />
          </InfoSection>

          <InfoSection title="รายละเอียดการเดินทาง">
            <TravelInfo item={item} />
          </InfoSection>
        </div>

        <InfoSection title="พนักงานขับรถ">
          <DriverInfo item={item} onDriverChange={onDriverChange} />
        </InfoSection>

        <div className="border-border flex flex-wrap items-center justify-between gap-3 border-t pt-3">
          <BookingStatusSelect value={item.status} onChange={onStatusChange} />

          <button
            type="button"
            onClick={onDetail}
            className="inline-flex h-9 items-center gap-1.5 rounded-lg bg-blue-600 px-3 text-xs font-semibold text-white transition hover:bg-blue-700"
          >
            ดูรายละเอียด
            <ChevronRight className="h-4 w-4" />
          </button>
        </div>
      </div>
    </article>
  );
}

function InfoSection({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <section className="min-w-0">
      <p className="text-muted-foreground mb-2 text-[11px] font-semibold">
        {title}
      </p>
      {children}
    </section>
  );
}

// ============================================================
// CAR INFO
// ============================================================

function CarInfo({ item }: { item: BookingTableItem }) {
  const mainImage = getMainCarImage(item.carImage) ?? '';

  const carName =
    item.carName?.trim() || item.carBrandSub?.trim() || 'ไม่ระบุชื่อรถ';

  const carBrand = item.carBrand?.trim() || 'ไม่ระบุยี่ห้อ';
  const carCode = item.carCode?.trim() || '-';
  const licensePlate = item.licensePlate?.trim() || '-';
  const typeName = item.typeName?.trim() || 'ไม่ระบุประเภท';

  return (
    <div className="flex w-full min-w-0 items-center gap-3">
      {/* CAR IMAGE */}
      <div className="w-19 border-border bg-muted/40 relative h-16 shrink-0 overflow-hidden rounded-xl border shadow-sm">
        <div className="h-full w-full [&_img]:h-full [&_img]:w-full [&_img]:object-cover">
          <CarImageCell src={mainImage} alt={carName} />
        </div>
      </div>

      {/* CAR DETAILS */}
      <div className="min-w-0 flex-1 space-y-1">
        {/* CAR NAME */}
        <p
          className="text-foreground truncate text-[13px] font-bold leading-5"
          title={carName}
        >
          {carName}
        </p>

        {/* BRAND */}
        <p
          className="text-muted-foreground truncate text-[11px] font-medium"
          title={carBrand}
        >
          {carBrand}
        </p>

        {/* CODE + LICENSE PLATE */}
        <div className="flex min-w-0 flex-wrap items-center gap-1.5">
          <span className="inline-flex max-w-full items-center rounded-md bg-blue-500/10 px-1.5 py-0.5 text-[10px] font-semibold text-blue-600 dark:text-blue-400">
            <span className="truncate">{carCode}</span>
          </span>

          <span
            className="border-border bg-background text-foreground inline-flex max-w-full items-center rounded-md border px-1.5 py-0.5 text-[11px] font-semibold"
            title={`ทะเบียน ${licensePlate}`}
          >
            <span className="truncate">ทะเบียน : {licensePlate}</span>
          </span>
        </div>

        {/* CAR TYPE */}
        <div className="flex min-w-0 items-center gap-1 text-[10px] text-amber-600 dark:text-amber-400">
          <CarFront className="h-3 w-3 shrink-0" />
          <span className="truncate" title={typeName}>
            {typeName}
          </span>
        </div>
      </div>
    </div>
  );
}

// ============================================================
// BOOKER INFO
// ============================================================

function BookerInfo({ item }: { item: BookingTableItem }) {
  const department = item.departmentName?.trim() || 'ไม่ระบุแผนก';

  const telDep = item.telDep?.trim() || item.departmentPhone?.trim() || '-';

  return (
    <div className="flex min-w-0 items-start gap-2.5">
      <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-indigo-500/10 text-indigo-600 dark:text-indigo-400">
        <UserRound className="h-4 w-4" />
      </div>

      <div className="min-w-0 flex-1">
        <p className="text-foreground truncate text-[12px] font-semibold">
          {item.bookingName || '-'}
        </p>

        <p className="mt-0.5 text-[11px] text-indigo-600 dark:text-indigo-400">
          รหัส {item.userCode || '-'}
        </p>

        <div className="mt-1.5 flex items-start gap-1.5">
          <Building2 className="mt-0.5 h-3.5 w-3.5 shrink-0 text-blue-500" />
          <span className="text-foreground line-clamp-2 text-[11px] font-medium">
            {department}
          </span>
        </div>

        <div className="text-muted-foreground mt-1.5 flex flex-wrap items-center gap-x-3 gap-y-1 text-[10px]">
          <span>ภายใน {telDep}</span>

          {item.phone && (
            <span className="inline-flex items-center gap-1">
              <Phone className="h-3 w-3 text-emerald-500" />
              {formatPhone(item.phone)}
            </span>
          )}
        </div>
      </div>
    </div>
  );
}

// ============================================================
// DATE INFO
// ============================================================

function DateInfo({ item }: { item: BookingTableItem }) {
  const isMultipleDays =
    normalizeDate(item.startDate) !== normalizeDate(item.endDate);

  return (
    <div className="space-y-2">
      <div className="flex items-start gap-2">
        <CalendarDays className="mt-0.5 h-4 w-4 shrink-0 text-blue-500" />

        <div>
          <p className="text-foreground text-[12px] font-semibold">
            {formatThaiDate(item.startDate)}
          </p>
          <p className="text-muted-foreground text-[11px]">
            เริ่ม {formatTime(item.startTime)} น.
          </p>
        </div>
      </div>

      <div className="flex items-start gap-2">
        <Clock3 className="mt-0.5 h-4 w-4 shrink-0 text-emerald-500" />

        <div>
          <p className="text-foreground text-[12px] font-medium">
            {formatThaiDate(item.endDate)}
          </p>
          <p className="text-muted-foreground text-[11px]">
            สิ้นสุด {formatTime(item.endTime)} น.
          </p>
        </div>
      </div>

      {isMultipleDays && (
        <span className="inline-flex rounded-md bg-amber-500/10 px-2 py-0.5 text-[10px] font-medium text-amber-600 dark:text-amber-400">
          เดินทางหลายวัน
        </span>
      )}
    </div>
  );
}

// ============================================================
// TRAVEL INFO
// ============================================================

function TravelInfo({ item }: { item: BookingTableItem }) {
  return (
    <div className="space-y-2">
      <p
        className="text-foreground line-clamp-2 text-[12px] font-semibold leading-5"
        title={item.subject || ''}
      >
        {item.subject || '-'}
      </p>

      <div className="flex items-start gap-1.5">
        <MapPin className="mt-0.5 h-3.5 w-3.5 shrink-0 text-rose-500" />
        <span className="text-muted-foreground line-clamp-2 text-[11px]">
          {item.destination || '-'}
        </span>
      </div>

      <span className="bg-muted text-foreground inline-flex items-center gap-1 rounded-lg px-2 py-1 text-[11px]">
        <UsersRound className="h-3.5 w-3.5" />
        {item.countPeople ?? 0} คน
      </span>
    </div>
  );
}

// ============================================================
// DRIVER INFO
// ============================================================

function DriverInfo({
  item,
  onDriverChange,
}: {
  item: BookingTableItem;
  onDriverChange: (userCode: string) => Promise<void>;
}) {
  return (
    <div className="w-full min-w-0">
      <DriverSelect
        value={item.cUCode}
        bookingId={item.bookingId}
        startDate={String(item.startDate)}
        startTime={String(item.startTime)}
        endDate={String(item.endDate)}
        endTime={String(item.endTime)}
        driverName={item.driverName}
        driverPhone={item.driverPhone}
        onChange={onDriverChange}
      />
    </div>
  );
}

// ============================================================
// LOADING / EMPTY STATES
// ============================================================

function StateContent({ loading }: { loading?: boolean }) {
  return (
    <div className="flex flex-col items-center gap-2 py-10 text-center">
      {loading ? (
        <Loader2 className="h-7 w-7 animate-spin text-blue-500" />
      ) : (
        <SearchX className="text-muted-foreground/50 h-8 w-8" />
      )}

      <p className="text-foreground text-sm font-semibold">
        {loading ? 'กำลังโหลดรายการจองรถ...' : 'ไม่พบรายการจองรถ'}
      </p>

      {!loading && (
        <p className="text-muted-foreground text-xs">
          ลองเปลี่ยนคำค้นหาหรือสถานะ
        </p>
      )}
    </div>
  );
}

function StateRow({ loading }: { loading?: boolean }) {
  return (
    <tr>
      <td colSpan={8}>
        <StateContent loading={loading} />
      </td>
    </tr>
  );
}

function StatePanel({ loading }: { loading?: boolean }) {
  return <StateContent loading={loading} />;
}

// ============================================================
// IMAGE HELPER
// ============================================================

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
