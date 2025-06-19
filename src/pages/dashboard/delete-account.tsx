import React, { useState } from 'react';
import type { NextPage } from 'next';
import Head from 'next/head';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { AlertTriangle, Trash2, Shield, CheckCircle } from 'lucide-react';

import { Layout } from '@/components/organisms/Layout';
import { ProtectedRoute } from '@/components/organisms/ProtectedRoute';
import { Card } from '@/components/atoms/Card';
import { Button } from '@/components/atoms/Button';
import { Input } from '@/components/atoms/Input';
import { useAuth } from '@/providers/AuthProvider';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';

const deleteAccountSchema = z.object({
  confirmText: z.string().refine(val => val === 'حذف حسابي', {
    message: 'يجب كتابة "حذف حسابي" بالضبط'
  }),
  password: z.string().min(1, 'أدخل كلمة المرور للتأكيد'),
  reason: z.string().optional(),
});

type DeleteAccountFormData = z.infer<typeof deleteAccountSchema>;

const DeleteAccountPage: NextPage = () => {
  const { user, signOut } = useAuth();
  const [step, setStep] = useState(1);
  const [isDeleting, setIsDeleting] = useState(false);
  
  const supabase = createClientComponentClient();

  const {
    register,
    handleSubmit,
    formState: { errors },
    watch,
  } = useForm<DeleteAccountFormData>({
    resolver: zodResolver(deleteAccountSchema),
  });

  const confirmText = watch('confirmText');

  const onSubmit = async (data: DeleteAccountFormData) => {
    setIsDeleting(true);
    
    try {
      // Log the account deletion request
      await supabase.from('permission_audit').insert({
        user_id: user?.id,
        action_type: 'account_deletion_requested',
        result: 'allowed',
        reason: data.reason || 'User requested account deletion',
      });

      // In a real implementation, you would:
      // 1. Verify the password
      // 2. Delete user data according to GDPR requirements
      // 3. Delete the user account
      
      // For demo purposes, we'll simulate the process
      await new Promise(resolve => setTimeout(resolve, 3000));
      
      setStep(2);
      
      // Sign out after a delay
      setTimeout(async () => {
        await signOut();
        window.location.href = '/';
      }, 5000);
      
    } catch (error) {
      console.error('Error deleting account:', error);
      alert('حدث خطأ في حذف الحساب. يرجى المحاولة لاحقاً.');
    } finally {
      setIsDeleting(false);
    }
  };

  if (step === 2) {
    return (
      <ProtectedRoute>
        <Head>
          <title>تم حذف الحساب - منصة الإشارات</title>
        </Head>

        <Layout showSidebar={false}>
          <div className="p-6 max-w-2xl mx-auto min-h-screen flex items-center justify-center">
            <Card className="p-8 text-center">
              <div className="w-16 h-16 bg-success/10 rounded-full flex items-center justify-center mx-auto mb-6">
                <CheckCircle className="w-8 h-8 text-success" />
              </div>
              
              <h1 className="text-2xl font-bold text-foreground mb-4">
                تم حذف حسابك بنجاح
              </h1>
              
              <p className="text-muted-foreground mb-6">
                تم حذف حسابك وجميع بياناتك المرتبطة به وفقاً لسياسة الخصوصية. 
                نأسف لرؤيتك تغادر وندعوك للعودة في أي وقت.
              </p>
              
              <div className="space-y-3">
                <p className="text-sm text-muted-foreground">
                  سيتم تسجيل خروجك خلال 5 ثواني...
                </p>
                
                <Button onClick={() => window.location.href = '/'}>
                  الذهاب للصفحة الرئيسية
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
        <title>حذف الحساب - منصة الإشارات</title>
      </Head>

      <Layout showSidebar={true}>
        <div className="p-6 max-w-2xl mx-auto">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-foreground text-destructive">حذف الحساب</h1>
            <p className="text-muted-foreground mt-2">
              هذا الإجراء نهائي ولا يمكن التراجع عنه
            </p>
          </div>

          {/* Warning Card */}
          <Card className="p-6 border-destructive/20 bg-destructive/5 mb-6">
            <div className="flex items-start gap-4">
              <AlertTriangle className="w-6 h-6 text-destructive mt-1" />
              <div>
                <h3 className="font-semibold text-destructive mb-2">
                  تحذير: حذف نهائي للحساب
                </h3>
                <div className="text-sm text-muted-foreground space-y-1">
                  <p>• سيتم حذف جميع بياناتك الشخصية نهائياً</p>
                  <p>• سيتم حذف جميع إشاراتك وسجل التداول</p>
                  <p>• سيتم إلغاء اشتراكك إن وُجد</p>
                  <p>• لن تتمكن من استرداد أي من هذه البيانات</p>
                  <p>• سيتم تسجيل خروجك من جميع الأجهزة</p>
                </div>
              </div>
            </div>
          </Card>

          {/* Alternative Options */}
          <Card className="p-6 mb-6">
            <h3 className="font-semibold text-foreground mb-4">بدائل أخرى قد تناسبك:</h3>
            
            <div className="space-y-4">
              <div className="flex items-center justify-between p-4 border border-border rounded-lg">
                <div>
                  <h4 className="font-medium">إيقاف الحساب مؤقتاً</h4>
                  <p className="text-sm text-muted-foreground">
                    يمكنك إيقاف حسابك مؤقتاً وإعادة تفعيله لاحقاً
                  </p>
                </div>
                <Button variant="outline">
                  إيقاف مؤقت
                </Button>
              </div>

              <div className="flex items-center justify-between p-4 border border-border rounded-lg">
                <div>
                  <h4 className="font-medium">تنزيل بياناتك</h4>
                  <p className="text-sm text-muted-foreground">
                    احصل على نسخة من جميع بياناتك قبل الحذف
                  </p>
                </div>
                <Button variant="outline">
                  تنزيل البيانات
                </Button>
              </div>

              <div className="flex items-center justify-between p-4 border border-border rounded-lg">
                <div>
                  <h4 className="font-medium">التواصل مع الدعم</h4>
                  <p className="text-sm text-muted-foreground">
                    تحدث معنا حول أي مشاكل قد تواجهها
                  </p>
                </div>
                <Button variant="outline">
                  الدعم الفني
                </Button>
              </div>
            </div>
          </Card>

          {/* Delete Form */}
          <Card className="p-6">
            <h3 className="font-semibold text-foreground mb-4">
              أؤكد رغبتي في حذف الحساب نهائياً
            </h3>

            <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
              {/* Confirmation Text */}
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">
                  اكتب "حذف حسابي" للتأكيد
                </label>
                <Input
                  {...register('confirmText')}
                  placeholder="حذف حسابي"
                  error={errors.confirmText?.message}
                  disabled={isDeleting}
                />
              </div>

              {/* Password Confirmation */}
              <div>
                <Input
                  {...register('password')}
                  type="password"
                  label="كلمة المرور للتأكيد"
                  placeholder="أدخل كلمة المرور"
                  leftIcon={<Shield className="w-5 h-5" />}
                  error={errors.password?.message}
                  disabled={isDeleting}
                />
              </div>

              {/* Reason (Optional) */}
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">
                  سبب الحذف (اختياري)
                </label>
                <textarea
                  {...register('reason')}
                  placeholder="يمكنك مشاركة سبب حذف الحساب لمساعدتنا في التحسين"
                  className="w-full px-3 py-2 border border-border rounded-md bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary resize-none"
                  rows={3}
                  disabled={isDeleting}
                />
              </div>

              {/* Submit Buttons */}
              <div className="flex gap-4">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => window.location.href = '/dashboard/profile'}
                  disabled={isDeleting}
                >
                  إلغاء
                </Button>
                
                <Button
                  type="submit"
                  variant="destructive"
                  loading={isDeleting}
                  disabled={confirmText !== 'حذف حسابي'}
                  leftIcon={<Trash2 className="w-4 h-4" />}
                >
                  {isDeleting ? 'جاري الحذف...' : 'حذف الحساب نهائياً'}
                </Button>
              </div>
            </form>
          </Card>
        </div>
      </Layout>
    </ProtectedRoute>
  );
};

export default DeleteAccountPage;