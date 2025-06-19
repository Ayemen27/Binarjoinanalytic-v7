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
  Shield,
  Users,
  Settings,
  Crown,
  User
} from 'lucide-react';

import { Layout } from '@/components/organisms/Layout';
import { Button } from '@/components/atoms/Button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/atoms/Card';
import { useAuth } from '@/providers/AuthProvider';
import { useToast } from '@/hooks/useToast';
import { supabase } from '@/lib/supabase';

interface Role {
  id: string;
  name: string;
  display_name: any;
  description: any;
  level: number;
  is_system_role: boolean;
  is_active: boolean;
  created_at: string;
  user_count?: number;
}

const RolesManagementPage: NextPage = () => {
  const router = useRouter();
  const { user, loading } = useAuth();
  const { toast } = useToast();

  const [roles, setRoles] = useState<Role[]>([]);
  const [dataLoading, setDataLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [editingRole, setEditingRole] = useState<Role | null>(null);

  useEffect(() => {
    const loadRoles = async () => {
      if (!user) return;

      try {
        setDataLoading(true);
        
        // Load roles with user count
        const { data: rolesData, error: rolesError } = await supabase
          .from('roles')
          .select('*')
          .order('level', { ascending: true });

        if (rolesError) throw rolesError;

        // Get user count for each role
        const rolesWithCount = await Promise.all(
          rolesData.map(async (role) => {
            const { count } = await supabase
              .from('user_roles')
              .select('*', { count: 'exact', head: true })
              .eq('role_id', role.id)
              .eq('is_active', true);

            return {
              ...role,
              user_count: count || 0
            };
          })
        );

        setRoles(rolesWithCount);
      } catch (error) {
        console.error('Error loading roles:', error);
        toast({
          title: 'خطأ في تحميل الأدوار',
          description: 'حدث خطأ أثناء تحميل الأدوار',
          variant: 'destructive',
        });
      } finally {
        setDataLoading(false);
      }
    };

    if (user) {
      loadRoles();
    }
  }, [user, toast]);

  const getRoleIcon = (roleName: string) => {
    switch (roleName) {
      case 'super_admin': return <Crown className="h-5 w-5 text-purple-500" />;
      case 'admin': return <Shield className="h-5 w-5 text-blue-500" />;
      case 'premium_user': return <User className="h-5 w-5 text-emerald-500" />;
      case 'free_user': return <User className="h-5 w-5 text-gray-500" />;
      default: return <Settings className="h-5 w-5 text-orange-500" />;
    }
  };

  const getRoleBadgeColor = (roleName: string) => {
    switch (roleName) {
      case 'super_admin': return 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200';
      case 'admin': return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200';
      case 'premium_user': return 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900 dark:text-emerald-200';
      case 'free_user': return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200';
      default: return 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200';
    }
  };

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
        <title>إدارة الأدوار - منصة الخدمات الرقمية</title>
        <meta name="description" content="إدارة أدوار وصلاحيات المستخدمين في النظام" />
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
                <Shield className="h-8 w-8 text-primary" />
                إدارة الأدوار
              </h1>
              <p className="text-muted-foreground mt-1">
                إدارة أدوار وصلاحيات المستخدمين في النظام
              </p>
            </div>
            <Button
              leftIcon={<Plus />}
              onClick={() => setShowCreateModal(true)}
            >
              إضافة دور جديد
            </Button>
          </motion.div>

          {/* Roles Grid */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
          >
            {roles.map((role, index) => (
              <motion.div
                key={role.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
              >
                <Card variant="elevated" hoverable>
                  <CardHeader className="pb-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        {getRoleIcon(role.name)}
                        <div>
                          <CardTitle className="text-lg">
                            {role.display_name?.ar || role.name}
                          </CardTitle>
                          <div className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getRoleBadgeColor(role.name)}`}>
                            {role.is_system_role ? 'دور نظام' : 'دور مخصص'}
                          </div>
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => setEditingRole(role)}
                          disabled={role.is_system_role}
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => {
                            // Handle delete
                          }}
                          disabled={role.is_system_role || (role.user_count || 0) > 0}
                        >
                          <Trash2 className="h-4 w-4 text-red-500" />
                        </Button>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <p className="text-sm text-muted-foreground">
                        {role.description?.ar || 'لا يوجد وصف'}
                      </p>
                      
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-muted-foreground">المستوى</span>
                        <span className="font-medium">{role.level}</span>
                      </div>
                      
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-muted-foreground">عدد المستخدمين</span>
                        <span className="font-medium flex items-center gap-1">
                          <Users className="h-4 w-4" />
                          {role.user_count || 0}
                        </span>
                      </div>
                      
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-muted-foreground">الحالة</span>
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                          role.is_active 
                            ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900 dark:text-emerald-200'
                            : 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
                        }`}>
                          {role.is_active ? 'نشط' : 'غير نشط'}
                        </span>
                      </div>

                      <div className="pt-4 border-t border-border">
                        <Button
                          variant="outline"
                          size="sm"
                          fullWidth
                          onClick={() => router.push(`/dashboard/admin/roles/${role.id}`)}
                        >
                          عرض التفاصيل
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </motion.div>

          {/* Quick Stats */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
          >
            <Card variant="elevated">
              <CardHeader>
                <CardTitle>إحصائيات الأدوار</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="text-center p-4 bg-muted/50 rounded-lg">
                    <div className="text-2xl font-bold text-primary">
                      {roles.length}
                    </div>
                    <div className="text-sm text-muted-foreground">إجمالي الأدوار</div>
                  </div>
                  <div className="text-center p-4 bg-muted/50 rounded-lg">
                    <div className="text-2xl font-bold text-emerald-500">
                      {roles.filter(r => r.is_active).length}
                    </div>
                    <div className="text-sm text-muted-foreground">أدوار نشطة</div>
                  </div>
                  <div className="text-center p-4 bg-muted/50 rounded-lg">
                    <div className="text-2xl font-bold text-blue-500">
                      {roles.filter(r => r.is_system_role).length}
                    </div>
                    <div className="text-sm text-muted-foreground">أدوار النظام</div>
                  </div>
                  <div className="text-center p-4 bg-muted/50 rounded-lg">
                    <div className="text-2xl font-bold text-orange-500">
                      {roles.reduce((sum, role) => sum + (role.user_count || 0), 0)}
                    </div>
                    <div className="text-sm text-muted-foreground">مستخدمين مربوطين</div>
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

export default RolesManagementPage;