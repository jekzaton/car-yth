import Calendar from '@/components/calendar/Calendar';
import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Car YTH',
  description: 'ปฏิทินการใช้รถยนต์',
  // other metadata
};
export default function page() {
  return (
    <div>
      {/* <PageBreadcrumb pageTitle="Calendar" /> */}
      <Calendar />
    </div>
  );
}
