'use client';

import Input from '@/components/form/input/InputField';
import Label from '@/components/form/Label';
import Button from '@/components/ui/button/Button';
import { EyeCloseIcon, EyeIcon } from '@/icons';
import Image from 'next/image';
import Link from 'next/link';
import React, { useState } from 'react';
import { DepartmentSelect } from './DepartmentSCM';
import { PositionSelect } from './PositionSCM';
import { Department } from '@/types/department';
import { Position } from '@/types/position';
import axios from 'axios';

export default function SignUp() {
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

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>,
  ) => {
    const { name, value } = e.target;

    setForm((prev: any) => ({
      ...prev,
      [name]: value,
    }));
  };

  const validate = () => {
    const newErrors: Record<string, string> = {};

    if (!form.cid) newErrors.cid = 'กรุณากรอกเลขบัตรประชาชน';
    if (!form.phone) newErrors.phone = 'กรุณากรอกเบอร์โทร';
    if (!form.prefix) newErrors.prefix = 'เลือกคำนำหน้า';
    if (!form.firstName) newErrors.firstName = 'กรุณากรอกชื่อ';
    if (!form.lastName) newErrors.lastName = 'กรุณากรอกนามสกุล';
    if (!form.dep_id) newErrors.dep_id = 'เลือกแผนก';
    if (!form.ps_id) newErrors.ps_id = 'เลือกตำแหน่ง';
    if (!form.lastName) newErrors.lastName = 'กรุณากรอกนามสกุล';
    if (!form.password) newErrors.password = 'กรุณากรอกรหัสผ่าน';

    if (form.password !== form.confirmPassword) {
      newErrors.confirmPassword = 'รหัสผ่านไม่ตรงกัน';
    }

    setErrors(newErrors);

    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (!validate()) return;

    try {
      const res = await axios.post(
        process.env.NEXT_PUBLIC_API_URL + '/api/users',
        form,
      );

      console.log('success:', res.data);
    } catch (err: any) {
      console.error('submit error:', err?.response?.data || err.message);
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
              <Input name="cid" onChange={handleChange} />
              {errors.cid && (
                <p className="text-sm text-red-500">{errors.cid}</p>
              )}
            </div>

            <div>
              <Label>
                เบอร์โทร <span className="text-red-500">*</span>
              </Label>
              <Input name="phone" onChange={handleChange} />
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
            className="bg-linear-to-r w-full from-sky-500 via-cyan-500 to-emerald-500 text-white shadow-lg hover:shadow-emerald-500/30"
          >
            สมัครสมาชิก
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
