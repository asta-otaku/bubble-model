/** @type {import('next').NextConfig} */
module.exports = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "**.cloudfront.net",
        port: "",
        pathname: "/**",
      },
    ],
  },
  reactStrictMode: true,
  async headers() {
    return [
      {
        source: "/:path*",
        headers: [
          {
            key: "Cache-Control",
            value: "no-store, max-age=0",
          },
        ],
      },
    ];
  },
};
