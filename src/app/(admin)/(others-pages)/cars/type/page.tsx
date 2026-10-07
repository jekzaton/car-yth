import ListCarType from '@/components/car/carType/ListCarType';

import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Car Types YTH',
  description: 'ประเภทรถ YTH',
  // other metadata
};
export default function page() {
  return (
    <div>
      <ListCarType />
    </div>
  );
}
