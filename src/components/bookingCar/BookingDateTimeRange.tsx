'use client';

import { CalendarClock, ChevronDown, Loader2, Search } from 'lucide-react';

import Input from '@/components/form/input/InputField';
import FormField from '@/components/form/FormField';

import type { FieldErrors, UseFormRegister } from 'react-hook-form';

import type { BookingForm } from '@/types/bookingCarType';

type BookingDateTimeRangeProps = {
  register: UseFormRegister<BookingForm>;
  errors: FieldErrors<BookingForm>;

  loadingCars: boolean;
  canCheckAvailability: boolean;

  onCheckAvailability: () => void;
};

const timeOptions = Array.from({ length: 48 }, (_, index) => {
  const hour = Math.floor(index / 2);
  const minute = index % 2 === 0 ? '00' : '30';

  return `${String(hour).padStart(2, '0')}:${minute}`;
});

export default function BookingDateTimeRange({
  register,
  errors,
  loadingCars,
  canCheckAvailability,
  onCheckAvailability,
}: BookingDateTimeRangeProps) {
  return (
    <>
      <SectionTitle
        icon={<CalendarClock className="h-5 w-5" />}
        title="รายละเอียดการเดินทาง"
        description="ระบุความเร่งด่วน วัตถุประสงค์ และสถานที่"
      />
      <div className="mt-5 grid grid-cols-1 gap-5 md:grid-cols-2">
        {/* START DATE */}
        <FormField label="วันเริ่มจอง" error={errors.startDate?.message}>
          <Input
            type="date"
            {...register('startDate')}
            error={Boolean(errors.startDate)}
          />
        </FormField>

        {/* START TIME */}
        <FormField label="เวลาเริ่มจอง" error={errors.startTime?.message}>
          <div className="relative">
            <select
              {...register('startTime')}
              className={`h-11 w-full appearance-none rounded-lg border bg-transparent px-4 pr-10 text-sm text-gray-800 outline-none transition ${
                errors.startTime
                  ? 'focus:ring-3 border-red-500 focus:border-red-500 focus:ring-red-500/10'
                  : 'focus:ring-3 border-gray-300 focus:border-blue-500 focus:ring-blue-500/10'
              } dark:border-gray-700 dark:bg-gray-900 dark:text-white`}
            >
              <option value="">--:--</option>

              {timeOptions.map((time) => (
                <option key={time} value={time}>
                  {time} น.
                </option>
              ))}
            </select>

            <ChevronDown className="pointer-events-none absolute right-4 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
          </div>
        </FormField>

        {/* END DATE */}
        <FormField label="ถึงวันที่" error={errors.endDate?.message}>
          <Input
            type="date"
            {...register('endDate')}
            error={Boolean(errors.endDate)}
          />
        </FormField>

        {/* END TIME */}
        <FormField label="ถึงเวลา" error={errors.endTime?.message}>
          <div className="relative">
            <select
              {...register('endTime')}
              className={`h-11 w-full appearance-none rounded-lg border bg-transparent px-4 pr-10 text-sm text-gray-800 outline-none transition ${
                errors.endTime
                  ? 'focus:ring-3 border-red-500 focus:border-red-500 focus:ring-red-500/10'
                  : 'focus:ring-3 border-gray-300 focus:border-blue-500 focus:ring-blue-500/10'
              } dark:border-gray-700 dark:bg-gray-900 dark:text-white`}
            >
              <option value="">--:--</option>

              {timeOptions.map((time) => (
                <option key={time} value={time}>
                  {time} น.
                </option>
              ))}
            </select>

            <ChevronDown className="pointer-events-none absolute right-4 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
          </div>
        </FormField>
      </div>

      {/* CHECK BUTTON */}
      <button
        type="button"
        onClick={onCheckAvailability}
        disabled={!canCheckAvailability || loadingCars}
        className="mt-5 inline-flex w-full items-center justify-center gap-2 rounded-xl bg-blue-600 px-5 py-3 text-sm font-semibold text-white shadow-md transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50 sm:w-auto"
      >
        {loadingCars ? (
          <Loader2 className="h-5 w-5 animate-spin" />
        ) : (
          <Search className="h-5 w-5" />
        )}

        {loadingCars ? 'กำลังตรวจสอบ...' : 'ตรวจสอบรถที่ว่าง'}
      </button>
    </>
  );
}

function SectionTitle({
  icon,
  title,
  description,
}: {
  icon: React.ReactNode;
  title: string;
  description: string;
}) {
  return (
    <div className="flex items-start gap-3">
      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-blue-100 text-blue-600 dark:bg-blue-500/15 dark:text-blue-300">
        {icon}
      </div>

      <div>
        <h2 className="font-semibold text-gray-900 dark:text-white">{title}</h2>
        <p className="mt-0.5 text-xs text-gray-500 dark:text-gray-400">
          {description}
        </p>
      </div>
    </div>
  );
}
