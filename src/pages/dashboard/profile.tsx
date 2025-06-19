import React, { useState } from 'react';
import type { NextPage } from 'next';
import Head from 'next/head';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { User, Mail, Phone, Globe, Save, Camera } from 'lucide-react';

import { Layout } from '@/components/organisms/Layout';
import { ProtectedRoute } from '@/components/organisms/ProtectedRoute';
import { Card } from '@/components/atoms/Card';
import { Button } from '@/components/atoms/Button';
import { Input } from '@/components/atoms/Input';
import { useAuth } from '@/providers/AuthProvider';

const profileSchema = z.object({
  fullName: z.string().min(2, 'الاسم يجب أن يكون حرفين على الأقل'),
  email: z.string().email('البريد الإلكتروني غير صحيح'),
  phone: z.string().optional(),
  country: z.string().optional(),
  timezone: z.string().optional(),
  language: z.enum(['ar', 'en']).default('ar'),
});

type ProfileFormData = z.infer<typeof profileSchema>;

const ProfilePage: NextPage = () => {
  const { user, updateProfile } = useAuth();
  const [isLoading, setIsLoading] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors, isDirty },
    reset,
  } = useForm<ProfileFormData>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      fullName: user?.user_metadata?.full_name || '',
      email: user?.email || '',
      phone: user?.user_metadata?.phone || '',
      country: user?.user_metadata?.country || '',
      timezone: user?.user_metadata?.timezone || 'Asia/Riyadh',
      language: user?.user_metadata?.language || 'ar',
    },
  });

  const onSubmit = async (data: ProfileFormData) => {
    setIsLoading(true);
    try {
      await updateProfile({
        full_name: data.fullName,
        phone: data.phone,
        country: data.country,
        timezone: data.timezone,
        language: data.language,
      });
      reset(data);
    } catch (error) {
      console.error('Profile update failed:', error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <ProtectedRoute>
      <Head>
        <title>الملف الشخصي - منصة الإشارات</title>
        <meta name="description" content="إدارة الملف الشخصي وإعدادات الحساب" />
      </Head>

      <Layout showSidebar={true}>
        <div className="p-6 max-w-4xl mx-auto space-y-8">
          {/* Header */}
          <div>
            <h1 className="text-3xl font-bold text-foreground">الملف الشخصي</h1>
            <p className="text-muted-foreground mt-2">
              إدارة معلوماتك الشخصية وإعدادات الحساب
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Profile Picture Section */}
            <div className="lg:col-span-1">
              <Card className="p-6 text-center">
                <div className="relative inline-block">
                  <div className="w-32 h-32 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                    <User className="w-16 h-16 text-primary" />
                  </div>
                  <button className="absolute bottom-2 right-2 p-2 bg-primary text-primary-foreground rounded-full shadow-md hover:bg-primary/90 transition-colors">
                    <Camera className="w-4 h-4" />
                  </button>
                </div>
                
                <h3 className="text-lg font-semibold text-foreground mb-2">
                  {user?.user_metadata?.full_name || 'المستخدم'}
                </h3>
                
                <p className="text-sm text-muted-foreground mb-4">
                  {user?.email}
                </p>
                
                <Button variant="outline" size="sm" disabled>
                  تغيير الصورة (قريباً)
                </Button>
              </Card>
            </div>

            {/* Profile Form Section */}
            <div className="lg:col-span-2">
              <Card className="p-6">
                <h2 className="text-xl font-semibold text-foreground mb-6">
                  المعلومات الشخصية
                </h2>

                <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Full Name */}
                    <div>
                      <Input
                        {...register('fullName')}
                        label="الاسم الكامل"
                        placeholder="أدخل اسمك الكامل"
                        leftIcon={<User className="w-5 h-5" />}
                        error={errors.fullName?.message}
                        disabled={isLoading}
                      />
                    </div>

                    {/* Email */}
                    <div>
                      <Input
                        {...register('email')}
                        type="email"
                        label="البريد الإلكتروني"
                        placeholder="example@domain.com"
                        leftIcon={<Mail className="w-5 h-5" />}
                        error={errors.email?.message}
                        disabled={true}
                        helperText="لا يمكن تغيير البريد الإلكتروني"
                      />
                    </div>

                    {/* Phone */}
                    <div>
                      <Input
                        {...register('phone')}
                        type="tel"
                        label="رقم الهاتف"
                        placeholder="+966 50 123 4567"
                        leftIcon={<Phone className="w-5 h-5" />}
                        error={errors.phone?.message}
                        disabled={isLoading}
                      />
                    </div>

                    {/* Country */}
                    <div>
                      <Input
                        {...register('country')}
                        label="البلد"
                        placeholder="المملكة العربية السعودية"
                        leftIcon={<Globe className="w-5 h-5" />}
                        error={errors.country?.message}
                        disabled={isLoading}
                      />
                    </div>

                    {/* Timezone */}
                    <div>
                      <label className="block text-sm font-medium text-foreground mb-2">
                        المنطقة الزمنية
                      </label>
                      <select
                        {...register('timezone')}
                        className="w-full px-3 py-2 border border-border rounded-md bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                        disabled={isLoading}
                      >
                        <option value="Asia/Riyadh">الرياض (GMT+3)</option>
                        <option value="Asia/Dubai">دبي (GMT+4)</option>
                        <option value="Europe/London">لندن (GMT+0)</option>
                        <option value="America/New_York">نيويورك (GMT-5)</option>
                      </select>
                    </div>

                    {/* Language */}
                    <div>
                      <label className="block text-sm font-medium text-foreground mb-2">
                        اللغة المفضلة
                      </label>
                      <select
                        {...register('language')}
                        className="w-full px-3 py-2 border border-border rounded-md bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                        disabled={isLoading}
                      >
                        <option value="ar">العربية</option>
                        <option value="en">English</option>
                      </select>
                    </div>
                  </div>

                  {/* Submit Button */}
                  <div className="flex justify-end pt-4">
                    <Button
                      type="submit"
                      loading={isLoading}
                      disabled={!isDirty}
                      leftIcon={<Save className="w-4 h-4" />}
                    >
                      حفظ التغييرات
                    </Button>
                  </div>
                </form>
              </Card>
            </div>
          </div>

          {/* Account Settings */}
          <Card className="p-6">
            <h2 className="text-xl font-semibold text-foreground mb-6">
              إعدادات الحساب
            </h2>
            
            <div className="space-y-4">
              <div className="flex items-center justify-between p-4 border border-border rounded-lg">
                <div>
                  <h3 className="font-medium text-foreground">المصادقة الثنائية</h3>
                  <p className="text-sm text-muted-foreground">
                    حماية إضافية لحسابك
                  </p>
                </div>
                <Button variant="outline" disabled>
                  تفعيل (قريباً)
                </Button>
              </div>

              <div className="flex items-center justify-between p-4 border border-border rounded-lg">
                <div>
                  <h3 className="font-medium text-foreground">تغيير كلمة المرور</h3>
                  <p className="text-sm text-muted-foreground">
                    تحديث كلمة المرور الحالية
                  </p>
                </div>
                <Button variant="outline" disabled>
                  تغيير (قريباً)
                </Button>
              </div>

              <div className="flex items-center justify-between p-4 border border-destructive/20 rounded-lg">
                <div>
                  <h3 className="font-medium text-destructive">حذف الحساب</h3>
                  <p className="text-sm text-muted-foreground">
                    حذف نهائي للحساب وجميع البيانات
                  </p>
                </div>
                <Button variant="destructive" disabled>
                  حذف (قريباً)
                </Button>
              </div>
            </div>
          </Card>
        </div>
      </Layout>
    </ProtectedRoute>
  );
};

export default ProfilePage;