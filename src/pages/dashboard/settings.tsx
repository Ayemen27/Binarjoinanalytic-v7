import React, { useState } from 'react';
import type { NextPage } from 'next';
import Head from 'next/head';
import { Settings, Bell, Shield, Eye, Globe, Palette } from 'lucide-react';

import { Layout } from '@/components/organisms/Layout';
import { ProtectedRoute } from '@/components/organisms/ProtectedRoute';
import { Card } from '@/components/atoms/Card';
import { Button } from '@/components/atoms/Button';
import { useAuth } from '@/providers/AuthProvider';
import { useToast } from '@/hooks/useToast';

const SettingsPage: NextPage = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [settings, setSettings] = useState({
    notifications: {
      email: true,
      sms: false,
      push: true,
      signalAlerts: true,
      marketNews: false,
    },
    trading: {
      autoExecute: false,
      riskLevel: 'medium',
      maxDailySignals: 10,
      defaultTimeframe: '1h',
      preferredStrategy: 'combined',
    },
    privacy: {
      profileVisible: false,
      showStats: true,
      allowAnalytics: true,
    },
    appearance: {
      theme: 'system',
      language: 'ar',
      currency: 'USD',
    },
  });

  const handleSettingChange = (section: string, key: string, value: any) => {
    setSettings(prev => ({
      ...prev,
      [section]: {
        ...prev[section as keyof typeof prev],
        [key]: value,
      },
    }));
  };

  const saveSettings = async () => {
    try {
      // محاكاة حفظ الإعدادات
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      toast({
        title: 'تم حفظ الإعدادات',
        description: 'تم تحديث جميع إعداداتك بنجاح',
        variant: 'success',
      });
    } catch (error) {
      toast({
        title: 'خطأ في الحفظ',
        description: 'حدث خطأ أثناء حفظ الإعدادات',
        variant: 'destructive',
      });
    }
  };

  return (
    <ProtectedRoute>
      <Head>
        <title>الإعدادات - منصة الإشارات</title>
        <meta name="description" content="تخصيص إعدادات المنصة والتفضيلات الشخصية" />
      </Head>

      <Layout showSidebar={true}>
        <div className="p-6 max-w-4xl mx-auto space-y-8">
          <div>
            <h1 className="text-3xl font-bold text-foreground">الإعدادات</h1>
            <p className="text-muted-foreground mt-2">
              تخصيص تفضيلاتك وإعدادات المنصة
            </p>
          </div>

          {/* إعدادات الإشعارات */}
          <Card className="p-6">
            <div className="flex items-center space-x-3 space-x-reverse mb-6">
              <Bell className="w-6 h-6 text-primary" />
              <h2 className="text-xl font-semibold text-foreground">إعدادات الإشعارات</h2>
            </div>

            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-medium text-foreground">إشعارات البريد الإلكتروني</h3>
                  <p className="text-sm text-muted-foreground">تلقي الإشعارات عبر البريد الإلكتروني</p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={settings.notifications.email}
                    onChange={(e) => handleSettingChange('notifications', 'email', e.target.checked)}
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-muted peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-primary rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary"></div>
                </label>
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-medium text-foreground">إشعارات SMS</h3>
                  <p className="text-sm text-muted-foreground">تلقي الإشعارات عبر الرسائل النصية</p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={settings.notifications.sms}
                    onChange={(e) => handleSettingChange('notifications', 'sms', e.target.checked)}
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-muted peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-primary rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary"></div>
                </label>
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-medium text-foreground">تنبيهات الإشارات</h3>
                  <p className="text-sm text-muted-foreground">تلقي إشعارات فورية عند توليد إشارة جديدة</p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={settings.notifications.signalAlerts}
                    onChange={(e) => handleSettingChange('notifications', 'signalAlerts', e.target.checked)}
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-muted peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-primary rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary"></div>
                </label>
              </div>
            </div>
          </Card>

          {/* إعدادات التداول */}
          <Card className="p-6">
            <div className="flex items-center space-x-3 space-x-reverse mb-6">
              <Shield className="w-6 h-6 text-primary" />
              <h2 className="text-xl font-semibold text-foreground">إعدادات التداول</h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">
                  مستوى المخاطرة الافتراضي
                </label>
                <select
                  value={settings.trading.riskLevel}
                  onChange={(e) => handleSettingChange('trading', 'riskLevel', e.target.value)}
                  className="w-full px-3 py-2 border border-border rounded-md bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                >
                  <option value="low">منخفض</option>
                  <option value="medium">متوسط</option>
                  <option value="high">عالي</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-foreground mb-2">
                  الحد الأقصى للإشارات اليومية
                </label>
                <select
                  value={settings.trading.maxDailySignals}
                  onChange={(e) => handleSettingChange('trading', 'maxDailySignals', parseInt(e.target.value))}
                  className="w-full px-3 py-2 border border-border rounded-md bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                >
                  <option value={5}>5 إشارات</option>
                  <option value={10}>10 إشارات</option>
                  <option value={20}>20 إشارة</option>
                  <option value={50}>50 إشارة</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-foreground mb-2">
                  الإطار الزمني الافتراضي
                </label>
                <select
                  value={settings.trading.defaultTimeframe}
                  onChange={(e) => handleSettingChange('trading', 'defaultTimeframe', e.target.value)}
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
                  الاستراتيجية المفضلة
                </label>
                <select
                  value={settings.trading.preferredStrategy}
                  onChange={(e) => handleSettingChange('trading', 'preferredStrategy', e.target.value)}
                  className="w-full px-3 py-2 border border-border rounded-md bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                >
                  <option value="technical">تحليل فني</option>
                  <option value="ai">ذكاء اصطناعي</option>
                  <option value="sentiment">تحليل المشاعر</option>
                  <option value="combined">مجمع</option>
                </select>
              </div>
            </div>

            <div className="mt-6">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-medium text-foreground">التنفيذ التلقائي للإشارات</h3>
                  <p className="text-sm text-muted-foreground">تنفيذ الإشارات تلقائياً بدون تدخل يدوي</p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={settings.trading.autoExecute}
                    onChange={(e) => handleSettingChange('trading', 'autoExecute', e.target.checked)}
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-muted peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-primary rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary"></div>
                </label>
              </div>
            </div>
          </Card>

          {/* إعدادات الخصوصية */}
          <Card className="p-6">
            <div className="flex items-center space-x-3 space-x-reverse mb-6">
              <Eye className="w-6 h-6 text-primary" />
              <h2 className="text-xl font-semibold text-foreground">إعدادات الخصوصية</h2>
            </div>

            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-medium text-foreground">إظهار الملف الشخصي</h3>
                  <p className="text-sm text-muted-foreground">السماح للآخرين برؤية ملفك الشخصي</p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={settings.privacy.profileVisible}
                    onChange={(e) => handleSettingChange('privacy', 'profileVisible', e.target.checked)}
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-muted peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-primary rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary"></div>
                </label>
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-medium text-foreground">إظهار الإحصائيات</h3>
                  <p className="text-sm text-muted-foreground">عرض إحصائيات التداول في الملف الشخصي</p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={settings.privacy.showStats}
                    onChange={(e) => handleSettingChange('privacy', 'showStats', e.target.checked)}
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-muted peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-primary rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary"></div>
                </label>
              </div>
            </div>
          </Card>

          {/* إعدادات المظهر */}
          <Card className="p-6">
            <div className="flex items-center space-x-3 space-x-reverse mb-6">
              <Palette className="w-6 h-6 text-primary" />
              <h2 className="text-xl font-semibold text-foreground">إعدادات المظهر</h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">
                  المظهر
                </label>
                <select
                  value={settings.appearance.theme}
                  onChange={(e) => handleSettingChange('appearance', 'theme', e.target.value)}
                  className="w-full px-3 py-2 border border-border rounded-md bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                >
                  <option value="light">فاتح</option>
                  <option value="dark">داكن</option>
                  <option value="system">تلقائي حسب النظام</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-foreground mb-2">
                  اللغة
                </label>
                <select
                  value={settings.appearance.language}
                  onChange={(e) => handleSettingChange('appearance', 'language', e.target.value)}
                  className="w-full px-3 py-2 border border-border rounded-md bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                >
                  <option value="ar">العربية</option>
                  <option value="en">English</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-foreground mb-2">
                  العملة الافتراضية
                </label>
                <select
                  value={settings.appearance.currency}
                  onChange={(e) => handleSettingChange('appearance', 'currency', e.target.value)}
                  className="w-full px-3 py-2 border border-border rounded-md bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                >
                  <option value="USD">دولار أمريكي (USD)</option>
                  <option value="EUR">يورو (EUR)</option>
                  <option value="SAR">ريال سعودي (SAR)</option>
                  <option value="AED">درهم إماراتي (AED)</option>
                </select>
              </div>
            </div>
          </Card>

          {/* حفظ الإعدادات */}
          <div className="flex justify-end">
            <Button onClick={saveSettings} className="px-8">
              حفظ جميع الإعدادات
            </Button>
          </div>
        </div>
      </Layout>
    </ProtectedRoute>
  );
};

export default SettingsPage;