import TableUser from '@/components/user/TableUser';
import { Metadata } from 'next';
import React from 'react';

export const metadata: Metadata = {
  title: 'Cars YTH',
  description: 'จัดการสมาชิก Car YTH',
  // other metadata
};
export default function page() {
  return (
    <div>
      <TableUser />
    </div>
  );
}
