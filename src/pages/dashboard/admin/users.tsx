import React, { useState, useEffect } from 'react';
import { NextPage } from 'next';
import Head from 'next/head';
import { useRouter } from 'next/router';
import { serverSideTranslations } from 'next-i18next/serverSideTranslations';
import { GetStaticProps } from 'next';
import { motion } from 'framer-motion';
import { 
  Search,
  Filter,
  UserPlus,
  Edit,
  Trash2,
  Users,
  Crown,
  Shield,
  User,
  Mail,
  Phone,
  Calendar,
  MoreVertical
} from 'lucide-react';

import { Layout } from '@/components/organisms/Layout';
import { Button } from '@/components/atoms/Button';
import { Input } from '@/components/atoms/Input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/atoms/Card';
import { AdminRoute } from '@/components/atoms/ProtectedRoute';
import { useAuth } from '@/providers/AuthProvider';
import { useToast } from '@/hooks/useToast';
import { supabase } from '@/lib/supabase';

interface UserProfile {
  id: string;
  user_id: string;
  full_name?: string;
  avatar_url?: string;
  phone_number?: string;
  preferred_language: string;
  subscription_plan: string;
  total_signals_generated: number;
  successful_signals: number;
  created_at: string;
  roles?: any[];
  email?: string;
}

