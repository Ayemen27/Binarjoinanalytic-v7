import React, { useState } from 'react';
import type { NextPage } from 'next';
import Head from 'next/head';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { 
  Play, 
  BarChart3, 
  TrendingUp, 
  TrendingDown, 
  DollarSign, 
  Calendar,
  Settings,
  Download,
  Save,
  Target,
  AlertTriangle
} from 'lucide-react';

import { Layout } from '@/components/organisms/Layout';
import { ProtectedRoute } from '@/components/organisms/ProtectedRoute';
import { Card } from '@/components/atoms/Card';
import { Button } from '@/components/atoms/Button';
import { Input } from '@/components/atoms/Input';
import { useToast } from '@/hooks/useToast';
import BacktestingEngine, { BacktestingStrategy, BacktestingResult } from '@/services/backtesting';

const backtestSchema = z.object({
  strategyName: z.string().min(1, 'اسم الاستراتيجية مطلوب'),
  startDate: z.string().min(1, 'تاريخ البداية مطلوب'),
  endDate: z.string().min(1, 'تاريخ النهاية مطلوب'),
  initialCapital: z.number().min(1000, 'رأس المال يجب أن يكون 1000 على الأقل'),
  commission: z.number().min(0).max(1, 'العمولة يجب أن تكون بين 0% و 1%'),
  maxRisk: z.number().min(0.1).max(10, 'المخاطرة يجب أن تكون بين 0.1% و 10%'),
  stopLoss: z.number().min(0.1).max(20, 'وقف الخسارة يجب أن يكون بين 0.1% و 20%'),
  takeProfit: z.number().min(0.1).max(50, 'جني الأرباح يجب أن يكون بين 0.1% و 50%'),
  symbols: z.string().min(1, 'أزواج العملات مطلوبة'),
});

type BacktestFormData = z.infer<typeof backtestSchema>;

const predefinedStrategies: BacktestingStrategy[] = [
  {
    id: 'rsi_macd',
    name: 'استراتيجية RSI و MACD',
    description: 'دخول عند تشبع بيعي RSI مع إشارة MACD إيجابية',
    parameters: { rsiPeriod: 14, macdFast: 12, macdSlow: 26 },
    entryConditions: ['RSI < 30', 'MACD > Signal'],
    exitConditions: ['RSI > 70', 'MACD < Signal'],
    riskManagement: {
      maxRisk: 2,
      stopLoss: 2,
      takeProfit: 4,
      positionSizing: 'percentage'
    }
  },
  {
    id: 'breakout',
    name: 'استراتيجية الاختراق',
    description: 'دخول عند كسر مستويات الدعم والمقاومة',
    parameters: { lookbackPeriod: 20, minVolume: 100000 },
    entryConditions: ['Price > Resistance', 'Volume > Average'],
    exitConditions: ['Price < Support', 'Time Limit'],
    riskManagement: {
      maxRisk: 3,
      stopLoss: 3,
      takeProfit: 6,
      positionSizing: 'dynamic'
    }
  },
  {
    id: 'moving_average',
    name: 'استراتيجية المتوسطات المتحركة',
    description: 'دخول عند تقاطع المتوسطات المتحركة',
    parameters: { fastMA: 20, slowMA: 50, ema: true },
    entryConditions: ['Fast MA > Slow MA', 'Price > Fast MA'],
    exitConditions: ['Fast MA < Slow MA', 'Price < Fast MA'],
    riskManagement: {
      maxRisk: 1.5,
      stopLoss: 1.5,
      takeProfit: 3,
      positionSizing: 'fixed'
    }
  }
];

