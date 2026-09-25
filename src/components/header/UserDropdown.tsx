'use client';

import axios from 'axios';
import {
  ChevronDown,
  CircleUserRound,
  Loader2,
  LogOut,
  Settings,
  ShieldCheck,
  UserRound,
} from 'lucide-react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import React, { useEffect, useMemo, useState } from 'react';
import { toast } from 'react-toastify';

import { Dropdown } from '../ui/dropdown/Dropdown';
import { DropdownItem } from '../ui/dropdown/DropdownItem';
import api from '@/lib/axios';

interface UserProps {
  id: number;
  prefix: string;
  firstName: string;
  lastName: string;
  statusLevel: 'user' | 'member' | 'admin' | string;
}

export default function UserDropdown() {
  const router = useRouter();

  const [isOpen, setIsOpen] = useState(false);
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const [isLoadingUser, setIsLoadingUser] = useState(true);
  const [user, setUser] = useState<UserProps | null>(null);

  // ============================================================
  // USER
  // ============================================================

  const fullName = useMemo(() => {
    if (!user) return '';

    return `${user.prefix ?? ''}${user.firstName ?? ''} ${
      user.lastName ?? ''
    }`.trim();
  }, [user]);

  const shortName = useMemo(() => {
    if (!user) return 'กำลังโหลด...';

    return `${user.firstName ?? ''} ${user.lastName ?? ''}`.trim();
  }, [user]);

  const roleLabel = useMemo(() => {
    switch (user?.statusLevel) {
      case 'admin':
        return 'ผู้ดูแลระบบ';

      case 'member':
        return 'สมาชิก';

      case 'user':
        return 'ผู้ใช้งาน';

      default:
        return user?.statusLevel || '-';
    }
  }, [user?.statusLevel]);

  // ============================================================
  // PROFILE
  // ============================================================

  useEffect(() => {
    let mounted = true;

    const fetchProfile = async () => {
      try {
        setIsLoadingUser(true);

        const response = await api.get<{
          user: UserProps;
        }>('/api/auth/profile');

        if (!mounted) return;

        setUser(response.data.user);
      } catch (error) {
        if (!mounted) return;

        setUser(null);

        if (axios.isAxiosError(error) && error.response?.status === 401) {
          router.replace('/signin');
        }
      } finally {
        if (mounted) {
          setIsLoadingUser(false);
        }
      }
    };

    void fetchProfile();

    return () => {
      mounted = false;
    };
  }, [router]);

  // ============================================================
  // DROPDOWN
  // ============================================================

  const toggleDropdown = (event: React.MouseEvent<HTMLButtonElement>) => {
    event.stopPropagation();

    setIsOpen((prev) => !prev);
  };

  const closeDropdown = () => {
    setIsOpen(false);
  };

  // ============================================================
  // LOGOUT
  // ============================================================

  const handleLogout = async () => {
    if (isLoggingOut) return;

    try {
      setIsLoggingOut(true);

      await api.post('/api/auth/logout');

      closeDropdown();

      toast.success('ออกจากระบบเรียบร้อยแล้ว');

      router.replace('/signin');
      router.refresh();
    } catch (error) {
      if (axios.isAxiosError(error)) {
        toast.error(error.response?.data?.message || 'ไม่สามารถออกจากระบบได้');
      } else {
        toast.error('เกิดข้อผิดพลาดในการออกจากระบบ');
      }
    } finally {
      setIsLoggingOut(false);
    }
  };

  return (
    <div className="relative">
      {/* USER BUTTON */}

      <button
        type="button"
        onClick={toggleDropdown}
        className="dropdown-toggle group flex items-center gap-3 rounded-xl px-2 py-1.5 transition-colors hover:bg-gray-100 dark:hover:bg-white/5"
      >
        {/* AVATAR */}

        <div className="relative shrink-0">
          <div className="h-10 w-10 overflow-hidden rounded-full border-2 border-white bg-gray-100 shadow-sm ring-1 ring-gray-200 dark:border-gray-900 dark:bg-gray-800 dark:ring-gray-700">
            <Image
              width={40}
              height={40}
              src="/images/user/owner.jpg"
              alt={fullName || 'ผู้ใช้งาน'}
              className="h-full w-full object-cover"
            />
          </div>

          {/* ONLINE */}

          <span className="absolute bottom-0 right-0 h-3 w-3 rounded-full border-2 border-white bg-emerald-500 dark:border-gray-900" />
        </div>

        {/* NAME */}

        <div className="hidden min-w-0 text-left sm:block">
          {isLoadingUser ? (
            <>
              <div className="h-4 w-24 animate-pulse rounded bg-gray-200 dark:bg-gray-700" />

              <div className="mt-1.5 h-3 w-14 animate-pulse rounded bg-gray-100 dark:bg-gray-800" />
            </>
          ) : (
            <>
              <p className="max-w-37.5 truncate text-sm font-semibold text-gray-800 dark:text-gray-200">
                {shortName || 'ผู้ใช้งาน'}
              </p>

              <p className="mt-0.5 text-[11px] font-medium text-gray-500 dark:text-gray-400">
                {roleLabel}
              </p>
            </>
          )}
        </div>

        <ChevronDown
          className={`hidden h-4 w-4 shrink-0 text-gray-500 transition-transform duration-200 sm:block dark:text-gray-400 ${
            isOpen ? 'rotate-180' : ''
          }`}
        />
      </button>

      {/* DROPDOWN */}

      <Dropdown
        isOpen={isOpen}
        onClose={closeDropdown}
        className="shadow-theme-lg dark:bg-gray-dark w-75 absolute right-0 mt-3 flex flex-col overflow-hidden rounded-2xl border border-gray-200 bg-white p-0 dark:border-gray-800"
      >
        {/* PROFILE HEADER */}

        <div className="relative overflow-hidden border-b border-gray-100 px-4 py-4 dark:border-gray-800">
          {/* decoration */}

          <div className="bg-brand-500/10 absolute -right-10 -top-12 h-28 w-28 rounded-full blur-2xl" />

          <div className="relative flex items-center gap-3">
            <div className="relative shrink-0">
              <div className="h-12 w-12 overflow-hidden rounded-xl border border-gray-200 bg-gray-100 shadow-sm dark:border-gray-700 dark:bg-gray-800">
                <Image
                  width={48}
                  height={48}
                  src="/images/user/owner.jpg"
                  alt={fullName || 'ผู้ใช้งาน'}
                  className="h-full w-full object-cover"
                />
              </div>

              <span className="dark:border-gray-dark absolute -bottom-1 -right-1 h-3.5 w-3.5 rounded-full border-2 border-white bg-emerald-500" />
            </div>

            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-bold text-gray-800 dark:text-white/90">
                {isLoadingUser ? 'กำลังโหลด...' : fullName || 'ผู้ใช้งาน'}
              </p>

              <div className="mt-1.5 flex items-center gap-1.5">
                <ShieldCheck className="text-brand-500 h-3.5 w-3.5" />

                <span className="text-xs font-medium text-gray-500 dark:text-gray-400">
                  {roleLabel}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* MENU */}

        <div className="p-2">
          <ul className="space-y-1">
            <li>
              <DropdownItem
                onItemClick={closeDropdown}
                tag="a"
                href="/profile"
                className="group flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-100 hover:text-gray-900 dark:text-gray-400 dark:hover:bg-white/5 dark:hover:text-gray-200"
              >
                <MenuIcon>
                  <UserRound className="h-4.5 w-4.5" />
                </MenuIcon>

                <div>
                  <p>ข้อมูลส่วนตัว</p>

                  <p className="mt-0.5 text-[10px] font-normal text-gray-400">
                    ดูและแก้ไขข้อมูลส่วนตัว
                  </p>
                </div>
              </DropdownItem>
            </li>

            {/* <li>
              <DropdownItem
                onItemClick={closeDropdown}
                tag="a"
                href="/profile"
                className="group flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-100 hover:text-gray-900 dark:text-gray-400 dark:hover:bg-white/5 dark:hover:text-gray-200"
              >
                <MenuIcon>
                  <Settings className="h-4.5 w-4.5" />
                </MenuIcon>

                <div>
                  <p>ตั้งค่าบัญชี</p>

                  <p className="mt-0.5 text-[10px] font-normal text-gray-400">
                    จัดการบัญชีผู้ใช้งาน
                  </p>
                </div>
              </DropdownItem>
            </li> */}
          </ul>

          {/* LOGOUT */}

          <div className="mt-2 border-t border-gray-100 pt-2 dark:border-gray-800">
            <button
              type="button"
              onClick={() => void handleLogout()}
              disabled={isLoggingOut}
              className="group flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left text-sm font-semibold text-gray-700 transition-colors hover:bg-rose-50 hover:text-rose-600 disabled:cursor-not-allowed disabled:opacity-60 dark:text-gray-400 dark:hover:bg-rose-500/10 dark:hover:text-rose-400"
            >
              <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-gray-100 text-gray-500 transition-colors group-hover:bg-rose-100 group-hover:text-rose-600 dark:bg-gray-800 dark:text-gray-400 dark:group-hover:bg-rose-500/10 dark:group-hover:text-rose-400">
                {isLoggingOut ? (
                  <Loader2 className="h-4.5 w-4.5 animate-spin" />
                ) : (
                  <LogOut className="h-4.5 w-4.5" />
                )}
              </div>

              <div className="flex-1">
                <p>{isLoggingOut ? 'กำลังออกจากระบบ...' : 'ออกจากระบบ'}</p>

                {!isLoggingOut && (
                  <p className="mt-0.5 text-[10px] font-normal text-gray-400">
                    ออกจากบัญชีผู้ใช้งานปัจจุบัน
                  </p>
                )}
              </div>
            </button>
          </div>
        </div>
      </Dropdown>
    </div>
  );
}

// MENU ICON

function MenuIcon({ children }: { children: React.ReactNode }) {
  return (
    <div className="group-hover:bg-brand-500/10 group-hover:text-brand-500 flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-gray-100 text-gray-500 transition-colors dark:bg-gray-800 dark:text-gray-400">
      {children}
    </div>
  );
}
