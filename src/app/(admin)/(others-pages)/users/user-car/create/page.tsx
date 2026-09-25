import CreateUserCar from '@/components/user/userCar/CreateUserCar';

import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'เพิ่มผู้ใช้งาน | YTH',
  description: 'เพิ่มผู้ใช้งานระบบ Car YTH',
};
export default function page() {
  return (
    <div>
      <CreateUserCar />
    </div>
  );
}
