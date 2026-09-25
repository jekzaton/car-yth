'use client';

import { CarFront, CirclePlus, Pencil, Trash2 } from 'lucide-react';

export type CarType = {
  typeCarId: number;
  typeName: string;
};

type TableCarTypeProps = {
  items: CarType[];
  loading: boolean;
  deletingId?: number | null;

  onCreate: () => void;
  onEdit: (item: CarType) => void;
  onDelete: (item: CarType) => void;
};

export default function TableCarType({
  items,
  loading,
  deletingId = null,
  onCreate,
  onEdit,
  onDelete,
}: TableCarTypeProps) {
  return (
    <div className="overflow-x-auto">
      <table className="min-w-162.5 w-full">
        {/* ================= HEADER ================= */}
        <thead>
          <tr className="bg-gray-50/80 text-left dark:bg-white/5">
            <th className="w-24 px-6 py-4 text-xs font-semibold uppercase tracking-wider text-gray-500">
              #
            </th>

            <th className="px-6 py-4 text-xs font-semibold uppercase tracking-wider text-gray-500">
              ประเภทรถ
            </th>

            <th className="w-60 px-6 py-4 text-right text-xs font-semibold uppercase tracking-wider text-gray-500">
              จัดการ
            </th>
          </tr>
        </thead>

        {/* ================= BODY ================= */}
        <tbody className="divide-y divide-gray-100 dark:divide-white/5">
          {/* LOADING */}
          {loading ? (
            [1, 2, 3, 4].map((item) => (
              <tr key={item}>
                <td colSpan={3} className="px-6 py-4">
                  <div className="flex items-center gap-4">
                    <div className="h-9 w-9 animate-pulse rounded-xl bg-gray-100 dark:bg-white/5" />

                    <div className="h-10 flex-1 animate-pulse rounded-xl bg-gray-100 dark:bg-white/5" />

                    <div className="h-9 w-32 animate-pulse rounded-xl bg-gray-100 dark:bg-white/5" />
                  </div>
                </td>
              </tr>
            ))
          ) : items.length === 0 ? (
            /* ================= EMPTY ================= */
            <tr>
              <td colSpan={3}>
                <div className="flex min-h-72 flex-col items-center justify-center px-6 text-center">
                  <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-gray-100 shadow-inner dark:bg-white/5">
                    <CarFront className="h-7 w-7 text-gray-400" />
                  </div>

                  <p className="mt-4 font-medium text-gray-700 dark:text-gray-300">
                    ไม่พบข้อมูลประเภทรถ
                  </p>

                  <p className="mt-1 text-sm text-gray-400">
                    เพิ่มประเภทรถใหม่เพื่อเริ่มใช้งาน
                  </p>

                  <button
                    type="button"
                    onClick={onCreate}
                    className="mt-4 inline-flex items-center gap-2 rounded-xl bg-blue-50 px-4 py-2 text-sm font-medium text-blue-600 transition hover:bg-blue-100 dark:bg-blue-500/10 dark:text-blue-400"
                  >
                    <CirclePlus className="h-4 w-4" />
                    เพิ่มประเภทรถ
                  </button>
                </div>
              </td>
            </tr>
          ) : (
            /* ================= DATA ================= */
            items.map((item, index) => (
              <tr
                key={item.typeCarId}
                className="group transition-colors hover:bg-blue-50/40 dark:hover:bg-white/5"
              >
                {/* INDEX */}
                <td className="px-6 py-4">
                  <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gray-100 text-xs font-semibold text-gray-600 transition group-hover:bg-blue-100 group-hover:text-blue-600 dark:bg-white/10 dark:text-gray-300 dark:group-hover:bg-blue-500/10">
                    {String(index + 1).padStart(2, '0')}
                  </div>
                </td>

                {/* TYPE NAME */}
                <td className="px-6 py-4">
                  <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-blue-50 text-blue-500 transition group-hover:scale-105 dark:bg-blue-500/10 dark:text-blue-400">
                      <CarFront className="h-5 w-5" />
                    </div>

                    <div>
                      <p className="font-medium text-gray-800 dark:text-gray-200">
                        {item.typeName}
                      </p>

                      {/* <p className="mt-0.5 text-xs text-gray-400">
                        รหัส #{item.typeCarId}
                      </p> */}
                    </div>
                  </div>
                </td>

                {/* ACTION */}
                <td className="px-6 py-4">
                  <div className="flex justify-end gap-2">
                    {/* EDIT */}
                    <button
                      type="button"
                      onClick={() => onEdit(item)}
                      title={`แก้ไข ${item.typeName}`}
                      className="inline-flex h-9 items-center gap-1.5 rounded-xl border border-blue-100 bg-blue-50 px-3 text-xs font-medium text-blue-600 shadow-sm transition hover:border-blue-200 hover:bg-blue-100 hover:shadow dark:border-blue-500/20 dark:bg-blue-500/10 dark:text-blue-400"
                    >
                      <Pencil className="h-3.5 w-3.5" />
                      แก้ไข
                    </button>

                    {/* DELETE */}
                    <button
                      type="button"
                      disabled={deletingId === item.typeCarId}
                      onClick={() => onDelete(item)}
                      title={`ลบ ${item.typeName}`}
                      className="min-w-18 inline-flex h-9 items-center justify-center gap-1.5 rounded-xl border border-red-100 bg-red-50 px-3 text-xs font-medium text-red-600 shadow-sm transition hover:border-red-200 hover:bg-red-100 hover:shadow disabled:cursor-not-allowed disabled:opacity-50 dark:border-red-500/20 dark:bg-red-500/10 dark:text-red-400"
                    >
                      {deletingId === item.typeCarId ? (
                        <>
                          <span className="h-3.5 w-3.5 animate-spin rounded-full border-2 border-red-300 border-t-red-600" />
                          ลบ...
                        </>
                      ) : (
                        <>
                          <Trash2 className="h-3.5 w-3.5" />
                          ลบ
                        </>
                      )}
                    </button>
                  </div>
                </td>
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
}
