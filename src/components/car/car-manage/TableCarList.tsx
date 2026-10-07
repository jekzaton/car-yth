'use client';

import axios from 'axios';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft, ArrowRight } from 'lucide-react';
import { toast } from 'react-toastify';

import CarListHeader from './CarListHeader';
import CarBookingTable from './CarBookingTable';

import type { CarBookingItem } from '@/types/bookingCarType';
import { normalizeDate } from '@/utils/formatters';
import api from '@/lib/axios';

export type BookingStatus = 'pending' | 'approved' | 'cancelled';

export default function TableCarList() {
  const router = useRouter();

  const [bookings, setBookings] = useState<CarBookingItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const [search, setSearch] = useState('');

  const [statusFilter, setStatusFilter] = useState<'all' | BookingStatus>(
    'all',
  );

  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');

  const [currentPage, setCurrentPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(5);

  const fetchBookings = useCallback(async () => {
    try {
      setIsLoading(true);

      const response = await api.get('/api/car-bookings/list', {
        params: {
          _t: Date.now(),
        },
        headers: {
          'Cache-Control': 'no-cache',
          Pragma: 'no-cache',
        },
      });

      const items: CarBookingItem[] = Array.isArray(response.data?.data)
        ? response.data.data
        : [];

      setBookings(items);
    } catch (error) {
      console.error('โหลดรายการจองรถไม่สำเร็จ:', error);

      setBookings([]);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchBookings();

    const handleFocus = () => {
      fetchBookings();
    };

    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible') {
        fetchBookings();
      }
    };

    window.addEventListener('focus', handleFocus);

    document.addEventListener('visibilitychange', handleVisibilityChange);

    return () => {
      window.removeEventListener('focus', handleFocus);

      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, [fetchBookings]);

  const handleDriverChange = useCallback(
    async (bookingId: number, userCode: string) => {
      const currentBooking = bookings.find(
        (item) => item.bookingId === bookingId,
      );

      if (!currentBooking) return;

      const oldDriver = currentBooking.cUCode ?? '';

      // ถ้าเลือกคนเดิม ไม่ต้องยิง API
      if (oldDriver === userCode) {
        return;
      }

      // optimistic update
      setBookings((prev) =>
        prev.map((item) =>
          item.bookingId === bookingId
            ? {
                ...item,
                cUCode: userCode,
              }
            : item,
        ),
      );

      try {
        const response = await api.patch(
          `/api/car-bookings/${bookingId}/driver`,
          {
            cUCode: userCode,
          },
        );

        toast.success(
          response.data?.message ||
            (userCode
              ? 'บันทึกคนขับรถเรียบร้อยแล้ว'
              : 'ยกเลิกคนขับรถเรียบร้อยแล้ว'),
        );
      } catch (error) {
        console.error('บันทึกคนขับรถไม่สำเร็จ:', error);

        // rollback
        setBookings((prev) =>
          prev.map((item) =>
            item.bookingId === bookingId
              ? {
                  ...item,
                  cUCode: oldDriver,
                }
              : item,
          ),
        );

        if (axios.isAxiosError(error)) {
          if (error.response?.status === 409) {
            toast.warning(
              error.response.data?.message ||
                'คนขับรถมีรายการเดินทางในช่วงเวลานี้แล้ว',
            );
            return;
          }

          toast.error(
            error.response?.data?.message || 'ไม่สามารถบันทึกคนขับรถได้',
          );

          return;
        }

        toast.error('ไม่สามารถบันทึกคนขับรถได้');
      }
    },
    [bookings],
  );

  const handleStatusChange = useCallback(
    async (bookingId: number, status: BookingStatus) => {
      const currentBooking = bookings.find(
        (item) => item.bookingId === bookingId,
      );

      if (!currentBooking) return;

      const oldStatus = currentBooking.status;

      if (oldStatus === status) {
        return;
      }

      // เปลี่ยนหน้าจอทันที
      setBookings((prev) =>
        prev.map((item) =>
          item.bookingId === bookingId
            ? {
                ...item,
                status,
              }
            : item,
        ),
      );

      try {
        await api.patch(`/api/car-bookings/${bookingId}/status`, {
          status,
        });

        toast.success('เปลี่ยนสถานะเรียบร้อยแล้ว');
      } catch (error) {
        console.error('เปลี่ยนสถานะไม่สำเร็จ:', error);

        // rollback เมื่อ API error
        setBookings((prev) =>
          prev.map((item) =>
            item.bookingId === bookingId
              ? {
                  ...item,
                  status: oldStatus,
                }
              : item,
          ),
        );

        toast.error('ไม่สามารถเปลี่ยนสถานะได้');
      }
    },
    [bookings],
  );

  const dateFilteredBookings = useMemo(() => {
    return bookings.filter((item) => {
      const bookingDate = normalizeDate(item.startDate);

      if (!bookingDate) {
        return false;
      }

      // ไม่ได้เลือกวันที่
      if (!dateFrom && !dateTo) {
        return true;
      }

      // เลือกวันที่เริ่ม + วันที่สิ้นสุด
      if (dateFrom && dateTo) {
        return bookingDate >= dateFrom && bookingDate <= dateTo;
      }

      // เลือกเฉพาะวันที่เริ่ม
      if (dateFrom) {
        return bookingDate >= dateFrom;
      }

      // เลือกเฉพาะวันที่สิ้นสุด
      if (dateTo) {
        return bookingDate <= dateTo;
      }

      return true;
    });
  }, [bookings, dateFrom, dateTo]);

  const filteredBookings = useMemo(() => {
    const keyword = search.trim().toLowerCase();

    return dateFilteredBookings.filter((item) => {
      const searchableValues = [
        item.bookingName,
        item.userCode,
        item.carCode,
        item.carBrandSub,
        item.carBrand,
        item.licensePlate,
        item.typeName,
        item.subject,
        item.destination,
        item.telDep,
        item.phone,
        item.cUCode,
      ];

      const matchesSearch =
        !keyword ||
        searchableValues.some((value) =>
          String(value ?? '')
            .toLowerCase()
            .includes(keyword),
        );

      const matchesStatus =
        statusFilter === 'all' || item.status === statusFilter;

      return matchesSearch && matchesStatus;
    });
  }, [dateFilteredBookings, search, statusFilter]);

  const totalPages = Math.max(
    1,
    Math.ceil(filteredBookings.length / rowsPerPage),
  );

  const totalByDate = dateFilteredBookings.length;

  const pendingCount = useMemo(
    () =>
      dateFilteredBookings.filter((item) => item.status === 'pending').length,
    [dateFilteredBookings],
  );

  const approvedCount = useMemo(
    () =>
      dateFilteredBookings.filter((item) => item.status === 'approved').length,
    [dateFilteredBookings],
  );

  const cancelledCount = useMemo(
    () =>
      dateFilteredBookings.filter((item) => item.status === 'cancelled').length,
    [dateFilteredBookings],
  );

  const data = useMemo(() => {
    const start = (currentPage - 1) * rowsPerPage;
    const end = start + rowsPerPage;

    return filteredBookings.slice(start, end);
  }, [filteredBookings, currentPage, rowsPerPage]);

  useEffect(() => {
    if (currentPage > totalPages) {
      setCurrentPage(totalPages);
    }
  }, [currentPage, totalPages]);
  return (
    <div className="space-y-5">
      <CarListHeader
        search={search}
        onSearchChange={(value) => {
          setSearch(value);
          setCurrentPage(1);
        }}
        statusFilter={statusFilter}
        onStatusFilterChange={(value) => {
          setStatusFilter(value);
          setCurrentPage(1);
        }}
        dateFrom={dateFrom}
        dateTo={dateTo}
        onDateFromChange={(value) => {
          setDateFrom(value);
          setCurrentPage(1);
        }}
        onDateToChange={(value) => {
          setDateTo(value);
          setCurrentPage(1);
        }}
        onClearDate={() => {
          setDateFrom('');
          setDateTo('');
          setCurrentPage(1);
        }}
        total={totalByDate}
        resultCount={filteredBookings.length}
        pendingCount={pendingCount}
        approvedCount={approvedCount}
        cancelledCount={cancelledCount}
        onCreate={() => router.push('/bookingCar')}
      />

      {/* ================= TABLE ================= */}

      <CarBookingTable
        data={data}
        isLoading={isLoading}
        currentPage={currentPage}
        rowsPerPage={rowsPerPage}
        onDriverChange={handleDriverChange}
        onStatusChange={handleStatusChange}
      />

      {/* ================= PAGINATION ================= */}

      {!isLoading && filteredBookings.length > 0 && (
        <div className="flex flex-col gap-4 rounded-xl border border-white/10 bg-white/60 px-4 py-3 shadow-sm backdrop-blur sm:flex-row sm:items-center sm:justify-between dark:bg-white/5">
          {/* ROWS */}

          <div className="flex items-center gap-3">
            <span className="text-xs text-gray-500">แสดง</span>

            <div className="relative">
              <select
                value={rowsPerPage}
                onChange={(e) => {
                  setRowsPerPage(Number(e.target.value));

                  setCurrentPage(1);
                }}
                className="appearance-none rounded-lg border border-gray-200 bg-white px-3 py-2 pr-8 text-sm font-medium text-gray-700 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-500/10 dark:border-white/10 dark:bg-white/5 dark:text-white"
              >
                {[5, 10, 20, 50].map((number) => (
                  <option key={number} value={number}>
                    {number}
                  </option>
                ))}
              </select>

              <span className="pointer-events-none absolute right-2.5 top-1/2 -translate-y-1/2 text-xs text-gray-400">
                ▼
              </span>
            </div>

            <span className="text-xs text-gray-500">รายการ</span>
          </div>

          {/* PAGE */}

          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => setCurrentPage((page) => Math.max(1, page - 1))}
              disabled={currentPage === 1}
              className="inline-flex items-center gap-1 rounded-lg border border-gray-200 bg-white/70 px-3 py-1.5 text-sm text-gray-700 shadow-sm transition hover:border-blue-300 hover:text-blue-600 disabled:cursor-not-allowed disabled:opacity-40 dark:border-white/10 dark:bg-white/5 dark:text-white"
            >
              <ArrowLeft size={16} />
              ก่อนหน้า
            </button>

            <div className="rounded-lg bg-white/60 px-3 py-1.5 text-sm font-medium text-gray-700 shadow-sm dark:bg-white/5 dark:text-white">
              <span className="text-blue-600">{currentPage}</span>

              <span className="mx-1 text-gray-400">/</span>

              {totalPages}
            </div>

            <button
              type="button"
              onClick={() =>
                setCurrentPage((page) => Math.min(totalPages, page + 1))
              }
              disabled={currentPage >= totalPages}
              className="bg-linear-to-r inline-flex items-center gap-1 rounded-lg from-blue-500 via-blue-600 to-indigo-600 px-3 py-1.5 text-sm font-medium text-white shadow-md transition hover:-translate-y-0.5 hover:shadow-lg disabled:cursor-not-allowed disabled:opacity-40"
            >
              ถัดไป
              <ArrowRight size={16} />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
