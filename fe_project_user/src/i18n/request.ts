import { notFound } from 'next/navigation';
import { getRequestConfig } from 'next-intl/server';

const locales = ['en', 'vi'];

export default getRequestConfig(async ({ locale }) => {
  // Validate
  if (!locale || !locales.includes(locale)) notFound();

  try {
    return {
      locale,
      messages: (await import(`../messages/${locale}.json`)).default
    };
  } catch (error) {
    console.error(`❌ Missing translation file for locale: ${locale}`);
    notFound();
  }
});
