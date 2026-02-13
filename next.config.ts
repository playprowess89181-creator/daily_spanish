import type { NextConfig } from "next";

const securityHeaders = [
  {
    key: 'Content-Security-Policy',
    value: [
      "default-src 'self'",
      "style-src 'self' 'unsafe-inline'",
      "script-src 'self' 'unsafe-inline' 'unsafe-eval' https://js.stripe.com",
      "img-src 'self' data: blob:",
      "font-src 'self' data:",
      "connect-src 'self' http://localhost:8000 http://127.0.0.1:8000 https://jsonplaceholder.typicode.com ws: https://api.stripe.com https://m.stripe.network https://r.stripe.com",
      "frame-src 'self' https://js.stripe.com https://hooks.stripe.com",
    ].join('; '),
  },
];

const nextConfig: NextConfig = {
  async headers() {
    return [
      {
        source: '/:path*',
        headers: securityHeaders,
      },
    ];
  },
  async rewrites() {
    return [
      {
        source: '/api/auth/:path*',
        destination: 'http://localhost:8000/api/auth/:path*',
      },
      {
        source: '/api/support/:path*',
        destination: 'http://localhost:8000/api/support/:path*',
      },
      {
        source: '/api/lessons/:path*',
        destination: 'http://localhost:8000/api/lessons/:path*',
      },
    ];
  },
};

export default nextConfig;
