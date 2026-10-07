'use client';

import { Loader2, Pencil, Trash2 } from 'lucide-react';

import CarImageCell from './CarImageCell';

type CarItem = {
  id: number;
  carCode: string;
  carBrandSub?: string | null;
  carBrand?: string | null;
  licensePlate?: string | null;
  carImage?: string | null;
  status: 'active' | 'inactive';
};

type CarManageTableProps = {
  data: CarItem[];
  isLoading: boolean;
  currentPage: number;
  rowsPerPage: number;

  onEdit: (id: number) => void;
  onDelete: (car: CarItem) => void;
};

export default function CarManageTable({
  data,
  isLoading,
  currentPage,
  rowsPerPage,
  onEdit,
  onDelete,
}: CarManageTableProps) {
  return (
    <div className="relative w-full overflow-x-auto">
      {/* LEFT FADE */}
      <div className="bg-linear-to-r pointer-events-none absolute left-0 top-0 z-10 h-full w-6 from-white to-transparent dark:from-gray-900" />

      {/* RIGHT FADE */}
      <div className="bg-linear-to-l pointer-events-none absolute right-0 top-0 z-10 h-full w-6 from-white to-transparent dark:from-gray-900" />

      <table className="min-w-280 w-full">
        <thead>
          <tr className="border-b bg-white/60 backdrop-blur dark:border-white/10 dark:bg-white/5">
            <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500">
              #
            </th>

            <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500">
              รูป
            </th>

            <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500">
              รหัส
            </th>

            <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500">
              รุ่นรถ
            </th>

            <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500">
              ยี่ห้อ
            </th>

            <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500">
              ทะเบียน
            </th>

            <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500">
              สถานะ
            </th>

            <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500">
              จัดการ
            </th>
          </tr>
        </thead>

        <tbody className="divide-y divide-gray-100 dark:divide-white/5">
          {isLoading && (
            <tr>
              <td colSpan={8} className="px-6 py-12 text-center">
                <div className="inline-flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400">
                  <Loader2 className="h-5 w-5 animate-spin" />
                  กำลังโหลดข้อมูลรถ...
                </div>
              </td>
            </tr>
          )}

          {!isLoading && data.length === 0 && (
            <tr>
              <td
                colSpan={8}
                className="px-6 py-12 text-center text-sm text-gray-500 dark:text-gray-400"
              >
                ไม่พบข้อมูลรถ
              </td>
            </tr>
          )}

          {!isLoading &&
            data.map((car, index) => {
              const mainImage = getMainCarImage(car.carImage);

              return (
                <tr
                  key={car.id}
                  className="group transition hover:bg-blue-50/40 dark:hover:bg-white/5"
                >
                  {/* NUMBER */}
                  <td className="px-6 py-4 text-sm text-gray-600 dark:text-gray-300">
                    {(currentPage - 1) * rowsPerPage + index + 1}
                  </td>

                  {/* IMAGE */}
                  <td className="px-6 py-4">
                    <CarImageCell
                      key={`${car.id}-${mainImage ?? 'no-image'}`}
                      src={
                        mainImage
                          ? `${process.env.NEXT_PUBLIC_BASE_PATH || ''}${mainImage}`
                          : ''
                      }
                      alt={
                        `${car.carBrand || ''} ${car.carBrandSub || ''}`.trim() ||
                        'รูปรถยนต์'
                      }
                    />
                  </td>

                  {/* CODE */}
                  <td className="px-6 py-4 text-sm font-semibold text-blue-600 dark:text-blue-400">
                    {car.carCode}
                  </td>

                  {/* MODEL */}
                  <td className="px-6 py-4 text-sm font-medium text-gray-800 dark:text-gray-200">
                    {car.carBrandSub || '-'}
                  </td>

                  {/* BRAND */}
                  <td className="px-6 py-4 text-sm text-gray-600 dark:text-gray-300">
                    {car.carBrand || '-'}
                  </td>

                  {/* LICENSE */}
                  <td className="px-6 py-4 text-sm text-gray-700 dark:text-gray-200">
                    {car.licensePlate || '-'}
                  </td>

                  {/* STATUS */}
                  <td className="px-6 py-4">
                    <span
                      className={`inline-flex rounded-full px-3 py-1 text-xs font-semibold ${
                        car.status === 'active'
                          ? 'bg-green-50 text-green-700 dark:bg-green-500/10 dark:text-green-300'
                          : 'bg-red-50 text-red-600 dark:bg-red-500/10 dark:text-red-300'
                      }`}
                    >
                      {car.status === 'active' ? 'ใช้งาน' : 'ไม่ใช้งาน'}
                    </span>
                  </td>

                  {/* ACTION */}
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => onEdit(car.id)}
                        className="group/btn inline-flex items-center gap-1 rounded-lg border border-blue-100 bg-blue-50 px-3 py-1.5 text-xs font-medium text-blue-600 shadow-sm transition hover:border-blue-200 hover:bg-blue-100 hover:shadow-md dark:border-blue-500/20 dark:bg-blue-500/10 dark:text-blue-300"
                      >
                        <Pencil className="h-3.5 w-3.5 transition group-hover/btn:rotate-12" />
                        แก้ไข
                      </button>

                      <button
                        type="button"
                        onClick={() => onDelete(car)}
                        className="group/btn inline-flex items-center gap-1.5 rounded-lg border border-red-200 bg-red-50 px-3 py-1.5 text-xs font-semibold text-red-600 shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:border-red-300 hover:bg-red-100 hover:shadow-md active:translate-y-0 active:scale-95 dark:border-red-500/20 dark:bg-red-500/10 dark:text-red-300 dark:hover:border-red-500/30 dark:hover:bg-red-500/20"
                      >
                        <Trash2 className="h-3.5 w-3.5 transition-transform duration-200 group-hover/btn:rotate-6 group-hover/btn:scale-110" />
                        ลบ
                      </button>
                    </div>
                  </td>
                </tr>
              );
            })}
        </tbody>
      </table>
    </div>
  );
}

// ======================================================
// GET MAIN CAR IMAGE
// ======================================================

function getMainCarImage(carImage?: string | null): string | null {
  if (!carImage) return null;

  try {
    const parsed: unknown = JSON.parse(carImage);

    if (parsed && typeof parsed === 'object' && !Array.isArray(parsed)) {
      const data = parsed as {
        main?: unknown;
        images?: unknown;
      };

      if (typeof data.main === 'string' && data.main.trim()) {
        return data.main;
      }

      if (Array.isArray(data.images) && typeof data.images[0] === 'string') {
        return data.images[0];
      }
    }

    if (Array.isArray(parsed) && typeof parsed[0] === 'string') {
      return parsed[0];
    }
  } catch {
    if (
      carImage.startsWith('/') ||
      carImage.startsWith('http://') ||
      carImage.startsWith('https://')
    ) {
      return carImage;
    }
  }

  return null;
}
