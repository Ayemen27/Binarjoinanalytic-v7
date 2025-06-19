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
import { Eye, EyeOff, Mail, Lock } from 'lucide-react';

import { useAuth } from '@/providers/AuthProvider';
import { Button } from '@/components/atoms/Button';
import { Input } from '@/components/atoms/Input';
import { Card } from '@/components/atoms/Card';

const loginSchema = z.object({
  email: z.string().email('البريد الإلكتروني غير صحيح'),
  password: z.string().min(6, 'كلمة المرور يجب أن تكون 6 أحرف على الأقل'),
});

type LoginFormData = z.infer<typeof loginSchema>;

const LoginPage: NextPage = () => {
  const { t } = useTranslation('auth');
  const { signIn } = useAuth();
  const router = useRouter();
  const [showPassword, setShowPassword] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
  });

  const onSubmit = async (data: LoginFormData) => {
    try {
      await signIn(data.email, data.password);
      router.push('/dashboard');
    } catch (error) {
      // Error handling is done in AuthProvider
      console.error('Login failed:', error);
    }
  };

  return (
    <>
      <Head>
        <title>تسجيل الدخول - منصة الإشارات</title>
        <meta name="description" content="سجل دخولك إلى منصة الإشارات للحصول على إشارات التداول الذكية" />
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
                مرحباً بعودتك
              </h1>
              <p className="text-muted-foreground">
                سجل دخولك للوصول إلى حسابك
              </p>
            </div>

            {/* Login Form */}
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
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
                  placeholder="أدخل كلمة المرور"
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
                />
              </div>

              {/* Forgot Password Link */}
              <div className="text-right">
                <Link
                  href="/auth/reset"
                  className="text-sm text-primary hover:text-primary/80 transition-colors"
                >
                  نسيت كلمة المرور؟
                </Link>
              </div>

              {/* Submit Button */}
              <Button
                type="submit"
                fullWidth
                loading={isSubmitting}
                className="h-12"
              >
                تسجيل الدخول
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

            {/* Sign Up Link */}
            <div className="text-center">
              <p className="text-sm text-muted-foreground">
                ليس لديك حساب؟{' '}
                <Link
                  href="/auth/register"
                  className="text-primary hover:text-primary/80 font-medium transition-colors"
                >
                  إنشاء حساب جديد
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

export default LoginPage;