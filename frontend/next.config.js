/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  output: 'standalone',
  images: {
    domains: [
      'images.unsplash.com',
      'via.placeholder.com',
      'cloudflare-ipfs.com',
      'avatars.githubusercontent.com',
      'source.unsplash.com',
    ],
  },
  async rewrites() {
    return [
      {
        source: '/api/:path*',
        destination: '/api/:path*',
        has: [{ type: 'header', key: 'x-use-local-api', value: 'true' }],
      },
      {
        source: '/api/auth/:path*',
        destination: '/api/auth/:path*',
      },
      {
        source: '/api/v1/:path*',
        destination: process.env.NEXT_PUBLIC_API_URL
          ? `${process.env.NEXT_PUBLIC_API_URL}/:path*`
          : 'http://localhost:3001/:path*',
      },
    ];
  },
  async headers() {
    return [
      {
        source: '/:path*',
        headers: [
          { key: 'Access-Control-Allow-Credentials', value: 'true' },
          { key: 'Access-Control-Allow-Origin', value: '*' },
          { key: 'Access-Control-Allow-Methods', value: 'GET,DELETE,PATCH,POST,PUT,OPTIONS' },
          {
            key: 'Access-Control-Allow-Headers',
            value: 'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version, Authorization',
          },
          { key: 'X-XSS-Protection', value: '1; mode=block' },
          { key: 'X-Content-Type-Options', value: 'nosniff' },
          { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
          { key: 'X-Frame-Options', value: 'DENY' },
        ],
      },
    ];
  },
  typescript: {
    ignoreBuildErrors: true,
  },
  eslint: {
    ignoreDuringBuilds: true,
  },
  compiler: {
    removeConsole: process.env.NODE_ENV === 'production',
  },
};

module.exports = nextConfig;
