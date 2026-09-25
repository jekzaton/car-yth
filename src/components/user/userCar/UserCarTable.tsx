'use client';

import { useRouter } from 'next/navigation';
import { Database, Loader2, Pencil, Trash2, UserRound } from 'lucide-react';

import TimeAgo from '@/components/common/TimeAgo';
import { UserCarItem } from '@/types/userCarType';

type UserCarTableProps = {
  data: UserCarItem[];
  isLoading: boolean;

  currentPage: number;
  rowsPerPage: number;

  updatingStatusId: number | null;

  onToggleStatus: (user: UserCarItem) => Promise<void>;
  onDelete: (user: UserCarItem) => void;
};

export default function UserCarTable({
  data,
  isLoading,

  currentPage,
  rowsPerPage,

  updatingStatusId,

  onToggleStatus,
  onDelete,
}: UserCarTableProps) {
  const router = useRouter();

  return (
    <div className="overflow-x-auto">
      <table className="min-w-300 w-full">
        {/* ================= HEADER ================= */}
        <thead>
          <tr className="border-b border-gray-100 bg-gray-50/80 dark:border-white/10 dark:bg-white/5">
            <th className="w-16 px-5 py-4 text-left text-xs font-semibold text-gray-500">
              #
            </th>

            <th className="min-w-64 px-5 py-4 text-left text-xs font-semibold text-gray-500">
              ผู้ใช้งาน
            </th>

            <th className="min-w-48 px-5 py-4 text-left text-xs font-semibold text-gray-500">
              หน่วยงาน
            </th>

            <th className="min-w-44 px-5 py-4 text-left text-xs font-semibold text-gray-500">
              ระบบ
            </th>

            <th className="w-32 px-5 py-4 text-left text-xs font-semibold text-gray-500">
              สถานะ
            </th>

            <th className="w-32 px-5 py-4 text-left text-xs font-semibold text-gray-500">
              สิทธิ์
            </th>

            <th className="w-40 px-5 py-4 text-left text-xs font-semibold text-gray-500">
              อัปเดต
            </th>

            <th className="w-44 px-5 py-4 text-left text-xs font-semibold text-gray-500">
              จัดการ
            </th>
          </tr>
        </thead>

        {/* ================= BODY ================= */}
        <tbody className="divide-y divide-gray-100 dark:divide-white/5">
          {isLoading ? (
            <LoadingRow />
          ) : data.length === 0 ? (
            <EmptyRow />
          ) : (
            data.map((user, index) => (
              <UserRow
                key={user.id}
                user={user}
                rowNumber={(currentPage - 1) * rowsPerPage + index + 1}
                isUpdating={updatingStatusId === user.id}
                onToggleStatus={() => onToggleStatus(user)}
                onEdit={() => router.push(`/users/user-car/edit/${user.id}`)}
                onDelete={() => onDelete(user)}
              />
            ))
          )}
        </tbody>
      </table>
    </div>
  );
}

/* =========================================================
   USER ROW
========================================================= */

type UserRowProps = {
  user: UserCarItem;
  rowNumber: number;
  isUpdating: boolean;

  onToggleStatus: () => void;
  onEdit: () => void;
  onDelete: () => void;
};

