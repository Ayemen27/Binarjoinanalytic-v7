import React, { useState } from 'react';
import type { NextPage } from 'next';
import Head from 'next/head';
import { Download, Upload, Calendar, Shield, CheckCircle, AlertTriangle, Clock, HardDrive } from 'lucide-react';

import { Layout } from '@/components/organisms/Layout';
import { ProtectedRoute } from '@/components/organisms/ProtectedRoute';
import { Card } from '@/components/atoms/Card';
import { Button } from '@/components/atoms/Button';
import { usePermissions } from '@/hooks/usePermissions';
import { useToast } from '@/hooks/useToast';

interface BackupItem {
  id: string;
  type: 'full' | 'signals' | 'users' | 'settings';
  size: string;
  status: 'completed' | 'in_progress' | 'failed';
  createdAt: string;
  downloadUrl?: string;
}

const backupHistory: BackupItem[] = [
  {
    id: '1',
    type: 'full',
    size: '2.4 GB',
    status: 'completed',
    createdAt: '2024-12-20T02:00:00Z',
    downloadUrl: '#'
  },
  {
    id: '2',
    type: 'signals',
    size: '450 MB',
    status: 'completed',
    createdAt: '2024-12-19T02:00:00Z',
    downloadUrl: '#'
  },
  {
    id: '3',
    type: 'users',
    size: '124 MB',
    status: 'in_progress',
    createdAt: '2024-12-18T02:00:00Z'
  },
  {
    id: '4',
    type: 'full',
    size: '2.1 GB',
    status: 'failed',
    createdAt: '2024-12-17T02:00:00Z'
  }
];

