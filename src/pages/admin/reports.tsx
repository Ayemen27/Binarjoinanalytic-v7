import React, { useState } from 'react';
import type { NextPage } from 'next';
import Head from 'next/head';
import { FileText, Download, Calendar, Filter, BarChart3, Users, TrendingUp, DollarSign, Activity, Eye, Share2 } from 'lucide-react';

import { Layout } from '@/components/organisms/Layout';
import { ProtectedRoute } from '@/components/organisms/ProtectedRoute';
import { Card } from '@/components/atoms/Card';
import { Button } from '@/components/atoms/Button';
import { Input } from '@/components/atoms/Input';
import { usePermissions } from '@/hooks/usePermissions';
import { useToast } from '@/hooks/useToast';

interface Report {
  id: string;
  title: string;
  type: 'users' | 'signals' | 'performance' | 'financial' | 'system';
  description: string;
  lastGenerated: string;
  size: string;
  format: 'PDF' | 'CSV' | 'Excel';
  status: 'ready' | 'generating' | 'scheduled';
  frequency: 'daily' | 'weekly' | 'monthly' | 'on-demand';
  createdBy: string;
}

const mockReports: Report[] = [
  {
    id: '1',
    title: 'تقرير أداء الإشارات الشهري',
    type: 'signals',
    description: 'تحليل شامل لأداء جميع الإشارات المولدة خلال الشهر',
    lastGenerated: '2024-12-20T08:00:00Z',
    size: '2.4 MB',
    format: 'PDF',
    status: 'ready',
    frequency: 'monthly',
    createdBy: 'النظام'
  },
  {
    id: '2',
    title: 'تقرير نشاط المستخدمين',
    type: 'users',
    description: 'إحصائيات تفصيلية لنشاط المستخدمين وتفاعلهم',
    lastGenerated: '2024-12-20T06:30:00Z',
    size: '1.8 MB',
    format: 'Excel',
    status: 'ready',
    frequency: 'weekly',
    createdBy: 'مدير النظام'
  },
  {
    id: '3',
    title: 'التقرير المالي الربعي',
    type: 'financial',
    description: 'تحليل الإيرادات والمصروفات والأرباح الربعية',
    lastGenerated: '2024-12-15T12:00:00Z',
    size: '3.2 MB',
    format: 'PDF',
    status: 'ready',
    frequency: 'monthly',
    createdBy: 'مدير المالية'
  },
  {
    id: '4',
    title: 'تقرير حالة النظام',
    type: 'system',
    description: 'مراقبة أداء النظام وحالة الخوادم والخدمات',
    lastGenerated: '2024-12-20T09:00:00Z',
    size: '876 KB',
    format: 'CSV',
    status: 'generating',
    frequency: 'daily',
    createdBy: 'النظام'
  },
  {
    id: '5',
    title: 'تحليل الأداء التفصيلي',
    type: 'performance',
    description: 'تحليل عميق لمؤشرات الأداء الرئيسية',
    lastGenerated: '2024-12-19T14:30:00Z',
    size: '1.5 MB',
    format: 'PDF',
    status: 'scheduled',
    frequency: 'weekly',
    createdBy: 'مدير التحليلات'
  }
];

