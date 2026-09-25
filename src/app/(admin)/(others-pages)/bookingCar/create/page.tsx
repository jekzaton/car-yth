import CreateUser from '@/components/user/CreateUser';

import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'เพิ่มผู้ใช้งาน | YTH',
  description: 'เพิ่มผู้ใช้งานระบบ Car YTH',
};
export default function page() {
  return (
    <div>
      <CreateUser />
    </div>
  );
}
