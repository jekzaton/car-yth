const BASE_PATH = process.env.NEXT_PUBLIC_BASE_PATH || '/ythcar';

export function getImageUrl(src?: string | null): string {
  const fallback = `${BASE_PATH}/images/no-image.png`;

  if (!src || !src.trim()) {
    return fallback;
  }

  const trimmed = src.trim();

  // รองรับ URL ภายนอก (http/https) และรูปพรีวิวตอนเลือกไฟล์ (blob/data)
  if (/^(https?:\/\/|blob:|data:)/i.test(trimmed)) {
    return trimmed;
  }

  let cleanPath = trimmed.startsWith('/') ? trimmed : `/${trimmed}`;

  // ตัด basePath ออกชั่วคราวเพื่อจัดรูปแบบ Path ให้เป็นมาตรฐานเดียวกัน
  if (cleanPath === BASE_PATH || cleanPath.startsWith(`${BASE_PATH}/`)) {
    cleanPath = cleanPath.slice(BASE_PATH.length) || '/';
  }

  // แปลง Path รูปภาพรถ (/images/cars/xxx.webp) ให้วิ่งผ่าน API Route
  // เพื่อแก้ปัญหา Next.js standalone บน Docker ไม่อ่านไฟล์ที่อัปโหลดใหม่
  if (cleanPath.startsWith('/images/cars/')) {
    const filename = cleanPath.replace('/images/cars/', '');
    return `${BASE_PATH}/api/cars/image/${filename}`;
  }

  return `${BASE_PATH}${cleanPath}`;
}
