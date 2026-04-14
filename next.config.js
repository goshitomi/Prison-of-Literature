/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  async redirects() {
    return [
      {
        source:      "/books",
        destination: "/",
        permanent:   true,
      },
    ];
  },
};

module.exports = nextConfig;
