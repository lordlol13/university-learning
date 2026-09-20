import type { NextConfig } from "next";

const config: NextConfig = {
  reactStrictMode: true,
  devIndicators: false,
  allowedDevOrigins: ["localhost", "127.0.0.1", "localhost:3000", "127.0.0.1:3000"],
  headers: async () => [
    {
      source: "/:path*",
      headers: [
        {
          key: "Cache-Control",
          value: "no-store, must-revalidate",
        },
      ],
    },
  ],
};
export default config;
