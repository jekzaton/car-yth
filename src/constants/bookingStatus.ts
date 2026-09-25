import { Clock3, CheckCircle2, XCircle } from 'lucide-react';
import { BookingStatus } from '@/types/carBookingType';

export const bookingStatus = {
  pending: {
    text: 'รอดำเนินการ',
    color:
      'bg-yellow-100 text-yellow-700 dark:bg-yellow-500/10 dark:text-yellow-300',
    icon: Clock3,
  },

  approved: {
    text: 'ดำเนินการ',
    color:
      'bg-green-100 text-green-700 dark:bg-green-500/10 dark:text-green-300',
    icon: CheckCircle2,
  },

  cancelled: {
    text: 'ยกเลิก',
    color: 'bg-red-100 text-red-700 dark:bg-red-500/10 dark:text-red-300',
    icon: XCircle,
  },
} satisfies Record<BookingStatus, any>;
