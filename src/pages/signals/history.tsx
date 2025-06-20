import React, { useState, useEffect } from 'react';
import type { NextPage } from 'next';
import Head from 'next/head';
import { Calendar, Search, Filter, Download, ArrowUp, ArrowDown, TrendingUp, Activity, Clock } from 'lucide-react';

import { Layout } from '@/components/organisms/Layout';
import { ProtectedRoute } from '@/components/organisms/ProtectedRoute';
import { Card } from '@/components/atoms/Card';
import { Button } from '@/components/atoms/Button';
import { Input } from '@/components/atoms/Input';

interface HistorySignal {
  id: string;
  symbol: string;
  direction: 'BUY' | 'SELL';
  entryPrice: number;
  exitPrice?: number;
  targetPrice: number;
  stopLoss: number;
  confidence: number;
  status: 'pending' | 'success' | 'failed' | 'expired';
  profitLoss?: number;
  profitLossPercentage?: number;
  timeframe: string;
  strategy: string;
  createdAt: string;
  closedAt?: string;
}

const mockHistoryData: HistorySignal[] = [
  {
    id: '1',
    symbol: 'EUR/USD',
    direction: 'BUY',
    entryPrice: 1.0850,
    exitPrice: 1.0920,
    targetPrice: 1.0950,
    stopLoss: 1.0800,
    confidence: 85,
    status: 'success',
    profitLoss: 70,
    profitLossPercentage: 6.45,
    timeframe: '1h',
    strategy: 'combined',
    createdAt: '2024-12-20T10:30:00Z',
    closedAt: '2024-12-20T14:15:00Z',
  },
  {
    id: '2',
    symbol: 'GBP/USD',
    direction: 'SELL',
    entryPrice: 1.2650,
    exitPrice: 1.2580,
    targetPrice: 1.2550,
    stopLoss: 1.2700,
    confidence: 78,
    status: 'success',
    profitLoss: 70,
    profitLossPercentage: 5.53,
    timeframe: '4h',
    strategy: 'technical',
    createdAt: '2024-12-20T08:00:00Z',
    closedAt: '2024-12-20T16:30:00Z',
  },
  {
    id: '3',
    symbol: 'USD/JPY',
    direction: 'BUY',
    entryPrice: 149.50,
    targetPrice: 150.20,
    stopLoss: 149.00,
    confidence: 92,
    status: 'pending',
    timeframe: '1h',
    strategy: 'ai',
    createdAt: '2024-12-20T15:45:00Z',
  },
  {
    id: '4',
    symbol: 'EUR/USD',
    direction: 'SELL',
    entryPrice: 1.0890,
    exitPrice: 1.0920,
    targetPrice: 1.0820,
    stopLoss: 1.0940,
    confidence: 73,
    status: 'failed',
    profitLoss: -30,
    profitLossPercentage: -2.78,
    timeframe: '15m',
    strategy: 'sentiment',
    createdAt: '2024-12-19T14:20:00Z',
    closedAt: '2024-12-19T16:45:00Z',
  },
];

