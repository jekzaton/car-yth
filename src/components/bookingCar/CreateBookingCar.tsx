'use client';

import axios from 'axios';
import Image from 'next/image';
import { useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  ArrowLeft,
  CalendarDays,
  CarFront,
  Check,
  ChevronDown,
  Clock3,
  Loader2,
  MapPin,
  Minus,
  Phone,
  PhoneCall,
  Plus,
  Save,
  Search,
  Smartphone,
  UsersRound,
} from 'lucide-react';
import { toast } from 'react-toastify';

import { CarItem, TypeCar } from '@/types/carType';
import BookingDateTimeRange from './BookingDateTimeRange';
import FreeBookingCar from './FreeBookingCar';
import { Controller, useForm, type SubmitHandler } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';

import { bookingSchema, type BookingForm } from '@/types/bookingCarType';
import api from '@/lib/axios';
import { formatPhoneNumber } from '@/utils/formatPhone';

const urgencyOptions = [
  {
    value: 'normal',
    label: 'ปกติ',
    description: 'การเดินทางทั่วไป',
    className:
      'border-green-200 bg-green-50 text-green-700 dark:border-green-500/20 dark:bg-green-500/10 dark:text-green-300',
  },
  {
    value: 'urgent',
    label: 'ด่วน',
    description: 'ต้องการใช้งานเร่งด่วน',
    className:
      'border-yellow-200 bg-yellow-50 text-yellow-700 dark:border-yellow-500/20 dark:bg-yellow-500/10 dark:text-yellow-300',
  },
  {
    value: 'emergency',
    label: 'ฉุกเฉิน',
    description: 'กรณีจำเป็นเร่งด่วนมาก',
    className:
      'border-red-200 bg-red-50 text-red-700 dark:border-red-500/20 dark:bg-red-500/10 dark:text-red-300',
  },
] as const;

