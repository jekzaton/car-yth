'use client';

import {
  CalendarDays,
  CarFront,
  ChartPie,
  CircleDollarSign,
  Droplets,
  Loader2,
  RefreshCw,
  Search,
  TrendingUp,
  WalletCards,
  Wrench,
} from 'lucide-react';

import { useCallback, useEffect, useMemo, useState } from 'react';

import axios from 'axios';
import DashboardHeader from './DashboardHeader';

// ============================================================
// TYPES
// ============================================================

type ExpenseSummary = {
  totalOil: number;
  totalMaintain: number;
  grandTotal: number;
  oilCount: number;
  maintainCount: number;
};

type MonthlyExpense = {
  month: string;
  oil: number;
  maintain: number;
};

type DashboardResponse = {
  success: boolean;

  summary: ExpenseSummary;

  monthly: MonthlyExpense[];
};

type DateRange = {
  startDate: string;
  endDate: string;
};

// ============================================================
// HELPERS
// ============================================================

function formatMoney(value: number): string {
  return new Intl.NumberFormat('th-TH', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(value);
}

function formatCompactMoney(value: number): string {
  return `${new Intl.NumberFormat('th-TH', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(value)} ฿`;
}

function getDefaultDateRange(): DateRange {
  const now = new Date();

  // วันแรกของเดือน
  const firstDay = new Date(now.getFullYear(), now.getMonth(), 1);

  // วันสุดท้ายของเดือน
  const lastDay = new Date(now.getFullYear(), now.getMonth() + 1, 0);

  const formatDate = (date: Date) => {
    const year = date.getFullYear();

    const month = String(date.getMonth() + 1).padStart(2, '0');

    const day = String(date.getDate()).padStart(2, '0');

    return `${year}-${month}-${day}`;
  };

  return {
    startDate: formatDate(firstDay),
    endDate: formatDate(lastDay),
  };
}

function formatMonth(month: string): string {
  const [year, monthNumber] = month.split('-').map(Number);

  if (!year || !monthNumber) {
    return month;
  }

  return new Intl.DateTimeFormat('th-TH', {
    month: 'short',
    year: '2-digit',
  }).format(new Date(year, monthNumber - 1, 1));
}

// DASHBOARD

export default function Dashboard() {
  const defaultRange = useMemo(() => getDefaultDateRange(), []);

  const [startDate, setStartDate] = useState(defaultRange.startDate);

  const [endDate, setEndDate] = useState(defaultRange.endDate);

  const [appliedRange, setAppliedRange] = useState<DateRange>(defaultRange);

  const [summary, setSummary] = useState<ExpenseSummary>({
    totalOil: 0,
    totalMaintain: 0,
    grandTotal: 0,
    oilCount: 0,
    maintainCount: 0,
  });

  const [monthly, setMonthly] = useState<MonthlyExpense[]>([]);

  const [isLoading, setIsLoading] = useState(true);

  const [error, setError] = useState<string | null>(null);

  // FETCH

  const fetchDashboard = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);

      const response = await axios.get<DashboardResponse>(
        '/api/dashboard/car-expenses',
        {
          params: {
            startDate: appliedRange.startDate,
            endDate: appliedRange.endDate,
          },
        },
      );

      setSummary(
        response.data.summary ?? {
          totalOil: 0,
          totalMaintain: 0,
          grandTotal: 0,
          oilCount: 0,
          maintainCount: 0,
        },
      );

      setMonthly(response.data.monthly ?? []);
    } catch (error) {
      console.error('Dashboard error:', error);

      setError('ไม่สามารถโหลดข้อมูล Dashboard ได้');
    } finally {
      setIsLoading(false);
    }
  }, [appliedRange]);

  useEffect(() => {
    void fetchDashboard();
  }, [fetchDashboard]);

  // FILTER

  const handleApplyDate = () => {
    if (!startDate || !endDate) {
      setError('กรุณาเลือกวันที่เริ่มต้นและวันที่สิ้นสุด');
      return;
    }

    if (startDate > endDate) {
      setError('วันที่เริ่มต้นต้องไม่มากกว่าวันที่สิ้นสุด');
      return;
    }

    setError(null);

    setAppliedRange({
      startDate,
      endDate,
    });
  };

  const handleThisMonth = () => {
    const range = getDefaultDateRange();

    setStartDate(range.startDate);
    setEndDate(range.endDate);
    setAppliedRange(range);
  };

  // PERCENT

  const oilPercent =
    summary.grandTotal > 0 ? (summary.totalOil / summary.grandTotal) * 100 : 0;

  const maintainPercent =
    summary.grandTotal > 0
      ? (summary.totalMaintain / summary.grandTotal) * 100
      : 0;

  // UI

  return (
    <div className="space-y-6">
      {/* HEADER */}

      <DashboardHeader
        startDate={startDate}
        endDate={endDate}
        isLoading={isLoading}
        error={error}
        onStartDateChange={setStartDate}
        onEndDateChange={setEndDate}
        onThisMonth={handleThisMonth}
        onApplyDate={handleApplyDate}
        onRefresh={() => void fetchDashboard()}
      />

      {/* KPI GRID */}

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard
          title="ค่าใช้จ่ายทั้งหมด"
          value={summary.grandTotal}
          description="ค่าน้ำมัน + ซ่อมบำรุง"
          icon={<CircleDollarSign className="h-6 w-6" />}
          variant="blue"
          isLoading={isLoading}
        />

        <StatCard
          title="ค่าใช้จ่ายน้ำมัน"
          value={summary.totalOil}
          description={`${summary.oilCount.toLocaleString('th-TH')} รายการ`}
          icon={<Droplets className="h-6 w-6" />}
          variant="amber"
          isLoading={isLoading}
        />

        <StatCard
          title="ค่าซ่อมบำรุง"
          value={summary.totalMaintain}
          description={`${summary.maintainCount.toLocaleString(
            'th-TH',
          )} รายการ`}
          icon={<Wrench className="h-6 w-6" />}
          variant="rose"
          isLoading={isLoading}
        />

        <StatCard
          title="จำนวนรายการ"
          value={summary.oilCount + summary.maintainCount}
          money={false}
          description="รายการค่าใช้จ่ายทั้งหมด"
          icon={<WalletCards className="h-6 w-6" />}
          variant="emerald"
          isLoading={isLoading}
        />
      </div>

      {/* CHART GRID */}

      <div className="grid grid-cols-12 gap-6">
        {/* TREND */}

        <div className="col-span-12 xl:col-span-8">
          <ExpenseTrendCard data={monthly} isLoading={isLoading} />
        </div>

        {/* BREAKDOWN */}

        <div className="col-span-12 xl:col-span-4">
          <ExpenseBreakdownCard
            summary={summary}
            oilPercent={oilPercent}
            maintainPercent={maintainPercent}
            isLoading={isLoading}
          />
        </div>
      </div>
    </div>
  );
}

