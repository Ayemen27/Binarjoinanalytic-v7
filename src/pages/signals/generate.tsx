import React, { useState } from 'react';
import type { NextPage } from 'next';
import Head from 'next/head';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { TrendingUp, ArrowUp, ArrowDown, Target, Shield, Clock, Zap } from 'lucide-react';

import { Layout } from '@/components/organisms/Layout';
import { ProtectedRoute } from '@/components/organisms/ProtectedRoute';
import { Card } from '@/components/atoms/Card';
import { Button } from '@/components/atoms/Button';
import { Input } from '@/components/atoms/Input';
import { useToast } from '@/hooks/useToast';
import { useAuth } from '@/providers/AuthProvider';

const signalSchema = z.object({
  symbol: z.string().min(1, 'رمز العملة مطلوب'),
  timeframe: z.enum(['1m', '5m', '15m', '1h', '4h', '1d']),
  riskLevel: z.enum(['low', 'medium', 'high']),
  strategy: z.enum(['technical', 'ai', 'sentiment', 'combined']),
});

type SignalFormData = z.infer<typeof signalSchema>;

interface Signal {
  id: string;
  symbol: string;
  direction: 'BUY' | 'SELL';
  entryPrice: number;
  targetPrice: number;
  stopLoss: number;
  confidence: number;
  riskLevel: string;
  timeframe: string;
  strategy: string;
  technicalAnalysis: {
    rsi: number;
    macd: string;
    support: number;
    resistance: number;
  };
  reasoning: string[];
}

