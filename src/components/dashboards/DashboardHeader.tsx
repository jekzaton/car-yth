'use client';

import { CalendarDays, CarFront, RefreshCw, Search } from 'lucide-react';
import { useRef } from 'react';

type DashboardHeaderProps = {
  startDate: string;
  endDate: string;
  isLoading: boolean;
  error?: string | null;

  onStartDateChange: (value: string) => void;
  onEndDateChange: (value: string) => void;
  onThisMonth: () => void;
  onApplyDate: () => void;
  onRefresh: () => void;
};

export default function DashboardHeader({
  startDate,
  endDate,
  isLoading,
  error,
  onStartDateChange,
  onEndDateChange,
  onThisMonth,
  onApplyDate,
  onRefresh,
}: DashboardHeaderProps) {
  return (
    <div className="border-border bg-card overflow-hidden rounded-3xl border shadow-sm">
      {/* =====================================================
          HEADER
      ====================================================== */}

      <div className="bg-linear-to-br relative overflow-hidden from-blue-600 via-indigo-600 to-violet-600 px-6 py-6 text-white lg:px-8">
        {/* DECORATION */}

        <div className="absolute -right-16 -top-20 h-56 w-56 rounded-full bg-white/10 blur-3xl" />

        <div className="absolute -bottom-24 left-1/3 h-48 w-48 rounded-full bg-cyan-400/15 blur-3xl" />

        <div className="relative flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
          {/* TITLE */}

          <div className="flex items-center gap-4">
            <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl border border-white/20 bg-white/15 shadow-lg backdrop-blur">
              <CarFront className="h-7 w-7" />
            </div>

            <div>
              <p className="mb-1 text-xs font-semibold uppercase tracking-[0.18em] text-blue-100">
                Vehicle Expense Dashboard
              </p>

              <h1 className="text-2xl font-bold tracking-tight lg:text-3xl">
                ภาพรวมค่าใช้จ่ายรถยนต์
              </h1>

              <p className="mt-1 text-sm text-blue-100">
                ติดตามค่าน้ำมันและค่าซ่อมบำรุง ตามช่วงวันที่
              </p>
            </div>
          </div>

          {/* REFRESH */}

          <button
            type="button"
            onClick={onRefresh}
            disabled={isLoading}
            className="inline-flex h-10 items-center justify-center gap-2 self-start rounded-xl border border-white/20 bg-white/10 px-4 text-sm font-semibold text-white backdrop-blur transition-all hover:bg-white/20 disabled:cursor-not-allowed disabled:opacity-60 lg:self-auto"
          >
            <RefreshCw
              className={`h-4 w-4 ${isLoading ? 'animate-spin' : ''}`}
            />

            {isLoading ? 'กำลังโหลด...' : 'รีเฟรช'}
          </button>
        </div>
      </div>

      {/* =====================================================
          DATE FILTER
      ====================================================== */}

      <div className="p-5 lg:p-6">
        <div className="flex flex-col gap-4 xl:flex-row xl:items-end xl:justify-between">
          {/* LABEL */}

          <div>
            <div className="flex items-center gap-2">
              <div className="bg-brand-500/10 text-brand-500 flex h-8 w-8 items-center justify-center rounded-lg">
                <CalendarDays className="h-4 w-4" />
              </div>

              <h2 className="text-foreground text-sm font-bold">
                ช่วงวันที่แสดงผล
              </h2>
            </div>

            <p className="text-muted-foreground mt-1.5 pl-10 text-xs">
              KPI และกราฟทั้งหมดจะคำนวณจากช่วงวันที่ที่เลือก
            </p>
          </div>

          {/* FILTER */}

          <div className="grid grid-cols-1 gap-3 sm:grid-cols-[1fr_auto_1fr_auto_auto] sm:items-center">
            <DateInput
              value={startDate}
              max={endDate || undefined}
              onChange={onStartDateChange}
            />

            <span className="text-muted-foreground hidden text-xs font-medium sm:block">
              ถึง
            </span>

            <DateInput
              value={endDate}
              min={startDate || undefined}
              onChange={onEndDateChange}
            />

            <button
              type="button"
              onClick={onThisMonth}
              disabled={isLoading}
              className="border-border bg-background text-foreground hover:border-brand-500/30 hover:bg-muted h-11 whitespace-nowrap rounded-xl border px-4 text-sm font-semibold transition-all disabled:cursor-not-allowed disabled:opacity-60"
            >
              เดือนนี้
            </button>

            <button
              type="button"
              onClick={onApplyDate}
              disabled={isLoading}
              className="bg-brand-500 shadow-theme-xs hover:bg-brand-600 inline-flex h-11 items-center justify-center gap-2 whitespace-nowrap rounded-xl px-5 text-sm font-bold text-white transition-all disabled:cursor-not-allowed disabled:opacity-60"
            >
              {isLoading ? (
                <RefreshCw className="h-4 w-4 animate-spin" />
              ) : (
                <Search className="h-4 w-4" />
              )}
              แสดงผล
            </button>
          </div>
        </div>

        {/* ERROR */}

        {error && (
          <div className="mt-4 rounded-xl border border-rose-500/20 bg-rose-500/10 px-4 py-3 text-sm font-medium text-rose-600 dark:text-rose-300">
            {error}
          </div>
        )}
      </div>
    </div>
  );
}

// DATE INPUT

type DateInputProps = {
  value: string;
  min?: string;
  max?: string;
  onChange: (value: string) => void;
};

function DateInput({ value, min, max, onChange }: DateInputProps) {
  const inputRef = useRef<HTMLInputElement>(null);

  const openPicker = () => {
    const input = inputRef.current;

    if (!input) return;

    try {
      input.showPicker();
    } catch {
      input.focus();
    }
  };

  return (
    <div className="group relative">
      <input
        ref={inputRef}
        type="date"
        value={value}
        min={min}
        max={max}
        onClick={openPicker}
        onChange={(event) => onChange(event.target.value)}
        className="input-date-icon border-border bg-background text-foreground hover:border-brand-500/40 focus:border-brand-500 focus:ring-brand-500/10 h-11 w-full cursor-pointer rounded-xl border px-3 pr-11 text-sm font-semibold shadow-sm outline-none transition-all focus:ring-4"
      />

      <button
        type="button"
        tabIndex={-1}
        onClick={openPicker}
        className="bg-brand-500/10 text-brand-500 hover:bg-brand-500 absolute right-2 top-1/2 flex h-8 w-8 -translate-y-1/2 items-center justify-center rounded-lg transition-all hover:text-white"
        aria-label="เลือกวันที่"
      >
        <CalendarDays className="h-4 w-4" />
      </button>
    </div>
  );
}
