import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Limite les workers: Infomaniak (et hebergements partages) tombe en EAGAIN sinon.
  experimental: {
    workerThreads: false,
    cpus: 1,
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
