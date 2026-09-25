'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import axios from 'axios';

import UsageHeader from './UsageHeader';
import UsageTable from './UsageTable';
import { CarUsageItem } from '@/types/carUsageType';
import { toast } from 'react-toastify';
import { Modal } from '@/components/ui/modal';
import {
  Building2,
  CarFront,
  Loader2,
  MapPin,
  UserRound,
  UsersRound,
} from 'lucide-react';
import { normalizeBookingDate, toDateTimeLocal } from '@/utils/formatters';

type ListUsageProps = {
  onCreateUsage?: (item: CarUsageItem) => void;
  onEdit?: (item: CarUsageItem) => void;
  onDelete?: (item: CarUsageItem) => void;
};

export default function ListUsage({}: ListUsageProps) {
  const [search, setSearch] = useState('');
  const [filterStartDate, setFilterStartDate] = useState('');
  const [filterEndDate, setFilterEndDate] = useState('');

  const [currentPage, setCurrentPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(10);

  const [data, setData] = useState<CarUsageItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const [dateGo, setDateGo] = useState('');
  const [dateBack, setDateBack] = useState('');

  const [kmGo, setKmGo] = useState('');
  const [kmBack, setKmBack] = useState('');

  const [saving, setSaving] = useState(false);

  const [selectedUsage, setSelectedUsage] = useState<CarUsageItem | null>(null);

  const [usageModalOpen, setUsageModalOpen] = useState(false);
  const [usageMode, setUsageMode] = useState<'create' | 'edit'>('create');

  const fetchUsage = useCallback(async () => {
    try {
      setIsLoading(true);

      const response = await axios.get('/api/car-usage', {
        params: {
          _t: Date.now(),
        },
        headers: {
          'Cache-Control': 'no-cache',
          Pragma: 'no-cache',
        },
      });

      const items: CarUsageItem[] = Array.isArray(response.data?.data)
        ? response.data.data
        : [];

      setData(items);
    } catch (error) {
      console.error('โหลดข้อมูลการใช้งานรถไม่สำเร็จ:', error);

      setData([]);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchUsage();
  }, [fetchUsage]);

  useEffect(() => {
    const handleFocus = () => {
      fetchUsage();
    };

    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible') {
        fetchUsage();
      }
    };

    window.addEventListener('focus', handleFocus);

    document.addEventListener('visibilitychange', handleVisibilityChange);

    return () => {
      window.removeEventListener('focus', handleFocus);

      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, [fetchUsage]);

  const filtered = useMemo(() => {
    const keyword = search.trim().toLowerCase();

    return data.filter((item) => {
      const searchableValues = [
        item.bookingId,
        item.carCode,

        item.userName,
        item.userCode,

        item.driverName,
        item.driverCode,

        item.carBrand,
        item.carName,
        item.licensePlate,

        item.departmentName,

        item.subject,
        item.destination,
      ];

      const matchSearch =
        !keyword ||
        searchableValues.some((value) =>
          String(value ?? '')
            .toLowerCase()
            .includes(keyword),
        );

      const bookingStartDate = normalizeBookingDate(item.startDate);
      const bookingEndDate = normalizeBookingDate(item.endDate);

      let matchDate = true;

      if (filterStartDate && filterEndDate) {
        // รายการจองมีช่วงเวลาทับกับช่วงวันที่ที่ค้นหา
        matchDate =
          bookingStartDate <= filterEndDate &&
          bookingEndDate >= filterStartDate;
      } else if (filterStartDate) {
        // รายการต้องสิ้นสุดตั้งแต่วันที่เลือกขึ้นไป
        matchDate = bookingEndDate >= filterStartDate;
      } else if (filterEndDate) {
        // รายการต้องเริ่มไม่เกินวันที่เลือก
        matchDate = bookingStartDate <= filterEndDate;
      }

      return matchSearch && matchDate;
    });
  }, [data, search, filterStartDate, filterEndDate]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / rowsPerPage));

  const paginatedData = useMemo(() => {
    const start = (currentPage - 1) * rowsPerPage;

    return filtered.slice(start, start + rowsPerPage);
  }, [filtered, currentPage, rowsPerPage]);

  // ถ้าลบข้อมูลจนจำนวนหน้าลดลง
  useEffect(() => {
    if (currentPage > totalPages) {
      setCurrentPage(totalPages);
    }
  }, [currentPage, totalPages]);

  const handleCreateUsage = (item: CarUsageItem) => {
    setUsageMode('create');
    setSelectedUsage(item);

    setDateGo(`${item.startDate}T${String(item.startTime).slice(0, 5)}`);
    setDateBack(`${item.endDate}T${String(item.endTime).slice(0, 5)}`);

    setKmGo('');
    setKmBack('');

    setUsageModalOpen(true);
  };

  const handleEditUsage = (item: CarUsageItem) => {
    if (!item.usageId) {
      toast.error('ไม่พบข้อมูลการใช้งานรถ');
      return;
    }

    setUsageMode('edit');
    setSelectedUsage(item);

    setDateGo(toDateTimeLocal(item.dateGo));
    setDateBack(toDateTimeLocal(item.dateBack));

    setKmGo(item.kmGo != null ? String(item.kmGo) : '');
    setKmBack(item.kmBack != null ? String(item.kmBack) : '');

    setUsageModalOpen(true);
  };

  const handleSaveUsage = async () => {
    if (!selectedUsage) return;

    const startKm = Number(kmGo);
    const endKm = Number(kmBack);

    if (!dateGo) {
      toast.error('กรุณาระบุวันเวลาเดินทาง');
      return;
    }

    if (!dateBack) {
      toast.error('กรุณาระบุวันเวลากลับ');
      return;
    }

    if (!Number.isFinite(startKm) || startKm < 0) {
      toast.error('กรุณาระบุเลขไมล์เริ่ม');
      return;
    }

    if (!Number.isFinite(endKm) || endKm < 0) {
      toast.error('กรุณาระบุเลขไมล์กลับ');
      return;
    }

    if (endKm < startKm) {
      toast.error('เลขไมล์กลับต้องไม่น้อยกว่าเลขไมล์เริ่ม');
      return;
    }

    try {
      setSaving(true);

      if (usageMode === 'create') {
        await axios.post('/api/car-usage', {
          bookingId: selectedUsage.bookingId,

          dateGo,
          dateBack,

          kmGo: startKm,
          kmBack: endKm,
        });
      } else {
        if (!selectedUsage.usageId) {
          toast.error('ไม่พบรหัสข้อมูลการใช้งานรถ');
          return;
        }

        await axios.put(`/api/car-usage/${selectedUsage.usageId}`, {
          dateGo,
          dateBack,

          kmGo: startKm,
          kmBack: endKm,
        });
      }

      toast.success(
        usageMode === 'create'
          ? 'บันทึกข้อมูลการใช้งานรถเรียบร้อยแล้ว'
          : 'แก้ไขข้อมูลการใช้งานรถเรียบร้อยแล้ว',
      );

      setUsageModalOpen(false);
      setSelectedUsage(null);

      // โหลดใหม่
      await fetchUsage();
    } catch (error) {
      console.error('บันทึก car usage ไม่สำเร็จ:', error);

      if (axios.isAxiosError(error)) {
        toast.error(
          error.response?.data?.message ||
            'ไม่สามารถบันทึกข้อมูลการใช้งานรถได้',
        );
      } else {
        toast.error('ไม่สามารถบันทึกข้อมูลการใช้งานรถได้');
      }
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-5">
      {/* ================= HEADER ================= */}

      <UsageHeader
        search={search}
        total={filtered.length}
        startDate={filterStartDate}
        endDate={filterEndDate}
        onSearchChange={(value) => {
          setSearch(value);
          setCurrentPage(1);
        }}
        onStartDateChange={(value) => {
          setFilterStartDate(value);
          setCurrentPage(1);
        }}
        onEndDateChange={(value) => {
          setFilterEndDate(value);
          setCurrentPage(1);
        }}
        onClearDate={() => {
          // ล้างคำค้นหา
          setSearch('');

          // ล้างช่วงวันที่
          setFilterStartDate('');
          setFilterEndDate('');

          // กลับหน้าแรก
          setCurrentPage(1);
        }}
      />

      {/* ================= TABLE ================= */}

      <UsageTable
        data={paginatedData}
        isLoading={isLoading}
        currentPage={currentPage}
        rowsPerPage={rowsPerPage}
        totalPages={totalPages}
        totalItems={filtered.length}
        onPageChange={setCurrentPage}
        onRowsPerPageChange={(value) => {
          setRowsPerPage(value);
          setCurrentPage(1);
        }}
        onCreateUsage={handleCreateUsage}
        onEdit={handleEditUsage}
        onDelete={(item) => {
          console.log('delete:', item);
        }}
      />

      <Modal
        isOpen={usageModalOpen}
        onClose={() => {
          if (saving) return;

          setUsageModalOpen(false);
          setSelectedUsage(null);
        }}
        className="max-w-xl p-6"
      >
        <div>
          <h3 className="text-lg font-bold text-gray-900 dark:text-white">
            {usageMode === 'create'
              ? 'ลงรายละเอียดการใช้งานรถ'
              : 'แก้ไขรายละเอียดการใช้งานรถ'}
          </h3>

          {selectedUsage && (
            <div className="mt-4 overflow-hidden rounded-2xl border border-gray-100 bg-white shadow-sm dark:border-white/10 dark:bg-white/5">
              {/* ================= CAR HEADER ================= */}
              <div className="bg-linear-to-r relative overflow-hidden border-b border-gray-100 from-blue-50 via-white to-indigo-50 px-4 py-4 dark:border-white/10 dark:from-blue-500/10 dark:via-white/5 dark:to-indigo-500/10">
                {/* Decoration */}
                <div className="pointer-events-none absolute -right-8 -top-8 h-28 w-28 rounded-full bg-blue-500/10 blur-2xl" />

                <div className="relative flex items-center gap-3">
                  {/* CAR ICON */}
                  <div className="bg-linear-to-br flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl from-blue-500 to-indigo-600 text-white shadow-md shadow-blue-500/20">
                    <CarFront className="h-6 w-6" />
                  </div>

                  {/* CAR INFO */}
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <h4 className="truncate text-base font-bold text-gray-900 dark:text-white">
                        {selectedUsage.carName || '-'}
                      </h4>

                      {selectedUsage.carCode && (
                        <span className="rounded-md bg-blue-100 px-2 py-0.5 text-[10px] font-bold text-blue-600 dark:bg-blue-500/15 dark:text-blue-300">
                          {selectedUsage.carCode}
                        </span>
                      )}
                    </div>

                    <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                      {selectedUsage.carBrand || 'ไม่ระบุยี่ห้อ'}
                    </p>
                  </div>

                  {/* LICENSE */}
                  <div className="shrink-0 rounded-xl border border-gray-200 bg-white px-3 py-2 text-center shadow-sm dark:border-white/10 dark:bg-white/5">
                    <p className="text-[9px] font-medium text-gray-400">
                      ทะเบียนรถ
                    </p>

                    <p className="mt-0.5 whitespace-nowrap text-sm font-bold text-gray-800 dark:text-white">
                      {selectedUsage.licensePlate || '-'}
                    </p>
                  </div>
                </div>
              </div>

              {/* ================= BOOKING INFO ================= */}
              <div className="grid sm:grid-cols-2">
                {/* BOOKER */}
                <div className="border-b border-gray-100 p-4 sm:border-r dark:border-white/10">
                  <div className="flex items-start gap-3">
                    <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-indigo-50 text-indigo-600 dark:bg-indigo-500/10 dark:text-indigo-300">
                      <UserRound className="h-4 w-4" />
                    </div>

                    <div className="min-w-0">
                      <p className="text-[10px] font-semibold text-gray-400">
                        ผู้จองรถ
                      </p>

                      <p className="mt-1 truncate text-sm font-semibold text-gray-800 dark:text-gray-200">
                        {selectedUsage.userName || '-'}
                      </p>

                      {selectedUsage.userCode && (
                        <p className="mt-0.5 text-[10px] text-gray-400">
                          รหัส {selectedUsage.userCode}
                        </p>
                      )}
                    </div>
                  </div>
                </div>

                {/* DRIVER */}
                <div className="border-b border-gray-100 p-4 dark:border-white/10">
                  <div className="flex items-start gap-3">
                    <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600 dark:bg-emerald-500/10 dark:text-emerald-300">
                      <UsersRound className="h-4 w-4" />
                    </div>

                    <div className="min-w-0">
                      <p className="text-[10px] font-semibold text-gray-400">
                        พนักงานขับรถ
                      </p>

                      <p className="mt-1 truncate text-sm font-semibold text-gray-800 dark:text-gray-200">
                        {selectedUsage.driverName || '-'}
                      </p>

                      {selectedUsage.driverCode && (
                        <p className="mt-0.5 text-[10px] text-gray-400">
                          รหัส {selectedUsage.driverCode}
                        </p>
                      )}
                    </div>
                  </div>
                </div>

                {/* DEPARTMENT */}
                <div className="border-b border-gray-100 p-4 sm:border-b-0 sm:border-r dark:border-white/10">
                  <div className="flex items-start gap-3">
                    <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-sky-50 text-sky-600 dark:bg-sky-500/10 dark:text-sky-300">
                      <Building2 className="h-4 w-4" />
                    </div>

                    <div className="min-w-0">
                      <p className="text-[10px] font-semibold text-gray-400">
                        หน่วยงานที่จอง
                      </p>

                      <p className="mt-1 text-sm font-semibold text-gray-800 dark:text-gray-200">
                        {selectedUsage.departmentName || '-'}
                      </p>
                    </div>
                  </div>
                </div>

                {/* DESTINATION */}
                <div className="p-4">
                  <div className="flex items-start gap-3">
                    <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-rose-50 text-rose-500 dark:bg-rose-500/10 dark:text-rose-300">
                      <MapPin className="h-4 w-4" />
                    </div>

                    <div className="min-w-0">
                      <p className="text-[10px] font-semibold text-gray-400">
                        สถานที่ / จุดหมาย
                      </p>

                      <p className="mt-1 line-clamp-2 text-sm font-semibold text-gray-800 dark:text-gray-200">
                        {selectedUsage.destination || '-'}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          <div className="mt-5 grid gap-4 sm:grid-cols-2">
            <div>
              <label className="text-xs font-semibold text-gray-600">
                วันเวลาเดินทาง
              </label>

              <input
                type="datetime-local"
                value={dateGo}
                onChange={(e) => setDateGo(e.target.value)}
                className="mt-1.5 h-11 w-full rounded-xl border border-gray-200 px-3 text-sm outline-none focus:border-blue-500 dark:border-white/10 dark:bg-white/5"
              />
            </div>

            <div>
              <label className="text-xs font-semibold text-gray-600">
                วันเวลากลับ
              </label>

              <input
                type="datetime-local"
                value={dateBack}
                onChange={(e) => setDateBack(e.target.value)}
                className="mt-1.5 h-11 w-full rounded-xl border border-gray-200 px-3 text-sm outline-none focus:border-blue-500 dark:border-white/10 dark:bg-white/5"
              />
            </div>

            <div>
              <label className="text-xs font-semibold text-gray-600">
                เลขไมล์เริ่ม
              </label>

              <input
                type="number"
                min="0"
                step="0.1"
                value={kmGo}
                onChange={(e) => setKmGo(e.target.value)}
                placeholder="0"
                className="mt-1.5 h-11 w-full rounded-xl border border-gray-200 px-3 text-sm outline-none focus:border-blue-500 dark:border-white/10 dark:bg-white/5"
              />
            </div>

            <div>
              <label className="text-xs font-semibold text-gray-600">
                เลขไมล์กลับ
              </label>

              <input
                type="number"
                min="0"
                step="0.1"
                value={kmBack}
                onChange={(e) => setKmBack(e.target.value)}
                placeholder="0"
                className="mt-1.5 h-11 w-full rounded-xl border border-gray-200 px-3 text-sm outline-none focus:border-blue-500 dark:border-white/10 dark:bg-white/5"
              />
            </div>
          </div>

          {/* ระยะทาง */}
          <div className="mt-4 flex items-center justify-between rounded-xl bg-gray-50 px-4 py-3 dark:bg-white/5">
            <span className="text-sm text-gray-500">ระยะทางรวม</span>

            <span className="text-lg font-bold text-blue-600">
              {Math.max(
                0,
                Number(kmBack || 0) - Number(kmGo || 0),
              ).toLocaleString('th-TH')}{' '}
              กม.
            </span>
          </div>

          <div className="mt-6 flex justify-end gap-2">
            <button
              type="button"
              disabled={saving}
              onClick={() => {
                setUsageModalOpen(false);
                setSelectedUsage(null);
              }}
              className="h-10 rounded-xl border border-gray-200 px-4 text-sm font-medium text-gray-600"
            >
              ยกเลิก
            </button>

            <button
              type="button"
              disabled={saving}
              onClick={handleSaveUsage}
              className="inline-flex h-10 items-center gap-2 rounded-xl bg-blue-600 px-5 text-sm font-semibold text-white transition hover:bg-blue-700 disabled:opacity-60"
            >
              {saving && <Loader2 className="h-4 w-4 animate-spin" />}

              {saving
                ? 'กำลังบันทึก...'
                : usageMode === 'create'
                  ? 'บันทึกข้อมูล'
                  : 'บันทึกการแก้ไข'}
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
