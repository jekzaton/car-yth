import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  basePath: '/ythcar',

  output: 'standalone',

  images: {
    unoptimized: true,
  },

  // Redirect จาก / ไป /ythcar/signin
  async redirects() {
    return [
      {
        source: '/',
        destination: '/ythcar/signin',
        permanent: false,
        basePath: false,
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
