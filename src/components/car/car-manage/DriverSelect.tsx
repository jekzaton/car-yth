'use client';

import api from '@/lib/axios';
import { formatPhone } from '@/utils/formatPhone';
import axios from 'axios';
import {
  Check,
  ChevronDown,
  Loader2,
  Search,
  UserRound,
  X,
} from 'lucide-react';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';

type Driver = {
  id: number;
  userCode: string;
  prefix: string;
  firstName: string;
  lastName: string;
  phone?: string | null;
};

type DriverSelectProps = {
  value?: string | null;

  bookingId: number;

  startDate: string;
  startTime: string;

  endDate: string;
  endTime: string;

  disabled?: boolean;

  onChange: (userCode: string) => void | Promise<void>;
};

export default function DriverSelect({
  value,

  bookingId,

  startDate,
  startTime,

  endDate,
  endTime,

  disabled = false,

  onChange,
}: DriverSelectProps) {
  const containerRef = useRef<HTMLDivElement>(null);

  const [drivers, setDrivers] = useState<Driver[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const [isOpen, setIsOpen] = useState(false);
  const [search, setSearch] = useState('');

  const fetchDrivers = useCallback(async () => {
    try {
      setIsLoading(true);

      const response = await api.get('/api/users/user-car', {
        params: {
          status: 'active',

          bookingId,

          startDate,
          startTime,

          endDate,
          endTime,

          _t: Date.now(),
        },

        headers: {
          'Cache-Control': 'no-cache',
          Pragma: 'no-cache',
        },
      });

      const data: Driver[] = Array.isArray(response.data?.data)
        ? response.data.data
        : [];

      setDrivers(data);
    } catch (error) {
      console.error('โหลดข้อมูลคนขับรถไม่สำเร็จ:', error);
      setDrivers([]);
    } finally {
      setIsLoading(false);
    }
  }, [bookingId, startDate, startTime, endDate, endTime]);

  useEffect(() => {
    fetchDrivers();
  }, [fetchDrivers]);

  // ปิด dropdown เมื่อ click ด้านนอก
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        containerRef.current &&
        !containerRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    }

    document.addEventListener('mousedown', handleClickOutside);

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const filteredDrivers = useMemo(() => {
    const keyword = search.trim().toLowerCase();

    if (!keyword) {
      return drivers;
    }

    return drivers.filter((driver) => {
      const fullName = [driver.prefix, driver.firstName, driver.lastName]
        .filter(Boolean)
        .join(' ')
        .toLowerCase();

      return (
        fullName.includes(keyword) ||
        driver.userCode?.toLowerCase().includes(keyword) ||
        driver.phone?.toLowerCase().includes(keyword)
      );
    });
  }, [drivers, search]);

  const selectedDriver = useMemo(() => {
    if (!value) return null;

    return (
      drivers.find(
        (driver) => String(driver.userCode).trim() === String(value).trim(),
      ) ?? null
    );
  }, [drivers, value]);

  const selectedDriverName = selectedDriver
    ? [selectedDriver.prefix, selectedDriver.firstName, selectedDriver.lastName]
        .filter(Boolean)
        .join(' ')
    : '';

  const handleSelect = async (driver: Driver) => {
    try {
      await onChange(driver.userCode);

      setSearch('');
      setIsOpen(false);
    } catch (error) {
      console.error('เลือกคนขับรถไม่สำเร็จ:', error);
    }
  };

  const handleClear = async () => {
    try {
      await onChange('');

      setSearch('');
      setIsOpen(false);

      await fetchDrivers();
    } catch (error) {
      console.error('ยกเลิกคนขับรถไม่สำเร็จ:', error);
    }
  };
  return (
    <div ref={containerRef} className="min-w-55 relative">
      {/* SELECT BUTTON */}

      <button
        type="button"
        disabled={disabled}
        onClick={async () => {
          if (disabled) return;

          if (isOpen) {
            setIsOpen(false);
            return;
          }

          setSearch('');
          setIsOpen(true);

          await fetchDrivers();
        }}
        className="flex min-h-11 w-full items-center justify-between gap-2 rounded-xl border border-gray-200 bg-white px-3 py-2 text-left transition hover:border-blue-300 disabled:cursor-not-allowed disabled:bg-gray-50 disabled:opacity-60 dark:border-white/10 dark:bg-white/5"
      >
        <div className="flex min-w-0 items-center gap-2">
          <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-blue-50 text-blue-600 dark:bg-blue-500/10 dark:text-blue-300">
            <UserRound className="h-4 w-4" />
          </div>

          <div className="min-w-0 flex-1">
            {selectedDriver ? (
              <>
                <p className="truncate text-xs font-semibold text-gray-800 dark:text-gray-200">
                  {selectedDriverName}
                </p>

                <div className="mt-0.5 space-y-0.5 text-[10px] text-gray-400">
                  <p>รหัสผู้ขับ : {selectedDriver.userCode}</p>

                  <p>โทร : {formatPhone(selectedDriver.phone)}</p>
                </div>
              </>
            ) : value ? (
              <>
                <p className="truncate text-xs font-semibold text-gray-700 dark:text-gray-300">
                  รหัสผู้ขับ {value}
                </p>

                <p className="mt-0.5 text-[10px] text-gray-400">
                  กำลังโหลดข้อมูลคนขับ...
                </p>
              </>
            ) : (
              <p className="text-xs text-gray-400">เลือกคนขับรถ</p>
            )}
          </div>
        </div>

        <ChevronDown
          className={`h-4 w-4 shrink-0 text-gray-400 transition-transform duration-200 ${
            isOpen ? 'rotate-180' : ''
          }`}
        />
      </button>

      {/* DROPDOWN */}

      {isOpen && !disabled && (
        <div className="absolute left-0 top-full z-50 mt-2 w-[320px] overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-xl dark:border-white/10 dark:bg-gray-900">
          {/* SEARCH */}

          <div className="border-b border-gray-100 p-3 dark:border-white/10">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />

              <input
                type="text"
                value={search}
                autoFocus
                onChange={(event) => setSearch(event.target.value)}
                placeholder="ค้นหาชื่อ / รหัส / เบอร์โทร..."
                className="h-10 w-full rounded-xl border border-gray-200 bg-gray-50 pl-9 pr-9 text-xs text-gray-700 outline-none transition placeholder:text-gray-400 focus:border-blue-400 focus:bg-white focus:ring-2 focus:ring-blue-500/10 dark:border-white/10 dark:bg-white/5 dark:text-gray-200"
              />

              {search && (
                <button
                  type="button"
                  onClick={() => setSearch('')}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  <X className="h-4 w-4" />
                </button>
              )}
            </div>
          </div>

          {/* RESULT */}

          <div className="max-h-72 overflow-y-auto p-2">
            {isLoading ? (
              <div className="flex items-center justify-center gap-2 py-8 text-xs text-gray-400">
                <Loader2 className="h-4 w-4 animate-spin" />
                กำลังโหลดคนขับรถ...
              </div>
            ) : filteredDrivers.length === 0 ? (
              <div className="py-8 text-center text-xs text-gray-400">
                ไม่พบข้อมูลคนขับรถ
              </div>
            ) : (
              filteredDrivers.map((driver) => {
                const fullName = [
                  driver.prefix,
                  driver.firstName,
                  driver.lastName,
                ]
                  .filter(Boolean)
                  .join(' ');

                const selected =
                  String(driver.userCode).trim() === String(value ?? '').trim();

                return (
                  <button
                    key={driver.id}
                    type="button"
                    onClick={() => handleSelect(driver)}
                    className={`flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left transition ${
                      selected
                        ? 'bg-blue-50 dark:bg-blue-500/10'
                        : 'hover:bg-gray-50 dark:hover:bg-white/5'
                    }`}
                  >
                    <div
                      className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-xl ${
                        selected
                          ? 'bg-blue-100 text-blue-600 dark:bg-blue-500/20'
                          : 'bg-gray-100 text-gray-500 dark:bg-white/10'
                      }`}
                    >
                      <UserRound className="h-4 w-4" />
                    </div>

                    <div className="min-w-0 flex-1">
                      <p className="truncate text-xs font-semibold text-gray-800 dark:text-gray-200">
                        {fullName || '-'}
                      </p>

                      <div className="mt-1 flex items-center gap-2 text-[10px] text-gray-400">
                        <span>รหัส {driver.userCode}</span>

                        {driver.phone && (
                          <>
                            <span>•</span>
                            <span>{driver.phone}</span>
                          </>
                        )}
                      </div>
                    </div>

                    {selected && (
                      <Check className="h-4 w-4 shrink-0 text-blue-600" />
                    )}
                  </button>
                );
              })
            )}
          </div>

          {/* CLEAR */}

          {value && (
            <div className="border-t border-gray-100 p-2 dark:border-white/10">
              <button
                type="button"
                onClick={handleClear}
                className="w-full rounded-xl px-3 py-2 text-xs font-medium text-red-500 transition hover:bg-red-50 dark:hover:bg-red-500/10"
              >
                ยกเลิกการเลือกคนขับ
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
