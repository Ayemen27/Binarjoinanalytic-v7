import React, { useState } from 'react';
import type { NextPage } from 'next';
import Head from 'next/head';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { useTranslation } from 'next-i18next';
import { serverSideTranslations } from 'next-i18next/serverSideTranslations';
import { GetStaticProps } from 'next';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Eye, EyeOff, Mail, Lock, User } from 'lucide-react';

import { useAuth } from '@/providers/AuthProvider';
import { Button } from '@/components/atoms/Button';
import { Input } from '@/components/atoms/Input';
import { Card } from '@/components/atoms/Card';

const registerSchema = z.object({
  fullName: z.string().min(2, 'الاسم يجب أن يكون حرفين على الأقل'),
  email: z.string().email('البريد الإلكتروني غير صحيح'),
  password: z.string().min(8, 'كلمة المرور يجب أن تكون 8 أحرف على الأقل'),
  confirmPassword: z.string(),
  terms: z.boolean().refine(val => val === true, {
    message: 'يجب الموافقة على الشروط والأحكام',
  }),
}).refine((data) => data.password === data.confirmPassword, {
  message: 'كلمات المرور غير متطابقة',
  path: ['confirmPassword'],
});

type RegisterFormData = z.infer<typeof registerSchema>;

const RegisterPage: NextPage = () => {
  const { t } = useTranslation('auth');
  const { signUp } = useAuth();
  const router = useRouter();
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<RegisterFormData>({
    resolver: zodResolver(registerSchema),
  });

  const onSubmit = async (data: RegisterFormData) => {
    try {
      await signUp(data.email, data.password, {
        full_name: data.fullName,
      });
      router.push('/auth/verify-email');
    } catch (error) {
      // Error handling is done in AuthProvider
      console.error('Registration failed:', error);
    }
  };

  return (
    <>
      <Head>
        <title>إنشاء حساب جديد - منصة الإشارات</title>
        <meta name="description" content="أنشئ حسابك المجاني في منصة الإشارات واحصل على إشارات التداول الذكية" />
      </Head>

      <div className="min-h-screen bg-gradient-to-br from-background via-background to-primary/5 flex items-center justify-center p-4">
        {/* Background decoration */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute -top-40 -right-40 w-80 h-80 bg-primary/10 rounded-full blur-3xl" />
          <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-accent/10 rounded-full blur-3xl" />
        </div>

        <div className="relative z-10 w-full max-w-md">
          <Card className="p-8 shadow-hard">
            {/* Header */}
            <div className="text-center mb-8">
              <h1 className="text-3xl font-bold text-foreground mb-2">
                إنشاء حساب جديد
              </h1>
              <p className="text-muted-foreground">
                انضم إلى منصة الإشارات الذكية
              </p>
            </div>

            {/* Register Form */}
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
              {/* Full Name Field */}
              <div>
                <Input
                  {...register('fullName')}
                  type="text"
                  label="الاسم الكامل"
                  placeholder="أدخل اسمك الكامل"
                  leftIcon={<User className="w-5 h-5" />}
                  error={errors.fullName?.message}
                  disabled={isSubmitting}
                />
              </div>

              {/* Email Field */}
              <div>
                <Input
                  {...register('email')}
                  type="email"
                  label="البريد الإلكتروني"
                  placeholder="example@domain.com"
                  leftIcon={<Mail className="w-5 h-5" />}
                  error={errors.email?.message}
                  disabled={isSubmitting}
                />
              </div>

              {/* Password Field */}
              <div>
                <Input
                  {...register('password')}
                  type={showPassword ? 'text' : 'password'}
                  label="كلمة المرور"
                  placeholder="أدخل كلمة مرور قوية"
                  leftIcon={<Lock className="w-5 h-5" />}
                  rightIcon={
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="text-muted-foreground hover:text-foreground transition-colors"
                    >
                      {showPassword ? (
                        <EyeOff className="w-5 h-5" />
                      ) : (
                        <Eye className="w-5 h-5" />
                      )}
                    </button>
                  }
                  error={errors.password?.message}
                  disabled={isSubmitting}
                  helperText="8 أحرف على الأقل مع أرقام ورموز"
                />
              </div>

              {/* Confirm Password Field */}
              <div>
                <Input
                  {...register('confirmPassword')}
                  type={showConfirmPassword ? 'text' : 'password'}
                  label="تأكيد كلمة المرور"
                  placeholder="أعد إدخال كلمة المرور"
                  leftIcon={<Lock className="w-5 h-5" />}
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
                  disabled={isSubmitting}
                />
              </div>

              {/* Terms Checkbox */}
              <div className="flex items-start space-x-3 space-x-reverse">
                <input
                  {...register('terms')}
                  type="checkbox"
                  id="terms"
                  className="mt-1 h-4 w-4 text-primary focus:ring-primary border-border rounded"
                  disabled={isSubmitting}
                />
                <label htmlFor="terms" className="text-sm text-muted-foreground">
                  أوافق على{' '}
                  <Link href="/terms" className="text-primary hover:text-primary/80">
                    الشروط والأحكام
                  </Link>{' '}
                  و{' '}
                  <Link href="/privacy" className="text-primary hover:text-primary/80">
                    سياسة الخصوصية
                  </Link>
                </label>
              </div>
              {errors.terms && (
                <p className="text-sm text-destructive">{errors.terms.message}</p>
              )}

              {/* Submit Button */}
              <Button
                type="submit"
                fullWidth
                loading={isSubmitting}
                className="h-12"
              >
                إنشاء الحساب
              </Button>
            </form>

            {/* Divider */}
            <div className="relative my-6">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-border"></div>
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-2 bg-card text-muted-foreground">أو</span>
              </div>
            </div>

            {/* Sign In Link */}
            <div className="text-center">
              <p className="text-sm text-muted-foreground">
                لديك حساب بالفعل؟{' '}
                <Link
                  href="/auth/login"
                  className="text-primary hover:text-primary/80 font-medium transition-colors"
                >
                  تسجيل الدخول
                </Link>
              </p>
            </div>

            {/* Back to Home */}
            <div className="text-center mt-6">
              <Link
                href="/"
                className="text-sm text-muted-foreground hover:text-foreground transition-colors"
              >
                العودة إلى الصفحة الرئيسية
              </Link>
            </div>
          </Card>
        </div>
      </div>
    </>
  );
};

export const getStaticProps: GetStaticProps = async ({ locale }) => {
  return {
    props: {
      ...(await serverSideTranslations(locale ?? 'ar', ['auth', 'common'])),
    },
  };
};

export default RegisterPage;