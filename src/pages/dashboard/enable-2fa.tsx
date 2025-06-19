import React, { useState, useEffect } from 'react';
import type { NextPage } from 'next';
import Head from 'next/head';
import QRCode from 'qrcode';
import { Shield, Smartphone, Key, CheckCircle, Copy } from 'lucide-react';

import { Layout } from '@/components/organisms/Layout';
import { ProtectedRoute } from '@/components/organisms/ProtectedRoute';
import { Card } from '@/components/atoms/Card';
import { Button } from '@/components/atoms/Button';
import { Input } from '@/components/atoms/Input';
import { useAuth } from '@/providers/AuthProvider';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';

const Enable2FAPage: NextPage = () => {
  const { user } = useAuth();
  const [step, setStep] = useState(1);
  const [secret, setSecret] = useState('');
  const [qrCodeUrl, setQrCodeUrl] = useState('');
  const [verificationCode, setVerificationCode] = useState('');
  const [backupCodes, setBackupCodes] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  
  const supabase = createClientComponentClient();

  useEffect(() => {
    generateSecret();
  }, []);

  const generateSecret = async () => {
    // Generate a random 32-character secret
    const secret = Array.from(crypto.getRandomValues(new Uint8Array(20)))
      .map(b => b.toString(36))
      .join('')
      .substring(0, 32);
    
    setSecret(secret);
    
    // Generate QR code
    const appName = 'منصة الإشارات';
    const userName = user?.email || 'user';
    const otpAuthUrl = `otpauth://totp/${encodeURIComponent(appName)}:${encodeURIComponent(userName)}?secret=${secret}&issuer=${encodeURIComponent(appName)}`;
    
    try {
      const qrUrl = await QRCode.toDataURL(otpAuthUrl);
      setQrCodeUrl(qrUrl);
    } catch (error) {
      console.error('Error generating QR code:', error);
    }
  };

  const verifyCode = async () => {
    if (verificationCode.length !== 6) return;
    
    setIsLoading(true);
    
    try {
      // In a real implementation, verify the TOTP code here
      // For demo purposes, accept any 6-digit code
      if (verificationCode.length === 6 && /^\d+$/.test(verificationCode)) {
        // Generate backup codes
        const codes = Array.from({ length: 10 }, () => 
          Math.random().toString(36).substring(2, 8).toUpperCase()
        );
        setBackupCodes(codes);
        
        // Save to database
        await supabase
          .from('user_roles')
          .update({ 
            context: { 
              two_factor_enabled: true, 
              two_factor_secret: secret,
              backup_codes: codes
            } 
          })
          .eq('user_id', user?.id);
        
        setStep(3);
      } else {
        alert('رمز التحقق غير صحيح');
      }
    } catch (error) {
      console.error('Error verifying 2FA:', error);
      alert('حدث خطأ في التحقق');
    } finally {
      setIsLoading(false);
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    alert('تم نسخ النص');
  };

  return (
    <ProtectedRoute>
      <Head>
        <title>تفعيل المصادقة الثنائية - منصة الإشارات</title>
      </Head>

      <Layout showSidebar={true}>
        <div className="p-6 max-w-2xl mx-auto">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-foreground">تفعيل المصادقة الثنائية</h1>
            <p className="text-muted-foreground mt-2">
              أضف طبقة حماية إضافية لحسابك
            </p>
          </div>

          {/* Progress Steps */}
          <div className="flex items-center justify-center mb-8">
            {[1, 2, 3].map((stepNumber) => (
              <React.Fragment key={stepNumber}>
                <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                  step >= stepNumber 
                    ? 'bg-primary text-primary-foreground' 
                    : 'bg-muted text-muted-foreground'
                }`}>
                  {step > stepNumber ? <CheckCircle className="w-4 h-4" /> : stepNumber}
                </div>
                {stepNumber < 3 && (
                  <div className={`w-16 h-0.5 ${
                    step > stepNumber ? 'bg-primary' : 'bg-muted'
                  }`} />
                )}
              </React.Fragment>
            ))}
          </div>

          {/* Step 1: Download App */}
          {step === 1 && (
            <Card className="p-8">
              <div className="text-center">
                <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-6">
                  <Smartphone className="w-8 h-8 text-primary" />
                </div>
                
                <h2 className="text-2xl font-bold text-foreground mb-4">
                  تحميل تطبيق المصادقة
                </h2>
                
                <p className="text-muted-foreground mb-6">
                  تحتاج لتطبيق مصادقة على هاتفك لإنشاء رموز التحقق
                </p>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
                  <div className="p-4 border border-border rounded-lg">
                    <h3 className="font-semibold mb-2">Google Authenticator</h3>
                    <p className="text-sm text-muted-foreground mb-3">
                      التطبيق الأكثر شعبية للمصادقة الثنائية
                    </p>
                    <Button variant="outline" size="sm" fullWidth>
                      تحميل للآيفون
                    </Button>
                  </div>
                  
                  <div className="p-4 border border-border rounded-lg">
                    <h3 className="font-semibold mb-2">Microsoft Authenticator</h3>
                    <p className="text-sm text-muted-foreground mb-3">
                      تطبيق مايكروسوفت للمصادقة الآمنة
                    </p>
                    <Button variant="outline" size="sm" fullWidth>
                      تحميل للأندرويد
                    </Button>
                  </div>
                </div>
                
                <Button onClick={() => setStep(2)} leftIcon={<Shield className="w-4 h-4" />}>
                  لدي التطبيق، المتابعة
                </Button>
              </div>
            </Card>
          )}

          {/* Step 2: Scan QR Code */}
          {step === 2 && (
            <Card className="p-8">
              <div className="text-center">
                <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-6">
                  <Key className="w-8 h-8 text-primary" />
                </div>
                
                <h2 className="text-2xl font-bold text-foreground mb-4">
                  مسح رمز QR
                </h2>
                
                <p className="text-muted-foreground mb-6">
                  استخدم تطبيق المصادقة لمسح الرمز أو أدخل الرمز السري يدوياً
                </p>
                
                {qrCodeUrl && (
                  <div className="mb-6">
                    <img 
                      src={qrCodeUrl} 
                      alt="QR Code" 
                      className="w-48 h-48 mx-auto border border-border rounded-lg"
                    />
                  </div>
                )}
                
                <div className="mb-6 p-4 bg-muted/20 rounded-lg">
                  <p className="text-sm text-muted-foreground mb-2">أو أدخل الرمز السري يدوياً:</p>
                  <div className="flex items-center gap-2">
                    <code className="bg-muted px-2 py-1 rounded text-sm font-mono">
                      {secret}
                    </code>
                    <Button 
                      size="sm" 
                      variant="outline"
                      onClick={() => copyToClipboard(secret)}
                    >
                      <Copy className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
                
                <div className="mb-6">
                  <Input
                    placeholder="أدخل رمز التحقق (6 أرقام)"
                    value={verificationCode}
                    onChange={(e) => setVerificationCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
                    maxLength={6}
                    className="text-center text-2xl font-mono"
                  />
                </div>
                
                <div className="flex gap-4 justify-center">
                  <Button onClick={() => setStep(1)} variant="outline">
                    العودة
                  </Button>
                  <Button 
                    onClick={verifyCode}
                    loading={isLoading}
                    disabled={verificationCode.length !== 6}
                  >
                    تحقق وتفعيل
                  </Button>
                </div>
              </div>
            </Card>
          )}

          {/* Step 3: Backup Codes */}
          {step === 3 && (
            <Card className="p-8">
              <div className="text-center">
                <div className="w-16 h-16 bg-success/10 rounded-full flex items-center justify-center mx-auto mb-6">
                  <CheckCircle className="w-8 h-8 text-success" />
                </div>
                
                <h2 className="text-2xl font-bold text-foreground mb-4">
                  تم تفعيل المصادقة الثنائية!
                </h2>
                
                <p className="text-muted-foreground mb-6">
                  احفظ رموز الطوارئ هذه في مكان آمن. يمكنك استخدامها للدخول إذا فقدت هاتفك.
                </p>
                
                <div className="grid grid-cols-2 gap-2 mb-6 p-4 bg-muted/20 rounded-lg">
                  {backupCodes.map((code, index) => (
                    <div key={index} className="p-2 bg-background rounded text-center font-mono text-sm">
                      {code}
                    </div>
                  ))}
                </div>
                
                <div className="flex gap-4 justify-center">
                  <Button 
                    onClick={() => copyToClipboard(backupCodes.join('\n'))}
                    variant="outline"
                    leftIcon={<Copy className="w-4 h-4" />}
                  >
                    نسخ الرموز
                  </Button>
                  <Button onClick={() => window.location.href = '/dashboard/profile'}>
                    انتهيت
                  </Button>
                </div>
                
                <div className="mt-6 p-4 bg-warning/10 border border-warning/20 rounded-lg">
                  <p className="text-sm text-warning">
                    تحذير: احفظ هذه الرموز في مكان آمن. لن تتمكن من رؤيتها مرة أخرى.
                  </p>
                </div>
              </div>
            </Card>
          )}
        </div>
      </Layout>
    </ProtectedRoute>
  );
};

export default Enable2FAPage;