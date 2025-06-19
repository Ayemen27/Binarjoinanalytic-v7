import React, { useState, useEffect } from 'react';
import type { NextPage } from 'next';
import Head from 'next/head';
import { 
  TrendingUp, 
  TrendingDown, 
  DollarSign, 
  Activity, 
  BarChart3,
  PieChart,
  Target,
  Clock,
  Calendar,
  Filter
} from 'lucide-react';

import { Layout } from '@/components/organisms/Layout';
import { ProtectedRoute } from '@/components/organisms/ProtectedRoute';
import { Card } from '@/components/atoms/Card';
import { Button } from '@/components/atoms/Button';
import { useAuth } from '@/providers/AuthProvider';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';

interface AnalyticsData {
  totalSignals: number;
  winningSignals: number;
  losingSignals: number;
  winRate: number;
  totalProfit: number;
  averageProfit: number;
  averageLoss: number;
  profitByMonth: Array<{ month: string; profit: number }>;
  signalsBySymbol: Array<{ symbol: string; count: number; winRate: number }>;
  performanceByStrategy: Array<{ strategy: string; winRate: number; profit: number }>;
}

const AnalyticsPage: NextPage = () => {
  const { user } = useAuth();
  const [analytics, setAnalytics] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [timeRange, setTimeRange] = useState('30d');
  
  const supabase = createClientComponentClient();

  useEffect(() => {
    if (user) {
      fetchAnalytics();
    }
  }, [user, timeRange]);

  const fetchAnalytics = async () => {
    try {
      // Calculate date range
      const endDate = new Date();
      const startDate = new Date();
      
      switch (timeRange) {
        case '7d':
          startDate.setDate(endDate.getDate() - 7);
          break;
        case '30d':
          startDate.setDate(endDate.getDate() - 30);
          break;
        case '90d':
          startDate.setDate(endDate.getDate() - 90);
          break;
        case '1y':
          startDate.setFullYear(endDate.getFullYear() - 1);
          break;
      }

      const { data: signals, error } = await supabase
        .from('signals')
        .select('*')
        .eq('user_id', user?.id)
        .gte('created_at', startDate.toISOString())
        .lte('created_at', endDate.toISOString());

      if (error) throw error;

      // Calculate analytics
      const totalSignals = signals?.length || 0;
      const completedSignals = signals?.filter(s => ['won', 'lost'].includes(s.status)) || [];
      const winningSignals = signals?.filter(s => s.status === 'won').length || 0;
      const losingSignals = signals?.filter(s => s.status === 'lost').length || 0;
      const winRate = completedSignals.length > 0 ? (winningSignals / completedSignals.length) * 100 : 0;
      
      const totalProfit = signals?.reduce((sum, s) => sum + (s.profit_loss || 0), 0) || 0;
      const averageProfit = winningSignals > 0 
        ? signals.filter(s => s.status === 'won').reduce((sum, s) => sum + (s.profit_loss || 0), 0) / winningSignals 
        : 0;
      const averageLoss = losingSignals > 0 
        ? Math.abs(signals.filter(s => s.status === 'lost').reduce((sum, s) => sum + (s.profit_loss || 0), 0) / losingSignals)
        : 0;

      // Group by month for profit chart
      const profitByMonth = signals?.reduce((acc, signal) => {
        const month = new Date(signal.created_at).toLocaleDateString('ar-SA', { year: 'numeric', month: 'short' });
        const existing = acc.find(item => item.month === month);
        if (existing) {
          existing.profit += signal.profit_loss || 0;
        } else {
          acc.push({ month, profit: signal.profit_loss || 0 });
        }
        return acc;
      }, [] as Array<{ month: string; profit: number }>) || [];

      // Group by symbol
      const symbolStats = signals?.reduce((acc, signal) => {
        const existing = acc.find(item => item.symbol === signal.symbol);
        if (existing) {
          existing.count += 1;
          if (signal.status === 'won') existing.wins += 1;
        } else {
          acc.push({
            symbol: signal.symbol,
            count: 1,
            wins: signal.status === 'won' ? 1 : 0,
            winRate: 0
          });
        }
        return acc;
      }, [] as Array<{ symbol: string; count: number; wins: number; winRate: number }>) || [];

      const signalsBySymbol = symbolStats.map(item => ({
        symbol: item.symbol,
        count: item.count,
        winRate: item.count > 0 ? (item.wins / item.count) * 100 : 0
      }));

      // Group by strategy
      const strategyStats = signals?.reduce((acc, signal) => {
        const existing = acc.find(item => item.strategy === signal.strategy_name);
        if (existing) {
          existing.count += 1;
          existing.profit += signal.profit_loss || 0;
          if (signal.status === 'won') existing.wins += 1;
        } else {
          acc.push({
            strategy: signal.strategy_name,
            count: 1,
            wins: signal.status === 'won' ? 1 : 0,
            profit: signal.profit_loss || 0,
            winRate: 0
          });
        }
        return acc;
      }, [] as Array<{ strategy: string; count: number; wins: number; profit: number; winRate: number }>) || [];

      const performanceByStrategy = strategyStats.map(item => ({
        strategy: item.strategy,
        winRate: item.count > 0 ? (item.wins / item.count) * 100 : 0,
        profit: item.profit
      }));

      setAnalytics({
        totalSignals,
        winningSignals,
        losingSignals,
        winRate,
        totalProfit,
        averageProfit,
        averageLoss,
        profitByMonth: profitByMonth.slice(-6), // Last 6 months
        signalsBySymbol: signalsBySymbol.slice(0, 6), // Top 6 symbols
        performanceByStrategy: performanceByStrategy.slice(0, 5) // Top 5 strategies
      });

    } catch (error) {
      console.error('Error fetching analytics:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <ProtectedRoute>
        <Layout showSidebar={true}>
          <div className="p-6 flex items-center justify-center min-h-96">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
              <p className="text-muted-foreground">جاري تحليل البيانات...</p>
            </div>
          </div>
        </Layout>
      </ProtectedRoute>
    );
  }

  if (!analytics) {
    return (
      <ProtectedRoute>
        <Layout showSidebar={true}>
          <div className="p-6">
            <div className="text-center py-12">
              <BarChart3 className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-medium text-foreground mb-2">لا توجد بيانات للتحليل</h3>
              <p className="text-muted-foreground">قم بتوليد بعض الإشارات أولاً لرؤية التحليلات</p>
              <Button className="mt-4" onClick={() => window.location.href = '/signals/generate'}>
                توليد إشارة جديدة
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
        <title>التحليلات - منصة الإشارات</title>
      </Head>

      <Layout showSidebar={true}>
        <div className="p-6 space-y-6">
          {/* Header */}
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-foreground">التحليلات</h1>
              <p className="text-muted-foreground mt-2">
                تحليل شامل لأداء التداول والإشارات
              </p>
            </div>
            
            <div className="flex items-center gap-4">
              <select
                value={timeRange}
                onChange={(e) => setTimeRange(e.target.value)}
                className="px-3 py-2 border border-border rounded-md bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
              >
                <option value="7d">آخر 7 أيام</option>
                <option value="30d">آخر 30 يوم</option>
                <option value="90d">آخر 90 يوم</option>
                <option value="1y">آخر سنة</option>
              </select>
              
              <Button variant="outline" leftIcon={<Filter className="w-4 h-4" />}>
                مرشحات متقدمة
              </Button>
            </div>
          </div>

          {/* Key Metrics */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <Card className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">إجمالي الإشارات</p>
                  <p className="text-3xl font-bold text-foreground">{analytics.totalSignals}</p>
                  <p className="text-sm text-muted-foreground mt-1">
                    {analytics.winningSignals} رابحة • {analytics.losingSignals} خاسرة
                  </p>
                </div>
                <div className="p-3 bg-primary/10 rounded-full">
                  <Activity className="w-6 h-6 text-primary" />
                </div>
              </div>
            </Card>

            <Card className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">نسبة النجاح</p>
                  <p className="text-3xl font-bold text-foreground">{analytics.winRate.toFixed(1)}%</p>
                  <p className={`text-sm mt-1 ${analytics.winRate >= 60 ? 'text-success' : analytics.winRate >= 40 ? 'text-warning' : 'text-destructive'}`}>
                    {analytics.winRate >= 60 ? 'ممتاز' : analytics.winRate >= 40 ? 'جيد' : 'يحتاج تحسين'}
                  </p>
                </div>
                <div className="p-3 bg-success/10 rounded-full">
                  <Target className="w-6 h-6 text-success" />
                </div>
              </div>
            </Card>

            <Card className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">الربح الإجمالي</p>
                  <p className={`text-3xl font-bold ${analytics.totalProfit >= 0 ? 'text-success' : 'text-destructive'}`}>
                    ${analytics.totalProfit.toFixed(2)}
                  </p>
                  <p className="text-sm text-muted-foreground mt-1">
                    متوسط الربح: ${analytics.averageProfit.toFixed(2)}
                  </p>
                </div>
                <div className={`p-3 rounded-full ${analytics.totalProfit >= 0 ? 'bg-success/10' : 'bg-destructive/10'}`}>
                  <DollarSign className={`w-6 h-6 ${analytics.totalProfit >= 0 ? 'text-success' : 'text-destructive'}`} />
                </div>
              </div>
            </Card>

            <Card className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">متوسط المخاطرة</p>
                  <p className="text-3xl font-bold text-foreground">${analytics.averageLoss.toFixed(2)}</p>
                  <p className="text-sm text-muted-foreground mt-1">
                    نسبة المخاطرة للعائد: 1:{(analytics.averageProfit / Math.max(analytics.averageLoss, 1)).toFixed(1)}
                  </p>
                </div>
                <div className="p-3 bg-warning/10 rounded-full">
                  <TrendingDown className="w-6 h-6 text-warning" />
                </div>
              </div>
            </Card>
          </div>

          {/* Charts Row */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Profit Over Time */}
            <Card className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-semibold text-foreground">الربح عبر الوقت</h3>
                <BarChart3 className="w-5 h-5 text-muted-foreground" />
              </div>
              
              <div className="space-y-4">
                {analytics.profitByMonth.map((item, index) => (
                  <div key={index} className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">{item.month}</span>
                    <div className="flex items-center gap-2">
                      <div className={`w-24 h-2 rounded-full ${item.profit >= 0 ? 'bg-success' : 'bg-destructive'}`} 
                           style={{ 
                             width: `${Math.min(Math.abs(item.profit) / Math.max(...analytics.profitByMonth.map(p => Math.abs(p.profit)), 1) * 100, 100)}px` 
                           }} 
                      />
                      <span className={`text-sm font-medium ${item.profit >= 0 ? 'text-success' : 'text-destructive'}`}>
                        ${item.profit.toFixed(2)}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </Card>

            {/* Performance by Symbol */}
            <Card className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-semibold text-foreground">الأداء حسب الرمز</h3>
                <PieChart className="w-5 h-5 text-muted-foreground" />
              </div>
              
              <div className="space-y-4">
                {analytics.signalsBySymbol.map((item, index) => (
                  <div key={index} className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-3 h-3 rounded-full bg-primary" />
                      <span className="font-medium text-foreground">{item.symbol}</span>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-medium text-foreground">{item.winRate.toFixed(1)}%</p>
                      <p className="text-xs text-muted-foreground">{item.count} إشارة</p>
                    </div>
                  </div>
                ))}
              </div>
            </Card>
          </div>

          {/* Strategy Performance */}
          <Card className="p-6">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-semibold text-foreground">أداء الاستراتيجيات</h3>
              <Button variant="outline" size="sm">
                عرض التفاصيل
              </Button>
            </div>
            
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-border">
                    <th className="text-right py-3 px-4 font-medium text-muted-foreground">الاستراتيجية</th>
                    <th className="text-right py-3 px-4 font-medium text-muted-foreground">نسبة النجاح</th>
                    <th className="text-right py-3 px-4 font-medium text-muted-foreground">الربح الإجمالي</th>
                    <th className="text-right py-3 px-4 font-medium text-muted-foreground">التقييم</th>
                  </tr>
                </thead>
                <tbody>
                  {analytics.performanceByStrategy.map((strategy, index) => (
                    <tr key={index} className="border-b border-border hover:bg-muted/5">
                      <td className="py-3 px-4 font-medium text-foreground">{strategy.strategy}</td>
                      <td className="py-3 px-4">
                        <span className={`font-medium ${
                          strategy.winRate >= 70 ? 'text-success' :
                          strategy.winRate >= 50 ? 'text-warning' : 'text-destructive'
                        }`}>
                          {strategy.winRate.toFixed(1)}%
                        </span>
                      </td>
                      <td className="py-3 px-4">
                        <span className={`font-medium ${strategy.profit >= 0 ? 'text-success' : 'text-destructive'}`}>
                          ${strategy.profit.toFixed(2)}
                        </span>
                      </td>
                      <td className="py-3 px-4">
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                          strategy.winRate >= 70 && strategy.profit >= 0 ? 'bg-success/10 text-success' :
                          strategy.winRate >= 50 || strategy.profit >= 0 ? 'bg-warning/10 text-warning' :
                          'bg-destructive/10 text-destructive'
                        }`}>
                          {strategy.winRate >= 70 && strategy.profit >= 0 ? 'ممتاز' :
                           strategy.winRate >= 50 || strategy.profit >= 0 ? 'جيد' : 'ضعيف'}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Card>
        </div>
      </Layout>
    </ProtectedRoute>
  );
};

export default AnalyticsPage;