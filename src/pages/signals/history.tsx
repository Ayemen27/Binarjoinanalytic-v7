import React, { useState, useEffect } from 'react';
import type { NextPage } from 'next';
import Head from 'next/head';
import { Search, Filter, Download, TrendingUp, TrendingDown, Calendar, BarChart3 } from 'lucide-react';

import { Layout } from '@/components/organisms/Layout';
import { ProtectedRoute } from '@/components/organisms/ProtectedRoute';
import { Card } from '@/components/atoms/Card';
import { Button } from '@/components/atoms/Button';
import { Input } from '@/components/atoms/Input';
import { useAuth } from '@/providers/AuthProvider';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';

interface Signal {
  id: string;
  symbol: string;
  direction: 'CALL' | 'PUT';
  entry_price: number;
  target_price: number;
  stop_loss: number;
  confidence_score: number;
  status: 'pending' | 'active' | 'won' | 'lost' | 'expired';
  profit_loss: number | null;
  profit_loss_percentage: number | null;
  created_at: string;
  expiry_time: string;
  strategy_name: string;
  risk_level: string;
}

const SignalHistoryPage: NextPage = () => {
  const { user } = useAuth();
  const [signals, setSignals] = useState<Signal[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [symbolFilter, setSymbolFilter] = useState('all');
  const [filteredSignals, setFilteredSignals] = useState<Signal[]>([]);
  
  const supabase = createClientComponentClient();

  useEffect(() => {
    if (user) {
      fetchSignals();
    }
  }, [user]);

  useEffect(() => {
    filterSignals();
  }, [signals, searchTerm, statusFilter, symbolFilter]);

  const fetchSignals = async () => {
    try {
      const { data, error } = await supabase
        .from('signals')
        .select('*')
        .eq('user_id', user?.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setSignals(data || []);
    } catch (error) {
      console.error('Error fetching signals:', error);
    } finally {
      setLoading(false);
    }
  };

  const filterSignals = () => {
    let filtered = signals;

    if (searchTerm) {
      filtered = filtered.filter(signal =>
        signal.symbol.toLowerCase().includes(searchTerm.toLowerCase()) ||
        signal.strategy_name.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    if (statusFilter !== 'all') {
      filtered = filtered.filter(signal => signal.status === statusFilter);
    }

    if (symbolFilter !== 'all') {
      filtered = filtered.filter(signal => signal.symbol === symbolFilter);
    }

    setFilteredSignals(filtered);
  };

  const getStatusBadge = (status: string) => {
    const styles = {
      pending: 'bg-warning/10 text-warning border-warning/20',
      active: 'bg-primary/10 text-primary border-primary/20',
      won: 'bg-success/10 text-success border-success/20',
      lost: 'bg-destructive/10 text-destructive border-destructive/20',
      expired: 'bg-muted/10 text-muted-foreground border-muted/20',
    };

    const labels = {
      pending: 'في الانتظار',
      active: 'نشط',
      won: 'ربح',
      lost: 'خسارة',
      expired: 'منتهي',
    };

    return (
      <span className={`px-2 py-1 rounded-full text-xs font-medium border ${styles[status as keyof typeof styles]}`}>
        {labels[status as keyof typeof labels]}
      </span>
    );
  };

  const exportSignals = async () => {
    const csvData = filteredSignals.map(signal => ({
      'الرمز': signal.symbol,
      'الاتجاه': signal.direction === 'CALL' ? 'صاعد' : 'هابط',
      'سعر الدخول': signal.entry_price,
      'الهدف': signal.target_price,
      'وقف الخسارة': signal.stop_loss,
      'نسبة الثقة': `${signal.confidence_score}%`,
      'الحالة': signal.status,
      'الربح/الخسارة': signal.profit_loss || 0,
      'النسبة المئوية': signal.profit_loss_percentage ? `${signal.profit_loss_percentage}%` : '0%',
      'تاريخ الإنشاء': new Date(signal.created_at).toLocaleDateString('ar-SA'),
      'الاستراتيجية': signal.strategy_name,
    }));

    const csvContent = [
      Object.keys(csvData[0]).join(','),
      ...csvData.map(row => Object.values(row).join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `signals_export_${new Date().toISOString().split('T')[0]}.csv`;
    link.click();
  };

  const calculateStats = () => {
    const total = filteredSignals.length;
    const won = filteredSignals.filter(s => s.status === 'won').length;
    const lost = filteredSignals.filter(s => s.status === 'lost').length;
    const active = filteredSignals.filter(s => s.status === 'active').length;
    const winRate = total > 0 ? ((won / (won + lost)) * 100) : 0;
    const totalProfit = filteredSignals.reduce((sum, s) => sum + (s.profit_loss || 0), 0);

    return { total, won, lost, active, winRate, totalProfit };
  };

  const stats = calculateStats();
  const uniqueSymbols = [...new Set(signals.map(s => s.symbol))];

  if (loading) {
    return (
      <ProtectedRoute>
        <Layout showSidebar={true}>
          <div className="p-6 flex items-center justify-center min-h-96">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
              <p className="text-muted-foreground">جاري تحميل السجل...</p>
            </div>
          </div>
        </Layout>
      </ProtectedRoute>
    );
  }

  return (
    <ProtectedRoute>
      <Head>
        <title>سجل الإشارات - منصة الإشارات</title>
      </Head>

      <Layout showSidebar={true}>
        <div className="p-6 space-y-6">
          {/* Header */}
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-foreground">سجل الإشارات</h1>
              <p className="text-muted-foreground mt-2">
                راجع جميع إشاراتك السابقة وتحليل الأداء
              </p>
            </div>
            <Button onClick={exportSignals} leftIcon={<Download className="w-4 h-4" />}>
              تصدير CSV
            </Button>
          </div>

          {/* Statistics Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
            <Card className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">إجمالي الإشارات</p>
                  <p className="text-2xl font-bold">{stats.total}</p>
                </div>
                <BarChart3 className="w-8 h-8 text-primary" />
              </div>
            </Card>

            <Card className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">الإشارات الرابحة</p>
                  <p className="text-2xl font-bold text-success">{stats.won}</p>
                </div>
                <TrendingUp className="w-8 h-8 text-success" />
              </div>
            </Card>

            <Card className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">الإشارات الخاسرة</p>
                  <p className="text-2xl font-bold text-destructive">{stats.lost}</p>
                </div>
                <TrendingDown className="w-8 h-8 text-destructive" />
              </div>
            </Card>

            <Card className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">نسبة النجاح</p>
                  <p className="text-2xl font-bold">{stats.winRate.toFixed(1)}%</p>
                </div>
                <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                  <span className="text-xs font-bold text-primary">%</span>
                </div>
              </div>
            </Card>

            <Card className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">الربح الإجمالي</p>
                  <p className={`text-2xl font-bold ${stats.totalProfit >= 0 ? 'text-success' : 'text-destructive'}`}>
                    ${stats.totalProfit.toFixed(2)}
                  </p>
                </div>
                <div className="w-8 h-8 rounded-full bg-warning/10 flex items-center justify-center">
                  <span className="text-xs font-bold text-warning">$</span>
                </div>
              </div>
            </Card>
          </div>

          {/* Filters */}
          <Card className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div>
                <Input
                  placeholder="البحث في الإشارات..."
                  leftIcon={<Search className="w-4 h-4" />}
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>

              <div>
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="w-full px-3 py-2 border border-border rounded-md bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                >
                  <option value="all">جميع الحالات</option>
                  <option value="active">نشط</option>
                  <option value="won">ربح</option>
                  <option value="lost">خسارة</option>
                  <option value="expired">منتهي</option>
                  <option value="pending">في الانتظار</option>
                </select>
              </div>

              <div>
                <select
                  value={symbolFilter}
                  onChange={(e) => setSymbolFilter(e.target.value)}
                  className="w-full px-3 py-2 border border-border rounded-md bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                >
                  <option value="all">جميع الرموز</option>
                  {uniqueSymbols.map(symbol => (
                    <option key={symbol} value={symbol}>{symbol}</option>
                  ))}
                </select>
              </div>

              <div>
                <Button variant="outline" fullWidth leftIcon={<Filter className="w-4 h-4" />}>
                  مرشحات متقدمة
                </Button>
              </div>
            </div>
          </Card>

          {/* Signals Table */}
          <Card className="p-6">
            {filteredSignals.length === 0 ? (
              <div className="text-center py-12">
                <BarChart3 className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-medium text-foreground mb-2">لا توجد إشارات</h3>
                <p className="text-muted-foreground">
                  {signals.length === 0 
                    ? 'لم تقم بتوليد أي إشارات بعد'
                    : 'لا توجد إشارات مطابقة للمرشحات المحددة'
                  }
                </p>
                {signals.length === 0 && (
                  <Button className="mt-4" onClick={() => window.location.href = '/signals/generate'}>
                    توليد إشارة جديدة
                  </Button>
                )}
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-border">
                      <th className="text-right py-3 px-4 font-medium text-muted-foreground">الرمز</th>
                      <th className="text-right py-3 px-4 font-medium text-muted-foreground">الاتجاه</th>
                      <th className="text-right py-3 px-4 font-medium text-muted-foreground">سعر الدخول</th>
                      <th className="text-right py-3 px-4 font-medium text-muted-foreground">الهدف</th>
                      <th className="text-right py-3 px-4 font-medium text-muted-foreground">الثقة</th>
                      <th className="text-right py-3 px-4 font-medium text-muted-foreground">الحالة</th>
                      <th className="text-right py-3 px-4 font-medium text-muted-foreground">الربح/الخسارة</th>
                      <th className="text-right py-3 px-4 font-medium text-muted-foreground">التاريخ</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredSignals.map((signal) => (
                      <tr key={signal.id} className="border-b border-border hover:bg-muted/5">
                        <td className="py-3 px-4 font-medium">{signal.symbol}</td>
                        <td className="py-3 px-4">
                          <div className={`flex items-center gap-2 ${signal.direction === 'CALL' ? 'text-success' : 'text-destructive'}`}>
                            {signal.direction === 'CALL' ? 
                              <TrendingUp className="w-4 h-4" /> : 
                              <TrendingDown className="w-4 h-4" />
                            }
                            {signal.direction === 'CALL' ? 'صاعد' : 'هابط'}
                          </div>
                        </td>
                        <td className="py-3 px-4">{signal.entry_price}</td>
                        <td className="py-3 px-4">{signal.target_price}</td>
                        <td className="py-3 px-4">{signal.confidence_score}%</td>
                        <td className="py-3 px-4">{getStatusBadge(signal.status)}</td>
                        <td className="py-3 px-4">
                          {signal.profit_loss ? (
                            <span className={signal.profit_loss >= 0 ? 'text-success' : 'text-destructive'}>
                              ${signal.profit_loss.toFixed(2)}
                              {signal.profit_loss_percentage && (
                                <span className="text-xs ml-1">
                                  ({signal.profit_loss_percentage.toFixed(1)}%)
                                </span>
                              )}
                            </span>
                          ) : (
                            <span className="text-muted-foreground">-</span>
                          )}
                        </td>
                        <td className="py-3 px-4 text-muted-foreground">
                          {new Date(signal.created_at).toLocaleDateString('ar-SA')}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </Card>
        </div>
      </Layout>
    </ProtectedRoute>
  );
};

export default SignalHistoryPage;