// STAT CARD

type StatCardProps = {
  title: string;
  value: number;
  description: string;
  icon: React.ReactNode;

  variant: 'blue' | 'amber' | 'rose' | 'emerald';

  isLoading: boolean;
  money?: boolean;
};

function StatCard({
  title,
  value,
  description,
  icon,
  variant,
  isLoading,
  money = true,
}: StatCardProps) {
  const variants = {
    blue: {
      icon: 'bg-blue-500/10 text-blue-600 dark:text-blue-400',
      glow: 'bg-blue-500/10',
    },

    amber: {
      icon: 'bg-amber-500/10 text-amber-600 dark:text-amber-400',
      glow: 'bg-amber-500/10',
    },

    rose: {
      icon: 'bg-rose-500/10 text-rose-600 dark:text-rose-400',
      glow: 'bg-rose-500/10',
    },

    emerald: {
      icon: 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400',
      glow: 'bg-emerald-500/10',
    },
  };

  const style = variants[variant];

  return (
    <div className="border-border bg-card group relative overflow-hidden rounded-2xl border p-5 shadow-sm transition-all duration-300 hover:-translate-y-0.5 hover:shadow-lg">
      <div
        className={`absolute -right-10 -top-10 h-28 w-28 rounded-full blur-3xl ${style.glow}`}
      />

      <div className="relative">
        <div className="flex items-start justify-between">
          <div
            className={`flex h-11 w-11 items-center justify-center rounded-xl ${style.icon}`}
          >
            {icon}
          </div>

          <TrendingUp className="text-muted-foreground/40 h-4 w-4" />
        </div>

        <p className="text-muted-foreground mt-5 text-sm font-medium">
          {title}
        </p>

        {isLoading ? (
          <div className="bg-muted mt-2 h-9 w-36 animate-pulse rounded-lg" />
        ) : (
          <div className="mt-1 flex items-end gap-1.5">
            {money && (
              <span className="text-muted-foreground mb-1 text-sm font-bold">
                ฿
              </span>
            )}

            <span className="text-foreground text-2xl font-extrabold tracking-tight lg:text-[28px]">
              {money ? formatMoney(value) : value.toLocaleString('th-TH')}
            </span>
          </div>
        )}

        <p className="text-muted-foreground mt-2 text-xs">{description}</p>
      </div>
    </div>
  );
}

// TREND CARD

