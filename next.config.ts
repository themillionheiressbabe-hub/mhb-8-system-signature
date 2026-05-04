import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  serverExternalPackages: ["sweph", "sweph-wasm", "geo-tz"],
};

export default nextConfig;
