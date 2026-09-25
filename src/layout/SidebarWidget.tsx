'use client';

import { LogOut, ShieldCheck } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { toast } from 'react-toastify';

import api from '@/lib/axios';

type StatusLevel = 'user' | 'member' | 'admin';

interface UserProps {
  id: number;
  firstName: string;
  lastName: string;
  statusLevel: StatusLevel;
}

interface ProfileResponse {
  success?: boolean;
  user?: UserProps;
  data?: UserProps;
}

const roleLabel: Record<StatusLevel, string> = {
  admin: 'ผู้ดูแลระบบ',
  member: 'สมาชิก',
  user: 'ผู้ใช้งาน',
};

export default function SidebarWidget() {
  const router = useRouter();

  const [user, setUser] = useState<UserProps | null>(null);

  const [loading, setLoading] = useState(true);

  const [loggingOut, setLoggingOut] = useState(false);

  useEffect(() => {
    let mounted = true;

    const loadProfile = async () => {
      try {
        const response = await api.get<ProfileResponse>('/api/auth/profile');

        if (!mounted) return;

        const profile = response.data.user ?? response.data.data ?? null;

        setUser(profile);
      } catch {
        if (mounted) {
          setUser(null);
        }
      } finally {
        if (mounted) {
          setLoading(false);
        }
      }
    };

    void loadProfile();

    return () => {
      mounted = false;
    };
  }, []);

  const handleLogout = async () => {
    if (loggingOut) return;

    try {
      setLoggingOut(true);

      await api.post('/api/auth/logout');

      toast.success('ออกจากระบบสำเร็จ');

      router.replace('/signin');
      router.refresh();
    } catch {
      toast.error('ไม่สามารถออกจากระบบได้');

      setLoggingOut(false);
    }
  };

  const fullName = user
    ? `${user.firstName ?? ''} ${user.lastName ?? ''}`.trim()
    : '';

  const initial = user?.firstName?.trim().charAt(0).toUpperCase() || '?';

  const currentRole = user?.statusLevel ?? null;

  return (
    <div className="w-full px-1 pb-3">
      <div className="border-border bg-card/80 w-full rounded-2xl border p-2.5 shadow-sm backdrop-blur-sm">
        {/* ================= USER ================= */}
        <div className="flex min-w-0 items-center gap-2.5">
          {/* AVATAR */}
          <div className="bg-linear-to-br flex h-10 w-10 shrink-0 items-center justify-center rounded-xl from-sky-500 to-emerald-500 text-sm font-bold text-white shadow-sm">
            {loading ? (
              <div className="h-4 w-4 animate-pulse rounded-full bg-white/30" />
            ) : (
              initial
            )}
          </div>

          {/* INFO */}
          <div className="min-w-0 flex-1">
            <h3
              title={fullName}
              className="text-foreground truncate text-sm font-semibold leading-5"
            >
              {loading ? 'กำลังโหลด...' : fullName || 'ไม่พบข้อมูลผู้ใช้'}
            </h3>

            <div className="mt-0.5">
              {loading ? (
                <div className="bg-muted h-5 w-16 animate-pulse rounded-full" />
              ) : (
                <span className="inline-flex max-w-full items-center gap-1 rounded-full bg-emerald-500/10 px-1.5 py-0.5 text-[10px] font-semibold text-emerald-600 dark:text-emerald-400">
                  <ShieldCheck className="h-3 w-3 shrink-0" />

                  <span className="truncate">
                    {currentRole ? roleLabel[currentRole] : '-'}
                  </span>
                </span>
              )}
            </div>
          </div>
        </div>

        {/* ================= LOGOUT ================= */}
        <button
          type="button"
          onClick={handleLogout}
          disabled={loggingOut || loading}
          className="mt-2.5 flex h-9 w-full items-center justify-center gap-1.5 rounded-xl bg-rose-500/10 px-3 text-xs font-semibold text-rose-600 transition hover:bg-rose-500 hover:text-white disabled:pointer-events-none disabled:opacity-50 dark:text-rose-400 dark:hover:text-white"
        >
          <LogOut className="h-3.5 w-3.5 shrink-0" />

          <span>{loggingOut ? 'กำลังออก...' : 'ออกจากระบบ'}</span>
        </button>
      </div>
    </div>
  );
}
