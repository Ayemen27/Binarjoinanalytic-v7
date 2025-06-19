import React, { useState } from 'react';
import type { NextPage } from 'next';
import Head from 'next/head';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { TrendingUp, Activity, Zap, AlertCircle, CheckCircle } from 'lucide-react';

import { Layout } from '@/components/organisms/Layout';
import { ProtectedRoute } from '@/components/organisms/ProtectedRoute';
import { Card } from '@/components/atoms/Card';
import { Button } from '@/components/atoms/Button';
import { Input } from '@/components/atoms/Input';
import { useAuth } from '@/providers/AuthProvider';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';

const signalSchema = z.object({
  symbol: z.string().min(1, 'اختر رمز التداول'),
  timeframe: z.string().min(1, 'اختر الإطار الزمني'),
  strategy: z.string().min(1, 'اختر الاستراتيجية'),
  riskLevel: z.enum(['low', 'medium', 'high']),
  amount: z.number().min(10, 'الحد الأدنى 10').max(10000, 'الحد الأقصى 10000'),
});

type SignalFormData = z.infer<typeof signalSchema>;

interface GeneratedSignal {
  id: string;
  symbol: string;
  direction: 'CALL' | 'PUT';
  entry_price: number;
  target_price: number;
  stop_loss: number;
  confidence_score: number;
  expiry_time: string;
  analysis: {
    rsi: number;
    macd: number;
    trend: string;
    support: number;
    resistance: number;
  };
}

