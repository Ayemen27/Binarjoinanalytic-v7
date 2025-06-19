import type { NextPage } from 'next';
import Head from 'next/head';
import { useTranslation } from 'next-i18next';
import { serverSideTranslations } from 'next-i18next/serverSideTranslations';
import { GetStaticProps } from 'next';

import { Layout } from '@/components/organisms/Layout';
import { Hero } from '@/components/organisms/Hero';
import { Features } from '@/components/organisms/Features';
import { Statistics } from '@/components/organisms/Statistics';
import { CTA } from '@/components/organisms/CTA';

const HomePage: NextPage = () => {
  const { t } = useTranslation('common');

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
          {/* Hero Section */}
          <Hero />
          
          {/* Features Section */}
          <Features />
          
          {/* Statistics Section */}
          <Statistics />
          
          {/* Call to Action Section */}
          <CTA />
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