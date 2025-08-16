/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'cellphones.com.vn',
        port: '',
        pathname: '/sforum/wp-content/uploads/**',
      },
      {
        protocol: 'https',
        hostname: 'xdcs.cdnchinhphu.vn',
        port: '',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'duonggiahotel.vn',
        port: '',
        pathname: '/wp-content/uploads/**',
      },
      {
        protocol: 'https',
        hostname: 'nextumedialib.blob.core.windows.net',
        port: '',
        pathname: '/media-files/**',
      },
    ],
  },
};

module.exports = nextConfig;