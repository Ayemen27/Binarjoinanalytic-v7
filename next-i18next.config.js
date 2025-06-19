module.exports = {
  i18n: {
    defaultLocale: 'ar',
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
    default: ['ar', 'en'],
  },
  localePath: './public/locales',
  reloadOnPrerender: process.env.NODE_ENV === 'development',
};