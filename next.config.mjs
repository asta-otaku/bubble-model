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
};

export default nextConfig;
