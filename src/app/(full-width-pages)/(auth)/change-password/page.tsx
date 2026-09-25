'use client';

import axios from 'axios';
import {
  ArrowRight,
  Check,
  Eye,
  EyeOff,
  KeyRound,
  LockKeyhole,
  ShieldCheck,
  Sparkles,
} from 'lucide-react';
import { useRouter } from 'next/navigation';
import { FormEvent, useMemo, useState } from 'react';
import { toast } from 'react-toastify';

import api from '@/lib/axios';

type StatusLevel = 'user' | 'member' | 'admin';

interface ChangePasswordResponse {
  success: boolean;
  message: string;
  user?: {
    id: number;
    cid: string;
    statusLevel: StatusLevel;
    mustChangePassword: boolean;
  };
}

interface PasswordRule {
  label: string;
  passed: boolean;
}

export default function ChangePasswordPage() {
  const router = useRouter();

  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const [isSubmitting, setIsSubmitting] = useState(false);

  // ============================================================
  // PASSWORD RULES
  // ============================================================

  const passwordRules = useMemo<PasswordRule[]>(
    () => [
      {
        label: 'อย่างน้อย 8 ตัวอักษร',
        passed: password.length >= 8,
      },
      {
        label: 'มีตัวอักษรอย่างน้อย 1 ตัว',
        passed: /[A-Za-zก-๙]/.test(password),
      },
      {
        label: 'มีตัวเลขอย่างน้อย 1 ตัว',
        passed: /\d/.test(password),
      },
    ],
    [password],
  );

  const passedRules = passwordRules.filter((rule) => rule.passed).length;

  const passwordsMatch =
    confirmPassword.length > 0 && password === confirmPassword;

  const passwordMismatch =
    confirmPassword.length > 0 && password !== confirmPassword;

  const allRulesPassed = passwordRules.every((rule) => rule.passed);

  const canSubmit = allRulesPassed && passwordsMatch && !isSubmitting;

  // ============================================================
  // PASSWORD STRENGTH
  // ============================================================

  const strength = useMemo(() => {
    if (!password) {
      return {
        value: 0,
        label: '',
      };
    }

    let score = 0;

    if (password.length >= 8) score++;
    if (password.length >= 12) score++;

    if (/[A-Za-zก-๙]/.test(password)) {
      score++;
    }

    if (/\d/.test(password)) {
      score++;
    }

    if (/[^A-Za-z0-9ก-๙]/.test(password)) {
      score++;
    }

    if (score <= 2) {
      return {
        value: 1,
        label: 'ควรเพิ่มความแข็งแรง',
      };
    }

    if (score <= 4) {
      return {
        value: 2,
        label: 'ความแข็งแรงปานกลาง',
      };
    }

    return {
      value: 3,
      label: 'รหัสผ่านแข็งแรง',
    };
  }, [password]);

  // ============================================================
  // SUBMIT
  // ============================================================

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!password) {
      toast.warning('กรุณากรอกรหัสผ่านใหม่');
      return;
    }

    if (password.length < 8) {
      toast.warning('รหัสผ่านต้องมีอย่างน้อย 8 ตัวอักษร');
      return;
    }

    if (!/[A-Za-zก-๙]/.test(password)) {
      toast.warning('รหัสผ่านต้องมีตัวอักษรอย่างน้อย 1 ตัว');
      return;
    }

    if (!/\d/.test(password)) {
      toast.warning('รหัสผ่านต้องมีตัวเลขอย่างน้อย 1 ตัว');
      return;
    }

    if (!confirmPassword) {
      toast.warning('กรุณายืนยันรหัสผ่านใหม่');
      return;
    }

    if (password !== confirmPassword) {
      toast.warning('รหัสผ่านและยืนยันรหัสผ่านไม่ตรงกัน');
      return;
    }

    try {
      setIsSubmitting(true);

      const response = await api.patch<ChangePasswordResponse>(
        '/api/auth/change-password',
        {
          password,
          confirmPassword,
        },
      );

      if (!response.data.success) {
        toast.error(response.data.message || 'ไม่สามารถเปลี่ยนรหัสผ่านได้');
        return;
      }

      toast.success(response.data.message || 'ตั้งรหัสผ่านใหม่สำเร็จ');

      const statusLevel = response.data.user?.statusLevel;

      if (statusLevel === 'user') {
        router.replace('/bookingCar');
      } else {
        router.replace('/dashboard');
      }

      router.refresh();
    } catch (error: unknown) {
      if (axios.isAxiosError(error)) {
        const message = error.response?.data?.message;

        toast.error(
          typeof message === 'string' ? message : 'ไม่สามารถเปลี่ยนรหัสผ่านได้',
        );

        return;
      }

      toast.error('เกิดข้อผิดพลาด กรุณาลองใหม่อีกครั้ง');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <main className="bg-background fixed inset-0 z-50 overflow-y-auto">
      {/* ======================================================
          BACKGROUND
      ====================================================== */}

      <div
        aria-hidden="true"
        className="pointer-events-none fixed inset-0 overflow-hidden"
      >
        {/* BASE */}
        <div className="bg-linear-to-br absolute inset-0 from-blue-50 via-white to-indigo-50 dark:from-slate-950 dark:via-gray-950 dark:to-indigo-950" />

        {/* LIGHT */}
        <div className="-top-55 h-137.5 w-137.5 absolute left-1/2 -translate-x-1/2 rounded-full bg-blue-400/20 blur-[120px] dark:bg-blue-500/10" />

        <div className="h-125 w-125 absolute -left-52 top-[15%] rounded-full bg-sky-400/15 blur-[120px] dark:bg-sky-500/10" />

        <div className="h-150 w-150 absolute -bottom-60 -right-48 rounded-full bg-indigo-400/20 blur-[130px] dark:bg-indigo-500/10" />

        {/* DECORATION */}
        <div className="absolute left-[8%] top-[12%] hidden h-28 w-28 rounded-full border border-blue-400/15 bg-blue-400/5 lg:block" />

        <div className="absolute bottom-[10%] right-[8%] hidden h-44 w-44 rounded-full border border-indigo-400/15 bg-indigo-400/5 lg:block" />

        {/* GRID */}
        <div className="absolute inset-0 opacity-[0.025] dark:opacity-[0.04]">
          <div className="bg-size-[40px_40px] h-full w-full bg-[linear-gradient(to_right,currentColor_1px,transparent_1px),linear-gradient(to_bottom,currentColor_1px,transparent_1px)]" />
        </div>
      </div>

      {/* ======================================================
          CONTENT
      ====================================================== */}

      <div className="relative z-10 mx-auto flex min-h-full w-full items-center justify-center px-4 py-8 sm:px-6 sm:py-10">
        <div className="max-w-180 w-full">
          {/* ==================================================
              TOP ICON
          ================================================== */}

          {/* <div className="mb-5 flex justify-center"> */}
          <div className="mb-2 flex -translate-y-4 justify-center">
            <div className="relative">
              <div className="absolute inset-0 scale-125 rounded-3xl bg-blue-500/25 blur-2xl" />

              <div className="bg-linear-to-br h-17 w-17 relative flex items-center justify-center rounded-[22px] from-blue-500 via-blue-600 to-indigo-600 text-white shadow-xl shadow-blue-500/25 ring-1 ring-white/20">
                <ShieldCheck className="h-8 w-8" />
              </div>

              <div className="border-background absolute -bottom-1.5 -right-1.5 flex h-7 w-7 items-center justify-center rounded-full border-[3px] bg-emerald-500 text-white shadow-md">
                <Check className="stroke-3 h-3.5 w-3.5" />
              </div>
            </div>
          </div>

          {/* ==================================================
              CARD
          ================================================== */}

          <div className="bg-card/90 dark:bg-card/85 overflow-hidden rounded-[28px] border border-white/70 shadow-[0_24px_80px_-20px_rgba(15,23,42,0.18)] backdrop-blur-xl dark:border-white/10 dark:shadow-black/40">
            {/* ================================================
                HEADER
            ================================================ */}

            <div className="border-border/70 relative overflow-hidden border-b px-6 pb-6 pt-7 text-center sm:px-8">
              <div
                aria-hidden="true"
                className="absolute left-1/2 top-0 h-24 w-52 -translate-x-1/2 rounded-full bg-blue-500/5 blur-3xl"
              />

              <div className="relative">
                <div className="mb-3 inline-flex items-center gap-1.5 rounded-full border border-blue-200/70 bg-blue-50 px-3 py-1.5 text-[11px] font-bold uppercase tracking-[0.12em] text-blue-600 dark:border-blue-800/60 dark:bg-blue-950/50 dark:text-blue-400">
                  <Sparkles className="h-3.5 w-3.5" />
                  เข้าสู่ระบบครั้งแรก
                </div>

                {/* <div className="mb-2 flex items-center justify-center gap-2">
                  <KeyRound className="h-4 w-4 text-blue-500" />

                  <span className="text-xs font-bold uppercase tracking-[0.15em] text-blue-600 dark:text-blue-400">
                    Security Setup
                  </span>
                </div> */}

                <h1 className="text-foreground text-2xl font-bold tracking-tight sm:text-[28px]">
                  ตั้งรหัสผ่านใหม่
                </h1>

                <p className="text-muted-foreground mx-auto mt-2.5 max-w-sm text-xs leading-6">
                  เพื่อความปลอดภัยของบัญชี กรุณากำหนดรหัสผ่านใหม่
                  ก่อนเริ่มใช้งานระบบ
                </p>
              </div>
            </div>

            {/* ================================================
                FORM
            ================================================ */}

            <form onSubmit={handleSubmit} className="space-y-5 p-6 sm:p-8">
              {/* ==============================================
                  PASSWORD
              ============================================== */}

              <div>
                <label
                  htmlFor="password"
                  className="text-foreground mb-2 flex items-center gap-2 text-sm font-semibold"
                >
                  <span className="flex h-6 w-6 items-center justify-center rounded-lg bg-blue-500/10 text-blue-600 dark:text-blue-400">
                    <LockKeyhole className="h-3.5 w-3.5" />
                  </span>
                  รหัสผ่านใหม่
                </label>

                <div className="group relative">
                  <LockKeyhole className="text-muted-foreground h-4.5 w-4.5 pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 transition group-focus-within:text-blue-500" />

                  <input
                    id="password"
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(event) => setPassword(event.target.value)}
                    autoComplete="new-password"
                    placeholder="กรอกรหัสผ่านใหม่"
                    disabled={isSubmitting}
                    className="border-border bg-background/80 text-foreground placeholder:text-muted-foreground/60 focus:bg-background h-13 w-full rounded-2xl border py-2 pl-12 pr-12 text-sm shadow-sm outline-none transition-all hover:border-blue-300 focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 disabled:cursor-not-allowed disabled:opacity-60 dark:hover:border-blue-700"
                  />

                  <button
                    type="button"
                    onClick={() => setShowPassword((value) => !value)}
                    disabled={isSubmitting}
                    aria-label={showPassword ? 'ซ่อนรหัสผ่าน' : 'แสดงรหัสผ่าน'}
                    className="text-muted-foreground hover:bg-muted hover:text-foreground absolute right-2.5 top-1/2 flex h-9 w-9 -translate-y-1/2 items-center justify-center rounded-xl transition disabled:pointer-events-none"
                  >
                    {showPassword ? (
                      <EyeOff className="h-4.5 w-4.5" />
                    ) : (
                      <Eye className="h-4.5 w-4.5" />
                    )}
                  </button>
                </div>

                {/* STRENGTH */}

                {password && (
                  <div className="bg-muted/30 mt-3 rounded-xl px-3 py-2.5">
                    <div className="flex gap-1.5">
                      {[1, 2, 3].map((item) => (
                        <div
                          key={item}
                          className={`h-1.5 flex-1 rounded-full transition-all duration-300 ${
                            strength.value >= item
                              ? strength.value === 1
                                ? 'bg-rose-500'
                                : strength.value === 2
                                  ? 'bg-amber-500'
                                  : 'bg-emerald-500'
                              : 'bg-muted'
                          }`}
                        />
                      ))}
                    </div>

                    <div className="mt-2 flex items-center justify-between gap-3">
                      <span className="text-muted-foreground text-[11px]">
                        ความแข็งแรงของรหัสผ่าน
                      </span>

                      <span
                        className={`text-[11px] font-semibold ${
                          strength.value === 1
                            ? 'text-rose-500'
                            : strength.value === 2
                              ? 'text-amber-500'
                              : 'text-emerald-500'
                        }`}
                      >
                        {strength.label}
                      </span>
                    </div>
                  </div>
                )}
              </div>

              {/* ==============================================
                  CONFIRM
              ============================================== */}

              <div>
                <label
                  htmlFor="confirmPassword"
                  className="text-foreground mb-2 flex items-center gap-2 text-sm font-semibold"
                >
                  <span className="flex h-6 w-6 items-center justify-center rounded-lg bg-indigo-500/10 text-indigo-600 dark:text-indigo-400">
                    <ShieldCheck className="h-3.5 w-3.5" />
                  </span>
                  ยืนยันรหัสผ่านใหม่
                </label>

                <div className="group relative">
                  <LockKeyhole
                    className={`h-4.5 w-4.5 pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 transition ${
                      passwordMismatch
                        ? 'text-rose-500'
                        : passwordsMatch
                          ? 'text-emerald-500'
                          : 'text-muted-foreground group-focus-within:text-blue-500'
                    }`}
                  />

                  <input
                    id="confirmPassword"
                    type={showConfirmPassword ? 'text' : 'password'}
                    value={confirmPassword}
                    onChange={(event) => setConfirmPassword(event.target.value)}
                    autoComplete="new-password"
                    placeholder="กรอกรหัสผ่านอีกครั้ง"
                    disabled={isSubmitting}
                    className={`bg-background/80 text-foreground placeholder:text-muted-foreground/60 focus:bg-background h-13 w-full rounded-2xl border py-2 pl-12 pr-12 text-sm shadow-sm outline-none transition-all focus:ring-4 disabled:cursor-not-allowed disabled:opacity-60 ${
                      passwordMismatch
                        ? 'border-rose-500 focus:border-rose-500 focus:ring-rose-500/10'
                        : passwordsMatch
                          ? 'border-emerald-500 focus:border-emerald-500 focus:ring-emerald-500/10'
                          : 'border-border hover:border-blue-300 focus:border-blue-500 focus:ring-blue-500/10 dark:hover:border-blue-700'
                    }`}
                  />

                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword((value) => !value)}
                    disabled={isSubmitting}
                    aria-label={
                      showConfirmPassword ? 'ซ่อนรหัสผ่าน' : 'แสดงรหัสผ่าน'
                    }
                    className="text-muted-foreground hover:bg-muted hover:text-foreground absolute right-2.5 top-1/2 flex h-9 w-9 -translate-y-1/2 items-center justify-center rounded-xl transition disabled:pointer-events-none"
                  >
                    {showConfirmPassword ? (
                      <EyeOff className="h-4.5 w-4.5" />
                    ) : (
                      <Eye className="h-4.5 w-4.5" />
                    )}
                  </button>
                </div>

                {passwordMismatch && (
                  <div className="mt-2 flex items-center gap-1.5 text-xs font-medium text-rose-500">
                    <span className="h-1.5 w-1.5 rounded-full bg-rose-500" />
                    รหัสผ่านทั้งสองช่องไม่ตรงกัน
                  </div>
                )}

                {passwordsMatch && (
                  <div className="mt-2 flex items-center gap-1.5 text-xs font-medium text-emerald-600 dark:text-emerald-400">
                    <span className="flex h-4 w-4 items-center justify-center rounded-full bg-emerald-500 text-white">
                      <Check className="stroke-3 h-2.5 w-2.5" />
                    </span>
                    รหัสผ่านตรงกัน
                  </div>
                )}
              </div>

              {/* ==============================================
                  REQUIREMENTS
              ============================================== */}

              <div className="border-border/80 bg-muted/30 rounded-2xl border p-4">
                <div className="mb-3 flex items-center justify-between gap-3">
                  <div>
                    <p className="text-foreground text-xs font-semibold">
                      รหัสผ่านควรประกอบด้วย
                    </p>

                    <p className="text-muted-foreground mt-0.5 text-[11px]">
                      เพื่อช่วยเพิ่มความปลอดภัยของบัญชี
                    </p>
                  </div>

                  <div
                    className={`flex h-8 min-w-12 items-center justify-center rounded-xl px-2 text-xs font-bold ${
                      passedRules === passwordRules.length
                        ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400'
                        : 'bg-background text-muted-foreground'
                    }`}
                  >
                    {passedRules}/{passwordRules.length}
                  </div>
                </div>

                <div className="grid gap-2">
                  {passwordRules.map((rule) => (
                    <div
                      key={rule.label}
                      className={`flex items-center gap-2.5 rounded-xl px-2.5 py-2 transition ${
                        rule.passed ? 'bg-emerald-500/5' : ''
                      }`}
                    >
                      <div
                        className={`flex h-5 w-5 shrink-0 items-center justify-center rounded-full transition-all ${
                          rule.passed
                            ? 'scale-100 bg-emerald-500 text-white shadow-sm shadow-emerald-500/20'
                            : 'border-border bg-background border text-transparent'
                        }`}
                      >
                        <Check className="stroke-3 h-3 w-3" />
                      </div>

                      <span
                        className={`text-xs transition ${
                          rule.passed
                            ? 'font-medium text-emerald-600 dark:text-emerald-400'
                            : 'text-muted-foreground'
                        }`}
                      >
                        {rule.label}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              {/* ==============================================
                  SUBMIT
              ============================================== */}

              <button
                type="submit"
                disabled={!canSubmit}
                className="bg-linear-to-r h-13 group relative flex w-full items-center justify-center gap-2 overflow-hidden rounded-2xl from-blue-600 via-blue-600 to-indigo-600 px-5 text-sm font-semibold text-white shadow-lg shadow-blue-500/20 transition-all duration-200 hover:-translate-y-0.5 hover:shadow-xl hover:shadow-blue-500/30 active:translate-y-0 active:scale-[0.99] disabled:pointer-events-none disabled:translate-y-0 disabled:opacity-45 disabled:shadow-none"
              >
                <div className="bg-linear-to-r absolute inset-0 -translate-x-full from-transparent via-white/10 to-transparent transition-transform duration-700 group-hover:translate-x-full" />

                {isSubmitting ? (
                  <>
                    <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white" />

                    <span className="relative">กำลังบันทึก...</span>
                  </>
                ) : (
                  <>
                    <ShieldCheck className="h-4.5 w-4.5 relative" />

                    <span className="relative">บันทึกรหัสผ่านใหม่</span>

                    <ArrowRight className="relative h-4 w-4 transition-transform duration-200 group-hover:translate-x-1" />
                  </>
                )}
              </button>

              <p className="text-muted-foreground text-center text-[11px] leading-5">
                เมื่อบันทึกแล้ว คุณสามารถใช้รหัสผ่านใหม่นี้
                ในการเข้าสู่ระบบครั้งถัดไป
              </p>
            </form>
          </div>

          {/* ==================================================
              FOOTER
          ================================================== */}

          <div className="mt-5 flex items-center justify-center">
            <div className="border-border/60 bg-background/60 text-muted-foreground inline-flex items-center gap-2 rounded-full border px-4 py-2 text-[11px] shadow-sm backdrop-blur-md">
              <div className="flex h-5 w-5 items-center justify-center rounded-full bg-emerald-500/10">
                <ShieldCheck className="h-3 w-3 text-emerald-500" />
              </div>

              <span>รหัสผ่านของคุณจะถูกเข้ารหัสและจัดเก็บอย่างปลอดภัย</span>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
