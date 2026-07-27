import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Hebergements partages (Infomaniak): limite stricte des processus au build.
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: true,
  },
  experimental: {
    workerThreads: false,
    cpus: 1,
    staticGenerationMaxConcurrency: 1,
    staticGenerationMinPagesPerWorker: 1000,
  },
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "res.cloudinary.com",
        pathname: "/**",
      },
    ],
  },
  async headers() {
    return [
      {
        source: "/(.*)",
        headers: [
          { key: "X-Frame-Options", value: "SAMEORIGIN" },
          { key: "X-Content-Type-Options", value: "nosniff" },
          { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
          {
            key: "Permissions-Policy",
            value: "camera=(), microphone=(), geolocation=()",
          },
        ],
      },
    ];
  },
  async redirects() {
    return [
      { source: "/a-propos-de", destination: "/a-propos", permanent: true },
      { source: "/nos-projets", destination: "/projets", permanent: true },
      { source: "/contactez-nous", destination: "/contact", permanent: true },
      { source: "/tracteur-retrofit", destination: "/c/tracteur", permanent: true },
      { source: "/arrosage-etp", destination: "/c/arrosage", permanent: true },
    ];
  },
};

export default nextConfig;
