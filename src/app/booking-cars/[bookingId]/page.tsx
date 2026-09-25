import BookingDetail from '@/components/car/car-manage/BookingDetail';
import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Cars YTH',
  description: 'รายละเอียดการจอง YTH',
  // other metadata
};

type PageProps = {
  params: Promise<{
    bookingId: string;
  }>;
};

export default async function BookingDetailPage({ params }: PageProps) {
  const { bookingId } = await params;

  return <BookingDetail bookingId={Number(bookingId)} />;
}
