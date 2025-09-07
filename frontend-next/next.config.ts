import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  async redirects() {
    return [
      {
        source: '/', // Path yang ingin Anda redirect (halaman utama)
        destination: '/login', // Tujuan redirect
        permanent: true, // true untuk 301 redirect (permanen), false untuk 307 (sementara)
      },
    ];
  },
};

export default nextConfig;
