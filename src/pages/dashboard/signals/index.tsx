import React, { useState, useEffect } from 'react';
import { NextPage } from 'next';
import Head from 'next/head';
import { useRouter } from 'next/router';
import { useTranslation } from 'next-i18next';
import { serverSideTranslations } from 'next-i18next/serverSideTranslations';
import { GetStaticProps } from 'next';
import { motion } from 'framer-motion';
import { 
  Plus,
  Filter,
  Search,
  TrendingUp,
  TrendingDown,
  Activity,
  Target,
  BarChart3,
  Calendar
} from 'lucide-react';

import { Layout } from '@/components/organisms/Layout';
import { Button } from '@/components/atoms/Button';
import { Input } from '@/components/atoms/Input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/atoms/Card';
import { useAuth } from '@/providers/AuthProvider';
import { useToast } from '@/hooks/useToast';
import { DatabaseService, Signal } from '@/lib/database';

const SignalsPage: NextPage = () => {
  const { t } = useTranslation('dashboard');
  const router = useRouter();
  const { user, loading } = useAuth();
  const { toast } = useToast();

  const [signals, setSignals] = useState<Signal[]>([]);
  const [filteredSignals, setFilteredSignals] = useState<Signal[]>([]);
  const [dataLoading, setDataLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [directionFilter, setDirectionFilter] = useState('all');

  useEffect(() => {
    const loadSignals = async () => {
      if (!user) return;

      try {
        setDataLoading(true);
        const userSignals = await DatabaseService.getSignals(user.id, 100);
        setSignals(userSignals);
        setFilteredSignals(userSignals);
      } catch (error) {
        console.error('Error loading signals:', error);
        toast({
          title: 'خطأ في تحميل الإشارات',
          description: 'حدث خطأ أثناء تحميل الإشارات',
          variant: 'destructive',
        });
      } finally {
        setDataLoading(false);
      }
    };

    if (user) {
      loadSignals();
    }
  }, [user, toast]);

  useEffect(() => {
    let filtered = signals;

    if (searchTerm) {
      filtered = filtered.filter(signal =>
        signal.symbol.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    if (statusFilter !== 'all') {
      filtered = filtered.filter(signal => signal.status === statusFilter);
    }

    if (directionFilter !== 'all') {
      filtered = filtered.filter(signal => signal.direction === directionFilter);
    }

    setFilteredSignals(filtered);
  }, [signals, searchTerm, statusFilter, directionFilter]);

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

  const formatTime = (dateString: string) => {
    const now = new Date();
    const signalTime = new Date(dateString);
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

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!user) {
    router.push('/auth/signin');
    return null;
  }

  return (
    <>
      <Head>
        <title>الإشارات - منصة الخدمات الرقمية</title>
        <meta name="description" content="إدارة ومتابعة إشارات التداول الخاصة بك" />
      </Head>

      <Layout showSidebar>
        <div className="space-y-8">
          {/* Header */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4"
          >
            <div>
              <h1 className="text-3xl font-bold">الإشارات</h1>
              <p className="text-muted-foreground mt-1">
                إدارة ومتابعة إشارات التداول الخاصة بك
              </p>
            </div>
            <Button
              leftIcon={<Plus />}
              onClick={() => router.push('/dashboard/signals/new')}
            >
              إشارة جديدة
            </Button>
          </motion.div>

          {/* Filters */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
          >
            <Card variant="elevated">
              <CardContent className="p-6">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                  {/* Search */}
                  <div className="md:col-span-2">
                    <Input
                      placeholder="البحث في الإشارات..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      leftIcon={<Search className="h-4 w-4" />}
                    />
                  </div>

                  {/* Status Filter */}
                  <select
                    value={statusFilter}
                    onChange={(e) => setStatusFilter(e.target.value)}
                    className="w-full p-3 border border-border rounded-lg bg-background focus:ring-2 focus:ring-primary focus:border-transparent"
                  >
                    <option value="all">جميع الحالات</option>
                    <option value="pending">معلقة</option>
                    <option value="active">نشطة</option>
                    <option value="completed">مكتملة</option>
                    <option value="cancelled">ملغية</option>
                    <option value="expired">منتهية</option>
                  </select>

                  {/* Direction Filter */}
                  <select
                    value={directionFilter}
                    onChange={(e) => setDirectionFilter(e.target.value)}
                    className="w-full p-3 border border-border rounded-lg bg-background focus:ring-2 focus:ring-primary focus:border-transparent"
                  >
                    <option value="all">جميع الاتجاهات</option>
                    <option value="buy">شراء</option>
                    <option value="sell">بيع</option>
                  </select>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          {/* Signals List */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
          >
            {dataLoading ? (
              <div className="grid grid-cols-1 gap-4">
                {Array.from({ length: 5 }).map((_, index) => (
                  <Card key={index} variant="elevated">
                    <CardContent className="p-6">
                      <div className="animate-pulse">
                        <div className="flex items-center justify-between mb-4">
                          <div className="h-6 bg-muted rounded w-24"></div>
                          <div className="h-4 bg-muted rounded w-16"></div>
                        </div>
                        <div className="h-4 bg-muted rounded w-3/4 mb-2"></div>
                        <div className="h-4 bg-muted rounded w-1/2"></div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : filteredSignals.length > 0 ? (
              <div className="grid grid-cols-1 gap-4">
                {filteredSignals.map((signal, index) => (
                  <motion.div
                    key={signal.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6, delay: index * 0.1 }}
                  >
                    <Card 
                      variant="elevated" 
                      hoverable 
                      clickable
                      onClick={() => router.push(`/dashboard/signals/${signal.id}`)}
                    >
                      <CardContent className="p-6">
                        <div className="flex items-center justify-between mb-4">
                          <div className="flex items-center gap-4">
                            <div className={`w-3 h-3 rounded-full ${getStatusColor(signal.status)}`} />
                            <div>
                              <h3 className="text-lg font-semibold">{signal.symbol}</h3>
                              <p className="text-sm text-muted-foreground">
                                {signal.direction === 'buy' ? 'شراء' : 'بيع'} • {signal.timeframe} • {formatTime(signal.created_at)}
                              </p>
                            </div>
                          </div>
                          <div className="text-right">
                            <div className="text-sm text-muted-foreground">
                              {getStatusText(signal.status)}
                            </div>
                            {signal.confidence_score && (
                              <div className="text-sm font-medium">
                                ثقة: {signal.confidence_score}%
                              </div>
                            )}
                          </div>
                        </div>

                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                          <div>
                            <div className="text-sm text-muted-foreground">سعر الدخول</div>
                            <div className="font-semibold">
                              ${signal.entry_price?.toFixed(2) || 'N/A'}
                            </div>
                          </div>
                          {signal.target_price && (
                            <div>
                              <div className="text-sm text-muted-foreground">الهدف</div>
                              <div className="font-semibold text-emerald-600">
                                ${signal.target_price.toFixed(2)}
                              </div>
                            </div>
                          )}
                          {signal.stop_loss && (
                            <div>
                              <div className="text-sm text-muted-foreground">وقف الخسارة</div>
                              <div className="font-semibold text-red-600">
                                ${signal.stop_loss.toFixed(2)}
                              </div>
                            </div>
                          )}
                          {signal.profit_loss_percentage !== null && (
                            <div>
                              <div className="text-sm text-muted-foreground">الربح/الخسارة</div>
                              <div className={`font-semibold ${
                                signal.profit_loss_percentage >= 0 ? 'text-emerald-500' : 'text-red-500'
                              }`}>
                                {signal.profit_loss_percentage >= 0 ? '+' : ''}{signal.profit_loss_percentage.toFixed(2)}%
                              </div>
                            </div>
                          )}
                        </div>

                        {signal.ai_analysis?.factors && (
                          <div className="mt-4 pt-4 border-t border-border">
                            <div className="text-sm text-muted-foreground mb-2">عوامل AI:</div>
                            <div className="flex flex-wrap gap-2">
                              {signal.ai_analysis.factors.slice(0, 3).map((factor: string, idx: number) => (
                                <span key={idx} className="px-2 py-1 bg-primary/10 text-primary text-xs rounded">
                                  {factor}
                                </span>
                              ))}
                            </div>
                          </div>
                        )}
                      </CardContent>
                    </Card>
                  </motion.div>
                ))}
              </div>
            ) : (
              <Card variant="elevated">
                <CardContent className="text-center py-16">
                  <Activity className="h-16 w-16 mx-auto text-muted-foreground mb-4" />
                  <h3 className="text-xl font-semibold mb-2">لا توجد إشارات</h3>
                  <p className="text-muted-foreground mb-6">
                    {searchTerm || statusFilter !== 'all' || directionFilter !== 'all'
                      ? 'لا توجد إشارات تطابق الفلاتر المحددة'
                      : 'لم تقم بإنشاء أي إشارات بعد'}
                  </p>
                  <Button
                    leftIcon={<Plus />}
                    onClick={() => router.push('/dashboard/signals/new')}
                  >
                    إنشاء إشارة جديدة
                  </Button>
                </CardContent>
              </Card>
            )}
          </motion.div>
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

export default SignalsPage;