import React, { useState } from 'react';
import { NextPage } from 'next';
import Head from 'next/head';
import { useRouter } from 'next/router';
import { useTranslation } from 'next-i18next';
import { serverSideTranslations } from 'next-i18next/serverSideTranslations';
import { GetStaticProps } from 'next';
import { motion } from 'framer-motion';
import { 
  ArrowLeft,
  TrendingUp,
  Target,
  Shield,
  Zap,
  BarChart3,
  DollarSign,
  Clock,
  AlertTriangle
} from 'lucide-react';

import { Layout } from '@/components/organisms/Layout';
import { Button } from '@/components/atoms/Button';
import { Input } from '@/components/atoms/Input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/atoms/Card';
import { useAuth } from '@/providers/AuthProvider';
import { useToast } from '@/hooks/useToast';
import { DatabaseService } from '@/lib/database';

const NewSignalPage: NextPage = () => {
  const { t } = useTranslation('dashboard');
  const router = useRouter();
  const { user, loading } = useAuth();
  const { toast } = useToast();

  const [formData, setFormData] = useState({
    symbol: '',
    timeframe: '4h',
    direction: 'buy',
    entry_price: '',
    target_price: '',
    stop_loss: '',
    risk_level: 'medium'
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const symbols = [
    'BTC/USDT', 'ETH/USDT', 'ADA/USDT', 'DOT/USDT', 'LINK/USDT',
    'BNB/USDT', 'XRP/USDT', 'SOL/USDT', 'MATIC/USDT', 'AVAX/USDT'
  ];

  const timeframes = [
    { value: '1m', label: '1 دقيقة' },
    { value: '5m', label: '5 دقائق' },
    { value: '15m', label: '15 دقيقة' },
    { value: '30m', label: '30 دقيقة' },
    { value: '1h', label: '1 ساعة' },
    { value: '4h', label: '4 ساعات' },
    { value: '1d', label: '1 يوم' },
    { value: '1w', label: '1 أسبوع' }
  ];

  const riskLevels = [
    { value: 'low', label: 'منخفض', color: 'text-emerald-500' },
    { value: 'medium', label: 'متوسط', color: 'text-yellow-500' },
    { value: 'high', label: 'عالي', color: 'text-red-500' }
  ];

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const generateAIAnalysis = () => {
    // Simulate AI analysis
    const confidence = Math.floor(Math.random() * 30) + 70; // 70-100%
    const factors = [
      'تحليل فني قوي',
      'زخم إيجابي',
      'مستوى دعم قوي',
      'حجم تداول مرتفع'
    ];

    return {
      confidence_score: confidence,
      technical_analysis: {
        rsi: Math.floor(Math.random() * 40) + 30,
        macd: Math.random() > 0.5 ? 'bullish' : 'bearish',
        support: parseFloat(formData.entry_price) * 0.95,
        resistance: parseFloat(formData.entry_price) * 1.05
      },
      ai_analysis: {
        prediction: formData.direction === 'buy' ? 'bullish' : 'bearish',
        probability: confidence / 100,
        factors: factors.slice(0, Math.floor(Math.random() * 3) + 2)
      },
      market_conditions: {
        trend: formData.direction === 'buy' ? 'bullish' : 'bearish',
        volatility: formData.risk_level,
        volume: Math.random() > 0.5 ? 'high' : 'medium'
      }
    };
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!user) {
      toast({
        title: 'خطأ في المصادقة',
        description: 'يرجى تسجيل الدخول أولاً',
        variant: 'destructive',
      });
      return;
    }

    if (!formData.symbol || !formData.entry_price) {
      toast({
        title: 'خطأ في البيانات',
        description: 'يرجى إدخال الرمز وسعر الدخول',
        variant: 'destructive',
      });
      return;
    }

    setIsSubmitting(true);

    try {
      const aiData = generateAIAnalysis();
      
      const signalData = {
        user_id: user.id,
        signal_type: formData.direction,
        symbol: formData.symbol,
        timeframe: formData.timeframe,
        direction: formData.direction,
        entry_price: parseFloat(formData.entry_price),
        target_price: formData.target_price ? parseFloat(formData.target_price) : null,
        stop_loss: formData.stop_loss ? parseFloat(formData.stop_loss) : null,
        confidence_score: aiData.confidence_score,
        technical_analysis: aiData.technical_analysis,
        ai_analysis: aiData.ai_analysis,
        market_conditions: aiData.market_conditions,
        risk_level: formData.risk_level,
        status: 'pending'
      };

      const newSignal = await DatabaseService.createSignal(signalData);

      if (newSignal) {
        toast({
          title: 'تم إنشاء الإشارة بنجاح',
          description: `تم إنشاء إشارة ${formData.direction === 'buy' ? 'شراء' : 'بيع'} لـ ${formData.symbol}`,
          variant: 'default',
        });

        router.push(`/dashboard/signals/${newSignal.id}`);
      } else {
        throw new Error('فشل في إنشاء الإشارة');
      }
    } catch (error) {
      console.error('Error creating signal:', error);
      toast({
        title: 'خطأ في إنشاء الإشارة',
        description: 'حدث خطأ أثناء إنشاء الإشارة',
        variant: 'destructive',
      });
    } finally {
      setIsSubmitting(false);
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
        <title>إنشاء إشارة جديدة - منصة الخدمات الرقمية</title>
        <meta name="description" content="إنشاء إشارة تداول جديدة باستخدام الذكاء الاصطناعي" />
      </Head>

      <Layout showSidebar>
        <div className="space-y-8">
          {/* Header */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="flex items-center gap-4"
          >
            <Button
              variant="ghost"
              size="sm"
              leftIcon={<ArrowLeft />}
              onClick={() => router.back()}
            >
              العودة
            </Button>
            <div>
              <h1 className="text-3xl font-bold">إنشاء إشارة جديدة</h1>
              <p className="text-muted-foreground mt-1">
                أنشئ إشارة تداول جديدة بمساعدة الذكاء الاصطناعي
              </p>
            </div>
          </motion.div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Form */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6, delay: 0.1 }}
              className="lg:col-span-2"
            >
              <Card variant="elevated">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Zap className="h-5 w-5 text-primary" />
                    تفاصيل الإشارة
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <form onSubmit={handleSubmit} className="space-y-6">
                    {/* Symbol Selection */}
                    <div>
                      <label className="block text-sm font-medium mb-2">
                        رمز العملة
                      </label>
                      <select
                        name="symbol"
                        value={formData.symbol}
                        onChange={handleInputChange}
                        className="w-full p-3 border border-border rounded-lg bg-background focus:ring-2 focus:ring-primary focus:border-transparent"
                        required
                      >
                        <option value="">اختر رمز العملة</option>
                        {symbols.map(symbol => (
                          <option key={symbol} value={symbol}>
                            {symbol}
                          </option>
                        ))}
                      </select>
                    </div>

                    {/* Direction */}
                    <div>
                      <label className="block text-sm font-medium mb-2">
                        اتجاه الإشارة
                      </label>
                      <div className="grid grid-cols-2 gap-4">
                        <button
                          type="button"
                          onClick={() => setFormData(prev => ({ ...prev, direction: 'buy' }))}
                          className={`p-4 rounded-lg border-2 transition-all ${
                            formData.direction === 'buy'
                              ? 'border-emerald-500 bg-emerald-50 dark:bg-emerald-950'
                              : 'border-border hover:border-emerald-300'
                          }`}
                        >
                          <TrendingUp className="h-6 w-6 mx-auto mb-2 text-emerald-500" />
                          <div className="font-semibold">شراء</div>
                        </button>
                        <button
                          type="button"
                          onClick={() => setFormData(prev => ({ ...prev, direction: 'sell' }))}
                          className={`p-4 rounded-lg border-2 transition-all ${
                            formData.direction === 'sell'
                              ? 'border-red-500 bg-red-50 dark:bg-red-950'
                              : 'border-border hover:border-red-300'
                          }`}
                        >
                          <TrendingUp className="h-6 w-6 mx-auto mb-2 text-red-500 rotate-180" />
                          <div className="font-semibold">بيع</div>
                        </button>
                      </div>
                    </div>

                    {/* Timeframe */}
                    <div>
                      <label className="block text-sm font-medium mb-2">
                        الإطار الزمني
                      </label>
                      <select
                        name="timeframe"
                        value={formData.timeframe}
                        onChange={handleInputChange}
                        className="w-full p-3 border border-border rounded-lg bg-background focus:ring-2 focus:ring-primary focus:border-transparent"
                      >
                        {timeframes.map(tf => (
                          <option key={tf.value} value={tf.value}>
                            {tf.label}
                          </option>
                        ))}
                      </select>
                    </div>

                    {/* Price Inputs */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div>
                        <label className="block text-sm font-medium mb-2">
                          سعر الدخول *
                        </label>
                        <Input
                          name="entry_price"
                          type="number"
                          step="0.00000001"
                          placeholder="0.00"
                          value={formData.entry_price}
                          onChange={handleInputChange}
                          leftIcon={<DollarSign className="h-4 w-4" />}
                          required
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium mb-2">
                          الهدف
                        </label>
                        <Input
                          name="target_price"
                          type="number"
                          step="0.00000001"
                          placeholder="0.00"
                          value={formData.target_price}
                          onChange={handleInputChange}
                          leftIcon={<Target className="h-4 w-4" />}
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium mb-2">
                          وقف الخسارة
                        </label>
                        <Input
                          name="stop_loss"
                          type="number"
                          step="0.00000001"
                          placeholder="0.00"
                          value={formData.stop_loss}
                          onChange={handleInputChange}
                          leftIcon={<Shield className="h-4 w-4" />}
                        />
                      </div>
                    </div>

                    {/* Risk Level */}
                    <div>
                      <label className="block text-sm font-medium mb-2">
                        مستوى المخاطرة
                      </label>
                      <div className="grid grid-cols-3 gap-4">
                        {riskLevels.map(level => (
                          <button
                            key={level.value}
                            type="button"
                            onClick={() => setFormData(prev => ({ ...prev, risk_level: level.value }))}
                            className={`p-3 rounded-lg border-2 transition-all ${
                              formData.risk_level === level.value
                                ? 'border-primary bg-primary/10'
                                : 'border-border hover:border-primary/50'
                            }`}
                          >
                            <div className={`font-semibold ${level.color}`}>
                              {level.label}
                            </div>
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Submit Button */}
                    <Button
                      type="submit"
                      size="lg"
                      fullWidth
                      loading={isSubmitting}
                      leftIcon={<Zap />}
                    >
                      {isSubmitting ? 'جاري إنشاء الإشارة...' : 'إنشاء الإشارة'}
                    </Button>
                  </form>
                </CardContent>
              </Card>
            </motion.div>

            {/* Sidebar */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="space-y-6"
            >
              {/* AI Analysis Info */}
              <Card variant="elevated">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <BarChart3 className="h-5 w-5 text-primary" />
                    التحليل بالذكاء الاصطناعي
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4 text-sm">
                  <div className="flex items-start gap-3">
                    <Zap className="h-4 w-4 text-yellow-500 mt-0.5" />
                    <div>
                      <div className="font-medium">تحليل فوري</div>
                      <div className="text-muted-foreground">
                        سيتم تحليل الإشارة فوراً باستخدام AI
                      </div>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <Target className="h-4 w-4 text-blue-500 mt-0.5" />
                    <div>
                      <div className="font-medium">نسبة الثقة</div>
                      <div className="text-muted-foreground">
                        ستحصل على نسبة ثقة من 0-100%
                      </div>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <BarChart3 className="h-4 w-4 text-green-500 mt-0.5" />
                    <div>
                      <div className="font-medium">مؤشرات فنية</div>
                      <div className="text-muted-foreground">
                        RSI, MACD, ومستويات الدعم والمقاومة
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Tips */}
              <Card variant="elevated">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <AlertTriangle className="h-5 w-5 text-orange-500" />
                    نصائح مهمة
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3 text-sm">
                  <div className="p-3 bg-yellow-50 dark:bg-yellow-950 rounded-lg">
                    <div className="font-medium text-yellow-800 dark:text-yellow-200">
                      تحديد وقف الخسارة
                    </div>
                    <div className="text-yellow-700 dark:text-yellow-300">
                      دائماً حدد وقف خسارة لحماية رأس المال
                    </div>
                  </div>
                  <div className="p-3 bg-blue-50 dark:bg-blue-950 rounded-lg">
                    <div className="font-medium text-blue-800 dark:text-blue-200">
                      إدارة المخاطر
                    </div>
                    <div className="text-blue-700 dark:text-blue-300">
                      لا تخاطر بأكثر من 2% من رأس المال
                    </div>
                  </div>
                  <div className="p-3 bg-green-50 dark:bg-green-950 rounded-lg">
                    <div className="font-medium text-green-800 dark:text-green-200">
                      التحليل الفني
                    </div>
                    <div className="text-green-700 dark:text-green-300">
                      راجع المؤشرات الفنية قبل التنفيذ
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

export default NewSignalPage;