/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    serverActions: {
      allowedOrigins: ["localhost:3000"],
    },
    optimizePackageImports: ["@chakra-ui/react", "@emotion/react"],
  },
  transpilePackages: ["@emotion/react", "@emotion/styled", "@emotion/cache"],
};

export default nextConfig;
