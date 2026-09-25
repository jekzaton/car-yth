'use client';

import { BookingStatus } from '@/types/bookingCarType';
import { Check, ChevronDown, CircleCheck, Clock3, XCircle } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';

type BookingStatusSelectProps = {
  value: BookingStatus;
  disabled?: boolean;
  onChange: (status: BookingStatus) => void;
};

const statusOptions: {
  value: BookingStatus;
  label: string;
  description: string;
}[] = [
  {
    value: 'pending',
    label: 'รออนุมัติ',
    description: 'รายการกำลังรอการอนุมัติ',
  },
  {
    value: 'approved',
    label: 'อนุมัติแล้ว',
    description: 'อนุมัติการจองรถแล้ว',
  },
  {
    value: 'cancelled',
    label: 'ยกเลิก',
    description: 'ยกเลิกรายการจอง',
  },
];

export default function BookingStatusSelect({
  value,
  disabled = false,
  onChange,
}: BookingStatusSelectProps) {
  const containerRef = useRef<HTMLDivElement>(null);

  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        containerRef.current &&
        !containerRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    }

    document.addEventListener('mousedown', handleClickOutside);

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const handleSelect = (status: BookingStatus) => {
    if (status === value) {
      setIsOpen(false);
      return;
    }

    onChange(status);
    setIsOpen(false);
  };

  return (
    <div ref={containerRef} className="relative inline-block">
      {/* BUTTON */}
      <button
        type="button"
        disabled={disabled}
        onClick={() => setIsOpen((prev) => !prev)}
        className="inline-flex items-center gap-1.5 disabled:cursor-not-allowed disabled:opacity-60"
      >
        <StatusBadge status={value} />

        <ChevronDown
          className={`h-3.5 w-3.5 text-gray-400 transition-transform ${
            isOpen ? 'rotate-180' : ''
          }`}
        />
      </button>

      {/* DROPDOWN */}
      {isOpen && !disabled && (
        <div className="absolute right-0 top-full z-50 mt-2 w-64 overflow-hidden rounded-2xl border border-gray-200 bg-white p-2 shadow-xl dark:border-white/10 dark:bg-gray-900">
          <div className="px-2 pb-2 pt-1">
            <p className="text-xs font-semibold text-gray-700 dark:text-gray-200">
              เปลี่ยนสถานะ
            </p>

            <p className="mt-0.5 text-[10px] text-gray-400">
              เลือกสถานะรายการจองรถ
            </p>
          </div>

          <div className="space-y-1">
            {statusOptions.map((option) => {
              const selected = value === option.value;

              return (
                <button
                  key={option.value}
                  type="button"
                  onClick={() => handleSelect(option.value)}
                  className={`flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left transition ${
                    selected
                      ? 'bg-blue-50 dark:bg-blue-500/10'
                      : 'hover:bg-gray-50 dark:hover:bg-white/5'
                  }`}
                >
                  <StatusIcon status={option.value} />

                  <div className="min-w-0 flex-1">
                    <p className="text-xs font-semibold text-gray-800 dark:text-gray-200">
                      {option.label}
                    </p>

                    <p className="mt-0.5 text-[10px] text-gray-400">
                      {option.description}
                    </p>
                  </div>

                  {selected && (
                    <Check className="h-4 w-4 shrink-0 text-blue-600" />
                  )}
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}

/* =====================================================
   BADGE
===================================================== */

function StatusBadge({ status }: { status: BookingStatus }) {
  if (status === 'approved') {
    return (
      <span className="inline-flex items-center gap-2 whitespace-nowrap rounded-full bg-emerald-50 px-3 py-1.5 text-xs font-semibold text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-300">
        <span className="h-2 w-2 rounded-full bg-emerald-500" />
        อนุมัติแล้ว
      </span>
    );
  }

  if (status === 'cancelled') {
    return (
      <span className="inline-flex items-center gap-2 whitespace-nowrap rounded-full bg-red-50 px-3 py-1.5 text-xs font-semibold text-red-600 dark:bg-red-500/10 dark:text-red-300">
        <span className="h-2 w-2 rounded-full bg-red-500" />
        ยกเลิก
      </span>
    );
  }

  return (
    <span className="inline-flex items-center gap-2 whitespace-nowrap rounded-full bg-amber-50 px-3 py-1.5 text-xs font-semibold text-amber-700 dark:bg-amber-500/10 dark:text-amber-300">
      <span className="h-2 w-2 animate-pulse rounded-full bg-amber-500" />
      รออนุมัติ
    </span>
  );
}

/* =====================================================
   ICON
===================================================== */

function StatusIcon({ status }: { status: BookingStatus }) {
  if (status === 'approved') {
    return (
      <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600 dark:bg-emerald-500/10">
        <CircleCheck className="h-4 w-4" />
      </div>
    );
  }

  if (status === 'cancelled') {
    return (
      <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-red-50 text-red-500 dark:bg-red-500/10">
        <XCircle className="h-4 w-4" />
      </div>
    );
  }

  return (
    <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-amber-50 text-amber-600 dark:bg-amber-500/10">
      <Clock3 className="h-4 w-4" />
    </div>
  );
}
