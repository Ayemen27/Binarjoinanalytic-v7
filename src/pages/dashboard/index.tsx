import React, { useState, useEffect } from 'react';
import { NextPage } from 'next';
import Head from 'next/head';
import { useRouter } from 'next/router';
import { useTranslation } from 'next-i18next';
import { serverSideTranslations } from 'next-i18next/serverSideTranslations';
import { GetStaticProps } from 'next';
import { motion } from 'framer-motion';
import { 
  TrendingUp, 
  DollarSign, 
  Users, 
  Activity,
  BarChart3,
  Bell,
  Settings,
  Plus,
  ArrowUpRight,
  ArrowDownRight,
  Target,
  Shield,
  Zap
} from 'lucide-react';

import { Layout } from '@/components/organisms/Layout';
import { Button } from '@/components/atoms/Button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/atoms/Card';
import { useAuth } from '@/providers/AuthProvider';
import { useToast } from '@/hooks/useToast';
import { DatabaseService, Signal } from '@/lib/database';

const DashboardPage: NextPage = () => {
  const { t } = useTranslation('dashboard');
  const router = useRouter();
  const { user, loading } = useAuth();
  const { toast } = useToast();

  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [signals, setSignals] = useState<Signal[]>([]);
  const [stats, setStats] = useState({
    totalSignals: 0,
    successfulSignals: 0,
    totalProfitLoss: 0,
    activeSignals: 0,
    successRate: 0
  });
  const [dataLoading, setDataLoading] = useState(true);

  // Redirect to signin if not authenticated
  useEffect(() => {
    if (!loading && !user) {
      router.push('/auth/signin');
    }
  }, [user, loading, router]);

  // Load user data
  useEffect(() => {
    const loadDashboardData = async () => {
      if (!user) return;

      try {
        setDataLoading(true);
        
        // Load user stats
        const userStats = await DatabaseService.getUserStats(user.id);
        setStats(userStats);

        // Load recent signals
        const recentSignals = await DatabaseService.getSignals(user.id, 5);
        setSignals(recentSignals);

      } catch (error) {
        console.error('Error loading dashboard data:', error);
        toast({
          title: 'خطأ في تحميل البيانات',
          description: 'حدث خطأ أثناء تحميل بيانات لوحة التحكم',
          variant: 'destructive',
        });
      } finally {
        setDataLoading(false);
      }
    };

    if (user) {
      loadDashboardData();
    }
  }, [user, toast]);

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  // Dashboard stats based on real data
  const dashboardStats = [
    {
      title: 'إجمالي الإشارات',
      value: stats.totalSignals.toString(),
      change: stats.totalSignals > 0 ? '+' + Math.round((stats.totalSignals / 30) * 100) + '%' : '0%',
      trend: stats.totalSignals > 0 ? 'up' : 'neutral',
      icon: TrendingUp,
      color: 'text-emerald-500',
      bgColor: 'bg-emerald-50 dark:bg-emerald-950'
    },
    {
      title: 'الربح/الخسارة',
      value: stats.totalProfitLoss >= 0 ? `+$${stats.totalProfitLoss.toFixed(2)}` : `-$${Math.abs(stats.totalProfitLoss).toFixed(2)}`,
      change: stats.totalProfitLoss >= 0 ? '+' + Math.round(stats.totalProfitLoss / 100) + '%' : Math.round(stats.totalProfitLoss / 100) + '%',
      trend: stats.totalProfitLoss >= 0 ? 'up' : 'down',
      icon: DollarSign,
      color: 'text-blue-500',
      bgColor: 'bg-blue-50 dark:bg-blue-950'
    },
    {
      title: 'معدل النجاح',
      value: `${stats.successRate}%`,
      change: stats.successRate >= 50 ? `+${stats.successRate - 50}%` : `${stats.successRate - 50}%`,
      trend: stats.successRate >= 50 ? 'up' : 'down',
      icon: Target,
      color: 'text-purple-500',
      bgColor: 'bg-purple-50 dark:bg-purple-950'
    },
    {
      title: 'الإشارات النشطة',
      value: stats.activeSignals.toString(),
      change: stats.activeSignals > 0 ? `+${stats.activeSignals}` : '0',
      trend: stats.activeSignals > 0 ? 'up' : 'neutral',
      icon: Activity,
      color: 'text-orange-500',
      bgColor: 'bg-orange-50 dark:bg-orange-950'
    }
  ];

  const formatSignalTime = (createdAt: string) => {
    const now = new Date();
    const signalTime = new Date(createdAt);
    const diffMs = now.getTime() - signalTime.getTime();
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    const diffDays = Math.floor(diffHours / 24);

    if (diffDays > 0) {
      return `${diffDays} ${diffDays === 1 ? 'يوم' : 'أيام'}`;
    } else if (diffHours > 0) {
      return `${diffHours} ${diffHours === 1 ? 'ساعة' : 'ساعات'}`;
    } else {
      const diffMinutes = Math.floor(diffMs / (1000 * 60));
      return `${diffMinutes} ${diffMinutes === 1 ? 'دقيقة' : 'دقائق'}`;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-emerald-500';
      case 'completed': return 'bg-blue-500';
      case 'pending': return 'bg-orange-500';
      case 'cancelled': return 'bg-red-500';
      case 'expired': return 'bg-gray-500';
      default: return 'bg-gray-500';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'active': return 'نشطة';
      case 'completed': return 'مكتملة';
      case 'pending': return 'معلقة';
      case 'cancelled': return 'ملغية';
      case 'expired': return 'منتهية';
      default: return status;
    }
  };

  return (
    <>
      <Head>
        <title>لوحة التحكم - منصة الخدمات الرقمية</title>
        <meta name="description" content="لوحة تحكم منصة الخدمات الرقمية المتكاملة" />
      </Head>

      <Layout
        showSidebar
        sidebarOpen={sidebarOpen}
        onSidebarToggle={() => setSidebarOpen(!sidebarOpen)}
      >
        <div className="space-y-8">
          {/* Welcome Section */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="bg-gradient-to-r from-primary to-accent rounded-2xl p-8 text-white relative overflow-hidden"
          >
            <div className="absolute inset-0 bg-black/10"></div>
            <div className="relative z-10">
              <h1 className="text-3xl font-bold mb-2">
                مرحباً {user.user_metadata?.full_name || user.email?.split('@')[0]}
              </h1>
              <p className="text-white/90 text-lg mb-6">
                مرحباً بك في لوحة التحكم الخاصة بك. تابع أداء إشاراتك وأحدث التحليلات.
              </p>
              <div className="flex gap-4">
                <Button 
                  variant="secondary" 
                  leftIcon={<Plus />}
                  onClick={() => router.push('/dashboard/signals/new')}
                >
                  إشارة جديدة
                </Button>
                <Button 
                  variant="ghost" 
                  leftIcon={<BarChart3 />}
                  onClick={() => router.push('/dashboard/analytics')}
                  className="text-white hover:bg-white/20"
                >
                  التحليلات
                </Button>
              </div>
            </div>
            <div className="absolute -top-4 -right-4 w-24 h-24 bg-white/10 rounded-full blur-xl"></div>
            <div className="absolute -bottom-8 -left-8 w-32 h-32 bg-white/5 rounded-full blur-2xl"></div>
          </motion.div>

          {/* Stats Grid */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6"
          >
            {dataLoading ? (
              // Loading skeleton
              Array.from({ length: 4 }).map((_, index) => (
                <Card key={index} variant="elevated">
                  <CardContent className="p-6">
                    <div className="animate-pulse">
                      <div className="h-4 bg-muted rounded w-3/4 mb-2"></div>
                      <div className="h-8 bg-muted rounded w-1/2 mb-2"></div>
                      <div className="h-4 bg-muted rounded w-2/3"></div>
                    </div>
                  </CardContent>
                </Card>
              ))
            ) : (
              dashboardStats.map((stat, index) => (
                <Card key={index} variant="elevated" hoverable>
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-muted-foreground">
                          {stat.title}
                        </p>
                        <p className="text-2xl font-bold mt-1">
                          {stat.value}
                        </p>
                        <div className="flex items-center mt-2">
                          {stat.trend === 'up' ? (
                            <ArrowUpRight className="h-4 w-4 text-emerald-500" />
                          ) : stat.trend === 'down' ? (
                            <ArrowDownRight className="h-4 w-4 text-red-500" />
                          ) : (
                            <div className="h-4 w-4" />
                          )}
                          <span className={`text-sm font-medium ${
                            stat.trend === 'up' ? 'text-emerald-500' : 
                            stat.trend === 'down' ? 'text-red-500' : 'text-muted-foreground'
                          }`}>
                            {stat.change}
                          </span>
                          <span className="text-xs text-muted-foreground mr-2">
                            هذا الشهر
                          </span>
                        </div>
                      </div>
                      <div className={`p-3 rounded-lg ${stat.bgColor}`}>
                        <stat.icon className={`h-6 w-6 ${stat.color}`} />
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))
            )}
          </motion.div>

          {/* Main Content Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Recent Signals */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="lg:col-span-2"
            >
              <Card variant="elevated">
                <CardHeader className="flex flex-row items-center justify-between">
                  <CardTitle>أحدث الإشارات</CardTitle>
                  <Button 
                    variant="ghost" 
                    size="sm"
                    onClick={() => router.push('/dashboard/signals')}
                  >
                    عرض الكل
                  </Button>
                </CardHeader>
                <CardContent>
                  {dataLoading ? (
                    <div className="space-y-4">
                      {Array.from({ length: 3 }).map((_, index) => (
                        <div key={index} className="animate-pulse p-4 bg-muted/50 rounded-lg">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-4">
                              <div className="w-3 h-3 bg-muted rounded-full"></div>
                              <div>
                                <div className="h-4 bg-muted rounded w-20 mb-1"></div>
                                <div className="h-3 bg-muted rounded w-16"></div>
                              </div>
                            </div>
                            <div className="h-4 bg-muted rounded w-16"></div>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : signals.length > 0 ? (
                    <div className="space-y-4">
                      {signals.map((signal) => (
                        <div 
                          key={signal.id}
                          className="flex items-center justify-between p-4 bg-muted/50 rounded-lg hover:bg-muted/70 transition-colors cursor-pointer"
                          onClick={() => router.push(`/dashboard/signals/${signal.id}`)}
                        >
                          <div className="flex items-center gap-4">
                            <div className={`w-3 h-3 rounded-full ${getStatusColor(signal.status)}`} />
                            <div>
                              <div className="font-semibold">{signal.symbol}</div>
                              <div className="text-sm text-muted-foreground">
                                {signal.direction === 'buy' ? 'شراء' : 'بيع'} • {formatSignalTime(signal.created_at)}
                              </div>
                            </div>
                          </div>
                          <div className="text-left">
                            <div className="font-semibold">
                              ${signal.entry_price?.toFixed(2) || 'N/A'}
                            </div>
                            <div className="text-sm text-muted-foreground">
                              {signal.confidence_score ? `ثقة: ${signal.confidence_score}%` : getStatusText(signal.status)}
                            </div>
                          </div>
                          {signal.profit_loss_percentage && (
                            <div className={`font-semibold ${
                              signal.profit_loss_percentage >= 0 ? 'text-emerald-500' : 'text-red-500'
                            }`}>
                              {signal.profit_loss_percentage >= 0 ? '+' : ''}{signal.profit_loss_percentage.toFixed(2)}%
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-8 text-muted-foreground">
                      <Activity className="h-12 w-12 mx-auto mb-4 opacity-50" />
                      <p className="text-lg font-medium mb-2">لا توجد إشارات بعد</p>
                      <p className="text-sm">ابدأ بإنشاء أول إشارة لك</p>
                      <Button 
                        className="mt-4" 
                        leftIcon={<Plus />}
                        onClick={() => router.push('/dashboard/signals/new')}
                      >
                        إنشاء إشارة
                      </Button>
                    </div>
                  )}
                </CardContent>
              </Card>
            </motion.div>

            {/* Quick Actions */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6, delay: 0.3 }}
              className="space-y-6"
            >
              {/* Quick Actions Card */}
              <Card variant="elevated">
                <CardHeader>
                  <CardTitle>إجراءات سريعة</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <Button 
                    fullWidth 
                    leftIcon={<Zap />}
                    onClick={() => router.push('/dashboard/signals/generate')}
                  >
                    توليد إشارة ذكية
                  </Button>
                  <Button 
                    variant="outline" 
                    fullWidth 
                    leftIcon={<BarChart3 />}
                    onClick={() => router.push('/dashboard/analytics')}
                  >
                    تحليل المحفظة
                  </Button>
                  <Button 
                    variant="outline" 
                    fullWidth 
                    leftIcon={<Bell />}
                    onClick={() => router.push('/dashboard/notifications')}
                  >
                    إعدادات التنبيهات
                  </Button>
                  <Button 
                    variant="outline" 
                    fullWidth 
                    leftIcon={<Settings />}
                    onClick={() => router.push('/dashboard/settings')}
                  >
                    الإعدادات
                  </Button>
                </CardContent>
              </Card>

              {/* Market Status */}
              <Card variant="elevated">
                <CardHeader>
                  <CardTitle>حالة السوق</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex justify-between items-center">
                      <span className="text-sm">BTC/USDT</span>
                      <div className="text-left">
                        <div className="font-semibold">$42,350</div>
                        <div className="text-xs text-emerald-500">+2.4%</div>
                      </div>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm">ETH/USDT</span>
                      <div className="text-left">
                        <div className="font-semibold">$2,580</div>
                        <div className="text-xs text-red-500">-1.2%</div>
                      </div>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm">ADA/USDT</span>
                      <div className="text-left">
                        <div className="font-semibold">$0.48</div>
                        <div className="text-xs text-emerald-500">+5.1%</div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          </div>
        </div>
      </Layout>
    </>
  );
};

export const getStaticProps: GetStaticProps = async ({ locale }) => {
  return {
    props: {
      ...(await serverSideTranslations(locale ?? 'ar', ['dashboard', 'common', 'navigation'])),
    },
  };
};

export default DashboardPage;