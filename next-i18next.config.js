module.exports = {
  i18n: {
    defaultLocale: 'en',
    locales: ['ar', 'en'],
    fallbackLng: 'en',
    interpolation: {
      escapeValue: false,
    },
    detection: {
      order: ['localStorage', 'navigator', 'htmlTag'],
      caches: ['localStorage'],
    },
  },
  fallbackLng: {
    'ar-SA': ['ar', 'en'],
    'en-US': ['en', 'ar'],
    default: ['en', 'ar'],
  },
  localePath: './public/locales',
  reloadOnPrerender: process.env.NODE_ENV === 'development',
};