const SignalHistoryPage: NextPage = () => {
  const [signals, setSignals] = useState<HistorySignal[]>(mockHistoryData);
  const [filteredSignals, setFilteredSignals] = useState<HistorySignal[]>(mockHistoryData);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [symbolFilter, setSymbolFilter] = useState<string>('all');

  useEffect(() => {
    let filtered = signals;

    if (searchTerm) {
      filtered = filtered.filter(signal =>
        signal.symbol.toLowerCase().includes(searchTerm.toLowerCase()) ||
        signal.strategy.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    if (statusFilter !== 'all') {
      filtered = filtered.filter(signal => signal.status === statusFilter);
    }

    if (symbolFilter !== 'all') {
      filtered = filtered.filter(signal => signal.symbol === symbolFilter);
    }

    setFilteredSignals(filtered);
  }, [signals, searchTerm, statusFilter, symbolFilter]);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'success':
        return 'text-success bg-success/10';
      case 'failed':
        return 'text-destructive bg-destructive/10';
      case 'pending':
        return 'text-warning bg-warning/10';
      case 'expired':
        return 'text-muted-foreground bg-muted/10';
      default:
        return 'text-muted-foreground bg-muted/10';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'success':
        return 'ناجح';
      case 'failed':
        return 'فاشل';
      case 'pending':
        return 'قيد الانتظار';
      case 'expired':
        return 'منتهي الصلاحية';
      default:
        return 'غير معروف';
    }
  };

  const formatDate = (dateString: string) => {
    return new Intl.DateTimeFormat('ar-SA', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    }).format(new Date(dateString));
  };

  const calculateStats = () => {
    const total = signals.length;
    const successful = signals.filter(s => s.status === 'success').length;
    const failed = signals.filter(s => s.status === 'failed').length;
    const pending = signals.filter(s => s.status === 'pending').length;
    const totalProfit = signals.reduce((sum, s) => sum + (s.profitLoss || 0), 0);

    return {
      total,
      successful,
      failed,
      pending,
      successRate: total > 0 ? ((successful / (successful + failed)) * 100).toFixed(1) : '0',
      totalProfit: totalProfit.toFixed(2),
    };
  };

  const stats = calculateStats();

  const exportData = () => {
    const csvContent = [
      ['الرمز', 'الاتجاه', 'سعر الدخول', 'سعر الخروج', 'الهدف', 'وقف الخسارة', 'الثقة', 'الحالة', 'الربح/الخسارة', 'النسبة المئوية', 'الإطار الزمني', 'الاستراتيجية', 'تاريخ الإنشاء'],
      ...filteredSignals.map(signal => [
        signal.symbol,
        signal.direction === 'BUY' ? 'شراء' : 'بيع',
        signal.entryPrice.toString(),
        signal.exitPrice?.toString() || '',
        signal.targetPrice.toString(),
        signal.stopLoss.toString(),
        `${signal.confidence}%`,
        getStatusText(signal.status),
        signal.profitLoss?.toString() || '',
        signal.profitLossPercentage ? `${signal.profitLossPercentage}%` : '',
        signal.timeframe,
        signal.strategy,
        formatDate(signal.createdAt),
      ])
    ].map(row => row.join(',')).join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    if (link.download !== undefined) {
      const url = URL.createObjectURL(blob);
      link.setAttribute('href', url);
      link.setAttribute('download', `signals_history_${new Date().toISOString().split('T')[0]}.csv`);
      link.style.visibility = 'hidden';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
  };

  return (
    <ProtectedRoute>
      <Head>
        <title>سجل الإشارات - منصة الإشارات</title>
        <meta name="description" content="مراجعة سجل الإشارات وتحليل الأداء" />
      </Head>

      <Layout showSidebar={true}>
        <div className="p-6 space-y-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-foreground">سجل الإشارات</h1>
              <p className="text-muted-foreground mt-2">
                مراجعة شاملة لجميع إشارات التداول وتحليل الأداء
              </p>
            </div>
            <Button onClick={exportData} leftIcon={<Download className="w-4 h-4" />}>
              تصدير البيانات
            </Button>
          </div>

          {/* إحصائيات سريعة */}
          <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
            <Card className="p-4 text-center">
              <Activity className="w-6 h-6 text-primary mx-auto mb-2" />
              <div className="text-xl font-bold text-foreground">{stats.total}</div>
              <div className="text-sm text-muted-foreground">إجمالي الإشارات</div>
            </Card>
            <Card className="p-4 text-center">
              <TrendingUp className="w-6 h-6 text-success mx-auto mb-2" />
              <div className="text-xl font-bold text-foreground">{stats.successful}</div>
              <div className="text-sm text-muted-foreground">إشارات ناجحة</div>
            </Card>
            <Card className="p-4 text-center">
              <div className="w-6 h-6 text-destructive mx-auto mb-2">❌</div>
              <div className="text-xl font-bold text-foreground">{stats.failed}</div>
              <div className="text-sm text-muted-foreground">إشارات فاشلة</div>
            </Card>
            <Card className="p-4 text-center">
              <Clock className="w-6 h-6 text-warning mx-auto mb-2" />
              <div className="text-xl font-bold text-foreground">{stats.pending}</div>
              <div className="text-sm text-muted-foreground">قيد الانتظار</div>
            </Card>
            <Card className="p-4 text-center">
              <div className="w-6 h-6 text-primary mx-auto mb-2">📊</div>
              <div className="text-xl font-bold text-foreground">{stats.successRate}%</div>
              <div className="text-sm text-muted-foreground">نسبة النجاح</div>
            </Card>
          </div>

          {/* فلاتر البحث */}
          <Card className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div>
                <Input
                  placeholder="البحث في الإشارات..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  leftIcon={<Search className="w-4 h-4" />}
                />
              </div>
              <div>
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="w-full px-3 py-2 border border-border rounded-md bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                >
                  <option value="all">جميع الحالات</option>
                  <option value="success">ناجح</option>
                  <option value="failed">فاشل</option>
                  <option value="pending">قيد الانتظار</option>
                  <option value="expired">منتهي الصلاحية</option>
                </select>
              </div>
              <div>
                <select
                  value={symbolFilter}
                  onChange={(e) => setSymbolFilter(e.target.value)}
                  className="w-full px-3 py-2 border border-border rounded-md bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                >
                  <option value="all">جميع الأزواج</option>
                  <option value="EUR/USD">EUR/USD</option>
                  <option value="GBP/USD">GBP/USD</option>
                  <option value="USD/JPY">USD/JPY</option>
                  <option value="USD/CHF">USD/CHF</option>
                </select>
              </div>
              <div className="flex space-x-2 space-x-reverse">
                <Button variant="outline" leftIcon={<Filter className="w-4 h-4" />}>
                  مرشحات متقدمة
                </Button>
                <Button variant="outline" leftIcon={<Calendar className="w-4 h-4" />}>
                  التاريخ
                </Button>
              </div>
            </div>
          </Card>

          {/* جدول الإشارات */}
          <Card className="overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-muted/30">
                  <tr>
                    <th className="px-6 py-3 text-right text-xs font-medium text-muted-foreground uppercase tracking-wider">
                      الإشارة
                    </th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-muted-foreground uppercase tracking-wider">
                      الأسعار
                    </th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-muted-foreground uppercase tracking-wider">
                      النتيجة
                    </th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-muted-foreground uppercase tracking-wider">
                      التفاصيل
                    </th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-muted-foreground uppercase tracking-wider">
                      الحالة
                    </th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-muted-foreground uppercase tracking-wider">
                      التاريخ
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-background divide-y divide-border">
                  {filteredSignals.map((signal) => (
                    <tr key={signal.id} className="hover:bg-muted/20">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center space-x-3 space-x-reverse">
                          <div className={`p-2 rounded-full ${signal.direction === 'BUY' ? 'bg-success/10' : 'bg-destructive/10'}`}>
                            {signal.direction === 'BUY' ? (
                              <ArrowUp className="w-4 h-4 text-success" />
                            ) : (
                              <ArrowDown className="w-4 h-4 text-destructive" />
                            )}
                          </div>
                          <div>
                            <div className="text-sm font-medium text-foreground">
                              {signal.direction === 'BUY' ? 'شراء' : 'بيع'} {signal.symbol}
                            </div>
                            <div className="text-sm text-muted-foreground">
                              {signal.confidence}% ثقة
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm">
                        <div className="space-y-1">
                          <div>دخول: <span className="font-medium">{signal.entryPrice}</span></div>
                          {signal.exitPrice && (
                            <div>خروج: <span className="font-medium">{signal.exitPrice}</span></div>
                          )}
                          <div className="text-xs text-muted-foreground">
                            هدف: {signal.targetPrice} | وقف: {signal.stopLoss}
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {signal.profitLoss !== undefined ? (
                          <div className={`text-sm font-medium ${signal.profitLoss >= 0 ? 'text-success' : 'text-destructive'}`}>
                            <div>${Math.abs(signal.profitLoss)}</div>
                            <div className="text-xs">
                              {signal.profitLossPercentage && `${signal.profitLossPercentage > 0 ? '+' : ''}${signal.profitLossPercentage}%`}
                            </div>
                          </div>
                        ) : (
                          <div className="text-sm text-muted-foreground">-</div>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-muted-foreground">
                        <div>{signal.timeframe}</div>
                        <div className="text-xs">{signal.strategy}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(signal.status)}`}>
                          {getStatusText(signal.status)}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-muted-foreground">
                        <div>{formatDate(signal.createdAt)}</div>
                        {signal.closedAt && (
                          <div className="text-xs">انتهت: {formatDate(signal.closedAt)}</div>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {filteredSignals.length === 0 && (
              <div className="text-center py-12">
                <Activity className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-medium text-foreground mb-2">
                  لا توجد إشارات
                </h3>
                <p className="text-muted-foreground">
                  لا توجد إشارات تطابق معايير البحث المحددة
                </p>
              </div>
            )}
          </Card>
        </div>
      </Layout>
    </ProtectedRoute>
  );
};

export default SignalHistoryPage;