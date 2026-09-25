'use client';

import Image from 'next/image';
import { CarFront, Check, Loader2, Search, X } from 'lucide-react';

import {
  Controller,
  type Control,
  type FieldErrors,
  type UseFormSetValue,
} from 'react-hook-form';

import FormField from '@/components/form/FormField';
import type { BookingForm } from '@/types/bookingCarType';
import { CarItem } from '@/types/carType';
import { TypeCar } from '@/types/carType';

type FreeBookingCarProps = {
  control: Control<BookingForm>;
  errors: FieldErrors<BookingForm>;
  setValue: UseFormSetValue<BookingForm>;

  typeCars: TypeCar[];

  availableCars: CarItem[];
  filteredCars: CarItem[];

  loadingCars: boolean;
  hasCheckedCars: boolean;

  selectedCarCode?: string;
  carSearch: string;

  onCarSearchChange: (value: string) => void;
};

export default function FreeBookingCar({
  control,
  errors,
  setValue,

  typeCars,

  availableCars,
  filteredCars,

  loadingCars,
  hasCheckedCars,

  selectedCarCode,
  carSearch,

  onCarSearchChange,
}: FreeBookingCarProps) {
  return (
    <div className="sticky top-24 rounded-2xl border border-gray-200 bg-white p-5 shadow-sm dark:border-gray-800 dark:bg-gray-900">
      {/* ================= CAR TYPE ================= */}
      <div>
        <FormField label="ประเภทรถ" error={errors.typeCar?.message}>
          <Controller
            name="typeCar"
            control={control}
            render={({ field }) => (
              <>
                {typeCars.length === 0 ? (
                  <div className="rounded-xl border border-dashed border-gray-300 bg-gray-50 px-4 py-6 text-center dark:border-gray-700 dark:bg-gray-800">
                    <CarFront className="mx-auto h-8 w-8 text-gray-300 dark:text-gray-600" />

                    <p className="mt-2 text-sm font-medium text-gray-600 dark:text-gray-300">
                      ไม่พบข้อมูลประเภทรถ
                    </p>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-2">
                    {typeCars.map((item) => {
                      const selected = field.value === String(item.typeCarId);

                      return (
                        <button
                          key={item.typeCarId}
                          type="button"
                          onClick={() => {
                            field.onChange(String(item.typeCarId));

                            setValue('carCode', '', {
                              shouldDirty: true,
                              shouldValidate: true,
                            });
                          }}
                          className={`relative flex min-h-20 items-center gap-3 rounded-xl border p-4 text-left transition ${
                            selected
                              ? 'border-blue-500 bg-blue-50 text-blue-700 ring-2 ring-blue-500/15 dark:bg-blue-500/10 dark:text-blue-300'
                              : 'border-gray-200 bg-white text-gray-600 hover:-translate-y-0.5 hover:border-blue-300 hover:bg-blue-50/40 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-300 dark:hover:bg-white/5'
                          }`}
                        >
                          <span
                            className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl transition ${
                              selected
                                ? 'bg-blue-600 text-white'
                                : 'bg-gray-100 text-gray-500 dark:bg-gray-800 dark:text-gray-300'
                            }`}
                          >
                            <CarFront className="h-5 w-5" />
                          </span>

                          <div className="min-w-0 pr-5">
                            <p className="truncate text-sm font-semibold">
                              {item.typeName}
                            </p>

                            {/* <p className="mt-1 text-xs opacity-70">
                              เลือกประเภทรถ
                            </p> */}
                          </div>

                          {selected && (
                            <span className="absolute right-3 top-3 flex h-6 w-6 items-center justify-center rounded-full bg-blue-600 text-white shadow-sm">
                              <Check className="h-4 w-4" />
                            </span>
                          )}
                        </button>
                      );
                    })}
                  </div>
                )}
              </>
            )}
          />
        </FormField>
      </div>

      {/* ================= DIVIDER ================= */}
      <div className="my-6 border-t border-gray-100 dark:border-gray-800" />

      {/* ================= HEADER ================= */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="flex items-center gap-2 text-base font-semibold text-gray-900 dark:text-white">
            <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-blue-50 text-blue-600 dark:bg-blue-500/10 dark:text-blue-400">
              <CarFront className="h-5 w-5" />
            </span>
            รถที่ว่าง
          </h2>

          <p className="mt-1 pl-11 text-xs text-gray-500 dark:text-gray-400">
            เลือกช่วงเวลาแล้วกดตรวจสอบรถว่าง
          </p>
        </div>

        {hasCheckedCars && (
          <span
            className={`inline-flex w-fit items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-semibold ${
              availableCars.length > 0
                ? 'bg-green-50 text-green-700 dark:bg-green-500/10 dark:text-green-300'
                : 'bg-gray-100 text-gray-500 dark:bg-gray-800 dark:text-gray-300'
            }`}
          >
            <span
              className={`h-2 w-2 rounded-full ${
                availableCars.length > 0 ? 'bg-green-500' : 'bg-gray-400'
              }`}
            />
            {availableCars.length} คัน
          </span>
        )}
      </div>

      {/* ================= SEARCH ================= */}
      {availableCars.length > 0 && (
        <div className="relative mt-5">
          <Search className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />

          <input
            value={carSearch}
            onChange={(event) => onCarSearchChange(event.target.value)}
            placeholder="ค้นหาชื่อรถ ยี่ห้อ หรือทะเบียน"
            className={`h-11 w-full rounded-xl border border-gray-200 bg-gray-50 pl-10 text-sm text-gray-800 outline-none transition placeholder:text-gray-400 focus:border-blue-400 focus:bg-white focus:ring-4 focus:ring-blue-500/10 dark:border-gray-700 dark:bg-gray-800 dark:text-white ${
              carSearch ? 'pr-11' : 'pr-4'
            }`}
          />

          {carSearch && (
            <button
              type="button"
              onClick={() => onCarSearchChange('')}
              title="ล้างการค้นหา"
              className="absolute right-2 top-1/2 flex h-7 w-7 -translate-y-1/2 items-center justify-center rounded-lg text-gray-400 transition hover:bg-red-50 hover:text-red-500 dark:hover:bg-red-500/10"
            >
              <X className="h-4 w-4" />
            </button>
          )}
        </div>
      )}

      {/* ================= CAR LIST ================= */}
      {/* <div className="mt-5 space-y-4"> */}
      <div className="mt-5 grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-1 2xl:grid-cols-3">
        {loadingCars ? (
          <div className="flex min-h-64 items-center justify-center">
            <div className="text-center">
              <Loader2 className="mx-auto h-8 w-8 animate-spin text-blue-600" />

              <p className="mt-3 text-sm text-gray-500">
                กำลังตรวจสอบรถว่าง...
              </p>
            </div>
          </div>
        ) : !hasCheckedCars ? (
          <EmptyCarState
            title="ยังไม่ได้ตรวจสอบรถว่าง"
            description="เลือกประเภทรถ วันและเวลาให้ครบ แล้วกดตรวจสอบรถที่ว่าง"
          />
        ) : filteredCars.length === 0 ? (
          <EmptyCarState
            title={carSearch ? 'ไม่พบรถที่ค้นหา' : 'ไม่พบรถว่าง'}
            description={
              carSearch
                ? 'ลองเปลี่ยนคำค้นหาแล้วลองอีกครั้ง'
                : 'ลองเปลี่ยนช่วงวันหรือเวลา แล้วตรวจสอบอีกครั้ง'
            }
          />
        ) : (
          filteredCars.map((car) => {
            const selected = selectedCarCode === car.carCode;
            const mainImage = getMainCarImage(car.carImage);

            return (
              <button
                key={car.id}
                type="button"
                onClick={() =>
                  setValue('carCode', car.carCode, {
                    shouldValidate: true,
                    shouldDirty: true,
                    shouldTouch: true,
                  })
                }
                className={`group relative w-full overflow-hidden rounded-2xl border bg-white text-left transition-all duration-300 dark:bg-gray-900 ${
                  selected
                    ? 'border-blue-500 shadow-lg shadow-blue-500/10 ring-2 ring-blue-500/15 dark:bg-blue-500/10'
                    : 'border-gray-200 shadow-sm hover:-translate-y-0.5 hover:border-blue-300 hover:shadow-lg dark:border-gray-700'
                }`}
              >
                <div className="min-h-35 flex">
                  {/* IMAGE */}
                  <div className="w-37.5 sm:w-45 relative shrink-0 overflow-hidden bg-gray-100 dark:bg-gray-800">
                    {mainImage ? (
                      <Image
                        src={mainImage}
                        alt={car.carName}
                        fill
                        sizes="180px"
                        className="object-cover transition-transform duration-500 group-hover:scale-105"
                      />
                    ) : (
                      <div className="bg-linear-to-br min-h-35 flex h-full items-center justify-center from-gray-50 to-gray-100 dark:from-gray-800 dark:to-gray-900">
                        <CarFront className="h-10 w-10 text-gray-300 dark:text-gray-600" />
                      </div>
                    )}

                    {/* overlay */}
                    <div className="bg-linear-to-t pointer-events-none absolute inset-0 from-black/20 via-transparent to-transparent" />

                    {/* AVAILABLE */}
                    <span className="absolute left-3 top-3 inline-flex items-center gap-1.5 rounded-full border border-white/20 bg-emerald-500/95 px-3 py-1 text-[11px] font-semibold text-white shadow-sm backdrop-blur">
                      <span className="h-1.5 w-1.5 rounded-full bg-white" />
                      ว่าง
                    </span>
                  </div>

                  {/* CONTENT */}
                  <div className="flex min-w-0 flex-1 flex-col p-4">
                    {/* HEADER */}
                    <div className="flex items-start justify-between gap-3">
                      <div className="min-w-0">
                        <h3
                          className={`truncate text-base font-bold ${
                            selected
                              ? 'text-blue-700 dark:text-blue-300'
                              : 'text-gray-900 dark:text-white'
                          }`}
                        >
                          {car.carName}
                        </h3>

                        <p className="mt-1 truncate text-xs font-medium text-gray-500 dark:text-gray-400">
                          {car.carBrand || '-'}
                        </p>

                        <p className="mt-0.5 text-[11px] text-gray-400">
                          รหัสรถ {car.carCode}
                        </p>
                      </div>

                      {/* RADIO */}
                      <span
                        className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full border-2 transition-all ${
                          selected
                            ? 'border-blue-600 bg-blue-600 text-white shadow-md shadow-blue-500/20'
                            : 'border-gray-200 bg-white text-transparent group-hover:border-blue-400 dark:border-gray-700 dark:bg-gray-800'
                        }`}
                      >
                        <Check className="h-4 w-4" />
                      </span>
                    </div>

                    {/* LICENSE */}
                    <div className="mt-3">
                      <div className="inline-flex items-center gap-2 rounded-xl border border-gray-100 bg-gray-50 px-3 py-2 dark:border-gray-700 dark:bg-gray-800">
                        <span className="text-[11px] text-gray-400">
                          ทะเบียน
                        </span>

                        <span className="text-sm font-bold text-gray-800 dark:text-white">
                          {car.licensePlate || '-'}
                        </span>
                      </div>
                    </div>

                    {/* ACTION */}
                    <div className="mt-auto pt-3">
                      <div
                        className={`flex h-9 w-full items-center justify-center gap-2 rounded-xl text-xs font-semibold transition-all ${
                          selected
                            ? 'bg-blue-600 text-white shadow-md shadow-blue-500/20'
                            : 'bg-blue-50 text-blue-600 group-hover:bg-blue-600 group-hover:text-white dark:bg-blue-500/10 dark:text-blue-300'
                        }`}
                      >
                        {selected ? (
                          <>
                            <Check className="h-4 w-4" />
                            เลือกรถคันนี้แล้ว
                          </>
                        ) : (
                          <>
                            <CarFront className="h-4 w-4" />
                            เลือกรถคันนี้
                          </>
                        )}
                      </div>
                    </div>
                  </div>
                </div>

                {/* SELECTED ACCENT */}
                {selected && (
                  <div className="bg-linear-to-r absolute inset-x-0 bottom-0 h-1 from-blue-500 via-indigo-500 to-purple-500" />
                )}
              </button>
            );
          })
        )}
      </div>

      {/* ================= CAR ERROR ================= */}
      {errors.carCode?.message && (
        <p className="mt-4 text-xs text-red-500">{errors.carCode.message}</p>
      )}
    </div>
  );
}

// ================= EMPTY STATE =================
function EmptyCarState({
  title,
  description,
}: {
  title: string;
  description: string;
}) {
  return (
    <div className="flex min-h-64 flex-col items-center justify-center rounded-2xl border border-dashed border-gray-200 bg-gray-50/70 px-6 text-center dark:border-gray-700 dark:bg-gray-800/50">
      <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-white text-gray-300 shadow-sm dark:bg-gray-900 dark:text-gray-600">
        <CarFront className="h-8 w-8" />
      </div>

      <p className="mt-4 font-semibold text-gray-700 dark:text-gray-200">
        {title}
      </p>

      <p className="mt-1 max-w-xs text-sm leading-6 text-gray-400">
        {description}
      </p>
    </div>
  );
}

// ================= GET MAIN IMAGE =================
function getMainCarImage(carImage?: string | null): string | null {
  if (!carImage) return null;

  try {
    const parsed: unknown = JSON.parse(carImage);

    // แบบ { main, images }
    if (parsed && typeof parsed === 'object' && !Array.isArray(parsed)) {
      const data = parsed as {
        main?: unknown;
        images?: unknown;
      };

      if (typeof data.main === 'string' && data.main.trim()) {
        return data.main;
      }

      if (Array.isArray(data.images) && typeof data.images[0] === 'string') {
        return data.images[0];
      }
    }

    // แบบ array เก่า
    if (Array.isArray(parsed) && typeof parsed[0] === 'string') {
      return parsed[0];
    }
  } catch {
    // กรณีเก็บ path ตรง ๆ
    if (
      carImage.startsWith('/') ||
      carImage.startsWith('http://') ||
      carImage.startsWith('https://')
    ) {
      return carImage;
    }
  }

  return null;
}
