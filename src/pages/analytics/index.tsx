import React, { useState } from 'react';
import type { NextPage } from 'next';
import Head from 'next/head';
import { BarChart3, TrendingUp, PieChart, Activity, DollarSign, Users, Calendar, Download } from 'lucide-react';

import { Layout } from '@/components/organisms/Layout';
import { ProtectedRoute } from '@/components/organisms/ProtectedRoute';
import { Card } from '@/components/atoms/Card';
import { Button } from '@/components/atoms/Button';

const AnalyticsPage: NextPage = () => {
  const [timeRange, setTimeRange] = useState('30d');

  const stats = [
    {
      title: 'إجمالي الإشارات',
      value: '1,234',
      change: '+15.3%',
      changeType: 'positive',
      icon: Activity,
      color: 'text-primary',
      bgColor: 'bg-primary/10',
    },
    {
      title: 'نسبة النجاح',
      value: '87.5%',
      change: '+2.1%',
      changeType: 'positive',
      icon: TrendingUp,
      color: 'text-success',
      bgColor: 'bg-success/10',
    },
    {
      title: 'الربح الإجمالي',
      value: '$12,847',
      change: '+24.7%',
      changeType: 'positive',
      icon: DollarSign,
      color: 'text-warning',
      bgColor: 'bg-warning/10',
    },
    {
      title: 'المستخدمين النشطين',
      value: '2,847',
      change: '+8.2%',
      changeType: 'positive',
      icon: Users,
      color: 'text-accent',
      bgColor: 'bg-accent/10',
    },
  ];

  const chartData = {
    performance: [
      { name: 'يناير', signals: 65, success: 56 },
      { name: 'فبراير', signals: 78, success: 68 },
      { name: 'مارس', signals: 92, success: 81 },
      { name: 'أبريل', signals: 88, success: 77 },
      { name: 'مايو', signals: 105, success: 93 },
      { name: 'يونيو', signals: 118, success: 104 },
    ],
    distribution: [
      { name: 'EUR/USD', value: 35, color: '#3b82f6' },
      { name: 'GBP/USD', value: 25, color: '#10b981' },
      { name: 'USD/JPY', value: 20, color: '#f59e0b' },
      { name: 'USD/CHF', value: 12, color: '#ef4444' },
      { name: 'أخرى', value: 8, color: '#8b5cf6' },
    ],
  };

  return (
    <ProtectedRoute>
      <Head>
        <title>التحليلات - منصة الإشارات</title>
        <meta name="description" content="تحليلات شاملة لأداء الإشارات والمستخدمين" />
      </Head>

      <Layout showSidebar={true}>
        <div className="p-6 space-y-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-foreground">التحليلات</h1>
              <p className="text-muted-foreground mt-2">
                تحليلات شاملة لأداء المنصة والإشارات
              </p>
            </div>
            <div className="flex space-x-3 space-x-reverse">
              <select
                value={timeRange}
                onChange={(e) => setTimeRange(e.target.value)}
                className="px-3 py-2 border border-border rounded-md bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
              >
                <option value="7d">7 أيام</option>
                <option value="30d">30 يوم</option>
                <option value="90d">90 يوم</option>
                <option value="1y">سنة واحدة</option>
              </select>
              <Button leftIcon={<Download className="w-4 h-4" />}>
                تصدير التقرير
              </Button>
            </div>
          </div>

          {/* إحصائيات رئيسية */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {stats.map((stat, index) => (
              <Card key={index} className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">
                      {stat.title}
                    </p>
                    <p className="text-2xl font-bold text-foreground mt-2">
                      {stat.value}
                    </p>
                    <p className={`text-sm mt-1 ${
                      stat.changeType === 'positive' ? 'text-success' : 'text-destructive'
                    }`}>
                      {stat.change} من الشهر الماضي
                    </p>
                  </div>
                  <div className={`p-3 rounded-full ${stat.bgColor}`}>
                    <stat.icon className={`w-6 h-6 ${stat.color}`} />
                  </div>
                </div>
              </Card>
            ))}
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* رسم بياني للأداء */}
            <Card className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-semibold text-foreground">أداء الإشارات الشهري</h2>
                <BarChart3 className="w-5 h-5 text-muted-foreground" />
              </div>
              
              <div className="space-y-4">
                {chartData.performance.map((month, index) => (
                  <div key={index} className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-foreground">{month.name}</span>
                      <span className="text-muted-foreground">
                        {month.success}/{month.signals} ({Math.round((month.success/month.signals)*100)}%)
                      </span>
                    </div>
                    <div className="w-full bg-muted rounded-full h-2">
                      <div 
                        className="bg-primary h-2 rounded-full transition-all"
                        style={{ width: `${(month.success/month.signals)*100}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </Card>

            {/* توزيع أزواج العملات */}
            <Card className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-semibold text-foreground">توزيع أزواج العملات</h2>
                <PieChart className="w-5 h-5 text-muted-foreground" />
              </div>
              
              <div className="space-y-4">
                {chartData.distribution.map((item, index) => (
                  <div key={index} className="flex items-center justify-between">
                    <div className="flex items-center space-x-3 space-x-reverse">
                      <div 
                        className="w-3 h-3 rounded-full"
                        style={{ backgroundColor: item.color }}
                      />
                      <span className="text-sm font-medium text-foreground">{item.name}</span>
                    </div>
                    <div className="flex items-center space-x-2 space-x-reverse">
                      <span className="text-sm text-muted-foreground">{item.value}%</span>
                      <div className="w-20 bg-muted rounded-full h-2">
                        <div 
                          className="h-2 rounded-full transition-all"
                          style={{ 
                            width: `${item.value}%`,
                            backgroundColor: item.color 
                          }}
                        />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </Card>
          </div>

          {/* جدول التفاصيل */}
          <Card className="overflow-hidden">
            <div className="p-6 border-b border-border">
              <h2 className="text-xl font-semibold text-foreground">أفضل الإشارات أداءً</h2>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-muted/30">
                  <tr>
                    <th className="px-6 py-3 text-right text-xs font-medium text-muted-foreground uppercase">الزوج</th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-muted-foreground uppercase">عدد الإشارات</th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-muted-foreground uppercase">نسبة النجاح</th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-muted-foreground uppercase">متوسط الربح</th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-muted-foreground uppercase">الحالة</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  <tr>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-foreground">EUR/USD</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-muted-foreground">245</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-success">89.2%</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-foreground">$156</td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-success/10 text-success">
                        ممتاز
                      </span>
                    </td>
                  </tr>
                  <tr>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-foreground">GBP/USD</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-muted-foreground">189</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-success">85.7%</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-foreground">$134</td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-success/10 text-success">
                        جيد
                      </span>
                    </td>
                  </tr>
                  <tr>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-foreground">USD/JPY</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-muted-foreground">156</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-warning">78.3%</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-foreground">$98</td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-warning/10 text-warning">
                        متوسط
                      </span>
                    </td>
                  </tr>
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