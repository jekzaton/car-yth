'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import axios from 'axios';
import {
  CalendarDays,
  CarFront,
  Droplets,
  Fuel,
  Gauge,
  LoaderCircle,
  Save,
  UserRound,
  Wallet,
  X,
} from 'lucide-react';
import { toast } from 'react-toastify';

import { CarOilItem } from '@/types/carOilType';
import api from '@/lib/axios';
import { CarItem } from '@/types/carType';
import { getTodayLocal } from '@/types/dateType';
import { formatPriceInput } from '@/utils/formatNumber';

// =========================================================
// TYPES
// =========================================================

type DriverItem = {
  id: number;
  userCode?: string | null;
  fullName: string;
  status?: 'active' | 'inactive';
};

type OilBrandItem = {
  id: number;
  oilName: string;
};

type CarOilModalProps = {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => Promise<void> | void;

  // ถ้ามีค่า = edit
  // ถ้าไม่มี = create
  editingItem?: CarOilItem | null;
};

type CarOilForm = {
  carCode: string;
  driverCode: string;
  dateOil: string;
  kmDetail: string;
  literOil: string;
  priceOil: string;
  oilType: string;
};

const initialForm: CarOilForm = {
  carCode: '',
  driverCode: '',
  dateOil: '',
  kmDetail: '',
  literOil: '',
  priceOil: '',
  oilType: '',
};

// =========================================================
// COMPONENT
// =========================================================

