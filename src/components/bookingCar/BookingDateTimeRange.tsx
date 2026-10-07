'use client';

import { ChevronDown, Loader2, Search } from 'lucide-react';

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
      {/* DATE / TIME */}
      <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-[1.2fr_0.8fr_1.2fr_0.8fr]">
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
          <TimeSelect
            {...register('startTime')}
            hasError={Boolean(errors.startTime)}
          />
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
          <TimeSelect
            {...register('endTime')}
            hasError={Boolean(errors.endTime)}
          />
        </FormField>
      </div>

      {/* CHECK BUTTON */}
      <div className="mt-4 flex justify-end">
        <button
          type="button"
          onClick={onCheckAvailability}
          disabled={!canCheckAvailability || loadingCars}
          className="bg-linear-to-r inline-flex h-11 w-full items-center justify-center gap-2 rounded-xl from-blue-600 to-indigo-600 px-5 text-sm font-semibold text-white shadow-md shadow-blue-500/20 transition-all hover:-translate-y-0.5 hover:shadow-lg disabled:cursor-not-allowed disabled:opacity-50 disabled:hover:translate-y-0 sm:w-auto"
        >
          {loadingCars ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <Search className="h-4 w-4" />
          )}

          {loadingCars ? 'กำลังตรวจสอบ...' : 'ตรวจสอบรถที่ว่าง'}
        </button>
      </div>
    </>
  );
}

function TimeSelect({
  hasError,
  ...props
}: React.SelectHTMLAttributes<HTMLSelectElement> & {
  hasError?: boolean;
}) {
  return (
    <div className="relative">
      <select
        {...props}
        className={`h-11 w-full appearance-none rounded-xl border bg-white px-3 pr-9 text-sm font-medium text-gray-800 shadow-sm outline-none transition-all ${
          hasError
            ? 'border-red-400 focus:border-red-500 focus:ring-4 focus:ring-red-500/10'
            : 'border-gray-200 hover:border-gray-300 focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10'
        } dark:border-gray-700 dark:bg-gray-900 dark:text-white`}
      >
        <option value="">--:--</option>

        {timeOptions.map((time) => (
          <option key={time} value={time}>
            {time} น.
          </option>
        ))}
      </select>

      <ChevronDown className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
    </div>
  );
}
