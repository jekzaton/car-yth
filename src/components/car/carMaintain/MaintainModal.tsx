'use client';

import { useCallback, useEffect, useState } from 'react';
import axios from 'axios';
import {
  CalendarDays,
  CarFront,
  LoaderCircle,
  UserRound,
  Wallet,
  WalletCards,
  Wrench,
  X,
} from 'lucide-react';
import { toast } from 'react-toastify';

import type { CarMaintainItem } from '@/types/carMaintainType';
import api from '@/lib/axios';

type CarItem = {
  carCode: string;
  carName: string;
  carBrand?: string | null;
  licensePlate?: string | null;
};

type UserItem = {
  userCode: string;
  fullName: string;
};

type MaintainModalProps = {
  isOpen: boolean;
  editingItem: CarMaintainItem | null;
  onClose: () => void;
  onSuccess: () => void;
};

type CarApiResponse = {
  success?: boolean;
  data?: CarItem[];
};

type UserApiResponse = {
  success?: boolean;
  data?: Array<{
    userCode?: string | null;
    fullName?: string | null;

    prefix?: string | null;
    firstName?: string | null;
    lastName?: string | null;
  }>;
};

type FormState = {
  carCode: string;
  userCode: string;
  dateMaintain: string;
  detailMaintain: string;
  priceMaintain: string;
};

const EMPTY_FORM: FormState = {
  carCode: '',
  userCode: '',
  dateMaintain: '',
  detailMaintain: '',
  priceMaintain: '',
};

// DATETIME LOCAL

function toDateTimeLocal(value: string | null | undefined): string {
  if (!value) return '';

  const raw = String(value).trim();

  const match = raw.match(/^(\d{4})-(\d{2})-(\d{2})[T\s](\d{2}):(\d{2})/);

  if (!match) return '';

  return `${match[1]}-${match[2]}-${match[3]}T${match[4]}:${match[5]}`;
}

// MODAL

