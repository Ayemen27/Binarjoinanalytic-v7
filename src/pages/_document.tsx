import Document, { Html, Head, Main, NextScript, DocumentContext } from 'next/document';

class MyDocument extends Document {
  static async getInitialProps(ctx: DocumentContext) {
    const initialProps = await Document.getInitialProps(ctx);
    return initialProps;
  }

  render() {
    const { locale } = this.props.__NEXT_DATA__;
    const isRTL = locale === 'ar';

    return (
      <Html 
        lang={locale} 
        dir={isRTL ? 'rtl' : 'ltr'}
        className="scroll-smooth"
      >
        <Head>
          {/* Meta tags for security and performance */}
          <meta charSet="utf-8" />
          <meta name="format-detection" content="telephone=no" />
          <meta name="theme-color" content="#0ea5e9" />
          
          {/* Security headers */}
          <meta httpEquiv="X-Content-Type-Options" content="nosniff" />
          <meta httpEquiv="Referrer-Policy" content="origin-when-cross-origin" />
          <meta httpEquiv="Permissions-Policy" content="camera=(), microphone=(), geolocation=()" />
          
          {/* Preconnect to external domains for performance */}
          <link rel="preconnect" href="https://fonts.googleapis.com" />
          <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="" />
          
          {/* Favicon */}
          <link rel="icon" href="/favicon.ico" />
          <link rel="apple-touch-icon" sizes="180x180" href="/apple-touch-icon.png" />
          <link rel="icon" type="image/png" sizes="32x32" href="/favicon-32x32.png" />
          <link rel="icon" type="image/png" sizes="16x16" href="/favicon-16x16.png" />
          <link rel="manifest" href="/site.webmanifest" />
          
          {/* PWA meta tags */}
          <meta name="application-name" content="Digital Platform" />
          <meta name="apple-mobile-web-app-capable" content="yes" />
          <meta name="apple-mobile-web-app-status-bar-style" content="default" />
          <meta name="apple-mobile-web-app-title" content="Digital Platform" />
          <meta name="mobile-web-app-capable" content="yes" />
          
          {/* Open Graph meta tags */}
          <meta property="og:type" content="website" />
          <meta property="og:site_name" content="Digital Platform" />
          <meta property="og:locale" content={locale} />
          
          {/* Twitter meta tags */}
          <meta name="twitter:card" content="summary_large_image" />
          <meta name="twitter:creator" content="@digitalplatform" />
          
          {/* DNS prefetch for better performance */}
          <link rel="dns-prefetch" href="//analytics.google.com" />
          <link rel="dns-prefetch" href="//www.googletagmanager.com" />
        </Head>
        <body className="antialiased bg-background text-foreground">
          {/* Prevent flash of unstyled content */}
          <script
            dangerouslySetInnerHTML={{
              __html: `
                try {
                  const theme = localStorage.getItem('theme') || 'light';
                  document.documentElement.classList.toggle('dark', theme === 'dark');
                } catch (e) {}
              `,
            }}
          />
          <Main />
          <NextScript />
        </body>
      </Html>
    );
  }
}

export default MyDocument;