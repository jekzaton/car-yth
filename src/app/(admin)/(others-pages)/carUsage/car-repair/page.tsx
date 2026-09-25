import ListMaintain from '@/components/car/carMaintain/ListMaintain';

import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Car Repair YTH',
  description: 'การแจ้งซ่อมรถยนต์ YTH',
  // other metadata
};
export default function page() {
  return (
    <div>
      <ListMaintain />
    </div>
  );
}
