import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: "standalone",
  transpilePackages: ["@disaster-sim/domain"],
};

export default nextConfig;
