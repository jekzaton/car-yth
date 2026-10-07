'use client';

import axios from 'axios';

import { useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  ArrowLeft,
  CalendarClock,
  CarFront,
  Check,
  Clock3,
  FilePenLine,
  Loader2,
  MapPin,
  Minus,
  PhoneCall,
  Plus,
  Save,
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
        car.carBrandSub?.toLowerCase().includes(keyword) ||
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

      // console.log('PAYLOAD:', payload);

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
    <div className="mx-auto w-full max-w-6xl">
      {/* =====================================================
        BACK
    ===================================================== */}
      <button
        type="button"
        onClick={() => router.push('/booking-cars')}
        className="group mb-5 inline-flex items-center gap-2 rounded-xl border border-gray-200 bg-white px-4 py-2.5 text-sm font-medium text-gray-600 shadow-sm transition-all hover:-translate-x-0.5 hover:border-blue-200 hover:text-blue-600 hover:shadow-md dark:border-gray-700 dark:bg-gray-900 dark:text-gray-300"
      >
        <ArrowLeft className="h-4 w-4 transition-transform group-hover:-translate-x-0.5" />
        กลับหน้ารายการจองรถ
      </button>

      {/* =====================================================
        MAIN CARD
    ===================================================== */}
      <div className="overflow-hidden rounded-[28px] border border-gray-200 bg-white shadow-xl shadow-gray-200/50 dark:border-gray-800 dark:bg-gray-900 dark:shadow-none">
        {/* =====================================================
          HERO
      ===================================================== */}
        <div className="bg-linear-to-r relative overflow-hidden from-blue-600 via-indigo-600 to-violet-600 px-6 py-7 text-white sm:px-8 md:px-10">
          {/* Decorations */}
          <div className="pointer-events-none absolute -right-14 -top-20 h-56 w-56 rounded-full bg-white/10" />
          <div className="pointer-events-none absolute -bottom-20 right-1/3 h-40 w-40 rounded-full bg-cyan-300/10 blur-3xl" />
          <div className="pointer-events-none absolute left-1/3 top-0 h-32 w-32 rounded-full bg-white/5 blur-2xl" />

          <div className="relative flex items-center gap-4">
            <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl border border-white/15 bg-white/15 shadow-lg backdrop-blur-sm sm:h-16 sm:w-16">
              <CarFront className="h-7 w-7 sm:h-8 sm:w-8" />
            </div>

            <div className="min-w-0">
              <p className="text-xs font-medium text-blue-100 sm:text-sm">
                Car Booking Management
              </p>

              <h1 className="mt-0.5 text-xl font-bold tracking-tight sm:text-2xl">
                จองรถราชการ
              </h1>

              <p className="mt-1 text-xs text-blue-100 sm:text-sm">
                เลือกช่วงเวลา ตรวจสอบรถว่าง และกรอกรายละเอียดการเดินทาง
              </p>
            </div>
          </div>
        </div>

        {/* =====================================================
          FORM
      ===================================================== */}
        <form
          onSubmit={handleSubmit(onSubmit)}
          noValidate
          className="bg-gray-50/30 p-4 sm:p-6 md:p-8 dark:bg-gray-950/20"
        >
          <div className="space-y-6">
            {/* =================================================
              STEP 1 : DATE / TIME
          ================================================= */}
            <section className="overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm dark:border-gray-800 dark:bg-gray-900">
              {/* HEADER */}
              <div className="bg-linear-to-r border-b border-gray-100 from-blue-50/70 via-white to-indigo-50/40 px-4 py-3 dark:border-gray-800 dark:from-blue-500/10 dark:via-gray-900 dark:to-indigo-500/5">
                <div className="flex items-center gap-3">
                  {/* STEP */}
                  <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-blue-600 text-xs font-bold text-white shadow-sm shadow-blue-500/20">
                    1
                  </div>
                  <SectionTitle
                    icon={<CalendarClock className="h-5 w-5" />}
                    title="วันและเวลาการเดินทาง"
                    description="เลือกวันเริ่ม เวลาเริ่ม วันที่กลับ และเวลาสิ้นสุด"
                  />
                </div>
              </div>

              {/* CONTENT */}
              <div className="p-4 sm:p-5">
                <BookingDateTimeRange
                  register={register}
                  errors={errors}
                  loadingCars={loadingCars}
                  canCheckAvailability={canCheckAvailability}
                  onCheckAvailability={checkAvailableCars}
                />
              </div>
            </section>

            {/* =================================================
              STEP 2 : CAR
          ================================================= */}
            <section className="overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm dark:border-gray-800 dark:bg-gray-900">
              {/* HEADER */}
              <div className="bg-linear-to-r border-b border-gray-100 from-indigo-50/70 via-white to-violet-50/40 px-4 py-3 dark:border-gray-800 dark:from-indigo-500/10 dark:via-gray-900 dark:to-violet-500/5">
                <div className="flex items-center gap-3">
                  <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-indigo-600 text-xs font-bold text-white shadow-sm shadow-indigo-500/20">
                    2
                  </div>
                  <SectionTitle
                    icon={<FilePenLine className="h-5 w-5" />}
                    title="เลือกรถที่ต้องการ"
                    description="เลือกประเภทรถและรถที่ว่างในช่วงเวลาที่กำหนด"
                  />

                  {hasCheckedCars && (
                    <div className="ml-auto hidden items-center gap-1.5 rounded-full bg-emerald-50 px-2.5 py-1 text-[11px] font-semibold text-emerald-600 sm:flex dark:bg-emerald-500/10 dark:text-emerald-300">
                      <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
                      {availableCars.length} คัน
                    </div>
                  )}
                </div>
              </div>

              {/* CONTENT */}
              <div className="p-4 sm:p-5">
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
              </div>
            </section>

            {/* =================================================
              STEP 3 : TRAVEL DETAIL
          ================================================= */}
            <section className="overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm dark:border-gray-800 dark:bg-gray-900">
              <div className="bg-linear-to-r border-b border-gray-100 from-sky-50/80 to-blue-50/40 px-5 py-4 dark:border-gray-800 dark:from-sky-500/10 dark:to-blue-500/5">
                <div className="flex items-center gap-3">
                  <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-sky-600 text-sm font-bold text-white shadow-sm">
                    3
                  </div>

                  <SectionTitle
                    icon={<Clock3 className="h-5 w-5" />}
                    title="รายละเอียดการเดินทาง"
                    description="ระบุความเร่งด่วน วัตถุประสงค์ และสถานที่"
                  />
                </div>
              </div>

              <div className="p-5 sm:p-6">
                {/* URGENCY */}
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
                              className={`min-h-22 relative rounded-2xl border p-4 text-left transition-all duration-200 ${
                                selected
                                  ? `${option.className} ring-current/15 -translate-y-0.5 shadow-sm ring-2`
                                  : 'border-gray-200 bg-gray-50/60 text-gray-600 hover:-translate-y-0.5 hover:border-blue-300 hover:bg-white hover:shadow-sm dark:border-gray-700 dark:bg-gray-800/50 dark:text-gray-300'
                              }`}
                            >
                              {selected && (
                                <span className="bg-current/10 absolute right-3 top-3 flex h-6 w-6 items-center justify-center rounded-full">
                                  <Check className="h-3.5 w-3.5" />
                                </span>
                              )}

                              <p className="text-sm font-semibold">
                                {option.label}
                              </p>

                              <p className="mt-1 pr-6 text-xs leading-5 opacity-75">
                                {option.description}
                              </p>
                            </button>
                          );
                        })}
                      </div>
                    )}
                  />
                </FormField>

                {/* SUBJECT / DESTINATION */}
                <div className="mt-6 grid grid-cols-1 gap-5 md:grid-cols-2">
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
                      <MapPin className="pointer-events-none absolute left-4 top-4 h-5 w-5 text-blue-500" />

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

                {/* PHONE */}
                <div className="mt-5 grid grid-cols-1 gap-5 md:grid-cols-2">
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
                        className={`h-12 w-full rounded-xl border bg-white pl-12 pr-4 text-sm text-gray-800 shadow-sm outline-none transition-all focus:ring-4 dark:bg-gray-900 dark:text-white ${
                          errors.telDep
                            ? 'border-red-400 focus:border-red-500 focus:ring-red-500/10'
                            : 'border-gray-200 hover:border-gray-300 focus:border-blue-500 focus:ring-blue-500/10 dark:border-gray-700'
                        }`}
                      />
                    </div>
                  </FormField>

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
                          const value = e.target.value
                            .replace(/\D/g, '')
                            .slice(0, 10);

                          setValue('phone', value, {
                            shouldValidate: true,
                            shouldDirty: true,
                          });
                        }}
                        maxLength={12}
                        placeholder="081-234-5678"
                        autoComplete="tel"
                        className={`h-12 w-full rounded-xl border bg-white pl-12 pr-4 text-sm text-gray-800 shadow-sm outline-none transition-all focus:ring-4 dark:bg-gray-900 dark:text-white ${
                          errors.phone
                            ? 'border-red-400 focus:border-red-500 focus:ring-red-500/10'
                            : 'border-gray-200 hover:border-gray-300 focus:border-blue-500 focus:ring-blue-500/10 dark:border-gray-700'
                        }`}
                      />
                    </div>
                  </FormField>
                </div>
              </div>
            </section>

            {/* =================================================
              STEP 4 : PASSENGERS
          ================================================= */}
            <section className="overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm dark:border-gray-800 dark:bg-gray-900">
              <div className="bg-linear-to-r border-b border-gray-100 from-violet-50/80 to-purple-50/40 px-5 py-4 dark:border-gray-800 dark:from-violet-500/10 dark:to-purple-500/5">
                <div className="flex items-center gap-3">
                  <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-violet-600 text-sm font-bold text-white shadow-sm">
                    4
                  </div>

                  <SectionTitle
                    icon={<UsersRound className="h-5 w-5" />}
                    title="ข้อมูลผู้โดยสาร"
                    description="ระบุจำนวนและรายชื่อผู้ร่วมเดินทาง"
                  />
                </div>
              </div>

              <div className="p-5 sm:p-6">
                <div className="grid grid-cols-1 gap-5 md:grid-cols-12">
                  {/* COUNT */}
                  <div className="md:col-span-4">
                    <FormField
                      label="จำนวนผู้โดยสาร"
                      error={errors.countPeople?.message}
                    >
                      <Controller
                        name="countPeople"
                        control={control}
                        render={({ field }) => (
                          <div className="flex h-12 items-center overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm transition focus-within:border-blue-500 focus-within:ring-4 focus-within:ring-blue-500/10 dark:border-gray-700 dark:bg-gray-900">
                            <button
                              type="button"
                              onClick={() =>
                                field.onChange(
                                  Math.max(1, Number(field.value) - 1),
                                )
                              }
                              className="flex h-full w-12 items-center justify-center text-gray-500 transition hover:bg-gray-100 hover:text-blue-600 dark:hover:bg-white/5"
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
                              className="h-full min-w-0 flex-1 border-x border-gray-200 bg-transparent text-center text-base font-bold text-gray-900 outline-none dark:border-gray-700 dark:text-white"
                            />

                            <button
                              type="button"
                              onClick={() =>
                                field.onChange(
                                  Math.min(100, Number(field.value) + 1),
                                )
                              }
                              className="flex h-full w-12 items-center justify-center text-gray-500 transition hover:bg-gray-100 hover:text-blue-600 dark:hover:bg-white/5"
                            >
                              <Plus className="h-4 w-4" />
                            </button>
                          </div>
                        )}
                      />
                    </FormField>

                    <div className="mt-3 flex items-center gap-2 rounded-xl bg-blue-50 px-3 py-2 text-xs text-blue-600 dark:bg-blue-500/10 dark:text-blue-300">
                      <UsersRound className="h-4 w-4" />

                      <span>ผู้โดยสารทั้งหมด</span>

                      <span className="ml-auto font-bold">
                        {passengerCount} คน
                      </span>
                    </div>
                  </div>

                  {/* LIST */}
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
              </div>
            </section>
          </div>

          {/* =====================================================
            ACTION
        ===================================================== */}
          <div className="mt-8 flex flex-col-reverse gap-3 border-t border-gray-200 pt-6 sm:flex-row sm:items-center sm:justify-end dark:border-gray-800">
            <button
              type="button"
              onClick={() => router.push('/booking-cars')}
              disabled={isSubmitting}
              className="inline-flex h-12 w-full items-center justify-center rounded-xl border border-gray-200 bg-white px-6 text-sm font-semibold text-gray-600 shadow-sm transition hover:border-gray-300 hover:bg-gray-50 disabled:opacity-50 sm:w-auto dark:border-gray-700 dark:bg-gray-900 dark:text-gray-300 dark:hover:bg-gray-800"
            >
              ยกเลิก
            </button>

            <button
              type="submit"
              disabled={isSubmitting || loadingCars}
              className="bg-linear-to-r inline-flex h-12 w-full items-center justify-center gap-2 rounded-xl from-blue-600 to-indigo-600 px-7 text-sm font-semibold text-white shadow-lg shadow-blue-500/20 transition-all hover:-translate-y-0.5 hover:shadow-xl hover:shadow-blue-500/25 disabled:cursor-not-allowed disabled:opacity-60 disabled:hover:translate-y-0 sm:w-auto"
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
    <div className="flex min-w-0 items-center gap-2.5">
      <div className="text-blue-600 dark:text-blue-300">{icon}</div>

      <div className="min-w-0">
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

function getTextareaClass(hasError: boolean) {
  return [
    'w-full resize-none rounded-xl border bg-white px-4 py-3',
    'text-sm leading-6 text-gray-800 shadow-sm outline-none',
    'transition-all duration-200',
    'placeholder:text-gray-400',
    'dark:bg-gray-900 dark:text-white',
    hasError
      ? 'border-red-400 focus:border-red-500 focus:ring-4 focus:ring-red-500/10'
      : 'border-gray-200 hover:border-gray-300 focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 dark:border-gray-700',
  ].join(' ');
}
