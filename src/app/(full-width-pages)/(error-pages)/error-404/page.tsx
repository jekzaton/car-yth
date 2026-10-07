import GridShape from '@/components/common/GridShape';
import { Metadata } from 'next';
import Link from 'next/link';
import React from 'react';

export const metadata: Metadata = {
  title: 'ไม่พบหน้าที่ต้องการ | CAR-YTH',
  description: 'ไม่พบหน้าที่คุณกำลังค้นหาในระบบจองรถ โรงพยาบาลยางตลาด',
};

export default function Error404() {
  return (
    <div className="z-1 relative flex min-h-screen flex-col items-center justify-center overflow-hidden p-6">
      <GridShape />

      <div className="max-w-125 mx-auto w-full text-center">
        {/* Error Code */}
        <h1 className="mb-3 text-7xl font-bold text-blue-600 sm:text-8xl dark:text-blue-400">
          404
        </h1>

        {/* Title */}
        <h2 className="mb-3 text-2xl font-bold text-gray-800 sm:text-3xl dark:text-white/90">
          ไม่พบหน้าที่คุณต้องการ
        </h2>

        {/* Description */}
        <p className="mb-8 text-base text-gray-500 sm:text-lg dark:text-gray-400">
          หน้าที่คุณกำลังค้นหาอาจถูกย้าย ลบออก หรือ URL ที่เรียกใช้งานไม่ถูกต้อง
        </p>

        {/* Back Home */}
        <Link
          href="/"
          className="shadow-theme-xs inline-flex items-center justify-center rounded-lg bg-blue-600 px-6 py-3.5 text-sm font-medium text-white transition hover:bg-blue-700"
        >
          กลับหน้าหลัก
        </Link>
      </div>

      {/* Footer */}
      <p className="absolute bottom-6 left-1/2 -translate-x-1/2 text-center text-sm text-gray-500 dark:text-gray-400">
        &copy; {new Date().getFullYear()} CAR-YTH | Yangtalad Hospital
      </p>
    </div>
  );
}
