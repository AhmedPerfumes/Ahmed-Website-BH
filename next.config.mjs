import createNextIntlPlugin from 'next-intl/plugin';
 
const withNextIntl = createNextIntlPlugin();
/** @type {import('next').NextConfig} */
const nextConfig = {
    reactStrictMode: false,
    images: {
        remotePatterns: [
          {
            protocol: 'http',
            hostname: 'phpstack-1404657-5219632.cloudwaysapps.com',
          },
          {
            protocol: 'https',
            hostname: 'admin.ahmedalmaghribi.bh',
          },
          {
            protocol: 'http',
            hostname: 'localhost',
          }
        ],
      },
      productionBrowserSourceMaps: true,
      // basePath: '/bh'
};

export default withNextIntl(nextConfig);
