import createNextIntlPlugin from 'next-intl/plugin';

/** @type {import('next').NextConfig} */
const nextConfig = {
  devIndicators: false,
  // Gzip/Brotli compression for all responses
  compress: true,
  // Remove X-Powered-By header (minor security improvement)
  poweredByHeader: false,
  images: {
    // Serve AVIF first (best compression), fallback to WebP, then original
    formats: ['image/avif', 'image/webp'],
    qualities: [75, 90, 92, 94, 95, 96, 100],
    // Cache optimized images for 1 year
    minimumCacheTTL: 31536000,
    remotePatterns: [
      { protocol: 'https', hostname: '**' },
      { protocol: 'http', hostname: 'localhost' }
    ]
  },
  experimental: {
    optimizePackageImports: ['lucide-react', 'framer-motion']
  },
  async headers() {
    // In development avoid setting long-lived immutable Cache-Control for Next static chunks
    // as it can cause stale module/chunk issues with the dev server and HMR.
    const securityHeaders = {
      source: '/(.*)',
      headers: [
        { key: 'X-Content-Type-Options', value: 'nosniff' },
        { key: 'X-Frame-Options', value: 'SAMEORIGIN' },
        { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
        { key: 'Permissions-Policy', value: 'camera=(), microphone=(), geolocation=(self)' }
      ]
    };

    const cssAndImageCacheHeader = {
      // Cache CSS and image assets for 30 minutes (1800 seconds)
      source: '/(:path*\\.(?:css|png|jpg|jpeg|svg|webp|avif|gif))',
      headers: [
        { key: 'Cache-Control', value: 'public, max-age=1800' }
      ]
    };

    if (process.env.NODE_ENV !== 'production') {
      // Let Next dev server manage cache headers for /_next/static to keep Turbopack stable,
      // but explicitly apply the requested 30-minute caching rule for CSS and images.
      return [
        cssAndImageCacheHeader,
        securityHeaders
      ];
    }

    return [
      {
        // Cache static font and icon assets in /public for 1 year
        source: '/(:path*\\.(?:woff2|woff|ttf|otf|eot|ico))',
        headers: [
          { key: 'Cache-Control', value: 'public, max-age=31536000, immutable' }
        ]
      },
      cssAndImageCacheHeader,
      {
        // Cache Next.js static chunks for 1 year
        source: '/_next/static/:path*',
        headers: [
          { key: 'Cache-Control', value: 'public, max-age=31536000, immutable' }
        ]
      },
      securityHeaders
    ];
  }
};

const withNextIntl = createNextIntlPlugin('./i18n/request.ts');

export default withNextIntl(nextConfig);
