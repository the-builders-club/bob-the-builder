import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  experimental: {
    // simple-icons ships a 5 MB barrel export (3,400+ icons).
    // This tells Next.js to tree-shake it during dev builds.
    optimizePackageImports: ['simple-icons'],
  },
  turbopack: {
    root: import.meta.dirname,
  },
  async redirects() {
    return [
      {
        source: '/signup',
        destination: '/login',
        permanent: true,
      },
    ];
  },
  images: {
    // Required for local Supabase Docker (localhost resolves to a private IP).
    // Only enabled in development — never expose in production.
    dangerouslyAllowLocalIP: process.env.NODE_ENV === 'development',
    remotePatterns: [
      // Remote Supabase Storage (dev + prod): e.g. https://<project-ref>.supabase.co
      {
        protocol: 'https',
        hostname: '**.supabase.co',
        pathname: '/storage/v1/object/public/**',
      },
      // Local Supabase Storage (Docker): http://localhost:54321
      {
        protocol: 'http',
        hostname: 'localhost',
        port: '54321',
        pathname: '/storage/v1/object/public/**',
      },
      // GitHub OAuth avatars
      {
        protocol: 'https',
        hostname: 'avatars.githubusercontent.com',
      },
      // Google OAuth avatars
      {
        protocol: 'https',
        hostname: '**.googleusercontent.com',
      },
    ],
  },
};

export default nextConfig;
