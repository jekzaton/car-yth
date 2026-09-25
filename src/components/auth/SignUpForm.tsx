'use client';

import Input from '@/components/form/input/InputField';
import Label from '@/components/form/Label';
import Button from '@/components/ui/button/Button';
import { EyeCloseIcon, EyeIcon } from '@/icons';
import Image from 'next/image';
import Link from 'next/link';
import React, { useEffect, useState } from 'react';
import { DepartmentSelect } from './DepartmentSCM';
import { PositionSelect } from './PositionSCM';
import { Department } from '@/types/department';
import { Position } from '@/types/position';
import axios from 'axios';
import { toast } from 'react-toastify';
import { useRouter } from 'next/navigation';

export default function SignUp() {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [department, setDepartment] = useState<Department | null>(null);
  const [position, setPosition] = useState<Position | null>(null);

  const [form, setForm] = useState({
    cid: '',
    phone: '',
    prefix: '',
    dep_id: '',
    ps_id: '',
    firstName: '',
    lastName: '',
    password: '',
    confirmPassword: '',
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    setForm((prev) => ({
      ...prev,
      dep_id: department?.dep_id ? String(department.dep_id) : '',
    }));

    if (department?.dep_id) {
      setErrors((prev) => {
        const next = { ...prev };
        delete next.dep_id;
        return next;
      });
    }
  }, [department]);

  useEffect(() => {
    setForm((prev) => ({
      ...prev,
      ps_id: position?.ps_id ? String(position.ps_id) : '',
    }));

    if (position?.ps_id) {
      setErrors((prev) => {
        const next = { ...prev };
        delete next.ps_id;
        return next;
      });
    }
  }, [position]);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>,
  ) => {
    const { name, value } = e.target;
    setForm((prev: any) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleDepartmentChange = (selected: Department | null) => {
    setDepartment(selected);

    setForm((prev) => ({
      ...prev,
      dep_id: selected ? String(selected.dep_id) : '',
    }));

    if (selected) {
      setErrors((prev) => {
        const nextErrors = { ...prev };
        delete nextErrors.dep_id;
        return nextErrors;
      });
    }
  };

  const handlePositionChange = (selected: Position | null) => {
    setPosition(selected);

    setForm((prev) => ({
      ...prev,
      ps_id: selected ? String(selected.ps_id) : '',
    }));

    if (selected) {
      setErrors((prev) => {
        const nextErrors = { ...prev };
        delete nextErrors.ps_id;
        return nextErrors;
      });
    }
  };

  const formatCid = (value: string) => {
    const digits = value.replace(/\D/g, '').slice(0, 13);

    return digits
      .replace(/^(\d{1})(\d)/, '$1-$2')
      .replace(/^(\d{1})-(\d{4})(\d)/, '$1-$2-$3')
      .replace(/^(\d{1})-(\d{4})-(\d{5})(\d)/, '$1-$2-$3-$4')
      .replace(/^(\d{1})-(\d{4})-(\d{5})-(\d{2})(\d)/, '$1-$2-$3-$4-$5');
  };

  const handleCidChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const digits = e.target.value.replace(/\D/g, '').slice(0, 13);

    setForm((prev) => ({
      ...prev,
      cid: digits,
    }));
  };

  const formatPhone = (value: string) => {
    const digits = value.replace(/\D/g, '').slice(0, 10);

    if (digits.length <= 3) return digits;
    if (digits.length <= 6) return `${digits.slice(0, 3)}-${digits.slice(3)}`;

    return `${digits.slice(0, 3)}-${digits.slice(3, 6)}-${digits.slice(6)}`;
  };

  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const digits = e.target.value.replace(/\D/g, '').slice(0, 10);

    setForm((prev) => ({
      ...prev,
      phone: digits,
    }));
  };

  const validate = (data = form) => {
    const newErrors: Record<string, string> = {};

    if (!data.cid) {
      newErrors.cid = 'กรุณากรอกเลขบัตรประชาชน';
    } else if (data.cid.length !== 13) {
      newErrors.cid = 'เลขบัตรประชาชนต้องมี 13 หลัก';
    }

    if (!data.phone) {
      newErrors.phone = 'กรุณากรอกเบอร์โทร';
    } else if (data.phone.length !== 10) {
      newErrors.phone = 'เบอร์โทรต้องมี 10 หลัก';
    }

    if (!data.prefix) newErrors.prefix = 'เลือกคำนำหน้า';
    if (!data.firstName) newErrors.firstName = 'กรุณากรอกชื่อ';
    if (!data.lastName) newErrors.lastName = 'กรุณากรอกนามสกุล';
    if (!data.dep_id) newErrors.dep_id = 'เลือกแผนก';
    if (!data.ps_id) newErrors.ps_id = 'เลือกตำแหน่ง';
    if (!data.password) newErrors.password = 'กรุณากรอกรหัสผ่าน';

    if (!data.confirmPassword) {
      newErrors.confirmPassword = 'กรุณายืนยันรหัสผ่าน';
    } else if (data.password !== data.confirmPassword) {
      newErrors.confirmPassword = 'รหัสผ่านไม่ตรงกัน';
    }

    setErrors(newErrors);

    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    const submitForm = {
      ...form,
      dep_id: department?.dep_id ? String(department.dep_id) : '',
      ps_id: position?.ps_id ? String(position.ps_id) : '',
    };

    if (!validate(submitForm)) return;

    const payload = {
      cid: submitForm.cid,
      phone: submitForm.phone,
      prefix: submitForm.prefix,
      first_name: submitForm.firstName,
      last_name: submitForm.lastName,
      password: submitForm.password,
      dep_id: Number(submitForm.dep_id),
      ps_id: Number(submitForm.ps_id),
    };

    try {
      setIsSubmitting(true);

      const res = await axios.post('/api/users', payload);

      if (res.data.success) {
        toast.success('สมัครสมาชิกเรียบร้อยแล้ว', {
          autoClose: 1500,
          onClose: () => router.push('/signin'),
        });
      }
    } catch (err: any) {
      const status = err?.response?.status;
      const message = err?.response?.data?.message;

      if (status === 409 || message === 'CID already exists') {
        toast.error('เลขบัตรประชาชนนี้ถูกใช้สมัครแล้ว');
        return;
      }

      if (status === 400) {
        toast.error('ข้อมูลไม่ครบถ้วน กรุณาตรวจสอบอีกครั้ง');
        return;
      }

      toast.error('สมัครสมาชิกไม่สำเร็จ กรุณาลองใหม่อีกครั้ง');

      // console.error('submit error:', err?.response?.data || err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const prefixes = [
    { value: 'นาย', label: 'นาย' },
    { value: 'นางสาว', label: 'นางสาว' },
    { value: 'นาง', label: 'นาง' },
  ];

  return (
    <div className="bg-linear-to-br flex min-h-screen w-full items-center justify-center from-sky-50 via-white to-emerald-50 p-6 dark:from-gray-950 dark:via-gray-900 dark:to-gray-950">
      <div className="w-full max-w-2xl rounded-2xl border border-white/20 bg-white/70 p-8 shadow-2xl backdrop-blur-xl dark:border-gray-800 dark:bg-gray-900/60">
        {/* HEADER */}
        <div className="mb-8 text-center">
          <div className="mx-auto mb-3 flex h-20 w-20 items-center justify-center">
            <Image
              src="/images/logo/yth_logo.png"
              alt="Hospital Logo"
              width={80}
              height={80}
            />
          </div>

          <h1 className="text-2xl font-semibold text-gray-900 dark:text-white">
            สมัครสมาชิก
          </h1>
          <p className="text-sm text-gray-500">Yangtalad Hospital</p>
        </div>

        {/* FORM */}
        <form onSubmit={handleSubmit} className="space-y-5">
          {/* CID / PHONE */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label>
                เลขบัตรประชาชน <span className="text-red-500">*</span>
              </Label>
              <Input
                name="cid"
                value={formatCid(form.cid)}
                onChange={handleCidChange}
                inputMode="numeric"
                autoComplete="off"
                placeholder="1-2345-67890-12-3"
              />
              {errors.cid && (
                <p className="text-sm text-red-500">{errors.cid}</p>
              )}
            </div>

            <div>
              <Label>
                เบอร์โทร <span className="text-red-500">*</span>
              </Label>
              <Input
                name="phone"
                value={formatPhone(form.phone)}
                onChange={handlePhoneChange}
                inputMode="numeric"
                autoComplete="off"
                placeholder="081-234-5678"
                maxLength={12}
              />
              {errors.phone && (
                <p className="text-sm text-red-500">{errors.phone}</p>
              )}
            </div>
          </div>

          {/* NAME */}
          <div className="grid grid-cols-12 gap-4">
            {/* PREFIX */}
            <div className="col-span-3">
              <Label>
                คำนำหน้า <span className="text-red-500">*</span>
              </Label>

              <select
                name="prefix"
                onChange={handleChange}
                className="w-full rounded-lg border px-3 py-3 text-sm focus:ring-2 focus:ring-emerald-400"
              >
                <option value="">เลือกคำนำหน้า</option>
                {prefixes.map((p) => (
                  <option key={p.value} value={p.value}>
                    {p.label}
                  </option>
                ))}
              </select>

              {errors.prefix && (
                <p className="text-sm text-red-500">{errors.prefix}</p>
              )}
            </div>
            <div className="col-span-5">
              <Label>
                ชื่อ <span className="text-red-500">*</span>
              </Label>
              <Input name="firstName" onChange={handleChange} />
              {errors.firstName && (
                <p className="text-sm text-red-500">{errors.firstName}</p>
              )}
            </div>

            <div className="col-span-4">
              <Label>
                นามสกุล <span className="text-red-500">*</span>
              </Label>
              <Input name="lastName" onChange={handleChange} />
              {errors.lastName && (
                <p className="text-sm text-red-500">{errors.lastName}</p>
              )}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label>
                แผนก <span className="text-red-500">*</span>
              </Label>
              <DepartmentSelect value={department} setValue={setDepartment} />
              {errors.dep_id && (
                <p className="text-sm text-red-500">{errors.dep_id}</p>
              )}
            </div>

            <div>
              <Label>
                ตำแหน่ง <span className="text-red-500">*</span>
              </Label>
              <PositionSelect value={position} setValue={setPosition} />
              {errors.ps_id && (
                <p className="text-sm text-red-500">{errors.ps_id}</p>
              )}
            </div>
          </div>

          {/* PASSWORD */}
          <div>
            <Label>
              รหัสผ่าน <span className="text-red-500">*</span>
            </Label>
            <div className="relative">
              <Input
                name="password"
                type={showPassword ? 'text' : 'password'}
                onChange={handleChange}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2"
              >
                {showPassword ? <EyeIcon /> : <EyeCloseIcon />}
              </button>
            </div>
            {errors.password && (
              <p className="text-sm text-red-500">{errors.password}</p>
            )}
          </div>

          {/* CONFIRM PASSWORD */}
          <div>
            <Label>
              ยืนยันรหัสผ่าน <span className="text-red-500">*</span>
            </Label>
            <div className="relative">
              <Input
                name="confirmPassword"
                type={showConfirm ? 'text' : 'password'}
                onChange={handleChange}
              />
              <button
                type="button"
                onClick={() => setShowConfirm(!showConfirm)}
                className="absolute right-3 top-1/2 -translate-y-1/2"
              >
                {showConfirm ? <EyeIcon /> : <EyeCloseIcon />}
              </button>
            </div>
            {errors.confirmPassword && (
              <p className="text-sm text-red-500">{errors.confirmPassword}</p>
            )}
          </div>

          {/* SUBMIT */}
          <Button
            type="submit"
            disabled={isSubmitting}
            className="bg-linear-to-r w-full from-sky-500 via-cyan-500 to-emerald-500 text-white shadow-lg hover:shadow-emerald-500/30 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {isSubmitting ? 'กำลังสมัครสมาชิก...' : 'สมัครสมาชิก'}
          </Button>
        </form>

        {/* FOOTER */}
        <p className="mt-6 text-center text-sm text-gray-500">
          มีบัญชีแล้ว?{' '}
          <Link
            href="/signin"
            className="text-emerald-500 hover:text-emerald-600"
          >
            เข้าสู่ระบบ
          </Link>
        </p>
      </div>
    </div>
  );
}