const BacktestingPage: NextPage = () => {
  const [selectedStrategy, setSelectedStrategy] = useState<BacktestingStrategy>(predefinedStrategies[0]);
  const [isRunning, setIsRunning] = useState(false);
  const [results, setResults] = useState<BacktestingResult | null>(null);
  const { toast } = useToast();

  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
    watch
  } = useForm<BacktestFormData>({
    resolver: zodResolver(backtestSchema),
    defaultValues: {
      strategyName: selectedStrategy.name,
      startDate: '2024-01-01',
      endDate: '2024-12-01',
      initialCapital: 10000,
      commission: 0.1,
      maxRisk: selectedStrategy.riskManagement.maxRisk,
      stopLoss: selectedStrategy.riskManagement.stopLoss,
      takeProfit: selectedStrategy.riskManagement.takeProfit,
      symbols: 'EUR/USD,GBP/USD,USD/JPY'
    }
  });

  const onSubmit = async (data: BacktestFormData) => {
    setIsRunning(true);
    try {
      const config = {
        startDate: data.startDate,
        endDate: data.endDate,
        initialCapital: data.initialCapital,
        commission: data.commission,
        slippage: 0.1,
        symbols: data.symbols.split(',').map(s => s.trim()),
        timeframe: '1h',
        currency: 'USD'
      };

      const strategy: BacktestingStrategy = {
        ...selectedStrategy,
        name: data.strategyName,
        riskManagement: {
          ...selectedStrategy.riskManagement,
          maxRisk: data.maxRisk,
          stopLoss: data.stopLoss,
          takeProfit: data.takeProfit
        }
      };

      const engine = new BacktestingEngine(config);
      const result = await engine.runBacktest(strategy);
      
      setResults(result);
      
      toast({
        title: 'تم إنجاز الاختبار التاريخي',
        description: `تم تشغيل ${result.performance.totalTrades} صفقة بنسبة نجاح ${result.performance.winRate.toFixed(1)}%`,
        variant: 'success',
      });

    } catch (error) {
      console.error('Error running backtest:', error);
      toast({
        title: 'خطأ في تشغيل الاختبار',
        description: 'حدث خطأ أثناء تشغيل الاختبار التاريخي',
        variant: 'destructive',
      });
    } finally {
      setIsRunning(false);
    }
  };

  const handleStrategyChange = (strategy: BacktestingStrategy) => {
    setSelectedStrategy(strategy);
    setValue('strategyName', strategy.name);
    setValue('maxRisk', strategy.riskManagement.maxRisk);
    setValue('stopLoss', strategy.riskManagement.stopLoss);
    setValue('takeProfit', strategy.riskManagement.takeProfit);
  };

  const exportResults = () => {
    if (!results) return;

    const csvContent = [
      ['التاريخ', 'الرمز', 'الاتجاه', 'سعر الدخول', 'سعر الخروج', 'الربح', 'نسبة الربح'],
      ...results.trades.map(trade => [
        trade.exitDate,
        trade.symbol,
        trade.direction === 'BUY' ? 'شراء' : 'بيع',
        trade.entryPrice.toFixed(5),
        trade.exitPrice.toFixed(5),
        trade.profit.toFixed(2),
        trade.profitPercentage.toFixed(2) + '%'
      ])
    ].map(row => row.join(',')).join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `backtest_results_${Date.now()}.csv`;
    link.click();
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('ar-SA', {
      style: 'currency',
      currency: 'USD'
    }).format(amount);
  };

  const formatPercentage = (value: number) => {
    return `${value.toFixed(2)}%`;
  };

  return (
    <ProtectedRoute>
      <Head>
        <title>اختبار الاستراتيجيات التاريخي - منصة الإشارات</title>
        <meta name="description" content="اختبار وتحليل استراتيجيات التداول تاريخياً" />
      </Head>

      <Layout showSidebar={true}>
        <div className="p-6 space-y-8">
          <div>
            <h1 className="text-3xl font-bold text-foreground">اختبار الاستراتيجيات التاريخي</h1>
            <p className="text-muted-foreground mt-2">
              اختبر وحلل أداء استراتيجيات التداول باستخدام البيانات التاريخية
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* إعدادات الاختبار */}
            <div className="lg:col-span-1 space-y-6">
              {/* اختيار الاستراتيجية */}
              <Card className="p-6">
                <h3 className="text-lg font-semibold text-foreground mb-4">اختيار الاستراتيجية</h3>
                <div className="space-y-3">
                  {predefinedStrategies.map((strategy) => (
                    <div
                      key={strategy.id}
                      onClick={() => handleStrategyChange(strategy)}
                      className={`p-3 border rounded-lg cursor-pointer transition-colors ${
                        selectedStrategy.id === strategy.id
                          ? 'border-primary bg-primary/5'
                          : 'border-border hover:border-primary/50'
                      }`}
                    >
                      <h4 className="font-medium text-foreground">{strategy.name}</h4>
                      <p className="text-sm text-muted-foreground mt-1">{strategy.description}</p>
                      <div className="flex space-x-2 space-x-reverse mt-2">
                        <span className="text-xs bg-muted px-2 py-1 rounded">
                          مخاطرة: {strategy.riskManagement.maxRisk}%
                        </span>
                        <span className="text-xs bg-muted px-2 py-1 rounded">
                          ربح: {strategy.riskManagement.takeProfit}%
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </Card>

              {/* إعدادات الاختبار */}
              <Card className="p-6">
                <h3 className="text-lg font-semibold text-foreground mb-4">إعدادات الاختبار</h3>
                <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                  <Input
                    label="اسم الاستراتيجية"
                    {...register('strategyName')}
                    error={errors.strategyName?.message}
                  />

                  <div className="grid grid-cols-2 gap-3">
                    <Input
                      label="تاريخ البداية"
                      type="date"
                      {...register('startDate')}
                      error={errors.startDate?.message}
                    />
                    <Input
                      label="تاريخ النهاية"
                      type="date"
                      {...register('endDate')}
                      error={errors.endDate?.message}
                    />
                  </div>

                  <Input
                    label="رأس المال الأولي ($)"
                    type="number"
                    {...register('initialCapital', { valueAsNumber: true })}
                    error={errors.initialCapital?.message}
                  />

                  <Input
                    label="العمولة (%)"
                    type="number"
                    step="0.01"
                    {...register('commission', { valueAsNumber: true })}
                    error={errors.commission?.message}
                  />

                  <div className="grid grid-cols-3 gap-2">
                    <Input
                      label="مخاطرة (%)"
                      type="number"
                      step="0.1"
                      {...register('maxRisk', { valueAsNumber: true })}
                      error={errors.maxRisk?.message}
                    />
                    <Input
                      label="وقف الخسارة (%)"
                      type="number"
                      step="0.1"
                      {...register('stopLoss', { valueAsNumber: true })}
                      error={errors.stopLoss?.message}
                    />
                    <Input
                      label="جني الأرباح (%)"
                      type="number"
                      step="0.1"
                      {...register('takeProfit', { valueAsNumber: true })}
                      error={errors.takeProfit?.message}
                    />
                  </div>

                  <Input
                    label="أزواج العملات"
                    placeholder="EUR/USD,GBP/USD,USD/JPY"
                    {...register('symbols')}
                    error={errors.symbols?.message}
                    helperText="افصل بينها بفاصلة"
                  />

                  <Button
                    type="submit"
                    loading={isRunning}
                    leftIcon={<Play className="w-4 h-4" />}
                    className="w-full"
                    disabled={isRunning}
                  >
                    {isRunning ? 'جاري التشغيل...' : 'تشغيل الاختبار'}
                  </Button>
                </form>
              </Card>
            </div>

            {/* النتائج */}
            <div className="lg:col-span-2 space-y-6">
              {results ? (
                <>
                  {/* ملخص الأداء */}
                  <Card className="p-6">
                    <div className="flex items-center justify-between mb-6">
                      <h3 className="text-lg font-semibold text-foreground">ملخص الأداء</h3>
                      <div className="flex space-x-2 space-x-reverse">
                        <Button variant="outline" size="sm" onClick={exportResults}>
                          <Download className="w-4 h-4 ml-2" />
                          تصدير
                        </Button>
                        <Button variant="outline" size="sm">
                          <Save className="w-4 h-4 ml-2" />
                          حفظ
                        </Button>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                      <div className="text-center p-4 bg-muted/30 rounded-lg">
                        <div className="text-2xl font-bold text-foreground">
                          {results.performance.totalTrades}
                        </div>
                        <div className="text-sm text-muted-foreground">إجمالي الصفقات</div>
                      </div>

                      <div className="text-center p-4 bg-success/10 rounded-lg">
                        <div className="text-2xl font-bold text-success">
                          {formatPercentage(results.performance.winRate)}
                        </div>
                        <div className="text-sm text-muted-foreground">نسبة النجاح</div>
                      </div>

                      <div className={`text-center p-4 rounded-lg ${
                        results.performance.totalReturn >= 0 ? 'bg-success/10' : 'bg-destructive/10'
                      }`}>
                        <div className={`text-2xl font-bold ${
                          results.performance.totalReturn >= 0 ? 'text-success' : 'text-destructive'
                        }`}>
                          {formatPercentage(results.performance.totalReturn)}
                        </div>
                        <div className="text-sm text-muted-foreground">إجمالي العائد</div>
                      </div>

                      <div className="text-center p-4 bg-warning/10 rounded-lg">
                        <div className="text-2xl font-bold text-warning">
                          {formatPercentage(results.performance.maxDrawdown)}
                        </div>
                        <div className="text-sm text-muted-foreground">أقصى انسحاب</div>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mt-6">
                      <div className="space-y-2">
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">نسبة شارب:</span>
                          <span className="font-medium">{results.performance.sharpeRatio.toFixed(2)}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">عامل الربح:</span>
                          <span className="font-medium">{results.performance.profitFactor.toFixed(2)}</span>
                        </div>
                      </div>

                      <div className="space-y-2">
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">متوسط الربح:</span>
                          <span className="font-medium text-success">
                            {formatCurrency(results.performance.averageWin)}
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">متوسط الخسارة:</span>
                          <span className="font-medium text-destructive">
                            {formatCurrency(results.performance.averageLoss)}
                          </span>
                        </div>
                      </div>

                      <div className="space-y-2">
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">صفقات رابحة:</span>
                          <span className="font-medium text-success">{results.performance.winningTrades}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">صفقات خاسرة:</span>
                          <span className="font-medium text-destructive">{results.performance.losingTrades}</span>
                        </div>
                      </div>
                    </div>
                  </Card>

                  {/* منحنى الأسهم */}
                  <Card className="p-6">
                    <h3 className="text-lg font-semibold text-foreground mb-4">منحنى الأسهم</h3>
                    <div className="h-64 bg-muted/20 rounded-lg flex items-center justify-center">
                      <div className="text-center">
                        <BarChart3 className="w-12 h-12 text-muted-foreground mx-auto mb-2" />
                        <p className="text-muted-foreground">رسم بياني تفاعلي لمنحنى الأسهم</p>
                        <p className="text-sm text-muted-foreground mt-1">
                          نقاط البيانات: {results.equityCurve.length}
                        </p>
                      </div>
                    </div>
                  </Card>

                  {/* سجل الصفقات */}
                  <Card className="overflow-hidden">
                    <div className="p-6 border-b border-border">
                      <h3 className="text-lg font-semibold text-foreground">سجل الصفقات</h3>
                    </div>
                    <div className="overflow-x-auto max-h-96">
                      <table className="w-full">
                        <thead className="bg-muted/30 sticky top-0">
                          <tr>
                            <th className="px-4 py-3 text-right text-xs font-medium text-muted-foreground uppercase">
                              الرمز
                            </th>
                            <th className="px-4 py-3 text-right text-xs font-medium text-muted-foreground uppercase">
                              الاتجاه
                            </th>
                            <th className="px-4 py-3 text-right text-xs font-medium text-muted-foreground uppercase">
                              الدخول
                            </th>
                            <th className="px-4 py-3 text-right text-xs font-medium text-muted-foreground uppercase">
                              الخروج
                            </th>
                            <th className="px-4 py-3 text-right text-xs font-medium text-muted-foreground uppercase">
                              الربح
                            </th>
                            <th className="px-4 py-3 text-right text-xs font-medium text-muted-foreground uppercase">
                              المدة
                            </th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-border">
                          {results.trades.slice(0, 50).map((trade) => (
                            <tr key={trade.id} className="hover:bg-muted/20">
                              <td className="px-4 py-3 text-sm font-medium">{trade.symbol}</td>
                              <td className="px-4 py-3">
                                <div className={`inline-flex items-center space-x-1 space-x-reverse ${
                                  trade.direction === 'BUY' ? 'text-success' : 'text-destructive'
                                }`}>
                                  {trade.direction === 'BUY' ? (
                                    <TrendingUp className="w-4 h-4" />
                                  ) : (
                                    <TrendingDown className="w-4 h-4" />
                                  )}
                                  <span className="text-xs">
                                    {trade.direction === 'BUY' ? 'شراء' : 'بيع'}
                                  </span>
                                </div>
                              </td>
                              <td className="px-4 py-3 text-sm">{trade.entryPrice.toFixed(5)}</td>
                              <td className="px-4 py-3 text-sm">{trade.exitPrice.toFixed(5)}</td>
                              <td className="px-4 py-3">
                                <div className={`text-sm font-medium ${
                                  trade.profit >= 0 ? 'text-success' : 'text-destructive'
                                }`}>
                                  {formatCurrency(trade.profit)}
                                  <div className="text-xs">
                                    ({formatPercentage(trade.profitPercentage)})
                                  </div>
                                </div>
                              </td>
                              <td className="px-4 py-3 text-sm">
                                {trade.duration.toFixed(1)}ساعة
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                    {results.trades.length > 50 && (
                      <div className="p-4 border-t border-border text-center">
                        <p className="text-sm text-muted-foreground">
                          عرض 50 صفقة من أصل {results.trades.length} صفقة
                        </p>
                      </div>
                    )}
                  </Card>
                </>
              ) : (
                <Card className="p-12 text-center">
                  <Settings className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-foreground mb-2">
                    جاهز لتشغيل الاختبار التاريخي
                  </h3>
                  <p className="text-muted-foreground">
                    اختر الاستراتيجية وأعد الإعدادات ثم اضغط "تشغيل الاختبار"
                  </p>
                </Card>
              )}
            </div>
          </div>
        </div>
      </Layout>
    </ProtectedRoute>
  );
};

export default BacktestingPage;