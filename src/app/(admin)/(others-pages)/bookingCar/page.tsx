import CreateBookingCar from '@/components/bookingCar/CreateBookingCar';

import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Cars YTH',
  description: 'ขอจองรถ Car YTH',
  // other metadata
};
export default function page() {
  return (
    <div>
      <CreateBookingCar />
    </div>
  );
}
