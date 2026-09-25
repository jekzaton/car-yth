/**
 * แปลงวันที่ให้อยู่ในรูปแบบ YYYY-MM-DD
 */
export function normalizeDate(value: unknown): string {
  if (!value) return '';

  if (value instanceof Date) {
    const year = value.getFullYear();
    const month = String(value.getMonth() + 1).padStart(2, '0');
    const day = String(value.getDate()).padStart(2, '0');

    return `${year}-${month}-${day}`;
  }

  const raw = String(value).trim();

  const match = raw.match(/^(\d{4})-(\d{2})-(\d{2})/);

  if (!match) return '';

  return `${match[1]}-${match[2]}-${match[3]}`;
}

/**
 * แสดงวันที่แบบไทย
 * ตัวอย่าง: 2026-09-02 -> 02 ก.ย. 2569
 */
export function formatThaiDate(value: unknown): string {
  const normalized = normalizeDate(value);

  if (!normalized) return '-';

  const [year, month, day] = normalized.split('-').map(Number);

  const date = new Date(year, month - 1, day);

  if (Number.isNaN(date.getTime())) {
    return '-';
  }

  return new Intl.DateTimeFormat('th-TH', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  }).format(date);
}

/**
 * แสดงเวลา HH:mm
 * ตัวอย่าง: 08:30:00 -> 08:30
 */
export function formatTime(value: unknown): string {
  if (!value) return '-';

  const raw = String(value).trim();

  const match = raw.match(/^(\d{1,2}):(\d{2})/);

  if (!match) return raw;

  return `${match[1].padStart(2, '0')}:${match[2]}`;
}

/**
 * แสดงเบอร์โทรศัพท์
 * ตัวอย่าง: 0812345678 -> 081-234-5678
 */
export function formatPhone(value?: string | null): string {
  if (!value) return '-';

  const phone = value.replace(/\D/g, '');

  if (phone.length === 10) {
    return `${phone.slice(0, 3)}-${phone.slice(3, 6)}-${phone.slice(6)}`;
  }

  return value;
}

export function formatBookingDate(value?: string | Date | null) {
  if (!value) return '-';

  try {
    // กรณีเป็น Date อยู่แล้ว
    if (value instanceof Date) {
      if (Number.isNaN(value.getTime())) return '-';

      return new Intl.DateTimeFormat('th-TH', {
        day: '2-digit',
        month: 'short',
        year: 'numeric',
      }).format(value);
    }

    const raw = String(value).trim();

    if (!raw) return '-';

    // รองรับ
    // 2026-09-09
    // 2026-09-09T00:00:00.000Z
    // 2026-09-09 00:00:00

    const datePart = raw.slice(0, 10);

    const match = datePart.match(/^(\d{4})-(\d{2})-(\d{2})$/);

    if (match) {
      const year = Number(match[1]);
      const month = Number(match[2]);
      const day = Number(match[3]);

      const date = new Date(year, month - 1, day);

      if (Number.isNaN(date.getTime())) return '-';

      return new Intl.DateTimeFormat('th-TH', {
        day: '2-digit',
        month: 'short',
        year: 'numeric',
      }).format(date);
    }

    // fallback
    const date = new Date(raw);

    if (Number.isNaN(date.getTime())) return '-';

    return new Intl.DateTimeFormat('th-TH', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
    }).format(date);
  } catch {
    return '-';
  }
}

export function formatDateTime(value: string) {
  if (!value) {
    return {
      date: '-',
      time: '-',
    };
  }

  const dateValue = new Date(value);

  if (Number.isNaN(dateValue.getTime())) {
    return {
      date: '-',
      time: '-',
    };
  }

  return {
    date: new Intl.DateTimeFormat('th-TH', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
    }).format(dateValue),

    time: new Intl.DateTimeFormat('th-TH', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: false,
    }).format(dateValue),
  };
}

export function toDateTimeLocal(value?: string | null) {
  if (!value) return '';

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return '';
  }

  const pad = (number: number) => String(number).padStart(2, '0');

  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(
    date.getDate(),
  )}T${pad(date.getHours())}:${pad(date.getMinutes())}`;
}

export function normalizeBookingDate(value?: string | null) {
  if (!value) return '';

  // กรณี API ส่ง YYYY-MM-DD
  if (/^\d{4}-\d{2}-\d{2}$/.test(value)) {
    return value;
  }

  // กรณี API ส่ง ISO เช่น 2026-09-09T00:00:00.000Z
  const match = value.match(/^(\d{4}-\d{2}-\d{2})/);

  if (match) {
    return match[1];
  }

  return '';
}
