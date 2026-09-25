import { redirect } from 'next/navigation';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Car YTH',
  description: 'เข้าสู่ระบบ',
};

export default function Home() {
  redirect('/signin');
}
