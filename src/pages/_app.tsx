import type { AppProps } from 'next/app';
import { Inter, IBM_Plex_Sans_Arabic } from 'next/font/google';
import { appWithTranslation } from 'next-i18next';
import { QueryClientProvider } from '@tanstack/react-query';


import { AuthProvider } from '@/providers/AuthProvider';
import { ThemeProvider } from '@/providers/ThemeProvider';
import { ToastProvider } from '@/providers/ToastProvider';
import { queryClient } from '@/lib/queryClient';
import '@/styles/globals.css';

// Font configurations
const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
  display: 'swap',
});

const ibmPlexArabic = IBM_Plex_Sans_Arabic({
  subsets: ['arabic'],
  weight: ['100', '200', '300', '400', '500', '600', '700'],
  variable: '--font-ibm-plex-arabic',
  display: 'swap',
});

function MyApp({ Component, pageProps }: AppProps) {
  return (
    <div className={`${inter.variable} ${ibmPlexArabic.variable}`}>
      <QueryClientProvider client={queryClient}>
        <ThemeProvider>
          <AuthProvider>
            <ToastProvider>
              <Component {...pageProps} />
            </ToastProvider>
          </AuthProvider>
        </ThemeProvider>

      </QueryClientProvider>
    </div>
  );
}

export default appWithTranslation(MyApp);