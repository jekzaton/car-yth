'use client';

import { UserStatus } from '@/types/userCarType';
import {
  CirclePlus,
  Search,
  ChevronDown,
  UsersRound,
  UserCheck,
  UserX,
} from 'lucide-react';

type UserCarHeaderProps = {
  search: string;
  onSearchChange: (value: string) => void;

  statusFilter: 'all' | UserStatus;
  onStatusFilterChange: (value: 'all' | UserStatus) => void;

  total: number;
  activeCount: number;
  inactiveCount: number;

  onCreate: () => void;
};

export default function UserCarHeader({
  search,
  onSearchChange,
  statusFilter,
  onStatusFilterChange,
  total,
  activeCount,
  inactiveCount,
  onCreate,
}: UserCarHeaderProps) {
  return (
    <div className="relative space-y-5">
      {/* ================= HEADER ================= */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <div className="flex items-center gap-2">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-blue-50 text-blue-600 dark:bg-blue-500/10 dark:text-blue-300">
              <UsersRound className="h-4.5 w-4.5" />
            </div>

            <div>
              <h1 className="text-lg font-semibold text-gray-900 dark:text-white">
                จัดการคนขับรถ
              </h1>

              <p className="text-xs text-gray-500 dark:text-gray-400">
                จัดการข้อมูลและสถานะผู้ใช้งานสำหรับคนขับรถ
              </p>
            </div>
          </div>
        </div>

        <button
          type="button"
          onClick={onCreate}
          className="bg-linear-to-r inline-flex h-10 w-full items-center justify-center gap-2 rounded-xl from-blue-500 via-blue-600 to-indigo-600 px-4 text-sm font-semibold text-white shadow-md shadow-blue-500/10 transition hover:-translate-y-0.5 hover:shadow-lg sm:w-auto"
        >
          <CirclePlus className="h-4 w-4" />
          เพิ่มผู้ใช้งาน
        </button>
      </div>

      {/* ================= FILTER ================= */}
      <div className="flex flex-col gap-3 lg:flex-row lg:items-center">
        {/* SEARCH */}
        <div className="relative min-w-0 flex-1">
          <Search className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />

          <input
            type="text"
            value={search}
            onChange={(event) => onSearchChange(event.target.value)}
            placeholder="ค้นหา CID / ชื่อ / หน่วยงาน / ตำแหน่ง"
            className="h-10 w-full rounded-xl border border-gray-200 bg-white/70 pl-10 pr-4 text-sm text-gray-700 outline-none backdrop-blur transition placeholder:text-gray-400 hover:border-blue-300 focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 dark:border-white/10 dark:bg-white/5 dark:text-white"
          />
        </div>

        {/* STATUS */}
        <div className="relative w-full shrink-0 lg:w-44">
          <select
            value={statusFilter}
            onChange={(event) =>
              onStatusFilterChange(event.target.value as 'all' | UserStatus)
            }
            className="h-10 w-full appearance-none rounded-xl border border-gray-200 bg-white/70 px-3 pr-9 text-sm font-medium text-gray-700 outline-none transition hover:border-blue-300 focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 dark:border-white/10 dark:bg-gray-900 dark:text-gray-200"
          >
            <option value="all">ทุกสถานะ</option>
            <option value="active">ใช้งาน</option>
            <option value="inactive">ไม่ใช้งาน</option>
          </select>

          <ChevronDown className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
        </div>

        {/* KPI */}
        <div className="flex shrink-0 flex-wrap items-center gap-2 text-xs">
          {/* TOTAL */}
          <div className="inline-flex h-10 items-center gap-2 rounded-xl border border-gray-100 bg-white/70 px-3 text-gray-600 dark:border-white/10 dark:bg-white/5 dark:text-gray-300">
            <UsersRound className="h-3.5 w-3.5 text-gray-400" />

            <span>ทั้งหมด</span>

            <strong className="text-gray-900 dark:text-white">{total}</strong>
          </div>

          {/* ACTIVE */}
          <div className="inline-flex h-10 items-center gap-2 rounded-xl border border-green-100 bg-green-50 px-3 text-green-700 dark:border-green-500/10 dark:bg-green-500/10 dark:text-green-300">
            <UserCheck className="h-3.5 w-3.5" />

            <span>ใช้งาน</span>

            <strong>{activeCount}</strong>
          </div>

          {/* INACTIVE */}
          <div className="inline-flex h-10 items-center gap-2 rounded-xl border border-red-100 bg-red-50 px-3 text-red-600 dark:border-red-500/10 dark:bg-red-500/10 dark:text-red-300">
            <UserX className="h-3.5 w-3.5" />

            <span>ไม่ใช้งาน</span>

            <strong>{inactiveCount}</strong>
          </div>
        </div>
      </div>
    </div>
  );
}
