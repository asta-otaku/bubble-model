/** @type {import('next').NextConfig} */
module.exports = {
    reactStrictMode: true,
    async headers() {
      return [
        {
          source: '/:path*',
          headers: [
            {
              key: 'Cache-Control',
              value: 'no-store, max-age=0',
            },
          ],
        },
      ];
    },
  };