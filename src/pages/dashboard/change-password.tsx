import React, { useState } from 'react';
import type { NextPage } from 'next';
import Head from 'next/head';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Lock, Eye, EyeOff, ArrowRight } from 'lucide-react';

import { Layout } from '@/components/organisms/Layout';
import { ProtectedRoute } from '@/components/organisms/ProtectedRoute';
import { Card } from '@/components/atoms/Card';
import { Button } from '@/components/atoms/Button';
import { Input } from '@/components/atoms/Input';
import { useAuth } from '@/providers/AuthProvider';
import { useToast } from '@/hooks/useToast';

const changePasswordSchema = z.object({
  currentPassword: z.string().min(1, 'كلمة المرور الحالية مطلوبة'),
  newPassword: z.string().min(8, 'كلمة المرور الجديدة يجب أن تكون 8 أحرف على الأقل'),
  confirmPassword: z.string().min(1, 'تأكيد كلمة المرور مطلوب'),
}).refine((data) => data.newPassword === data.confirmPassword, {
  message: 'كلمات المرور غير متطابقة',
  path: ['confirmPassword'],
});

type ChangePasswordFormData = z.infer<typeof changePasswordSchema>;

const ChangePasswordPage: NextPage = () => {
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const { user } = useAuth();
  const { toast } = useToast();

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<ChangePasswordFormData>({
    resolver: zodResolver(changePasswordSchema),
  });

  const onSubmit = async (data: ChangePasswordFormData) => {
    setIsLoading(true);
    try {
      // محاكاة تغيير كلمة المرور
      await new Promise(resolve => setTimeout(resolve, 2000));

      // هنا سيتم استدعاء API تغيير كلمة المرور
      const response = await fetch('/api/auth/change-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          currentPassword: data.currentPassword,
          newPassword: data.newPassword,
        }),
      });

      if (!response.ok) {
        throw new Error('فشل في تغيير كلمة المرور');
      }

      reset();
      toast({
        title: 'تم تغيير كلمة المرور',
        description: 'تم تحديث كلمة المرور بنجاح',
        variant: 'success',
      });

      // إعادة توجيه بعد 2 ثانية
      setTimeout(() => {
        window.location.href = '/dashboard/profile';
      }, 2000);

    } catch (error) {
      toast({
        title: 'خطأ في تغيير كلمة المرور',
        description: 'تأكد من صحة كلمة المرور الحالية وحاول مرة أخرى',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <ProtectedRoute>
      <Head>
        <title>تغيير كلمة المرور - منصة الإشارات</title>
        <meta name="description" content="تحديث كلمة المرور الخاصة بحسابك" />
      </Head>

      <Layout showSidebar={true}>
        <div className="p-6 max-w-2xl mx-auto space-y-8">
          <div>
            <h1 className="text-3xl font-bold text-foreground">تغيير كلمة المرور</h1>
            <p className="text-muted-foreground mt-2">
              قم بتحديث كلمة المرور لحماية حسابك بشكل أفضل
            </p>
          </div>

          <Card className="p-8">
            <div className="flex items-center space-x-3 space-x-reverse mb-6">
              <div className="p-2 bg-primary/10 rounded-lg">
                <Lock className="w-6 h-6 text-primary" />
              </div>
              <div>
                <h2 className="text-xl font-semibold text-foreground">تحديث كلمة المرور</h2>
                <p className="text-sm text-muted-foreground">
                  تأكد من اختيار كلمة مرور قوية وآمنة
                </p>
              </div>
            </div>

            <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
              {/* كلمة المرور الحالية */}
              <div>
                <div className="relative">
                  <Input
                    {...register('currentPassword')}
                    type={showCurrentPassword ? 'text' : 'password'}
                    label="كلمة المرور الحالية"
                    placeholder="أدخل كلمة المرور الحالية"
                    leftIcon={<Lock className="w-5 h-5" />}
                    error={errors.currentPassword?.message}
                    disabled={isLoading}
                  />
                  <button
                    type="button"
                    onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                    className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground hover:text-foreground"
                  >
                    {showCurrentPassword ? (
                      <EyeOff className="w-4 h-4" />
                    ) : (
                      <Eye className="w-4 h-4" />
                    )}
                  </button>
                </div>
              </div>

              {/* كلمة المرور الجديدة */}
              <div>
                <div className="relative">
                  <Input
                    {...register('newPassword')}
                    type={showNewPassword ? 'text' : 'password'}
                    label="كلمة المرور الجديدة"
                    placeholder="أدخل كلمة المرور الجديدة"
                    leftIcon={<Lock className="w-5 h-5" />}
                    error={errors.newPassword?.message}
                    disabled={isLoading}
                    helperText="يجب أن تحتوي على 8 أحرف على الأقل"
                  />
                  <button
                    type="button"
                    onClick={() => setShowNewPassword(!showNewPassword)}
                    className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground hover:text-foreground"
                  >
                    {showNewPassword ? (
                      <EyeOff className="w-4 h-4" />
                    ) : (
                      <Eye className="w-4 h-4" />
                    )}
                  </button>
                </div>
              </div>

              {/* تأكيد كلمة المرور */}
              <div>
                <div className="relative">
                  <Input
                    {...register('confirmPassword')}
                    type={showConfirmPassword ? 'text' : 'password'}
                    label="تأكيد كلمة المرور الجديدة"
                    placeholder="أعد إدخال كلمة المرور الجديدة"
                    leftIcon={<Lock className="w-5 h-5" />}
                    error={errors.confirmPassword?.message}
                    disabled={isLoading}
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground hover:text-foreground"
                  >
                    {showConfirmPassword ? (
                      <EyeOff className="w-4 h-4" />
                    ) : (
                      <Eye className="w-4 h-4" />
                    )}
                  </button>
                </div>
              </div>

              {/* نصائح الأمان */}
              <div className="bg-muted/30 rounded-lg p-4">
                <h3 className="font-medium text-foreground mb-2">نصائح لكلمة مرور قوية:</h3>
                <ul className="text-sm text-muted-foreground space-y-1">
                  <li>• استخدم 8 أحرف على الأقل</li>
                  <li>• امزج بين الأحرف الكبيرة والصغيرة</li>
                  <li>• أضف أرقاماً ورموزاً خاصة</li>
                  <li>• تجنب استخدام معلومات شخصية</li>
                  <li>• لا تستخدم كلمات مرور مكررة</li>
                </ul>
              </div>

              {/* أزرار الإجراءات */}
              <div className="flex space-x-4 space-x-reverse pt-4">
                <Button
                  type="submit"
                  loading={isLoading}
                  leftIcon={<Lock className="w-4 h-4" />}
                  className="flex-1"
                >
                  {isLoading ? 'جاري التحديث...' : 'تحديث كلمة المرور'}
                </Button>
                
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => window.location.href = '/dashboard/profile'}
                  disabled={isLoading}
                  rightIcon={<ArrowRight className="w-4 h-4" />}
                >
                  إلغاء
                </Button>
              </div>
            </form>
          </Card>

          {/* معلومات إضافية */}
          <Card className="p-6 border-primary/20">
            <div className="flex items-start space-x-3 space-x-reverse">
              <div className="p-2 bg-primary/10 rounded-lg">
                <Lock className="w-5 h-5 text-primary" />
              </div>
              <div>
                <h3 className="font-medium text-foreground mb-2">حماية إضافية</h3>
                <p className="text-sm text-muted-foreground mb-3">
                  لحماية أفضل لحسابك، ننصح بتفعيل المصادقة الثنائية
                </p>
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={() => window.location.href = '/dashboard/enable-2fa'}
                >
                  تفعيل المصادقة الثنائية
                </Button>
              </div>
            </div>
          </Card>
        </div>
      </Layout>
    </ProtectedRoute>
  );
};

export default ChangePasswordPage;