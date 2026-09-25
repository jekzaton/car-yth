import Profile from '@/components/user/profile/Profile';
import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Cars Profile YTH',
  description: 'ข้อมูลส่วนตัว YTH',
  // other metadata
};
export default function page() {
  return (
    <div>
      <Profile />
    </div>
  );
}
