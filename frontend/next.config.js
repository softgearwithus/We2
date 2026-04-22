import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

/** @type {import('next').NextConfig} */
const nextConfig = {
    output: 'standalone',
    compress: true,
    reactStrictMode: true,
    eslint: { ignoreDuringBuilds: true },
    typescript: { ignoreBuildErrors: true },
    outputFileTracingRoot: __dirname,

    // ── Image optimisation ────────────────────────────────────────────────────
    images: {
        formats: ['image/avif', 'image/webp'],
        deviceSizes: [640, 750, 828, 1080, 1200],
        minimumCacheTTL: 31536000,
        remotePatterns: [
            { protocol: 'https', hostname: 'lh3.googleusercontent.com' },
            { protocol: 'https', hostname: 'firebasestorage.googleapis.com' },
            { protocol: 'https', hostname: 'api.dicebear.com' },
            { protocol: 'https', hostname: 'images.unsplash.com' },
        ],
    },

    // ── Strip console in production ───────────────────────────────────────────
    compiler: {
        removeConsole: process.env.NODE_ENV === 'production' ? { exclude: ['error'] } : false,
    },

    async redirects() {
        return [
            {
                source: '/:path*',
                has: [{ type: 'host', value: 'www.emble.in' }],
                destination: 'https://emble.in/:path*',
                permanent: true,
            },
        ];
    },

    async headers() {
        return [
            // Static assets — immutable, 1 year cache
            {
                source: '/_next/static/:path*',
                headers: [
                    { key: 'Cache-Control', value: 'public, max-age=31536000, immutable' },
                    { key: 'X-Robots-Tag', value: 'noindex' },
                ],
            },
            // Company logos and public images
            {
                source: '/companies/:path*',
                headers: [
                    { key: 'Cache-Control', value: 'public, max-age=604800, stale-while-revalidate=86400' },
                ],
            },
            // Audio/video files
            {
                source: '/:file*.mp3',
                headers: [{ key: 'Cache-Control', value: 'public, max-age=604800' }],
            },
            // Noindex routes
            { source: '/dashboard', headers: [{ key: 'X-Robots-Tag', value: 'noindex, nofollow' }] },
            { source: '/dashboard/:path*', headers: [{ key: 'X-Robots-Tag', value: 'noindex, nofollow' }] },
            { source: '/admin', headers: [{ key: 'X-Robots-Tag', value: 'noindex, nofollow' }] },
            { source: '/admin/:path*', headers: [{ key: 'X-Robots-Tag', value: 'noindex, nofollow' }] },
            { source: '/institute', headers: [{ key: 'X-Robots-Tag', value: 'noindex, nofollow' }] },
            { source: '/institute/:path*', headers: [{ key: 'X-Robots-Tag', value: 'noindex, nofollow' }] },
            { source: '/industry', headers: [{ key: 'X-Robots-Tag', value: 'noindex, nofollow' }] },
            { source: '/industry/:path*', headers: [{ key: 'X-Robots-Tag', value: 'noindex, nofollow' }] },
        ];
    },
};

export default nextConfig;
