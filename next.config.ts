import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  webpack: (config, { dev }) => {
    // Ignore changes in the "docs" directory during development to prevent unnecessary rebuilds
    if (dev) {
      const ignored = Array.isArray(config.watchOptions?.ignored)
        ? config.watchOptions.ignored
        : [];

      config.watchOptions = {
        ...config.watchOptions,
        ignored: [...ignored, "**/docs/**"],
      };
    }

    return config;
  },
};

export default nextConfig;
