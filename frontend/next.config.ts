import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  eslint: {
    // Ngăn ESLint làm thất bại quá trình build trên Vercel khi có cảnh báo/lỗi lint nhỏ
    ignoreDuringBuilds: true,
  },
  async headers() {
    return [
      {
        source: "/:path*",
        headers: [
          {
            key: "Cross-Origin-Opener-Policy",
            value: "same-origin-allow-popups",
          },
        ],
      },
    ];
  },
};

export default nextConfig;
