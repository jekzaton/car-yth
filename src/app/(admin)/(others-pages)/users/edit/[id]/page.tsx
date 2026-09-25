import EditUser from '@/components/user/EditUser';
import { Metadata } from 'next';
import { notFound } from 'next/navigation';

export const metadata: Metadata = {
  title: 'แก้ไขผู้ใช้งาน | YTH',
  description: 'แก้ไขข้อมูลผู้ใช้งานระบบ Car YTH',
};

type EditUserPageProps = {
  params: Promise<{
    id: string;
  }>;
};

export default async function EditUserPage({ params }: EditUserPageProps) {
  const { id } = await params;
  const userId = Number(id);

  if (!Number.isInteger(userId) || userId <= 0) {
    notFound();
  }

  return <EditUser userId={userId} />;
}
