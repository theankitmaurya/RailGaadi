import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  allowedDevOrigins: ["10.10.178.30", "localhost", "127.0.0.1", "192.168.*.*", "10.*.*.*"],
};

export default nextConfig;
