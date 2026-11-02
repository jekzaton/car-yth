import { CarFront, X } from 'lucide-react';

interface BookingListHeaderProps {
  typeName?: string | null;
  bookingCount: number;
  onClose: () => void;
}

export default function BookingListHeader({
  typeName,
  bookingCount,
  onClose,
}: BookingListHeaderProps) {
  return (
    <div className="bg-linear-to-br relative overflow-hidden from-blue-600 via-indigo-600 to-violet-700 px-4 py-5 text-white sm:px-6 sm:py-6">
      {/* Background decoration */}
      <div className="pointer-events-none absolute -right-10 -top-12 size-36 rounded-full bg-white/10 blur-2xl" />
      <div className="pointer-events-none absolute -bottom-12 left-1/3 size-28 rounded-full bg-blue-300/10 blur-2xl" />

      {/* Close button */}
      <button
        type="button"
        onClick={onClose}
        aria-label="ปิดรายการจองรถ"
        className="absolute right-4 top-4 z-10 flex size-9 items-center justify-center rounded-xl border border-white/15 bg-white/10 text-white transition-colors hover:bg-white/20 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white"
      >
        <X className="size-4.5" />
      </button>

      {/* Header content */}
      <div className="relative flex items-center gap-3 pr-10 sm:gap-4">
        <div className="flex size-12 shrink-0 items-center justify-center rounded-2xl border border-white/20 bg-white/15 shadow-sm sm:size-14">
          <CarFront className="size-6 sm:size-7" />
        </div>

        <div className="min-w-0 flex-1">
          <p className="text-xs font-medium text-blue-100">รายการจองรถราชการ</p>

          <h2 className="mt-1 truncate text-lg font-bold tracking-tight sm:text-xl">
            {typeName?.trim() || 'รายการจองรถ'}
          </h2>

          <div className="mt-2 inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/10 px-2.5 py-1 text-xs font-medium text-white">
            <span className="size-1.5 rounded-full bg-emerald-300" />
            ทั้งหมด {bookingCount.toLocaleString('th-TH')} รายการ
          </div>
        </div>
      </div>
    </div>
  );
}