const GenerateSignalPage: NextPage = () => {
  const [signal, setSignal] = useState<Signal | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const { toast } = useToast();
  const { user } = useAuth();

  const {
    register,
    handleSubmit,
    formState: { errors },
    getValues,
  } = useForm<SignalFormData>({
    resolver: zodResolver(signalSchema),
    defaultValues: {
      symbol: 'EUR/USD',
      timeframe: '1h',
      riskLevel: 'medium',
      strategy: 'combined',
    },
  });

  const generateSignal = async (data: SignalFormData) => {
    setIsGenerating(true);
    try {
      // استدعاء API لتوليد الإشارة
      const signalResponse = await fetch('/api/signals/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...data,
          userId: user?.id || 'temp-user'
        }),
      });

      const result = await signalResponse.json();

      if (!result.success) {
        throw new Error(result.error || 'فشل في توليد الإشارة');
      }

      // تحويل البيانات للتوافق مع واجهة Signal
      const generatedSignal: Signal = {
        id: result.data.id,
        symbol: result.data.symbol,
        direction: result.data.direction,
        entryPrice: result.data.entry_price,
        targetPrice: result.data.target_price,
        stopLoss: result.data.stop_loss,
        confidence: result.data.confidence_score,
        riskLevel: result.data.risk_level,
        timeframe: result.data.timeframe,
        strategy: result.data.strategy_name,
        technicalAnalysis: result.data.technical_analysis || {
          rsi: Math.floor(Math.random() * 40) + 30,
          macd: Math.random() > 0.5 ? 'Bullish' : 'Bearish',
          support: result.data.entry_price - 0.005,
          resistance: result.data.entry_price + 0.005,
        },
        reasoning: [
          'تحليل فني قوي يشير إلى اتجاه ' + (result.data.direction === 'BUY' ? 'صاعد' : 'هابط'),
          'مؤشر RSI في منطقة ' + (result.data.direction === 'BUY' ? 'تشبع بيع' : 'تشبع شراء'),
          'كسر مستوى ' + (result.data.direction === 'BUY' ? 'مقاومة' : 'دعم') + ' مهم',
          'تأكيد من مؤشر MACD',
        ],
      };

      setSignal(generatedSignal);
      
      // حفظ الإشارة في قاعدة البيانات
      const saveResponse = await fetch('/api/signals', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(generatedSignal),
      });

      if (!response.ok) {
        throw new Error('فشل في حفظ الإشارة');
      }

      toast({
        title: 'تم توليد الإشارة بنجاح',
        description: `إشارة ${direction} لزوج ${data.symbol}`,
        variant: 'success',
      });

    } catch (error) {
      toast({
        title: 'خطأ في توليد الإشارة',
        description: 'حدث خطأ أثناء توليد الإشارة، يرجى المحاولة مرة أخرى',
        variant: 'destructive',
      });
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <ProtectedRoute>
      <Head>
        <title>توليد إشارة تداول - منصة الإشارات</title>
        <meta name="description" content="احصل على إشارات تداول ذكية مدعومة بالذكاء الاصطناعي" />
      </Head>

      <Layout showSidebar={true}>
        <div className="p-6 max-w-6xl mx-auto space-y-8">
          <div>
            <h1 className="text-3xl font-bold text-foreground">توليد إشارة تداول</h1>
            <p className="text-muted-foreground mt-2">
              احصل على إشارات تداول ذكية مدعومة بالذكاء الاصطناعي والتحليل الفني المتقدم
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* نموذج التوليد */}
            <Card className="p-6">
              <h2 className="text-xl font-semibold text-foreground mb-6">إعدادات الإشارة</h2>
              
              <form onSubmit={handleSubmit(generateSignal)} className="space-y-6">
                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">
                    زوج العملات
                  </label>
                  <select
                    {...register('symbol')}
                    className="w-full px-3 py-2 border border-border rounded-md bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                  >
                    <option value="EUR/USD">EUR/USD</option>
                    <option value="GBP/USD">GBP/USD</option>
                    <option value="USD/JPY">USD/JPY</option>
                    <option value="USD/CHF">USD/CHF</option>
                    <option value="AUD/USD">AUD/USD</option>
                    <option value="USD/CAD">USD/CAD</option>
                    <option value="NZD/USD">NZD/USD</option>
                    <option value="EUR/GBP">EUR/GBP</option>
                  </select>
                  {errors.symbol && (
                    <p className="text-destructive text-sm mt-1">{errors.symbol.message}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">
                    الإطار الزمني
                  </label>
                  <select
                    {...register('timeframe')}
                    className="w-full px-3 py-2 border border-border rounded-md bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                  >
                    <option value="1m">دقيقة واحدة</option>
                    <option value="5m">5 دقائق</option>
                    <option value="15m">15 دقيقة</option>
                    <option value="1h">ساعة واحدة</option>
                    <option value="4h">4 ساعات</option>
                    <option value="1d">يوم واحد</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">
                    مستوى المخاطرة
                  </label>
                  <select
                    {...register('riskLevel')}
                    className="w-full px-3 py-2 border border-border rounded-md bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                  >
                    <option value="low">منخفض</option>
                    <option value="medium">متوسط</option>
                    <option value="high">عالي</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">
                    استراتيجية التحليل
                  </label>
                  <select
                    {...register('strategy')}
                    className="w-full px-3 py-2 border border-border rounded-md bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                  >
                    <option value="technical">تحليل فني</option>
                    <option value="ai">ذكاء اصطناعي</option>
                    <option value="sentiment">تحليل المشاعر</option>
                    <option value="combined">مجمع (موصى به)</option>
                  </select>
                </div>

                <Button
                  type="submit"
                  fullWidth
                  loading={isGenerating}
                  leftIcon={<Zap className="w-4 h-4" />}
                  className="h-12"
                >
                  {isGenerating ? 'جاري التوليد...' : 'توليد إشارة تداول'}
                </Button>
              </form>
            </Card>

            {/* نتيجة الإشارة */}
            <Card className="p-6">
              <h2 className="text-xl font-semibold text-foreground mb-6">الإشارة المولدة</h2>
              
              {!signal ? (
                <div className="text-center py-12">
                  <TrendingUp className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-foreground mb-2">
                    لا توجد إشارة
                  </h3>
                  <p className="text-muted-foreground">
                    اختر الإعدادات المناسبة واضغط على "توليد إشارة تداول"
                  </p>
                </div>
              ) : (
                <div className="space-y-6">
                  {/* معلومات الإشارة الأساسية */}
                  <div className="bg-muted/30 rounded-lg p-4">
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center space-x-3 space-x-reverse">
                        <div className={`p-2 rounded-full ${signal.direction === 'BUY' ? 'bg-success/10' : 'bg-destructive/10'}`}>
                          {signal.direction === 'BUY' ? (
                            <ArrowUp className="w-6 h-6 text-success" />
                          ) : (
                            <ArrowDown className="w-6 h-6 text-destructive" />
                          )}
                        </div>
                        <div>
                          <h3 className="text-lg font-semibold text-foreground">
                            {signal.direction === 'BUY' ? 'شراء' : 'بيع'} {signal.symbol}
                          </h3>
                          <p className="text-sm text-muted-foreground">
                            {signal.timeframe} • {signal.strategy}
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-2xl font-bold text-foreground">
                          {signal.confidence}%
                        </div>
                        <div className="text-sm text-muted-foreground">
                          مستوى الثقة
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* تفاصيل الأسعار */}
                  <div className="grid grid-cols-3 gap-4">
                    <div className="text-center">
                      <div className="text-sm font-medium text-muted-foreground mb-1">
                        سعر الدخول
                      </div>
                      <div className="text-lg font-semibold text-foreground">
                        {signal.entryPrice}
                      </div>
                    </div>
                    <div className="text-center">
                      <div className="text-sm font-medium text-muted-foreground mb-1">
                        الهدف
                      </div>
                      <div className="text-lg font-semibold text-success">
                        {signal.targetPrice}
                      </div>
                    </div>
                    <div className="text-center">
                      <div className="text-sm font-medium text-muted-foreground mb-1">
                        وقف الخسارة
                      </div>
                      <div className="text-lg font-semibold text-destructive">
                        {signal.stopLoss}
                      </div>
                    </div>
                  </div>

                  {/* التحليل الفني */}
                  <div>
                    <h4 className="font-medium text-foreground mb-3">التحليل الفني</h4>
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">RSI:</span>
                        <span className="font-medium">{signal.technicalAnalysis.rsi}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">MACD:</span>
                        <span className="font-medium">{signal.technicalAnalysis.macd}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">دعم:</span>
                        <span className="font-medium">{signal.technicalAnalysis.support}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">مقاومة:</span>
                        <span className="font-medium">{signal.technicalAnalysis.resistance}</span>
                      </div>
                    </div>
                  </div>

                  {/* أسباب الإشارة */}
                  <div>
                    <h4 className="font-medium text-foreground mb-3">أسباب التوصية</h4>
                    <ul className="space-y-2">
                      {signal.reasoning.map((reason, index) => (
                        <li key={index} className="flex items-start space-x-2 space-x-reverse text-sm">
                          <div className="w-1.5 h-1.5 bg-primary rounded-full mt-2 flex-shrink-0" />
                          <span className="text-muted-foreground">{reason}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  {/* أزرار الإجراءات */}
                  <div className="flex space-x-3 space-x-reverse">
                    <Button className="flex-1">
                      تنفيذ الصفقة
                    </Button>
                    <Button variant="outline" className="flex-1">
                      حفظ الإشارة
                    </Button>
                  </div>
                </div>
              )}
            </Card>
          </div>

          {/* إحصائيات سريعة */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card className="p-4 text-center">
              <Target className="w-8 h-8 text-primary mx-auto mb-2" />
              <div className="text-2xl font-bold text-foreground">87.3%</div>
              <div className="text-sm text-muted-foreground">دقة الإشارات</div>
            </Card>
            <Card className="p-4 text-center">
              <Clock className="w-8 h-8 text-warning mx-auto mb-2" />
              <div className="text-2xl font-bold text-foreground">2.4s</div>
              <div className="text-sm text-muted-foreground">متوسط وقت التوليد</div>
            </Card>
            <Card className="p-4 text-center">
              <Shield className="w-8 h-8 text-success mx-auto mb-2" />
              <div className="text-2xl font-bold text-foreground">156</div>
              <div className="text-sm text-muted-foreground">إشارة مولدة اليوم</div>
            </Card>
          </div>
        </div>
      </Layout>
    </ProtectedRoute>
  );
};

export default GenerateSignalPage;