export default function MaintainModal({
  isOpen,
  editingItem,
  onClose,
  onSuccess,
}: MaintainModalProps) {
  const isEdit = Boolean(editingItem);

  const [cars, setCars] = useState<CarItem[]>([]);
  const [users, setUsers] = useState<UserItem[]>([]);

  const [form, setForm] = useState<FormState>(EMPTY_FORM);

  const [isLoadingOptions, setIsLoadingOptions] = useState(false);

  const [isSaving, setIsSaving] = useState(false);

  const loadOptions = useCallback(async () => {
    try {
      setIsLoadingOptions(true);

      const [carResponse, userResponse] = await Promise.all([
        api.get<CarApiResponse>('/api/cars'),

        api.get<UserApiResponse>('/api/users/user-car', {
          params: {
            status: 'active',
          },
        }),
      ]);

      setCars(
        Array.isArray(carResponse.data?.data) ? carResponse.data.data : [],
      );

      const userData = Array.isArray(userResponse.data?.data)
        ? userResponse.data.data
        : [];

      setUsers(
        userData
          .map((item) => {
            const userCode = item.userCode?.trim() ?? '';

            const fullName =
              item.fullName?.trim() ||
              [item.prefix, item.firstName, item.lastName]
                .filter(Boolean)
                .join(' ');

            return {
              userCode,
              fullName: fullName || userCode,
            };
          })
          .filter((item) => item.userCode),
      );
    } catch (error) {
      console.error('Load maintain options error:', error);

      toast.error('ไม่สามารถโหลดข้อมูลรถหรือผู้ใช้งานได้');
    } finally {
      setIsLoadingOptions(false);
    }
  }, []);

  useEffect(() => {
    if (!isOpen) return;

    void loadOptions();

    if (editingItem) {
      setForm({
        carCode: editingItem.carCode ?? '',

        userCode: editingItem.userCode ?? '',

        dateMaintain: toDateTimeLocal(editingItem.dateMaintain),

        detailMaintain: editingItem.detailMaintain ?? '',

        priceMaintain: String(editingItem.priceMaintain ?? ''),
      });

      return;
    }

    setForm(EMPTY_FORM);
  }, [isOpen, editingItem, loadOptions]);

  // ESC

  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape' && !isSaving) {
        onClose();
      }
    };

    window.addEventListener('keydown', handleKeyDown);

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen, isSaving, onClose]);

  // CHANGE

  const updateField = (field: keyof FormState, value: string) => {
    setForm((current) => ({
      ...current,
      [field]: value,
    }));
  };

  // SUBMIT

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!form.carCode) {
      toast.warning('กรุณาเลือกรถยนต์');
      return;
    }

    if (!form.userCode) {
      toast.warning('กรุณาเลือกผู้ดำเนินการ');
      return;
    }

    if (!form.dateMaintain) {
      toast.warning('กรุณาระบุวันที่ซ่อมบำรุง');
      return;
    }

    if (!form.detailMaintain.trim()) {
      toast.warning('กรุณาระบุรายละเอียดการซ่อมบำรุง');
      return;
    }

    const price = Number(form.priceMaintain);

    if (!Number.isFinite(price) || price < 0) {
      toast.warning('กรุณาระบุค่าใช้จ่ายให้ถูกต้อง');
      return;
    }

    try {
      setIsSaving(true);

      const payload = {
        carCode: form.carCode,
        userCode: form.userCode,
        dateMaintain: form.dateMaintain,
        detailMaintain: form.detailMaintain,
        priceMaintain: form.priceMaintain,
      };

      if (editingItem) {
        await api.patch(`/api/cars/car-maintain/${editingItem.id}`, payload);

        toast.success('แก้ไขข้อมูลซ่อมบำรุงเรียบร้อยแล้ว');
      } else {
        await api.post('/api/cars/car-maintain', payload);

        toast.success('เพิ่มข้อมูลซ่อมบำรุงเรียบร้อยแล้ว');
      }

      onSuccess();
      onClose();
    } catch (error) {
      console.error('Save maintain error:', error);

      if (axios.isAxiosError(error)) {
        const message =
          typeof error.response?.data?.message === 'string'
            ? error.response.data.message
            : null;

        toast.error(message || 'ไม่สามารถบันทึกข้อมูลได้');

        return;
      }

      toast.error('ไม่สามารถบันทึกข้อมูลได้');
    } finally {
      setIsSaving(false);
    }
  };

  if (!isOpen) {
    return null;
  }

  console.log('tgarg', cars);

  return (
    <div className="z-99999 fixed inset-0 flex items-center justify-center p-4">
      {/* BACKDROP */}

      <button
        type="button"
        aria-label="ปิด"
        disabled={isSaving}
        onClick={onClose}
        className="absolute inset-0 cursor-default bg-black/50 backdrop-blur-[2px]"
      />

      {/* MODAL */}

      <div className="border-border bg-card text-card-foreground relative z-10 w-full max-w-2xl overflow-hidden rounded-3xl border shadow-2xl">
        {/* HEADER */}

        <div className="border-border relative overflow-hidden border-b px-5 py-5 sm:px-6">
          <div className="pointer-events-none absolute -right-16 -top-20 h-48 w-48 rounded-full bg-amber-500/15 blur-3xl" />

          <div className="relative flex items-start justify-between gap-4">
            <div className="flex items-center gap-3.5">
              <div
                className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl shadow-md"
                style={{
                  background:
                    'linear-gradient(135deg, rgb(245 158 11), rgb(249 115 22), rgb(244 63 94))',
                }}
              >
                <Wrench
                  className="h-6 w-6"
                  stroke="#ffffff"
                  strokeWidth={2.3}
                />
              </div>

              <div>
                <h2 className="text-foreground text-lg font-bold">
                  {isEdit ? 'แก้ไขข้อมูลซ่อมบำรุง' : 'เพิ่มข้อมูลซ่อมบำรุง'}
                </h2>

                <p className="text-muted-foreground mt-0.5 text-sm">
                  บันทึกประวัติการซ่อมและค่าใช้จ่ายรถยนต์
                </p>
              </div>
            </div>

            <button
              type="button"
              onClick={onClose}
              disabled={isSaving}
              className="text-muted-foreground hover:bg-muted hover:text-foreground flex h-9 w-9 shrink-0 items-center justify-center rounded-xl transition disabled:opacity-50"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
        </div>

        {/* FORM */}

        <form onSubmit={handleSubmit}>
          <div className="max-h-[70vh] space-y-5 overflow-y-auto p-5 sm:p-6">
            {isLoadingOptions && (
              <div className="flex items-center gap-2 rounded-xl border border-amber-500/20 bg-amber-500/5 px-4 py-3 text-sm text-amber-700 dark:text-amber-300">
                <LoaderCircle className="h-4 w-4 animate-spin" />
                กำลังโหลดข้อมูล...
              </div>
            )}

            {/* CAR */}

            <Field
              label="รถยนต์"
              icon={<CarFront className="h-4 w-4" />}
              required
            >
              <select
                value={form.carCode}
                onChange={(event) => updateField('carCode', event.target.value)}
                disabled={isLoadingOptions || isSaving}
                className={inputClass}
              >
                <option value="">-- เลือกรถยนต์ --</option>

                {cars.map((car) => (
                  <option key={car.carCode} value={car.carCode}>
                    {[
                      car.carName,
                      car.carBrand,
                      car.licensePlate ? `ทะเบียน ${car.licensePlate}` : null,
                      `(${car.carCode})`,
                    ]
                      .filter(Boolean)
                      .join(' • ')}
                  </option>
                ))}
              </select>
            </Field>

            {/* USER */}

            <Field
              label="ผู้ดำเนินการ"
              icon={<UserRound className="h-4 w-4" />}
              required
            >
              <select
                value={form.userCode}
                onChange={(event) =>
                  updateField('userCode', event.target.value)
                }
                disabled={isLoadingOptions || isSaving}
                className={inputClass}
              >
                <option value="">-- เลือกผู้ดำเนินการ --</option>

                {users.map((user) => (
                  <option key={user.userCode} value={user.userCode}>
                    {user.fullName} ({user.userCode})
                  </option>
                ))}
              </select>
            </Field>

            {/* DATE + PRICE */}

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              {/* DATE MAINTAIN */}

              <Field
                label="วันที่และเวลาซ่อม"
                icon={<CalendarDays className="h-4 w-4" />}
                required
              >
                <div className="relative">
                  <input
                    type="datetime-local"
                    value={form.dateMaintain}
                    onChange={(event) =>
                      updateField('dateMaintain', event.target.value)
                    }
                    disabled={isSaving}
                    className={`${inputClass} h-12!`}
                  />
                </div>
              </Field>

              {/* PRICE */}

              <Field
                label="ค่าใช้จ่าย"
                icon={<Wallet className="h-4 w-4" />}
                required
              >
                <div className="border-border bg-background group relative h-12 overflow-hidden rounded-xl border shadow-sm transition-all duration-200 focus-within:border-amber-500 focus-within:ring-4 focus-within:ring-amber-500/10 hover:border-amber-500/40">
                  <div className="flex h-full items-center">
                    {/* BAHT ICON */}

                    <div className="ml-2.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-amber-500/10 text-amber-600 dark:text-amber-300">
                      <span className="text-base font-extrabold">฿</span>
                    </div>

                    {/* PRICE INPUT */}

                    <input
                      type="text"
                      inputMode="decimal"
                      value={formatPriceInput(form.priceMaintain)}
                      onChange={(event) => {
                        const raw = event.target.value.replace(/,/g, '').trim();

                        if (/^\d*(\.\d{0,2})?$/.test(raw)) {
                          setForm((prev) => ({
                            ...prev,
                            priceMaintain: raw,
                          }));
                        }
                      }}
                      disabled={isSaving}
                      placeholder="0.00"
                      className="text-foreground placeholder:text-muted-foreground/40 h-full min-w-0 flex-1 bg-transparent px-3 text-right text-base font-bold tabular-nums outline-none placeholder:font-medium disabled:cursor-not-allowed disabled:opacity-60"
                    />

                    {/* UNIT */}

                    <div className="border-border mr-1 flex h-7 shrink-0 items-center border-l px-3">
                      <span className="text-muted-foreground text-xs font-semibold">
                        บาท
                      </span>
                    </div>
                  </div>
                </div>
              </Field>
            </div>

            {/* DETAIL */}

            <Field
              label="รายละเอียดการซ่อมบำรุง"
              icon={<Wrench className="h-4 w-4" />}
              required
            >
              <textarea
                rows={5}
                value={form.detailMaintain}
                onChange={(event) =>
                  updateField('detailMaintain', event.target.value)
                }
                disabled={isSaving}
                placeholder="เช่น เปลี่ยนน้ำมันเครื่อง, เปลี่ยนไส้กรอง, เช็กระยะ..."
                className={`${inputClass} h-auto resize-none py-3`}
              />

              <div className="text-muted-foreground mt-1.5 text-right text-[10px]">
                {form.detailMaintain.length} ตัวอักษร
              </div>
            </Field>
          </div>

          {/* FOOTER */}

          <div className="border-border bg-muted/20 flex items-center justify-end gap-2 border-t px-5 py-4 sm:px-6">
            <button
              type="button"
              onClick={onClose}
              disabled={isSaving}
              className="border-border bg-background text-foreground hover:bg-muted h-11 rounded-xl border px-5 text-sm font-semibold transition disabled:opacity-50"
            >
              ยกเลิก
            </button>

            <button
              type="submit"
              disabled={isSaving || isLoadingOptions}
              className="inline-flex h-11 min-w-32 items-center justify-center gap-2 rounded-xl px-5 text-sm font-bold text-white shadow-md transition hover:-translate-y-0.5 disabled:translate-y-0 disabled:cursor-not-allowed disabled:opacity-60"
              style={{
                background:
                  'linear-gradient(90deg, rgb(245 158 11), rgb(249 115 22), rgb(244 63 94))',
              }}
            >
              {isSaving ? (
                <>
                  <LoaderCircle
                    className="h-4 w-4 animate-spin"
                    stroke="#ffffff"
                  />
                  กำลังบันทึก
                </>
              ) : (
                <>
                  <Wrench className="h-4 w-4" stroke="#ffffff" />

                  {isEdit ? 'บันทึกการแก้ไข' : 'บันทึกข้อมูล'}
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

// FIELD

function Field({
  label,
  icon,
  required = false,
  children,
}: {
  label: string;
  icon: React.ReactNode;
  required?: boolean;
  children: React.ReactNode;
}) {
  return (
    <div>
      <label className="text-foreground mb-2 flex items-center gap-1.5 text-sm font-semibold">
        <span className="text-amber-500">{icon}</span>

        {label}

        {required && <span className="text-rose-500">*</span>}
      </label>

      {children}
    </div>
  );
}

const inputClass =
  'h-12 w-full rounded-xl border border-border bg-background px-4 text-sm font-medium text-foreground shadow-sm outline-none transition-all hover:border-amber-500/30 focus:border-amber-500 focus:ring-4 focus:ring-amber-500/10 disabled:cursor-not-allowed disabled:opacity-60';

function formatPriceInput(value: string | number | null | undefined): string {
  if (value === '' || value === null || value === undefined) {
    return '';
  }

  const raw = String(value).replace(/,/g, '');

  const [integerPart, decimalPart] = raw.split('.');

  // ใส่ comma เฉพาะส่วนจำนวนเต็ม
  const formattedInteger =
    integerPart === '' ? '' : Number(integerPart).toLocaleString('en-US');

  // สำคัญ: เก็บทศนิยมตามที่ผู้ใช้พิมพ์
  if (raw.includes('.')) {
    return `${formattedInteger}.${decimalPart ?? ''}`;
  }

  return formattedInteger;
}
