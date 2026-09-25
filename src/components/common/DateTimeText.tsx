'use client';

import moment from 'moment';
import 'moment/locale/th';

moment.locale('th');

type DateTimeTextProps = {
  value?: string | Date | null;
  format?: string;
  fallback?: string;
  className?: string;
  buddhistYear?: boolean;
};

export default function DateTimeText({
  value,
  format = 'DD MMM YYYY HH:mm',
  fallback = '-',
  className = '',
  buddhistYear = true,
}: DateTimeTextProps) {
  if (!value) {
    return <span className={className}>{fallback}</span>;
  }

  const date = moment(value);

  if (!date.isValid()) {
    return <span className={className}>{fallback}</span>;
  }

  let formatted = date.format(format);

  // เปลี่ยน ค.ศ. เป็น พ.ศ.
  if (buddhistYear) {
    const christianYear = date.format('YYYY');
    const buddhistYearValue = String(date.year() + 543);

    formatted = formatted.replace(christianYear, buddhistYearValue);
  }

  return (
    <span className={className} title={date.format('DD/MM/YYYY HH:mm:ss')}>
      {formatted}
    </span>
  );
}
