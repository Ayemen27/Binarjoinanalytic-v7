import React, { useState, useEffect } from 'react';
import type { NextPage } from 'next';
import Head from 'next/head';
import { Users, Search, Filter, Plus, Edit, Trash2, Shield, Eye, MoreVertical } from 'lucide-react';

import { Layout } from '@/components/organisms/Layout';
import { ProtectedRoute } from '@/components/organisms/ProtectedRoute';
import { Card } from '@/components/atoms/Card';
import { Button } from '@/components/atoms/Button';
import { Input } from '@/components/atoms/Input';
import { usePermissions } from '@/hooks/usePermissions';
import { useToast } from '@/hooks/useToast';

interface User {
  id: string;
  email: string;
  fullName: string;
  avatar?: string;
  roles: string[];
  status: 'active' | 'inactive' | 'suspended';
  lastLogin?: string;
  signalsCount: number;
  successRate: number;
  createdAt: string;
  metadata: {
    country?: string;
    timezone?: string;
    language?: string;
  };
}

const mockUsers: User[] = [
  {
    id: '1',
    email: 'admin@signals.com',
    fullName: 'مدير النظام',
    roles: ['admin'],
    status: 'active',
    lastLogin: '2024-12-20T10:30:00Z',
    signalsCount: 0,
    successRate: 0,
    createdAt: '2024-01-01T00:00:00Z',
    metadata: { country: 'SA', timezone: 'Asia/Riyadh', language: 'ar' }
  },
  {
    id: '2',
    email: 'trader1@example.com',
    fullName: 'أحمد محمد',
    roles: ['trader'],
    status: 'active',
    lastLogin: '2024-12-20T09:15:00Z',
    signalsCount: 156,
    successRate: 87.5,
    createdAt: '2024-03-15T00:00:00Z',
    metadata: { country: 'SA', timezone: 'Asia/Riyadh', language: 'ar' }
  },
  {
    id: '3',
    email: 'mod@signals.com',
    fullName: 'سارة أحمد',
    roles: ['moderator'],
    status: 'active',
    lastLogin: '2024-12-20T08:45:00Z',
    signalsCount: 45,
    successRate: 92.3,
    createdAt: '2024-02-10T00:00:00Z',
    metadata: { country: 'AE', timezone: 'Asia/Dubai', language: 'ar' }
  },
  {
    id: '4',
    email: 'viewer@example.com',
    fullName: 'محمد علي',
    roles: ['viewer'],
    status: 'inactive',
    signalsCount: 0,
    successRate: 0,
    createdAt: '2024-06-01T00:00:00Z',
    metadata: { country: 'EG', timezone: 'Africa/Cairo', language: 'ar' }
  }
];

