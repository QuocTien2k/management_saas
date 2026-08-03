import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  eslint: {
    // Ngăn ESLint làm thất bại quá trình build trên Vercel khi có cảnh báo/lỗi lint nhỏ
    ignoreDuringBuilds: true,
  },
};

export default nextConfig;
