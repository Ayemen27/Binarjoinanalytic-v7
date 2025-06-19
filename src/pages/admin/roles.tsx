import React, { useState, useEffect } from 'react';
import type { NextPage } from 'next';
import Head from 'next/head';
import { Search, Plus, Edit3, Trash2, Shield, Key, Users } from 'lucide-react';

import { Layout } from '@/components/organisms/Layout';
import { ProtectedRoute } from '@/components/organisms/ProtectedRoute';
import { Card } from '@/components/atoms/Card';
import { Button } from '@/components/atoms/Button';
import { Input } from '@/components/atoms/Input';
import { useAuth } from '@/providers/AuthProvider';
import { rbacService, Role, Permission, RolePermission } from '@/lib/rbac';

const RolesManagementPage: NextPage = () => {
  const { user } = useAuth();
  const [roles, setRoles] = useState<Role[]>([]);
  const [permissions, setPermissions] = useState<Permission[]>([]);
  const [rolePermissions, setRolePermissions] = useState<Record<string, RolePermission[]>>({});
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedRole, setSelectedRole] = useState<Role | null>(null);
  const [showCreateModal, setShowCreateModal] = useState(false);
  
  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [rolesData, permissionsData] = await Promise.all([
        rbacService.getAllRoles(),
        rbacService.getAllPermissions()
      ]);
      
      setRoles(rolesData);
      setPermissions(permissionsData);

      // Fetch role permissions for each role
      const rolePermissionsMap: Record<string, RolePermission[]> = {};
      for (const role of rolesData) {
        const rolePerms = await rbacService.getRolePermissions(role.id);
        rolePermissionsMap[role.id] = rolePerms;
      }
      setRolePermissions(rolePermissionsMap);
      
    } catch (error) {
      console.error('Error fetching roles and permissions:', error);
    } finally {
      setLoading(false);
    }
  };

  const handlePermissionToggle = async (roleId: string, permissionId: string, grant: boolean) => {
    try {
      if (grant) {
        await rbacService.grantPermissionToRole(roleId, permissionId, user?.id);
      } else {
        await rbacService.revokePermissionFromRole(roleId, permissionId);
      }
      await fetchData(); // Refresh data
    } catch (error) {
      console.error('Error toggling permission:', error);
    }
  };

  const hasPermission = (roleId: string, permissionId: string) => {
    return rolePermissions[roleId]?.some(rp => rp.permission_id === permissionId) || false;
  };

  const filteredRoles = roles.filter(role =>
    role.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    role.display_name.ar?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    role.display_name.en?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const groupedPermissions = permissions.reduce((acc, permission) => {
    const category = permission.category || 'other';
    if (!acc[category]) {
      acc[category] = [];
    }
    acc[category].push(permission);
    return acc;
  }, {} as Record<string, Permission[]>);

  const categoryNames = {
    user_management: 'إدارة المستخدمين',
    rbac: 'الأدوار والصلاحيات',
    signals: 'الإشارات',
    analytics: 'التحليلات',
    system: 'النظام',
    other: 'أخرى'
  };

  if (loading) {
    return (
      <ProtectedRoute requiredPermissions={['roles.view']}>
        <Layout showSidebar={true}>
          <div className="p-6 flex items-center justify-center min-h-96">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
              <p className="text-muted-foreground">جاري تحميل الأدوار والصلاحيات...</p>
            </div>
          </div>
        </Layout>
      </ProtectedRoute>
    );
  }

  return (
    <ProtectedRoute requiredPermissions={['roles.view']}>
      <Head>
        <title>إدارة الأدوار والصلاحيات - منصة الإشارات</title>
      </Head>

      <Layout showSidebar={true}>
        <div className="p-6 space-y-6">
          {/* Header */}
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-foreground">إدارة الأدوار والصلاحيات</h1>
              <p className="text-muted-foreground mt-2">
                تحكم في صلاحيات المستخدمين ونظام الوصول
              </p>
            </div>
            <Button leftIcon={<Plus className="w-4 h-4" />} onClick={() => setShowCreateModal(true)}>
              إضافة دور جديد
            </Button>
          </div>

          {/* Statistics */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">إجمالي الأدوار</p>
                  <p className="text-2xl font-bold">{roles.length}</p>
                </div>
                <Shield className="w-8 h-8 text-primary" />
              </div>
            </Card>

            <Card className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">إجمالي الصلاحيات</p>
                  <p className="text-2xl font-bold">{permissions.length}</p>
                </div>
                <Key className="w-8 h-8 text-warning" />
              </div>
            </Card>

            <Card className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">الأدوار النشطة</p>
                  <p className="text-2xl font-bold">{roles.filter(r => r.is_active).length}</p>
                </div>
                <Users className="w-8 h-8 text-success" />
              </div>
            </Card>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Roles List */}
            <div className="lg:col-span-1">
              <Card className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-xl font-semibold">الأدوار</h2>
                </div>
                
                <div className="mb-4">
                  <Input
                    placeholder="البحث في الأدوار..."
                    leftIcon={<Search className="w-4 h-4" />}
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                </div>

                <div className="space-y-2">
                  {filteredRoles.map((role) => (
                    <div
                      key={role.id}
                      className={`p-3 rounded-lg cursor-pointer transition-colors ${
                        selectedRole?.id === role.id
                          ? 'bg-primary/10 border border-primary/20'
                          : 'hover:bg-muted/50'
                      }`}
                      onClick={() => setSelectedRole(role)}
                    >
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="font-medium text-foreground">
                            {role.display_name.ar || role.name}
                          </p>
                          <p className="text-sm text-muted-foreground">
                            مستوى {role.level} • {rolePermissions[role.id]?.length || 0} صلاحية
                          </p>
                        </div>
                        <div className="flex items-center gap-1">
                          {role.is_system_role && (
                            <Shield className="w-4 h-4 text-warning" />
                          )}
                          <Button size="sm" variant="ghost">
                            <Edit3 className="w-3 h-3" />
                          </Button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </Card>
            </div>

            {/* Permissions Management */}
            <div className="lg:col-span-2">
              <Card className="p-6">
                {selectedRole ? (
                  <>
                    <div className="flex items-center justify-between mb-6">
                      <div>
                        <h2 className="text-xl font-semibold">
                          صلاحيات: {selectedRole.display_name.ar || selectedRole.name}
                        </h2>
                        <p className="text-muted-foreground">
                          {selectedRole.description?.ar || 'إدارة صلاحيات هذا الدور'}
                        </p>
                      </div>
                      {selectedRole.is_system_role && (
                        <span className="px-2 py-1 bg-warning/10 text-warning text-xs rounded-full">
                          دور النظام
                        </span>
                      )}
                    </div>

                    <div className="space-y-6">
                      {Object.entries(groupedPermissions).map(([category, categoryPermissions]) => (
                        <div key={category}>
                          <h3 className="text-lg font-medium mb-3 text-foreground">
                            {categoryNames[category as keyof typeof categoryNames] || category}
                          </h3>
                          
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                            {categoryPermissions.map((permission) => (
                              <div
                                key={permission.id}
                                className="flex items-center justify-between p-3 border border-border rounded-lg"
                              >
                                <div className="flex-1">
                                  <p className="font-medium text-foreground">
                                    {permission.display_name.ar || permission.name}
                                  </p>
                                  <p className="text-sm text-muted-foreground">
                                    {permission.resource}.{permission.action}
                                  </p>
                                </div>
                                
                                <label className="flex items-center">
                                  <input
                                    type="checkbox"
                                    checked={hasPermission(selectedRole.id, permission.id)}
                                    onChange={(e) => 
                                      handlePermissionToggle(
                                        selectedRole.id, 
                                        permission.id, 
                                        e.target.checked
                                      )
                                    }
                                    disabled={selectedRole.is_system_role}
                                    className="w-4 h-4 text-primary focus:ring-primary border-border rounded"
                                  />
                                </label>
                              </div>
                            ))}
                          </div>
                        </div>
                      ))}
                    </div>
                  </>
                ) : (
                  <div className="text-center py-12">
                    <Shield className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-foreground mb-2">
                      اختر دوراً لإدارة صلاحياته
                    </h3>
                    <p className="text-muted-foreground">
                      انقر على أحد الأدوار في القائمة لعرض وتعديل صلاحياته
                    </p>
                  </div>
                )}
              </Card>
            </div>
          </div>
        </div>
      </Layout>
    </ProtectedRoute>
  );
};

export default RolesManagementPage;