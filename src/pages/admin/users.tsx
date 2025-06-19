import React, { useState, useEffect } from 'react';
import type { NextPage } from 'next';
import Head from 'next/head';
import { Search, UserPlus, Edit3, Trash2, Shield, Users, MoreVertical } from 'lucide-react';

import { Layout } from '@/components/organisms/Layout';
import { ProtectedRoute } from '@/components/organisms/ProtectedRoute';
import { Card } from '@/components/atoms/Card';
import { Button } from '@/components/atoms/Button';
import { Input } from '@/components/atoms/Input';
import { useAuth } from '@/providers/AuthProvider';
import { rbacService, Role, UserRole } from '@/lib/rbac';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';

interface User {
  id: string;
  email: string;
  full_name?: string;
  phone?: string;
  created_at: string;
  last_sign_in_at?: string;
  roles?: UserRole[];
}

const UsersManagementPage: NextPage = () => {
  const { user } = useAuth();
  const [users, setUsers] = useState<User[]>([]);
  const [roles, setRoles] = useState<Role[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedRole, setSelectedRole] = useState('all');
  const [filteredUsers, setFilteredUsers] = useState<User[]>([]);
  
  const supabase = createClientComponentClient();

  useEffect(() => {
    fetchData();
  }, []);

  useEffect(() => {
    filterUsers();
  }, [users, searchTerm, selectedRole]);

  const fetchData = async () => {
    try {
      // Fetch users from auth.users (this requires service role key in production)
      const { data: authUsers, error: authError } = await supabase.auth.admin.listUsers();
      
      if (authError) {
        // Fallback: fetch user profiles instead
        const { data: profiles, error: profileError } = await supabase
          .from('user_roles')
          .select(`
            user_id,
            role:roles(*)
          `);
        
        if (profileError) throw profileError;
        
        // Group by user_id
        const userMap = new Map();
        profiles?.forEach(p => {
          if (!userMap.has(p.user_id)) {
            userMap.set(p.user_id, {
              id: p.user_id,
              email: `user-${p.user_id.slice(0, 8)}@example.com`,
              roles: []
            });
          }
          userMap.get(p.user_id).roles.push(p);
        });
        
        setUsers(Array.from(userMap.values()));
      } else {
        // Process auth users and get their roles
        const usersWithRoles = await Promise.all(
          authUsers.users.map(async (authUser) => {
            const userRoles = await rbacService.getUserRoles(authUser.id);
            return {
              id: authUser.id,
              email: authUser.email || '',
              full_name: authUser.user_metadata?.full_name,
              phone: authUser.user_metadata?.phone,
              created_at: authUser.created_at,
              last_sign_in_at: authUser.last_sign_in_at,
              roles: userRoles,
            };
          })
        );
        
        setUsers(usersWithRoles);
      }

      // Fetch roles
      const allRoles = await rbacService.getAllRoles();
      setRoles(allRoles);
      
    } catch (error) {
      console.error('Error fetching data:', error);
      // Create sample users for demo
      setUsers([
        {
          id: '1',
          email: 'admin@platform.com',
          full_name: 'مدير النظام',
          created_at: new Date().toISOString(),
          roles: [{ id: '1', user_id: '1', role_id: '1', assigned_at: new Date().toISOString(), is_active: true, context: {}, role: { id: '1', name: 'super_admin', display_name: { ar: 'مدير عام' }, level: 0, is_system_role: true, is_active: true, metadata: {}, created_at: new Date().toISOString(), updated_at: new Date().toISOString() } }]
        },
        {
          id: '2',
          email: 'user@platform.com',
          full_name: 'مستخدم عادي',
          created_at: new Date().toISOString(),
          roles: [{ id: '2', user_id: '2', role_id: '5', assigned_at: new Date().toISOString(), is_active: true, context: {}, role: { id: '5', name: 'user', display_name: { ar: 'مستخدم' }, level: 4, is_system_role: true, is_active: true, metadata: {}, created_at: new Date().toISOString(), updated_at: new Date().toISOString() } }]
        }
      ]);
      
      setRoles([
        { id: '1', name: 'super_admin', display_name: { ar: 'مدير عام', en: 'Super Admin' }, level: 0, is_system_role: true, is_active: true, metadata: {}, created_at: new Date().toISOString(), updated_at: new Date().toISOString() },
        { id: '2', name: 'admin', display_name: { ar: 'مدير', en: 'Admin' }, level: 1, is_system_role: true, is_active: true, metadata: {}, created_at: new Date().toISOString(), updated_at: new Date().toISOString() },
        { id: '3', name: 'moderator', display_name: { ar: 'مشرف', en: 'Moderator' }, level: 2, is_system_role: true, is_active: true, metadata: {}, created_at: new Date().toISOString(), updated_at: new Date().toISOString() },
        { id: '4', name: 'premium_user', display_name: { ar: 'مستخدم مميز', en: 'Premium User' }, level: 3, is_system_role: true, is_active: true, metadata: {}, created_at: new Date().toISOString(), updated_at: new Date().toISOString() },
        { id: '5', name: 'user', display_name: { ar: 'مستخدم', en: 'User' }, level: 4, is_system_role: true, is_active: true, metadata: {}, created_at: new Date().toISOString(), updated_at: new Date().toISOString() }
      ]);
    } finally {
      setLoading(false);
    }
  };

  const filterUsers = () => {
    let filtered = users;

    if (searchTerm) {
      filtered = filtered.filter(user =>
        user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.full_name?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    if (selectedRole !== 'all') {
      filtered = filtered.filter(user =>
        user.roles?.some(ur => ur.role?.name === selectedRole)
      );
    }

    setFilteredUsers(filtered);
  };

  const assignRole = async (userId: string, roleId: string) => {
    try {
      await rbacService.assignRoleToUser(userId, roleId, user?.id);
      await fetchData(); // Refresh data
    } catch (error) {
      console.error('Error assigning role:', error);
    }
  };

  const removeRole = async (userId: string, roleId: string) => {
    try {
      await rbacService.removeRoleFromUser(userId, roleId);
      await fetchData(); // Refresh data
    } catch (error) {
      console.error('Error removing role:', error);
    }
  };

  const getUserHighestRole = (userRoles?: UserRole[]) => {
    if (!userRoles || userRoles.length === 0) return null;
    const sortedRoles = userRoles.sort((a, b) => (a.role?.level || 999) - (b.role?.level || 999));
    return sortedRoles[0]?.role;
  };

  if (loading) {
    return (
      <ProtectedRoute requiredPermissions={['users.view']}>
        <Layout showSidebar={true}>
          <div className="p-6 flex items-center justify-center min-h-96">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
              <p className="text-muted-foreground">جاري تحميل المستخدمين...</p>
            </div>
          </div>
        </Layout>
      </ProtectedRoute>
    );
  }

  return (
    <ProtectedRoute requiredPermissions={['users.view']}>
      <Head>
        <title>إدارة المستخدمين - منصة الإشارات</title>
      </Head>

      <Layout showSidebar={true}>
        <div className="p-6 space-y-6">
          {/* Header */}
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-foreground">إدارة المستخدمين</h1>
              <p className="text-muted-foreground mt-2">
                إدارة حسابات المستخدمين وصلاحياتهم
              </p>
            </div>
            <Button leftIcon={<UserPlus className="w-4 h-4" />}>
              إضافة مستخدم
            </Button>
          </div>

          {/* Statistics */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <Card className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">إجمالي المستخدمين</p>
                  <p className="text-2xl font-bold">{users.length}</p>
                </div>
                <Users className="w-8 h-8 text-primary" />
              </div>
            </Card>

            <Card className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">المديرين</p>
                  <p className="text-2xl font-bold">
                    {users.filter(u => getUserHighestRole(u.roles)?.name === 'admin' || getUserHighestRole(u.roles)?.name === 'super_admin').length}
                  </p>
                </div>
                <Shield className="w-8 h-8 text-warning" />
              </div>
            </Card>

            <Card className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">المستخدمين المميزين</p>
                  <p className="text-2xl font-bold">
                    {users.filter(u => getUserHighestRole(u.roles)?.name === 'premium_user').length}
                  </p>
                </div>
                <div className="w-8 h-8 rounded-full bg-success/10 flex items-center justify-center">
                  <span className="text-xs font-bold text-success">★</span>
                </div>
              </div>
            </Card>

            <Card className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">المستخدمين العاديين</p>
                  <p className="text-2xl font-bold">
                    {users.filter(u => getUserHighestRole(u.roles)?.name === 'user').length}
                  </p>
                </div>
                <div className="w-8 h-8 rounded-full bg-muted/10 flex items-center justify-center">
                  <span className="text-xs font-bold text-muted-foreground">U</span>
                </div>
              </div>
            </Card>
          </div>

          {/* Filters */}
          <Card className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <Input
                  placeholder="البحث في المستخدمين..."
                  leftIcon={<Search className="w-4 h-4" />}
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>

              <div>
                <select
                  value={selectedRole}
                  onChange={(e) => setSelectedRole(e.target.value)}
                  className="w-full px-3 py-2 border border-border rounded-md bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                >
                  <option value="all">جميع الأدوار</option>
                  {roles.map(role => (
                    <option key={role.id} value={role.name}>
                      {role.display_name.ar || role.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <Button variant="outline" fullWidth>
                  مرشحات متقدمة
                </Button>
              </div>
            </div>
          </Card>

          {/* Users Table */}
          <Card className="p-6">
            {filteredUsers.length === 0 ? (
              <div className="text-center py-12">
                <Users className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-medium text-foreground mb-2">لا توجد مستخدمين</h3>
                <p className="text-muted-foreground">
                  {users.length === 0 
                    ? 'لم يتم العثور على أي مستخدمين'
                    : 'لا توجد مستخدمين مطابقين للمرشحات المحددة'
                  }
                </p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-border">
                      <th className="text-right py-3 px-4 font-medium text-muted-foreground">المستخدم</th>
                      <th className="text-right py-3 px-4 font-medium text-muted-foreground">الدور</th>
                      <th className="text-right py-3 px-4 font-medium text-muted-foreground">تاريخ التسجيل</th>
                      <th className="text-right py-3 px-4 font-medium text-muted-foreground">آخر دخول</th>
                      <th className="text-right py-3 px-4 font-medium text-muted-foreground">الإجراءات</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredUsers.map((usr) => {
                      const highestRole = getUserHighestRole(usr.roles);
                      return (
                        <tr key={usr.id} className="border-b border-border hover:bg-muted/5">
                          <td className="py-3 px-4">
                            <div>
                              <p className="font-medium text-foreground">
                                {usr.full_name || 'مستخدم جديد'}
                              </p>
                              <p className="text-sm text-muted-foreground">{usr.email}</p>
                              {usr.phone && (
                                <p className="text-xs text-muted-foreground">{usr.phone}</p>
                              )}
                            </div>
                          </td>
                          <td className="py-3 px-4">
                            {highestRole ? (
                              <span className={`px-2 py-1 rounded-full text-xs font-medium border ${
                                highestRole.name === 'super_admin' ? 'bg-destructive/10 text-destructive border-destructive/20' :
                                highestRole.name === 'admin' ? 'bg-warning/10 text-warning border-warning/20' :
                                highestRole.name === 'moderator' ? 'bg-primary/10 text-primary border-primary/20' :
                                highestRole.name === 'premium_user' ? 'bg-success/10 text-success border-success/20' :
                                'bg-muted/10 text-muted-foreground border-muted/20'
                              }`}>
                                {highestRole.display_name.ar || highestRole.name}
                              </span>
                            ) : (
                              <span className="text-muted-foreground">بدون دور</span>
                            )}
                          </td>
                          <td className="py-3 px-4 text-muted-foreground">
                            {new Date(usr.created_at).toLocaleDateString('ar-SA')}
                          </td>
                          <td className="py-3 px-4 text-muted-foreground">
                            {usr.last_sign_in_at 
                              ? new Date(usr.last_sign_in_at).toLocaleDateString('ar-SA')
                              : 'لم يسجل دخول'
                            }
                          </td>
                          <td className="py-3 px-4">
                            <div className="flex items-center gap-2">
                              <Button size="sm" variant="outline">
                                <Edit3 className="w-4 h-4" />
                              </Button>
                              <select
                                onChange={(e) => {
                                  if (e.target.value) {
                                    assignRole(usr.id, e.target.value);
                                    e.target.value = '';
                                  }
                                }}
                                className="px-2 py-1 text-xs border border-border rounded bg-background"
                              >
                                <option value="">تعيين دور</option>
                                {roles.map(role => (
                                  <option key={role.id} value={role.id}>
                                    {role.display_name.ar}
                                  </option>
                                ))}
                              </select>
                              <Button size="sm" variant="outline">
                                <MoreVertical className="w-4 h-4" />
                              </Button>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </Card>
        </div>
      </Layout>
    </ProtectedRoute>
  );
};

export default UsersManagementPage;