const GenerateSignalPage: NextPage = () => {
  const { user } = useAuth();
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedSignal, setGeneratedSignal] = useState<GeneratedSignal | null>(null);
  const [error, setError] = useState<string | null>(null);
  
  const supabase = createClientComponentClient();

  const {
    register,
    handleSubmit,
    formState: { errors },
    watch,
  } = useForm<SignalFormData>({
    resolver: zodResolver(signalSchema),
    defaultValues: {
      symbol: 'EUR/USD',
      timeframe: '1h',
      strategy: 'RSI_MACD',
      riskLevel: 'medium',
      amount: 100,
    },
  });

  const symbols = [
    { value: 'EUR/USD', label: 'EUR/USD' },
    { value: 'GBP/USD', label: 'GBP/USD' },
    { value: 'USD/JPY', label: 'USD/JPY' },
    { value: 'AUD/USD', label: 'AUD/USD' },
    { value: 'USD/CAD', label: 'USD/CAD' },
    { value: 'NZD/USD', label: 'NZD/USD' },
  ];

  const timeframes = [
    { value: '5m', label: '5 دقائق' },
    { value: '15m', label: '15 دقيقة' },
    { value: '1h', label: 'ساعة' },
    { value: '4h', label: '4 ساعات' },
    { value: '1d', label: 'يوم' },
  ];

  const strategies = [
    { value: 'RSI_MACD', label: 'RSI + MACD' },
    { value: 'Bollinger_Bands', label: 'Bollinger Bands' },
    { value: 'Moving_Average', label: 'Moving Average' },
    { value: 'Support_Resistance', label: 'Support & Resistance' },
    { value: 'AI_Hybrid', label: 'AI Hybrid' },
  ];

  const generateTechnicalAnalysis = (symbol: string, strategy: string) => {
    // محاكاة التحليل التقني الحقيقي
    const basePrice = symbol === 'EUR/USD' ? 1.0950 : 
                     symbol === 'GBP/USD' ? 1.2650 :
                     symbol === 'USD/JPY' ? 148.50 : 1.0000;
    
    const rsi = Math.floor(Math.random() * 40) + 30; // 30-70
    const macd = (Math.random() - 0.5) * 0.002;
    const volatility = Math.random() * 0.01;
    
    const direction = rsi > 50 && macd > 0 ? 'CALL' : 'PUT';
    const multiplier = direction === 'CALL' ? 1 : -1;
    
    const entry_price = basePrice;
    const target_price = entry_price + (multiplier * volatility * 2);
    const stop_loss = entry_price - (multiplier * volatility);
    
    const confidence_score = Math.floor(
      (Math.abs(rsi - 50) / 20) * 40 + 
      (Math.abs(macd) * 10000) + 
      Math.random() * 20 + 40
    );

    return {
      direction: direction as 'CALL' | 'PUT',
      entry_price: Number(entry_price.toFixed(5)),
      target_price: Number(target_price.toFixed(5)),
      stop_loss: Number(stop_loss.toFixed(5)),
      confidence_score: Math.min(confidence_score, 95),
      analysis: {
        rsi,
        macd: Number(macd.toFixed(6)),
        trend: direction === 'CALL' ? 'صاعد' : 'هابط',
        support: Number((entry_price - volatility).toFixed(5)),
        resistance: Number((entry_price + volatility).toFixed(5)),
      },
    };
  };

  const onSubmit = async (data: SignalFormData) => {
    if (!user) return;
    
    setIsGenerating(true);
    setError(null);
    
    try {
      // توليد التحليل التقني
      const analysis = generateTechnicalAnalysis(data.symbol, data.strategy);
      
      // حفظ الإشارة في قاعدة البيانات
      const signalData = {
        user_id: user.id,
        signal_type: 'technical',
        strategy_name: data.strategy,
        symbol: data.symbol,
        timeframe: data.timeframe,
        direction: analysis.direction,
        entry_price: analysis.entry_price,
        target_price: analysis.target_price,
        stop_loss: analysis.stop_loss,
        confidence_score: analysis.confidence_score,
        risk_level: data.riskLevel,
        expected_payout: 80,
        technical_analysis: analysis.analysis,
        market_conditions: {
          volatility: 'متوسط',
          volume: 'عالي',
          trend_strength: analysis.confidence_score > 70 ? 'قوي' : 'متوسط',
        },
        indicators_used: ['RSI', 'MACD', 'Support_Resistance'],
        expiry_time: new Date(Date.now() + 60 * 60 * 1000).toISOString(), // ساعة من الآن
        status: 'active',
      };

      const { data: savedSignal, error: saveError } = await supabase
        .from('signals')
        .insert(signalData)
        .select()
        .single();

      if (saveError) throw saveError;

      setGeneratedSignal({
        id: savedSignal.id,
        symbol: data.symbol,
        ...analysis,
        expiry_time: signalData.expiry_time,
      });

    } catch (err: any) {
      setError(err.message || 'حدث خطأ في توليد الإشارة');
      console.error('Signal generation error:', err);
    } finally {
      setIsGenerating(false);
    }
  };

  if (generatedSignal) {
    return (
      <ProtectedRoute>
        <Head>
          <title>إشارة جديدة - منصة الإشارات</title>
        </Head>

        <Layout showSidebar={true}>
          <div className="p-6 max-w-4xl mx-auto">
            <div className="text-center mb-8">
              <div className="w-16 h-16 bg-success/10 rounded-full flex items-center justify-center mx-auto mb-4">
                <CheckCircle className="w-8 h-8 text-success" />
              </div>
              <h1 className="text-3xl font-bold text-foreground">تم توليد الإشارة بنجاح!</h1>
              <p className="text-muted-foreground mt-2">إشارة تداول جديدة جاهزة للتنفيذ</p>
            </div>

            <Card className="p-8 mb-6">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Signal Details */}
                <div>
                  <h2 className="text-xl font-semibold mb-4">تفاصيل الإشارة</h2>
                  <div className="space-y-4">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">الرمز:</span>
                      <span className="font-semibold">{generatedSignal.symbol}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">الاتجاه:</span>
                      <span className={`font-semibold ${generatedSignal.direction === 'CALL' ? 'text-success' : 'text-destructive'}`}>
                        {generatedSignal.direction === 'CALL' ? 'صاعد (CALL)' : 'هابط (PUT)'}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">سعر الدخول:</span>
                      <span className="font-semibold">{generatedSignal.entry_price}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">الهدف:</span>
                      <span className="font-semibold text-success">{generatedSignal.target_price}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">وقف الخسارة:</span>
                      <span className="font-semibold text-destructive">{generatedSignal.stop_loss}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">نسبة الثقة:</span>
                      <span className="font-semibold">{generatedSignal.confidence_score}%</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">انتهاء الصلاحية:</span>
                      <span className="font-semibold">
                        {new Date(generatedSignal.expiry_time).toLocaleTimeString('ar-SA')}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Technical Analysis */}
                <div>
                  <h2 className="text-xl font-semibold mb-4">التحليل التقني</h2>
                  <div className="space-y-4">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">RSI:</span>
                      <span className="font-semibold">{generatedSignal.analysis.rsi}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">MACD:</span>
                      <span className="font-semibold">{generatedSignal.analysis.macd}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">الاتجاه:</span>
                      <span className="font-semibold">{generatedSignal.analysis.trend}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">الدعم:</span>
                      <span className="font-semibold">{generatedSignal.analysis.support}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">المقاومة:</span>
                      <span className="font-semibold">{generatedSignal.analysis.resistance}</span>
                    </div>
                  </div>
                </div>
              </div>
            </Card>

            <div className="flex gap-4 justify-center">
              <Button onClick={() => setGeneratedSignal(null)}>
                توليد إشارة أخرى
              </Button>
              <Button variant="outline" onClick={() => window.location.href = '/signals/history'}>
                عرض السجل
              </Button>
            </div>
          </div>
        </Layout>
      </ProtectedRoute>
    );
  }

  return (
    <ProtectedRoute>
      <Head>
        <title>توليد إشارة جديدة - منصة الإشارات</title>
      </Head>

      <Layout showSidebar={true}>
        <div className="p-6 max-w-4xl mx-auto">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-foreground">توليد إشارة جديدة</h1>
            <p className="text-muted-foreground mt-2">
              اختر معايير التداول للحصول على إشارة ذكية مدعومة بالتحليل التقني
            </p>
          </div>

          <form onSubmit={handleSubmit(onSubmit)}>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {/* Form Section */}
              <Card className="p-6">
                <h2 className="text-xl font-semibold mb-6">معايير الإشارة</h2>
                
                <div className="space-y-6">
                  {/* Symbol Selection */}
                  <div>
                    <label className="block text-sm font-medium text-foreground mb-2">
                      رمز التداول
                    </label>
                    <select
                      {...register('symbol')}
                      className="w-full px-3 py-2 border border-border rounded-md bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                    >
                      {symbols.map(symbol => (
                        <option key={symbol.value} value={symbol.value}>
                          {symbol.label}
                        </option>
                      ))}
                    </select>
                    {errors.symbol && (
                      <p className="text-sm text-destructive mt-1">{errors.symbol.message}</p>
                    )}
                  </div>

                  {/* Timeframe */}
                  <div>
                    <label className="block text-sm font-medium text-foreground mb-2">
                      الإطار الزمني
                    </label>
                    <select
                      {...register('timeframe')}
                      className="w-full px-3 py-2 border border-border rounded-md bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                    >
                      {timeframes.map(tf => (
                        <option key={tf.value} value={tf.value}>
                          {tf.label}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Strategy */}
                  <div>
                    <label className="block text-sm font-medium text-foreground mb-2">
                      الاستراتيجية
                    </label>
                    <select
                      {...register('strategy')}
                      className="w-full px-3 py-2 border border-border rounded-md bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                    >
                      {strategies.map(strategy => (
                        <option key={strategy.value} value={strategy.value}>
                          {strategy.label}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Risk Level */}
                  <div>
                    <label className="block text-sm font-medium text-foreground mb-2">
                      مستوى المخاطرة
                    </label>
                    <div className="grid grid-cols-3 gap-2">
                      {[
                        { value: 'low', label: 'منخفض', color: 'success' },
                        { value: 'medium', label: 'متوسط', color: 'warning' },
                        { value: 'high', label: 'عالي', color: 'destructive' },
                      ].map(risk => (
                        <label key={risk.value} className="flex items-center space-x-2 space-x-reverse">
                          <input
                            type="radio"
                            {...register('riskLevel')}
                            value={risk.value}
                            className="text-primary"
                          />
                          <span className="text-sm">{risk.label}</span>
                        </label>
                      ))}
                    </div>
                  </div>

                  {/* Amount */}
                  <div>
                    <Input
                      {...register('amount', { valueAsNumber: true })}
                      type="number"
                      label="مبلغ التداول ($)"
                      placeholder="100"
                      min="10"
                      max="10000"
                      error={errors.amount?.message}
                    />
                  </div>
                </div>
              </Card>

              {/* Preview Section */}
              <Card className="p-6">
                <h2 className="text-xl font-semibold mb-6">معاينة الإعدادات</h2>
                
                <div className="space-y-4">
                  <div className="p-4 bg-muted/20 rounded-lg">
                    <div className="flex items-center gap-2 mb-2">
                      <TrendingUp className="w-5 h-5 text-primary" />
                      <span className="font-medium">الرمز المختار</span>
                    </div>
                    <p className="text-2xl font-bold">{watch('symbol')}</p>
                  </div>

                  <div className="p-4 bg-muted/20 rounded-lg">
                    <div className="flex items-center gap-2 mb-2">
                      <Activity className="w-5 h-5 text-primary" />
                      <span className="font-medium">الاستراتيجية</span>
                    </div>
                    <p className="font-semibold">
                      {strategies.find(s => s.value === watch('strategy'))?.label}
                    </p>
                  </div>

                  <div className="p-4 bg-muted/20 rounded-lg">
                    <div className="flex items-center gap-2 mb-2">
                      <Zap className="w-5 h-5 text-primary" />
                      <span className="font-medium">مستوى المخاطرة</span>
                    </div>
                    <p className="font-semibold">
                      {watch('riskLevel') === 'low' ? 'منخفض' :
                       watch('riskLevel') === 'medium' ? 'متوسط' : 'عالي'}
                    </p>
                  </div>
                </div>

                {error && (
                  <div className="mt-6 p-4 bg-destructive/10 border border-destructive/20 rounded-lg">
                    <div className="flex items-center gap-2">
                      <AlertCircle className="w-5 h-5 text-destructive" />
                      <span className="text-destructive font-medium">خطأ</span>
                    </div>
                    <p className="text-destructive mt-1">{error}</p>
                  </div>
                )}

                <Button
                  type="submit"
                  fullWidth
                  loading={isGenerating}
                  className="mt-6"
                  leftIcon={<Zap className="w-4 h-4" />}
                >
                  {isGenerating ? 'جاري التوليد...' : 'توليد الإشارة'}
                </Button>
              </Card>
            </div>
          </form>
        </div>
      </Layout>
    </ProtectedRoute>
  );
};

export default GenerateSignalPage;