export default function CarOilModal({
  isOpen,
  onClose,
  onSuccess,
  editingItem = null,
}: CarOilModalProps) {
  const [form, setForm] = useState<CarOilForm>(initialForm);

  const [cars, setCars] = useState<CarItem[]>([]);
  const [drivers, setDrivers] = useState<DriverItem[]>([]);
  const [oilBrands, setOilBrands] = useState<OilBrandItem[]>([]);

  const [isLoadingOptions, setIsLoadingOptions] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  const isEdit = Boolean(editingItem);

  // =========================================================
  // SELECTED DATA
  // =========================================================

  const selectedCar = useMemo(
    () => cars.find((item) => item.carCode === form.carCode),
    [cars, form.carCode],
  );

  const selectedDriver = useMemo(
    () => drivers.find((item) => item.userCode === form.driverCode),
    [drivers, form.driverCode],
  );

  const selectedOil = useMemo(
    () => oilBrands.find((item) => String(item.id) === form.oilType),
    [oilBrands, form.oilType],
  );

  // =========================================================
  // FETCH OPTIONS
  // =========================================================

  const fetchOptions = useCallback(async () => {
    try {
      setIsLoadingOptions(true);

      const [carResponse, driverResponse, oilResponse] = await Promise.all([
        api.get('/api/cars', {
          params: {
            status: 'active',
            _t: Date.now(),
          },
        }),

        api.get('/api/users/user-car', {
          params: {
            status: 'active',
            _t: Date.now(),
          },
        }),

        api.get('/api/cars/oil-brand', {
          params: {
            _t: Date.now(),
          },
        }),
      ]);

      // ================= CARS =================

      const carData = Array.isArray(carResponse.data?.data)
        ? carResponse.data.data
        : Array.isArray(carResponse.data)
          ? carResponse.data
          : [];

      const mappedCars: CarItem[] = carData.map(
        (item: {
          id: number;
          carCode?: string;
          car_code?: string;

          carBrandSub?: string | null;
          car_brand_sub?: string | null;

          carBrand?: string | null;
          car_brand?: string | null;

          licensePlate?: string | null;
          license_plate?: string | null;

          status?: 'active' | 'inactive';
        }) => ({
          id: item.id,
          carCode: item.carCode ?? item.car_code ?? '',

          carBrandSub: item.carBrandSub ?? item.car_brand_sub ?? null,

          carBrand: item.carBrand ?? item.car_brand ?? null,

          licensePlate: item.licensePlate ?? item.license_plate ?? null,

          status: item.status,
        }),
      );

      setCars(
        mappedCars.filter(
          (item) => item.carCode && (!item.status || item.status === 'active'),
        ),
      );

      // ================= DRIVERS =================

      const driverData = Array.isArray(driverResponse.data?.data)
        ? driverResponse.data.data
        : Array.isArray(driverResponse.data)
          ? driverResponse.data
          : [];

      const mappedDrivers: DriverItem[] = driverData
        .map(
          (item: {
            id: number;
            userCode?: string | null;
            user_code?: string | null;
            fullName?: string;
            full_name?: string;
            prefix?: string;
            firstName?: string;
            first_name?: string;
            lastName?: string;
            last_name?: string;
            status?: 'active' | 'inactive';
          }) => {
            const prefix = item.prefix ?? '';
            const firstName = item.firstName ?? item.first_name ?? '';
            const lastName = item.lastName ?? item.last_name ?? '';

            const fallbackName = `${prefix}${firstName} ${lastName}`.trim();

            return {
              id: item.id,
              userCode: item.userCode ?? item.user_code ?? null,
              fullName: item.fullName ?? item.full_name ?? fallbackName ?? '',
              status: item.status,
            };
          },
        )
        .filter(
          (item: DriverItem) =>
            item.userCode && (!item.status || item.status === 'active'),
        );

      setDrivers(mappedDrivers);

      // ================= OIL BRAND =================

      const oilData = Array.isArray(oilResponse.data?.data)
        ? oilResponse.data.data
        : [];

      const mappedOilBrands: OilBrandItem[] = oilData.map(
        (item: { id: number; oilName?: string; oil_name?: string }) => ({
          id: Number(item.id),
          oilName: item.oilName ?? item.oil_name ?? '',
        }),
      );

      setOilBrands(mappedOilBrands.filter((item) => item.id && item.oilName));
    } catch (error) {
      console.error('Fetch car oil options error:', error);

      toast.error('ไม่สามารถโหลดข้อมูลสำหรับบันทึกการเติมน้ำมันได้');
    } finally {
      setIsLoadingOptions(false);
    }
  }, []);

  // =========================================================
  // OPEN MODAL
  // =========================================================

  useEffect(() => {
    if (!isOpen) return;

    void fetchOptions();
  }, [isOpen, fetchOptions]);

  // =========================================================
  // SET FORM CREATE / EDIT
  // =========================================================

  useEffect(() => {
    if (!isOpen) return;

    if (editingItem) {
      setForm({
        carCode: editingItem.carCode ?? '',
        driverCode: editingItem.driverCode ?? '',
        dateOil: toDateTimeLocal(editingItem.dateOil),
        kmDetail: String(editingItem.kmDetail ?? ''),
        literOil: String(editingItem.literOil ?? ''),
        priceOil: String(editingItem.priceOil ?? ''),

        // แก้ตรงนี้
        oilType: String(editingItem.oilTypeId ?? ''),
      });

      return;
    }

    setForm({
      ...initialForm,
      dateOil: getCurrentDateTimeLocal(),
    });
  }, [isOpen, editingItem]);
  // =========================================================
  // FORM
  // =========================================================

  const updateForm = (field: keyof CarOilForm, value: string) => {
    setForm((previous) => ({
      ...previous,
      [field]: value,
    }));
  };

  // =========================================================
  // CLOSE
  // =========================================================

  const handleClose = () => {
    if (isSaving) return;

    setForm(initialForm);
    onClose();
  };

  // =========================================================
  // SAVE
  // =========================================================

  const handleSave = async () => {
    if (!form.carCode) {
      toast.warning('กรุณาเลือกรถยนต์');
      return;
    }

    if (!form.driverCode) {
      toast.warning('กรุณาเลือกคนขับรถ');
      return;
    }

    if (!form.dateOil) {
      toast.warning('กรุณาระบุวันที่เติมน้ำมัน');
      return;
    }

    if (!form.oilType) {
      toast.warning('กรุณาเลือกประเภทน้ำมัน');
      return;
    }

    const kmDetail = Number(form.kmDetail);
    const literOil = Number(form.literOil);
    const priceOil = Number(form.priceOil);
    const oilType = Number(form.oilType);

    if (!Number.isFinite(kmDetail) || kmDetail < 0) {
      toast.warning('กรุณาระบุเลขไมล์ให้ถูกต้อง');
      return;
    }

    if (!Number.isFinite(literOil) || literOil <= 0) {
      toast.warning('กรุณาระบุจำนวนลิตรให้มากกว่า 0');
      return;
    }

    if (!Number.isFinite(priceOil) || priceOil <= 0) {
      toast.warning('กรุณาระบุจำนวนเงินให้มากกว่า 0');
      return;
    }

    if (!Number.isInteger(oilType) || oilType <= 0) {
      toast.warning('ประเภทน้ำมันไม่ถูกต้อง');
      return;
    }

    const payload = {
      carCode: form.carCode,
      cUCode: form.driverCode,
      dateOil: form.dateOil,
      kmDetail,
      literOil,
      priceOil,
      oilType,
    };

    try {
      setIsSaving(true);

      if (editingItem) {
        /*
         * ถ้า API ของคุณใช้:
         * PATCH /api/cars/car-oil/:id
         *
         * ให้ใช้ส่วนนี้
         */
        await api.patch(`/api/cars/car-oil/${editingItem.id}`, payload);

        toast.success('แก้ไขข้อมูลการเติมน้ำมันเรียบร้อยแล้ว');
      } else {
        await api.post('/api/cars/car-oil', payload);

        toast.success('บันทึกข้อมูลการเติมน้ำมันเรียบร้อยแล้ว');
      }

      /*
       * reset โดยตรงก่อน ไม่เรียก handleClose()
       * เพราะ handleClose ป้องกันการปิดตอน isSaving = true
       */
      setForm(initialForm);

      await onSuccess();

      onClose();
    } catch (error) {
      console.error('Save car oil error:', error);

      if (axios.isAxiosError(error)) {
        toast.error(
          error.response?.data?.message ||
            (isEdit
              ? 'ไม่สามารถแก้ไขข้อมูลการเติมน้ำมันได้'
              : 'ไม่สามารถบันทึกข้อมูลการเติมน้ำมันได้'),
        );

        return;
      }

      toast.error('เกิดข้อผิดพลาดในการบันทึกข้อมูล');
    } finally {
      setIsSaving(false);
    }
  };

  // =========================================================
  // HIDDEN
  // =========================================================

  if (!isOpen) return null;

  // =========================================================
  // RENDER
  // =========================================================

  return (
    <div
      className="z-999999 fixed inset-0 flex items-center justify-center bg-black/50 p-3 backdrop-blur-sm sm:p-5"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) {
          handleClose();
        }
      }}
    >
      <div className="border-border bg-card text-card-foreground flex max-h-[92vh] w-full max-w-3xl flex-col overflow-hidden rounded-3xl border shadow-2xl">
        {/* =====================================================
            HEADER
        ===================================================== */}
        <div className="border-border relative overflow-hidden border-b px-5 py-5 sm:px-6">
          <div className="pointer-events-none absolute -right-16 -top-16 h-40 w-40 rounded-full bg-amber-500/10 blur-3xl" />

          <div className="relative flex items-start justify-between gap-4">
            <div className="flex min-w-0 items-center gap-3">
              <div
                className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl text-white shadow-lg"
                style={{
                  background:
                    'linear-gradient(135deg, rgb(245 158 11), rgb(249 115 22))',
                }}
              >
                <Fuel size={21} strokeWidth={2.4} stroke="#ffffff" />
              </div>

              <div className="min-w-0">
                <h2 className="text-foreground text-base font-bold sm:text-lg">
                  {isEdit ? 'แก้ไขข้อมูลเติมน้ำมัน' : 'เพิ่มข้อมูลเติมน้ำมัน'}
                </h2>

                <p className="text-muted-foreground mt-1 text-xs">
                  บันทึกข้อมูลรถ คนขับ เลขไมล์ ปริมาณ และค่าใช้จ่าย
                </p>
              </div>
            </div>

            <button
              type="button"
              onClick={handleClose}
              disabled={isSaving}
              className="border-border bg-background text-muted-foreground hover:bg-accent hover:text-foreground flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border transition disabled:cursor-not-allowed disabled:opacity-50"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        </div>

        {/* =====================================================
            BODY
        ===================================================== */}
        <div className="custom-scrollbar flex-1 overflow-y-auto p-5 sm:p-6">
          {isLoadingOptions ? (
            <div className="flex min-h-80 flex-col items-center justify-center">
              <LoaderCircle className="h-8 w-8 animate-spin text-amber-500" />

              <p className="text-muted-foreground mt-3 text-sm">
                กำลังโหลดข้อมูล...
              </p>
            </div>
          ) : (
            <div className="space-y-6">
              {/* =================================================
                  VEHICLE
              ================================================= */}
              <Section
                icon={<CarFront className="h-4 w-4" />}
                title="ข้อมูลรถยนต์และคนขับ"
                description="เลือกรถยนต์และผู้ขับรถ"
              >
                <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                  <Field label="รถยนต์" required>
                    <select
                      value={form.carCode}
                      onChange={(event) =>
                        updateForm('carCode', event.target.value)
                      }
                      className={inputClass}
                    >
                      <option value="">เลือกรถยนต์</option>

                      {cars.map((car) => (
                        <option key={car.id} value={car.carCode}>
                          {[car.carBrand, car.carBrandSub]
                            .filter(Boolean)
                            .join(' ')}
                          {car.licensePlate ? ` • ${car.licensePlate}` : ''}
                        </option>
                      ))}
                    </select>
                  </Field>

                  <Field label="คนขับรถ" required>
                    <select
                      value={form.driverCode}
                      onChange={(event) =>
                        updateForm('driverCode', event.target.value)
                      }
                      className={inputClass}
                    >
                      <option value="">เลือกคนขับรถ</option>

                      {drivers.map((driver) => (
                        <option key={driver.id} value={driver.userCode ?? ''}>
                          {driver.fullName}
                          {driver.userCode ? ` (${driver.userCode})` : ''}
                        </option>
                      ))}
                    </select>
                  </Field>
                </div>

                {(selectedCar || selectedDriver) && (
                  <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-2">
                    {selectedCar && (
                      <div className="rounded-xl border border-blue-500/15 bg-blue-500/5 p-3">
                        <div className="flex items-start gap-2.5">
                          <CarFront className="mt-0.5 h-4 w-4 shrink-0 text-blue-500" />

                          <div className="min-w-0">
                            <p className="text-foreground truncate text-xs font-bold">
                              {[selectedCar.carBrand, selectedCar.carBrandSub]
                                .filter(Boolean)
                                .join(' ') || '-'}
                            </p>

                            <p className="text-muted-foreground mt-1 text-[11px]">
                              รหัส {selectedCar.carCode || '-'} · ทะเบียน{' '}
                              {selectedCar.licensePlate || '-'}
                            </p>
                          </div>
                        </div>
                      </div>
                    )}

                    {selectedDriver && (
                      <div className="rounded-xl border border-indigo-500/15 bg-indigo-500/5 p-3">
                        <div className="flex items-start gap-2.5">
                          <UserRound className="mt-0.5 h-4 w-4 shrink-0 text-indigo-500" />

                          <div className="min-w-0">
                            <p className="text-foreground truncate text-xs font-bold">
                              {selectedDriver.fullName}
                            </p>

                            <p className="text-muted-foreground mt-1 text-[11px]">
                              รหัส {selectedDriver.userCode || '-'}
                            </p>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </Section>

              {/* =================================================
                  OIL INFORMATION
              ================================================= */}
              <Section
                icon={<Fuel className="h-4 w-4" />}
                title="ข้อมูลการเติมน้ำมัน"
                description="ระบุวันที่ เลขไมล์ และประเภทน้ำมัน"
              >
                <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                  <Field label="วันที่ / เวลาเติมน้ำมัน" required>
                    <div className="grid grid-cols-1 gap-3 sm:grid-cols-[1.35fr_0.65fr]">
                      {/* DATE */}
                      <div>
                        <div className="relative">
                          <CalendarDays className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-amber-500" />

                          <input
                            type="date"
                            value={
                              form.dateOil ? form.dateOil.split('T')[0] : ''
                            }
                            onChange={(event) => {
                              const date = event.target.value;

                              const time = form.dateOil?.includes('T')
                                ? form.dateOil.split('T')[1]?.slice(0, 5) ||
                                  '08:00'
                                : '08:00';

                              updateForm(
                                'dateOil',
                                date ? `${date}T${time}` : '',
                              );
                            }}
                            className={`${inputClass} pl-10`}
                          />
                        </div>
                      </div>

                      {/* TIME */}
                      <div className="relative">
                        <div className="border-border bg-background flex h-11 items-center overflow-hidden rounded-xl border shadow-sm transition-all focus-within:border-amber-500 focus-within:ring-4 focus-within:ring-amber-500/10 hover:border-amber-400/60">
                          {/* HOUR */}
                          <select
                            value={
                              form.dateOil?.includes('T')
                                ? form.dateOil.split('T')[1]?.slice(0, 2) || ''
                                : ''
                            }
                            onChange={(event) => {
                              const hour = event.target.value;

                              const date = form.dateOil?.includes('T')
                                ? form.dateOil.split('T')[0]
                                : getTodayLocal();

                              const minute = form.dateOil?.includes('T')
                                ? form.dateOil.split('T')[1]?.slice(3, 5) ||
                                  '00'
                                : '00';

                              updateForm(
                                'dateOil',
                                `${date}T${hour}:${minute}`,
                              );
                            }}
                            className="text-foreground h-full flex-1 appearance-none bg-transparent px-3 text-center text-sm font-semibold outline-none"
                          >
                            {Array.from({ length: 24 }, (_, index) => {
                              const hour = String(index).padStart(2, '0');

                              return (
                                <option key={hour} value={hour}>
                                  {hour}
                                </option>
                              );
                            })}
                          </select>

                          {/* COLON */}
                          <span className="text-sm font-bold text-gray-400">
                            :
                          </span>

                          {/* MINUTE */}
                          <select
                            value={
                              form.dateOil?.includes('T')
                                ? form.dateOil.split('T')[1]?.slice(3, 5) || ''
                                : ''
                            }
                            onChange={(event) => {
                              const minute = event.target.value;

                              const date = form.dateOil?.includes('T')
                                ? form.dateOil.split('T')[0]
                                : getTodayLocal();

                              const hour = form.dateOil?.includes('T')
                                ? form.dateOil.split('T')[1]?.slice(0, 2) ||
                                  '00'
                                : '00';

                              updateForm(
                                'dateOil',
                                `${date}T${hour}:${minute}`,
                              );
                            }}
                            className="text-foreground h-full flex-1 appearance-none bg-transparent px-3 text-center text-sm font-semibold outline-none"
                          >
                            {Array.from({ length: 60 }, (_, index) => {
                              const minute = String(index).padStart(2, '0');

                              return (
                                <option key={minute} value={minute}>
                                  {minute}
                                </option>
                              );
                            })}
                          </select>

                          {/* TIME LABEL */}
                          <span className="text-muted-foreground mr-3 text-[10px]">
                            น.
                          </span>
                        </div>
                      </div>
                    </div>

                    <p className="text-muted-foreground mt-1.5 text-[10px]">
                      เลือกวันที่และเวลาที่เติมน้ำมัน
                    </p>
                  </Field>

                  <Field label="เลขไมล์ปัจจุบัน" required>
                    <div className="relative">
                      <Gauge className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-blue-500" />

                      <input
                        type="number"
                        min="0"
                        step="0.1"
                        value={form.kmDetail}
                        onChange={(event) =>
                          updateForm('kmDetail', event.target.value)
                        }
                        placeholder="เช่น 12500"
                        className={`${inputClass} pl-10 pr-14`}
                      />

                      <span className="text-muted-foreground pointer-events-none absolute right-3.5 top-1/2 -translate-y-1/2 text-xs">
                        กม.
                      </span>
                    </div>
                  </Field>

                  <Field label="ประเภทน้ำมัน" required>
                    <select
                      value={form.oilType}
                      onChange={(event) =>
                        updateForm('oilType', event.target.value)
                      }
                      className={inputClass}
                    >
                      <option value="">เลือกประเภทน้ำมัน</option>

                      {oilBrands.map((oil) => (
                        <option key={oil.id} value={String(oil.id)}>
                          {oil.oilName}
                        </option>
                      ))}
                    </select>
                  </Field>

                  <Field label="ปริมาณน้ำมัน" required>
                    <div className="relative">
                      <Droplets className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-sky-500" />

                      <input
                        type="number"
                        min="0"
                        step="0.01"
                        value={form.literOil}
                        onChange={(event) =>
                          updateForm('literOil', event.target.value)
                        }
                        placeholder="เช่น 35.50"
                        className={`${inputClass} pl-10 pr-14`}
                      />

                      <span className="text-muted-foreground pointer-events-none absolute right-3.5 top-1/2 -translate-y-1/2 text-xs">
                        ลิตร
                      </span>
                    </div>
                  </Field>

                  <div className="md:col-span-2">
                    <Field label="ค่าใช้จ่ายทั้งหมด" required>
                      <div className="relative">
                        <Wallet className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-emerald-500" />

                        <input
                          type="text"
                          inputMode="decimal"
                          value={
                            form.priceOil ? formatPriceInput(form.priceOil) : ''
                          }
                          onChange={(event) => {
                            const raw = event.target.value.replace(/,/g, '');

                            // อนุญาตเฉพาะตัวเลข และทศนิยมไม่เกิน 2 ตำแหน่ง
                            if (!/^\d*(\.\d{0,2})?$/.test(raw)) {
                              return;
                            }

                            updateForm('priceOil', raw);
                          }}
                          onBlur={() => {
                            if (!form.priceOil) return;

                            const value = Number(form.priceOil);

                            if (Number.isFinite(value)) {
                              updateForm('priceOil', value.toFixed(2));
                            }
                          }}
                          placeholder="เช่น 1,250.00"
                          className={`${inputClass} pl-10 pr-16 text-base font-semibold`}
                        />

                        <span className="text-muted-foreground pointer-events-none absolute right-3.5 top-1/2 -translate-y-1/2 text-xs font-medium">
                          บาท
                        </span>
                      </div>
                    </Field>
                  </div>
                </div>

                {/* SUMMARY */}
                {(form.literOil || form.priceOil || selectedOil) && (
                  <div className="mt-4 overflow-hidden rounded-xl border border-emerald-500/15 bg-emerald-500/5">
                    <div className="divide-border grid grid-cols-1 divide-y sm:grid-cols-3 sm:divide-x sm:divide-y-0">
                      <SummaryItem
                        label="ประเภทน้ำมัน"
                        value={selectedOil?.oilName || '-'}
                      />

                      <SummaryItem
                        label="ปริมาณ"
                        value={
                          form.literOil
                            ? `${formatNumber(Number(form.literOil))} ลิตร`
                            : '-'
                        }
                      />

                      <SummaryItem
                        label="ค่าใช้จ่าย"
                        value={
                          form.priceOil
                            ? `${formatMoney(Number(form.priceOil))} บาท`
                            : '-'
                        }
                        highlight
                      />
                    </div>
                  </div>
                )}
              </Section>
            </div>
          )}
        </div>

        {/* =====================================================
            FOOTER
        ===================================================== */}
        <div className="border-border bg-muted/30 flex flex-col-reverse gap-2 border-t px-5 py-4 sm:flex-row sm:justify-end sm:px-6">
          <button
            type="button"
            onClick={handleClose}
            disabled={isSaving}
            className="border-border bg-background text-foreground hover:bg-accent inline-flex h-11 items-center justify-center rounded-xl border px-5 text-sm font-semibold shadow-sm transition disabled:cursor-not-allowed disabled:opacity-50"
          >
            ยกเลิก
          </button>

          <button
            type="button"
            onClick={handleSave}
            disabled={isSaving || isLoadingOptions}
            className="inline-flex h-11 items-center justify-center gap-2 rounded-xl px-6 text-sm font-semibold text-white shadow-md transition hover:-translate-y-0.5 hover:shadow-lg disabled:cursor-not-allowed disabled:opacity-60 disabled:hover:translate-y-0"
            style={{
              background:
                'linear-gradient(90deg, rgb(245 158 11), rgb(249 115 22))',
              boxShadow: '0 8px 20px rgba(249,115,22,0.18)',
            }}
          >
            {isSaving ? (
              <>
                <LoaderCircle
                  size={17}
                  stroke="#ffffff"
                  className="animate-spin"
                />
                <span className="text-white">กำลังบันทึก...</span>
              </>
            ) : (
              <>
                <Save size={17} strokeWidth={2.4} stroke="#ffffff" />
                <span className="text-white">
                  {isEdit ? 'บันทึกการแก้ไข' : 'บันทึกข้อมูล'}
                </span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}

// =========================================================
// FIELD
// =========================================================

function Field({
  label,
  required = false,
  children,
}: {
  label: string;
  required?: boolean;
  children: React.ReactNode;
}) {
  return (
    <div>
      <label className="text-foreground mb-1.5 block text-xs font-semibold">
        {label}

        {required && <span className="ml-1 text-red-500">*</span>}
      </label>

      {children}
    </div>
  );
}

// =========================================================
// SECTION
// =========================================================

function Section({
  icon,
  title,
  description,
  children,
}: {
  icon: React.ReactNode;
  title: string;
  description: string;
  children: React.ReactNode;
}) {
  return (
    <section className="border-border bg-background/50 rounded-2xl border p-4 sm:p-5">
      <div className="mb-4 flex items-start gap-3">
        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-amber-500/10 text-amber-500">
          {icon}
        </div>

        <div>
          <h3 className="text-foreground text-sm font-bold">{title}</h3>

          <p className="text-muted-foreground mt-0.5 text-[11px]">
            {description}
          </p>
        </div>
      </div>

      {children}
    </section>
  );
}

// =========================================================
// SUMMARY
// =========================================================

function SummaryItem({
  label,
  value,
  highlight = false,
}: {
  label: string;
  value: string;
  highlight?: boolean;
}) {
  return (
    <div className="px-4 py-3">
      <p className="text-muted-foreground text-[10px] font-medium">{label}</p>

      <p
        className={`mt-1 text-sm font-bold ${
          highlight
            ? 'text-emerald-600 dark:text-emerald-400'
            : 'text-foreground'
        }`}
      >
        {value}
      </p>
    </div>
  );
}

// =========================================================
// CLASS
// =========================================================

const inputClass = `
  h-11 w-full rounded-xl
  border border-border
  bg-background
  px-3
  text-sm font-medium text-foreground
  shadow-sm outline-none
  transition-all duration-200
  placeholder:text-muted-foreground
  hover:border-amber-400/60
  focus:border-amber-500
  focus:ring-4 focus:ring-amber-500/10
  disabled:cursor-not-allowed
  disabled:opacity-60
`;

// =========================================================
// DATE
// =========================================================

function getCurrentDateTimeLocal() {
  const date = new Date();

  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');

  const hour = String(date.getHours()).padStart(2, '0');
  const minute = String(date.getMinutes()).padStart(2, '0');

  return `${year}-${month}-${day}T${hour}:${minute}`;
}

function toDateTimeLocal(value?: string | null) {
  if (!value) return '';

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return '';
  }

  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');

  const hour = String(date.getHours()).padStart(2, '0');
  const minute = String(date.getMinutes()).padStart(2, '0');

  return `${year}-${month}-${day}T${hour}:${minute}`;
}

// =========================================================
// NUMBER
// =========================================================

function formatNumber(value: number) {
  return new Intl.NumberFormat('th-TH', {
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  }).format(value);
}

function formatMoney(value: number) {
  return new Intl.NumberFormat('th-TH', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(value);
}
