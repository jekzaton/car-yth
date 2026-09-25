import Link from 'next/link';
import { Home, LockKeyhole, ShieldAlert } from 'lucide-react';

import BackButton from '@/components/common/BackButton';

export default function UnauthorizedPage() {
  return (
    <main className="bg-background relative flex min-h-screen items-center justify-center overflow-hidden p-6">
      {/* Background decoration */}
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute left-1/2 top-0 h-96 w-96 -translate-x-1/2 rounded-full bg-amber-500/10 blur-3xl" />

        <div className="absolute -bottom-32 -right-32 h-80 w-80 rounded-full bg-blue-500/10 blur-3xl" />
      </div>

      <div className="relative w-full max-w-lg">
        <div className="border-border bg-card overflow-hidden rounded-3xl border shadow-xl">
          {/* Top accent */}
          <div className="bg-linear-to-r h-1.5 from-amber-400 via-orange-500 to-rose-500" />

          <div className="px-6 py-10 text-center sm:px-10 sm:py-12">
            {/* Icon */}
            <div className="relative mx-auto mb-7 w-fit">
              <div className="flex h-24 w-24 items-center justify-center rounded-3xl bg-amber-500/10 ring-1 ring-amber-500/20">
                <ShieldAlert className="h-11 w-11 text-amber-500" />
              </div>

              <div className="border-card absolute -bottom-2 -right-2 flex h-9 w-9 items-center justify-center rounded-xl border-4 bg-rose-500 text-white shadow-lg">
                <LockKeyhole className="h-4 w-4" />
              </div>
            </div>

            {/* Content */}
            <div className="mb-2 text-xs font-bold uppercase tracking-[0.2em] text-amber-500">
              Access Denied
            </div>

            <h1 className="text-foreground text-2xl font-bold tracking-tight sm:text-3xl">
              ไม่มีสิทธิ์เข้าถึงหน้านี้
            </h1>

            <p className="text-muted-foreground mx-auto mt-4 max-w-sm text-sm leading-7">
              บัญชีของคุณไม่มีสิทธิ์เข้าถึงเมนูนี้
              กรุณากลับไปยังหน้าที่ได้รับอนุญาต
            </p>

            {/* Actions */}
            <div className="mt-8 flex flex-col justify-center gap-3 sm:flex-row">
              <BackButton />

              <Link
                href="/"
                className="bg-linear-to-r inline-flex h-11 items-center justify-center gap-2 rounded-xl from-blue-600 to-indigo-600 px-5 text-sm font-semibold text-white shadow-lg shadow-blue-500/20 transition hover:-translate-y-0.5 hover:shadow-xl"
              >
                <Home className="h-4 w-4" />
                หน้าหลัก
              </Link>
            </div>
          </div>

          {/* Footer */}
          <div className="border-border bg-muted/30 border-t px-6 py-4 text-center">
            <p className="text-muted-foreground text-xs">
              หากต้องการสิทธิ์เพิ่มเติม กรุณาติดต่อผู้ดูแลระบบ
            </p>
          </div>
        </div>
      </div>
    </main>
  );
}
