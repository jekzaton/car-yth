'use client';

import { useCallback, useEffect, useState } from 'react';
import axios from 'axios';
import {
  CalendarDays,
  CarFront,
  LoaderCircle,
  UserRound,
  Wallet,
  Wrench,
  X,
} from 'lucide-react';
import { toast } from 'react-toastify';

import type { CarMaintainItem } from '@/types/carMaintainType';
import api from '@/lib/axios';
import { CarItem } from '@/types/carType';
import {
  getDatePart,
  getTimePart,
  mergeDateTime,
  timeOptions,
} from '@/utils/dateTime';

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
  const [userSearch, setUserSearch] = useState('');
  const [showUserDropdown, setShowUserDropdown] = useState(false);

  const filteredUsers = users.filter((user) => {
    const keyword = userSearch.trim().toLowerCase();

    if (!keyword) return true;

    return (
      user.fullName.toLowerCase().includes(keyword) ||
      user.userCode.toLowerCase().includes(keyword)
    );
  });

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
    if (!editingItem || users.length === 0) return;

    const selectedUser = users.find(
      (user) => user.userCode === editingItem.userCode,
    );

    if (selectedUser) {
      setUserSearch(`${selectedUser.fullName} (${selectedUser.userCode})`);
    }
  }, [editingItem, users]);

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
    setUserSearch('');
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

      <div className="relative z-10 w-full max-w-2xl overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-2xl dark:border-gray-800 dark:bg-gray-900">
        {/* HEADER */}
        <div className="bg-linear-to-r relative overflow-hidden border-b border-gray-100 from-amber-50/80 via-white to-orange-50/60 px-5 py-4 dark:border-gray-800 dark:from-amber-500/10 dark:via-gray-900 dark:to-orange-500/10">
          <div className="pointer-events-none absolute -right-10 -top-10 h-32 w-32 rounded-full bg-orange-400/10 blur-3xl" />

          <div className="relative flex items-center justify-between gap-4">
            <div className="flex min-w-0 items-center gap-3">
              <div className="bg-linear-to-br flex h-10 w-10 shrink-0 items-center justify-center rounded-xl from-amber-500 to-orange-500 text-white shadow-sm shadow-orange-500/20">
                <Wrench className="h-5 w-5" />
              </div>

              <div className="min-w-0">
                <div className="flex flex-wrap items-center gap-2">
                  <h2 className="text-base font-bold text-gray-900 dark:text-white">
                    {isEdit ? 'แก้ไขข้อมูลซ่อมบำรุง' : 'เพิ่มข้อมูลซ่อมบำรุง'}
                  </h2>

                  <span
                    className={`rounded-full px-2.5 py-1 text-[10px] font-semibold ${
                      isEdit
                        ? 'bg-blue-50 text-blue-600 dark:bg-blue-500/10 dark:text-blue-300'
                        : 'bg-amber-100 text-amber-700 dark:bg-amber-500/10 dark:text-amber-300'
                    }`}
                  >
                    {isEdit ? 'แก้ไขข้อมูล' : 'รายการใหม่'}
                  </span>
                </div>

                <p className="mt-0.5 text-[11px] text-gray-500 dark:text-gray-400">
                  บันทึกประวัติการซ่อมบำรุงและค่าใช้จ่ายของรถยนต์
                </p>
              </div>
            </div>

            <button
              type="button"
              onClick={onClose}
              disabled={isSaving}
              className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl text-gray-400 transition hover:bg-gray-100 hover:text-gray-700 disabled:opacity-50 dark:hover:bg-white/10 dark:hover:text-white"
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
                      [car.carBrand, car.carBrandSub].filter(Boolean).join(' '),

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
              <div className="relative">
                {/* SEARCH INPUT */}
                <div className="relative">
                  <UserRound className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />

                  <input
                    type="text"
                    value={userSearch}
                    onChange={(event) => {
                      setUserSearch(event.target.value);
                      setShowUserDropdown(true);

                      // ถ้าพิมพ์ใหม่ ให้ล้าง user เดิม
                      updateField('userCode', '');
                    }}
                    onFocus={() => setShowUserDropdown(true)}
                    disabled={isLoadingOptions || isSaving}
                    placeholder="ค้นหาชื่อ หรือรหัสผู้ดำเนินการ..."
                    autoComplete="off"
                    className={`${inputClass} pl-10 pr-10`}
                  />

                  {userSearch && (
                    <button
                      type="button"
                      onClick={() => {
                        setUserSearch('');
                        updateField('userCode', '');
                        setShowUserDropdown(true);
                      }}
                      className="absolute right-3 top-1/2 flex h-6 w-6 -translate-y-1/2 items-center justify-center rounded-md text-gray-400 transition hover:bg-gray-100 hover:text-gray-600 dark:hover:bg-white/10"
                    >
                      <X className="h-3.5 w-3.5" />
                    </button>
                  )}
                </div>

                {/* DROPDOWN */}
                {showUserDropdown && !isLoadingOptions && (
                  <div className="absolute z-50 mt-2 max-h-64 w-full overflow-y-auto rounded-xl border border-gray-200 bg-white p-1.5 shadow-xl dark:border-gray-700 dark:bg-gray-900">
                    {filteredUsers.length === 0 ? (
                      <div className="px-4 py-6 text-center">
                        <UserRound className="mx-auto h-6 w-6 text-gray-300" />

                        <p className="mt-2 text-xs text-gray-400">
                          ไม่พบผู้ดำเนินการ
                        </p>
                      </div>
                    ) : (
                      filteredUsers.map((user) => {
                        const selected = form.userCode === user.userCode;

                        return (
                          <button
                            key={user.userCode}
                            type="button"
                            onClick={() => {
                              updateField('userCode', user.userCode);

                              setUserSearch(
                                `${user.fullName} (${user.userCode})`,
                              );

                              setShowUserDropdown(false);
                            }}
                            className={`flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-left transition ${
                              selected
                                ? 'bg-amber-50 text-amber-700 dark:bg-amber-500/10 dark:text-amber-300'
                                : 'text-gray-700 hover:bg-gray-50 dark:text-gray-300 dark:hover:bg-white/5'
                            }`}
                          >
                            <div
                              className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-lg ${
                                selected
                                  ? 'bg-amber-500 text-white'
                                  : 'bg-gray-100 text-gray-500 dark:bg-gray-800'
                              }`}
                            >
                              <UserRound className="h-4 w-4" />
                            </div>

                            <div className="min-w-0 flex-1">
                              <p className="truncate text-sm font-semibold">
                                {user.fullName}
                              </p>

                              <p className="mt-0.5 text-[10px] text-gray-400">
                                รหัส {user.userCode}
                              </p>
                            </div>

                            {selected && (
                              <span className="text-xs font-semibold text-amber-600">
                                เลือกแล้ว
                              </span>
                            )}
                          </button>
                        );
                      })
                    )}
                  </div>
                )}
              </div>
            </Field>

            {/* DATE + PRICE */}

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              {/* DATE MAINTAIN */}

              <Field
                label="วันที่และเวลาซ่อม"
                icon={<CalendarDays className="h-4 w-4" />}
                required
              >
                <div className="grid grid-cols-[1fr_120px] gap-2">
                  <input
                    type="date"
                    value={getDatePart(form.dateMaintain)}
                    onChange={(event) =>
                      updateField(
                        'dateMaintain',
                        mergeDateTime(
                          form.dateMaintain,
                          'date',
                          event.target.value,
                        ),
                      )
                    }
                    disabled={isSaving}
                    className={inputClass}
                  />

                  <select
                    value={getTimePart(form.dateMaintain)}
                    onChange={(event) =>
                      updateField(
                        'dateMaintain',
                        mergeDateTime(
                          form.dateMaintain,
                          'time',
                          event.target.value,
                        ),
                      )
                    }
                    disabled={isSaving}
                    className={inputClass}
                  >
                    <option value="">--:--</option>

                    {timeOptions.map((time) => (
                      <option key={time} value={time}>
                        {time} น.
                      </option>
                    ))}
                  </select>
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
