/** @type {import('next').NextConfig} */
const nextConfig = {
    // 1. تجاهل أخطاء الـ ESLint والـ TypeScript أثناء الـ Build عشان يخلص فوراً
    eslint: {
        ignoreDuringBuilds: true,
    },
    typescript: {
        ignoreBuildErrors: true,
    },

    // 2. الـ API rewrites لربط الـ Frontend بالـ Backend
    async rewrites() {
        const apiUrl = process.env.NEXT_PUBLIC_API_BASE_URL || 'https://considerate-celebration-production-558b.up.railway.app';
        return [
           {
        source: '/api/:path*',
        destination: `${apiUrl}/api/:path*`,
      },
        ];
    },
    
    // Image optimization
    images: {
        unoptimized: true,
        formats: ['image/webp', 'image/avif'],
        deviceSizes: [640, 750, 828, 1080, 1200, 1920, 2048],
        imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
        minimumCacheTTL: 86400, // 24 hours
        remotePatterns: [
            {
                protocol: "https",
                hostname: "utfs.io",
                port: "",
                pathname: "/f/**",
            },
            {
                protocol: "https",
                hostname: "*.ufs.sh",
            },
            {
                protocol: "https",
                hostname: "images.unsplash.com",
            },
            {
                protocol: "https",
                hostname: "img.rocket.new",
            },
        ],
    },
    
    // Compression
    compress: true,
    
    // Experimental features
    experimental: {
        optimizePackageImports: ['framer-motion', '@heroicons/react', 'recharts'],
    },
    
    // Headers for caching
    async headers() {
        return [
            {
                source: '/api/:path*',
                headers: [
                    {
                        key: 'Cache-Control',
                        value: 'public, max-age=60, stale-while-revalidate=300',
                    },
                ],
            },
            {
                source: '/:all*(svg|jpg|png|webp|avif)',
                headers: [
                    {
                        key: 'Cache-Control',
                        value: 'public, max-age=31536000, immutable',
                    },
                ],
            },
        ];
    },
};

export default nextConfig;