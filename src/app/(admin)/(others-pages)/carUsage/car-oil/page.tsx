import ListOil from '@/components/car/carOil/ListOli';

import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Car Oil YTH',
  description: 'การเติมน้ำมันรถยนต์ YTH',
  // other metadata
};
export default function page() {
  return (
    <div>
      <ListOil />
    </div>
  );
}
