import type { NextConfig } from 'next';

const basePath = process.env.NEXT_PUBLIC_BASE_PATH || '/ythcar';

const nextConfig: NextConfig = {
  basePath,

  output: 'standalone',

  images: {
    unoptimized: true,
  },

  async redirects() {
    return [
      {
        source: '/',
        destination: `${basePath}/signin`,
        permanent: false,
        basePath: false,
      },
    ];
  },

  // ส่งต่อ Request รูปภาพใน /images/cars/* ไปยัง API Route เพื่อให้อ่านไฟล์ที่อัปโหลดใหม่ใน Docker standalone ได้
  async rewrites() {
    return [
      {
        source: '/images/cars/:filename',
        destination: '/api/cars/image/:filename',
      },
    ];
  },

  webpack(config) {
    config.module.rules.push({
      test: /\.svg$/,
      use: ['@svgr/webpack'],
    });

    return config;
  },

  turbopack: {
    rules: {
      '*.svg': {
        loaders: ['@svgr/webpack'],
        as: '*.js',
      },
    },
  },
};

export default nextConfig;
