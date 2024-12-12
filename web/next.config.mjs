// @ts-check

/**
* @type {import('next').NextConfig}
*/
const nextConfig = {
  /* config options here */
  async rewrites() {
    return [
      {
        source: "/api/auth/:path",
        destination: "/api/auth/:path*",
      },
      {
        source: "/api/:path*",
        destination: "http://localhost:5000/api/:path*",
      },
    ];
  },
};

export default nextConfig;
