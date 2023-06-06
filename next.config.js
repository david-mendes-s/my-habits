/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  images: {
    domains: ['lh3.googleusercontent.com']
  },
  async headers() {
    return [
      {
        source: "/dashboard",
        headers: [
          {
            key: "Cache-Control",
            value: "s-maxage=1, stale-while-revalidate=59",
          },
        ],
      },
    ];
  },
}



module.exports = nextConfig
