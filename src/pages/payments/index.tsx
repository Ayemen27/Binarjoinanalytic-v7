import React, { useState } from 'react';
import type { NextPage } from 'next';
import Head from 'next/head';
import { CreditCard, Calendar, DollarSign, Download, CheckCircle, XCircle, Clock } from 'lucide-react';

import { Layout } from '@/components/organisms/Layout';
import { ProtectedRoute } from '@/components/organisms/ProtectedRoute';
import { Card } from '@/components/atoms/Card';
import { Button } from '@/components/atoms/Button';

interface Subscription {
  id: string;
  name: string;
  price: number;
  currency: string;
  interval: 'monthly' | 'yearly';
  features: string[];
  isPopular?: boolean;
  isCurrent?: boolean;
}

interface PaymentHistory {
  id: string;
  amount: number;
  currency: string;
  status: 'success' | 'failed' | 'pending';
  date: string;
  description: string;
  invoiceUrl?: string;
}

const subscriptions: Subscription[] = [
  {
    id: 'basic',
    name: 'الأساسي',
    price: 49,
    currency: 'USD',
    interval: 'monthly',
    features: [
      '50 إشارة شهرياً',
      'تحليلات أساسية',
      'دعم عبر البريد الإلكتروني',
      'وصول للتطبيق المحمول'
    ]
  },
  {
    id: 'pro',
    name: 'المتقدم',
    price: 99,
    currency: 'USD',
    interval: 'monthly',
    features: [
      'إشارات غير محدودة',
      'تحليلات متقدمة',
      'إشعارات فورية',
      'دعم ذو أولوية',
      'تقارير مخصصة',
      'واجهة برمجة التطبيقات'
    ],
    isPopular: true,
    isCurrent: true
  },
  {
    id: 'enterprise',
    name: 'المؤسسي',
    price: 299,
    currency: 'USD',
    interval: 'monthly',
    features: [
      'جميع ميزات المتقدم',
      'إدارة فريق',
      'تكامل مخصص',
      'مدير حساب مخصص',
      'SLA مضمون',
      'تدريب وإعداد'
    ]
  }
];

const paymentHistory: PaymentHistory[] = [
  {
    id: '1',
    amount: 99,
    currency: 'USD',
    status: 'success',
    date: '2024-12-01T00:00:00Z',
    description: 'اشتراك المتقدم - ديسمبر 2024',
    invoiceUrl: '#'
  },
  {
    id: '2',
    amount: 99,
    currency: 'USD',
    status: 'success',
    date: '2024-11-01T00:00:00Z',
    description: 'اشتراك المتقدم - نوفمبر 2024',
    invoiceUrl: '#'
  },
  {
    id: '3',
    amount: 99,
    currency: 'USD',
    status: 'failed',
    date: '2024-10-01T00:00:00Z',
    description: 'اشتراك المتقدم - أكتوبر 2024 (فشل الدفع)',
  }
];

