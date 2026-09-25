'use client';

import axios from 'axios';
import { useCallback, useEffect, useMemo, useState } from 'react';
import CarImageCell from './CarImageCell';
import { useRouter } from 'next/navigation';
import {
  ArrowLeft,
  ArrowRight,
  CirclePlus,
  Pencil,
  Trash2,
  AlertTriangle,
  Loader2,
} from 'lucide-react';
import { Modal } from '../ui/modal';
import { useModal } from '@/hooks/useModal';
import { toast } from 'react-toastify';
import { Car } from '@/types/carType';

type CarStatus = 'active' | 'inactive';

const API_URL = process.env.NEXT_PUBLIC_API_URL + '/api/cars';

function getMainCarImage(carImage: unknown): string | null {
  if (!carImage) return null;

  if (Array.isArray(carImage)) {
    return typeof carImage[0] === 'string' ? carImage[0] : null;
  }

  if (typeof carImage !== 'string') {
    return null;
  }

  const value = carImage.trim();

  if (!value) return null;

  try {
    const parsed: unknown = JSON.parse(value);

    // รูปแบบใหม่ { main, images }
    if (parsed && typeof parsed === 'object' && !Array.isArray(parsed)) {
      const imageData = parsed as {
        main?: unknown;
        images?: unknown;
      };

      if (typeof imageData.main === 'string' && imageData.main.trim() !== '') {
        return imageData.main;
      }

      if (
        Array.isArray(imageData.images) &&
        typeof imageData.images[0] === 'string'
      ) {
        return imageData.images[0];
      }
    }

    // รองรับข้อมูลรูปแบบเก่า ["/image1.jpg", "/image2.jpg"]
    if (Array.isArray(parsed) && typeof parsed[0] === 'string') {
      return parsed[0];
    }
  } catch {
    // รองรับกรณีเก็บ URL รูปตรง ๆ
    if (
      value.startsWith('/') ||
      value.startsWith('http://') ||
      value.startsWith('https://')
    ) {
      return value;
    }
  }

  return null;
}

