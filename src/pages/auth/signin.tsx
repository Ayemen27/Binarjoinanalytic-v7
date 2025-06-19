import React, { useState } from 'react';
import { NextPage } from 'next';
import Head from 'next/head';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { useTranslation } from 'next-i18next';
import { serverSideTranslations } from 'next-i18next/serverSideTranslations';
import { GetStaticProps } from 'next';
import { motion } from 'framer-motion';
import { Eye, EyeOff, Mail, Lock, AlertCircle } from 'lucide-react';

import { Button } from '@/components/atoms/Button';
import { Input } from '@/components/atoms/Input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/atoms/Card';
import { useAuth } from '@/providers/AuthProvider';
import { useToast } from '@/hooks/useToast';

const SignInPage: NextPage = () => {
  const { t } = useTranslation('auth');
  const router = useRouter();
  const { signIn, loading } = useAuth();
  const { toast } = useToast();

  const [formData, setFormData] = useState({
    email: '',
    password: '',
  });
  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.email || !formData.password) {
      toast({
        title: 'خطأ في البيانات',
        description: 'يرجى إدخال البريد الإلكتروني وكلمة المرور',
        variant: 'destructive',
      });
      return;
    }

    setIsSubmitting(true);
    
    try {
      await signIn(formData.email, formData.password);
      router.push('/dashboard');
    } catch (error: any) {
      console.error('Sign in error:', error);
      toast({
        title: 'خطأ في تسجيل الدخول',
        description: error.message || 'حدث خطأ أثناء تسجيل الدخول',
        variant: 'destructive',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <>
      <Head>
        <title>تسجيل الدخول - منصة الخدمات الرقمية</title>
        <meta name="description" content="تسجيل الدخول إلى منصة الخدمات الرقمية المتكاملة" />
      </Head>

      <div className="min-h-screen bg-gradient-to-br from-background via-background to-primary/5 flex items-center justify-center p-4">
        {/* Background Elements */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute -top-40 -right-40 w-80 h-80 bg-primary/10 rounded-full blur-3xl" />
          <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-accent/10 rounded-full blur-3xl" />
        </div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="relative z-10 w-full max-w-md"
        >
          <Card variant="elevated" className="backdrop-blur-sm bg-card/80">
            <CardHeader className="text-center pb-6">
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.6, delay: 0.1 }}
              >
                <div className="w-16 h-16 bg-gradient-to-br from-primary to-accent rounded-2xl flex items-center justify-center mx-auto mb-4">
                  <span className="text-white font-bold text-2xl">DP</span>
                </div>
                <CardTitle className="text-2xl font-bold text-foreground">
                  تسجيل الدخول
                </CardTitle>
                <p className="text-muted-foreground mt-2">
                  مرحباً بك في منصة الخدمات الرقمية
                </p>
              </motion.div>
            </CardHeader>

            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-6">
                {/* Email Field */}
                <motion.div
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.6, delay: 0.2 }}
                >
                  <Input
                    name="email"
                    type="email"
                    label="البريد الإلكتروني"
                    placeholder="أدخل بريدك الإلكتروني"
                    value={formData.email}
                    onChange={handleInputChange}
                    leftIcon={<Mail className="h-4 w-4" />}
                    required
                    disabled={isSubmitting || loading}
                  />
                </motion.div>

                {/* Password Field */}
                <motion.div
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.6, delay: 0.3 }}
                >
                  <Input
                    name="password"
                    type={showPassword ? 'text' : 'password'}
                    label="كلمة المرور"
                    placeholder="أدخل كلمة المرور"
                    value={formData.password}
                    onChange={handleInputChange}
                    leftIcon={<Lock className="h-4 w-4" />}
                    rightIcon={
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="text-muted-foreground hover:text-foreground transition-colors"
                      >
                        {showPassword ? (
                          <EyeOff className="h-4 w-4" />
                        ) : (
                          <Eye className="h-4 w-4" />
                        )}
                      </button>
                    }
                    required
                    disabled={isSubmitting || loading}
                  />
                </motion.div>

                {/* Forgot Password Link */}
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ duration: 0.6, delay: 0.4 }}
                  className="text-left"
                >
                  <Link
                    href="/auth/forgot-password"
                    className="text-sm text-primary hover:text-primary/80 transition-colors"
                  >
                    نسيت كلمة المرور؟
                  </Link>
                </motion.div>

                {/* Submit Button */}
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: 0.5 }}
                >
                  <Button
                    type="submit"
                    size="lg"
                    fullWidth
                    loading={isSubmitting || loading}
                    disabled={!formData.email || !formData.password}
                  >
                    {isSubmitting || loading ? 'جاري تسجيل الدخول...' : 'تسجيل الدخول'}
                  </Button>
                </motion.div>

                {/* Sign Up Link */}
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ duration: 0.6, delay: 0.6 }}
                  className="text-center pt-4 border-t border-border"
                >
                  <p className="text-sm text-muted-foreground">
                    ليس لديك حساب؟{' '}
                    <Link
                      href="/auth/signup"
                      className="text-primary hover:text-primary/80 transition-colors font-medium"
                    >
                      إنشاء حساب جديد
                    </Link>
                  </p>
                </motion.div>
              </form>
            </CardContent>
          </Card>

          {/* Back to Home */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.6, delay: 0.7 }}
            className="text-center mt-6"
          >
            <Link
              href="/"
              className="text-sm text-muted-foreground hover:text-foreground transition-colors"
            >
              ← العودة إلى الصفحة الرئيسية
            </Link>
          </motion.div>
        </motion.div>
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

export default SignInPage;