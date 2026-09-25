'use client';

import Input from '@/components/form/input/InputField';
import Label from '@/components/form/Label';
import Button from '@/components/ui/button/Button';
import { EyeCloseIcon, EyeIcon } from '@/icons';
import axios from 'axios';
import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import React, { useState } from 'react';
import { toast } from 'react-toastify';

export default function SignInForm() {
  const router = useRouter();

  const [formData, setFormData] = useState({
    cid: '',
    password: '',
  });

  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;

    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
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

    setFormData((prev) => ({
      ...prev,
      cid: digits,
    }));
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (!formData.cid || !formData.password) {
      toast.error('กรุณากรอกเลขบัตรประชาชนและรหัสผ่าน');
      return;
    }

    try {
      setIsSubmitting(true);

      const response = await axios.post('/api/auth/signin', {
        cid: formData.cid,
        password: formData.password,
      });

      if (response.data.success) {
        toast.success('เข้าสู่ระบบสำเร็จ');

        router.replace('/dashboard');
        router.refresh();
      }
    } catch (error: any) {
      toast.error(
        error?.response?.data?.message ??
          'เลขบัตรประชาชนหรือรหัสผ่านไม่ถูกต้อง',
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="bg-linear-to-br flex min-h-screen w-full items-center justify-center from-sky-50 via-white to-emerald-50 p-6 dark:from-gray-950 dark:via-gray-900 dark:to-gray-950">
      <div className="w-full max-w-md rounded-2xl border border-gray-200/60 bg-white/70 p-8 shadow-2xl backdrop-blur-xl dark:border-gray-800/60 dark:bg-gray-900/60">
        {/* Header */}
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
            ระบบจองรถ
          </h1>

          <p className="mt-1 text-sm text-gray-500">Yangtalad Hospital</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          {/* CID */}
          <div>
            <Label>
              เลขบัตรประชาชน <span className="text-red-500">*</span>
            </Label>

            <Input
              name="cid"
              value={formatCid(formData.cid)}
              onChange={handleCidChange}
              placeholder="1-2345-67890-12-3"
              inputMode="numeric"
              autoComplete="off"
              maxLength={17}
            />
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
                value={formData.password}
                onChange={handleChange}
                placeholder="รหัสผ่าน"
                className="pr-10"
              />

              <button
                type="button"
                onClick={() => setShowPassword((prev) => !prev)}
                className="absolute right-3 top-1/2 -translate-y-1/2"
              >
                {showPassword ? <EyeIcon /> : <EyeCloseIcon />}
              </button>
            </div>
          </div>

          {/* SUBMIT */}
          <Button
            type="submit"
            disabled={isSubmitting}
            className="bg-linear-to-r w-full from-sky-500 to-emerald-500 text-white"
          >
            {isSubmitting ? 'กำลังเข้าสู่ระบบ...' : 'เข้าสู่ระบบ'}
          </Button>
        </form>

        <p className="mt-6 text-center text-sm text-gray-500">
          ยังไม่มีบัญชี?{' '}
          <Link
            href="/signup"
            className="font-medium text-emerald-500 hover:text-emerald-600"
          >
            สมัครสมาชิก
          </Link>
        </p>
      </div>
    </div>
  );
}
