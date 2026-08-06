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
    // Les images distantes sont deja servies et optimisees par Cloudinary.
    // On evite ainsi le proxy/optimizer Next.js qui peut echouer localement
    // avec des erreurs TLS/certificat sous Windows (`UNABLE_TO_VERIFY_LEAF_SIGNATURE`).
    unoptimized: true,
    remotePatterns: [
      {
        protocol: "https",
        hostname: "res.cloudinary.com",
        pathname: "/**",
      },
      {
        // Images de démo (seed) — Unsplash License
        protocol: "https",
        hostname: "images.unsplash.com",
        pathname: "/**",
      },
      {
        // Miniatures Pexels (bibliothèque d'images libres)
        protocol: "https",
        hostname: "images.pexels.com",
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
      { source: "/domaines", destination: "/categories", permanent: true },
      { source: "/nos-projets", destination: "/categories", permanent: true },
      { source: "/projets", destination: "/categories", permanent: true },
      { source: "/admin/projets", destination: "/admin/categories", permanent: true },
      {
        source: "/admin/projets/:path*",
        destination: "/admin/categories",
        permanent: true,
      },
      { source: "/admin/domaines", destination: "/admin/categories", permanent: true },
      {
        source: "/admin/domaines/:path*",
        destination: "/admin/categories",
        permanent: true,
      },
      { source: "/contactez-nous", destination: "/contact", permanent: true },
      { source: "/tracteur-retrofit", destination: "/c/tracteur", permanent: true },
      { source: "/arrosage-etp", destination: "/c/arrosage", permanent: true },
    ];
  },
};

export default nextConfig;
