import TableCar from '@/components/car/TableCar';
import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Cars YTH',
  description: 'ยานพาหนะทั้งหมด YTH',
  // other metadata
};
export default function page() {
  return (
    <div>
      <TableCar />
    </div>
  );
}
