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
      // Add any other domains you need to load images from
    ],
  },
};

export default nextConfig;