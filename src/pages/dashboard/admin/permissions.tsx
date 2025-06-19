import React, { useState, useEffect } from 'react';
import { NextPage } from 'next';
import Head from 'next/head';
import { useRouter } from 'next/router';
import { serverSideTranslations } from 'next-i18next/serverSideTranslations';
import { GetStaticProps } from 'next';
import { motion } from 'framer-motion';
import { 
  Plus,
  Edit,
  Trash2,
  Key,
  Search,
  Filter,
  Shield,
  Database,
  BarChart3,
  Settings,
  Users,
  Activity
} from 'lucide-react';

import { Layout } from '@/components/organisms/Layout';
import { Button } from '@/components/atoms/Button';
import { Input } from '@/components/atoms/Input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/atoms/Card';
import { useAuth } from '@/providers/AuthProvider';
import { useToast } from '@/hooks/useToast';
import { supabase } from '@/lib/supabase';

interface Permission {
  id: string;
  name: string;
  display_name: any;
  resource: string;
  action: string;
  category: string;
  created_at: string;
  role_count?: number;
}

const PermissionsManagementPage: NextPage = () => {
  const router = useRouter();
  const { user, loading } = useAuth();
  const { toast } = useToast();

  const [permissions, setPermissions] = useState<Permission[]>([]);
  const [filteredPermissions, setFilteredPermissions] = useState<Permission[]>([]);
  const [dataLoading, setDataLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');

  useEffect(() => {
    const loadPermissions = async () => {
      if (!user) return;

      try {
        setDataLoading(true);
        
        const { data: permissionsData, error: permissionsError } = await supabase
          .from('permissions')
          .select('*')
          .order('category', { ascending: true });

        if (permissionsError) throw permissionsError;

        // Get role count for each permission
        const permissionsWithCount = await Promise.all(
          permissionsData.map(async (permission) => {
            const { count } = await supabase
              .from('role_permissions')
              .select('*', { count: 'exact', head: true })
              .eq('permission_id', permission.id);

            return {
              ...permission,
              role_count: count || 0
            };
          })
        );

        setPermissions(permissionsWithCount);
        setFilteredPermissions(permissionsWithCount);
      } catch (error) {
        console.error('Error loading permissions:', error);
        toast({
          title: 'خطأ في تحميل الصلاحيات',
          description: 'حدث خطأ أثناء تحميل الصلاحيات',
          variant: 'destructive',
        });
      } finally {
        setDataLoading(false);
      }
    };

    if (user) {
      loadPermissions();
    }
  }, [user, toast]);

  useEffect(() => {
    let filtered = permissions;

    if (searchTerm) {
      filtered = filtered.filter(permission =>
        permission.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        permission.display_name?.ar?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        permission.resource.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    if (categoryFilter !== 'all') {
      filtered = filtered.filter(permission => permission.category === categoryFilter);
    }

    setFilteredPermissions(filtered);
  }, [permissions, searchTerm, categoryFilter]);

  const getResourceIcon = (resource: string) => {
    switch (resource) {
      case 'signals': return <Activity className="h-5 w-5 text-emerald-500" />;
      case 'users': return <Users className="h-5 w-5 text-blue-500" />;
      case 'analytics': return <BarChart3 className="h-5 w-5 text-purple-500" />;
      case 'settings': return <Settings className="h-5 w-5 text-orange-500" />;
      default: return <Database className="h-5 w-5 text-gray-500" />;
    }
  };

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'signals': return 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900 dark:text-emerald-200';
      case 'admin': return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200';
      case 'analytics': return 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200';
      default: return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200';
    }
  };

  const getActionColor = (action: string) => {
    switch (action) {
      case 'create': return 'text-emerald-600 dark:text-emerald-400';
      case 'read': return 'text-blue-600 dark:text-blue-400';
      case 'update': return 'text-yellow-600 dark:text-yellow-400';
      case 'delete': return 'text-red-600 dark:text-red-400';
      case 'manage': return 'text-purple-600 dark:text-purple-400';
      default: return 'text-gray-600 dark:text-gray-400';
    }
  };

  const categories = [...new Set(permissions.map(p => p.category))];

  if (loading || dataLoading) {
    return (
      <Layout showSidebar>
        <div className="min-h-screen flex items-center justify-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary"></div>
        </div>
      </Layout>
    );
  }

  if (!user) {
    router.push('/auth/signin');
    return null;
  }

  return (
    <>
      <Head>
        <title>إدارة الصلاحيات - منصة الخدمات الرقمية</title>
        <meta name="description" content="إدارة صلاحيات النظام والتحكم في الوصول" />
      </Head>

      <Layout showSidebar>
        <div className="space-y-8">
          {/* Header */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4"
          >
            <div>
              <h1 className="text-3xl font-bold flex items-center gap-3">
                <Key className="h-8 w-8 text-primary" />
                إدارة الصلاحيات
              </h1>
              <p className="text-muted-foreground mt-1">
                إدارة صلاحيات النظام والتحكم في الوصول
              </p>
            </div>
            <Button
              leftIcon={<Plus />}
              onClick={() => {
                // Handle create permission
                toast({
                  title: 'قريباً',
                  description: 'سيتم إضافة هذه الميزة قريباً',
                  variant: 'default',
                });
              }}
            >
              إضافة صلاحية جديدة
            </Button>
          </motion.div>

          {/* Filters */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
          >
            <Card variant="elevated">
              <CardContent className="p-6">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="md:col-span-2">
                    <Input
                      placeholder="البحث في الصلاحيات..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      leftIcon={<Search className="h-4 w-4" />}
                    />
                  </div>
                  <select
                    value={categoryFilter}
                    onChange={(e) => setCategoryFilter(e.target.value)}
                    className="w-full p-3 border border-border rounded-lg bg-background focus:ring-2 focus:ring-primary focus:border-transparent"
                  >
                    <option value="all">جميع الفئات</option>
                    {categories.map(category => (
                      <option key={category} value={category}>
                        {category === 'signals' ? 'الإشارات' :
                         category === 'admin' ? 'الإدارة' :
                         category === 'analytics' ? 'التحليلات' : category}
                      </option>
                    ))}
                  </select>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          {/* Permissions List */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="grid grid-cols-1 gap-4"
          >
            {filteredPermissions.map((permission, index) => (
              <motion.div
                key={permission.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: index * 0.05 }}
              >
                <Card variant="elevated" hoverable>
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        {getResourceIcon(permission.resource)}
                        <div>
                          <h3 className="text-lg font-semibold">
                            {permission.display_name?.ar || permission.name}
                          </h3>
                          <p className="text-sm text-muted-foreground">
                            {permission.name}
                          </p>
                        </div>
                      </div>
                      
                      <div className="flex items-center gap-6">
                        <div className="text-center">
                          <div className="text-sm text-muted-foreground">المورد</div>
                          <div className="font-medium">{permission.resource}</div>
                        </div>
                        
                        <div className="text-center">
                          <div className="text-sm text-muted-foreground">العملية</div>
                          <div className={`font-medium ${getActionColor(permission.action)}`}>
                            {permission.action === 'create' ? 'إنشاء' :
                             permission.action === 'read' ? 'قراءة' :
                             permission.action === 'update' ? 'تحديث' :
                             permission.action === 'delete' ? 'حذف' :
                             permission.action === 'manage' ? 'إدارة' : permission.action}
                          </div>
                        </div>
                        
                        <div className="text-center">
                          <div className="text-sm text-muted-foreground">الفئة</div>
                          <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getCategoryColor(permission.category)}`}>
                            {permission.category === 'signals' ? 'الإشارات' :
                             permission.category === 'admin' ? 'الإدارة' :
                             permission.category === 'analytics' ? 'التحليلات' : permission.category}
                          </span>
                        </div>
                        
                        <div className="text-center">
                          <div className="text-sm text-muted-foreground">الأدوار</div>
                          <div className="font-medium flex items-center gap-1">
                            <Shield className="h-4 w-4" />
                            {permission.role_count || 0}
                          </div>
                        </div>
                        
                        <div className="flex gap-2">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => {
                              toast({
                                title: 'قريباً',
                                description: 'سيتم إضافة هذه الميزة قريباً',
                                variant: 'default',
                              });
                            }}
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => {
                              toast({
                                title: 'قريباً',
                                description: 'سيتم إضافة هذه الميزة قريباً',
                                variant: 'default',
                              });
                            }}
                            disabled={(permission.role_count || 0) > 0}
                          >
                            <Trash2 className="h-4 w-4 text-red-500" />
                          </Button>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </motion.div>

          {/* Stats */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
          >
            <Card variant="elevated">
              <CardHeader>
                <CardTitle>إحصائيات الصلاحيات</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="text-center p-4 bg-muted/50 rounded-lg">
                    <div className="text-2xl font-bold text-primary">
                      {permissions.length}
                    </div>
                    <div className="text-sm text-muted-foreground">إجمالي الصلاحيات</div>
                  </div>
                  <div className="text-center p-4 bg-muted/50 rounded-lg">
                    <div className="text-2xl font-bold text-emerald-500">
                      {categories.length}
                    </div>
                    <div className="text-sm text-muted-foreground">الفئات</div>
                  </div>
                  <div className="text-center p-4 bg-muted/50 rounded-lg">
                    <div className="text-2xl font-bold text-blue-500">
                      {[...new Set(permissions.map(p => p.resource))].length}
                    </div>
                    <div className="text-sm text-muted-foreground">الموارد</div>
                  </div>
                  <div className="text-center p-4 bg-muted/50 rounded-lg">
                    <div className="text-2xl font-bold text-orange-500">
                      {permissions.reduce((sum, permission) => sum + (permission.role_count || 0), 0)}
                    </div>
                    <div className="text-sm text-muted-foreground">ارتباطات الأدوار</div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </div>
      </Layout>
    </>
  );
};

export const getStaticProps: GetStaticProps = async ({ locale }) => {
  return {
    props: {
      ...(await serverSideTranslations(locale ?? 'ar', ['dashboard', 'common', 'navigation'])),
    },
  };
};

export default PermissionsManagementPage;