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
import MarketOverview from '@/components/organisms/MarketOverview';
import MarketOverview from '@/components/organisms/MarketOverview';

const HomePage: NextPage = () => {
  const { t } = useTranslation('common');

  return (
    <>
      <Head>
        <title>AI Signals Pro - منصة توليد إشارات التداول بالذكاء الاصطناعي</title>
        <meta name="description" content="منصة احترافية عالمية لتوليد إشارات التداول عالية الدقة باستخدام الذكاء الاصطناعي المتقدم والتحليل الفني الذكي" />
        <meta name="keywords" content="إشارات التداول, الذكاء الاصطناعي, تحليل فني, إشارات فوركس, توليد إشارات, AI trading signals" />
        <meta property="og:title" content="AI Signals Pro - منصة توليد إشارات التداول" />
        <meta property="og:description" content="منصة احترافية عالمية لتوليد إشارات التداول عالية الدقة باستخدام الذكاء الاصطناعي المتقدم" />
        <meta property="og:image" content="/og-image.png" />
        <meta property="og:url" content="https://aisignals.pro" />
        <meta name="twitter:title" content="AI Signals Pro - إشارات التداول الذكية" />
        <meta name="twitter:description" content="منصة توليد إشارات التداول المدعومة بالذكاء الاصطناعي مع دقة استثنائية" />
        <meta name="twitter:image" content="/og-image.png" />
        <link rel="canonical" href="https://aisignals.pro" />
        
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "SoftwareApplication",
              "name": "AI Signals Pro",
              "applicationCategory": "FinanceApplication",
              "description": "Professional AI-powered trading signals generation platform",
              "operatingSystem": "Web Browser"
            })
          }}
        />
      </Head>

      <Layout>
        <main className="min-h-screen">
          {/* Hero Section */}
          <Hero />
          
          {/* Market Overview */}
          <MarketOverview />
          
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