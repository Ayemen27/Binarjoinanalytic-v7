import React from 'react';
import type { NextPage } from 'next';
import Head from 'next/head';
import { useTranslation } from 'next-i18next';
import { serverSideTranslations } from 'next-i18next/serverSideTranslations';
import { GetStaticProps } from 'next';
import { 
  TrendingUp, 
  Activity, 
  DollarSign, 
  Users,
  BarChart3,
  Zap,
  Shield,
  Bell
} from 'lucide-react';

import { Layout } from '@/components/organisms/Layout';
import { ProtectedRoute } from '@/components/organisms/ProtectedRoute';
import { Card } from '@/components/atoms/Card';
import { Button } from '@/components/atoms/Button';
import { useAuth } from '@/providers/AuthProvider';

const DashboardPage: NextPage = () => {
  const { t } = useTranslation('common');
  const { user } = useAuth();

  const stats = [
    {
      title: 'إجمالي الإشارات',
      value: '156',
      change: '+12%',
      icon: Activity,
      color: 'text-primary',
      bgColor: 'bg-primary/10',
    },
    {
      title: 'نسبة النجاح',
      value: '87.5%',
      change: '+2.4%',
      icon: TrendingUp,
      color: 'text-success',
      bgColor: 'bg-success/10',
    },
    {
      title: 'الربح الإجمالي',
      value: '$2,847',
      change: '+18.2%',
      icon: DollarSign,
      color: 'text-warning',
      bgColor: 'bg-warning/10',
    },
    {
      title: 'الإشارات النشطة',
      value: '12',
      change: '+3',
      icon: Zap,
      color: 'text-accent',
      bgColor: 'bg-accent/10',
    },
  ];

  const quickActions = [
    {
      title: 'طلب إشارة جديدة',
      description: 'احصل على إشارة تداول ذكية',
      icon: TrendingUp,
      href: '/signals/generate',
      color: 'primary',
    },
    {
      title: 'عرض السجل',
      description: 'راجع سجل الإشارات السابقة',
      icon: BarChart3,
      href: '/signals/history',
      color: 'secondary',
    },
    {
      title: 'الإعدادات',
      description: 'تخصيص تفضيلات التداول',
      icon: Shield,
      href: '/dashboard/settings',
      color: 'outline',
    },
  ];

  return (
    <ProtectedRoute>
      <Head>
        <title>لوحة التحكم - منصة الإشارات</title>
        <meta name="description" content="لوحة التحكم الشخصية لمتابعة الإشارات والأداء" />
      </Head>

      <Layout showSidebar={true}>
        <div className="p-6 space-y-8">
          {/* Welcome Section */}
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-foreground">
                مرحباً، {user?.user_metadata?.full_name || 'المتداول'}
              </h1>
              <p className="text-muted-foreground mt-2">
                إليك نظرة عامة على أداء التداول اليوم
              </p>
            </div>
            
            <div className="flex items-center space-x-4 space-x-reverse">
              <Button variant="outline" size="icon">
                <Bell className="w-4 h-4" />
              </Button>
              <Button onClick={() => window.location.href = '/signals/generate'}>
                طلب إشارة جديدة
              </Button>
            </div>
          </div>

          {/* Stats Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {stats.map((stat, index) => (
              <Card key={index} className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">
                      {stat.title}
                    </p>
                    <p className="text-2xl font-bold text-foreground mt-2">
                      {stat.value}
                    </p>
                    <p className="text-sm text-success mt-1">
                      {stat.change} من الأسبوع الماضي
                    </p>
                  </div>
                  <div className={`p-3 rounded-full ${stat.bgColor}`}>
                    <stat.icon className={`w-6 h-6 ${stat.color}`} />
                  </div>
                </div>
              </Card>
            ))}
          </div>

          {/* Quick Actions */}
          <div>
            <h2 className="text-xl font-semibold text-foreground mb-4">
              إجراءات سريعة
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {quickActions.map((action, index) => (
                <Card key={index} className="p-6 hover:shadow-md transition-shadow cursor-pointer">
                  <div className="flex items-start space-x-4 space-x-reverse">
                    <div className="p-2 bg-primary/10 rounded-lg">
                      <action.icon className="w-6 h-6 text-primary" />
                    </div>
                    <div className="flex-1">
                      <h3 className="font-semibold text-foreground mb-2">
                        {action.title}
                      </h3>
                      <p className="text-sm text-muted-foreground mb-4">
                        {action.description}
                      </p>
                      <Button 
                        variant={action.color as any} 
                        size="sm"
                        onClick={() => window.location.href = action.href}
                      >
                        الانتقال
                      </Button>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          </div>

          {/* Recent Activity Placeholder */}
          <div>
            <h2 className="text-xl font-semibold text-foreground mb-4">
              النشاط الأخير
            </h2>
            <Card className="p-8 text-center">
              <Activity className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-medium text-foreground mb-2">
                لا توجد أنشطة حديثة
              </h3>
              <p className="text-muted-foreground mb-4">
                ابدأ بطلب أول إشارة تداول لك لرؤية النشاط هنا
              </p>
              <Button onClick={() => window.location.href = '/signals/generate'}>
                طلب إشارة
              </Button>
            </Card>
          </div>
        </div>
      </Layout>
    </ProtectedRoute>
  );
};

export const getStaticProps: GetStaticProps = async ({ locale }) => {
  return {
    props: {
      ...(await serverSideTranslations(locale ?? 'ar', ['common', 'navigation'])),
    },
  };
};

export default DashboardPage;