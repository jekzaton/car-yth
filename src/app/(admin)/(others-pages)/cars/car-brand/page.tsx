import CarBrandList from '@/components/car/carBrand/CarBrandList';

import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Car Brand YTH',
  description: 'ยี่ห้อรถ YTH',
  // other metadata
};
export default function page() {
  return (
    <div>
      <CarBrandList />
    </div>
  );
}
