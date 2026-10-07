import type { NextConfig } from "next";

import { legacyServiceRoutes } from "./src/content/service-route-map";

const nextConfig: NextConfig = {
  async redirects() {
    return Object.entries(legacyServiceRoutes).map(([source, destination]) => ({ source, destination, permanent: true }));
  },
};

export default nextConfig;
