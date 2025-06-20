import React, { useState, useEffect } from 'react';
import type { NextPage } from 'next';
import Head from 'next/head';
import { Shield, Search, Plus, Edit, Trash2, Users, Key, Check, X } from 'lucide-react';

import { Layout } from '@/components/organisms/Layout';
import { ProtectedRoute } from '@/components/organisms/ProtectedRoute';
import { Card } from '@/components/atoms/Card';
import { Button } from '@/components/atoms/Button';
import { Input } from '@/components/atoms/Input';
import { usePermissions } from '@/hooks/usePermissions';
import { useToast } from '@/hooks/useToast';

interface Role {
  id: string;
  name: string;
  displayName: string;
  description: string;
  level: number;
  permissions: string[];
  userCount: number;
  isSystemRole: boolean;
  isActive: boolean;
  createdAt: string;
}

interface Permission {
  id: string;
  name: string;
  resource: string;
  action: string;
  displayName: string;
  description: string;
  isSystemPermission: boolean;
}

const mockRoles: Role[] = [
  {
    id: '1',
    name: 'admin',
    displayName: 'مدير النظام',
    description: 'صلاحيات كاملة لإدارة النظام',
    level: 0,
    permissions: ['*'],
    userCount: 1,
    isSystemRole: true,
    isActive: true,
    createdAt: '2024-01-01T00:00:00Z'
  },
  {
    id: '2',
    name: 'moderator',
    displayName: 'مشرف',
    description: 'إشراف على المحتوى والمستخدمين',
    level: 1,
    permissions: ['signals.moderate', 'users.view', 'reports.manage'],
    userCount: 2,
    isSystemRole: true,
    isActive: true,
    createdAt: '2024-01-01T00:00:00Z'
  },
  {
    id: '3',
    name: 'trader',
    displayName: 'متداول',
    description: 'مستخدم عادي للتداول',
    level: 2,
    permissions: ['signals.generate', 'signals.view', 'dashboard.view'],
    userCount: 45,
    isSystemRole: true,
    isActive: true,
    createdAt: '2024-01-01T00:00:00Z'
  },
  {
    id: '4',
    name: 'viewer',
    displayName: 'مشاهد',
    description: 'عرض فقط بدون تداول',
    level: 3,
    permissions: ['signals.view', 'dashboard.view'],
    userCount: 12,
    isSystemRole: true,
    isActive: true,
    createdAt: '2024-01-01T00:00:00Z'
  }
];

const mockPermissions: Permission[] = [
  {
    id: '1',
    name: 'signals.generate',
    resource: 'signals',
    action: 'generate',
    displayName: 'توليد الإشارات',
    description: 'إنشاء إشارات تداول جديدة',
    isSystemPermission: true
  },
  {
    id: '2',
    name: 'signals.view',
    resource: 'signals',
    action: 'view',
    displayName: 'عرض الإشارات',
    description: 'مشاهدة الإشارات المتاحة',
    isSystemPermission: true
  },
  {
    id: '3',
    name: 'signals.moderate',
    resource: 'signals',
    action: 'moderate',
    displayName: 'إشراف الإشارات',
    description: 'مراجعة وإدارة الإشارات',
    isSystemPermission: true
  },
  {
    id: '4',
    name: 'dashboard.view',
    resource: 'dashboard',
    action: 'view',
    displayName: 'عرض لوحة التحكم',
    description: 'الوصول للوحة التحكم',
    isSystemPermission: true
  },
  {
    id: '5',
    name: 'users.manage',
    resource: 'users',
    action: 'manage',
    displayName: 'إدارة المستخدمين',
    description: 'إضافة وتعديل وحذف المستخدمين',
    isSystemPermission: true
  },
  {
    id: '6',
    name: 'users.view',
    resource: 'users',
    action: 'view',
    displayName: 'عرض المستخدمين',
    description: 'مشاهدة قائمة المستخدمين',
    isSystemPermission: true
  },
  {
    id: '7',
    name: 'roles.manage',
    resource: 'roles',
    action: 'manage',
    displayName: 'إدارة الأدوار',
    description: 'إنشاء وتعديل الأدوار والصلاحيات',
    isSystemPermission: true
  },
  {
    id: '8',
    name: 'reports.manage',
    resource: 'reports',
    action: 'manage',
    displayName: 'إدارة التقارير',
    description: 'إنشاء وعرض التقارير',
    isSystemPermission: true
  }
];

