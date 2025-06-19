import React, { useState, useEffect } from 'react';
import type { NextPage } from 'next';
import Head from 'next/head';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { 
  Settings, 
  Bell, 
  Shield, 
  Palette, 
  Globe, 
  Zap, 
  Mail,
  Smartphone,
  Monitor,
  Moon,
  Sun,
  Volume2,
  VolumeX
} from 'lucide-react';

import { Layout } from '@/components/organisms/Layout';
import { ProtectedRoute } from '@/components/organisms/ProtectedRoute';
import { Card } from '@/components/atoms/Card';
import { Button } from '@/components/atoms/Button';
import { Input } from '@/components/atoms/Input';
import { useAuth } from '@/providers/AuthProvider';
import { useTheme } from '@/providers/ThemeProvider';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';

const settingsSchema = z.object({
  // Notification Settings
  emailNotifications: z.boolean(),
  smsNotifications: z.boolean(),
  pushNotifications: z.boolean(),
  signalAlerts: z.boolean(),
  marketUpdates: z.boolean(),
  accountAlerts: z.boolean(),
  
  // Trading Settings
  defaultRiskLevel: z.enum(['low', 'medium', 'high']),
  maxSignalsPerDay: z.number().min(1).max(50),
  autoTradingEnabled: z.boolean(),
  preferredTimeframes: z.array(z.string()),
  preferredSymbols: z.array(z.string()),
  
  // Display Settings
  language: z.enum(['ar', 'en']),
  timezone: z.string(),
  currency: z.enum(['USD', 'EUR', 'SAR', 'AED']),
  soundEnabled: z.boolean(),
  animationsEnabled: z.boolean(),
});

type SettingsFormData = z.infer<typeof settingsSchema>;

