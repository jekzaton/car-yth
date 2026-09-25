'use client';

import {
  CalendarDays,
  CarFront,
  CircleDollarSign,
  Plus,
  RefreshCw,
  Search,
  Settings,
  Wrench,
  X,
} from 'lucide-react';
import { useEffect, useRef, useState } from 'react';

type MaintainHeaderProps = {
  search: string;

  startDate: string;
  endDate: string;

  total: number;
  totalCars: number;
  totalPrice: number;

  isLoading: boolean;

  onSearchChange: (value: string) => void;

  onDateChange: (startDate: string, endDate: string) => void;

  onRefresh: () => void;
  onCreate: () => void;
};

export default function MaintainHeader({
  search,
  startDate,
  endDate,
  total,
  totalCars,
  totalPrice,
  isLoading,
  onSearchChange,
  onDateChange,
  onRefresh,
  onCreate,
}: MaintainHeaderProps) {
  const [tempStartDate, setTempStartDate] = useState(startDate);

  const [tempEndDate, setTempEndDate] = useState(endDate);
  const startDateRef = useRef<HTMLInputElement>(null);

  const endDateRef = useRef<HTMLInputElement>(null);
  const openDatePicker = (ref: React.RefObject<HTMLInputElement | null>) => {
    const input = ref.current;

    if (!input) return;

    try {
      input.showPicker();
    } catch {
      input.focus();
    }
  };

  useEffect(() => {
    setTempStartDate(startDate);
    setTempEndDate(endDate);
  }, [startDate, endDate]);

  const hasDateFilter = Boolean(startDate || endDate);

  const handleApplyDate = () => {
    if (tempStartDate && tempEndDate && tempStartDate > tempEndDate) {
      return;
    }

    onDateChange(tempStartDate, tempEndDate);
  };

  const handleClearDate = () => {
    setTempStartDate('');
    setTempEndDate('');

    onDateChange('', '');
  };
  return (
    <section className="border-border bg-card text-card-foreground relative overflow-hidden rounded-3xl border p-5 shadow-sm">
      {/* =====================================================
          DECORATION
      ====================================================== */}

      <div className="pointer-events-none absolute -right-20 -top-20 h-56 w-56 rounded-full bg-amber-400/10 blur-3xl" />

      <div className="pointer-events-none absolute -bottom-24 left-1/3 h-48 w-48 rounded-full bg-orange-400/5 blur-3xl" />

      <div className="relative">
        {/* ===================================================
            TITLE + ACTION
        ==================================================== */}

        <div className="flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
          {/* TITLE */}

          <div className="flex items-center gap-4">
            <div
              className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl text-white shadow-lg"
              style={{
                background:
                  'linear-gradient(135deg, rgb(245 158 11), rgb(249 115 22), rgb(244 63 94))',
                boxShadow: '0 10px 25px rgba(249, 115, 22, 0.20)',
              }}
            >
              <Wrench className="h-7 w-7" stroke="#ffffff" strokeWidth={2.2} />
            </div>

            <div className="min-w-0">
              <div className="flex flex-wrap items-center gap-2">
                <h1 className="text-foreground text-xl font-bold sm:text-2xl">
                  การซ่อมบำรุงรถยนต์
                </h1>

                <span className="inline-flex shrink-0 items-center rounded-full border border-amber-500/10 bg-amber-500/10 px-2.5 py-1 text-[11px] font-bold text-amber-700 dark:text-amber-300">
                  {total.toLocaleString('th-TH')} รายการ
                </span>
              </div>

              <p className="text-muted-foreground mt-1 text-sm">
                จัดการประวัติการซ่อมและบำรุงรักษารถยนต์
              </p>
            </div>
          </div>

          {/* ACTION */}

          <div className="flex flex-wrap items-center gap-2">
            {/* REFRESH */}

            <button
              type="button"
              onClick={onRefresh}
              disabled={isLoading}
              className="border-border bg-background text-muted-foreground inline-flex h-11 items-center justify-center gap-2 rounded-xl border px-4 text-sm font-semibold shadow-sm transition-all hover:border-amber-500/20 hover:bg-amber-500/5 hover:text-amber-700 disabled:cursor-not-allowed disabled:opacity-50 dark:hover:text-amber-300"
            >
              <RefreshCw
                className={`h-4 w-4 ${isLoading ? 'animate-spin' : ''}`}
              />

              <span className="hidden sm:inline">รีเฟรช</span>
            </button>

            {/* CREATE */}

            <button
              type="button"
              onClick={onCreate}
              className="inline-flex h-11 items-center justify-center gap-2 rounded-xl px-5 text-sm font-bold text-white shadow-md transition-all hover:-translate-y-0.5 hover:shadow-lg active:translate-y-0"
              style={{
                background:
                  'linear-gradient(90deg, rgb(245 158 11), rgb(249 115 22), rgb(244 63 94))',
                boxShadow: '0 8px 20px rgba(249, 115, 22, 0.20)',
              }}
            >
              <Plus className="h-4 w-4" stroke="#ffffff" strokeWidth={2.5} />
              เพิ่มข้อมูล
            </button>
          </div>
        </div>

        {/* ===================================================
            KPI
        ==================================================== */}

        <div className="mt-5 grid grid-cols-1 gap-3 sm:grid-cols-3">
          <StatCard
            icon={<Settings className="h-5 w-5" />}
            label="รายการซ่อมบำรุง"
            value={`${total.toLocaleString('th-TH')} รายการ`}
          />

          <StatCard
            icon={<CarFront className="h-5 w-5" />}
            label="รถที่มีประวัติ"
            value={`${totalCars.toLocaleString('th-TH')} คัน`}
          />

          <StatCard
            icon={<CircleDollarSign className="h-5 w-5" />}
            label="ค่าใช้จ่ายรวม"
            value={`${formatMoney(totalPrice)} บาท`}
          />
        </div>

        {/* ===================================================
    SEARCH + DATE FILTER
==================================================== */}

        <div className="border-border bg-muted/20 mt-5 rounded-2xl border p-3">
          <div className="flex flex-col gap-3 xl:flex-row xl:items-end">
            {/* =================================================
        SEARCH
    ================================================== */}

            <div className="min-w-0 flex-1">
              <label className="text-muted-foreground mb-1.5 flex items-center gap-1.5 text-[11px] font-semibold">
                <Search className="h-3.5 w-3.5 text-amber-500" />
                ค้นหาข้อมูล
              </label>

              <div className="relative">
                <Search className="text-muted-foreground pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2" />

                <input
                  type="text"
                  value={search}
                  onChange={(event) => onSearchChange(event.target.value)}
                  placeholder="ค้นหา รถ, ทะเบียน, ผู้ดำเนินการ, รายละเอียดการซ่อม..."
                  className="border-border bg-background text-foreground placeholder:text-muted-foreground h-11 w-full rounded-xl border pl-10 pr-10 text-sm shadow-sm outline-none transition-all hover:border-amber-500/30 focus:border-amber-500 focus:ring-4 focus:ring-amber-500/10"
                />

                {search && (
                  <button
                    type="button"
                    onClick={() => onSearchChange('')}
                    title="ล้างคำค้นหา"
                    className="text-muted-foreground absolute right-2 top-1/2 flex h-7 w-7 -translate-y-1/2 items-center justify-center rounded-lg transition hover:bg-rose-500/10 hover:text-rose-600"
                  >
                    <X className="h-3.5 w-3.5" />
                  </button>
                )}
              </div>
            </div>

            {/* =================================================
        DATE RANGE
    ================================================== */}

            <div className="shrink-0">
              <label className="text-muted-foreground mb-1.5 flex items-center gap-1.5 text-[11px] font-semibold">
                <CalendarDays className="h-3.5 w-3.5 text-amber-500" />
                ช่วงวันที่ซ่อมบำรุง
                {hasDateFilter && (
                  <span className="ml-1 rounded-full bg-amber-500/10 px-2 py-0.5 text-[9px] font-bold text-amber-700 dark:text-amber-300">
                    กำลังกรอง
                  </span>
                )}
              </label>

              <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
                {/* START DATE */}

                <div className="relative">
                  <CalendarDays className="pointer-events-none absolute left-3 top-1/2 z-10 h-4 w-4 -translate-y-1/2 text-amber-500" />

                  <input
                    ref={startDateRef}
                    type="date"
                    value={tempStartDate}
                    onChange={(event) => setTempStartDate(event.target.value)}
                    onClick={() => openDatePicker(startDateRef)}
                    max={tempEndDate || undefined}
                    aria-label="วันที่เริ่มต้น"
                    className="border-border bg-background text-foreground h-11 w-full cursor-pointer rounded-xl border pl-10 pr-3 text-sm font-medium shadow-sm outline-none transition-all hover:border-amber-500/30 focus:border-amber-500 focus:ring-4 focus:ring-amber-500/10 sm:w-44"
                  />
                </div>
                {/* SEPARATOR */}

                <div className="hidden items-center gap-1 sm:flex">
                  <div className="bg-border h-px w-2" />

                  <span className="text-muted-foreground text-[11px] font-medium">
                    ถึง
                  </span>

                  <div className="bg-border h-px w-2" />
                </div>

                {/* END DATE */}

                <div className="relative">
                  <CalendarDays className="pointer-events-none absolute left-3 top-1/2 z-10 h-4 w-4 -translate-y-1/2 text-amber-500" />

                  <input
                    ref={endDateRef}
                    type="date"
                    value={tempEndDate}
                    onChange={(event) => setTempEndDate(event.target.value)}
                    onClick={() => openDatePicker(endDateRef)}
                    min={tempStartDate || undefined}
                    aria-label="วันที่สิ้นสุด"
                    className="border-border bg-background text-foreground h-11 w-full cursor-pointer rounded-xl border pl-10 pr-3 text-sm font-medium shadow-sm outline-none transition-all hover:border-amber-500/30 focus:border-amber-500 focus:ring-4 focus:ring-amber-500/10 sm:w-44"
                  />
                </div>

                {/* APPLY */}

                <button
                  type="button"
                  onClick={handleApplyDate}
                  disabled={Boolean(
                    tempStartDate && tempEndDate && tempStartDate > tempEndDate,
                  )}
                  className="inline-flex h-11 shrink-0 items-center justify-center gap-2 rounded-xl px-5 text-sm font-bold text-white shadow-sm transition-all hover:-translate-y-0.5 hover:shadow-md disabled:translate-y-0 disabled:cursor-not-allowed disabled:opacity-50"
                  style={{
                    background:
                      'linear-gradient(90deg, rgb(245 158 11), rgb(249 115 22))',
                  }}
                >
                  <Search
                    className="h-4 w-4"
                    stroke="#ffffff"
                    strokeWidth={2.5}
                  />
                  ค้นหา
                </button>

                {/* CLEAR DATE */}

                {(hasDateFilter || tempStartDate || tempEndDate) && (
                  <button
                    type="button"
                    onClick={handleClearDate}
                    title="ล้างช่วงวันที่"
                    className="border-border bg-background text-muted-foreground inline-flex h-11 shrink-0 items-center justify-center gap-2 rounded-xl border px-3.5 text-sm font-semibold shadow-sm transition-all hover:border-rose-500/30 hover:bg-rose-500/5 hover:text-rose-600"
                  >
                    <X className="h-4 w-4" />

                    <span className="sm:hidden 2xl:inline">ล้าง</span>
                  </button>
                )}
              </div>
            </div>
          </div>

          {/* =================================================
      ACTIVE FILTER
  ================================================== */}

          {hasDateFilter && (
            <div className="border-border/60 mt-3 flex flex-wrap items-center gap-2 border-t pt-3">
              <span className="text-muted-foreground text-[11px] font-medium">
                กรองข้อมูล:
              </span>

              <div className="inline-flex items-center gap-1.5 rounded-lg border border-amber-500/10 bg-amber-500/10 px-2.5 py-1.5 text-[11px] font-semibold text-amber-700 dark:text-amber-300">
                <CalendarDays className="h-3.5 w-3.5" />

                {startDate ? formatFilterDate(startDate) : 'เริ่มต้น'}

                <span className="opacity-50">—</span>

                {endDate ? formatFilterDate(endDate) : 'ปัจจุบัน'}

                <button
                  type="button"
                  onClick={handleClearDate}
                  title="ยกเลิกตัวกรองวันที่"
                  className="ml-1 flex h-5 w-5 items-center justify-center rounded-md transition hover:bg-amber-500/20"
                >
                  <X className="h-3 w-3" />
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}

// STAT CARD

function StatCard({
  icon,
  label,
  value,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
}) {
  return (
    <div className="border-border bg-background/60 hover:bg-amber-500/3 group rounded-2xl border p-4 transition-all duration-200 hover:border-amber-500/20 hover:shadow-sm">
      <div className="flex items-center gap-3">
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-amber-500/10 text-amber-600 transition-transform duration-200 group-hover:scale-105 dark:text-amber-300">
          {icon}
        </div>

        <div className="min-w-0">
          <p className="text-muted-foreground text-[11px] font-medium">
            {label}
          </p>

          <p className="text-foreground mt-0.5 truncate text-base font-bold">
            {value}
          </p>
        </div>
      </div>
    </div>
  );
}

// FORMAT MONEY

function formatMoney(value: number | string | null | undefined): string {
  const amount = Number(value ?? 0);

  if (!Number.isFinite(amount)) {
    return '0.00';
  }

  return new Intl.NumberFormat('th-TH', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(amount);
}

function formatFilterDate(value: string): string {
  if (!value) {
    return '-';
  }

  const match = value.match(/^(\d{4})-(\d{2})-(\d{2})$/);

  if (!match) {
    return value;
  }

  const date = new Date(
    Number(match[1]),
    Number(match[2]) - 1,
    Number(match[3]),
  );

  if (Number.isNaN(date.getTime())) {
    return value;
  }

  return new Intl.DateTimeFormat('th-TH', {
    day: '2-digit',
    month: 'short',
    year: '2-digit',
  }).format(date);
}
