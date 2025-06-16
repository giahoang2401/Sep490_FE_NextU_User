// next-intl.config.js
module.exports = {
  locales: ['en', 'vi'],         // Các ngôn ngữ hỗ trợ
  defaultLocale: 'en',           // Ngôn ngữ mặc định
  localePrefix: 'always'         // URL phải có /en hoặc /vi (nếu muốn / thì dùng 'as-needed')
};
