import React, { useState, useEffect } from 'react';
import type { NextPage } from 'next';
import Head from 'next/head';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Shield, Smartphone, QrCode, Key, Check, AlertTriangle } from 'lucide-react';
import QRCode from 'qrcode';

import { Layout } from '@/components/organisms/Layout';
import { ProtectedRoute } from '@/components/organisms/ProtectedRoute';
import { Card } from '@/components/atoms/Card';
import { Button } from '@/components/atoms/Button';
import { Input } from '@/components/atoms/Input';
import { useAuth } from '@/providers/AuthProvider';
import { useToast } from '@/hooks/useToast';

const twoFASchema = z.object({
  verificationCode: z.string().length(6, 'كود التحقق يجب أن يكون 6 أرقام'),
});

type TwoFAFormData = z.infer<typeof twoFASchema>;

const Enable2FAPage: NextPage = () => {
  const [step, setStep] = useState<'setup' | 'verify' | 'complete'>('setup');
  const [qrCodeUrl, setQrCodeUrl] = useState<string>('');
  const [secret, setSecret] = useState<string>('');
  const [backupCodes, setBackupCodes] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const { user } = useAuth();
  const { toast } = useToast();

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<TwoFAFormData>({
    resolver: zodResolver(twoFASchema),
  });

  useEffect(() => {
    if (step === 'setup') {
      generateQRCode();
    }
  }, [step]);

  const generateQRCode = async () => {
    try {
      // توليد سر مؤقت للمصادقة الثنائية
      const tempSecret = 'JBSWY3DPEHPK3PXP'; // في التطبيق الحقيقي، يجب توليد هذا من الخادم
      setSecret(tempSecret);

      // إنشاء رابط Google Authenticator
      const otpAuthUrl = `otpauth://totp/منصة الإشارات:${user?.email}?secret=${tempSecret}&issuer=منصة الإشارات`;
      
      // توليد QR Code
      const qrUrl = await QRCode.toDataURL(otpAuthUrl);
      setQrCodeUrl(qrUrl);
    } catch (error) {
      console.error('خطأ في توليد QR Code:', error);
      toast({
        title: 'خطأ في إعداد المصادقة الثنائية',
        description: 'حدث خطأ أثناء إعداد المصادقة الثنائية، يرجى المحاولة مرة أخرى',
        variant: 'destructive',
      });
    }
  };

  const verifyCode = async (data: TwoFAFormData) => {
    setIsLoading(true);
    try {
      // محاكاة التحقق من كود المصادقة الثنائية
      await new Promise(resolve => setTimeout(resolve, 1500));

      // في التطبيق الحقيقي، سيتم إرسال الكود للخادم للتحقق منه
      const response = await fetch('/api/auth/verify-2fa', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          secret: secret,
          code: data.verificationCode,
        }),
      });

      if (!response.ok) {
        throw new Error('كود التحقق غير صحيح');
      }

      // توليد رموز النسخ الاحتياطية
      const codes = Array.from({ length: 8 }, () => 
        Math.random().toString(36).substring(2, 10).toUpperCase()
      );
      setBackupCodes(codes);
      
      setStep('complete');
      
      toast({
        title: 'تم تفعيل المصادقة الثنائية',
        description: 'تم تفعيل المصادقة الثنائية بنجاح لحسابك',
        variant: 'success',
      });

    } catch (error) {
      toast({
        title: 'كود التحقق غير صحيح',
        description: 'تأكد من إدخال الكود الصحيح من تطبيق المصادقة',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const downloadBackupCodes = () => {
    const content = `رموز النسخ الاحتياطية - منصة الإشارات
تاريخ الإنشاء: ${new Date().toLocaleDateString('ar-SA')}
البريد الإلكتروني: ${user?.email}

استخدم هذه الرموز للوصول إلى حسابك في حالة فقدان جهازك:

${backupCodes.map((code, index) => `${index + 1}. ${code}`).join('\n')}

ملاحظات مهمة:
- احتفظ بهذه الرموز في مكان آمن
- كل رمز يمكن استخدامه مرة واحدة فقط
- لا تشارك هذه الرموز مع أي شخص
- في حالة استخدام جميع الرموز، يمكنك إنشاء رموز جديدة من إعدادات الحساب`;

    const blob = new Blob([content], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `backup-codes-${new Date().toISOString().split('T')[0]}.txt`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  return (
    <ProtectedRoute>
      <Head>
        <title>تفعيل المصادقة الثنائية - منصة الإشارات</title>
        <meta name="description" content="تفعيل المصادقة الثنائية لحماية حسابك" />
      </Head>

      <Layout showSidebar={true}>
        <div className="p-6 max-w-2xl mx-auto space-y-8">
          <div>
            <h1 className="text-3xl font-bold text-foreground">المصادقة الثنائية</h1>
            <p className="text-muted-foreground mt-2">
              أضف طبقة حماية إضافية لحسابك باستخدام المصادقة الثنائية
            </p>
          </div>

          {/* خطوات التقدم */}
          <div className="flex items-center justify-center space-x-4 space-x-reverse">
            <div className={`flex items-center space-x-2 space-x-reverse ${step === 'setup' ? 'text-primary' : step === 'verify' || step === 'complete' ? 'text-success' : 'text-muted-foreground'}`}>
              <div className={`w-8 h-8 rounded-full flex items-center justify-center border-2 ${step === 'setup' ? 'border-primary bg-primary/10' : step === 'verify' || step === 'complete' ? 'border-success bg-success text-success-foreground' : 'border-muted'}`}>
                {step === 'verify' || step === 'complete' ? <Check className="w-4 h-4" /> : '1'}
              </div>
              <span className="text-sm font-medium">الإعداد</span>
            </div>
            
            <div className={`w-8 h-1 ${step === 'verify' || step === 'complete' ? 'bg-success' : 'bg-muted'}`}></div>
            
            <div className={`flex items-center space-x-2 space-x-reverse ${step === 'verify' ? 'text-primary' : step === 'complete' ? 'text-success' : 'text-muted-foreground'}`}>
              <div className={`w-8 h-8 rounded-full flex items-center justify-center border-2 ${step === 'verify' ? 'border-primary bg-primary/10' : step === 'complete' ? 'border-success bg-success text-success-foreground' : 'border-muted'}`}>
                {step === 'complete' ? <Check className="w-4 h-4" /> : '2'}
              </div>
              <span className="text-sm font-medium">التحقق</span>
            </div>
            
            <div className={`w-8 h-1 ${step === 'complete' ? 'bg-success' : 'bg-muted'}`}></div>
            
            <div className={`flex items-center space-x-2 space-x-reverse ${step === 'complete' ? 'text-primary' : 'text-muted-foreground'}`}>
              <div className={`w-8 h-8 rounded-full flex items-center justify-center border-2 ${step === 'complete' ? 'border-primary bg-primary/10' : 'border-muted'}`}>
                3
              </div>
              <span className="text-sm font-medium">الاكتمال</span>
            </div>
          </div>

          {/* خطوة الإعداد */}
          {step === 'setup' && (
            <Card className="p-8">
              <div className="text-center space-y-6">
                <div className="flex items-center justify-center space-x-3 space-x-reverse">
                  <Shield className="w-8 h-8 text-primary" />
                  <h2 className="text-2xl font-semibold text-foreground">إعداد المصادقة الثنائية</h2>
                </div>

                <div className="space-y-4">
                  <p className="text-muted-foreground">
                    لتفعيل المصادقة الثنائية، ستحتاج إلى تطبيق مصادقة على هاتفك الذكي
                  </p>
                  
                  <div className="bg-muted/30 rounded-lg p-4">
                    <h3 className="font-medium text-foreground mb-2">التطبيقات الموصى بها:</h3>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                      <div className="text-center">
                        <Smartphone className="w-6 h-6 mx-auto mb-1 text-primary" />
                        <div>Google Authenticator</div>
                      </div>
                      <div className="text-center">
                        <Key className="w-6 h-6 mx-auto mb-1 text-primary" />
                        <div>Microsoft Authenticator</div>
                      </div>
                      <div className="text-center">
                        <Shield className="w-6 h-6 mx-auto mb-1 text-primary" />
                        <div>Authy</div>
                      </div>
                    </div>
                  </div>
                </div>

                {qrCodeUrl && (
                  <div className="space-y-4">
                    <h3 className="text-lg font-medium text-foreground">امسح رمز QR ضوئياً</h3>
                    <div className="flex justify-center">
                      <img src={qrCodeUrl} alt="QR Code للمصادقة الثنائية" className="w-48 h-48 border rounded-lg" />
                    </div>
                    <p className="text-sm text-muted-foreground">
                      أو أدخل هذا الرمز يدوياً: <code className="bg-muted px-2 py-1 rounded">{secret}</code>
                    </p>
                  </div>
                )}

                <Button 
                  onClick={() => setStep('verify')}
                  className="px-8"
                  leftIcon={<QrCode className="w-4 h-4" />}
                >
                  تم إعداد التطبيق - متابعة
                </Button>
              </div>
            </Card>
          )}

          {/* خطوة التحقق */}
          {step === 'verify' && (
            <Card className="p-8">
              <div className="text-center space-y-6">
                <div className="flex items-center justify-center space-x-3 space-x-reverse">
                  <Shield className="w-8 h-8 text-primary" />
                  <h2 className="text-2xl font-semibold text-foreground">تحقق من الكود</h2>
                </div>

                <p className="text-muted-foreground">
                  أدخل الكود المكون من 6 أرقام من تطبيق المصادقة الخاص بك
                </p>

                <form onSubmit={handleSubmit(verifyCode)} className="space-y-6">
                  <div className="max-w-xs mx-auto">
                    <Input
                      {...register('verificationCode')}
                      type="text"
                      placeholder="000000"
                      className="text-center text-2xl tracking-widest"
                      maxLength={6}
                      error={errors.verificationCode?.message}
                      disabled={isLoading}
                    />
                  </div>

                  <div className="flex space-x-4 space-x-reverse justify-center">
                    <Button
                      type="submit"
                      loading={isLoading}
                      leftIcon={<Shield className="w-4 h-4" />}
                    >
                      {isLoading ? 'جاري التحقق...' : 'تحقق من الكود'}
                    </Button>
                    
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => setStep('setup')}
                      disabled={isLoading}
                    >
                      رجوع
                    </Button>
                  </div>
                </form>
              </div>
            </Card>
          )}

          {/* خطوة الاكتمال */}
          {step === 'complete' && (
            <div className="space-y-6">
              <Card className="p-8 text-center">
                <div className="space-y-4">
                  <div className="w-16 h-16 bg-success/10 rounded-full flex items-center justify-center mx-auto">
                    <Check className="w-8 h-8 text-success" />
                  </div>
                  
                  <h2 className="text-2xl font-semibold text-foreground">تم التفعيل بنجاح!</h2>
                  <p className="text-muted-foreground">
                    تم تفعيل المصادقة الثنائية لحسابك. حسابك الآن أكثر أماناً.
                  </p>
                </div>
              </Card>

              <Card className="p-6">
                <div className="flex items-start space-x-3 space-x-reverse">
                  <AlertTriangle className="w-6 h-6 text-warning flex-shrink-0 mt-1" />
                  <div className="space-y-4 flex-1">
                    <div>
                      <h3 className="font-medium text-foreground">رموز النسخ الاحتياطية</h3>
                      <p className="text-sm text-muted-foreground">
                        احتفظ بهذه الرموز في مكان آمن. يمكنك استخدامها للوصول إلى حسابك في حالة فقدان جهازك.
                      </p>
                    </div>
                    
                    <div className="grid grid-cols-2 gap-2 bg-muted/30 p-4 rounded-lg">
                      {backupCodes.map((code, index) => (
                        <div key={index} className="text-sm font-mono bg-background p-2 rounded border">
                          {code}
                        </div>
                      ))}
                    </div>
                    
                    <div className="flex space-x-3 space-x-reverse">
                      <Button onClick={downloadBackupCodes} variant="outline">
                        تحميل الرموز
                      </Button>
                      <Button onClick={() => window.location.href = '/dashboard/profile'}>
                        العودة للملف الشخصي
                      </Button>
                    </div>
                  </div>
                </div>
              </Card>
            </div>
          )}
        </div>
      </Layout>
    </ProtectedRoute>
  );
};

export default Enable2FAPage;