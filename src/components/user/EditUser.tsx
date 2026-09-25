'use client';

import axios from 'axios';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft, Eye, EyeOff, Loader2, Save, UserRound } from 'lucide-react';
import { toast } from 'react-toastify';
import { Controller, useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';

import Input from '@/components/form/input/InputField';
import SearchSelect from '@/components/form/SearchSelect';

type Department = {
  depId: number;
  depName: string;
};

type Position = {
  psId: number;
  psName: string;
};

type SystemItem = {
  id: number;
  systemId: number;
  systemName: string;
};

const editUserSchema = z.object({
  cid: z.string().regex(/^\d{13}$/, 'เลขบัตรประชาชนต้องมี 13 หลัก'),

  prefix: z.string().min(1, 'กรุณาเลือกคำนำหน้าชื่อ'),

  first_name: z
    .string()
    .trim()
    .min(1, 'กรุณากรอกชื่อ')
    .max(255, 'ชื่อต้องไม่เกิน 255 ตัวอักษร'),

  last_name: z
    .string()
    .trim()
    .min(1, 'กรุณากรอกนามสกุล')
    .max(255, 'นามสกุลต้องไม่เกิน 255 ตัวอักษร'),

  phone: z.string().regex(/^\d{10}$/, 'เบอร์โทรศัพท์ต้องมี 10 หลัก'),

  // หน้าแก้ไขไม่บังคับเปลี่ยนรหัสผ่าน
  password: z
    .string()
    .refine(
      (value) => value === '' || value.length >= 6,
      'รหัสผ่านใหม่ต้องมีอย่างน้อย 6 ตัวอักษร',
    ),

  dep_id: z.string().min(1, 'กรุณาเลือกหน่วยงาน'),
  ps_id: z.string().min(1, 'กรุณาเลือกตำแหน่ง'),
  system_id: z.string().min(1, 'กรุณาเลือกระบบ'),

  status: z.enum(['active', 'inactive']),
  status_level: z.enum(['user', 'member', 'admin']),
});

type EditUserForm = z.infer<typeof editUserSchema>;

type EditUserProps = {
  userId: number;
};

const formatCid = (value: string) => {
  const numbers = value.replace(/\D/g, '').slice(0, 13);

  return [
    numbers.slice(0, 1),
    numbers.slice(1, 5),
    numbers.slice(5, 10),
    numbers.slice(10, 12),
    numbers.slice(12, 13),
  ]
    .filter(Boolean)
    .join('-');
};

const formatPhone = (value: string) => {
  const numbers = value.replace(/\D/g, '').slice(0, 10);

  if (numbers.length <= 3) return numbers;

  if (numbers.length <= 6) {
    return `${numbers.slice(0, 3)}-${numbers.slice(3)}`;
  }

  return `${numbers.slice(0, 3)}-${numbers.slice(3, 6)}-${numbers.slice(6)}`;
};

export default function EditUser({ userId }: EditUserProps) {
  const router = useRouter();

  const [departments, setDepartments] = useState<Department[]>([]);
  const [positions, setPositions] = useState<Position[]>([]);
  const [systems, setSystems] = useState<SystemItem[]>([]);

  const [loading, setLoading] = useState(true);
  const [showPassword, setShowPassword] = useState(false);

  const {
    register,
    control,
    reset,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<EditUserForm>({
    resolver: zodResolver(editUserSchema),
    mode: 'onTouched',
    defaultValues: {
      cid: '',
      prefix: '',
      first_name: '',
      last_name: '',
      phone: '',
      password: '',
      dep_id: '',
      ps_id: '',
      system_id: '',
      status: 'active',
      status_level: 'user',
    },
  });

  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true);

        const [
          userResponse,
          departmentResponse,
          positionResponse,
          systemResponse,
        ] = await Promise.all([
          axios.get('/api/users/edit', {
            params: { id: userId },
            withCredentials: true,
          }),

          axios.get('/api/departments', {
            withCredentials: true,
          }),

          axios.get('/api/positions', {
            withCredentials: true,
          }),

          axios.get('/api/systems', {
            withCredentials: true,
          }),
        ]);

        const user = userResponse.data?.data;

        if (!user) {
          toast.error('ไม่พบข้อมูลผู้ใช้งาน');
          router.push('/users');
          return;
        }

        reset({
          cid: String(user.cid ?? '').replace(/\D/g, ''),
          prefix: String(user.prefix ?? ''),
          first_name: String(user.firstName ?? user.first_name ?? ''),
          last_name: String(user.lastName ?? user.last_name ?? ''),
          phone: String(user.phone ?? '').replace(/\D/g, ''),
          password: '',

          dep_id: String(user.depId ?? user.dep_id ?? ''),
          ps_id: String(user.psId ?? user.ps_id ?? ''),
          system_id: String(user.systemId ?? user.system_id ?? ''),

          status: user.status === 'inactive' ? 'inactive' : 'active',

          status_level:
            user.statusLevel === 'admin'
              ? 'admin'
              : user.statusLevel === 'member'
                ? 'member'
                : 'user',
        });

        const departmentData = Array.isArray(departmentResponse.data?.data)
          ? departmentResponse.data.data
          : [];

        const positionData = Array.isArray(positionResponse.data?.data)
          ? positionResponse.data.data
          : [];

        const systemData = Array.isArray(systemResponse.data?.data)
          ? systemResponse.data.data
          : [];

        setDepartments(
          departmentData.map((item: Record<string, unknown>) => ({
            depId: Number(item.depId ?? item.dep_id),
            depName: String(item.depName ?? item.dep_name ?? ''),
          })),
        );

        setPositions(
          positionData.map((item: Record<string, unknown>) => ({
            psId: Number(item.psId ?? item.ps_id),
            psName: String(item.psName ?? item.ps_name ?? ''),
          })),
        );

        setSystems(
          systemData.map((item: Record<string, unknown>) => ({
            id: Number(item.id),
            systemId: Number(item.systemId ?? item.system_id),
            systemName: String(item.systemName ?? item.system_name ?? ''),
          })),
        );
      } catch (error) {
        console.error('Load edit user error:', error);

        if (axios.isAxiosError(error)) {
          if (error.response?.status === 401) {
            toast.error('กรุณาเข้าสู่ระบบใหม่');
            router.push('/signin');
            return;
          }

          if (error.response?.status === 403) {
            toast.error('คุณไม่มีสิทธิ์เข้าถึงข้อมูลนี้');
            router.push('/unauthorized');
            return;
          }

          if (error.response?.status === 404) {
            toast.error(
              error.response?.data?.message || 'ไม่พบข้อมูลผู้ใช้งาน',
            );
            router.push('/users');
            return;
          }

          toast.error(
            error.response?.data?.message || 'ไม่สามารถโหลดข้อมูลผู้ใช้งานได้',
          );
        } else {
          toast.error('เกิดข้อผิดพลาดระหว่างโหลดข้อมูล');
        }
      } finally {
        setLoading(false);
      }
    };

    if (!Number.isInteger(userId) || userId <= 0) {
      toast.error('รหัสผู้ใช้งานไม่ถูกต้อง');
      router.push('/users');
      return;
    }

    loadData();
  }, [reset, router, userId]);

  const onSubmit = async (data: EditUserForm) => {
    try {
      const payload = {
        id: userId,
        cid: data.cid,
        prefix: data.prefix.trim(),
        first_name: data.first_name.trim(),
        last_name: data.last_name.trim(),
        phone: data.phone,
        dep_id: Number(data.dep_id),
        ps_id: Number(data.ps_id),
        system_id: Number(data.system_id),
        status: data.status,
        status_level: data.status_level,

        ...(data.password.trim()
          ? {
              password: data.password,
            }
          : {}),
      };

      const response = await axios.put('/api/users/edit', payload, {
        withCredentials: true,
      });

      toast.success(
        response.data?.message || 'แก้ไขข้อมูลผู้ใช้งานเรียบร้อยแล้ว',
      );

      router.push('/users');
      router.refresh();
    } catch (error) {
      console.error('Update user error:', error);

      if (axios.isAxiosError(error)) {
        toast.error(
          error.response?.data?.message || 'ไม่สามารถแก้ไขข้อมูลผู้ใช้งานได้',
        );
      } else {
        toast.error('เกิดข้อผิดพลาดระหว่างแก้ไขข้อมูล');
      }
    }
  };

  if (loading) {
    return (
      <div className="flex min-h-80 items-center justify-center">
        <div className="text-center">
          <Loader2 className="mx-auto h-8 w-8 animate-spin text-blue-600" />
          <p className="mt-3 text-sm text-gray-500 dark:text-gray-400">
            กำลังโหลดข้อมูลผู้ใช้งาน...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-5xl">
      <button
        type="button"
        onClick={() => router.push('/users')}
        className="mb-5 inline-flex items-center gap-2 rounded-xl border border-gray-200 bg-white px-4 py-2 text-sm font-medium text-gray-600 shadow-sm transition hover:border-blue-200 hover:text-blue-600 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-300"
      >
        <ArrowLeft className="h-4 w-4" />
        กลับหน้าผู้ใช้งาน
      </button>

      <div className="overflow-hidden rounded-3xl border border-gray-200 bg-white shadow-xl dark:border-gray-800 dark:bg-gray-900">
        <div className="bg-linear-to-r relative overflow-hidden from-blue-600 via-indigo-600 to-purple-600 px-6 py-8 text-white md:px-10">
          <div className="absolute -right-16 -top-16 h-48 w-48 rounded-full bg-white/10" />

          <div className="relative flex items-center gap-4">
            <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-white/15 backdrop-blur">
              <UserRound className="h-8 w-8" />
            </div>

            <div>
              <p className="text-sm text-blue-100">User Management</p>

              <h1 className="mt-1 text-2xl font-bold">แก้ไขข้อมูลผู้ใช้งาน</h1>

              <p className="mt-1 text-sm text-blue-100">
                แก้ไขข้อมูลส่วนตัว หน่วยงาน ตำแหน่ง ระบบ และสิทธิ์
              </p>
            </div>
          </div>
        </div>

        <form
          onSubmit={handleSubmit(onSubmit)}
          noValidate
          className="p-6 md:p-10"
        >
          <div className="grid grid-cols-1 gap-x-6 gap-y-7 lg:grid-cols-12">
            {/* CID */}
            <div className="lg:col-span-6">
              <FormField label="เลขบัตรประชาชน">
                <Controller
                  name="cid"
                  control={control}
                  render={({ field }) => (
                    <Input
                      name={field.name}
                      value={formatCid(field.value)}
                      disabled
                      placeholder="x-xxxx-xxxxx-xx-x"
                      error={Boolean(errors.cid)}
                      hint={errors.cid?.message}
                    />
                  )}
                />
              </FormField>
            </div>

            {/* PHONE */}
            <div className="lg:col-span-6">
              <FormField label="เบอร์โทรศัพท์">
                <Controller
                  name="phone"
                  control={control}
                  render={({ field }) => (
                    <Input
                      name={field.name}
                      value={formatPhone(field.value)}
                      onChange={(event) =>
                        field.onChange(
                          event.target.value.replace(/\D/g, '').slice(0, 10),
                        )
                      }
                      onBlur={field.onBlur}
                      inputMode="numeric"
                      autoComplete="tel"
                      placeholder="080-000-0000"
                      error={Boolean(errors.phone)}
                      hint={errors.phone?.message}
                    />
                  )}
                />
              </FormField>
            </div>

            {/* PREFIX */}
            <div className="lg:col-span-2">
              <FormField label="คำนำหน้า" error={errors.prefix?.message}>
                <select
                  {...register('prefix')}
                  className={getSelectClass(Boolean(errors.prefix))}
                >
                  <option value="">เลือก</option>
                  <option value="นาย">นาย</option>
                  <option value="นาง">นาง</option>
                  <option value="นางสาว">นางสาว</option>
                </select>
              </FormField>
            </div>

            {/* FIRST NAME */}
            <div className="lg:col-span-4">
              <FormField label="ชื่อ">
                <Controller
                  name="first_name"
                  control={control}
                  render={({ field }) => (
                    <Input
                      name={field.name}
                      value={field.value}
                      onChange={field.onChange}
                      onBlur={field.onBlur}
                      placeholder="ชื่อ"
                      error={Boolean(errors.first_name)}
                      hint={errors.first_name?.message}
                    />
                  )}
                />
              </FormField>
            </div>

            {/* LAST NAME */}
            <div className="lg:col-span-6">
              <FormField label="นามสกุล">
                <Controller
                  name="last_name"
                  control={control}
                  render={({ field }) => (
                    <Input
                      name={field.name}
                      value={field.value}
                      onChange={field.onChange}
                      onBlur={field.onBlur}
                      placeholder="นามสกุล"
                      error={Boolean(errors.last_name)}
                      hint={errors.last_name?.message}
                    />
                  )}
                />
              </FormField>
            </div>

            {/* PASSWORD */}
            <div className="lg:col-span-12">
              <FormField label="รหัสผ่านใหม่">
                <div className="relative">
                  <Controller
                    name="password"
                    control={control}
                    render={({ field }) => (
                      <Input
                        name={field.name}
                        type={showPassword ? 'text' : 'password'}
                        value={field.value}
                        onChange={field.onChange}
                        onBlur={field.onBlur}
                        autoComplete="new-password"
                        className="pr-12"
                        placeholder="เว้นว่างหากไม่ต้องการเปลี่ยนรหัสผ่าน"
                        error={Boolean(errors.password)}
                        hint={errors.password?.message}
                      />
                    )}
                  />

                  <button
                    type="button"
                    onClick={() => setShowPassword((previous) => !previous)}
                    className="top-5.5 absolute right-3 -translate-y-1/2 text-gray-400 transition hover:text-gray-600 dark:hover:text-gray-200"
                    aria-label={showPassword ? 'ซ่อนรหัสผ่าน' : 'แสดงรหัสผ่าน'}
                  >
                    {showPassword ? (
                      <EyeOff className="h-5 w-5" />
                    ) : (
                      <Eye className="h-5 w-5" />
                    )}
                  </button>
                </div>
              </FormField>
            </div>

            {/* DEPARTMENT */}
            <div className="lg:col-span-6">
              <FormField label="หน่วยงาน" error={errors.dep_id?.message}>
                <Controller
                  name="dep_id"
                  control={control}
                  render={({ field }) => (
                    <SearchSelect
                      value={field.value}
                      placeholder="ค้นหาและเลือกหน่วยงาน"
                      options={departments.map((department) => ({
                        value: department.depId,
                        label: department.depName,
                      }))}
                      onChange={field.onChange}
                    />
                  )}
                />
              </FormField>
            </div>

            {/* POSITION */}
            <div className="lg:col-span-6">
              <FormField label="ตำแหน่ง" error={errors.ps_id?.message}>
                <Controller
                  name="ps_id"
                  control={control}
                  render={({ field }) => (
                    <SearchSelect
                      value={field.value}
                      placeholder="ค้นหาและเลือกตำแหน่ง"
                      options={positions.map((position) => ({
                        value: position.psId,
                        label: position.psName,
                      }))}
                      onChange={field.onChange}
                    />
                  )}
                />
              </FormField>
            </div>

            {/* SYSTEM */}
            <div className="lg:col-span-4">
              <FormField label="ระบบ" error={errors.system_id?.message}>
                <Controller
                  name="system_id"
                  control={control}
                  render={({ field }) => (
                    <SearchSelect
                      value={field.value}
                      placeholder="ค้นหาและเลือกระบบ"
                      options={systems.map((system) => ({
                        value: system.systemId,
                        label: system.systemName,
                      }))}
                      onChange={field.onChange}
                    />
                  )}
                />
              </FormField>
            </div>

            {/* ROLE */}
            <div className="lg:col-span-4">
              <FormField label="สิทธิ์การใช้งาน">
                <select
                  {...register('status_level')}
                  className={getSelectClass(false)}
                >
                  <option value="user">User</option>
                  <option value="member">Member</option>
                  <option value="admin">Admin</option>
                </select>
              </FormField>
            </div>

            {/* STATUS */}
            <div className="lg:col-span-4">
              <FormField label="สถานะบัญชี">
                <Controller
                  name="status"
                  control={control}
                  render={({ field }) => {
                    const isActive = field.value === 'active';

                    return (
                      <div className="shadow-theme-xs flex min-h-11 items-center justify-between gap-3 rounded-lg border border-gray-300 bg-gray-50 px-4 py-2 dark:border-gray-700 dark:bg-gray-800">
                        <button
                          type="button"
                          role="switch"
                          aria-checked={isActive}
                          onClick={() =>
                            field.onChange(isActive ? 'inactive' : 'active')
                          }
                          className="flex min-w-0 items-center gap-3 text-left"
                        >
                          <span
                            className={`relative inline-flex h-7 w-14 shrink-0 rounded-full transition-colors duration-200 ${
                              isActive
                                ? 'bg-green-500'
                                : 'bg-gray-400 dark:bg-gray-600'
                            }`}
                          >
                            <span
                              className={`absolute left-1 top-1 h-5 w-5 rounded-full bg-white shadow-md transition-transform duration-200 ${
                                isActive ? 'translate-x-7' : 'translate-x-0'
                              }`}
                            />
                          </span>

                          <span className="truncate text-sm font-semibold text-gray-800 dark:text-white">
                            {isActive ? 'เปิดใช้งาน' : 'ปิดใช้งาน'}
                          </span>
                        </button>

                        <span
                          className={`shrink-0 rounded-full px-3 py-1 text-xs font-semibold ${
                            isActive
                              ? 'bg-green-100 text-green-700 dark:bg-green-500/10 dark:text-green-300'
                              : 'bg-red-100 text-red-600 dark:bg-red-500/10 dark:text-red-300'
                          }`}
                        >
                          {isActive ? 'Active' : 'Inactive'}
                        </span>
                      </div>
                    );
                  }}
                />
              </FormField>
            </div>
          </div>

          <div className="mt-10 flex flex-col-reverse gap-3 border-t border-gray-100 pt-6 sm:flex-row sm:justify-end dark:border-gray-800">
            <button
              type="button"
              onClick={() => router.push('/users')}
              disabled={isSubmitting}
              className="rounded-xl border border-gray-300 bg-white px-6 py-3 text-sm font-semibold text-gray-700 transition hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-200"
            >
              ยกเลิก
            </button>

            <button
              type="submit"
              disabled={isSubmitting}
              className="bg-linear-to-r inline-flex items-center justify-center gap-2 rounded-xl from-blue-600 to-indigo-600 px-7 py-3 text-sm font-semibold text-white shadow-lg transition hover:-translate-y-0.5 hover:shadow-xl disabled:cursor-not-allowed disabled:opacity-60"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="h-5 w-5 animate-spin" />
                  กำลังบันทึก...
                </>
              ) : (
                <>
                  <Save className="h-5 w-5" />
                  บันทึกการแก้ไข
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

function getSelectClass(hasError: boolean) {
  return [
    'h-11 w-full rounded-lg border bg-transparent px-4 text-sm',
    'text-gray-800 outline-none transition',
    'dark:bg-gray-900 dark:text-white/90',
    hasError
      ? 'border-error-500 focus:border-error-300 focus:ring-3 focus:ring-error-500/20'
      : 'border-gray-300 focus:border-brand-300 focus:ring-3 focus:ring-brand-500/20 dark:border-gray-700',
  ].join(' ');
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
