'use client';

import Image from 'next/image';
import { useMemo, useState } from 'react';
import { getImageUrl } from '@/lib/image';

type CarImageCellProps = {
  src?: unknown;
  alt: string;
};

function getCoverImage(src: unknown): string {
  if (!src) return getImageUrl(null);

  if (Array.isArray(src)) {
    const firstImage = src.find(
      (image): image is string =>
        typeof image === 'string' && image.trim() !== '',
    );

    return getImageUrl(firstImage);
  }

  if (typeof src !== 'string') {
    return getImageUrl(null);
  }

  const value = src.trim();

  if (!value) return getImageUrl(null);

  try {
    const parsed: unknown = JSON.parse(value);

    if (Array.isArray(parsed)) {
      const firstImage = parsed.find(
        (image): image is string =>
          typeof image === 'string' && image.trim() !== '',
      );

      return getImageUrl(firstImage);
    }

    if (parsed && typeof parsed === 'object') {
      const obj = parsed as { main?: unknown; images?: unknown };

      if (typeof obj.main === 'string' && obj.main.trim() !== '') {
        return getImageUrl(obj.main);
      }

      if (Array.isArray(obj.images)) {
        const firstImage = obj.images.find(
          (image): image is string =>
            typeof image === 'string' && image.trim() !== '',
        );

        return getImageUrl(firstImage);
      }
    }
  } catch {
    return getImageUrl(value);
  }

  return getImageUrl(null);
}

export default function CarImageCell({ src, alt }: CarImageCellProps) {
  const coverImage = useMemo(() => getCoverImage(src), [src]);
  const [failedSrc, setFailedSrc] = useState<string | null>(null);

  const fallbackImage = getImageUrl(null);
  const hasError = failedSrc === coverImage;
  const imageSrc = hasError ? fallbackImage : coverImage;

  return (
    <div className="dark:border-white/8 relative h-14 w-20 shrink-0 overflow-hidden rounded-xl border border-gray-200 bg-gray-100 shadow-sm dark:bg-white/5">
      <Image
        key={imageSrc}
        src={imageSrc}
        alt={alt || 'car image'}
        fill
        unoptimized
        sizes="80px"
        className="object-contain transition duration-300 hover:scale-105"
        onError={() => {
          if (!hasError) {
            console.error('โหลดรูปไม่ได้:', imageSrc);
            setFailedSrc(coverImage);
          }
        }}
      />
    </div>
  );
}