const UsersManagementPage: NextPage = () => {
  const [users, setUsers] = useState<User[]>(mockUsers);
  const [filteredUsers, setFilteredUsers] = useState<User[]>(mockUsers);
  const [searchTerm, setSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [showUserModal, setShowUserModal] = useState(false);
  
  const { hasPermission } = usePermissions();
  const { toast } = useToast();

  useEffect(() => {
    let filtered = users;

    if (searchTerm) {
      filtered = filtered.filter(user =>
        user.fullName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.email.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    if (roleFilter !== 'all') {
      filtered = filtered.filter(user => user.roles.includes(roleFilter));
    }

    if (statusFilter !== 'all') {
      filtered = filtered.filter(user => user.status === statusFilter);
    }

    setFilteredUsers(filtered);
  }, [users, searchTerm, roleFilter, statusFilter]);

  const getRoleDisplayName = (role: string) => {
    const roleNames = {
      admin: 'مدير النظام',
      moderator: 'مشرف',
      trader: 'متداول',
      viewer: 'مشاهد'
    };
    return roleNames[role as keyof typeof roleNames] || role;
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
        return 'text-success bg-success/10';
      case 'inactive':
        return 'text-muted-foreground bg-muted/10';
      case 'suspended':
        return 'text-destructive bg-destructive/10';
      default:
        return 'text-muted-foreground bg-muted/10';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'active':
        return 'نشط';
      case 'inactive':
        return 'غير نشط';
      case 'suspended':
        return 'موقوف';
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

  const toggleUserStatus = async (userId: string) => {
    if (!hasPermission('users.manage')) {
      toast({
        title: 'غير مصرح',
        description: 'ليس لديك صلاحية لتعديل حالة المستخدمين',
        variant: 'destructive',
      });
      return;
    }

    try {
      const updatedUsers = users.map(user => {
        if (user.id === userId) {
          return {
            ...user,
            status: user.status === 'active' ? 'inactive' : 'active' as 'active' | 'inactive'
          };
        }
        return user;
      });

      setUsers(updatedUsers);
      
      toast({
        title: 'تم تحديث الحالة',
        description: 'تم تغيير حالة المستخدم بنجاح',
        variant: 'success',
      });
    } catch (error) {
      toast({
        title: 'خطأ في التحديث',
        description: 'حدث خطأ أثناء تحديث حالة المستخدم',
        variant: 'destructive',
      });
    }
  };

  const deleteUser = async (userId: string) => {
    if (!hasPermission('users.manage')) {
      toast({
        title: 'غير مصرح',
        description: 'ليس لديك صلاحية لحذف المستخدمين',
        variant: 'destructive',
      });
      return;
    }

    if (confirm('هل أنت متأكد من حذف هذا المستخدم؟ هذا الإجراء لا يمكن التراجع عنه.')) {
      try {
        const updatedUsers = users.filter(user => user.id !== userId);
        setUsers(updatedUsers);
        
        toast({
          title: 'تم حذف المستخدم',
          description: 'تم حذف المستخدم بنجاح',
          variant: 'success',
        });
      } catch (error) {
        toast({
          title: 'خطأ في الحذف',
          description: 'حدث خطأ أثناء حذف المستخدم',
          variant: 'destructive',
        });
      }
    }
  };

  const calculateStats = () => {
    const total = users.length;
    const active = users.filter(u => u.status === 'active').length;
    const admins = users.filter(u => u.roles.includes('admin')).length;
    const traders = users.filter(u => u.roles.includes('trader')).length;

    return { total, active, admins, traders };
  };

  const stats = calculateStats();

  if (!hasPermission('users.view')) {
    return (
      <ProtectedRoute>
        <Layout>
          <div className="p-6 text-center">
            <Shield className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
            <h1 className="text-2xl font-bold text-foreground mb-2">غير مصرح بالوصول</h1>
            <p className="text-muted-foreground">ليس لديك صلاحية لعرض إدارة المستخدمين</p>
          </div>
        </Layout>
      </ProtectedRoute>
    );
  }

  return (
    <ProtectedRoute>
      <Head>
        <title>إدارة المستخدمين - منصة الإشارات</title>
        <meta name="description" content="إدارة المستخدمين والأدوار والصلاحيات" />
      </Head>

      <Layout showSidebar={true}>
        <div className="p-6 space-y-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-foreground">إدارة المستخدمين</h1>
              <p className="text-muted-foreground mt-2">
                إدارة حسابات المستخدمين والأدوار والصلاحيات
              </p>
            </div>
            {hasPermission('users.manage') && (
              <Button leftIcon={<Plus className="w-4 h-4" />}>
                إضافة مستخدم جديد
              </Button>
            )}
          </div>

          {/* إحصائيات سريعة */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <Card className="p-4 text-center">
              <Users className="w-6 h-6 text-primary mx-auto mb-2" />
              <div className="text-xl font-bold text-foreground">{stats.total}</div>
              <div className="text-sm text-muted-foreground">إجمالي المستخدمين</div>
            </Card>
            <Card className="p-4 text-center">
              <div className="w-6 h-6 text-success mx-auto mb-2">✓</div>
              <div className="text-xl font-bold text-foreground">{stats.active}</div>
              <div className="text-sm text-muted-foreground">مستخدمين نشطين</div>
            </Card>
            <Card className="p-4 text-center">
              <Shield className="w-6 h-6 text-primary mx-auto mb-2" />
              <div className="text-xl font-bold text-foreground">{stats.admins}</div>
              <div className="text-sm text-muted-foreground">مديرين</div>
            </Card>
            <Card className="p-4 text-center">
              <div className="w-6 h-6 text-warning mx-auto mb-2">👤</div>
              <div className="text-xl font-bold text-foreground">{stats.traders}</div>
              <div className="text-sm text-muted-foreground">متداولين</div>
            </Card>
          </div>

          {/* فلاتر البحث */}
          <Card className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div>
                <Input
                  placeholder="البحث في المستخدمين..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  leftIcon={<Search className="w-4 h-4" />}
                />
              </div>
              <div>
                <select
                  value={roleFilter}
                  onChange={(e) => setRoleFilter(e.target.value)}
                  className="w-full px-3 py-2 border border-border rounded-md bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                >
                  <option value="all">جميع الأدوار</option>
                  <option value="admin">مدير النظام</option>
                  <option value="moderator">مشرف</option>
                  <option value="trader">متداول</option>
                  <option value="viewer">مشاهد</option>
                </select>
              </div>
              <div>
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="w-full px-3 py-2 border border-border rounded-md bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                >
                  <option value="all">جميع الحالات</option>
                  <option value="active">نشط</option>
                  <option value="inactive">غير نشط</option>
                  <option value="suspended">موقوف</option>
                </select>
              </div>
              <div>
                <Button variant="outline" leftIcon={<Filter className="w-4 h-4" />}>
                  مرشحات متقدمة
                </Button>
              </div>
            </div>
          </Card>

          {/* جدول المستخدمين */}
          <Card className="overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-muted/30">
                  <tr>
                    <th className="px-6 py-3 text-right text-xs font-medium text-muted-foreground uppercase tracking-wider">
                      المستخدم
                    </th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-muted-foreground uppercase tracking-wider">
                      الدور
                    </th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-muted-foreground uppercase tracking-wider">
                      الإحصائيات
                    </th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-muted-foreground uppercase tracking-wider">
                      آخر نشاط
                    </th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-muted-foreground uppercase tracking-wider">
                      الحالة
                    </th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-muted-foreground uppercase tracking-wider">
                      الإجراءات
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-background divide-y divide-border">
                  {filteredUsers.map((user) => (
                    <tr key={user.id} className="hover:bg-muted/20">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center space-x-3 space-x-reverse">
                          <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center">
                            <span className="text-sm font-medium text-primary">
                              {user.fullName.charAt(0)}
                            </span>
                          </div>
                          <div>
                            <div className="text-sm font-medium text-foreground">
                              {user.fullName}
                            </div>
                            <div className="text-sm text-muted-foreground">
                              {user.email}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex flex-wrap gap-1">
                          {user.roles.map((role) => (
                            <span
                              key={role}
                              className="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-primary/10 text-primary"
                            >
                              {getRoleDisplayName(role)}
                            </span>
                          ))}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-muted-foreground">
                        <div>
                          <div>{user.signalsCount} إشارة</div>
                          <div className="text-xs">
                            {user.successRate > 0 ? `${user.successRate}% نجاح` : '-'}
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-muted-foreground">
                        {user.lastLogin ? formatDate(user.lastLogin) : 'لم يسجل دخول'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(user.status)}`}>
                          {getStatusText(user.status)}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-muted-foreground">
                        <div className="flex items-center space-x-2 space-x-reverse">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => {
                              setSelectedUser(user);
                              setShowUserModal(true);
                            }}
                          >
                            <Eye className="w-4 h-4" />
                          </Button>
                          {hasPermission('users.manage') && (
                            <>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => toggleUserStatus(user.id)}
                              >
                                <Edit className="w-4 h-4" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => deleteUser(user.id)}
                                className="text-destructive hover:text-destructive"
                              >
                                <Trash2 className="w-4 h-4" />
                              </Button>
                            </>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {filteredUsers.length === 0 && (
              <div className="text-center py-12">
                <Users className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-medium text-foreground mb-2">
                  لا يوجد مستخدمين
                </h3>
                <p className="text-muted-foreground">
                  لا يوجد مستخدمين يطابقون معايير البحث المحددة
                </p>
              </div>
            )}
          </Card>
        </div>
      </Layout>
    </ProtectedRoute>
  );
};

export default UsersManagementPage;