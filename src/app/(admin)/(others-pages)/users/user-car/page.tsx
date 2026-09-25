import TableUserCar from '@/components/user/userCar/TableUserCar';
import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Cars YTH',
  description: 'จัดการสมาชิกคนขับรถ Car YTH',
  // other metadata
};
export default function page() {
  return (
    <div>
      <TableUserCar />
    </div>
  );
}
