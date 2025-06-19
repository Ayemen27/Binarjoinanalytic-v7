import React, { useState } from 'react';
import { NextPage } from 'next';
import Head from 'next/head';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { useTranslation } from 'next-i18next';
import { serverSideTranslations } from 'next-i18next/serverSideTranslations';
import { GetStaticProps } from 'next';
import { motion } from 'framer-motion';
import { Eye, EyeOff, Mail, Lock, User, Phone, CheckCircle } from 'lucide-react';

import { Button } from '@/components/atoms/Button';
import { Input } from '@/components/atoms/Input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/atoms/Card';
import { useAuth } from '@/providers/AuthProvider';
import { useToast } from '@/hooks/useToast';

const SignUpPage: NextPage = () => {
  const { t } = useTranslation('auth');
  const router = useRouter();
  const { signUp, loading } = useAuth();
  const { toast } = useToast();

  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    phone: '',
    password: '',
    confirmPassword: '',
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [acceptTerms, setAcceptTerms] = useState(false);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const validateForm = () => {
    if (!formData.fullName.trim()) {
      toast({
        title: 'خطأ في البيانات',
        description: 'يرجى إدخال الاسم الكامل',
        variant: 'destructive',
      });
      return false;
    }

    if (!formData.email) {
      toast({
        title: 'خطأ في البيانات',
        description: 'يرجى إدخال البريد الإلكتروني',
        variant: 'destructive',
      });
      return false;
    }

    if (formData.password.length < 8) {
      toast({
        title: 'خطأ في كلمة المرور',
        description: 'يجب أن تكون كلمة المرور 8 أحرف على الأقل',
        variant: 'destructive',
      });
      return false;
    }

    if (formData.password !== formData.confirmPassword) {
      toast({
        title: 'خطأ في تأكيد كلمة المرور',
        description: 'كلمتا المرور غير متطابقتين',
        variant: 'destructive',
      });
      return false;
    }

    if (!acceptTerms) {
      toast({
        title: 'الموافقة على الشروط',
        description: 'يرجى الموافقة على شروط الاستخدام',
        variant: 'destructive',
      });
      return false;
    }

    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) return;

    setIsSubmitting(true);
    
    try {
      await signUp(formData.email, formData.password, {
        full_name: formData.fullName,
        phone_number: formData.phone,
      });
      
      toast({
        title: 'تم إنشاء الحساب بنجاح',
        description: 'تحقق من بريدك الإلكتروني لتفعيل الحساب',
        variant: 'default',
      });
      
      router.push('/auth/verify-email');
    } catch (error: any) {
      console.error('Sign up error:', error);
      toast({
        title: 'خطأ في إنشاء الحساب',
        description: error.message || 'حدث خطأ أثناء إنشاء الحساب',
        variant: 'destructive',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <>
      <Head>
        <title>إنشاء حساب جديد - منصة الخدمات الرقمية</title>
        <meta name="description" content="إنشاء حساب جديد في منصة الخدمات الرقمية المتكاملة" />
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
                  إنشاء حساب جديد
                </CardTitle>
                <p className="text-muted-foreground mt-2">
                  انضم إلى منصة الخدمات الرقمية
                </p>
              </motion.div>
            </CardHeader>

            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-4">
                {/* Full Name Field */}
                <motion.div
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.6, delay: 0.2 }}
                >
                  <Input
                    name="fullName"
                    type="text"
                    label="الاسم الكامل"
                    placeholder="أدخل اسمك الكامل"
                    value={formData.fullName}
                    onChange={handleInputChange}
                    leftIcon={<User className="h-4 w-4" />}
                    required
                    disabled={isSubmitting || loading}
                  />
                </motion.div>

                {/* Email Field */}
                <motion.div
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.6, delay: 0.3 }}
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

                {/* Phone Field */}
                <motion.div
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.6, delay: 0.4 }}
                >
                  <Input
                    name="phone"
                    type="tel"
                    label="رقم الهاتف (اختياري)"
                    placeholder="أدخل رقم هاتفك"
                    value={formData.phone}
                    onChange={handleInputChange}
                    leftIcon={<Phone className="h-4 w-4" />}
                    disabled={isSubmitting || loading}
                  />
                </motion.div>

                {/* Password Field */}
                <motion.div
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.6, delay: 0.5 }}
                >
                  <Input
                    name="password"
                    type={showPassword ? 'text' : 'password'}
                    label="كلمة المرور"
                    placeholder="أدخل كلمة مرور قوية"
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
                    helperText="يجب أن تكون 8 أحرف على الأقل"
                    required
                    disabled={isSubmitting || loading}
                  />
                </motion.div>

                {/* Confirm Password Field */}
                <motion.div
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.6, delay: 0.6 }}
                >
                  <Input
                    name="confirmPassword"
                    type={showConfirmPassword ? 'text' : 'password'}
                    label="تأكيد كلمة المرور"
                    placeholder="أعد إدخال كلمة المرور"
                    value={formData.confirmPassword}
                    onChange={handleInputChange}
                    leftIcon={<Lock className="h-4 w-4" />}
                    rightIcon={
                      <button
                        type="button"
                        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                        className="text-muted-foreground hover:text-foreground transition-colors"
                      >
                        {showConfirmPassword ? (
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

                {/* Terms Checkbox */}
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ duration: 0.6, delay: 0.7 }}
                  className="flex items-start gap-3"
                >
                  <input
                    type="checkbox"
                    id="acceptTerms"
                    checked={acceptTerms}
                    onChange={(e) => setAcceptTerms(e.target.checked)}
                    className="mt-1 h-4 w-4 text-primary focus:ring-primary border-border rounded"
                    disabled={isSubmitting || loading}
                  />
                  <label htmlFor="acceptTerms" className="text-sm text-muted-foreground leading-5">
                    أوافق على{' '}
                    <Link href="/terms" className="text-primary hover:text-primary/80">
                      شروط الاستخدام
                    </Link>
                    {' '}و{' '}
                    <Link href="/privacy" className="text-primary hover:text-primary/80">
                      سياسة الخصوصية
                    </Link>
                  </label>
                </motion.div>

                {/* Submit Button */}
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: 0.8 }}
                >
                  <Button
                    type="submit"
                    size="lg"
                    fullWidth
                    loading={isSubmitting || loading}
                    disabled={!acceptTerms}
                  >
                    {isSubmitting || loading ? 'جاري إنشاء الحساب...' : 'إنشاء حساب'}
                  </Button>
                </motion.div>

                {/* Sign In Link */}
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ duration: 0.6, delay: 0.9 }}
                  className="text-center pt-4 border-t border-border"
                >
                  <p className="text-sm text-muted-foreground">
                    لديك حساب بالفعل؟{' '}
                    <Link
                      href="/auth/signin"
                      className="text-primary hover:text-primary/80 transition-colors font-medium"
                    >
                      تسجيل الدخول
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
            transition={{ duration: 0.6, delay: 1.0 }}
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

export default SignUpPage;