const RolesManagementPage: NextPage = () => {
  const [roles, setRoles] = useState<Role[]>(mockRoles);
  const [permissions, setPermissions] = useState<Permission[]>(mockPermissions);
  const [filteredRoles, setFilteredRoles] = useState<Role[]>(mockRoles);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedRole, setSelectedRole] = useState<Role | null>(null);
  const [showRoleModal, setShowRoleModal] = useState(false);
  const [showPermissionsModal, setShowPermissionsModal] = useState(false);
  
  const { hasPermission } = usePermissions();
  const { toast } = useToast();

  useEffect(() => {
    let filtered = roles;

    if (searchTerm) {
      filtered = filtered.filter(role =>
        role.displayName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        role.description.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    setFilteredRoles(filtered);
  }, [roles, searchTerm]);

  const formatDate = (dateString: string) => {
    return new Intl.DateTimeFormat('ar-SA', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    }).format(new Date(dateString));
  };

  const toggleRoleStatus = async (roleId: string) => {
    if (!hasPermission('roles.manage')) {
      toast({
        title: 'غير مصرح',
        description: 'ليس لديك صلاحية لتعديل الأدوار',
        variant: 'destructive',
      });
      return;
    }

    try {
      const updatedRoles = roles.map(role => {
        if (role.id === roleId) {
          return { ...role, isActive: !role.isActive };
        }
        return role;
      });

      setRoles(updatedRoles);
      
      toast({
        title: 'تم تحديث الدور',
        description: 'تم تغيير حالة الدور بنجاح',
        variant: 'success',
      });
    } catch (error) {
      toast({
        title: 'خطأ في التحديث',
        description: 'حدث خطأ أثناء تحديث الدور',
        variant: 'destructive',
      });
    }
  };

  const deleteRole = async (roleId: string) => {
    if (!hasPermission('roles.manage')) {
      toast({
        title: 'غير مصرح',
        description: 'ليس لديك صلاحية لحذف الأدوار',
        variant: 'destructive',
      });
      return;
    }

    const role = roles.find(r => r.id === roleId);
    if (role?.isSystemRole) {
      toast({
        title: 'لا يمكن الحذف',
        description: 'لا يمكن حذف أدوار النظام الأساسية',
        variant: 'destructive',
      });
      return;
    }

    if (confirm('هل أنت متأكد من حذف هذا الدور؟ سيتم إزالته من جميع المستخدمين.')) {
      try {
        const updatedRoles = roles.filter(role => role.id !== roleId);
        setRoles(updatedRoles);
        
        toast({
          title: 'تم حذف الدور',
          description: 'تم حذف الدور بنجاح',
          variant: 'success',
        });
      } catch (error) {
        toast({
          title: 'خطأ في الحذف',
          description: 'حدث خطأ أثناء حذف الدور',
          variant: 'destructive',
        });
      }
    }
  };

  const getPermissionDisplayName = (permissionName: string) => {
    if (permissionName === '*') return 'جميع الصلاحيات';
    const permission = permissions.find(p => p.name === permissionName);
    return permission?.displayName || permissionName;
  };

  const calculateStats = () => {
    const total = roles.length;
    const active = roles.filter(r => r.isActive).length;
    const systemRoles = roles.filter(r => r.isSystemRole).length;
    const customRoles = roles.filter(r => !r.isSystemRole).length;

    return { total, active, systemRoles, customRoles };
  };

  const stats = calculateStats();

  if (!hasPermission('roles.manage')) {
    return (
      <ProtectedRoute>
        <Layout>
          <div className="p-6 text-center">
            <Shield className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
            <h1 className="text-2xl font-bold text-foreground mb-2">غير مصرح بالوصول</h1>
            <p className="text-muted-foreground">ليس لديك صلاحية لإدارة الأدوار والصلاحيات</p>
          </div>
        </Layout>
      </ProtectedRoute>
    );
  }

  return (
    <ProtectedRoute>
      <Head>
        <title>إدارة الأدوار والصلاحيات - منصة الإشارات</title>
        <meta name="description" content="إدارة أدوار المستخدمين والصلاحيات" />
      </Head>

      <Layout showSidebar={true}>
        <div className="p-6 space-y-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-foreground">إدارة الأدوار والصلاحيات</h1>
              <p className="text-muted-foreground mt-2">
                إدارة أدوار المستخدمين والصلاحيات المختلفة
              </p>
            </div>
            <div className="flex space-x-3 space-x-reverse">
              <Button 
                variant="outline"
                onClick={() => setShowPermissionsModal(true)}
                leftIcon={<Key className="w-4 h-4" />}
              >
                عرض الصلاحيات
              </Button>
              <Button leftIcon={<Plus className="w-4 h-4" />}>
                إضافة دور جديد
              </Button>
            </div>
          </div>

          {/* إحصائيات سريعة */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <Card className="p-4 text-center">
              <Shield className="w-6 h-6 text-primary mx-auto mb-2" />
              <div className="text-xl font-bold text-foreground">{stats.total}</div>
              <div className="text-sm text-muted-foreground">إجمالي الأدوار</div>
            </Card>
            <Card className="p-4 text-center">
              <div className="w-6 h-6 text-success mx-auto mb-2">✓</div>
              <div className="text-xl font-bold text-foreground">{stats.active}</div>
              <div className="text-sm text-muted-foreground">أدوار نشطة</div>
            </Card>
            <Card className="p-4 text-center">
              <div className="w-6 h-6 text-warning mx-auto mb-2">🔧</div>
              <div className="text-xl font-bold text-foreground">{stats.systemRoles}</div>
              <div className="text-sm text-muted-foreground">أدوار النظام</div>
            </Card>
            <Card className="p-4 text-center">
              <Users className="w-6 h-6 text-primary mx-auto mb-2" />
              <div className="text-xl font-bold text-foreground">{stats.customRoles}</div>
              <div className="text-sm text-muted-foreground">أدوار مخصصة</div>
            </Card>
          </div>

          {/* البحث */}
          <Card className="p-6">
            <div className="max-w-md">
              <Input
                placeholder="البحث في الأدوار..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                leftIcon={<Search className="w-4 h-4" />}
              />
            </div>
          </Card>

          {/* قائمة الأدوار */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredRoles.map((role) => (
              <Card key={role.id} className="p-6">
                <div className="space-y-4">
                  <div className="flex items-start justify-between">
                    <div className="flex items-center space-x-3 space-x-reverse">
                      <div className={`p-2 rounded-lg ${role.isActive ? 'bg-primary/10' : 'bg-muted/30'}`}>
                        <Shield className={`w-6 h-6 ${role.isActive ? 'text-primary' : 'text-muted-foreground'}`} />
                      </div>
                      <div>
                        <h3 className="font-semibold text-foreground">{role.displayName}</h3>
                        <p className="text-sm text-muted-foreground">{role.name}</p>
                      </div>
                    </div>
                    
                    <div className="flex items-center space-x-1 space-x-reverse">
                      {role.isSystemRole && (
                        <span className="px-2 py-1 text-xs bg-warning/10 text-warning rounded-full">
                          نظام
                        </span>
                      )}
                      <span className={`px-2 py-1 text-xs rounded-full ${
                        role.isActive 
                          ? 'bg-success/10 text-success' 
                          : 'bg-muted/30 text-muted-foreground'
                      }`}>
                        {role.isActive ? 'نشط' : 'معطل'}
                      </span>
                    </div>
                  </div>

                  <p className="text-sm text-muted-foreground">{role.description}</p>

                  <div>
                    <h4 className="text-sm font-medium text-foreground mb-2">الصلاحيات:</h4>
                    <div className="space-y-1 max-h-24 overflow-y-auto">
                      {role.permissions.slice(0, 3).map((permission) => (
                        <div key={permission} className="flex items-center space-x-2 space-x-reverse text-xs">
                          <Check className="w-3 h-3 text-success" />
                          <span className="text-muted-foreground">
                            {getPermissionDisplayName(permission)}
                          </span>
                        </div>
                      ))}
                      {role.permissions.length > 3 && (
                        <div className="text-xs text-muted-foreground">
                          +{role.permissions.length - 3} صلاحيات أخرى
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center justify-between text-sm">
                    <div className="flex items-center space-x-2 space-x-reverse text-muted-foreground">
                      <Users className="w-4 h-4" />
                      <span>{role.userCount} مستخدم</span>
                    </div>
                    <span className="text-muted-foreground">
                      {formatDate(role.createdAt)}
                    </span>
                  </div>

                  <div className="flex space-x-2 space-x-reverse pt-2 border-t">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        setSelectedRole(role);
                        setShowRoleModal(true);
                      }}
                      className="flex-1"
                    >
                      <Edit className="w-4 h-4 ml-2" />
                      تعديل
                    </Button>
                    
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => toggleRoleStatus(role.id)}
                    >
                      {role.isActive ? (
                        <X className="w-4 h-4" />
                      ) : (
                        <Check className="w-4 h-4" />
                      )}
                    </Button>

                    {!role.isSystemRole && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => deleteRole(role.id)}
                        className="text-destructive hover:text-destructive"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    )}
                  </div>
                </div>
              </Card>
            ))}
          </div>

          {filteredRoles.length === 0 && (
            <Card className="p-12 text-center">
              <Shield className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-medium text-foreground mb-2">
                لا توجد أدوار
              </h3>
              <p className="text-muted-foreground">
                لا توجد أدوار تطابق معايير البحث المحددة
              </p>
            </Card>
          )}

          {/* نافذة عرض الصلاحيات */}
          {showPermissionsModal && (
            <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
              <Card className="w-full max-w-2xl mx-4 max-h-[80vh] overflow-y-auto">
                <div className="p-6">
                  <div className="flex items-center justify-between mb-6">
                    <h2 className="text-xl font-semibold text-foreground">جميع الصلاحيات</h2>
                    <Button 
                      variant="ghost" 
                      size="sm"
                      onClick={() => setShowPermissionsModal(false)}
                    >
                      <X className="w-4 h-4" />
                    </Button>
                  </div>
                  
                  <div className="space-y-4">
                    {Object.entries(
                      permissions.reduce((acc, permission) => {
                        if (!acc[permission.resource]) {
                          acc[permission.resource] = [];
                        }
                        acc[permission.resource].push(permission);
                        return acc;
                      }, {} as Record<string, Permission[]>)
                    ).map(([resource, perms]) => (
                      <div key={resource}>
                        <h3 className="font-medium text-foreground mb-2 capitalize">
                          {resource === 'signals' ? 'الإشارات' :
                           resource === 'users' ? 'المستخدمون' :
                           resource === 'roles' ? 'الأدوار' :
                           resource === 'dashboard' ? 'لوحة التحكم' :
                           resource === 'reports' ? 'التقارير' : resource}
                        </h3>
                        <div className="grid grid-cols-1 gap-2 ml-4">
                          {perms.map((permission) => (
                            <div key={permission.id} className="flex items-start space-x-3 space-x-reverse">
                              <Key className="w-4 h-4 text-primary mt-0.5" />
                              <div>
                                <div className="font-medium text-sm text-foreground">
                                  {permission.displayName}
                                </div>
                                <div className="text-xs text-muted-foreground">
                                  {permission.description}
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    ))}
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

export default RolesManagementPage;