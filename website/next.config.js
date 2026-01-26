const withBundleAnalyzer = require("@next/bundle-analyzer");

/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: false,
  swcMinify: true,
  images: {
    domains: ["lab.basement.studio", "qyrdqdqlpqwqcateoidc.supabase.co", "wwtfkqnhgkdoabgdfydr.supabase.co"],
    remotePatterns: [
      {
        protocol: "https",
        hostname: "**.supabase.co",
      },
    ],
  },
  // Rewrites with a safe fallback for NEXT_PUBLIC_DOCS_URL
  rewrites: async () => {
    const _docsUrl = process.env.NEXT_PUBLIC_DOCS_URL || ''
    return [
      {
        source: "/:path*",
        destination: `/:path*`,
      },
      {
        source: "/docs",
        destination: `${_docsUrl}/docs`,
      },
      {
        source: "/docs/:path*",
        destination: `${_docsUrl}/docs/:path*`,
      },
    ]
  },
};

module.exports = (_phase, { defaultConfig: _ }) => {
  const plugins = [
    withBundleAnalyzer({ enabled: process.env.ANALYZE === "true" }),
  ];
  return plugins.reduce((acc, plugin) => plugin(acc), { ...nextConfig });
};
