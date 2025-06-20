# دليل النشر والتشغيل

## نظرة عامة

هذا الدليل يوضح كيفية نشر منصة الخدمات الرقمية المتكاملة في بيئات مختلفة من التطوير إلى الإنتاج.

## 📋 المتطلبات الأساسية

### Software Requirements
- **Node.js** 18.0.0 أو أحدث
- **npm** 8.0.0 أو أحدث
- **Git** للتحكم في الإصدارات
- **PostgreSQL** 15+ (للبيئة المحلية)

### Cloud Services
- **Supabase** لقاعدة البيانات والمصادقة
- **Vercel** أو **Netlify** للاستضافة
- **Cloudflare** للـ CDN (اختياري)

## 🛠️ إعداد البيئة المحلية

### 1. استنساخ المشروع
```bash
git clone https://github.com/your-org/digital-platform.git
cd digital-platform
```

### 2. تثبيت Dependencies
```bash
npm install
```

### 3. إعداد متغيرات البيئة
```bash
cp .env.example .env.local
```

تحديث ملف `.env.local`:
```env
# Database & Supabase
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key

# Database URLs
DATABASE_URL=your_database_url
PGHOST=your_db_host
PGDATABASE=your_db_name
PGUSER=your_db_user
PGPASSWORD=your_db_password
PGPORT=5432

# Application
NEXT_PUBLIC_APP_URL=http://localhost:3000
NEXTAUTH_SECRET=your_random_secret_key
NEXTAUTH_URL=http://localhost:3000

# Optional APIs
OPENAI_API_KEY=your_openai_key
STRIPE_SECRET_KEY=your_stripe_key
```

### 4. تشغيل الخادم المحلي
```bash
npm run dev
```

الموقع سيكون متاح على: `http://localhost:3000`

## 🗄️ إعداد قاعدة البيانات

### Supabase Setup