const BackupPage: NextPage = () => {
  const [isCreatingBackup, setIsCreatingBackup] = useState(false);
  const [selectedBackupType, setSelectedBackupType] = useState<string>('full');
  const { hasPermission } = usePermissions();
  const { toast } = useToast();

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'full':
        return HardDrive;
      case 'signals':
        return CheckCircle;
      case 'users':
        return Shield;
      case 'settings':
        return AlertTriangle;
      default:
        return HardDrive;
    }
  };

  const getTypeText = (type: string) => {
    switch (type) {
      case 'full':
        return 'نسخة كاملة';
      case 'signals':
        return 'الإشارات';
      case 'users':
        return 'المستخدمون';
      case 'settings':
        return 'الإعدادات';
      default:
        return 'غير معروف';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
        return 'text-success bg-success/10';
      case 'in_progress':
        return 'text-warning bg-warning/10';
      case 'failed':
        return 'text-destructive bg-destructive/10';
      default:
        return 'text-muted-foreground bg-muted/10';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed':
        return <CheckCircle className="w-4 h-4" />;
      case 'in_progress':
        return <Clock className="w-4 h-4" />;
      case 'failed':
        return <AlertTriangle className="w-4 h-4" />;
      default:
        return null;
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'completed':
        return 'مكتملة';
      case 'in_progress':
        return 'جاري الإنشاء';
      case 'failed':
        return 'فشلت';
      default:
        return 'غير معروف';
    }
  };

  const formatDate = (dateString: string) => {
    return new Intl.DateTimeFormat('ar-SA', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    }).format(new Date(dateString));
  };

  const createBackup = async () => {
    if (!hasPermission('system.backup')) {
      toast({
        title: 'غير مصرح',
        description: 'ليس لديك صلاحية لإنشاء نسخ احتياطية',
        variant: 'destructive',
      });
      return;
    }

    setIsCreatingBackup(true);
    try {
      // محاكاة عملية إنشاء النسخة الاحتياطية
      await new Promise(resolve => setTimeout(resolve, 3000));

      toast({
        title: 'تم بدء إنشاء النسخة الاحتياطية',
        description: `جاري إنشاء ${getTypeText(selectedBackupType)}، ستتلقى إشعاراً عند الانتهاء`,
        variant: 'success',
      });

    } catch (error) {
      toast({
        title: 'خطأ في إنشاء النسخة الاحتياطية',
        description: 'حدث خطأ أثناء إنشاء النسخة الاحتياطية، يرجى المحاولة مرة أخرى',
        variant: 'destructive',
      });
    } finally {
      setIsCreatingBackup(false);
    }
  };

  const downloadBackup = (backup: BackupItem) => {
    if (!backup.downloadUrl) return;

    toast({
      title: 'بدء التحميل',
      description: `بدء تحميل ${getTypeText(backup.type)}`,
      variant: 'success',
    });
  };

  const restoreBackup = async (backupId: string) => {
    if (!hasPermission('system.restore')) {
      toast({
        title: 'غير مصرح',
        description: 'ليس لديك صلاحية لاستعادة النسخ الاحتياطية',
        variant: 'destructive',
      });
      return;
    }

    const confirmed = confirm('هل أنت متأكد من استعادة هذه النسخة الاحتياطية؟ سيتم استبدال البيانات الحالية.');
    if (!confirmed) return;

    try {
      // محاكاة عملية الاستعادة
      await new Promise(resolve => setTimeout(resolve, 2000));

      toast({
        title: 'تمت الاستعادة بنجاح',
        description: 'تم استعادة البيانات من النسخة الاحتياطية المحددة',
        variant: 'success',
      });

    } catch (error) {
      toast({
        title: 'خطأ في الاستعادة',
        description: 'حدث خطأ أثناء استعادة النسخة الاحتياطية',
        variant: 'destructive',
      });
    }
  };

  if (!hasPermission('system.backup')) {
    return (
      <ProtectedRoute>
        <Layout>
          <div className="p-6 text-center">
            <Shield className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
            <h1 className="text-2xl font-bold text-foreground mb-2">غير مصرح بالوصول</h1>
            <p className="text-muted-foreground">ليس لديك صلاحية لإدارة النسخ الاحتياطية</p>
          </div>
        </Layout>
      </ProtectedRoute>
    );
  }

  return (
    <ProtectedRoute>
      <Head>
        <title>النسخ الاحتياطي - منصة الإشارات</title>
        <meta name="description" content="إدارة النسخ الاحتياطية واستعادة البيانات" />
      </Head>

      <Layout showSidebar={true}>
        <div className="p-6 space-y-8">
          <div>
            <h1 className="text-3xl font-bold text-foreground">النسخ الاحتياطي والاستعادة</h1>
            <p className="text-muted-foreground mt-2">
              إنشاء وإدارة النسخ الاحتياطية لضمان حفظ البيانات وإمكانية الاستعادة
            </p>
          </div>

          {/* إنشاء نسخة احتياطية جديدة */}
          <Card className="p-6">
            <h2 className="text-xl font-semibold text-foreground mb-6">إنشاء نسخة احتياطية جديدة</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-foreground mb-3">
                  نوع النسخة الاحتياطية
                </label>
                <div className="space-y-3">
                  {[
                    { id: 'full', label: 'نسخة كاملة', description: 'جميع البيانات والإعدادات' },
                    { id: 'signals', label: 'الإشارات فقط', description: 'بيانات الإشارات وسجل التداول' },
                    { id: 'users', label: 'المستخدمون فقط', description: 'حسابات المستخدمين والأدوار' },
                    { id: 'settings', label: 'الإعدادات فقط', description: 'إعدادات النظام والتكوين' }
                  ].map((option) => (
                    <label
                      key={option.id}
                      className={`flex items-start space-x-3 space-x-reverse p-3 border rounded-lg cursor-pointer transition-colors ${
                        selectedBackupType === option.id
                          ? 'border-primary bg-primary/5'
                          : 'border-border hover:border-primary/50'
                      }`}
                    >
                      <input
                        type="radio"
                        name="backupType"
                        value={option.id}
                        checked={selectedBackupType === option.id}
                        onChange={(e) => setSelectedBackupType(e.target.value)}
                        className="mt-1"
                      />
                      <div>
                        <div className="font-medium text-foreground">{option.label}</div>
                        <div className="text-sm text-muted-foreground">{option.description}</div>
                      </div>
                    </label>
                  ))}
                </div>
              </div>

              <div className="space-y-4">
                <div className="bg-muted/30 rounded-lg p-4">
                  <h3 className="font-medium text-foreground mb-2">معلومات مهمة</h3>
                  <ul className="text-sm text-muted-foreground space-y-1">
                    <li>• يتم إنشاء النسخ الاحتياطية بشكل مشفر</li>
                    <li>• النسخة الكاملة قد تستغرق عدة دقائق</li>
                    <li>• يمكن تحميل النسخ الاحتياطية لمدة 30 يوماً</li>
                    <li>• ننصح بإنشاء نسخة احتياطية يومياً</li>
                  </ul>
                </div>

                <Button
                  onClick={createBackup}
                  loading={isCreatingBackup}
                  leftIcon={<Download className="w-4 h-4" />}
                  className="w-full"
                >
                  {isCreatingBackup ? 'جاري الإنشاء...' : 'إنشاء نسخة احتياطية'}
                </Button>
              </div>
            </div>
          </Card>

          {/* إحصائيات النسخ الاحتياطية */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <Card className="p-4 text-center">
              <HardDrive className="w-6 h-6 text-primary mx-auto mb-2" />
              <div className="text-xl font-bold text-foreground">12</div>
              <div className="text-sm text-muted-foreground">إجمالي النسخ</div>
            </Card>
            <Card className="p-4 text-center">
              <CheckCircle className="w-6 h-6 text-success mx-auto mb-2" />
              <div className="text-xl font-bold text-foreground">9</div>
              <div className="text-sm text-muted-foreground">مكتملة</div>
            </Card>
            <Card className="p-4 text-center">
              <Clock className="w-6 h-6 text-warning mx-auto mb-2" />
              <div className="text-xl font-bold text-foreground">1</div>
              <div className="text-sm text-muted-foreground">قيد الإنشاء</div>
            </Card>
            <Card className="p-4 text-center">
              <AlertTriangle className="w-6 h-6 text-destructive mx-auto mb-2" />
              <div className="text-xl font-bold text-foreground">2</div>
              <div className="text-sm text-muted-foreground">فشلت</div>
            </Card>
          </div>

          {/* سجل النسخ الاحتياطية */}
          <Card className="overflow-hidden">
            <div className="p-6 border-b border-border">
              <h2 className="text-xl font-semibold text-foreground">سجل النسخ الاحتياطية</h2>
            </div>
            
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-muted/30">
                  <tr>
                    <th className="px-6 py-3 text-right text-xs font-medium text-muted-foreground uppercase">
                      النوع
                    </th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-muted-foreground uppercase">
                      الحجم
                    </th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-muted-foreground uppercase">
                      التاريخ
                    </th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-muted-foreground uppercase">
                      الحالة
                    </th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-muted-foreground uppercase">
                      الإجراءات
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-background divide-y divide-border">
                  {backupHistory.map((backup) => {
                    const TypeIcon = getTypeIcon(backup.type);
                    return (
                      <tr key={backup.id} className="hover:bg-muted/20">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center space-x-3 space-x-reverse">
                            <div className="p-2 bg-muted/30 rounded-lg">
                              <TypeIcon className="w-4 h-4 text-muted-foreground" />
                            </div>
                            <span className="text-sm font-medium text-foreground">
                              {getTypeText(backup.type)}
                            </span>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-muted-foreground">
                          {backup.size}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-muted-foreground">
                          {formatDate(backup.createdAt)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className={`inline-flex items-center space-x-2 space-x-reverse px-2 py-1 rounded-full ${getStatusColor(backup.status)}`}>
                            {getStatusIcon(backup.status)}
                            <span className="text-xs font-medium">
                              {getStatusText(backup.status)}
                            </span>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm">
                          <div className="flex space-x-2 space-x-reverse">
                            {backup.status === 'completed' && backup.downloadUrl && (
                              <>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => downloadBackup(backup)}
                                >
                                  <Download className="w-4 h-4" />
                                </Button>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => restoreBackup(backup.id)}
                                >
                                  <Upload className="w-4 h-4" />
                                </Button>
                              </>
                            )}
                            {backup.status === 'failed' && (
                              <Button variant="outline" size="sm">
                                إعادة المحاولة
                              </Button>
                            )}
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </Card>

          {/* جدولة النسخ الاحتياطية */}
          <Card className="p-6">
            <h3 className="text-lg font-semibold text-foreground mb-4">جدولة النسخ الاحتياطية التلقائية</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <div className="flex items-center justify-between p-3 border border-border rounded-lg">
                  <div>
                    <h4 className="font-medium text-foreground">نسخة يومية</h4>
                    <p className="text-sm text-muted-foreground">كل يوم في الساعة 2:00 صباحاً</p>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input type="checkbox" defaultChecked className="sr-only peer" />
                    <div className="w-11 h-6 bg-muted peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-primary rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary"></div>
                  </label>
                </div>

                <div className="flex items-center justify-between p-3 border border-border rounded-lg">
                  <div>
                    <h4 className="font-medium text-foreground">نسخة أسبوعية</h4>
                    <p className="text-sm text-muted-foreground">كل أحد في الساعة 1:00 صباحاً</p>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input type="checkbox" defaultChecked className="sr-only peer" />
                    <div className="w-11 h-6 bg-muted peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-primary rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary"></div>
                  </label>
                </div>

                <div className="flex items-center justify-between p-3 border border-border rounded-lg">
                  <div>
                    <h4 className="font-medium text-foreground">نسخة شهرية</h4>
                    <p className="text-sm text-muted-foreground">أول يوم من كل شهر</p>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input type="checkbox" className="sr-only peer" />
                    <div className="w-11 h-6 bg-muted peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-primary rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary"></div>
                  </label>
                </div>
              </div>

              <div className="bg-muted/30 rounded-lg p-4">
                <h4 className="font-medium text-foreground mb-3">إعدادات الاحتفاظ</h4>
                <div className="space-y-3 text-sm">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">النسخ اليومية:</span>
                    <span className="font-medium text-foreground">30 يوم</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">النسخ الأسبوعية:</span>
                    <span className="font-medium text-foreground">12 أسبوع</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">النسخ الشهرية:</span>
                    <span className="font-medium text-foreground">12 شهر</span>
                  </div>
                </div>
                
                <Button variant="outline" className="w-full mt-4">
                  تخصيص الإعدادات
                </Button>
              </div>
            </div>
          </Card>
        </div>
      </Layout>
    </ProtectedRoute>
  );
};

export default BackupPage;