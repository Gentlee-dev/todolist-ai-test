import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  transpilePackages: ["@todolist/shared"],
};

export default nextConfig;