1. **إنشاء مشروع جديد** في [Supabase](https://supabase.com)

2. **تشغيل Migration Scripts**:
```sql
-- في Supabase SQL Editor
-- تشغيل جميع الـ SQL scripts الموجودة في supabase/migrations/
```

3. **إعداد Row Level Security (RLS)**:
```sql
-- تفعيل RLS على الجداول
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE signals ENABLE ROW LEVEL SECURITY;
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;

-- إنشاء Policies
CREATE POLICY "Users can view own data" ON users
FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update own data" ON users
FOR UPDATE USING (auth.uid() = id);
```

### Local PostgreSQL (البديل)
```bash
# تثبيت PostgreSQL
sudo apt-get install postgresql postgresql-contrib

# إنشاء قاعدة بيانات
sudo -u postgres createdb digital_platform

# تشغيل migrations
psql -d digital_platform -f supabase/migrations/001_initial.sql
```

## 🚀 النشر على Vercel

### 1. إعداد Vercel CLI
```bash
npm install -g vercel
vercel login
```

### 2. ربط المشروع
```bash
vercel --prod
```

### 3. إعداد Environment Variables
في لوحة تحكم Vercel، أضف المتغيرات التالية:

```
NEXT_PUBLIC_SUPABASE_URL
NEXT_PUBLIC_SUPABASE_ANON_KEY
SUPABASE_SERVICE_ROLE_KEY
DATABASE_URL
NEXTAUTH_SECRET
NEXTAUTH_URL
```

### 4. إعداد Custom Domain (اختياري)
```bash
vercel domains add your-domain.com
```

## 🐳 النشر باستخدام Docker

### Dockerfile
```dockerfile
FROM node:18-alpine AS deps
RUN apk add --no-cache libc6-compat
WORKDIR /app
COPY package.json package-lock.json ./
RUN npm ci --only=production

FROM node:18-alpine AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .
RUN npm run build

FROM node:18-alpine AS runner
WORKDIR /app
ENV NODE_ENV production
RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

COPY --from=builder /app/public ./public
COPY --from=builder /app/.next/standalone ./
COPY --from=builder /app/.next/static ./.next/static

USER nextjs
EXPOSE 3000
ENV PORT 3000

CMD ["node", "server.js"]
```

### Docker Compose
```yaml
version: '3.8'
services:
  app:
    build: .
    ports:
      - "3000:3000"
    environment:
      - NODE_ENV=production
      - NEXT_PUBLIC_SUPABASE_URL=${SUPABASE_URL}
      - NEXT_PUBLIC_SUPABASE_ANON_KEY=${SUPABASE_ANON_KEY}
      - DATABASE_URL=${DATABASE_URL}
    depends_on:
      - postgres
      - redis

  postgres:
    image: postgres:15
    environment:
      POSTGRES_DB: digital_platform
      POSTGRES_USER: postgres
      POSTGRES_PASSWORD: password
    volumes:
      - postgres_data:/var/lib/postgresql/data
    ports:
      - "5432:5432"

  redis:
    image: redis:7-alpine
    ports:
      - "6379:6379"

volumes:
  postgres_data:
```

### تشغيل Docker
```bash
# البناء والتشغيل
docker-compose up --build -d

# مراقبة الـ logs
docker-compose logs -f app
```

## ☁️ النشر على Cloud Platforms

### AWS (using Amplify)
```bash
# تثبيت Amplify CLI
npm install -g @aws-amplify/cli

# إعداد المشروع
amplify init
amplify add hosting
amplify publish
```

### Google Cloud (using Cloud Run)
```bash
# بناء الصورة
gcloud builds submit --tag gcr.io/PROJECT_ID/digital-platform

# نشر على Cloud Run
gcloud run deploy --image gcr.io/PROJECT_ID/digital-platform --platform managed
```

### Azure (using Static Web Apps)
```bash
# إعداد Azure CLI
az login

# نشر Static Web App
az staticwebapp create \
    --name digital-platform \
    --resource-group myResourceGroup \
    --source https://github.com/your-org/digital-platform \
    --location "West US 2" \
    --branch main \
    --app-location "/" \
    --output-location ".next"
```

## 🔧 إعدادات الإنتاج

### Next.js Configuration
```javascript
// next.config.js
/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'standalone',
  poweredByHeader: false,
  
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          {
            key: 'X-Frame-Options',
            value: 'DENY'
          },
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff'
          },
          {
            key: 'Referrer-Policy',
            value: 'strict-origin-when-cross-origin'
          }
        ]
      }
    ];
  },

  async redirects() {
    return [
      {
        source: '/admin',
        destination: '/admin/users',
        permanent: false
      }
    ];
  }
};

module.exports = nextConfig;
```

### Performance Optimization
```javascript
// في _app.tsx
import dynamic from 'next/dynamic';

// تحميل مكونات ثقيلة بشكل تدريجي
const DashboardChart = dynamic(() => import('@/components/DashboardChart'), {
  ssr: false,
  loading: () => <ChartSkeleton />
});

// تحسين الخطوط
import { Inter } from 'next/font/google';
const inter = Inter({ subsets: ['latin'], display: 'swap' });
```

## 📊 Monitoring & Analytics

### إعداد Sentry
```bash
npm install @sentry/nextjs
```

```javascript
// sentry.client.config.js
import * as Sentry from '@sentry/nextjs';

Sentry.init({
  dsn: process.env.NEXT_PUBLIC_SENTRY_DSN,
  environment: process.env.NODE_ENV,
  tracesSampleRate: 1.0,
});
```

### Google Analytics
```javascript
// في _app.tsx
import { GoogleAnalytics } from '@next/third-parties/google';

export default function App({ Component, pageProps }) {
  return (
    <>
      <Component {...pageProps} />
      <GoogleAnalytics gaId="GA_MEASUREMENT_ID" />
    </>
  );
}
```

## 🔒 Security Checklist

### Pre-deployment Security
- [ ] تحديث جميع dependencies
- [ ] فحص vulnerabilities: `npm audit`
- [ ] تأكيد عدم وجود secrets في الكود
- [ ] تفعيل HTTPS في الإنتاج
- [ ] إعداد CSP headers
- [ ] تفعيل Rate limiting
- [ ] فحص OWASP Top 10

### Production Security
```javascript
// في next.config.js
const securityHeaders = [
  {
    key: 'Strict-Transport-Security',
    value: 'max-age=31536000; includeSubDomains; preload'
  },
  {
    key: 'Content-Security-Policy',
    value: "default-src 'self'; script-src 'self' 'unsafe-inline' 'unsafe-eval'"
  }
];
```

## 🔄 CI/CD Pipeline

### GitHub Actions
```yaml
# .github/workflows/deploy.yml
name: Deploy to Production

on:
  push:
    branches: [main]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: '18'
      - run: npm ci
      - run: npm run test
      - run: npm run lint
      - run: npm run build

  deploy:
    needs: test
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: amondnet/vercel-action@v20
        with:
          vercel-token: ${{ secrets.VERCEL_TOKEN }}
          vercel-org-id: ${{ secrets.ORG_ID }}
          vercel-project-id: ${{ secrets.PROJECT_ID }}
          vercel-args: '--prod'
```

## 🚨 Troubleshooting

### مشاكل شائعة وحلولها

#### خطأ في البناء
```bash
# تنظيف cache
npm run clean
rm -rf .next
rm -rf node_modules
npm install
```

#### مشاكل قاعدة البيانات
```bash
# فحص الاتصال
psql $DATABASE_URL -c "SELECT 1"

# إعادة تشغيل migrations
npm run db:reset
npm run db:migrate
```

#### مشاكل الذاكرة
```javascript
// في next.config.js
module.exports = {
  experimental: {
    workerThreads: false,
    cpus: 1
  }
};
```

## 📞 الدعم والمساعدة

### Resources
- **Documentation**: `/docs`
- **API Reference**: `/docs/API_DOCUMENTATION.md`
- **Issue Tracker**: GitHub Issues
- **Community**: Discord Server

### Emergency Contacts
- **Technical Lead**: technical@platform.com
- **DevOps Team**: devops@platform.com
- **24/7 Support**: support@platform.com

---

**آخر تحديث**: ديسمبر 2024  
**الإصدار**: 1.0.0  
**المراجعة**: فريق DevOps