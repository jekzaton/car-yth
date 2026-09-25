import ListUsage from '@/components/car/carUsage/ListUsage';

import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'UsageCar YTH',
  description: 'ข้อมูลการขับรถยนต์ YTH',
  // other metadata
};
export default function page() {
  return (
    <div>
      <ListUsage />
    </div>
  );
}
