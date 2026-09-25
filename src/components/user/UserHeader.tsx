'use client';

import {
  CirclePlus,
  Download,
  FileSpreadsheet,
  LoaderCircle,
  Search,
  UserRoundPlus,
} from 'lucide-react';
import { useRouter } from 'next/navigation';

import type { UserStatus } from '@/types/userCarType';
import { useRef } from 'react';

interface UserHeaderProps {
  search: string;
  onSearchChange: (value: string) => void;

  statusFilter: 'all' | UserStatus;
  onStatusFilterChange: (value: 'all' | UserStatus) => void;

  totalUsers: number;
  countActive: number;
  countInactive: number;

  onImportExcel: (file: File) => void;
  isImporting?: boolean;
}

export default function UserHeader({
  search,
  onSearchChange,
  statusFilter,
  onStatusFilterChange,
  totalUsers,
  countActive,
  countInactive,
  onImportExcel,
  isImporting = false,
}: UserHeaderProps) {
  const router = useRouter();

  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleSelectFile = () => {
    if (isImporting) return;

    fileInputRef.current?.click();
  };

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];

    if (!file) return;

    onImportExcel(file);

    // reset เพื่อให้เลือกไฟล์เดิมซ้ำได้
    event.target.value = '';
  };

  return (
    <div className="relative space-y-5">
      {/* Header */}
      <div>
        <div className="flex items-center gap-2">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-blue-50 text-blue-600 dark:bg-blue-500/10 dark:text-blue-400">
            <UserRoundPlus className="h-4.5 w-4.5" />
          </div>

          <div>
            <h1 className="text-lg font-semibold text-gray-900 dark:text-white">
              จัดการผู้ดูแลระบบ
            </h1>

            <p className="text-sm text-gray-500 dark:text-gray-400">
              พบทั้งหมด {totalUsers.toLocaleString('th-TH')} รายการ
            </p>
          </div>
        </div>
      </div>

      {/* Toolbar */}
      <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
        {/* Left */}
        <div className="flex flex-1 flex-wrap items-center gap-3">
          {/* Search */}
          <div className="relative w-full sm:w-80">
            <Search className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />

            <input
              type="search"
              value={search}
              onChange={(event) => onSearchChange(event.target.value)}
              placeholder="ค้นหา CID / ชื่อ / หน่วยงาน / ตำแหน่ง"
              className="w-full rounded-xl border border-gray-200 bg-white/70 py-2.5 pl-10 pr-4 text-sm text-gray-900 outline-none backdrop-blur transition placeholder:text-gray-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/15 dark:border-white/10 dark:bg-white/5 dark:text-white dark:placeholder:text-gray-500"
            />
          </div>

          {/* Status */}
          <select
            value={statusFilter}
            onChange={(event) =>
              onStatusFilterChange(event.target.value as 'all' | UserStatus)
            }
            className="rounded-xl border border-gray-200 bg-white/70 px-3 py-2.5 text-sm text-gray-700 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-500/15 dark:border-white/10 dark:bg-gray-900 dark:text-gray-200"
          >
            <option value="all">ทุกสถานะ</option>
            <option value="active">ใช้งาน</option>
            <option value="inactive">ไม่ใช้งาน</option>
          </select>

          {/* Stats */}
          <div className="flex flex-wrap items-center gap-2 text-xs">
            <div className="rounded-xl border border-gray-200/70 bg-white/60 px-3 py-1.5 text-gray-600 dark:border-white/10 dark:bg-white/5 dark:text-gray-300">
              ทั้งหมด{' '}
              <b className="text-gray-900 dark:text-white">
                {totalUsers.toLocaleString('th-TH')}
              </b>
            </div>

            <div className="rounded-xl bg-green-50 px-3 py-1.5 text-green-700 dark:bg-green-500/10 dark:text-green-400">
              ใช้งาน <b>{countActive.toLocaleString('th-TH')}</b>
            </div>

            <div className="rounded-xl bg-red-50 px-3 py-1.5 text-red-600 dark:bg-red-500/10 dark:text-red-400">
              ไม่ใช้งาน <b>{countInactive.toLocaleString('th-TH')}</b>
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="flex w-full flex-col gap-2 sm:flex-row lg:w-auto">
          {/* Download Template */}
          <a
            href="/templates/template-car-user.xlsx"
            download="template-car-user.xlsx"
            className="group inline-flex w-full shrink-0 items-center justify-center gap-2 rounded-xl border border-gray-200 bg-white px-4 py-2.5 text-sm font-semibold text-gray-700 shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:border-blue-300 hover:bg-blue-50 hover:text-blue-700 hover:shadow-md active:translate-y-0 sm:w-auto dark:border-white/10 dark:bg-white/5 dark:text-gray-300 dark:hover:border-blue-500/30 dark:hover:bg-blue-500/10 dark:hover:text-blue-400"
          >
            <Download className="h-5 w-5 shrink-0 transition-transform duration-200 group-hover:translate-y-0.5" />

            <span>Template</span>
          </a>

          {/* Import Excel */}
          <div>
            <input
              ref={fileInputRef}
              type="file"
              accept=".xlsx,.xls"
              onChange={handleFileChange}
              className="hidden"
            />

            <button
              type="button"
              onClick={handleSelectFile}
              disabled={isImporting}
              className="group inline-flex w-full shrink-0 items-center justify-center gap-2 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-2.5 text-sm font-semibold text-emerald-700 shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:border-emerald-300 hover:bg-emerald-100 hover:shadow-md active:translate-y-0 disabled:pointer-events-none disabled:opacity-60 sm:w-auto dark:border-emerald-500/20 dark:bg-emerald-500/10 dark:text-emerald-400 dark:hover:border-emerald-500/30 dark:hover:bg-emerald-500/15"
            >
              {isImporting ? (
                <LoaderCircle className="h-5 w-5 shrink-0 animate-spin" />
              ) : (
                <FileSpreadsheet className="h-5 w-5 shrink-0 transition-transform duration-200 group-hover:scale-110" />
              )}

              <span>{isImporting ? 'กำลังนำเข้า...' : 'นำเข้า Excel'}</span>
            </button>
          </div>

          {/* Add User */}
          <button
            type="button"
            onClick={() => router.push('/users/create')}
            className="bg-linear-to-r group inline-flex w-full shrink-0 items-center justify-center gap-2 rounded-xl from-blue-500 via-blue-600 to-indigo-600 px-5 py-2.5 text-sm font-semibold text-white shadow-md shadow-blue-500/15 transition-all duration-200 hover:-translate-y-0.5 hover:shadow-lg hover:shadow-blue-500/20 active:translate-y-0 sm:w-auto"
          >
            <CirclePlus className="h-5 w-5 shrink-0 transition-transform duration-200 group-hover:rotate-90" />

            <span>เพิ่มผู้ใช้งาน</span>
          </button>
        </div>
      </div>
    </div>
  );
}
