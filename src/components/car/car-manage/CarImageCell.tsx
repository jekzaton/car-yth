'use client';

import Image from 'next/image';
import { useEffect, useMemo, useState } from 'react';

type CarImageCellProps = {
  src?: unknown;
  alt: string;
};

function normalizeImagePath(src: string): string {
  const value = src.trim();

  if (!value) return '/images/no-image.png';

  if (
    value.startsWith('http://') ||
    value.startsWith('https://') ||
    value.startsWith('blob:')
  ) {
    return value;
  }

  if (value.startsWith('public/')) {
    return value.replace(/^public/, '');
  }

  if (value.startsWith('/')) {
    return value;
  }

  return `/${value}`;
}

function getCoverImage(src: unknown): string {
  if (!src) return '/images/no-image.png';

  if (Array.isArray(src)) {
    const firstImage = src.find(
      (image): image is string =>
        typeof image === 'string' && image.trim() !== '',
    );

    return firstImage ? normalizeImagePath(firstImage) : '/images/no-image.png';
  }

  if (typeof src !== 'string') {
    return '/images/no-image.png';
  }

  const value = src.trim();

  if (!value) return '/images/no-image.png';

  try {
    const parsed: unknown = JSON.parse(value);

    if (Array.isArray(parsed)) {
      const firstImage = parsed.find(
        (image): image is string =>
          typeof image === 'string' && image.trim() !== '',
      );

      return firstImage
        ? normalizeImagePath(firstImage)
        : '/images/no-image.png';
    }

    if (parsed && typeof parsed === 'object' && 'images' in parsed) {
      const images = (parsed as { images?: unknown }).images;

      if (Array.isArray(images)) {
        const firstImage = images.find(
          (image): image is string =>
            typeof image === 'string' && image.trim() !== '',
        );

        return firstImage
          ? normalizeImagePath(firstImage)
          : '/images/no-image.png';
      }
    }
  } catch {
    return normalizeImagePath(value);
  }

  return '/images/no-image.png';
}

export default function CarImageCell({ src, alt }: CarImageCellProps) {
  const coverImage = useMemo(() => getCoverImage(src), [src]);
  const [hasError, setHasError] = useState(false);

  useEffect(() => {
    setHasError(false);
  }, [coverImage]);

  const imageSrc = hasError ? '/images/no-image.png' : coverImage;

  // console.log('CarImageCell:', {
  //   originalSrc: src,
  //   coverImage,
  //   imageSrc,
  // });

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
          console.error('โหลดรูปไม่ได้:', imageSrc);
          setHasError(true);
        }}
      />
    </div>
  );
}
