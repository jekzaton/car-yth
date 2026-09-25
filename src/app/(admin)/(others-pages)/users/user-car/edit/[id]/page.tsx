import EditUserCar from '@/components/user/userCar/EditUserCar';
import { Metadata } from 'next';
import { notFound } from 'next/navigation';

export const metadata: Metadata = {
  title: 'แก้ไขผู้ใช้งาน | YTH',
  description: 'แก้ไขข้อมูลผู้ใช้งานคนขับรถ Car YTH',
};

type EditUserCarPageProps = {
  params: Promise<{
    id: string;
  }>;
};

export default async function EditUserPage({ params }: EditUserCarPageProps) {
  const { id } = await params;
  const userId = Number(id);

  if (!Number.isInteger(userId) || userId <= 0) {
    notFound();
  }

  return <EditUserCar userId={userId} />;
}