const SettingsPage: NextPage = () => {
  const { user } = useAuth();
  const { theme, setTheme } = useTheme();
  const [activeTab, setActiveTab] = useState('notifications');
  const [isLoading, setIsLoading] = useState(false);
  
  const supabase = createClientComponentClient();

  const {
    register,
    handleSubmit,
    formState: { errors, isDirty },
    reset,
    watch,
    setValue,
  } = useForm<SettingsFormData>({
    resolver: zodResolver(settingsSchema),
    defaultValues: {
      emailNotifications: true,
      smsNotifications: false,
      pushNotifications: true,
      signalAlerts: true,
      marketUpdates: true,
      accountAlerts: true,
      defaultRiskLevel: 'medium',
      maxSignalsPerDay: 10,
      autoTradingEnabled: false,
      preferredTimeframes: ['1h', '4h'],
      preferredSymbols: ['EUR/USD', 'GBP/USD'],
      language: 'ar',
      timezone: 'Asia/Riyadh',
      currency: 'USD',
      soundEnabled: true,
      animationsEnabled: true,
    },
  });

  const tabs = [
    { id: 'notifications', label: 'الإشعارات', icon: Bell },
    { id: 'trading', label: 'التداول', icon: Zap },
    { id: 'display', label: 'العرض', icon: Palette },
    { id: 'security', label: 'الأمان', icon: Shield },
  ];

  const timeframes = [
    { value: '5m', label: '5 دقائق' },
    { value: '15m', label: '15 دقيقة' },
    { value: '1h', label: 'ساعة' },
    { value: '4h', label: '4 ساعات' },
    { value: '1d', label: 'يوم' },
  ];

  const symbols = [
    { value: 'EUR/USD', label: 'EUR/USD' },
    { value: 'GBP/USD', label: 'GBP/USD' },
    { value: 'USD/JPY', label: 'USD/JPY' },
    { value: 'AUD/USD', label: 'AUD/USD' },
    { value: 'USD/CAD', label: 'USD/CAD' },
    { value: 'NZD/USD', label: 'NZD/USD' },
  ];

  const onSubmit = async (data: SettingsFormData) => {
    setIsLoading(true);
    
    try {
      // Save settings to database
      await supabase
        .from('user_roles')
        .update({ 
          context: { 
            ...data,
            updated_at: new Date().toISOString()
          } 
        })
        .eq('user_id', user?.id);
      
      // Log the settings change
      await supabase.from('permission_audit').insert({
        user_id: user?.id,
        action_type: 'settings_updated',
        result: 'allowed',
        reason: `User updated ${activeTab} settings`,
      });

      reset(data);
      alert('تم حفظ الإعدادات بنجاح');
      
    } catch (error) {
      console.error('Error saving settings:', error);
      alert('حدث خطأ في حفظ الإعدادات');
    } finally {
      setIsLoading(false);
    }
  };

  const handleArrayToggle = (fieldName: keyof SettingsFormData, value: string) => {
    const currentValues = watch(fieldName) as string[];
    const newValues = currentValues.includes(value)
      ? currentValues.filter(v => v !== value)
      : [...currentValues, value];
    setValue(fieldName, newValues, { shouldDirty: true });
  };

  return (
    <ProtectedRoute>
      <Head>
        <title>الإعدادات - منصة الإشارات</title>
      </Head>

      <Layout showSidebar={true}>
        <div className="p-6 max-w-6xl mx-auto">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-foreground">الإعدادات</h1>
            <p className="text-muted-foreground mt-2">
              تخصيص تجربتك على المنصة
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
            {/* Sidebar Navigation */}
            <div className="lg:col-span-1">
              <Card className="p-4">
                <nav className="space-y-2">
                  {tabs.map((tab) => (
                    <button
                      key={tab.id}
                      onClick={() => setActiveTab(tab.id)}
                      className={`w-full text-right p-3 rounded-lg transition-colors flex items-center gap-3 ${
                        activeTab === tab.id
                          ? 'bg-primary text-primary-foreground'
                          : 'hover:bg-muted text-foreground'
                      }`}
                    >
                      <tab.icon className="w-5 h-5" />
                      {tab.label}
                    </button>
                  ))}
                </nav>
              </Card>
            </div>

            {/* Settings Content */}
            <div className="lg:col-span-3">
              <form onSubmit={handleSubmit(onSubmit)}>
                {/* Notifications Tab */}
                {activeTab === 'notifications' && (
                  <Card className="p-6">
                    <h2 className="text-xl font-semibold mb-6">إعدادات الإشعارات</h2>
                    
                    <div className="space-y-6">
                      {/* Email Notifications */}
                      <div className="flex items-center justify-between p-4 border border-border rounded-lg">
                        <div className="flex items-center gap-3">
                          <Mail className="w-5 h-5 text-primary" />
                          <div>
                            <h3 className="font-medium">إشعارات البريد الإلكتروني</h3>
                            <p className="text-sm text-muted-foreground">
                              تلقي الإشعارات عبر البريد الإلكتروني
                            </p>
                          </div>
                        </div>
                        <label className="flex items-center">
                          <input
                            type="checkbox"
                            {...register('emailNotifications')}
                            className="w-4 h-4 text-primary focus:ring-primary border-border rounded"
                          />
                        </label>
                      </div>

                      {/* SMS Notifications */}
                      <div className="flex items-center justify-between p-4 border border-border rounded-lg">
                        <div className="flex items-center gap-3">
                          <Smartphone className="w-5 h-5 text-primary" />
                          <div>
                            <h3 className="font-medium">إشعارات SMS</h3>
                            <p className="text-sm text-muted-foreground">
                              تلقي الإشعارات العاجلة عبر الرسائل النصية
                            </p>
                          </div>
                        </div>
                        <label className="flex items-center">
                          <input
                            type="checkbox"
                            {...register('smsNotifications')}
                            className="w-4 h-4 text-primary focus:ring-primary border-border rounded"
                          />
                        </label>
                      </div>

                      {/* Push Notifications */}
                      <div className="flex items-center justify-between p-4 border border-border rounded-lg">
                        <div className="flex items-center gap-3">
                          <Bell className="w-5 h-5 text-primary" />
                          <div>
                            <h3 className="font-medium">الإشعارات الفورية</h3>
                            <p className="text-sm text-muted-foreground">
                              إشعارات فورية على المتصفح
                            </p>
                          </div>
                        </div>
                        <label className="flex items-center">
                          <input
                            type="checkbox"
                            {...register('pushNotifications')}
                            className="w-4 h-4 text-primary focus:ring-primary border-border rounded"
                          />
                        </label>
                      </div>

                      <div className="border-t border-border pt-6">
                        <h3 className="font-medium mb-4">أنواع الإشعارات</h3>
                        
                        <div className="space-y-4">
                          <label className="flex items-center justify-between">
                            <span>تنبيهات الإشارات الجديدة</span>
                            <input
                              type="checkbox"
                              {...register('signalAlerts')}
                              className="w-4 h-4 text-primary focus:ring-primary border-border rounded"
                            />
                          </label>
                          
                          <label className="flex items-center justify-between">
                            <span>تحديثات السوق</span>
                            <input
                              type="checkbox"
                              {...register('marketUpdates')}
                              className="w-4 h-4 text-primary focus:ring-primary border-border rounded"
                            />
                          </label>
                          
                          <label className="flex items-center justify-between">
                            <span>تنبيهات الحساب</span>
                            <input
                              type="checkbox"
                              {...register('accountAlerts')}
                              className="w-4 h-4 text-primary focus:ring-primary border-border rounded"
                            />
                          </label>
                        </div>
                      </div>
                    </div>
                  </Card>
                )}

                {/* Trading Tab */}
                {activeTab === 'trading' && (
                  <Card className="p-6">
                    <h2 className="text-xl font-semibold mb-6">إعدادات التداول</h2>
                    
                    <div className="space-y-6">
                      {/* Default Risk Level */}
                      <div>
                        <label className="block text-sm font-medium text-foreground mb-2">
                          مستوى المخاطرة الافتراضي
                        </label>
                        <select
                          {...register('defaultRiskLevel')}
                          className="w-full px-3 py-2 border border-border rounded-md bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                        >
                          <option value="low">منخفض</option>
                          <option value="medium">متوسط</option>
                          <option value="high">عالي</option>
                        </select>
                      </div>

                      {/* Max Signals Per Day */}
                      <div>
                        <Input
                          {...register('maxSignalsPerDay', { valueAsNumber: true })}
                          type="number"
                          label="الحد الأقصى للإشارات يومياً"
                          min="1"
                          max="50"
                          error={errors.maxSignalsPerDay?.message}
                        />
                      </div>

                      {/* Auto Trading */}
                      <div className="flex items-center justify-between p-4 border border-border rounded-lg">
                        <div>
                          <h3 className="font-medium">التداول التلقائي</h3>
                          <p className="text-sm text-muted-foreground">
                            تنفيذ الإشارات تلقائياً (يتطلب اشتراك مميز)
                          </p>
                        </div>
                        <label className="flex items-center">
                          <input
                            type="checkbox"
                            {...register('autoTradingEnabled')}
                            className="w-4 h-4 text-primary focus:ring-primary border-border rounded"
                          />
                        </label>
                      </div>

                      {/* Preferred Timeframes */}
                      <div>
                        <label className="block text-sm font-medium text-foreground mb-3">
                          الأطر الزمنية المفضلة
                        </label>
                        <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                          {timeframes.map((tf) => (
                            <label key={tf.value} className="flex items-center space-x-2 space-x-reverse">
                              <input
                                type="checkbox"
                                checked={watch('preferredTimeframes').includes(tf.value)}
                                onChange={() => handleArrayToggle('preferredTimeframes', tf.value)}
                                className="w-4 h-4 text-primary focus:ring-primary border-border rounded"
                              />
                              <span className="text-sm">{tf.label}</span>
                            </label>
                          ))}
                        </div>
                      </div>

                      {/* Preferred Symbols */}
                      <div>
                        <label className="block text-sm font-medium text-foreground mb-3">
                          الرموز المفضلة
                        </label>
                        <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                          {symbols.map((symbol) => (
                            <label key={symbol.value} className="flex items-center space-x-2 space-x-reverse">
                              <input
                                type="checkbox"
                                checked={watch('preferredSymbols').includes(symbol.value)}
                                onChange={() => handleArrayToggle('preferredSymbols', symbol.value)}
                                className="w-4 h-4 text-primary focus:ring-primary border-border rounded"
                              />
                              <span className="text-sm">{symbol.label}</span>
                            </label>
                          ))}
                        </div>
                      </div>
                    </div>
                  </Card>
                )}

                {/* Display Tab */}
                {activeTab === 'display' && (
                  <Card className="p-6">
                    <h2 className="text-xl font-semibold mb-6">إعدادات العرض</h2>
                    
                    <div className="space-y-6">
                      {/* Theme Selection */}
                      <div>
                        <label className="block text-sm font-medium text-foreground mb-3">
                          المظهر
                        </label>
                        <div className="grid grid-cols-3 gap-3">
                          {[
                            { value: 'light', label: 'فاتح', icon: Sun },
                            { value: 'dark', label: 'داكن', icon: Moon },
                            { value: 'system', label: 'النظام', icon: Monitor },
                          ].map((themeOption) => (
                            <button
                              key={themeOption.value}
                              type="button"
                              onClick={() => setTheme(themeOption.value as any)}
                              className={`p-4 border rounded-lg flex flex-col items-center gap-2 transition-colors ${
                                theme === themeOption.value
                                  ? 'border-primary bg-primary/10'
                                  : 'border-border hover:bg-muted/50'
                              }`}
                            >
                              <themeOption.icon className="w-6 h-6" />
                              <span className="text-sm">{themeOption.label}</span>
                            </button>
                          ))}
                        </div>
                      </div>

                      {/* Language */}
                      <div>
                        <label className="block text-sm font-medium text-foreground mb-2">
                          اللغة
                        </label>
                        <select
                          {...register('language')}
                          className="w-full px-3 py-2 border border-border rounded-md bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                        >
                          <option value="ar">العربية</option>
                          <option value="en">English</option>
                        </select>
                      </div>

                      {/* Timezone */}
                      <div>
                        <label className="block text-sm font-medium text-foreground mb-2">
                          المنطقة الزمنية
                        </label>
                        <select
                          {...register('timezone')}
                          className="w-full px-3 py-2 border border-border rounded-md bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                        >
                          <option value="Asia/Riyadh">الرياض (GMT+3)</option>
                          <option value="Asia/Dubai">دبي (GMT+4)</option>
                          <option value="Europe/London">لندن (GMT+0)</option>
                          <option value="America/New_York">نيويورك (GMT-5)</option>
                        </select>
                      </div>

                      {/* Currency */}
                      <div>
                        <label className="block text-sm font-medium text-foreground mb-2">
                          العملة المفضلة
                        </label>
                        <select
                          {...register('currency')}
                          className="w-full px-3 py-2 border border-border rounded-md bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                        >
                          <option value="USD">دولار أمريكي (USD)</option>
                          <option value="EUR">يورو (EUR)</option>
                          <option value="SAR">ريال سعودي (SAR)</option>
                          <option value="AED">درهم إماراتي (AED)</option>
                        </select>
                      </div>

                      {/* Sound and Animations */}
                      <div className="space-y-4">
                        <div className="flex items-center justify-between p-4 border border-border rounded-lg">
                          <div className="flex items-center gap-3">
                            <Volume2 className="w-5 h-5 text-primary" />
                            <div>
                              <h3 className="font-medium">الأصوات</h3>
                              <p className="text-sm text-muted-foreground">
                                تشغيل أصوات الإشعارات
                              </p>
                            </div>
                          </div>
                          <label className="flex items-center">
                            <input
                              type="checkbox"
                              {...register('soundEnabled')}
                              className="w-4 h-4 text-primary focus:ring-primary border-border rounded"
                            />
                          </label>
                        </div>

                        <div className="flex items-center justify-between p-4 border border-border rounded-lg">
                          <div className="flex items-center gap-3">
                            <Zap className="w-5 h-5 text-primary" />
                            <div>
                              <h3 className="font-medium">التحريكات</h3>
                              <p className="text-sm text-muted-foreground">
                                تفعيل تأثيرات الحركة والانتقالات
                              </p>
                            </div>
                          </div>
                          <label className="flex items-center">
                            <input
                              type="checkbox"
                              {...register('animationsEnabled')}
                              className="w-4 h-4 text-primary focus:ring-primary border-border rounded"
                            />
                          </label>
                        </div>
                      </div>
                    </div>
                  </Card>
                )}

                {/* Security Tab */}
                {activeTab === 'security' && (
                  <Card className="p-6">
                    <h2 className="text-xl font-semibold mb-6">إعدادات الأمان</h2>
                    
                    <div className="space-y-6">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="p-4 border border-border rounded-lg">
                          <div className="flex items-center gap-3 mb-3">
                            <Shield className="w-5 h-5 text-success" />
                            <h3 className="font-medium">المصادقة الثنائية</h3>
                          </div>
                          <p className="text-sm text-muted-foreground mb-4">
                            مفعّلة - حماية إضافية لحسابك
                          </p>
                          <Button size="sm" variant="outline">
                            إدارة 2FA
                          </Button>
                        </div>

                        <div className="p-4 border border-border rounded-lg">
                          <div className="flex items-center gap-3 mb-3">
                            <Settings className="w-5 h-5 text-primary" />
                            <h3 className="font-medium">كلمة المرور</h3>
                          </div>
                          <p className="text-sm text-muted-foreground mb-4">
                            آخر تغيير منذ 30 يوم
                          </p>
                          <Button size="sm" variant="outline">
                            تغيير كلمة المرور
                          </Button>
                        </div>
                      </div>

                      <div className="p-4 border border-warning/20 bg-warning/5 rounded-lg">
                        <h3 className="font-medium text-warning mb-2">الجلسات النشطة</h3>
                        <p className="text-sm text-muted-foreground mb-4">
                          3 أجهزة متصلة حالياً
                        </p>
                        <Button size="sm" variant="outline">
                          إدارة الجلسات
                        </Button>
                      </div>

                      <div className="p-4 border border-destructive/20 bg-destructive/5 rounded-lg">
                        <h3 className="font-medium text-destructive mb-2">منطقة الخطر</h3>
                        <p className="text-sm text-muted-foreground mb-4">
                          إجراءات لا يمكن التراجع عنها
                        </p>
                        <div className="space-y-2">
                          <Button size="sm" variant="outline">
                            تنزيل بياناتي
                          </Button>
                          <Button size="sm" variant="destructive">
                            حذف الحساب
                          </Button>
                        </div>
                      </div>
                    </div>
                  </Card>
                )}

                {/* Save Button */}
                <div className="mt-6 flex justify-end">
                  <Button
                    type="submit"
                    loading={isLoading}
                    disabled={!isDirty}
                    leftIcon={<Settings className="w-4 h-4" />}
                  >
                    حفظ الإعدادات
                  </Button>
                </div>
              </form>
            </div>
          </div>
        </div>
      </Layout>
    </ProtectedRoute>
  );
};

export default SettingsPage;