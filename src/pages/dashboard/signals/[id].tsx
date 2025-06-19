import React, { useState, useEffect } from 'react';
import { NextPage } from 'next';
import Head from 'next/head';
import { useRouter } from 'next/router';
import { serverSideTranslations } from 'next-i18next/serverSideTranslations';
import { GetServerSideProps } from 'next';
import { motion } from 'framer-motion';
import { 
  ArrowLeft,
  TrendingUp,
  Target,
  Shield,
  Clock,
  BarChart3,
  DollarSign,
  Activity,
  AlertCircle,
  CheckCircle,
  XCircle,
  Pause
} from 'lucide-react';

import { Layout } from '@/components/organisms/Layout';
import { Button } from '@/components/atoms/Button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/atoms/Card';
import { useAuth } from '@/providers/AuthProvider';
import { useToast } from '@/hooks/useToast';
import { DatabaseService, Signal } from '@/lib/database';

const SignalDetailsPage: NextPage = () => {
  const router = useRouter();
  const { id } = router.query;
  const { user, loading } = useAuth();
  const { toast } = useToast();

  const [signal, setSignal] = useState<Signal | null>(null);
  const [dataLoading, setDataLoading] = useState(true);

  useEffect(() => {
    const loadSignal = async () => {
      if (!id || typeof id !== 'string') return;

      try {
        setDataLoading(true);
        const signalData = await DatabaseService.getSignal(id);
        setSignal(signalData);
      } catch (error) {
        console.error('Error loading signal:', error);
        toast({
          title: 'خطأ في تحميل الإشارة',
          description: 'حدث خطأ أثناء تحميل تفاصيل الإشارة',
          variant: 'destructive',
        });
      } finally {
        setDataLoading(false);
      }
    };

    if (user) {
      loadSignal();
    }
  }, [id, user, toast]);

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'active': return <Activity className="h-5 w-5 text-emerald-500" />;
      case 'completed': return <CheckCircle className="h-5 w-5 text-blue-500" />;
      case 'pending': return <Pause className="h-5 w-5 text-orange-500" />;
      case 'cancelled': return <XCircle className="h-5 w-5 text-red-500" />;
      case 'expired': return <AlertCircle className="h-5 w-5 text-gray-500" />;
      default: return <Activity className="h-5 w-5" />;
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

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900 dark:text-emerald-200';
      case 'completed': return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200';
      case 'pending': return 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200';
      case 'cancelled': return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200';
      case 'expired': return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString('ar-SA', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (loading || dataLoading) {
    return (
      <Layout showSidebar>
        <div className="min-h-screen flex items-center justify-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary"></div>
        </div>
      </Layout>
    );
  }

  if (!user) {
    router.push('/auth/signin');
    return null;
  }

  if (!signal) {
    return (
      <Layout showSidebar>
        <div className="text-center py-16">
          <AlertCircle className="h-16 w-16 mx-auto text-muted-foreground mb-4" />
          <h1 className="text-2xl font-bold mb-2">الإشارة غير موجودة</h1>
          <p className="text-muted-foreground mb-6">لم يتم العثور على الإشارة المطلوبة</p>
          <Button onClick={() => router.push('/dashboard/signals')}>
            العودة للإشارات
          </Button>
        </div>
      </Layout>
    );
  }

  return (
    <>
      <Head>
        <title>تفاصيل الإشارة - {signal.symbol} - منصة الخدمات الرقمية</title>
        <meta name="description" content={`تفاصيل إشارة ${signal.direction} لـ ${signal.symbol}`} />
      </Head>

      <Layout showSidebar>
        <div className="space-y-8">
          {/* Header */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="flex items-center justify-between"
          >
            <div className="flex items-center gap-4">
              <Button
                variant="ghost"
                size="sm"
                leftIcon={<ArrowLeft />}
                onClick={() => router.back()}
              >
                العودة
              </Button>
              <div>
                <h1 className="text-3xl font-bold flex items-center gap-3">
                  {signal.symbol}
                  <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(signal.status)}`}>
                    {getStatusIcon(signal.status)}
                    {getStatusText(signal.status)}
                  </span>
                </h1>
                <p className="text-muted-foreground mt-1">
                  إشارة {signal.direction === 'buy' ? 'شراء' : 'بيع'} • {signal.timeframe} • {formatDate(signal.created_at)}
                </p>
              </div>
            </div>
          </motion.div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Main Content */}
            <div className="lg:col-span-2 space-y-6">
              {/* Price Information */}
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.6, delay: 0.1 }}
              >
                <Card variant="elevated">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <DollarSign className="h-5 w-5 text-primary" />
                      معلومات الأسعار
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                      <div className="text-center p-4 bg-muted/50 rounded-lg">
                        <div className="text-sm text-muted-foreground mb-1">سعر الدخول</div>
                        <div className="text-2xl font-bold">
                          ${signal.entry_price?.toFixed(8) || 'N/A'}
                        </div>
                      </div>
                      {signal.target_price && (
                        <div className="text-center p-4 bg-emerald-50 dark:bg-emerald-950 rounded-lg">
                          <div className="text-sm text-emerald-600 dark:text-emerald-400 mb-1">الهدف</div>
                          <div className="text-2xl font-bold text-emerald-600 dark:text-emerald-400">
                            ${signal.target_price.toFixed(8)}
                          </div>
                        </div>
                      )}
                      {signal.stop_loss && (
                        <div className="text-center p-4 bg-red-50 dark:bg-red-950 rounded-lg">
                          <div className="text-sm text-red-600 dark:text-red-400 mb-1">وقف الخسارة</div>
                          <div className="text-2xl font-bold text-red-600 dark:text-red-400">
                            ${signal.stop_loss.toFixed(8)}
                          </div>
                        </div>
                      )}
                    </div>

                    {signal.profit_loss_percentage !== null && (
                      <div className="mt-6 p-4 bg-gradient-to-r from-primary/10 to-accent/10 rounded-lg">
                        <div className="flex items-center justify-between">
                          <div>
                            <div className="text-sm text-muted-foreground">الربح/الخسارة</div>
                            <div className={`text-2xl font-bold ${
                              signal.profit_loss_percentage >= 0 ? 'text-emerald-500' : 'text-red-500'
                            }`}>
                              {signal.profit_loss_percentage >= 0 ? '+' : ''}{signal.profit_loss_percentage.toFixed(2)}%
                            </div>
                          </div>
                          {signal.result_price && (
                            <div className="text-left">
                              <div className="text-sm text-muted-foreground">سعر الإغلاق</div>
                              <div className="text-xl font-semibold">
                                ${signal.result_price.toFixed(8)}
                              </div>
                            </div>
                          )}
                        </div>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </motion.div>

              {/* Technical Analysis */}
              {signal.technical_analysis && (
                <motion.div
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.6, delay: 0.2 }}
                >
                  <Card variant="elevated">
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <BarChart3 className="h-5 w-5 text-primary" />
                        التحليل الفني
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        {signal.technical_analysis.rsi && (
                          <div className="text-center p-3 bg-muted/50 rounded-lg">
                            <div className="text-sm text-muted-foreground">RSI</div>
                            <div className="text-lg font-semibold">{signal.technical_analysis.rsi}</div>
                          </div>
                        )}
                        {signal.technical_analysis.macd && (
                          <div className="text-center p-3 bg-muted/50 rounded-lg">
                            <div className="text-sm text-muted-foreground">MACD</div>
                            <div className={`text-lg font-semibold capitalize ${
                              signal.technical_analysis.macd === 'bullish' ? 'text-emerald-500' : 'text-red-500'
                            }`}>
                              {signal.technical_analysis.macd === 'bullish' ? 'صاعد' : 'هابط'}
                            </div>
                          </div>
                        )}
                        {signal.technical_analysis.support && (
                          <div className="text-center p-3 bg-muted/50 rounded-lg">
                            <div className="text-sm text-muted-foreground">الدعم</div>
                            <div className="text-lg font-semibold">${signal.technical_analysis.support.toFixed(2)}</div>
                          </div>
                        )}
                        {signal.technical_analysis.resistance && (
                          <div className="text-center p-3 bg-muted/50 rounded-lg">
                            <div className="text-sm text-muted-foreground">المقاومة</div>
                            <div className="text-lg font-semibold">${signal.technical_analysis.resistance.toFixed(2)}</div>
                          </div>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              )}
            </div>

            {/* Sidebar */}
            <div className="space-y-6">
              {/* Signal Info */}
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.6, delay: 0.3 }}
              >
                <Card variant="elevated">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Target className="h-5 w-5 text-primary" />
                      معلومات الإشارة
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">الاتجاه</span>
                      <span className={`font-semibold ${
                        signal.direction === 'buy' ? 'text-emerald-500' : 'text-red-500'
                      }`}>
                        {signal.direction === 'buy' ? 'شراء' : 'بيع'}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">الإطار الزمني</span>
                      <span className="font-semibold">{signal.timeframe}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">مستوى المخاطرة</span>
                      <span className={`font-semibold capitalize ${
                        signal.risk_level === 'low' ? 'text-emerald-500' :
                        signal.risk_level === 'medium' ? 'text-yellow-500' : 'text-red-500'
                      }`}>
                        {signal.risk_level === 'low' ? 'منخفض' :
                         signal.risk_level === 'medium' ? 'متوسط' : 'عالي'}
                      </span>
                    </div>
                    {signal.confidence_score && (
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">نسبة الثقة</span>
                        <span className="font-semibold">{signal.confidence_score}%</span>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </motion.div>

              {/* AI Analysis */}
              {signal.ai_analysis && (
                <motion.div
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.6, delay: 0.4 }}
                >
                  <Card variant="elevated">
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <Activity className="h-5 w-5 text-primary" />
                        تحليل الذكاء الاصطناعي
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">التوقع</span>
                        <span className={`font-semibold capitalize ${
                          signal.ai_analysis.prediction === 'bullish' ? 'text-emerald-500' : 'text-red-500'
                        }`}>
                          {signal.ai_analysis.prediction === 'bullish' ? 'صاعد' : 'هابط'}
                        </span>
                      </div>
                      {signal.ai_analysis.probability && (
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">الاحتمالية</span>
                          <span className="font-semibold">
                            {(signal.ai_analysis.probability * 100).toFixed(0)}%
                          </span>
                        </div>
                      )}
                      {signal.ai_analysis.factors && (
                        <div>
                          <div className="text-sm text-muted-foreground mb-2">العوامل المؤثرة</div>
                          <div className="space-y-1">
                            {signal.ai_analysis.factors.map((factor: string, index: number) => (
                              <div key={index} className="text-sm bg-muted/50 p-2 rounded">
                                {factor}
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                </motion.div>
              )}

              {/* Timestamps */}
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.6, delay: 0.5 }}
              >
                <Card variant="elevated">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Clock className="h-5 w-5 text-primary" />
                      التوقيتات
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3 text-sm">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">تاريخ الإنشاء</span>
                      <span>{formatDate(signal.created_at)}</span>
                    </div>
                    {signal.completed_at && (
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">تاريخ الإكمال</span>
                        <span>{formatDate(signal.completed_at)}</span>
                      </div>
                    )}
                    {signal.expires_at && (
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">تاريخ الانتهاء</span>
                        <span>{formatDate(signal.expires_at)}</span>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </motion.div>
            </div>
          </div>
        </div>
      </Layout>
    </>
  );
};

export const getServerSideProps: GetServerSideProps = async ({ locale }) => {
  return {
    props: {
      ...(await serverSideTranslations(locale ?? 'ar', ['dashboard', 'common', 'navigation'])),
    },
  };
};

export default SignalDetailsPage;