/** @type {import('next').NextConfig} */
const nextConfig = {
    reactStrictMode: true,
    swcMinify: true,
    experimental: {
        // kuromoji loads its dictionary from node_modules/kuromoji/dict at
        // runtime via a dynamic fs path, so Next's tracer can't see it.
        // Force it into the serverless bundle for the custom-content route
        // so /api/custom/create works when deployed.
        outputFileTracingIncludes: {
            '/api/custom/create': ['./node_modules/kuromoji/dict/**'],
        },
    },
    async headers() {
        return [
            {
                source: '/:path*',
                headers: [
                    { key: 'X-Content-Type-Options', value: 'nosniff' },
                    { key: 'X-Frame-Options', value: 'SAMEORIGIN' },
                    { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
                    {
                        key: 'Strict-Transport-Security',
                        value: 'max-age=63072000; includeSubDomains',
                    },
                    {
                        key: 'Permissions-Policy',
                        value: 'camera=(), microphone=(), geolocation=()',
                    },
                ],
            },
        ]
    },
}

module.exports = nextConfig 