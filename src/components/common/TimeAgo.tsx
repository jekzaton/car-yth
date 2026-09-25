'use client';

import { useEffect, useState } from 'react';
import moment from 'moment';
import 'moment/locale/th';

moment.locale('th');

type TimeAgoProps = {
  value?: string | Date | null;
  className?: string;
  fallback?: string;
};

export default function TimeAgo({
  value,
  className = '',
  fallback = '-',
}: TimeAgoProps) {
  const [, refresh] = useState(0);

  useEffect(() => {
    const timer = window.setInterval(() => {
      refresh((current) => current + 1);
    }, 60_000);

    return () => window.clearInterval(timer);
  }, []);

  if (!value) {
    return <span className={className}>{fallback}</span>;
  }

  let date: moment.Moment;

  if (typeof value === 'string') {
    // ลบ Z เพื่อไม่ให้ Moment ตีความเป็น UTC
    const normalizedValue = value
      .replace('T', ' ')
      .replace(/\.\d{3}Z$/, '')
      .replace(/Z$/, '');

    date = moment(normalizedValue, 'YYYY-MM-DD HH:mm:ss', true);

    if (!date.isValid()) {
      date = moment(value);
    }
  } else {
    date = moment(value);
  }

  if (!date.isValid()) {
    return <span className={className}>{fallback}</span>;
  }

  return (
    <span className={className} title={date.format('DD/MM/YYYY HH:mm:ss')}>
      {date.fromNow()}
    </span>
  );
}
