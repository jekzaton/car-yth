import EditCart from '@/components/car/EditCar';
import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Cars YTH',
  description: 'แก้ไขยานพาหนะ YTH',
  // other metadata
};
export default function page() {
  return (
    <div>
      <EditCart />
    </div>
  );
}