const PaymentsPage: NextPage = () => {
  const [selectedPlan, setSelectedPlan] = useState<string>('pro');

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'success':
        return <CheckCircle className="w-4 h-4 text-success" />;
      case 'failed':
        return <XCircle className="w-4 h-4 text-destructive" />;
      case 'pending':
        return <Clock className="w-4 h-4 text-warning" />;
      default:
        return null;
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'success':
        return 'مكتمل';
      case 'failed':
        return 'فشل';
      case 'pending':
        return 'قيد المعالجة';
      default:
        return 'غير معروف';
    }
  };

  const formatDate = (dateString: string) => {
    return new Intl.DateTimeFormat('ar-SA', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    }).format(new Date(dateString));
  };

  const handleUpgrade = (planId: string) => {
    // محاكاة عملية الترقية
    console.log('Upgrading to plan:', planId);
    // في التطبيق الحقيقي، هنا سيتم التوجه لصفحة الدفع
  };

  return (
    <ProtectedRoute>
      <Head>
        <title>الاشتراكات والمدفوعات - منصة الإشارات</title>
        <meta name="description" content="إدارة اشتراكك ومراجعة تاريخ المدفوعات" />
      </Head>

      <Layout showSidebar={true}>
        <div className="p-6 space-y-8">
          <div>
            <h1 className="text-3xl font-bold text-foreground">الاشتراكات والمدفوعات</h1>
            <p className="text-muted-foreground mt-2">
              إدارة اشتراكك ومراجعة تاريخ المدفوعات والفواتير
            </p>
          </div>

          {/* خطط الاشتراك */}
          <div>
            <h2 className="text-2xl font-semibold text-foreground mb-6">خطط الاشتراك</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {subscriptions.map((plan) => (
                <Card 
                  key={plan.id} 
                  className={`p-6 relative ${plan.isPopular ? 'border-primary border-2' : ''} ${plan.isCurrent ? 'bg-primary/5' : ''}`}
                >
                  {plan.isPopular && (
                    <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                      <span className="bg-primary text-primary-foreground px-3 py-1 rounded-full text-sm font-medium">
                        الأكثر شعبية
                      </span>
                    </div>
                  )}
                  
                  {plan.isCurrent && (
                    <div className="absolute top-4 right-4">
                      <span className="bg-success text-success-foreground px-2 py-1 rounded text-xs font-medium">
                        الحالي
                      </span>
                    </div>
                  )}

                  <div className="text-center space-y-4">
                    <h3 className="text-xl font-semibold text-foreground">{plan.name}</h3>
                    
                    <div>
                      <span className="text-3xl font-bold text-foreground">${plan.price}</span>
                      <span className="text-muted-foreground">/{plan.interval === 'monthly' ? 'شهر' : 'سنة'}</span>
                    </div>

                    <ul className="space-y-2 text-sm">
                      {plan.features.map((feature, index) => (
                        <li key={index} className="flex items-center space-x-2 space-x-reverse">
                          <CheckCircle className="w-4 h-4 text-success flex-shrink-0" />
                          <span className="text-muted-foreground">{feature}</span>
                        </li>
                      ))}
                    </ul>

                    <Button
                      fullWidth
                      variant={plan.isCurrent ? 'outline' : plan.isPopular ? 'default' : 'outline'}
                      onClick={() => handleUpgrade(plan.id)}
                      disabled={plan.isCurrent}
                    >
                      {plan.isCurrent ? 'الخطة الحالية' : 'ترقية الآن'}
                    </Button>
                  </div>
                </Card>
              ))}
            </div>
          </div>

          {/* معلومات الاشتراك الحالي */}
          <Card className="p-6">
            <h3 className="text-lg font-semibold text-foreground mb-4">معلومات الاشتراك الحالي</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="flex items-center space-x-3 space-x-reverse">
                <div className="p-2 bg-primary/10 rounded-lg">
                  <CreditCard className="w-5 h-5 text-primary" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">الخطة الحالية</p>
                  <p className="font-medium text-foreground">المتقدم</p>
                </div>
              </div>
              
              <div className="flex items-center space-x-3 space-x-reverse">
                <div className="p-2 bg-success/10 rounded-lg">
                  <DollarSign className="w-5 h-5 text-success" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">السعر الشهري</p>
                  <p className="font-medium text-foreground">$99</p>
                </div>
              </div>
              
              <div className="flex items-center space-x-3 space-x-reverse">
                <div className="p-2 bg-warning/10 rounded-lg">
                  <Calendar className="w-5 h-5 text-warning" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">تاريخ التجديد</p>
                  <p className="font-medium text-foreground">1 يناير 2025</p>
                </div>
              </div>
            </div>
            
            <div className="mt-6 pt-4 border-t border-border">
              <div className="flex space-x-3 space-x-reverse">
                <Button variant="outline">إلغاء الاشتراك</Button>
                <Button variant="outline">تحديث طريقة الدفع</Button>
                <Button>ترقية الخطة</Button>
              </div>
            </div>
          </Card>

          {/* تاريخ المدفوعات */}
          <div>
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-semibold text-foreground">تاريخ المدفوعات</h2>
              <Button variant="outline" leftIcon={<Download className="w-4 h-4" />}>
                تحميل الفواتير
              </Button>
            </div>

            <Card className="overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-muted/30">
                    <tr>
                      <th className="px-6 py-3 text-right text-xs font-medium text-muted-foreground uppercase">
                        التاريخ
                      </th>
                      <th className="px-6 py-3 text-right text-xs font-medium text-muted-foreground uppercase">
                        الوصف
                      </th>
                      <th className="px-6 py-3 text-right text-xs font-medium text-muted-foreground uppercase">
                        المبلغ
                      </th>
                      <th className="px-6 py-3 text-right text-xs font-medium text-muted-foreground uppercase">
                        الحالة
                      </th>
                      <th className="px-6 py-3 text-right text-xs font-medium text-muted-foreground uppercase">
                        الإجراءات
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-background divide-y divide-border">
                    {paymentHistory.map((payment) => (
                      <tr key={payment.id} className="hover:bg-muted/20">
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-foreground">
                          {formatDate(payment.date)}
                        </td>
                        <td className="px-6 py-4 text-sm text-muted-foreground">
                          {payment.description}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-foreground">
                          ${payment.amount} {payment.currency}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center space-x-2 space-x-reverse">
                            {getStatusIcon(payment.status)}
                            <span className="text-sm text-foreground">
                              {getStatusText(payment.status)}
                            </span>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm">
                          <div className="flex space-x-2 space-x-reverse">
                            {payment.invoiceUrl && (
                              <Button variant="ghost" size="sm">
                                تحميل الفاتورة
                              </Button>
                            )}
                            {payment.status === 'failed' && (
                              <Button variant="outline" size="sm">
                                إعادة المحاولة
                              </Button>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </Card>
          </div>

          {/* معلومات الفوترة */}
          <Card className="p-6">
            <h3 className="text-lg font-semibold text-foreground mb-4">معلومات الفوترة</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h4 className="font-medium text-foreground mb-2">طريقة الدفع</h4>
                <div className="flex items-center space-x-3 space-x-reverse p-3 border border-border rounded-lg">
                  <CreditCard className="w-5 h-5 text-muted-foreground" />
                  <div>
                    <p className="text-sm font-medium text-foreground">•••• •••• •••• 4242</p>
                    <p className="text-xs text-muted-foreground">تنتهي في 12/2025</p>
                  </div>
                </div>
              </div>
              
              <div>
                <h4 className="font-medium text-foreground mb-2">عنوان الفوترة</h4>
                <div className="p-3 border border-border rounded-lg">
                  <p className="text-sm text-foreground">الرياض، المملكة العربية السعودية</p>
                  <p className="text-sm text-muted-foreground">الرمز البريدي: 12345</p>
                </div>
              </div>
            </div>
            
            <div className="mt-4">
              <Button variant="outline">تحديث معلومات الفوترة</Button>
            </div>
          </Card>
        </div>
      </Layout>
    </ProtectedRoute>
  );
};

export default PaymentsPage;