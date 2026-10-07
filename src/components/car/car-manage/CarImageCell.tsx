'use client';

import Image from 'next/image';
import { useMemo, useState } from 'react';

interface CarImageCellProps {
  src: string;
  alt?: string;
  className?: string;
  width?: number;
  height?: number;
  priority?: boolean;
}

const BASE_PATH = process.env.NEXT_PUBLIC_BASE_PATH || '';

const FALLBACK_IMAGE = '/images/no-image.png';

function withBasePath(path: string): string {
  if (
    path.startsWith('http://') ||
    path.startsWith('https://') ||
    path.startsWith('blob:') ||
    path.startsWith('data:')
  ) {
    return path;
  }

  const normalizedPath = path.startsWith('/') ? path : `/${path}`;

  if (BASE_PATH && normalizedPath.startsWith(`${BASE_PATH}/`)) {
    return normalizedPath;
  }

  return `${BASE_PATH}${normalizedPath}`;
}

function normalizeImagePath(src: string): string {
  const value = src.trim();

  if (!value) return FALLBACK_IMAGE;

  if (
    value.startsWith('http://') ||
    value.startsWith('https://') ||
    value.startsWith('blob:') ||
    value.startsWith('data:')
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
  if (!src) return FALLBACK_IMAGE;

  if (Array.isArray(src)) {
    const firstImage = src.find(
      (image): image is string =>
        typeof image === 'string' && image.trim() !== '',
    );

    return firstImage ? normalizeImagePath(firstImage) : FALLBACK_IMAGE;
  }

  if (typeof src !== 'string') {
    return FALLBACK_IMAGE;
  }

  const value = src.trim();

  if (!value) return FALLBACK_IMAGE;

  try {
    const parsed: unknown = JSON.parse(value);

    if (Array.isArray(parsed)) {
      const firstImage = parsed.find(
        (image): image is string =>
          typeof image === 'string' && image.trim() !== '',
      );

      return firstImage ? normalizeImagePath(firstImage) : FALLBACK_IMAGE;
    }

    if (parsed && typeof parsed === 'object' && 'images' in parsed) {
      const images = (parsed as { images?: unknown }).images;

      if (Array.isArray(images)) {
        const firstImage = images.find(
          (image): image is string =>
            typeof image === 'string' && image.trim() !== '',
        );

        return firstImage ? normalizeImagePath(firstImage) : FALLBACK_IMAGE;
      }
    }
  } catch {
    return normalizeImagePath(value);
  }

  return FALLBACK_IMAGE;
}

export default function CarImageCell({
  src,
  alt = 'รูปภาพรถ',
  className = '',
  width = 80,
  height = 80,
  priority = false,
}: CarImageCellProps) {
  const coverImage = useMemo(() => getCoverImage(src), [src]);

  const normalizedSrc = withBasePath(coverImage);
  const fallbackSrc = withBasePath(FALLBACK_IMAGE);

  const [failedSrc, setFailedSrc] = useState<string | null>(null);

  const imageSrc = failedSrc === normalizedSrc ? fallbackSrc : normalizedSrc;

  return (
    <div
      className={`relative shrink-0 overflow-hidden rounded-xl border border-gray-200 bg-gray-100 shadow-sm dark:border-white/10 dark:bg-white/5 ${className}`}
      style={{
        width,
        height,
      }}
    >
      <Image
        key={imageSrc}
        src={imageSrc}
        alt={alt}
        fill
        unoptimized
        priority={priority}
        sizes={`${width}px`}
        className="object-cover transition-transform duration-300 hover:scale-105"
        onError={() => {
          if (imageSrc !== fallbackSrc) {
            console.error('โหลดรูปไม่ได้:', imageSrc);
            setFailedSrc(normalizedSrc);
          }
        }}
      />
    </div>
  );
}
