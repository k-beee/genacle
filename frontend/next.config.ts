import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: "export",
  images: { unoptimized: true },
  basePath: "/genacle",
  trailingSlash: true,
};

export default nextConfig;
