const BASE_PATH = '/ythcar';

export function getImageUrl(src?: string | null): string {
  if (!src) {
    return `${BASE_PATH}/images/no-image.png`;
  }

  if (/^https?:\/\//i.test(src)) {
    return src;
  }

  const cleanPath = src.startsWith('/') ? src : `/${src}`;

  if (cleanPath === BASE_PATH || cleanPath.startsWith(`${BASE_PATH}/`)) {
    return cleanPath;
  }

  return `${BASE_PATH}${cleanPath}`;
}
