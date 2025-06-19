import React, { useState } from 'react';
import type { NextPage } from 'next';
import Head from 'next/head';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Eye, EyeOff, Lock, Shield, CheckCircle } from 'lucide-react';

import { Layout } from '@/components/organisms/Layout';
import { ProtectedRoute } from '@/components/organisms/ProtectedRoute';
import { Card } from '@/components/atoms/Card';
import { Button } from '@/components/atoms/Button';
import { Input } from '@/components/atoms/Input';
import { useAuth } from '@/providers/AuthProvider';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';

const changePasswordSchema = z.object({
  currentPassword: z.string().min(1, 'أدخل كلمة المرور الحالية'),
  newPassword: z.string().min(8, 'كلمة المرور الجديدة يجب أن تكون 8 أحرف على الأقل'),
  confirmPassword: z.string(),
}).refine((data) => data.newPassword === data.confirmPassword, {
  message: 'كلمات المرور غير متطابقة',
  path: ['confirmPassword'],
});

type ChangePasswordFormData = z.infer<typeof changePasswordSchema>;

const ChangePasswordPage: NextPage = () => {
  const { user } = useAuth();
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  
  const supabase = createClientComponentClient();

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
    setSuccess(false);
    
    try {
      const { error } = await supabase.auth.updateUser({
        password: data.newPassword
      });

      if (error) throw error;

      setSuccess(true);
      reset();
      
      // Log security event
      await supabase.from('permission_audit').insert({
        user_id: user?.id,
        action_type: 'password_changed',
        result: 'allowed',
        reason: 'User changed password successfully',
      });

    } catch (error: any) {
      console.error('Password change error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  if (success) {
    return (
      <ProtectedRoute>
        <Head>
          <title>تم تغيير كلمة المرور - منصة الإشارات</title>
        </Head>

        <Layout showSidebar={true}>
          <div className="p-6 max-w-2xl mx-auto">
            <Card className="p-8 text-center">
              <div className="w-16 h-16 bg-success/10 rounded-full flex items-center justify-center mx-auto mb-6">
                <CheckCircle className="w-8 h-8 text-success" />
              </div>
              
              <h1 className="text-2xl font-bold text-foreground mb-4">
                تم تغيير كلمة المرور بنجاح
              </h1>
              
              <p className="text-muted-foreground mb-6">
                تم تحديث كلمة المرور الخاصة بك. ستحتاج لاستخدام كلمة المرور الجديدة في المرة القادمة.
              </p>
              
              <div className="space-y-3">
                <Button onClick={() => window.location.href = '/dashboard/profile'}>
                  العودة للملف الشخصي
                </Button>
                <Button variant="outline" onClick={() => setSuccess(false)}>
                  تغيير كلمة مرور أخرى
                </Button>
              </div>
            </Card>
          </div>
        </Layout>
      </ProtectedRoute>
    );
  }

  return (
    <ProtectedRoute>
      <Head>
        <title>تغيير كلمة المرور - منصة الإشارات</title>
      </Head>

      <Layout showSidebar={true}>
        <div className="p-6 max-w-2xl mx-auto">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-foreground">تغيير كلمة المرور</h1>
            <p className="text-muted-foreground mt-2">
              قم بتحديث كلمة المرور الخاصة بك لضمان أمان حسابك
            </p>
          </div>

          <Card className="p-8">
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
              {/* Current Password */}
              <div>
                <Input
                  {...register('currentPassword')}
                  type={showCurrentPassword ? 'text' : 'password'}
                  label="كلمة المرور الحالية"
                  placeholder="أدخل كلمة المرور الحالية"
                  leftIcon={<Lock className="w-5 h-5" />}
                  rightIcon={
                    <button
                      type="button"
                      onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                      className="text-muted-foreground hover:text-foreground transition-colors"
                    >
                      {showCurrentPassword ? (
                        <EyeOff className="w-5 h-5" />
                      ) : (
                        <Eye className="w-5 h-5" />
                      )}
                    </button>
                  }
                  error={errors.currentPassword?.message}
                  disabled={isLoading}
                />
              </div>

              {/* New Password */}
              <div>
                <Input
                  {...register('newPassword')}
                  type={showNewPassword ? 'text' : 'password'}
                  label="كلمة المرور الجديدة"
                  placeholder="أدخل كلمة مرور قوية"
                  leftIcon={<Shield className="w-5 h-5" />}
                  rightIcon={
                    <button
                      type="button"
                      onClick={() => setShowNewPassword(!showNewPassword)}
                      className="text-muted-foreground hover:text-foreground transition-colors"
                    >
                      {showNewPassword ? (
                        <EyeOff className="w-5 h-5" />
                      ) : (
                        <Eye className="w-5 h-5" />
                      )}
                    </button>
                  }
                  error={errors.newPassword?.message}
                  disabled={isLoading}
                  helperText="8 أحرف على الأقل مع أرقام ورموز"
                />
              </div>

              {/* Confirm New Password */}
              <div>
                <Input
                  {...register('confirmPassword')}
                  type={showConfirmPassword ? 'text' : 'password'}
                  label="تأكيد كلمة المرور الجديدة"
                  placeholder="أعد إدخال كلمة المرور الجديدة"
                  leftIcon={<Shield className="w-5 h-5" />}
                  rightIcon={
                    <button
                      type="button"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      className="text-muted-foreground hover:text-foreground transition-colors"
                    >
                      {showConfirmPassword ? (
                        <EyeOff className="w-5 h-5" />
                      ) : (
                        <Eye className="w-5 h-5" />
                      )}
                    </button>
                  }
                  error={errors.confirmPassword?.message}
                  disabled={isLoading}
                />
              </div>

              {/* Security Tips */}
              <div className="p-4 bg-muted/20 rounded-lg">
                <h3 className="font-medium text-foreground mb-2">نصائح الأمان:</h3>
                <ul className="text-sm text-muted-foreground space-y-1">
                  <li>• استخدم كلمة مرور قوية تحتوي على أحرف كبيرة وصغيرة وأرقام ورموز</li>
                  <li>• تجنب استخدام كلمات مرور سهلة التخمين</li>
                  <li>• لا تشارك كلمة المرور مع أي شخص</li>
                  <li>• قم بتغيير كلمة المرور بانتظام</li>
                </ul>
              </div>

              {/* Submit Button */}
              <div className="flex gap-4">
                <Button
                  type="submit"
                  loading={isLoading}
                  leftIcon={<Shield className="w-4 h-4" />}
                >
                  تحديث كلمة المرور
                </Button>
                
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => window.location.href = '/dashboard/profile'}
                >
                  إلغاء
                </Button>
              </div>
            </form>
          </Card>
        </div>
      </Layout>
    </ProtectedRoute>
  );
};

export default ChangePasswordPage;