'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import axios from 'axios';

import {
  ArrowLeft,
  ArrowRight,
  CalendarDays,
  CarFront,
  Droplets,
  Fuel,
  Gauge,
  Pencil,
  Trash2,
  UserRound,
  Wallet,
} from 'lucide-react';

import { toast } from 'react-toastify';
import { CarOilItem } from '@/types/carOilType';
import UsageHeader from './UsageHeader';
import CarOilModal from './CarOilModal';
import DeleteCarOilModal from './DeleteCarOilModal';
import api from '@/lib/axios';

export default function ListOli() {
  const [data, setData] = useState<CarOilItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const [search, setSearch] = useState('');

  const [currentPage, setCurrentPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<CarOilItem | null>(null);
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [deletingItem, setDeletingItem] = useState<CarOilItem | null>(null);

  const [isDeleting, setIsDeleting] = useState(false);

  const fetchOil = useCallback(async () => {
    try {
      setIsLoading(true);

      const response = await api.get('/api/cars/car-oil', {
        params: {
          _t: Date.now(),
        },

        headers: {
          'Cache-Control': 'no-cache',
          Pragma: 'no-cache',
        },
      });

      const items: CarOilItem[] = Array.isArray(response.data?.data)
        ? response.data.data
        : [];

      setData(items);
    } catch (error) {
      console.error('โหลดข้อมูลน้ำมันไม่สำเร็จ:', error);

      setData([]);

      toast.error('ไม่สามารถโหลดข้อมูลการเติมน้ำมันได้');
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchOil();
  }, [fetchOil]);

  // FILTER

  const filtered = useMemo(() => {
    const keyword = search.trim().toLowerCase();

    return data.filter((item) => {
      // ================= SEARCH =================
      const matchesSearch =
        !keyword ||
        [
          item.carCode,
          item.carBrandSub,
          item.carBrand,
          item.licensePlate,
          item.driverName,
          item.oilName,
          item.kmDetail,
        ]
          .filter((value) => value !== null && value !== undefined)
          .some((value) => String(value).toLowerCase().includes(keyword));

      if (!matchesSearch) {
        return false;
      }

      // ================= DATE =================
      const oilDate = normalizeOilDate(item.dateOil);

      if (startDate && oilDate < startDate) {
        return false;
      }

      if (endDate && oilDate > endDate) {
        return false;
      }

      return true;
    });
  }, [data, search, startDate, endDate]);

  // PAGINATION

  const totalPages = Math.max(1, Math.ceil(filtered.length / rowsPerPage));

  const paginatedData = useMemo(() => {
    const start = (currentPage - 1) * rowsPerPage;

    return filtered.slice(start, start + rowsPerPage);
  }, [filtered, currentPage, rowsPerPage]);

  useEffect(() => {
    if (currentPage > totalPages) {
      setCurrentPage(totalPages);
    }
  }, [currentPage, totalPages]);

  const handleDelete = (item: CarOilItem) => {
    setDeletingItem(item);
  };
  const handleConfirmDelete = async () => {
    if (!deletingItem) return;

    try {
      setIsDeleting(true);

      await api.delete(`/api/cars/car-oil/${deletingItem.id}`);

      toast.success('ลบข้อมูลการเติมน้ำมันเรียบร้อยแล้ว');

      setDeletingItem(null);

      await fetchOil();
    } catch (error) {
      console.error('Delete car oil error:', error);

      if (axios.isAxiosError(error)) {
        toast.error(
          error.response?.data?.message || 'ไม่สามารถลบข้อมูลการเติมน้ำมันได้',
        );
      } else {
        toast.error('เกิดข้อผิดพลาดในการลบข้อมูล');
      }
    } finally {
      setIsDeleting(false);
    }
  };
  const handleCreate = () => {
    setEditingItem(null);
    setModalOpen(true);
  };
  const handleEdit = (item: CarOilItem) => {
    setEditingItem(item);
    setModalOpen(true);
  };

  return (
    <div className="space-y-5">
      <UsageHeader
        search={search}
        total={filtered.length}
        startDate={startDate}
        endDate={endDate}
        onSearchChange={(value) => {
          setSearch(value);
          setCurrentPage(1);
        }}
        onStartDateChange={(value) => {
          setStartDate(value);
          setCurrentPage(1);
        }}
        onEndDateChange={(value) => {
          setEndDate(value);
          setCurrentPage(1);
        }}
        onClearDate={() => {
          setSearch('');
          setStartDate('');
          setEndDate('');
          setCurrentPage(1);
        }}
        onCreate={handleCreate}
      />

      {/* TABLE */}

      <div className="overflow-hidden rounded-2xl border border-gray-100 bg-white shadow-sm dark:border-white/10 dark:bg-gray-900">
        <div className="overflow-x-auto">
          <table className="min-w-250 w-full">
            <thead>
              <tr className="border-border bg-muted/40 border-b text-left">
                <th className="text-muted-foreground w-16 px-5 py-4 text-xs font-semibold">
                  #
                </th>

                <th className="text-muted-foreground min-w-64 px-5 py-4 text-xs font-semibold">
                  รถ / ทะเบียน
                </th>

                <th className="text-muted-foreground min-w-56 px-5 py-4 text-xs font-semibold">
                  คนขับรถ
                </th>

                <th className="text-muted-foreground min-w-56 px-5 py-4 text-xs font-semibold">
                  วันที่เติม / เลขไมล์
                </th>

                <th className="text-muted-foreground min-w-72 px-5 py-4 text-xs font-semibold">
                  รายละเอียดการเติมน้ำมัน
                </th>

                <th className="text-muted-foreground w-44 px-5 py-4 text-right text-xs font-semibold">
                  จัดการ
                </th>
              </tr>
            </thead>

            <tbody className="divide-y divide-gray-100 dark:divide-white/5">
              {isLoading ? (
                <LoadingRow />
              ) : paginatedData.length === 0 ? (
                <EmptyRow />
              ) : (
                paginatedData.map((item, index) => (
                  <tr
                    key={item.id}
                    className="group transition-colors hover:bg-amber-50/40 dark:hover:bg-white/5"
                  >
                    {/* INDEX */}
                    <td className="px-5 py-4">
                      <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gray-100 text-xs font-semibold text-gray-600 dark:bg-white/10 dark:text-gray-300">
                        {(currentPage - 1) * rowsPerPage + index + 1}
                      </div>
                    </td>

                    {/* ================= CAR ================= */}
                    <td className="px-5 py-4">
                      <div className="flex items-start gap-3">
                        <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-blue-50 text-blue-600 shadow-sm dark:bg-blue-500/10 dark:text-blue-300">
                          <CarFront className="h-5 w-5" />
                        </div>

                        <div className="min-w-0 flex-1">
                          <p className="truncate text-sm font-bold text-gray-900 dark:text-white">
                            {[item.carBrand, item.carBrandSub]
                              .filter(Boolean)
                              .join(' ') || 'ไม่ระบุข้อมูลรถ'}
                          </p>

                          <div className="mt-2 flex flex-wrap items-center gap-2">
                            {item.carCode && (
                              <span className="rounded-lg bg-blue-50 px-2.5 py-1 text-[10px] font-semibold text-blue-600 dark:bg-blue-500/10 dark:text-blue-300">
                                รหัส {item.carCode}
                              </span>
                            )}

                            <span className="rounded-lg bg-gray-100 px-2.5 py-1 text-[10px] font-semibold text-gray-700 dark:bg-white/10 dark:text-gray-300">
                              ทะเบียน {item.licensePlate || '-'}
                            </span>
                          </div>
                        </div>
                      </div>
                    </td>

                    {/* ================= DRIVER ================= */}
                    <td className="px-5 py-4">
                      <div className="flex items-start gap-3">
                        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-indigo-50 text-indigo-500 dark:bg-indigo-500/10 dark:text-indigo-300">
                          <UserRound className="h-4 w-4" />
                        </div>

                        <div className="min-w-0">
                          <p className="truncate text-sm font-semibold text-gray-900 dark:text-white">
                            {item.driverName || '-'}
                          </p>

                          <p className="mt-1 text-xs text-gray-400">
                            รหัส {item.driverCode || '-'}
                          </p>
                        </div>
                      </div>
                    </td>

                    {/* ================= DATE / KM ================= */}
                    <td className="px-5 py-4">
                      <div className="space-y-2">
                        <div className="flex items-center gap-2">
                          <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-violet-500/10 text-violet-600 dark:text-violet-400">
                            <CalendarDays className="h-4 w-4" />
                          </div>

                          <div>
                            <p className="text-muted-foreground text-[10px] font-medium">
                              วันที่เติมน้ำมัน
                            </p>

                            <p className="text-foreground mt-0.5 text-xs font-semibold">
                              {formatThaiDateTime(item.dateOil)}
                            </p>
                          </div>
                        </div>

                        <div className="flex items-center gap-2">
                          <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-blue-500/10 text-blue-600 dark:text-blue-400">
                            <Gauge className="h-4 w-4" />
                          </div>

                          <div>
                            <p className="text-muted-foreground text-[10px] font-medium">
                              เลขไมล์
                            </p>

                            <p className="text-foreground mt-0.5 text-xs font-bold">
                              {formatNumber(item.kmDetail)} กม.
                            </p>
                          </div>
                        </div>
                      </div>
                    </td>

                    {/* ================= OIL DETAIL ================= */}
                    <td className="px-5 py-4">
                      <div className="min-w-64 overflow-hidden rounded-xl border border-gray-100 bg-gray-50/70 dark:border-white/5 dark:bg-white/5">
                        {/* OIL TYPE */}
                        <div className="flex items-center justify-between gap-4 px-3 py-2.5">
                          <div className="flex items-center gap-2 text-xs text-gray-500">
                            <Fuel className="h-4 w-4 text-amber-500" />

                            <span>ชนิดน้ำมัน</span>
                          </div>

                          <span className="rounded-lg bg-amber-50 px-2.5 py-1 text-xs font-bold text-amber-700 dark:bg-amber-500/10 dark:text-amber-300">
                            {item.oilName || '-'}
                          </span>
                        </div>

                        {/* LITER */}
                        <div className="flex items-center justify-between gap-4 border-t border-gray-100 px-3 py-2.5 dark:border-white/10">
                          <div className="flex items-center gap-2 text-xs text-gray-500">
                            <Droplets className="h-4 w-4 text-blue-500" />

                            <span>ปริมาณ</span>
                          </div>

                          <span className="text-sm font-semibold text-gray-800 dark:text-gray-200">
                            {formatNumber(item.literOil)} ลิตร
                          </span>
                        </div>

                        {/* PRICE */}
                        <div className="flex items-center justify-between gap-4 border-t border-emerald-100 bg-emerald-50/60 px-3 py-2.5 dark:border-emerald-500/10 dark:bg-emerald-500/10">
                          <div className="flex items-center gap-2">
                            <Wallet className="h-4 w-4 text-emerald-500" />

                            <span className="text-xs font-semibold text-emerald-600 dark:text-emerald-400">
                              ค่าใช้จ่าย
                            </span>
                          </div>

                          <span className="text-base font-bold text-emerald-700 dark:text-emerald-300">
                            {formatMoney(item.priceOil)} บาท
                          </span>
                        </div>
                      </div>
                    </td>

                    {/* ================= ACTION ================= */}
                    <td className="px-5 py-4">
                      <div className="flex justify-end gap-2">
                        <button
                          type="button"
                          onClick={() => handleEdit(item)}
                          className="group/btn inline-flex h-9 items-center justify-center gap-1.5 rounded-xl border border-blue-100 bg-blue-50 px-3 text-xs font-semibold text-blue-600 transition-all hover:border-blue-200 hover:bg-blue-100 dark:border-blue-500/20 dark:bg-blue-500/10 dark:text-blue-300"
                        >
                          <Pencil className="h-3.5 w-3.5 transition-transform group-hover/btn:rotate-6" />
                          แก้ไข
                        </button>

                        <button
                          type="button"
                          onClick={() => handleDelete(item)}
                          title="ลบข้อมูลการเติมน้ำมัน"
                          className="group/btn flex h-9 w-9 items-center justify-center rounded-xl border border-red-100 bg-red-50 text-red-500 transition-all hover:border-red-200 hover:bg-red-100 hover:text-red-600 dark:border-red-500/20 dark:bg-red-500/10 dark:text-red-400"
                        >
                          <Trash2 className="h-3.5 w-3.5 transition-transform group-hover/btn:scale-110" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* PAGINATION */}

        {!isLoading && filtered.length > 0 && (
          <div className="dark:bg-white/2 flex flex-col gap-4 border-t border-gray-100 bg-gray-50/40 px-4 py-3 sm:flex-row sm:items-center sm:justify-between dark:border-white/10">
            {/* LEFT */}
            <div className="flex items-center gap-3">
              <span className="text-xs text-gray-500">แสดง</span>

              <select
                value={rowsPerPage}
                onChange={(event) => {
                  setRowsPerPage(Number(event.target.value));
                  setCurrentPage(1);
                }}
                className="h-9 rounded-lg border border-gray-200 bg-white px-3 text-xs font-medium text-gray-700 outline-none transition hover:border-amber-300 focus:border-amber-500 dark:border-white/10 dark:bg-gray-900 dark:text-gray-200"
              >
                {[5, 10, 20, 50].map((number) => (
                  <option key={number} value={number}>
                    {number}
                  </option>
                ))}
              </select>

              <span className="text-xs text-gray-500">รายการ</span>

              <span className="hidden text-xs text-gray-400 sm:inline">
                ทั้งหมด {filtered.length} รายการ
              </span>
            </div>

            {/* RIGHT */}
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setCurrentPage((page) => Math.max(1, page - 1))}
                disabled={currentPage === 1}
                className="inline-flex h-9 items-center gap-1 rounded-lg border border-gray-200 bg-white px-3 text-xs text-gray-600 transition hover:border-amber-200 hover:text-amber-600 disabled:cursor-not-allowed disabled:opacity-40 dark:border-white/10 dark:bg-white/5 dark:text-gray-300"
              >
                <ArrowLeft className="h-4 w-4" />
                ก่อนหน้า
              </button>

              <div className="inline-flex h-9 items-center rounded-lg border border-gray-100 bg-white px-3 text-xs dark:border-white/10 dark:bg-white/5">
                <span className="font-bold text-amber-600">{currentPage}</span>

                <span className="mx-1.5 text-gray-300">/</span>

                <span className="text-gray-600 dark:text-gray-300">
                  {totalPages}
                </span>
              </div>

              <button
                type="button"
                onClick={() =>
                  setCurrentPage((page) => Math.min(totalPages, page + 1))
                }
                disabled={currentPage >= totalPages}
                className="bg-linear-to-r inline-flex h-9 items-center gap-1 rounded-lg from-amber-500 to-orange-600 px-3 text-xs font-medium text-white shadow-sm transition hover:shadow-md disabled:cursor-not-allowed disabled:opacity-40"
              >
                ถัดไป
                <ArrowRight className="h-4 w-4" />
              </button>
            </div>
          </div>
        )}
      </div>
      <CarOilModal
        isOpen={modalOpen}
        editingItem={editingItem}
        onClose={() => {
          setModalOpen(false);
          setEditingItem(null);
        }}
        onSuccess={async () => {
          await fetchOil();
        }}
      />
      <DeleteCarOilModal
        isOpen={Boolean(deletingItem)}
        item={deletingItem}
        isDeleting={isDeleting}
        onClose={() => {
          if (isDeleting) return;

          setDeletingItem(null);
        }}
        onConfirm={handleConfirmDelete}
      />
    </div>
  );
}

// LOADING

function LoadingRow() {
  return (
    <tr>
      <td colSpan={5} className="px-6 py-20">
        <div className="flex flex-col items-center justify-center">
          <div className="h-9 w-9 animate-spin rounded-full border-4 border-amber-100 border-t-amber-600" />

          <p className="mt-3 text-sm text-gray-500">
            กำลังโหลดข้อมูลการเติมน้ำมัน...
          </p>
        </div>
      </td>
    </tr>
  );
}

// EMPTY

function EmptyRow() {
  return (
    <tr>
      <td colSpan={5} className="px-6 py-20">
        <div className="text-center">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-amber-50 text-amber-500 dark:bg-amber-500/10">
            <Fuel className="h-6 w-6" />
          </div>

          <p className="mt-4 font-semibold text-gray-700 dark:text-gray-300">
            ไม่พบข้อมูลการเติมน้ำมัน
          </p>

          <p className="mt-1 text-xs text-gray-400">
            ยังไม่มีรายการ หรือไม่พบข้อมูลจากคำค้นหา
          </p>
        </div>
      </td>
    </tr>
  );
}

// FORMAT

function formatNumber(value?: number | null) {
  return new Intl.NumberFormat('th-TH', {
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  }).format(Number(value ?? 0));
}

function formatMoney(value?: number | null) {
  return new Intl.NumberFormat('th-TH', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(Number(value ?? 0));
}
function normalizeOilDate(value?: string | null) {
  if (!value) return '';

  const match = String(value).match(/^(\d{4})-(\d{2})-(\d{2})/);

  if (!match) return '';

  return `${match[1]}-${match[2]}-${match[3]}`;
}
function formatThaiDateTime(value?: string | null) {
  if (!value) {
    return '-';
  }

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return '-';
  }

  return new Intl.DateTimeFormat('th-TH', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }).format(date);
}