const UsersManagementPage: NextPage = () => {
  const router = useRouter();
  const { user, loading } = useAuth();
  const { toast } = useToast();

  const [users, setUsers] = useState<UserProfile[]>([]);
  const [filteredUsers, setFilteredUsers] = useState<UserProfile[]>([]);
  const [dataLoading, setDataLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [planFilter, setPlanFilter] = useState('all');

  useEffect(() => {
    const loadUsers = async () => {
      if (!user) return;

      try {
        setDataLoading(true);
        
        // Load profiles with roles
        const { data: profilesData, error: profilesError } = await supabase
          .from('profiles')
          .select('*')
          .order('created_at', { ascending: false });

        if (profilesError) throw profilesError;

        // Get user roles for each profile
        const usersWithRoles = await Promise.all(
          profilesData.map(async (profile) => {
            const { data: userRoles } = await supabase
              .from('user_roles')
              .select(`
                roles (
                  id,
                  name,
                  display_name
                )
              `)
              .eq('user_id', profile.user_id)
              .eq('is_active', true);

            return {
              ...profile,
              roles: userRoles?.map(ur => ur.roles).flat() || []
            };
          })
        );

        setUsers(usersWithRoles);
        setFilteredUsers(usersWithRoles);
      } catch (error) {
        console.error('Error loading users:', error);
        toast({
          title: 'خطأ في تحميل المستخدمين',
          description: 'حدث خطأ أثناء تحميل بيانات المستخدمين',
          variant: 'destructive',
        });
      } finally {
        setDataLoading(false);
      }
    };

    if (user) {
      loadUsers();
    }
  }, [user, toast]);

  useEffect(() => {
    let filtered = users;

    if (searchTerm) {
      filtered = filtered.filter(user =>
        user.full_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.user_id.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    if (planFilter !== 'all') {
      filtered = filtered.filter(user => user.subscription_plan === planFilter);
    }

    setFilteredUsers(filtered);
  }, [users, searchTerm, planFilter]);

  const getRoleIcon = (roleName: string) => {
    switch (roleName) {
      case 'super_admin': return <Crown className="h-4 w-4 text-purple-500" />;
      case 'admin': return <Shield className="h-4 w-4 text-blue-500" />;
      default: return <User className="h-4 w-4 text-gray-500" />;
    }
  };

  const getPlanBadgeColor = (plan: string) => {
    switch (plan) {
      case 'premium': return 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900 dark:text-emerald-200';
      case 'pro': return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200';
      case 'free': return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200';
      default: return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200';
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('ar-SA', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
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
        <title>إدارة المستخدمين - منصة الخدمات الرقمية</title>
        <meta name="description" content="إدارة حسابات المستخدمين وصلاحياتهم" />
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
                <Users className="h-8 w-8 text-primary" />
                إدارة المستخدمين
              </h1>
              <p className="text-muted-foreground mt-1">
                إدارة حسابات المستخدمين وصلاحياتهم
              </p>
            </div>
            <Button leftIcon={<UserPlus />}>
              إضافة مستخدم جديد
            </Button>
          </motion.div>

          {/* Stats Cards */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="grid grid-cols-1 md:grid-cols-4 gap-6"
          >
            <Card variant="elevated">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">إجمالي المستخدمين</p>
                    <p className="text-2xl font-bold">{users.length}</p>
                  </div>
                  <Users className="h-8 w-8 text-primary" />
                </div>
              </CardContent>
            </Card>

            <Card variant="elevated">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">مستخدمين مميزين</p>
                    <p className="text-2xl font-bold">
                      {users.filter(u => u.subscription_plan === 'premium').length}
                    </p>
                  </div>
                  <Crown className="h-8 w-8 text-emerald-500" />
                </div>
              </CardContent>
            </Card>

            <Card variant="elevated">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">مستخدمين نشطين</p>
                    <p className="text-2xl font-bold">
                      {users.filter(u => u.total_signals_generated > 0).length}
                    </p>
                  </div>
                  <Shield className="h-8 w-8 text-blue-500" />
                </div>
              </CardContent>
            </Card>

            <Card variant="elevated">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">مستخدمين جدد</p>
                    <p className="text-2xl font-bold">
                      {users.filter(u => {
                        const created = new Date(u.created_at);
                        const weekAgo = new Date();
                        weekAgo.setDate(weekAgo.getDate() - 7);
                        return created > weekAgo;
                      }).length}
                    </p>
                  </div>
                  <UserPlus className="h-8 w-8 text-orange-500" />
                </div>
              </CardContent>
            </Card>
          </motion.div>

          {/* Filters */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
          >
            <Card variant="elevated">
              <CardContent className="p-6">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="md:col-span-2">
                    <Input
                      placeholder="البحث عن المستخدمين..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      leftIcon={<Search className="h-4 w-4" />}
                    />
                  </div>
                  <select
                    value={planFilter}
                    onChange={(e) => setPlanFilter(e.target.value)}
                    className="w-full p-3 border border-border rounded-lg bg-background focus:ring-2 focus:ring-primary focus:border-transparent"
                  >
                    <option value="all">جميع الخطط</option>
                    <option value="free">مجاني</option>
                    <option value="premium">مميز</option>
                    <option value="pro">احترافي</option>
                  </select>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          {/* Users Table */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
          >
            <Card variant="elevated">
              <CardHeader>
                <CardTitle>قائمة المستخدمين</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {filteredUsers.map((userProfile, index) => (
                    <motion.div
                      key={userProfile.id}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ duration: 0.6, delay: index * 0.05 }}
                      className="flex items-center justify-between p-4 bg-muted/30 rounded-lg hover:bg-muted/50 transition-colors"
                    >
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 bg-gradient-to-br from-primary to-accent rounded-full flex items-center justify-center">
                          <span className="text-white font-semibold">
                            {userProfile.full_name?.charAt(0) || 'U'}
                          </span>
                        </div>
                        <div>
                          <h3 className="font-semibold">
                            {userProfile.full_name || 'مستخدم غير محدد'}
                          </h3>
                          <p className="text-sm text-muted-foreground">
                            {userProfile.user_id}
                          </p>
                          <div className="flex items-center gap-2 mt-1">
                            {userProfile.roles?.map((role, idx) => (
                              <div key={idx} className="flex items-center gap-1">
                                {getRoleIcon(role.name)}
                                <span className="text-xs text-muted-foreground">
                                  {role.display_name?.ar || role.name}
                                </span>
                              </div>
                            ))}
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center gap-6">
                        <div className="text-center">
                          <div className="text-sm text-muted-foreground">الخطة</div>
                          <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getPlanBadgeColor(userProfile.subscription_plan)}`}>
                            {userProfile.subscription_plan === 'free' ? 'مجاني' :
                             userProfile.subscription_plan === 'premium' ? 'مميز' :
                             userProfile.subscription_plan === 'pro' ? 'احترافي' : userProfile.subscription_plan}
                          </span>
                        </div>

                        <div className="text-center">
                          <div className="text-sm text-muted-foreground">الإشارات</div>
                          <div className="font-medium">{userProfile.total_signals_generated}</div>
                        </div>

                        <div className="text-center">
                          <div className="text-sm text-muted-foreground">النجاح</div>
                          <div className="font-medium">
                            {userProfile.total_signals_generated > 0 
                              ? Math.round((userProfile.successful_signals / userProfile.total_signals_generated) * 100)
                              : 0}%
                          </div>
                        </div>

                        <div className="text-center">
                          <div className="text-sm text-muted-foreground">تاريخ التسجيل</div>
                          <div className="text-sm">{formatDate(userProfile.created_at)}</div>
                        </div>

                        <div className="flex gap-2">
                          <Button variant="ghost" size="sm">
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button variant="ghost" size="sm">
                            <MoreVertical className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </div>

                {filteredUsers.length === 0 && !dataLoading && (
                  <div className="text-center py-8 text-muted-foreground">
                    <Users className="h-12 w-12 mx-auto mb-4 opacity-50" />
                    <p className="text-lg font-medium mb-2">لا توجد مستخدمين</p>
                    <p className="text-sm">
                      {searchTerm || planFilter !== 'all' 
                        ? 'لا توجد مستخدمين تطابق معايير البحث'
                        : 'لم يتم تسجيل أي مستخدمين بعد'}
                    </p>
                  </div>
                )}
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

export default UsersManagementPage;