import React, { useState } from 'react';
import type { NextPage } from 'next';
import Head from 'next/head';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { AlertTriangle, Trash2, Lock, ArrowLeft } from 'lucide-react';

import { Layout } from '@/components/organisms/Layout';
import { ProtectedRoute } from '@/components/organisms/ProtectedRoute';
import { Card } from '@/components/atoms/Card';
import { Button } from '@/components/atoms/Button';
import { Input } from '@/components/atoms/Input';
import { useAuth } from '@/providers/AuthProvider';
import { useToast } from '@/hooks/useToast';

const deleteAccountSchema = z.object({
  password: z.string().min(1, 'كلمة المرور مطلوبة للتأكيد'),
  confirmText: z.string().refine((val) => val === 'حذف حسابي', {
    message: 'يجب كتابة "حذف حسابي" بالضبط',
  }),
});

type DeleteAccountFormData = z.infer<typeof deleteAccountSchema>;

const DeleteAccountPage: NextPage = () => {
  const [step, setStep] = useState<'warning' | 'confirm' | 'processing'>('warning');
  const [isDeleting, setIsDeleting] = useState(false);
  const { user, signOut } = useAuth();
  const { toast } = useToast();

  const {
    register,
    handleSubmit,
    formState: { errors },
    watch,
  } = useForm<DeleteAccountFormData>({
    resolver: zodResolver(deleteAccountSchema),
  });

  const confirmText = watch('confirmText');

  const deleteAccount = async (data: DeleteAccountFormData) => {
    setIsDeleting(true);
    setStep('processing');
    
    try {
      // محاكاة عملية حذف الحساب
      await new Promise(resolve => setTimeout(resolve, 3000));

      // في التطبيق الحقيقي، سيتم إرسال طلب حذف الحساب للخادم
      const response = await fetch('/api/auth/delete-account', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          password: data.password,
          confirmation: data.confirmText,
        }),
      });

      if (!response.ok) {
        throw new Error('فشل في حذف الحساب');
      }

      toast({
        title: 'تم حذف الحساب',
        description: 'تم حذف حسابك نهائياً. وداعاً!',
        variant: 'success',
      });

      // تسجيل الخروج وإعادة التوجيه
      await signOut();
      window.location.href = '/';

    } catch (error) {
      setStep('confirm');
      toast({
        title: 'خطأ في حذف الحساب',
        description: 'حدث خطأ أثناء حذف الحساب، يرجى التأكد من كلمة المرور والمحاولة مرة أخرى',
        variant: 'destructive',
      });
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <ProtectedRoute>
      <Head>
        <title>حذف الحساب - منصة الإشارات</title>
        <meta name="description" content="حذف حسابك نهائياً من المنصة" />
      </Head>

      <Layout showSidebar={true}>
        <div className="p-6 max-w-2xl mx-auto space-y-8">
          <div>
            <h1 className="text-3xl font-bold text-destructive">حذف الحساب</h1>
            <p className="text-muted-foreground mt-2">
              حذف نهائي لحسابك وجميع البيانات المرتبطة به
            </p>
          </div>

          {/* تحذير أولي */}
          {step === 'warning' && (
            <div className="space-y-6">
              <Card className="p-6 border-destructive/20">
                <div className="flex items-start space-x-4 space-x-reverse">
                  <AlertTriangle className="w-8 h-8 text-destructive flex-shrink-0 mt-1" />
                  <div className="space-y-4">
                    <h2 className="text-xl font-semibold text-destructive">تحذير مهم</h2>
                    <p className="text-foreground">
                      حذف الحساب عملية نهائية ولا يمكن التراجع عنها. ستفقد جميع البيانات التالية:
                    </p>
                    
                    <ul className="space-y-2 text-muted-foreground">
                      <li className="flex items-center space-x-2 space-x-reverse">
                        <div className="w-2 h-2 bg-destructive rounded-full" />
                        <span>جميع إشارات التداول وسجل الأداء</span>
                      </li>
                      <li className="flex items-center space-x-2 space-x-reverse">
                        <div className="w-2 h-2 bg-destructive rounded-full" />
                        <span>الإعدادات والتفضيلات الشخصية</span>
                      </li>
                      <li className="flex items-center space-x-2 space-x-reverse">
                        <div className="w-2 h-2 bg-destructive rounded-full" />
                        <span>جميع البيانات والإحصائيات</span>
                      </li>
                      <li className="flex items-center space-x-2 space-x-reverse">
                        <div className="w-2 h-2 bg-destructive rounded-full" />
                        <span>معلومات الملف الشخصي</span>
                      </li>
                      <li className="flex items-center space-x-2 space-x-reverse">
                        <div className="w-2 h-2 bg-destructive rounded-full" />
                        <span>جميع الملفات والمرفقات</span>
                      </li>
                    </ul>
                  </div>
                </div>
              </Card>

              <Card className="p-6">
                <h3 className="font-semibold text-foreground mb-4">البدائل المتاحة</h3>
                <div className="space-y-4">
                  <div className="flex items-start space-x-3 space-x-reverse">
                    <div className="w-2 h-2 bg-primary rounded-full mt-2" />
                    <div>
                      <h4 className="font-medium text-foreground">تعطيل الحساب مؤقتاً</h4>
                      <p className="text-sm text-muted-foreground">
                        يمكنك تعطيل حسابك مؤقتاً بدلاً من حذفه نهائياً
                      </p>
                    </div>
                  </div>
                  <div className="flex items-start space-x-3 space-x-reverse">
                    <div className="w-2 h-2 bg-primary rounded-full mt-2" />
                    <div>
                      <h4 className="font-medium text-foreground">تصدير البيانات</h4>
                      <p className="text-sm text-muted-foreground">
                        احتفظ بنسخة من بياناتك قبل الحذف
                      </p>
                    </div>
                  </div>
                  <div className="flex items-start space-x-3 space-x-reverse">
                    <div className="w-2 h-2 bg-primary rounded-full mt-2" />
                    <div>
                      <h4 className="font-medium text-foreground">التواصل مع الدعم</h4>
                      <p className="text-sm text-muted-foreground">
                        تحدث مع فريق الدعم لحل أي مشاكل
                      </p>
                    </div>
                  </div>
                </div>
              </Card>

              <div className="flex space-x-4 space-x-reverse">
                <Button 
                  variant="destructive"
                  onClick={() => setStep('confirm')}
                  leftIcon={<Trash2 className="w-4 h-4" />}
                >
                  متابعة الحذف
                </Button>
                <Button 
                  variant="outline"
                  onClick={() => window.location.href = '/dashboard/profile'}
                  leftIcon={<ArrowLeft className="w-4 h-4" />}
                >
                  إلغاء والعودة
                </Button>
              </div>
            </div>
          )}

          {/* تأكيد الحذف */}
          {step === 'confirm' && (
            <Card className="p-8">
              <div className="space-y-6">
                <div className="text-center">
                  <div className="w-16 h-16 bg-destructive/10 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Trash2 className="w-8 h-8 text-destructive" />
                  </div>
                  <h2 className="text-2xl font-semibold text-foreground">تأكيد حذف الحساب</h2>
                  <p className="text-muted-foreground mt-2">
                    أدخل كلمة المرور والتأكيد لحذف حسابك نهائياً
                  </p>
                </div>

                <form onSubmit={handleSubmit(deleteAccount)} className="space-y-6">
                  <div>
                    <Input
                      {...register('password')}
                      type="password"
                      label="كلمة المرور"
                      placeholder="أدخل كلمة المرور للتأكيد"
                      leftIcon={<Lock className="w-5 h-5" />}
                      error={errors.password?.message}
                      disabled={isDeleting}
                    />
                  </div>

                  <div>
                    <Input
                      {...register('confirmText')}
                      type="text"
                      label="تأكيد الحذف"
                      placeholder="اكتب: حذف حسابي"
                      error={errors.confirmText?.message}
                      disabled={isDeleting}
                      helperText='اكتب "حذف حسابي" بالضبط للتأكيد'
                    />
                  </div>

                  <div className="bg-destructive/10 border border-destructive/20 rounded-lg p-4">
                    <div className="flex items-start space-x-3 space-x-reverse">
                      <AlertTriangle className="w-5 h-5 text-destructive flex-shrink-0 mt-0.5" />
                      <div className="text-sm">
                        <p className="font-medium text-destructive mb-1">تأكيد نهائي</p>
                        <p className="text-destructive/80">
                          بالنقر على "حذف الحساب نهائياً" فإنك توافق على حذف جميع بياناتك بشكل دائم ولا يمكن استرداده.
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="flex space-x-4 space-x-reverse">
                    <Button
                      type="submit"
                      variant="destructive"
                      loading={isDeleting}
                      disabled={confirmText !== 'حذف حسابي'}
                      leftIcon={<Trash2 className="w-4 h-4" />}
                      className="flex-1"
                    >
                      {isDeleting ? 'جاري الحذف...' : 'حذف الحساب نهائياً'}
                    </Button>
                    
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => setStep('warning')}
                      disabled={isDeleting}
                      className="flex-1"
                    >
                      إلغاء
                    </Button>
                  </div>
                </form>
              </div>
            </Card>
          )}

          {/* معالجة الحذف */}
          {step === 'processing' && (
            <Card className="p-8 text-center">
              <div className="space-y-4">
                <div className="w-16 h-16 bg-destructive/10 rounded-full flex items-center justify-center mx-auto">
                  <Trash2 className="w-8 h-8 text-destructive animate-pulse" />
                </div>
                <h2 className="text-2xl font-semibold text-foreground">جاري حذف الحساب...</h2>
                <p className="text-muted-foreground">
                  يتم الآن حذف جميع بياناتك نهائياً. هذا قد يستغرق بضع دقائق.
                </p>
                <div className="w-full bg-muted rounded-full h-2">
                  <div className="bg-destructive h-2 rounded-full animate-pulse w-1/2"></div>
                </div>
              </div>
            </Card>
          )}
        </div>
      </Layout>
    </ProtectedRoute>
  );
};

export default DeleteAccountPage;