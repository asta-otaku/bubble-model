/** @type {import('next').NextConfig} */
const nextConfig = {
  webpack: (config, { isServer }) => {
    if (isServer) {
      config.externals = [
        ...config.externals,
        {
          canvas: "commonjs canvas",
        },
      ];
    }
    return config;
  },
  // Add the images configuration to whitelist the CloudFront domain
  images: {
    domains: [
      'da0hzjj0t72aj.cloudfront.net',
      'd28nmw8joqfmpg.cloudfront.net',
      // Add any other domains you need to load images from
    ],
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

export default nextConfig;