const ReportsPage: NextPage = () => {
  const [reports, setReports] = useState<Report[]>(mockReports);
  const [filteredReports, setFilteredReports] = useState<Report[]>(mockReports);
  const [searchTerm, setSearchTerm] = useState('');
  const [typeFilter, setTypeFilter] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const { hasPermission } = usePermissions();
  const { toast } = useToast();

  React.useEffect(() => {
    let filtered = reports;

    if (searchTerm) {
      filtered = filtered.filter(report =>
        report.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        report.description.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    if (typeFilter !== 'all') {
      filtered = filtered.filter(report => report.type === typeFilter);
    }

    if (statusFilter !== 'all') {
      filtered = filtered.filter(report => report.status === statusFilter);
    }

    setFilteredReports(filtered);
  }, [reports, searchTerm, typeFilter, statusFilter]);

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'users': return Users;
      case 'signals': return TrendingUp;
      case 'performance': return BarChart3;
      case 'financial': return DollarSign;
      case 'system': return Activity;
      default: return FileText;
    }
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'users': return 'text-blue-600 bg-blue-100';
      case 'signals': return 'text-green-600 bg-green-100';
      case 'performance': return 'text-purple-600 bg-purple-100';
      case 'financial': return 'text-yellow-600 bg-yellow-100';
      case 'system': return 'text-red-600 bg-red-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'ready': return 'text-success bg-success/10';
      case 'generating': return 'text-warning bg-warning/10';
      case 'scheduled': return 'text-primary bg-primary/10';
      default: return 'text-muted-foreground bg-muted/10';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'ready': return 'جاهز';
      case 'generating': return 'جاري الإنشاء';
      case 'scheduled': return 'مجدول';
      default: return 'غير معروف';
    }
  };

  const getTypeText = (type: string) => {
    switch (type) {
      case 'users': return 'المستخدمون';
      case 'signals': return 'الإشارات';
      case 'performance': return 'الأداء';
      case 'financial': return 'مالي';
      case 'system': return 'النظام';
      default: return 'عام';
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

  const generateReport = async (reportId: string) => {
    try {
      setReports(prev =>
        prev.map(report =>
          report.id === reportId
            ? { ...report, status: 'generating' as const }
            : report
        )
      );

      // محاكاة عملية إنشاء التقرير
      await new Promise(resolve => setTimeout(resolve, 3000));

      setReports(prev =>
        prev.map(report =>
          report.id === reportId
            ? { 
                ...report, 
                status: 'ready' as const,
                lastGenerated: new Date().toISOString()
              }
            : report
        )
      );

      toast({
        title: 'تم إنشاء التقرير',
        description: 'تم إنشاء التقرير بنجاح وهو جاهز للتحميل',
        variant: 'success',
      });
    } catch (error) {
      setReports(prev =>
        prev.map(report =>
          report.id === reportId
            ? { ...report, status: 'ready' as const }
            : report
        )
      );

      toast({
        title: 'خطأ في إنشاء التقرير',
        description: 'حدث خطأ أثناء إنشاء التقرير، يرجى المحاولة مرة أخرى',
        variant: 'destructive',
      });
    }
  };

  const downloadReport = (report: Report) => {
    if (report.status !== 'ready') {
      toast({
        title: 'التقرير غير جاهز',
        description: 'يرجى انتظار انتهاء إنشاء التقرير قبل التحميل',
        variant: 'destructive',
      });
      return;
    }

    // محاكاة تحميل التقرير
    const link = document.createElement('a');
    link.href = '#';
    link.download = `${report.title}.${report.format.toLowerCase()}`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    toast({
      title: 'تم بدء التحميل',
      description: `تم بدء تحميل ${report.title}`,
      variant: 'success',
    });
  };

  const calculateStats = () => {
    const total = reports.length;
    const ready = reports.filter(r => r.status === 'ready').length;
    const generating = reports.filter(r => r.status === 'generating').length;
    const scheduled = reports.filter(r => r.status === 'scheduled').length;

    return { total, ready, generating, scheduled };
  };

  const stats = calculateStats();

  if (!hasPermission('reports.manage')) {
    return (
      <ProtectedRoute>
        <Layout>
          <div className="p-6 text-center">
            <FileText className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
            <h1 className="text-2xl font-bold text-foreground mb-2">غير مصرح بالوصول</h1>
            <p className="text-muted-foreground">ليس لديك صلاحية لعرض التقارير</p>
          </div>
        </Layout>
      </ProtectedRoute>
    );
  }

  return (
    <ProtectedRoute>
      <Head>
        <title>التقارير - منصة الإشارات</title>
        <meta name="description" content="إدارة وإنشاء التقارير التفصيلية" />
      </Head>

      <Layout showSidebar={true}>
        <div className="p-6 space-y-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-foreground">التقارير</h1>
              <p className="text-muted-foreground mt-2">
                إنشاء وإدارة التقارير التفصيلية للمنصة
              </p>
            </div>
            <div className="flex space-x-3 space-x-reverse">
              <Button variant="outline" leftIcon={<Calendar className="w-4 h-4" />}>
                جدولة تقرير
              </Button>
              <Button leftIcon={<FileText className="w-4 h-4" />}>
                إنشاء تقرير جديد
              </Button>
            </div>
          </div>

          {/* إحصائيات سريعة */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <Card className="p-4 text-center">
              <FileText className="w-6 h-6 text-primary mx-auto mb-2" />
              <div className="text-xl font-bold text-foreground">{stats.total}</div>
              <div className="text-sm text-muted-foreground">إجمالي التقارير</div>
            </Card>
            <Card className="p-4 text-center">
              <div className="w-6 h-6 text-success mx-auto mb-2">✓</div>
              <div className="text-xl font-bold text-foreground">{stats.ready}</div>
              <div className="text-sm text-muted-foreground">جاهزة للتحميل</div>
            </Card>
            <Card className="p-4 text-center">
              <div className="w-6 h-6 text-warning mx-auto mb-2">⏳</div>
              <div className="text-xl font-bold text-foreground">{stats.generating}</div>
              <div className="text-sm text-muted-foreground">قيد الإنشاء</div>
            </Card>
            <Card className="p-4 text-center">
              <div className="w-6 h-6 text-primary mx-auto mb-2">📅</div>
              <div className="text-xl font-bold text-foreground">{stats.scheduled}</div>
              <div className="text-sm text-muted-foreground">مجدولة</div>
            </Card>
          </div>

          {/* فلاتر البحث */}
          <Card className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div>
                <Input
                  placeholder="البحث في التقارير..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  leftIcon={<Filter className="w-4 h-4" />}
                />
              </div>
              <div>
                <select
                  value={typeFilter}
                  onChange={(e) => setTypeFilter(e.target.value)}
                  className="w-full px-3 py-2 border border-border rounded-md bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                >
                  <option value="all">جميع الأنواع</option>
                  <option value="users">المستخدمون</option>
                  <option value="signals">الإشارات</option>
                  <option value="performance">الأداء</option>
                  <option value="financial">مالي</option>
                  <option value="system">النظام</option>
                </select>
              </div>
              <div>
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="w-full px-3 py-2 border border-border rounded-md bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                >
                  <option value="all">جميع الحالات</option>
                  <option value="ready">جاهز</option>
                  <option value="generating">قيد الإنشاء</option>
                  <option value="scheduled">مجدول</option>
                </select>
              </div>
              <div>
                <Button variant="outline" leftIcon={<Download className="w-4 h-4" />}>
                  تحميل مجمع
                </Button>
              </div>
            </div>
          </Card>

          {/* قائمة التقارير */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {filteredReports.map((report) => {
              const TypeIcon = getTypeIcon(report.type);
              return (
                <Card key={report.id} className="p-6 hover:shadow-md transition-shadow">
                  <div className="space-y-4">
                    <div className="flex items-start justify-between">
                      <div className="flex items-center space-x-3 space-x-reverse">
                        <div className={`p-2 rounded-lg ${getTypeColor(report.type)}`}>
                          <TypeIcon className="w-5 h-5" />
                        </div>
                        <div>
                          <h3 className="font-semibold text-foreground">{report.title}</h3>
                          <p className="text-sm text-muted-foreground">{getTypeText(report.type)}</p>
                        </div>
                      </div>
                      
                      <span className={`px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(report.status)}`}>
                        {getStatusText(report.status)}
                      </span>
                    </div>

                    <p className="text-sm text-muted-foreground">{report.description}</p>

                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <span className="font-medium text-foreground">آخر إنشاء:</span>
                        <p className="text-muted-foreground">{formatDate(report.lastGenerated)}</p>
                      </div>
                      <div>
                        <span className="font-medium text-foreground">الحجم:</span>
                        <p className="text-muted-foreground">{report.size}</p>
                      </div>
                      <div>
                        <span className="font-medium text-foreground">التكرار:</span>
                        <p className="text-muted-foreground">
                          {report.frequency === 'daily' ? 'يومي' :
                           report.frequency === 'weekly' ? 'أسبوعي' :
                           report.frequency === 'monthly' ? 'شهري' : 'عند الطلب'}
                        </p>
                      </div>
                      <div>
                        <span className="font-medium text-foreground">التنسيق:</span>
                        <p className="text-muted-foreground">{report.format}</p>
                      </div>
                    </div>

                    <div className="flex space-x-2 space-x-reverse pt-2 border-t">
                      {report.status === 'ready' ? (
                        <Button
                          onClick={() => downloadReport(report)}
                          className="flex-1"
                          leftIcon={<Download className="w-4 h-4" />}
                        >
                          تحميل
                        </Button>
                      ) : report.status === 'generating' ? (
                        <Button disabled className="flex-1">
                          <div className="w-4 h-4 animate-spin rounded-full border-2 border-current border-t-transparent ml-2" />
                          جاري الإنشاء...
                        </Button>
                      ) : (
                        <Button
                          onClick={() => generateReport(report.id)}
                          className="flex-1"
                          leftIcon={<FileText className="w-4 h-4" />}
                        >
                          إنشاء الآن
                        </Button>
                      )}
                      
                      <Button variant="outline" size="sm">
                        <Eye className="w-4 h-4" />
                      </Button>
                      
                      <Button variant="outline" size="sm">
                        <Share2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                </Card>
              );
            })}
          </div>

          {filteredReports.length === 0 && (
            <Card className="p-12 text-center">
              <FileText className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-medium text-foreground mb-2">
                لا توجد تقارير
              </h3>
              <p className="text-muted-foreground">
                لا توجد تقارير تطابق معايير البحث المحددة
              </p>
            </Card>
          )}
        </div>
      </Layout>
    </ProtectedRoute>
  );
};

export default ReportsPage;