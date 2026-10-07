'use client';

import { CirclePlus, Search } from 'lucide-react';

type CarStatusFilter = 'all' | 'active' | 'inactive';

type CarManageHeaderProps = {
  total: number;
  search: string;
  statusFilter: CarStatusFilter;
  countActive: number;
  countInactive: number;

  onSearchChange: (value: string) => void;
  onStatusFilterChange: (value: CarStatusFilter) => void;
  onCreate: () => void;
};

export default function CarManageHeader({
  total,
  search,
  statusFilter,
  countActive,
  countInactive,
  onSearchChange,
  onStatusFilterChange,
  onCreate,
}: CarManageHeaderProps) {
  return (
    <div className="bg-linear-to-r relative overflow-hidden rounded-2xl border border-gray-200 from-white via-white to-blue-50/60 px-4 py-5 shadow-sm sm:px-6 sm:py-6 dark:border-white/10 dark:from-gray-900 dark:via-gray-900 dark:to-blue-950/20">
      {/* Glow */}
      <div className="pointer-events-none absolute -top-10 right-10 h-40 w-40 rounded-full bg-blue-500/20 blur-3xl" />

      <div className="relative space-y-5">
        {/* Header */}
        <div>
          <h1 className="text-lg font-semibold text-gray-900 dark:text-white">
            จัดการยานพาหนะ
          </h1>

          <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
            พบทั้งหมด {total.toLocaleString('th-TH')} รายการ
          </p>
        </div>

        {/* Controls */}
        <div className="flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">
          <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-center">
            {/* Search */}
            <div className="relative w-full sm:w-72">
              <Search className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />

              <input
                type="search"
                value={search}
                onChange={(e) => onSearchChange(e.target.value)}
                placeholder="ค้นหา รหัส / รุ่น / ทะเบียน"
                className="h-10 w-full rounded-xl border border-gray-200 bg-white/70 pl-10 pr-4 text-sm text-gray-800 shadow-sm outline-none backdrop-blur transition placeholder:text-gray-400 hover:border-blue-300 focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 dark:border-white/10 dark:bg-white/5 dark:text-white dark:placeholder:text-gray-500"
              />
            </div>

            {/* Status */}
            <select
              value={statusFilter}
              onChange={(e) =>
                onStatusFilterChange(e.target.value as CarStatusFilter)
              }
              className="h-10 w-full rounded-xl border border-gray-200 bg-white/70 px-3 text-sm font-medium text-gray-700 shadow-sm outline-none transition hover:border-blue-300 focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 sm:w-auto dark:border-white/10 dark:bg-gray-900 dark:text-white"
            >
              <option value="all">ทั้งหมด</option>
              <option value="active">ใช้งาน</option>
              <option value="inactive">ไม่ใช้งาน</option>
            </select>

            {/* KPI */}
            <div className="flex flex-wrap gap-2 text-xs">
              <div className="rounded-xl border border-gray-200 bg-white/60 px-3 py-2 text-gray-600 dark:border-white/10 dark:bg-white/5 dark:text-gray-300">
                ทั้งหมด{' '}
                <b className="text-gray-900 dark:text-white">
                  {total.toLocaleString('th-TH')}
                </b>
              </div>

              <div className="rounded-xl border border-green-200 bg-green-50 px-3 py-2 text-green-700 dark:border-green-500/20 dark:bg-green-500/10 dark:text-green-300">
                ใช้งาน <b>{countActive.toLocaleString('th-TH')}</b>
              </div>

              <div className="rounded-xl border border-red-200 bg-red-50 px-3 py-2 text-red-600 dark:border-red-500/20 dark:bg-red-500/10 dark:text-red-300">
                ไม่ใช้งาน <b>{countInactive.toLocaleString('th-TH')}</b>
              </div>
            </div>
          </div>

          {/* Add */}
          <button
            type="button"
            onClick={onCreate}
            className="bg-linear-to-r inline-flex h-10 w-full items-center justify-center gap-2 rounded-xl from-blue-500 via-blue-600 to-indigo-600 px-5 text-sm font-semibold text-white shadow-md transition hover:-translate-y-0.5 hover:shadow-lg active:translate-y-0 sm:w-auto"
          >
            <CirclePlus className="h-4 w-4" />
            เพิ่มรถ
          </button>
        </div>
      </div>
    </div>
  );
}
