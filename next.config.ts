import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
    images: {
        remotePatterns: [
            {
                hostname: 'lh3.googleusercontent.com',
                pathname: '/a/**',
                protocol: 'https',
            },
        ],
    },
};

export default nextConfig;