function UserRow({
  user,
  rowNumber,
  isUpdating,
  onToggleStatus,
  onEdit,
  onDelete,
}: UserRowProps) {
  const isActive = user.status === 'active';
  //   console.log('userRow', user);

  return (
    <tr className="transition-colors hover:bg-blue-50/40 dark:hover:bg-white/5">
      {/* NUMBER */}
      <td className="px-5 py-4 text-sm text-gray-500">{rowNumber}</td>

      {/* USER */}
      <td className="px-5 py-4">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-blue-100 text-blue-600 dark:bg-blue-500/15 dark:text-blue-300">
            <UserRound className="h-5 w-5" />
          </div>

          <div className="min-w-0">
            <p className="whitespace-nowrap font-medium text-gray-900 dark:text-white">
              {user.prefix} {user.firstName} {user.lastName}
            </p>

            <p className="mt-0.5 whitespace-nowrap text-xs text-gray-500 dark:text-gray-400">
              <span className="text-gray-400">ตำแหน่ง :</span>{' '}
              {user.positionName || '-'}
            </p>

            {user.userCode && (
              <p className="mt-0.5 text-[10px] text-gray-400">
                รหัสผู้ใช้งาน : {user.userCode}
              </p>
            )}
          </div>
        </div>
      </td>

      {/* DEPARTMENT */}
      <td className="px-5 py-4 text-sm text-gray-600 dark:text-gray-300">
        {user.departmentName || '-'}
      </td>

      {/* SYSTEM */}
      <td className="px-5 py-4">
        <div className="inline-flex items-center gap-2 rounded-xl bg-sky-50 px-3 py-2 text-sm font-medium text-sky-700 dark:bg-sky-500/10 dark:text-sky-300">
          <Database className="h-4 w-4 shrink-0" />

          <span className="whitespace-nowrap">
            {user.systemName || 'ไม่กำหนด'}
          </span>
        </div>
      </td>

      {/* STATUS */}
      <td className="px-5 py-4">
        <button
          type="button"
          onClick={onToggleStatus}
          disabled={isUpdating}
          className="inline-flex items-center gap-2 disabled:cursor-wait disabled:opacity-70"
          role="switch"
          aria-checked={isActive}
          aria-label={isActive ? 'ปิดการใช้งานบัญชี' : 'เปิดการใช้งานบัญชี'}
        >
          <span
            className={`relative inline-flex h-7 w-12 shrink-0 rounded-full transition-colors duration-300 ${
              isActive ? 'bg-green-500' : 'bg-gray-300 dark:bg-gray-700'
            }`}
          >
            <span
              className={`absolute top-1 h-5 w-5 rounded-full bg-white shadow-md transition-transform duration-300 ${
                isActive ? 'translate-x-6' : 'translate-x-1'
              }`}
            />
          </span>

          {isUpdating && (
            <Loader2 className="h-4 w-4 animate-spin text-blue-500" />
          )}
        </button>
      </td>

      {/* ROLE */}
      <td className="px-5 py-4">
        <span className="inline-flex whitespace-nowrap rounded-full bg-purple-50 px-3 py-1 text-xs font-medium text-purple-700 dark:bg-purple-500/10 dark:text-purple-300">
          {user.statusLevel}
        </span>
      </td>

      {/* UPDATED */}
      <td className="px-5 py-4">
        {user.updatedAt ? (
          <TimeAgo
            value={user.updatedAt}
            className="whitespace-nowrap rounded-full bg-purple-50 px-3 py-1 text-xs font-medium text-purple-700 dark:bg-purple-500/10 dark:text-purple-300"
          />
        ) : (
          <span className="text-xs text-gray-400">-</span>
        )}
      </td>

      {/* ACTION */}
      <td className="px-5 py-4">
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={onEdit}
            className="group/btn inline-flex items-center gap-1 rounded-lg border border-blue-100 bg-blue-50 px-3 py-1.5 text-xs font-medium text-blue-600 shadow-sm transition hover:border-blue-200 hover:bg-blue-100 dark:border-blue-500/20 dark:bg-blue-500/10 dark:text-blue-300"
          >
            <Pencil className="h-3.5 w-3.5 transition group-hover/btn:rotate-12" />
            แก้ไข
          </button>

          <button
            type="button"
            onClick={onDelete}
            className="group/btn inline-flex items-center gap-1.5 rounded-lg border border-red-200 bg-red-50 px-3 py-1.5 text-xs font-semibold text-red-600 shadow-sm transition hover:-translate-y-0.5 hover:border-red-300 hover:bg-red-100 active:scale-95 dark:border-red-500/20 dark:bg-red-500/10 dark:text-red-300"
          >
            <Trash2 className="h-3.5 w-3.5 transition group-hover/btn:scale-110" />
            ลบ
          </button>
        </div>
      </td>
    </tr>
  );
}

/* =========================================================
   LOADING
========================================================= */

function LoadingRow() {
  return (
    <tr>
      <td colSpan={8} className="px-5 py-12 text-center">
        <Loader2 className="mx-auto h-6 w-6 animate-spin text-blue-600" />

        <p className="mt-2 text-sm text-gray-500">กำลังโหลดข้อมูล...</p>
      </td>
    </tr>
  );
}

/* =========================================================
   EMPTY
========================================================= */

function EmptyRow() {
  return (
    <tr>
      <td colSpan={8} className="px-5 py-12 text-center">
        <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-gray-100 text-gray-400 dark:bg-white/5">
          <UserRound className="h-5 w-5" />
        </div>

        <p className="mt-3 text-sm font-medium text-gray-600 dark:text-gray-300">
          ไม่พบข้อมูลผู้ใช้งาน
        </p>

        <p className="mt-1 text-xs text-gray-400">
          ลองเปลี่ยนคำค้นหาหรือตัวกรองสถานะ
        </p>
      </td>
    </tr>
  );
}
