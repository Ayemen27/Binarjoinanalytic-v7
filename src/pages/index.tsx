import type { NextPage } from 'next';
import Head from 'next/head';
import { useTranslation } from 'next-i18next';
import { serverSideTranslations } from 'next-i18next/serverSideTranslations';
import { GetStaticProps } from 'next';

import { useRouter } from 'next/router';
import { useAuth } from '@/hooks/useAuth';
import { Layout } from '@/components/organisms/Layout';
import { Hero } from '@/components/organisms/Hero';
import { Features } from '@/components/organisms/Features';
import { Statistics } from '@/components/organisms/Statistics';
import { CTA } from '@/components/organisms/CTA';
import { Button } from '@/components/atoms/Button';
import { useEffect } from 'react';

const HomePage: NextPage = () => {
  const { t } = useTranslation('common');
  const { user } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (user) {
      router.push('/dashboard');
    }
  }, [user, router]);

  return (
    <>
      <Head>
        <title>{t('site.title')}</title>
        <meta name="description" content={t('site.description')} />
        <meta name="keywords" content={t('site.keywords')} />
        <meta property="og:title" content={t('site.title')} />
        <meta property="og:description" content={t('site.description')} />
        <meta property="og:image" content="/og-image.png" />
        <meta property="og:url" content="https://platform.com" />
        <meta name="twitter:title" content={t('site.title')} />
        <meta name="twitter:description" content={t('site.description')} />
        <meta name="twitter:image" content="/og-image.png" />
        <link rel="canonical" href="https://platform.com" />
      </Head>

      <Layout>
        <main className="min-h-screen">
          <Hero />
          <Features />
          <Statistics />
          <CTA />
          
          <section className="py-16 bg-gray-50 dark:bg-gray-900">
            <div className="container mx-auto px-4 text-center">
              <h2 className="text-3xl font-bold mb-8 text-gray-900 dark:text-white">
                ابدأ رحلتك في التداول الذكي
              </h2>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Button 
                  onClick={() => router.push('/auth/login')}
                  size="lg"
                  className="bg-blue-600 hover:bg-blue-700"
                >
                  تسجيل الدخول
                </Button>
                <Button 
                  onClick={() => router.push('/auth/register')}
                  variant="outline"
                  size="lg"
                >
                  إنشاء حساب جديد
                </Button>
              </div>
            </div>
          </section>
        </main>
      </Layout>
    </>
  );
};

export const getStaticProps: GetStaticProps = async ({ locale }) => {
  return {
    props: {
      ...(await serverSideTranslations(locale ?? 'ar', ['common', 'navigation', 'auth'])),
    },
  };
};

export default HomePage;