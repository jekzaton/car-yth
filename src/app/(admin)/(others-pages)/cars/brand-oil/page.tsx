import ListOil from '@/components/car/brandOil/listOil';

import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Brand Oil YTH',
  description: 'ยี่ห้อน้ำมัน YTH',
  // other metadata
};
export default function page() {
  return (
    <div>
      <ListOil />
    </div>
  );
}
