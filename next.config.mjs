import createNextIntlPlugin from 'next-intl/plugin';
 
const withNextIntl = createNextIntlPlugin();
/** @type {import('next').NextConfig} */
const nextConfig = {
    reactStrictMode: false,
    images: {
        dangerouslyAllowSVG: true,
        remotePatterns: [
          { protocol: 'https', hostname: 'flagcdn.com' },
          { protocol: 'https', hostname: 'phpstack-1404657-5219632.cloudwaysapps.com' },
          { protocol: 'https', hostname: 'adminbh.ahmedalmaghribi.com' },
          { protocol: 'http', hostname: 'localhost' }
        ],
      },
      productionBrowserSourceMaps: true,
      // basePath: '/bh'
      async rewrites() {
        return [
          {
            source: '/:locale(en|ar)/maplibre/:path*',
            destination: '/maplibre/:path*',
          },
        ];
      },
};

export default withNextIntl(nextConfig);