function ExpenseTrendCard({
  data,
  isLoading,
}: {
  data: MonthlyExpense[];
  isLoading: boolean;
}) {
  const maxValue = Math.max(
    ...data.flatMap((item) => [item.oil, item.maintain]),
    1,
  );

  return (
    <div className="border-border bg-card h-full rounded-2xl border p-5 shadow-sm lg:p-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h3 className="text-foreground text-base font-bold">
            แนวโน้มค่าใช้จ่าย
          </h3>

          <p className="text-muted-foreground mt-1 text-xs">
            เปรียบเทียบค่าน้ำมันและค่าซ่อมบำรุงรายเดือน
          </p>
        </div>

        <div className="text-muted-foreground flex items-center gap-4 text-xs font-medium">
          <div className="flex items-center gap-2">
            <span className="h-2.5 w-2.5 rounded-full bg-amber-500" />
            น้ำมัน
          </div>

          <div className="flex items-center gap-2">
            <span className="h-2.5 w-2.5 rounded-full bg-rose-500" />
            ซ่อมบำรุง
          </div>
        </div>
      </div>

      <div className="mt-8">
        {isLoading ? (
          <div className="flex h-72 items-center justify-center">
            <Loader2 className="text-brand-500 h-7 w-7 animate-spin" />
          </div>
        ) : data.length === 0 ? (
          <EmptyChart />
        ) : (
          <div className="overflow-x-auto pb-2">
            <div
              className="flex h-72 items-end gap-5"
              style={{
                minWidth: `${Math.max(data.length * 90, 600)}px`,
              }}
            >
              {data.map((item) => {
                const oilHeight = (item.oil / maxValue) * 210;

                const maintainHeight = (item.maintain / maxValue) * 210;

                return (
                  <div
                    key={item.month}
                    className="flex h-full flex-1 flex-col justify-end"
                  >
                    <div className="flex flex-1 items-end justify-center gap-2">
                      <div
                        title={`ค่าน้ำมัน ${formatMoney(item.oil)} บาท`}
                        className="bg-linear-to-t w-5 rounded-t-lg from-amber-500 to-orange-400 transition-all hover:opacity-80"
                        style={{
                          height: `${Math.max(
                            oilHeight,
                            item.oil > 0 ? 4 : 0,
                          )}px`,
                        }}
                      />

                      <div
                        title={`ค่าซ่อม ${formatMoney(item.maintain)} บาท`}
                        className="bg-linear-to-t w-5 rounded-t-lg from-rose-600 to-rose-400 transition-all hover:opacity-80"
                        style={{
                          height: `${Math.max(
                            maintainHeight,
                            item.maintain > 0 ? 4 : 0,
                          )}px`,
                        }}
                      />
                    </div>

                    <div className="border-border text-muted-foreground mt-3 border-t pt-2 text-center text-[11px] font-semibold">
                      {formatMonth(item.month)}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

// BREAKDOWN
function ExpenseLegend({
  title,
  percent,
  dotClass,
}: {
  title: string;
  percent: number;
  dotClass: string;
}) {
  return (
    <div className="border-border bg-background/60 flex items-center justify-between rounded-xl border px-3 py-2.5">
      <div className="flex min-w-0 items-center gap-2">
        <span className={`h-2.5 w-2.5 shrink-0 rounded-full ${dotClass}`} />

        <span className="text-muted-foreground truncate text-xs font-medium">
          {title}
        </span>
      </div>

      <span className="text-foreground ml-2 text-xs font-extrabold tabular-nums">
        {percent.toFixed(1)}%
      </span>
    </div>
  );
}

function ExpenseBreakdownCard({
  summary,
  oilPercent,
  maintainPercent,
  isLoading,
}: {
  summary: ExpenseSummary;
  oilPercent: number;
  maintainPercent: number;
  isLoading: boolean;
}) {
  const hasExpense = summary.grandTotal > 0;

  const safeOilPercent = Math.min(Math.max(oilPercent, 0), 100);

  return (
    <div className="border-border bg-card relative h-full overflow-hidden rounded-2xl border shadow-sm">
      {/* DECORATION */}

      <div className="bg-brand-500/5 pointer-events-none absolute -right-20 -top-20 h-48 w-48 rounded-full blur-3xl" />

      {/* HEADER */}

      <div className="border-border relative flex items-start justify-between border-b px-5 py-5 lg:px-6">
        <div>
          <div className="flex items-center gap-2">
            <div className="bg-brand-500/10 text-brand-500 flex h-9 w-9 items-center justify-center rounded-xl">
              <ChartPie className="h-4.5 w-4.5" />
            </div>

            <div>
              <h3 className="text-foreground text-base font-bold">
                สัดส่วนค่าใช้จ่าย
              </h3>

              <p className="text-muted-foreground mt-0.5 text-xs">
                ค่าใช้จ่ายแยกตามประเภท
              </p>
            </div>
          </div>
        </div>

        {!isLoading && (
          <div className="border-border bg-background text-muted-foreground rounded-lg border px-2.5 py-1.5 text-[11px] font-semibold">
            {summary.oilCount + summary.maintainCount} รายการ
          </div>
        )}
      </div>

      {/* CONTENT */}

      <div className="relative p-5 lg:p-6">
        {isLoading ? (
          <div className="flex h-80 flex-col items-center justify-center gap-3">
            <div className="bg-brand-500/10 flex h-12 w-12 items-center justify-center rounded-2xl">
              <Loader2 className="text-brand-500 h-6 w-6 animate-spin" />
            </div>

            <span className="text-muted-foreground text-xs font-medium">
              กำลังคำนวณค่าใช้จ่าย...
            </span>
          </div>
        ) : (
          <>
            {/* DONUT */}

            <div className="flex justify-center py-3">
              <div className="relative">
                {/* glow */}

                <div className="bg-brand-500/5 absolute inset-4 rounded-full blur-2xl" />

                <div
                  className="relative flex h-48 w-48 items-center justify-center rounded-full p-3.5 shadow-sm"
                  style={{
                    background: hasExpense
                      ? `conic-gradient(
                          #f59e0b 0% ${safeOilPercent}%,
                          #f43f5e ${safeOilPercent}% 100%
                        )`
                      : 'var(--color-muted)',
                  }}
                >
                  {/* INNER */}

                  <div className="border-border bg-card flex h-full w-full flex-col items-center justify-center rounded-full border shadow-inner">
                    <span className="text-muted-foreground text-[11px] font-semibold uppercase tracking-wide">
                      รวมทั้งหมด
                    </span>

                    <span className="text-foreground mt-1 text-xl font-extrabold tracking-tight">
                      {formatCompactMoney(summary.grandTotal)}
                    </span>

                    <div className="mt-2 flex items-center gap-1.5">
                      <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />

                      <span className="text-muted-foreground text-[10px] font-medium">
                        ค่าใช้จ่ายรวม
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* LEGEND */}

            <div className="mt-4 grid grid-cols-2 gap-3">
              <ExpenseLegend
                title="ค่าน้ำมัน"
                percent={oilPercent}
                dotClass="bg-amber-500"
              />

              <ExpenseLegend
                title="ค่าซ่อมบำรุง"
                percent={maintainPercent}
                dotClass="bg-rose-500"
              />
            </div>

            {/* DIVIDER */}

            <div className="border-border my-5 border-t border-dashed" />

            {/* BREAKDOWN */}

            <div className="space-y-3">
              <BreakdownItem
                title="ค่าน้ำมัน"
                value={summary.totalOil}
                percent={oilPercent}
                barClass="bg-linear-to-r from-amber-400 to-orange-500"
                icon={<Droplets className="h-4 w-4" />}
                iconClass="bg-amber-500/10 text-amber-600 dark:text-amber-400"
              />

              <BreakdownItem
                title="ค่าซ่อมบำรุง"
                value={summary.totalMaintain}
                percent={maintainPercent}
                barClass="bg-linear-to-r from-rose-400 to-rose-600"
                icon={<Wrench className="h-4 w-4" />}
                iconClass="bg-rose-500/10 text-rose-600 dark:text-rose-400"
              />
            </div>
          </>
        )}
      </div>
    </div>
  );
}

function BreakdownItem({
  title,
  value,
  percent,
  barClass,
  icon,
  iconClass,
}: {
  title: string;
  value: number;
  percent: number;
  barClass: string;
  icon: React.ReactNode;
  iconClass: string;
}) {
  return (
    <div>
      <div className="mb-2 flex items-center justify-between gap-4">
        <div className="flex items-center gap-2.5">
          <div
            className={`flex h-8 w-8 items-center justify-center rounded-lg ${iconClass}`}
          >
            {icon}
          </div>

          <div>
            <p className="text-foreground text-sm font-semibold">{title}</p>

            <p className="text-muted-foreground text-[11px]">
              {percent.toFixed(1)}%
            </p>
          </div>
        </div>

        <p className="text-foreground text-sm font-bold tabular-nums">
          ฿{formatMoney(value)}
        </p>
      </div>

      <div className="bg-muted h-2 overflow-hidden rounded-full">
        <div
          className={`h-full rounded-full transition-all duration-700 ${barClass}`}
          style={{
            width: `${Math.min(percent, 100)}%`,
          }}
        />
      </div>
    </div>
  );
}

// EMPTY

function EmptyChart() {
  return (
    <div className="flex h-72 flex-col items-center justify-center text-center">
      <div className="bg-muted text-muted-foreground flex h-12 w-12 items-center justify-center rounded-2xl">
        <TrendingUp className="h-5 w-5" />
      </div>

      <p className="text-foreground mt-3 text-sm font-semibold">
        ยังไม่มีข้อมูลค่าใช้จ่าย
      </p>

      <p className="text-muted-foreground mt-1 text-xs">
        ไม่พบข้อมูลในช่วงวันที่ที่เลือก
      </p>
    </div>
  );
}