export default function CreateBookingCar() {
  const router = useRouter();

  const [availableCars, setAvailableCars] = useState<CarItem[]>([]);
  const [loadingCars, setLoadingCars] = useState(false);
  const [hasCheckedCars, setHasCheckedCars] = useState(false);
  const [carSearch, setCarSearch] = useState('');
  const [typeCars, setTypeCars] = useState<TypeCar[]>([]);

  const {
    register,
    control,
    handleSubmit,
    setValue,
    watch,
    trigger,
    formState: { errors, isSubmitting },
  } = useForm({
    resolver: zodResolver(bookingSchema),
    mode: 'onTouched',

    defaultValues: {
      startDate: '',
      startTime: '',
      endDate: '',
      endTime: '',
      typeCar: '',
      levelStatus: 'normal' as const,
      subject: '',
      destination: '',
      countPeople: 1,
      listPeople: '',
      carCode: '',
      description: '',
      telDep: '',
      phone: '',
    },
  });

  useEffect(() => {
    const loadTypeCars = async () => {
      try {
        const response = await api.get('/api/type-cars', {
          withCredentials: true,
        });

        const data = Array.isArray(response.data?.data)
          ? response.data.data
          : [];

        setTypeCars(
          data.map((item: Record<string, unknown>) => ({
            typeCarId: Number(item.typeCarId ?? item.type_car_id),
            typeName: String(item.typeName ?? item.type_name ?? ''),
          })),
        );
      } catch (error) {
        console.error('Load type cars error:', error);

        if (axios.isAxiosError(error)) {
          toast.error(
            error.response?.data?.message || 'ไม่สามารถโหลดข้อมูลประเภทรถได้',
          );
        } else {
          toast.error('เกิดข้อผิดพลาดระหว่างโหลดประเภทรถ');
        }
      }
    };

    loadTypeCars();
  }, []);

  const startDate = watch('startDate');
  const startTime = watch('startTime');
  const endDate = watch('endDate');
  const endTime = watch('endTime');
  const selectedTypeCar = watch('typeCar');
  const selectedCarCode = watch('carCode');
  const passengerCount = watch('countPeople');

  const filteredCars = useMemo(() => {
    const keyword = carSearch.trim().toLowerCase();

    if (!keyword) {
      return availableCars;
    }

    return availableCars.filter((car) => {
      return (
        car.carName?.toLowerCase().includes(keyword) ||
        car.carBrand?.toLowerCase().includes(keyword) ||
        car.carCode?.toLowerCase().includes(keyword) ||
        car.licensePlate?.toLowerCase().includes(keyword)
      );
    });
  }, [availableCars, carSearch]);

  const canCheckAvailability = useMemo(() => {
    if (!startDate || !startTime || !endDate || !endTime) {
      return false;
    }

    const start = new Date(`${startDate}T${startTime}:00`);
    const end = new Date(`${endDate}T${endTime}:00`);

    if (Number.isNaN(start.getTime()) || Number.isNaN(end.getTime())) {
      return false;
    }

    return end > start;
  }, [startDate, startTime, endDate, endTime]);

  const checkAvailableCars = async () => {
    const valid = await trigger([
      'startDate',
      'startTime',
      'endDate',
      'endTime',
    ]);

    if (!valid) {
      toast.warning('กรุณาเลือกวันและเวลาให้ครบ');
      return;
    }

    const start = new Date(`${startDate}T${startTime}:00`);
    const end = new Date(`${endDate}T${endTime}:00`);

    if (end <= start) {
      toast.warning('วันและเวลาสิ้นสุดต้องมากกว่าวันและเวลาเริ่มต้น');
      return;
    }

    try {
      setLoadingCars(true);
      setHasCheckedCars(true);

      setValue('carCode', '');

      const response = await api.get('/api/car-bookings/car-calendar-day', {
        params: {
          startDate,
          startTime,
          endDate,
          endTime,

          // ถ้ามีการเลือกประเภทแล้ว ให้ส่งไปด้วย
          ...(selectedTypeCar
            ? {
                typeCar: Number(selectedTypeCar),
              }
            : {}),

          _t: Date.now(),
        },

        withCredentials: true,
      });

      const cars = Array.isArray(response.data?.data) ? response.data.data : [];

      setAvailableCars(cars);
      setCarSearch('');

      if (cars.length === 0) {
        toast.warning('ไม่พบรถว่างในช่วงเวลาที่เลือก');
      } else {
        toast.success(`พบรถว่าง ${cars.length} คัน`);
      }
    } catch (error) {
      console.error('Check available cars error:', error);

      setAvailableCars([]);

      if (axios.isAxiosError(error)) {
        toast.error(
          error.response?.data?.message || 'ไม่สามารถตรวจสอบรถว่างได้',
        );
      } else {
        toast.error('เกิดข้อผิดพลาดระหว่างตรวจสอบรถว่าง');
      }
    } finally {
      setLoadingCars(false);
    }
  };

  useEffect(() => {
    setAvailableCars([]);
    setHasCheckedCars(false);
    setCarSearch('');
    setValue('carCode', '');
  }, [startDate, startTime, endDate, endTime, setValue]);

  const onSubmit: SubmitHandler<BookingForm> = async (data) => {
    try {
      const payload = {
        carCode: data.carCode,

        startDate: data.startDate,
        startTime: data.startTime,
        endDate: data.endDate,
        endTime: data.endTime,

        typeCar: Number(data.typeCar),

        levelStatus: data.levelStatus,

        subject: data.subject.trim(),
        destination: data.destination.trim(),

        description: data.description?.trim() || data.destination.trim(),

        countPeople: Number(data.countPeople),

        listPeople: data.listPeople?.trim() || null,

        telDep: data.telDep.trim(),

        phone: data.phone?.trim() || null,

        status: 'pending' as const,
      };

      console.log('PAYLOAD:', payload);

      const response = await api.post('/api/car-bookings', payload, {
        withCredentials: true,
      });

      toast.success(response.data?.message || 'บันทึกการจองรถเรียบร้อยแล้ว');

      router.push('/calendar');
      router.refresh();
    } catch (error) {
      console.error('Create booking error:', error);

      if (axios.isAxiosError(error)) {
        console.error('API ERROR:', error.response?.data);

        toast.error(
          error.response?.data?.message || 'ไม่สามารถบันทึกการจองรถได้',
        );
      } else {
        toast.error('เกิดข้อผิดพลาดระหว่างบันทึกการจองรถ');
      }
    }
  };

  return (
    <div className="mx-auto max-w-7xl">
      <button
        type="button"
        onClick={() => router.push('/booking-cars')}
        className="mb-5 inline-flex items-center gap-2 rounded-xl border border-gray-200 bg-white px-4 py-2 text-sm font-medium text-gray-600 shadow-sm transition hover:border-blue-200 hover:text-blue-600 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-300"
      >
        <ArrowLeft className="h-4 w-4" />
        กลับหน้ารายการจองรถ
      </button>

      <div className="overflow-hidden rounded-3xl border border-gray-200 bg-white shadow-xl dark:border-gray-800 dark:bg-gray-900">
        <div className="bg-linear-to-r relative overflow-hidden from-blue-600 via-indigo-600 to-purple-600 px-6 py-8 text-white md:px-10">
          <div className="absolute -right-16 -top-16 h-52 w-52 rounded-full bg-white/10" />
          <div className="absolute -bottom-24 left-1/3 h-48 w-48 rounded-full bg-cyan-300/10 blur-2xl" />

          <div className="relative flex items-center gap-4">
            <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-2xl bg-white/15 backdrop-blur">
              <CarFront className="h-8 w-8" />
            </div>

            <div>
              <p className="text-sm text-blue-100">Car Booking Management</p>
              <h1 className="mt-1 text-2xl font-bold">จองรถราชการ</h1>
              <p className="mt-1 text-sm text-blue-100">
                ระบุช่วงเวลา รายละเอียดการเดินทาง และเลือกรถที่ว่าง
              </p>
            </div>
          </div>
        </div>

        <form
          onSubmit={handleSubmit(onSubmit)}
          noValidate
          className="p-5 md:p-8 lg:p-10"
        >
          <div className="grid grid-cols-1 gap-8 xl:grid-cols-12">
            <div className="space-y-6 xl:col-span-7">
              <section className="dark:bg-white/3 rounded-2xl border border-gray-200 bg-gray-50/60 p-5 dark:border-gray-800">
                <BookingDateTimeRange
                  register={register}
                  errors={errors}
                  loadingCars={loadingCars}
                  canCheckAvailability={canCheckAvailability}
                  onCheckAvailability={checkAvailableCars}
                />
              </section>

              <section className="dark:bg-white/3 rounded-2xl border border-gray-200 bg-gray-50/60 p-5 dark:border-gray-800">
                <SectionTitle
                  icon={<Clock3 className="h-5 w-5" />}
                  title="รายละเอียดการเดินทาง"
                  description="ระบุความเร่งด่วน วัตถุประสงค์ และสถานที่"
                />

                <div className="mt-5">
                  <FormField
                    label="ความเร่งด่วน"
                    error={errors.levelStatus?.message}
                  >
                    <Controller
                      name="levelStatus"
                      control={control}
                      render={({ field }) => (
                        <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
                          {urgencyOptions.map((option) => {
                            const selected = field.value === option.value;

                            return (
                              <button
                                key={option.value}
                                type="button"
                                onClick={() => field.onChange(option.value)}
                                className={`relative rounded-xl border p-4 text-left transition ${
                                  selected
                                    ? `${option.className} ring-current/20 ring-2`
                                    : 'border-gray-200 bg-white text-gray-600 hover:border-blue-300 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-300'
                                }`}
                              >
                                {selected && (
                                  <span className="bg-current/10 absolute right-3 top-3 flex h-5 w-5 items-center justify-center rounded-full">
                                    <Check className="h-3.5 w-3.5" />
                                  </span>
                                )}

                                <p className="text-sm font-semibold">
                                  {option.label}
                                </p>
                                <p className="mt-1 pr-5 text-xs opacity-75">
                                  {option.description}
                                </p>
                              </button>
                            );
                          })}
                        </div>
                      )}
                    />
                  </FormField>
                </div>

                <div className="mt-5 grid grid-cols-1 gap-5 md:grid-cols-2">
                  <FormField
                    label="จองใช้รถเพื่อ"
                    error={errors.subject?.message}
                  >
                    <textarea
                      {...register('subject')}
                      rows={4}
                      placeholder="เช่น ไปประชุม รับส่งเอกสาร หรือออกพื้นที่"
                      className={getTextareaClass(Boolean(errors.subject))}
                    />
                  </FormField>

                  <FormField
                    label="สถานที่ไป"
                    error={errors.destination?.message}
                  >
                    <div className="relative">
                      <MapPin className="pointer-events-none absolute left-4 top-4 h-5 w-5 text-gray-400" />

                      <textarea
                        {...register('destination')}
                        rows={4}
                        placeholder="ระบุสถานที่หรือจังหวัดปลายทาง"
                        className={`${getTextareaClass(
                          Boolean(errors.destination),
                        )} pl-11`}
                      />
                    </div>
                  </FormField>
                </div>
                <div className="mt-5 grid grid-cols-1 gap-5 md:grid-cols-2">
                  {/* เบอร์โทรภายใน */}
                  <FormField
                    label="เบอร์โทรศัพท์ภายใน"
                    error={errors.telDep?.message}
                  >
                    <div className="relative">
                      <PhoneCall className="pointer-events-none absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-blue-500" />

                      <input
                        type="number"
                        {...register('telDep')}
                        placeholder="เช่น 1234"
                        autoComplete="off"
                        className={`h-12 w-full rounded-xl border bg-white pl-12 pr-4 text-sm text-gray-800 shadow-sm outline-none transition placeholder:text-gray-400 focus:ring-4 dark:bg-gray-900 dark:text-white ${
                          errors.telDep
                            ? 'border-red-400 focus:border-red-500 focus:ring-red-500/10'
                            : 'border-gray-200 hover:border-gray-300 focus:border-blue-500 focus:ring-blue-500/10 dark:border-gray-700'
                        } `}
                      />
                    </div>
                  </FormField>

                  {/* เบอร์โทรศัพท์ส่วนตัว */}
                  <FormField
                    label="เบอร์โทรศัพท์ส่วนตัว"
                    error={errors.phone?.message}
                  >
                    <div className="relative">
                      <Smartphone className="pointer-events-none absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-indigo-500" />

                      <input
                        type="tel"
                        inputMode="numeric"
                        value={formatPhoneNumber(watch('phone') || '')}
                        onChange={(e) => {
                          // เอาเฉพาะตัวเลข และจำกัด 10 หลัก
                          const value = e.target.value
                            .replace(/\D/g, '')
                            .slice(0, 10);

                          // เก็บใน react-hook-form เป็น 0812345678
                          setValue('phone', value, {
                            shouldValidate: true,
                            shouldDirty: true,
                          });
                        }}
                        maxLength={12}
                        placeholder="081-234-5678"
                        autoComplete="tel"
                        className={`h-12 w-full rounded-xl border bg-white pl-12 pr-4 text-sm text-gray-800 shadow-sm outline-none transition placeholder:text-gray-400 focus:ring-4 dark:bg-gray-900 dark:text-white ${
                          errors.phone
                            ? 'border-red-400 focus:border-red-500 focus:ring-red-500/10'
                            : 'border-gray-200 hover:border-gray-300 focus:border-blue-500 focus:ring-blue-500/10 dark:border-gray-700'
                        }`}
                      />
                    </div>
                  </FormField>
                </div>
              </section>

              <section className="dark:bg-white/3 rounded-2xl border border-gray-200 bg-gray-50/60 p-5 dark:border-gray-800">
                <SectionTitle
                  icon={<UsersRound className="h-5 w-5" />}
                  title="ข้อมูลผู้โดยสาร"
                  description="ระบุจำนวนและรายชื่อผู้ร่วมเดินทาง"
                />

                <div className="mt-5 grid grid-cols-1 gap-5 md:grid-cols-12">
                  <div className="md:col-span-4">
                    <FormField
                      label="จำนวนผู้โดยสาร"
                      error={errors.countPeople?.message}
                    >
                      <Controller
                        name="countPeople"
                        control={control}
                        render={({ field }) => (
                          <div className="shadow-theme-xs flex h-11 items-center overflow-hidden rounded-lg border border-gray-300 bg-white dark:border-gray-700 dark:bg-gray-900">
                            <button
                              type="button"
                              onClick={() =>
                                field.onChange(
                                  Math.max(1, Number(field.value) - 1),
                                )
                              }
                              className="flex h-full w-11 items-center justify-center text-gray-500 transition hover:bg-gray-100 dark:hover:bg-white/5"
                            >
                              <Minus className="h-4 w-4" />
                            </button>

                            <input
                              type="number"
                              min={1}
                              max={100}
                              value={field.value}
                              onChange={(event) =>
                                field.onChange(
                                  Math.max(
                                    1,
                                    Math.min(
                                      100,
                                      Number(event.target.value) || 1,
                                    ),
                                  ),
                                )
                              }
                              className="h-full min-w-0 flex-1 border-x border-gray-200 bg-transparent text-center text-sm font-semibold text-gray-800 outline-none dark:border-gray-700 dark:text-white"
                            />

                            <button
                              type="button"
                              onClick={() =>
                                field.onChange(
                                  Math.min(100, Number(field.value) + 1),
                                )
                              }
                              className="flex h-full w-11 items-center justify-center text-gray-500 transition hover:bg-gray-100 dark:hover:bg-white/5"
                            >
                              <Plus className="h-4 w-4" />
                            </button>
                          </div>
                        )}
                      />
                    </FormField>
                  </div>

                  <div className="md:col-span-8">
                    <FormField
                      label="รายชื่อผู้โดยสาร"
                      error={errors.listPeople?.message}
                    >
                      <textarea
                        {...register('listPeople')}
                        rows={5}
                        placeholder={`กรอกรายชื่อผู้โดยสาร คนละ 1 บรรทัด\nตัวอย่าง\nนายทดสอบ ระบบ\nนางสาวทดลอง โปรแกรม`}
                        className={getTextareaClass(Boolean(errors.listPeople))}
                      />
                    </FormField>
                  </div>
                </div>

                <p className="mt-3 text-xs text-gray-500 dark:text-gray-400">
                  จำนวนผู้โดยสารปัจจุบัน: {passengerCount} คน
                </p>
              </section>
            </div>

            <aside className="xl:col-span-5">
              <FreeBookingCar
                control={control}
                errors={errors}
                setValue={setValue}
                typeCars={typeCars}
                availableCars={availableCars}
                filteredCars={filteredCars}
                loadingCars={loadingCars}
                hasCheckedCars={hasCheckedCars}
                selectedCarCode={selectedCarCode}
                carSearch={carSearch}
                onCarSearchChange={setCarSearch}
              />
            </aside>
          </div>

          <div className="mt-10 flex flex-col-reverse gap-3 border-t border-gray-100 pt-6 sm:flex-row sm:justify-end dark:border-gray-800">
            <button
              type="button"
              onClick={() => router.push('/booking-cars')}
              disabled={isSubmitting}
              className="inline-flex w-full items-center justify-center rounded-xl border border-gray-300 bg-white px-6 py-3 text-sm font-semibold text-gray-700 transition hover:bg-gray-50 disabled:opacity-50 sm:w-auto dark:border-gray-700 dark:bg-gray-800 dark:text-gray-200"
            >
              ยกเลิก
            </button>

            <button
              type="submit"
              disabled={isSubmitting || loadingCars}
              className="bg-linear-to-r inline-flex w-full items-center justify-center gap-2 rounded-xl from-blue-600 to-indigo-600 px-7 py-3 text-sm font-semibold text-white shadow-lg transition hover:-translate-y-0.5 hover:shadow-xl disabled:cursor-not-allowed disabled:opacity-60 sm:w-auto"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="h-5 w-5 animate-spin" />
                  กำลังบันทึก...
                </>
              ) : (
                <>
                  <Save className="h-5 w-5" />
                  ยืนยันการจองรถ
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
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

function FormField({
  label,
  error,
  children,
}: {
  label: string;
  error?: string;
  children: React.ReactNode;
}) {
  return (
    <div>
      <label className="mb-2 block text-sm font-semibold text-gray-700 dark:text-gray-200">
        {label}
      </label>

      {children}

      {error && <p className="text-error-500 mt-1.5 text-xs">{error}</p>}
    </div>
  );
}

function EmptyCarState({
  title,
  description,
}: {
  title: string;
  description: string;
}) {
  return (
    <div className="dark:bg-white/2 flex min-h-64 items-center justify-center rounded-2xl border border-dashed border-gray-300 bg-gray-50 px-6 text-center dark:border-gray-700">
      <div>
        <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-gray-100 text-gray-400 dark:bg-gray-800">
          <CarFront className="h-7 w-7" />
        </div>

        <p className="mt-4 text-sm font-semibold text-gray-700 dark:text-gray-200">
          {title}
        </p>

        <p className="mx-auto mt-1 max-w-64 text-xs leading-5 text-gray-500 dark:text-gray-400">
          {description}
        </p>
      </div>
    </div>
  );
}

function getTextareaClass(hasError: boolean) {
  return [
    'w-full resize-none rounded-xl border bg-white px-4 py-3',
    'text-sm text-gray-800 shadow-theme-xs outline-none transition',
    'placeholder:text-gray-400 dark:bg-gray-900 dark:text-white',
    hasError
      ? 'border-error-500 focus:border-error-300 focus:ring-3 focus:ring-error-500/20'
      : 'border-gray-300 focus:border-brand-300 focus:ring-3 focus:ring-brand-500/20 dark:border-gray-700',
  ].join(' ');
}
