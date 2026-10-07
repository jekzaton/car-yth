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
    <div className="space-y-5">
      {/* =====================================================
        CAR TYPE
    ===================================================== */}
      <div>
        <div className="mb-3 flex items-center justify-between gap-3">
          <div>
            <h3 className="text-sm font-semibold text-gray-900 dark:text-white">
              ประเภทรถ
            </h3>

            <p className="mt-0.5 text-[11px] text-gray-500 dark:text-gray-400">
              เลือกประเภทของรถที่ต้องการใช้งาน
            </p>
          </div>
        </div>

        <FormField label="" error={errors.typeCar?.message}>
          <Controller
            name="typeCar"
            control={control}
            render={({ field }) => (
              <>
                {typeCars.length === 0 ? (
                  <div className="rounded-xl border border-dashed border-gray-200 bg-gray-50 px-4 py-5 text-center dark:border-gray-700 dark:bg-gray-800/50">
                    <CarFront className="mx-auto h-6 w-6 text-gray-300 dark:text-gray-600" />

                    <p className="mt-2 text-xs font-medium text-gray-500">
                      ไม่พบข้อมูลประเภทรถ
                    </p>
                  </div>
                ) : (
                  <div className="grid grid-cols-2 gap-2.5 lg:grid-cols-4">
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
                          className={`min-h-14.5 relative flex items-center gap-2.5 rounded-xl border px-3 py-2.5 text-left transition-all ${
                            selected
                              ? 'border-blue-500 bg-blue-50 text-blue-700 shadow-sm ring-2 ring-blue-500/10 dark:bg-blue-500/10 dark:text-blue-300'
                              : 'border-gray-200 bg-white text-gray-600 hover:border-blue-300 hover:bg-blue-50/40 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-300'
                          }`}
                        >
                          <span
                            className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-lg ${
                              selected
                                ? 'bg-blue-600 text-white'
                                : 'bg-gray-100 text-gray-500 dark:bg-gray-800 dark:text-gray-300'
                            }`}
                          >
                            <CarFront className="h-4 w-4" />
                          </span>

                          <span className="min-w-0 flex-1 truncate text-xs font-semibold">
                            {item.typeName}
                          </span>

                          {selected && (
                            <span className="absolute right-2 top-2 flex h-5 w-5 items-center justify-center rounded-full bg-blue-600 text-white">
                              <Check className="h-3 w-3" />
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

      {/* =====================================================
        DIVIDER
    ===================================================== */}
      <div className="border-t border-gray-100 dark:border-gray-800" />

      {/* =====================================================
        AVAILABLE CARS HEADER
    ===================================================== */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-blue-50 text-blue-600 dark:bg-blue-500/10 dark:text-blue-300">
            <CarFront className="h-4 w-4" />
          </span>

          <div>
            <h3 className="text-sm font-semibold text-gray-900 dark:text-white">
              รถที่ว่าง
            </h3>

            <p className="mt-0.5 text-[11px] text-gray-500 dark:text-gray-400">
              เลือกรถที่เหมาะกับการเดินทาง
            </p>
          </div>
        </div>

        {hasCheckedCars && (
          <span
            className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[11px] font-semibold ${
              availableCars.length > 0
                ? 'bg-emerald-50 text-emerald-600 dark:bg-emerald-500/10 dark:text-emerald-300'
                : 'bg-gray-100 text-gray-500 dark:bg-gray-800 dark:text-gray-300'
            }`}
          >
            <span
              className={`h-1.5 w-1.5 rounded-full ${
                availableCars.length > 0 ? 'bg-emerald-500' : 'bg-gray-400'
              }`}
            />
            {availableCars.length} คัน
          </span>
        )}
      </div>

      {/* =====================================================
        SEARCH
    ===================================================== */}
      {availableCars.length > 0 && (
        <div className="relative">
          <Search className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />

          <input
            value={carSearch}
            onChange={(event) => onCarSearchChange(event.target.value)}
            placeholder="ค้นหารุ่นรถ ยี่ห้อ รหัสรถ หรือทะเบียน"
            className={`h-10 w-full rounded-xl border border-gray-200 bg-gray-50 pl-10 text-sm text-gray-800 outline-none transition-all placeholder:text-gray-400 focus:border-blue-400 focus:bg-white focus:ring-4 focus:ring-blue-500/10 dark:border-gray-700 dark:bg-gray-800 dark:text-white ${
              carSearch ? 'pr-10' : 'pr-4'
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

      {/* =====================================================
        CAR LIST
    ===================================================== */}
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {loadingCars ? (
          <div className="col-span-full flex min-h-40 items-center justify-center">
            <div className="text-center">
              <Loader2 className="mx-auto h-7 w-7 animate-spin text-blue-600" />

              <p className="mt-2 text-xs text-gray-500">
                กำลังตรวจสอบรถว่าง...
              </p>
            </div>
          </div>
        ) : !hasCheckedCars ? (
          <div className="col-span-full">
            <EmptyCarState
              title="ยังไม่ได้ตรวจสอบรถว่าง"
              description="เลือกประเภทรถ วันและเวลาให้ครบ แล้วกดตรวจสอบรถที่ว่าง"
            />
          </div>
        ) : filteredCars.length === 0 ? (
          <div className="col-span-full">
            <EmptyCarState
              title={carSearch ? 'ไม่พบรถที่ค้นหา' : 'ไม่พบรถว่าง'}
              description={
                carSearch
                  ? 'ลองเปลี่ยนคำค้นหาแล้วลองอีกครั้ง'
                  : 'ลองเปลี่ยนช่วงวันหรือเวลา แล้วตรวจสอบอีกครั้ง'
              }
            />
          </div>
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
                className={`group relative overflow-hidden rounded-2xl border bg-white text-left transition-all duration-200 dark:bg-gray-900 ${
                  selected
                    ? 'border-blue-500 shadow-md shadow-blue-500/10 ring-2 ring-blue-500/15'
                    : 'border-gray-200 shadow-sm hover:-translate-y-0.5 hover:border-blue-300 hover:shadow-md dark:border-gray-700'
                }`}
              >
                {/* IMAGE */}
                <div className="relative aspect-video overflow-hidden bg-gray-50 dark:bg-gray-800">
                  {mainImage ? (
                    <Image
                      src={`${process.env.NEXT_PUBLIC_BASE_PATH || ''}${mainImage}`}
                      alt={
                        `${car.carBrand || ''} ${car.carBrandSub || ''}`.trim() ||
                        'รูปรถยนต์'
                      }
                      fill
                      unoptimized
                      sizes="(max-width: 640px) 100vw, 320px"
                      className="object-contain p-2.5 transition-transform duration-300 group-hover:scale-[1.03]"
                    />
                  ) : (
                    <div className="flex h-full items-center justify-center">
                      <CarFront className="h-9 w-9 text-gray-300 dark:text-gray-600" />
                    </div>
                  )}

                  {/* AVAILABLE */}
                  <span className="absolute left-2.5 top-2.5 inline-flex items-center gap-1 rounded-full bg-emerald-500 px-2 py-1 text-[10px] font-semibold text-white shadow-sm">
                    <span className="h-1.5 w-1.5 rounded-full bg-white" />
                    ว่าง
                  </span>

                  {/* SELECT */}
                  <span
                    className={`absolute right-2.5 top-2.5 flex h-7 w-7 items-center justify-center rounded-full border-2 transition ${
                      selected
                        ? 'border-blue-600 bg-blue-600 text-white shadow-sm'
                        : 'border-gray-300 bg-white/90 text-transparent dark:border-gray-600 dark:bg-gray-900/90'
                    }`}
                  >
                    <Check className="h-3.5 w-3.5" />
                  </span>
                </div>

                {/* INFO */}
                <div className="p-3.5">
                  <h3
                    className={`truncate text-sm font-bold ${
                      selected
                        ? 'text-blue-700 dark:text-blue-300'
                        : 'text-gray-900 dark:text-white'
                    }`}
                  >
                    {[car.carBrand, car.carBrandSub]
                      .filter(Boolean)
                      .join(' ') || '-'}
                  </h3>

                  <p className="mt-1 text-[11px] text-gray-400">
                    รหัสรถ {car.carCode || '-'}
                  </p>

                  <div className="mt-3 flex items-center justify-between gap-2">
                    <span className="inline-flex rounded-lg bg-gray-100 px-3 py-1.5 text-xs font-semibold text-gray-700 dark:bg-white/10 dark:text-gray-300">
                      ทะเบียน {car.licensePlate || '-'}
                    </span>

                    {selected && (
                      <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-blue-600 dark:text-blue-300">
                        <Check className="h-3.5 w-3.5" />
                        เลือกแล้ว
                      </span>
                    )}
                  </div>
                </div>

                {/* SELECTED LINE */}
                {selected && (
                  <div className="bg-linear-to-r absolute inset-x-0 bottom-0 h-1 from-blue-500 via-indigo-500 to-violet-500" />
                )}
              </button>
            );
          })
        )}
      </div>

      {/* ERROR */}
      {errors.carCode?.message && (
        <p className="text-xs text-red-500">{errors.carCode.message}</p>
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
    <div className="flex min-h-40 flex-col items-center justify-center rounded-xl border border-dashed border-gray-200 bg-gray-50/60 px-5 py-6 text-center dark:border-gray-700 dark:bg-gray-800/40">
      <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-white text-gray-300 shadow-sm dark:bg-gray-900 dark:text-gray-600">
        <CarFront className="h-5 w-5" />
      </div>

      <p className="mt-3 text-sm font-semibold text-gray-700 dark:text-gray-200">
        {title}
      </p>

      <p className="mt-1 max-w-sm text-xs leading-5 text-gray-400">
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