export default function TableCar() {
  const router = useRouter();

  const [cars, setCars] = useState<Car[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | CarStatus>('all');

  const [currentPage, setCurrentPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(5);
  const { isOpen, openModal, closeModal } = useModal();

  const [selectedCar, setSelectedCar] = useState<Car | null>(null);

  const [deleting, setDeleting] = useState(false);

  const handleOpenDeleteModal = (car: Car) => {
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

      await axios.delete(`/api/cars/${selectedCar.id}`);

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

      const res = await axios.get(API_URL, {
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
    return cars.filter((c) => {
      const matchSearch =
        c.carCode.toLowerCase().includes(search.toLowerCase()) ||
        c.carName.toLowerCase().includes(search.toLowerCase()) ||
        c.carBrand.toLowerCase().includes(search.toLowerCase()) ||
        c.licensePlate.toLowerCase().includes(search.toLowerCase());

      const matchStatus =
        statusFilter === 'all' ? true : c.status === statusFilter;

      return matchSearch && matchStatus;
    });
  }, [cars, search, statusFilter]);

  const totalPages = Math.ceil(filtered.length / rowsPerPage);

  const data = useMemo(() => {
    const start = (currentPage - 1) * rowsPerPage;
    return filtered.slice(start, start + rowsPerPage);
  }, [filtered, currentPage, rowsPerPage]);

  const filteredCars = cars.filter((car) => {
    const matchSearch =
      car.carCode.toLowerCase().includes(search.toLowerCase()) ||
      car.carName.toLowerCase().includes(search.toLowerCase()) ||
      car.carBrand.toLowerCase().includes(search.toLowerCase()) ||
      car.licensePlate.toLowerCase().includes(search.toLowerCase());

    const matchStatus =
      statusFilter === 'all' ? true : car.status === statusFilter;

    return matchSearch && matchStatus;
  });

  const countActive = filteredCars.filter((c) => c.status === 'active').length;
  const countInactive = filteredCars.filter(
    (c) => c.status === 'inactive',
  ).length;

  return (
    <>
      <div className="space-y-5">
        {/* HEADER PREMIUM */}
        <div className="bg-linear-to-r relative overflow-hidden rounded-2xl border border-white/10 from-white via-white to-blue-50/60 px-6 py-6 shadow-sm dark:from-gray-900 dark:via-gray-900 dark:to-blue-950/20">
          {/* glow */}
          <div className="absolute -top-10 right-10 h-40 w-40 rounded-full bg-blue-500/20 blur-3xl" />

          <div className="relative space-y-5">
            {/* TITLE */}
            <div>
              <h1 className="text-lg font-semibold text-gray-900 dark:text-white">
                จัดการยานพาหนะ
              </h1>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                พบทั้งหมด {filteredCars.length} รายการ
              </p>
            </div>

            {/* CONTROLS */}
            <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
              {/* LEFT */}
              <div className="flex flex-wrap items-center gap-3">
                {/* SEARCH */}
                <input
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="ค้นหา รหัส / ชื่อ / ทะเบียน"
                  className="w-72 rounded-xl border border-gray-200 bg-white/70 px-4 py-2 text-sm backdrop-blur transition focus:border-blue-500 focus:ring-2 focus:ring-blue-200 dark:border-white/10 dark:bg-white/5"
                />

                {/* FILTER */}
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value as any)}
                  className="rounded-xl border border-gray-200 bg-white/70 px-3 py-2 text-sm dark:border-white/10 dark:bg-white/5"
                >
                  <option value="all">ทั้งหมด</option>
                  <option value="active">ใช้งาน</option>
                  <option value="inactive">ไม่ใช้งาน</option>
                </select>

                {/* KPI (LIVE UPDATE) */}
                <div className="flex gap-2 text-xs">
                  <div className="rounded-xl bg-white/60 px-3 py-1 dark:bg-white/5">
                    ทั้งหมด <b>{filteredCars.length}</b>
                  </div>

                  <div className="rounded-xl bg-green-50 px-3 py-1 text-green-700 dark:bg-green-500/10">
                    ใช้งาน <b>{countActive}</b>
                  </div>

                  <div className="rounded-xl bg-red-50 px-3 py-1 text-red-600 dark:bg-red-500/10">
                    ไม่ใช้งาน <b>{countInactive}</b>
                  </div>
                </div>
              </div>

              {/* RIGHT */}
              <button
                onClick={() => router.push('/cars/create')}
                className="bg-linear-to-r inline-flex items-center gap-2 rounded-xl from-blue-500 via-blue-600 to-indigo-600 px-5 py-2 text-sm font-medium text-white shadow-md transition hover:scale-[1.02]"
              >
                <CirclePlus className="h-4 w-4" />
                เพิ่มรถ
              </button>
            </div>
          </div>
        </div>

        {/* TABLE */}
        <div className="relative w-full overflow-x-auto">
          {/* left fade */}
          <div className="bg-linear-to-r pointer-events-none absolute left-0 top-0 h-full w-6 from-white to-transparent dark:from-gray-900" />

          {/* right fade */}
          <div className="bg-linear-to-l pointer-events-none absolute right-0 top-0 h-full w-6 from-white to-transparent dark:from-gray-900" />

          <table className="min-w-280 w-full">
            <thead>
              <tr className="border-b bg-white/60 backdrop-blur dark:bg-white/5">
                <th className="px-6 py-4 text-xs">#</th>
                <th className="px-6 py-4 text-xs">รูป</th>
                <th className="px-6 py-4 text-xs">รหัส</th>
                <th className="px-6 py-4 text-xs">รถ</th>
                <th className="px-6 py-4 text-xs">ยี่ห้อ</th>
                <th className="px-6 py-4 text-xs">ทะเบียน</th>
                <th className="px-6 py-4 text-xs">สถานะ</th>
                <th className="px-6 py-4 text-xs">จัดการ</th>
              </tr>
            </thead>

            <tbody className="divide-y dark:divide-white/5">
              {data.map((car, i) => {
                const mainImage = getMainCarImage(car.carImage);
                return (
                  <tr
                    key={car.id}
                    className="group hover:bg-blue-50/40 dark:hover:bg-white/5"
                  >
                    <td className="px-6 py-4 text-sm">
                      {(currentPage - 1) * rowsPerPage + i + 1}
                    </td>

                    <td className="px-6 py-4">
                      <CarImageCell
                        key={`${car.id}-${mainImage ?? 'no-image'}`}
                        src={mainImage}
                        alt={car.carName || 'car'}
                      />
                    </td>

                    <td className="px-6 py-4 font-medium text-blue-600">
                      {car.carCode}
                    </td>

                    <td className="px-6 py-4">{car.carName}</td>

                    <td className="px-6 py-4">{car.carBrand}</td>

                    <td className="px-6 py-4">{car.licensePlate}</td>

                    <td className="px-6 py-4">
                      <span
                        className={`rounded-full px-3 py-1 text-xs ${
                          car.status === 'active'
                            ? 'bg-green-50 text-green-700 dark:bg-green-500/10'
                            : 'bg-red-50 text-red-600 dark:bg-red-500/10'
                        }`}
                      >
                        {car.status}
                      </span>
                    </td>

                    {/* ACTION */}
                    <td className="px-6 py-4">
                      {/* hover container */}
                      <div className="flex items-center gap-2 transition-all duration-200">
                        {/* EDIT */}
                        <button
                          onClick={() => router.push(`/cars/edit/${car.id}`)}
                          className="group/btn inline-flex items-center gap-1 rounded-lg border border-blue-100 bg-blue-50 px-3 py-1.5 text-xs font-medium text-blue-600 shadow-sm transition hover:border-blue-200 hover:bg-blue-100 hover:shadow-md dark:border-blue-500/20 dark:bg-blue-500/10 dark:text-blue-300"
                        >
                          <Pencil className="h-3.5 w-3.5 transition group-hover/btn:rotate-12" />
                          แก้ไข
                        </button>

                        {/* DELETE */}
                        <button
                          type="button"
                          onClick={() => handleOpenDeleteModal(car)}
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
                {selectedCar.carName && (
                  <p className="text-center text-sm font-semibold text-gray-800 dark:text-white/90">
                    {selectedCar.carName}
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
