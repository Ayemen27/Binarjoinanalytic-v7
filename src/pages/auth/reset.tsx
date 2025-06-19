import React, { useState } from 'react';
import type { NextPage } from 'next';
import Head from 'next/head';
import Link from 'next/link';
import { useTranslation } from 'next-i18next';
import { serverSideTranslations } from 'next-i18next/serverSideTranslations';
import { GetStaticProps } from 'next';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Mail, ArrowRight } from 'lucide-react';

import { useAuth } from '@/providers/AuthProvider';
import { Button } from '@/components/atoms/Button';
import { Input } from '@/components/atoms/Input';
import { Card } from '@/components/atoms/Card';

const resetSchema = z.object({
  email: z.string().email('البريد الإلكتروني غير صحيح'),
});

type ResetFormData = z.infer<typeof resetSchema>;

const ResetPasswordPage: NextPage = () => {
  const { t } = useTranslation('auth');
  const { resetPassword } = useAuth();
  const [isSubmitted, setIsSubmitted] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    getValues,
  } = useForm<ResetFormData>({
    resolver: zodResolver(resetSchema),
  });

  const onSubmit = async (data: ResetFormData) => {
    try {
      await resetPassword(data.email);
      setIsSubmitted(true);
    } catch (error) {
      console.error('Reset password failed:', error);
    }
  };

  if (isSubmitted) {
    return (
      <>
        <Head>
          <title>تم إرسال رابط إعادة التعيين - منصة الإشارات</title>
        </Head>

        <div className="min-h-screen bg-gradient-to-br from-background via-background to-primary/5 flex items-center justify-center p-4">
          <div className="absolute inset-0 overflow-hidden">
            <div className="absolute -top-40 -right-40 w-80 h-80 bg-primary/10 rounded-full blur-3xl" />
            <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-accent/10 rounded-full blur-3xl" />
          </div>

          <div className="relative z-10 w-full max-w-md">
            <Card className="p-8 shadow-hard text-center">
              <div className="w-16 h-16 bg-success/10 rounded-full flex items-center justify-center mx-auto mb-6">
                <Mail className="w-8 h-8 text-success" />
              </div>
              
              <h1 className="text-2xl font-bold text-foreground mb-4">
                تم إرسال الرابط بنجاح
              </h1>
              
              <p className="text-muted-foreground mb-6">
                تم إرسال رابط إعادة تعيين كلمة المرور إلى البريد الإلكتروني:
              </p>
              
              <div className="bg-muted/30 rounded-lg p-3 mb-6">
                <p className="font-medium text-foreground">
                  {getValues('email')}
                </p>
              </div>
              
              <p className="text-sm text-muted-foreground mb-8">
                تحقق من صندوق الوارد (وصندوق الرسائل المهملة) واتبع التعليمات لإعادة تعيين كلمة المرور.
              </p>

              <div className="space-y-4">
                <Link href="/auth/login">
                  <Button fullWidth>
                    العودة إلى تسجيل الدخول
                  </Button>
                </Link>
                
                <button
                  onClick={() => setIsSubmitted(false)}
                  className="w-full text-sm text-muted-foreground hover:text-foreground transition-colors"
                >
                  إرسال إلى بريد إلكتروني آخر؟
                </button>
              </div>
            </Card>
          </div>
        </div>
      </>
    );
  }

  return (
    <>
      <Head>
        <title>إعادة تعيين كلمة المرور - منصة الإشارات</title>
        <meta name="description" content="أعد تعيين كلمة المرور الخاصة بك في منصة الإشارات" />
      </Head>

      <div className="min-h-screen bg-gradient-to-br from-background via-background to-primary/5 flex items-center justify-center p-4">
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute -top-40 -right-40 w-80 h-80 bg-primary/10 rounded-full blur-3xl" />
          <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-accent/10 rounded-full blur-3xl" />
        </div>

        <div className="relative z-10 w-full max-w-md">
          <Card className="p-8 shadow-hard">
            <div className="text-center mb-8">
              <h1 className="text-3xl font-bold text-foreground mb-2">
                إعادة تعيين كلمة المرور
              </h1>
              <p className="text-muted-foreground">
                أدخل بريدك الإلكتروني لإرسال رابط إعادة التعيين
              </p>
            </div>

            <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
              <div>
                <Input
                  {...register('email')}
                  type="email"
                  label="البريد الإلكتروني"
                  placeholder="example@domain.com"
                  leftIcon={<Mail className="w-5 h-5" />}
                  error={errors.email?.message}
                  disabled={isSubmitting}
                  helperText="سنرسل رابط إعادة تعيين كلمة المرور إلى هذا البريد"
                />
              </div>

              <Button
                type="submit"
                fullWidth
                loading={isSubmitting}
                className="h-12"
              >
                إرسال رابط إعادة التعيين
              </Button>
            </form>

            <div className="text-center mt-8 space-y-4">
              <p className="text-sm text-muted-foreground">
                تذكرت كلمة المرور؟{' '}
                <Link
                  href="/auth/login"
                  className="text-primary hover:text-primary/80 font-medium transition-colors"
                >
                  تسجيل الدخول
                </Link>
              </p>

              <Link
                href="/"
                className="inline-flex items-center text-sm text-muted-foreground hover:text-foreground transition-colors"
              >
                <ArrowRight className="w-4 h-4 ml-2" />
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

export default ResetPasswordPage;