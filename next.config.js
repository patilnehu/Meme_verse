const nextConfig = {
  images: {
    domains: ["i.imgflip.com"],
    remotePatterns: [
      {
        protocol: "https",
        hostname: "**",
      },
    ],
  },
}

module.exports = nextConfig

