'use client';

import {
  CalendarDays,
  CarFront,
  Check,
  Plus,
  RotateCcw,
  Search,
  X,
} from 'lucide-react';
import { useEffect, useState } from 'react';

type UsageHeaderProps = {
  search: string;
  total: number;

  startDate: string;
  endDate: string;

  onSearchChange: (value: string) => void;
  onStartDateChange: (value: string) => void;
  onEndDateChange: (value: string) => void;
  onClearDate: () => void;

  // เพิ่ม
  onCreate: () => void;
};

export default function UsageHeader({
  search,
  total,
  startDate,
  endDate,
  onSearchChange,
  onStartDateChange,
  onEndDateChange,
  onClearDate,
  onCreate,
}: UsageHeaderProps) {
  const [dateModalOpen, setDateModalOpen] = useState(false);

  const [tempStartDate, setTempStartDate] = useState(startDate);

  const [tempEndDate, setTempEndDate] = useState(endDate);

  useEffect(() => {
    if (!dateModalOpen) return;

    setTempStartDate(startDate);
    setTempEndDate(endDate);
  }, [dateModalOpen, startDate, endDate]);

  const handleOpenDateModal = () => {
    setTempStartDate(startDate);
    setTempEndDate(endDate);
    setDateModalOpen(true);
  };

  const handleConfirmDate = () => {
    if (tempStartDate && tempEndDate && tempStartDate > tempEndDate) {
      return;
    }

    onStartDateChange(tempStartDate);
    onEndDateChange(tempEndDate);

    setDateModalOpen(false);
  };

  const handleClearTempDate = () => {
    setTempStartDate('');
    setTempEndDate('');
  };
  return (
    <div className="bg-linear-to-r relative overflow-hidden rounded-3xl border border-gray-100 from-white via-white to-blue-50/60 p-5 shadow-sm dark:border-white/10 dark:from-gray-900 dark:via-gray-900 dark:to-blue-950/20">
      {/* GLOW */}
      <div className="pointer-events-none absolute -right-16 -top-16 h-48 w-48 rounded-full bg-blue-500/10 blur-3xl" />

      <div className="relative">
        {/* ================= HEADER ================= */}
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div className="flex items-center gap-4">
            {/* ICON */}
            <div
              className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl text-white shadow-lg"
              style={{
                background:
                  'linear-gradient(135deg, rgb(245 158 11), rgb(249 115 22), rgb(244 63 94))',
                boxShadow: '0 10px 25px rgba(249,115,22,0.22)',
              }}
            >
              <CarFront
                className="h-6 w-6"
                strokeWidth={2.3}
                stroke="#ffffff"
              />
            </div>

            <div>
              <div className="flex flex-wrap items-center gap-2">
                <h1 className="text-foreground text-lg font-bold">
                  รายการเติมน้ำมันรถยนต์
                </h1>

                <span className="inline-flex items-center rounded-full border border-amber-500/20 bg-amber-500/10 px-2.5 py-1 text-[10px] font-semibold text-amber-700 dark:text-amber-300">
                  {total.toLocaleString('th-TH')} รายการ
                </span>
              </div>

              <p className="text-muted-foreground mt-1 text-xs">
                ตรวจสอบและบันทึกข้อมูลการเติมน้ำมันรถยนต์
              </p>
            </div>
          </div>

          {/* ================= CREATE ================= */}
          <button
            type="button"
            onClick={onCreate}
            className="group inline-flex h-11 w-full items-center justify-center gap-2 rounded-xl px-5 text-sm font-semibold text-white shadow-md transition-all duration-200 hover:-translate-y-0.5 hover:shadow-lg active:translate-y-0 sm:w-auto"
            style={{
              background:
                'linear-gradient(90deg, rgb(245 158 11), rgb(249 115 22), rgb(244 63 94))',
              color: '#ffffff',
              boxShadow: '0 8px 20px rgba(249,115,22,0.20)',
            }}
          >
            <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-white/15 ring-1 ring-white/20 transition-transform group-hover:scale-105">
              <Plus size={17} strokeWidth={2.5} stroke="#ffffff" />
            </span>

            <span className="text-white">เพิ่มข้อมูลเติมน้ำมัน</span>
          </button>
        </div>

        {/* ================= FILTER ================= */}
        <div className="mt-5 flex flex-col gap-3 xl:flex-row xl:items-end">
          {/* ================= SEARCH ================= */}
          <div className="w-full xl:flex-1">
            <label className="text-muted-foreground mb-1.5 block text-[11px] font-semibold">
              ค้นหารายการ
            </label>

            <div className="relative">
              <Search className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-amber-500" />

              <input
                type="text"
                value={search}
                onChange={(event) => onSearchChange(event.target.value)}
                placeholder="ค้นหา คนขับ รถ ทะเบียน หรือชนิดน้ำมัน..."
                className="border-border bg-background text-foreground placeholder:text-muted-foreground h-11 w-full rounded-xl border pl-10 pr-4 text-sm font-medium shadow-sm outline-none transition-all duration-200 hover:border-amber-400/60 focus:border-amber-500 focus:ring-4 focus:ring-amber-500/10"
              />
            </div>
          </div>

          <div className="w-full xl:w-auto">
            <label className="text-muted-foreground mb-1.5 block text-[11px] font-semibold">
              ช่วงวันที่เติมน้ำมัน
            </label>

            <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
              {/* START DATE */}
              <div className="sm:w-45 relative min-w-0 flex-1">
                <CalendarDays className="pointer-events-none absolute left-3.5 top-1/2 z-10 h-4 w-4 -translate-y-1/2 text-amber-500" />

                <input
                  type="date"
                  value={tempStartDate}
                  onClick={(event) => {
                    event.currentTarget.showPicker?.();
                  }}
                  onChange={(event) => {
                    setTempStartDate(event.target.value);
                  }}
                  className="border-border bg-background text-foreground h-11 w-full cursor-pointer rounded-xl border pl-10 pr-3 text-sm font-medium shadow-sm outline-none transition-all hover:border-amber-400/60 focus:border-amber-500 focus:ring-4 focus:ring-amber-500/10"
                />
              </div>

              <span className="text-muted-foreground hidden text-xs sm:block">
                ถึง
              </span>

              {/* END DATE */}
              <div className="sm:w-45 relative min-w-0 flex-1">
                <CalendarDays className="pointer-events-none absolute left-3.5 top-1/2 z-10 h-4 w-4 -translate-y-1/2 text-orange-500" />

                <input
                  type="date"
                  value={tempEndDate}
                  min={tempStartDate || undefined}
                  onClick={(event) => {
                    event.currentTarget.showPicker?.();
                  }}
                  onChange={(event) => {
                    setTempEndDate(event.target.value);
                  }}
                  className="border-border bg-background text-foreground h-11 w-full cursor-pointer rounded-xl border pl-10 pr-3 text-sm font-medium shadow-sm outline-none transition-all hover:border-orange-400/60 focus:border-orange-500 focus:ring-4 focus:ring-orange-500/10"
                />
              </div>

              {/* CONFIRM */}
              <button
                type="button"
                disabled={
                  (!tempStartDate && !tempEndDate) ||
                  Boolean(
                    tempStartDate && tempEndDate && tempStartDate > tempEndDate,
                  )
                }
                onClick={() => {
                  onStartDateChange(tempStartDate);
                  onEndDateChange(tempEndDate);
                }}
                className="inline-flex h-11 shrink-0 items-center justify-center gap-2 rounded-xl px-5 text-xs font-semibold text-white shadow-md transition-all hover:-translate-y-0.5 hover:shadow-lg disabled:cursor-not-allowed disabled:opacity-40 disabled:hover:translate-y-0"
                style={{
                  background:
                    'linear-gradient(90deg, rgb(245 158 11), rgb(249 115 22))',
                }}
              >
                <Check className="h-4 w-4" stroke="#ffffff" />

                <span className="text-white">ตกลง</span>
              </button>

              {/* CLEAR */}
              <button
                type="button"
                disabled={
                  !search &&
                  !startDate &&
                  !endDate &&
                  !tempStartDate &&
                  !tempEndDate
                }
                onClick={() => {
                  setTempStartDate('');
                  setTempEndDate('');

                  onStartDateChange('');
                  onEndDateChange('');

                  // ถ้าต้องการให้ล้าง search ด้วย
                  onClearDate();
                }}
                className="border-border bg-background text-muted-foreground inline-flex h-11 shrink-0 items-center justify-center gap-2 rounded-xl border px-4 text-xs font-semibold shadow-sm transition-all hover:border-rose-500/30 hover:bg-rose-500/10 hover:text-rose-600 disabled:cursor-not-allowed disabled:opacity-40"
              >
                <RotateCcw className="h-4 w-4" />
                ล้าง
              </button>
            </div>
          </div>
        </div>
      </div>
      {dateModalOpen && (
        <div
          className="z-999999 fixed inset-0 flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm"
          onMouseDown={(event) => {
            if (event.target === event.currentTarget) {
              setDateModalOpen(false);
            }
          }}
        >
          <div className="border-border bg-card text-card-foreground relative w-full max-w-lg overflow-hidden rounded-3xl border shadow-2xl">
            {/* GLOW */}
            <div className="pointer-events-none absolute -right-20 -top-20 h-52 w-52 rounded-full bg-amber-500/10 blur-3xl" />

            {/* ================= HEADER ================= */}
            <div className="border-border relative flex items-start justify-between border-b p-5">
              <div className="flex items-center gap-3">
                <div
                  className="flex h-11 w-11 items-center justify-center rounded-2xl shadow-lg"
                  style={{
                    background:
                      'linear-gradient(135deg, rgb(245 158 11), rgb(249 115 22))',
                  }}
                >
                  <CalendarDays size={21} strokeWidth={2.4} stroke="#ffffff" />
                </div>

                <div>
                  <h2 className="text-foreground text-base font-bold">
                    เลือกช่วงวันที่
                  </h2>

                  <p className="text-muted-foreground mt-0.5 text-xs">
                    เลือกช่วงวันที่เติมน้ำมันที่ต้องการค้นหา
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setDateModalOpen(false)}
                className="border-border bg-background text-muted-foreground hover:bg-accent hover:text-foreground flex h-9 w-9 items-center justify-center rounded-xl border transition"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            {/* ================= BODY ================= */}
            <div className="relative p-5">
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                {/* START */}
                <div>
                  <label className="text-foreground mb-2 block text-xs font-semibold">
                    ตั้งแต่วันที่
                  </label>

                  <div className="relative">
                    <CalendarDays className="pointer-events-none absolute left-3.5 top-1/2 z-10 h-4 w-4 -translate-y-1/2 text-amber-500" />

                    <input
                      type="date"
                      value={tempStartDate}
                      onChange={(event) => {
                        const value = event.target.value;

                        setTempStartDate(value);

                        if (tempEndDate && value && value > tempEndDate) {
                          setTempEndDate('');
                        }
                      }}
                      className="border-border bg-background text-foreground h-12 w-full cursor-pointer rounded-xl border pl-10 pr-3 text-sm font-semibold shadow-sm outline-none transition-all hover:border-amber-400 focus:border-amber-500 focus:ring-4 focus:ring-amber-500/10"
                    />
                  </div>
                </div>

                {/* END */}
                <div>
                  <label className="text-foreground mb-2 block text-xs font-semibold">
                    ถึงวันที่
                  </label>

                  <div className="relative">
                    <CalendarDays className="pointer-events-none absolute left-3.5 top-1/2 z-10 h-4 w-4 -translate-y-1/2 text-orange-500" />

                    <input
                      type="date"
                      value={tempEndDate}
                      min={tempStartDate || undefined}
                      onChange={(event) => setTempEndDate(event.target.value)}
                      className="border-border bg-background text-foreground h-12 w-full cursor-pointer rounded-xl border pl-10 pr-3 text-sm font-semibold shadow-sm outline-none transition-all hover:border-orange-400 focus:border-orange-500 focus:ring-4 focus:ring-orange-500/10"
                    />
                  </div>
                </div>
              </div>

              {/* ================= PREVIEW ================= */}
              {(tempStartDate || tempEndDate) && (
                <div className="mt-5 rounded-2xl border border-amber-500/15 bg-amber-500/5 p-4">
                  <p className="text-muted-foreground text-[10px] font-semibold uppercase tracking-wide">
                    ช่วงวันที่ที่เลือก
                  </p>

                  <div className="mt-2 flex flex-wrap items-center gap-2">
                    <span className="rounded-lg bg-amber-500/10 px-3 py-1.5 text-xs font-bold text-amber-700 dark:text-amber-300">
                      {tempStartDate
                        ? formatDisplayDate(tempStartDate)
                        : 'ไม่กำหนดวันเริ่ม'}
                    </span>

                    <span className="text-muted-foreground text-xs">ถึง</span>

                    <span className="rounded-lg bg-orange-500/10 px-3 py-1.5 text-xs font-bold text-orange-700 dark:text-orange-300">
                      {tempEndDate
                        ? formatDisplayDate(tempEndDate)
                        : 'ไม่กำหนดวันสิ้นสุด'}
                    </span>
                  </div>
                </div>
              )}
            </div>

            {/* ================= FOOTER ================= */}
            <div className="border-border bg-muted/30 flex flex-col-reverse gap-2 border-t p-4 sm:flex-row sm:justify-between">
              <button
                type="button"
                onClick={handleClearTempDate}
                disabled={!tempStartDate && !tempEndDate}
                className="border-border bg-background text-muted-foreground hover:bg-accent inline-flex h-11 items-center justify-center gap-2 rounded-xl border px-4 text-sm font-semibold transition disabled:cursor-not-allowed disabled:opacity-40"
              >
                <RotateCcw className="h-4 w-4" />
                ล้างวันที่
              </button>

              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => setDateModalOpen(false)}
                  className="border-border bg-background text-foreground hover:bg-accent h-11 flex-1 rounded-xl border px-5 text-sm font-semibold transition sm:flex-none"
                >
                  ยกเลิก
                </button>

                <button
                  type="button"
                  onClick={handleConfirmDate}
                  disabled={Boolean(
                    tempStartDate && tempEndDate && tempStartDate > tempEndDate,
                  )}
                  className="inline-flex h-11 flex-1 items-center justify-center gap-2 rounded-xl px-6 text-sm font-semibold text-white shadow-md transition-all hover:-translate-y-0.5 disabled:cursor-not-allowed disabled:opacity-50 disabled:hover:translate-y-0 sm:flex-none"
                  style={{
                    background:
                      'linear-gradient(90deg, rgb(245 158 11), rgb(249 115 22))',
                    boxShadow: '0 8px 20px rgba(249,115,22,0.18)',
                  }}
                >
                  <Check size={17} strokeWidth={2.5} stroke="#ffffff" />

                  <span className="text-white">ตกลง</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
function formatDisplayDate(value: string) {
  if (!value) return '-';

  const [year, month, day] = value.split('-').map(Number);

  if (!year || !month || !day) {
    return '-';
  }

  return new Intl.DateTimeFormat('th-TH', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  }).format(new Date(year, month - 1, day));
}
