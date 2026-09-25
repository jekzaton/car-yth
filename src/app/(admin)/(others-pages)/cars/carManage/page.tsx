import TableCarList from '@/components/car/car-manage/TableCarList';

import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'จัดการยานพาหนะ YTH',
  description: 'จัดการยานพาหนะ YTH',
  // other metadata
};
export default function page() {
  return (
    <div>
      <TableCarList />
    </div>
  );
}
