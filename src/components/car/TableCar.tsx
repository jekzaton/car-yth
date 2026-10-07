'use client';

import axios from 'axios';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  ArrowLeft,
  ArrowRight,
  Trash2,
  AlertTriangle,
  Loader2,
} from 'lucide-react';
import { Modal } from '../ui/modal';
import { useModal } from '@/hooks/useModal';
import { toast } from 'react-toastify';
import { CarItem, CarApiResponse, CarStatus } from '@/types/carType';
import api from '@/lib/axios';
import CarManageHeader from './CarManageHeader';
import CarManageTable from './CarManageTable';

export default function TableCar() {
  const router = useRouter();

  const [cars, setCars] = useState<CarItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | CarStatus>('all');

  const [currentPage, setCurrentPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(5);
  const { isOpen, openModal, closeModal } = useModal();

  const [selectedCar, setSelectedCar] = useState<CarItem | null>(null);

  const [deleting, setDeleting] = useState(false);

  const handleOpenDeleteModal = (car: CarItem) => {
    setSelectedCar(car);
    openModal();
  };

  const handleCloseDeleteModal = () => {
    if (deleting) return;

    closeModal();
    setSelectedCar(null);
  };

  const handleDeleteCar = async () => {
    if (!selectedCar) return;

    try {
      setDeleting(true);

      await api.delete(`/api/cars/${selectedCar.id}`);

      toast.success('ลบข้อมูลรถเรียบร้อยแล้ว');

      closeModal();
      setSelectedCar(null);

      await fetchCars();
    } catch (error) {
      console.error('Delete car error:', error);

      if (axios.isAxiosError(error)) {
        toast.error(error.response?.data?.message || 'ไม่สามารถลบข้อมูลรถได้');
      } else {
        toast.error('เกิดข้อผิดพลาดระหว่างลบข้อมูล');
      }
    } finally {
      setDeleting(false);
    }
  };

  const fetchCars = useCallback(async () => {
    try {
      setIsLoading(true);

      const res = await api.get<CarApiResponse>('/api/cars', {
        params: {
          _t: Date.now(),
        },
        headers: {
          'Cache-Control': 'no-cache',
          Pragma: 'no-cache',
        },
      });

      const newCars = Array.isArray(res.data.data) ? res.data.data : [];

      // console.log('ข้อมูลรถล่าสุด:', newCars);

      setCars(newCars);
    } catch (error) {
      console.error('โหลดข้อมูลรถไม่สำเร็จ:', error);
      setCars([]);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchCars();

    const handleFocus = () => {
      fetchCars();
    };

    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible') {
        fetchCars();
      }
    };

    window.addEventListener('focus', handleFocus);
    document.addEventListener('visibilitychange', handleVisibilityChange);

    return () => {
      window.removeEventListener('focus', handleFocus);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, [fetchCars]);

  const filtered = useMemo(() => {
    const keyword = search.trim().toLowerCase();

    return cars.filter((car) => {
      const matchSearch =
        (car.carCode ?? '').toLowerCase().includes(keyword) ||
        (car.carBrandSub ?? '').toLowerCase().includes(keyword) ||
        (car.carBrand ?? '').toLowerCase().includes(keyword) ||
        (car.licensePlate ?? '').toLowerCase().includes(keyword);

      const matchStatus = statusFilter === 'all' || car.status === statusFilter;

      return matchSearch && matchStatus;
    });
  }, [cars, search, statusFilter]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / rowsPerPage));
  useEffect(() => {
    setCurrentPage(1);
  }, [search, statusFilter, rowsPerPage]);

  const data = useMemo(() => {
    const start = (currentPage - 1) * rowsPerPage;
    return filtered.slice(start, start + rowsPerPage);
  }, [filtered, currentPage, rowsPerPage]);

  const countActive = filtered.filter((car) => car.status === 'active').length;

  const countInactive = filtered.filter(
    (car) => car.status === 'inactive',
  ).length;

  const handleStatusFilterChange = (value: 'all' | 'active' | 'inactive') => {
    setStatusFilter(value);
  };

  return (
    <>
      <div className="space-y-5">
        {/* HEADER PREMIUM */}
        <CarManageHeader
          total={filtered.length}
          search={search}
          statusFilter={statusFilter}
          countActive={countActive}
          countInactive={countInactive}
          onSearchChange={setSearch}
          onStatusFilterChange={handleStatusFilterChange}
          onCreate={() => router.push('/cars/create')}
        />

        {/* TABLE */}
        <CarManageTable
          data={data}
          isLoading={isLoading}
          currentPage={currentPage}
          rowsPerPage={rowsPerPage}
          onEdit={(id) => router.push(`/cars/edit/${id}`)}
          onDelete={handleOpenDeleteModal}
        />

        {/* PAGINATION */}
        <div className="flex flex-col gap-4 rounded-xl border border-white/10 bg-white/60 px-4 py-3 shadow-sm backdrop-blur sm:flex-row sm:items-center sm:justify-between dark:bg-white/5">
          {/* LEFT - rows per page */}
          <div className="relative inline-flex items-center">
            {/* glow */}
            <div className="bg-linear-to-r absolute -inset-1 rounded-lg from-blue-500/10 via-indigo-500/10 to-blue-500/10 blur-md" />

            <select
              value={rowsPerPage}
              onChange={(e) => setRowsPerPage(Number(e.target.value))}
              className="relative appearance-none rounded-lg border border-gray-200 bg-white/80 px-4 py-2 pr-8 text-sm font-medium text-gray-700 shadow-sm backdrop-blur transition hover:border-blue-300 hover:shadow-md focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-200 dark:border-white/10 dark:bg-white/5 dark:text-white/90"
            >
              {[5, 10, 20, 50].map((n) => (
                <option key={n} value={n}>
                  {n}
                </option>
              ))}
            </select>

            {/* custom arrow */}
            <div className="pointer-events-none absolute right-2 text-gray-400">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
                <path
                  d="M7 10l5 5 5-5"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </div>
          </div>

          {/* RIGHT - pagination */}
          <div className="flex items-center gap-3">
            {/* previous */}
            <button
              onClick={() => setCurrentPage((p) => p - 1)}
              disabled={currentPage === 1}
              className="group inline-flex items-center gap-1 rounded-lg border border-gray-200 bg-white/70 px-3 py-1.5 text-sm text-gray-700 shadow-sm backdrop-blur transition hover:border-blue-300 hover:text-blue-600 hover:shadow-md disabled:cursor-not-allowed disabled:opacity-40 dark:border-white/10 dark:bg-white/5 dark:text-white/90"
            >
              <ArrowLeft size={16} />
              ก่อนหน้า
            </button>

            {/* page indicator */}
            <div className="rounded-lg bg-white/60 px-3 py-1.5 text-sm font-medium text-gray-700 shadow-sm backdrop-blur dark:bg-white/5 dark:text-white/90">
              <span className="text-blue-600">{currentPage}</span>
              <span className="mx-1 text-gray-400">/</span>
              <span>{totalPages}</span>
            </div>

            {/* next */}
            <button
              onClick={() => setCurrentPage((p) => p + 1)}
              disabled={currentPage === totalPages}
              className="bg-linear-to-r group inline-flex items-center gap-1 rounded-lg from-blue-500 via-blue-600 to-indigo-600 px-3 py-1.5 text-sm font-medium text-white shadow-md transition hover:scale-[1.02] hover:shadow-lg disabled:cursor-not-allowed disabled:opacity-40"
            >
              ถัดไป
              <ArrowRight size={16} />
            </button>
          </div>
        </div>
      </div>

      <Modal
        isOpen={isOpen}
        onClose={handleCloseDeleteModal}
        className="max-w-md p-6 lg:p-8"
      >
        <div className="text-center">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-red-100 dark:bg-red-500/15">
            <AlertTriangle className="h-8 w-8 text-red-600 dark:text-red-400" />
          </div>

          <div className="mt-5">
            <h4 className="text-xl font-semibold text-gray-800 dark:text-white/90">
              ยืนยันการลบข้อมูล
            </h4>

            <p className="mt-2 text-sm leading-6 text-gray-500 dark:text-gray-400">
              คุณต้องการลบข้อมูลรถรายการนี้ใช่หรือไม่?
            </p>

            {selectedCar && (
              <div className="dark:bg-white/3 mt-4 rounded-xl border border-gray-200 bg-gray-50 px-4 py-3 text-left dark:border-gray-800">
                <p className="text-center text-sm font-semibold text-gray-800 dark:text-white/90">
                  {[selectedCar.carBrand, selectedCar.carBrandSub]
                    .filter(Boolean)
                    .join(' ') || 'ไม่ระบุข้อมูลรถ'}
                </p>

                {selectedCar.carCode && (
                  <p className="mt-1 text-center text-xs text-gray-500 dark:text-gray-400">
                    รหัสรถ: {selectedCar.carCode}
                  </p>
                )}

                {selectedCar.licensePlate && (
                  <p className="mt-1 text-center text-xs text-gray-500 dark:text-gray-400">
                    ทะเบียนรถ: {selectedCar.licensePlate}
                  </p>
                )}
              </div>
            )}

            <p className="mt-4 text-xs text-red-500 dark:text-red-400">
              เมื่อลบแล้วจะไม่สามารถกู้คืนข้อมูลได้
            </p>
          </div>

          <div className="mt-6 flex flex-col-reverse gap-3 sm:flex-row sm:justify-center">
            <button
              type="button"
              onClick={handleCloseDeleteModal}
              disabled={deleting}
              className="inline-flex min-w-28 items-center justify-center rounded-lg border border-gray-300 bg-white px-4 py-2.5 text-sm font-medium text-gray-700 shadow-sm transition hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-white/5"
            >
              ยกเลิก
            </button>

            <button
              type="button"
              onClick={handleDeleteCar}
              disabled={deleting}
              className="shadow-theme-xs inline-flex min-w-32 items-center justify-center gap-2 rounded-lg bg-red-600 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-red-700 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {deleting ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  กำลังลบ...
                </>
              ) : (
                <>
                  <Trash2 className="h-4 w-4" />
                  ยืนยันการลบ
                </>
              )}
            </button>
          </div>
        </div>
      </Modal>
    </>
  );
}
