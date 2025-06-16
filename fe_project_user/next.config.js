const createNextIntlPlugin = require('next-intl/plugin');

// ✅ trỏ đúng đường dẫn:
const withNextIntl = createNextIntlPlugin('./src/i18n/request.ts');

/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    serverActions: true
  }
};

module.exports = withNextIntl(nextConfig);
