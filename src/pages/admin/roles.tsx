import { useState } from 'react'
import { Layout } from '@/components/organisms/Layout'
import { useAuth } from '@/hooks/useAuth'
import { useRBAC, useRoles, usePermissions } from '@/hooks/useRBAC'
import { RoleCard } from '@/components/molecules/RoleCard'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/atoms/Card'
import { Button } from '@/components/atoms/Button'
import { Input } from '@/components/atoms/Input'
import { Search, Filter, Plus, Shield, Users, Settings } from 'lucide-react'
import { useRouter } from 'next/router'
import { useEffect } from 'react'

const RolesPage = () => {
  const { user, loading } = useAuth()
  const { hasPermission } = useRBAC()
  const [currentPage, setCurrentPage] = useState(1)
  const [searchTerm, setSearchTerm] = useState('')
  const { roles, totalPages, createRole, deleteRole, isCreating, isDeleting } = useRoles(currentPage, 12)
  const { permissions } = usePermissions()
  const router = useRouter()

  useEffect(() => {
    if (!loading && !user) {
      router.push('/auth/login')
    }
    if (!loading && user && !hasPermission('admin', 'read')) {
      router.push('/dashboard')
    }
  }, [user, loading, hasPermission, router])

  if (loading) {
    return (
      <Layout>
        <div className="flex items-center justify-center min-h-screen">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary"></div>
        </div>
      </Layout>
    )
  }

  if (!user || !hasPermission('admin', 'read')) {
    return null
  }

  const handleCreateRole = () => {
    const newRole = {
      name: `role_${Date.now()}`,
      display_name: { ar: 'دور جديد', en: 'New Role' },
      description: 'دور تم إنشاؤه حديثاً',
      permissions: ['signals:read'],
      is_system: false,
      parent_role_id: null,
      level: 10,
    }
    
    createRole(newRole)
  }

  const filteredRoles = roles.filter(role => {
    const displayName = role.display_name?.ar || role.display_name?.en || role.name
    return displayName.toLowerCase().includes(searchTerm.toLowerCase()) ||
           role.name.toLowerCase().includes(searchTerm.toLowerCase())
  })

  return (
    <Layout>
      <div className="p-6 space-y-6">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white flex items-center gap-3">
              <Shield className="h-8 w-8 text-blue-600" />
              إدارة الأدوار والصلاحيات
            </h1>
            <p className="text-gray-600 dark:text-gray-400">
              إدارة أدوار المستخدمين وصلاحياتهم في النظام
            </p>
          </div>
          
          <div className="flex flex-col sm:flex-row gap-3 mt-4 lg:mt-0">
            {hasPermission('admin', 'write') && (
              <Button
                onClick={handleCreateRole}
                loading={isCreating}
                className="bg-green-600 hover:bg-green-700"
              >
                <Plus className="h-4 w-4 mr-2" />
                إنشاء دور جديد
              </Button>
            )}
            <Button variant="outline">
              <Settings className="h-4 w-4 mr-2" />
              إعدادات متقدمة
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                    إجمالي الأدوار
                  </p>
                  <p className="text-2xl font-bold text-gray-900 dark:text-white">
                    {roles.length}
                  </p>
                </div>
                <Shield className="h-8 w-8 text-blue-600" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                    الصلاحيات المتاحة
                  </p>
                  <p className="text-2xl font-bold text-gray-900 dark:text-white">
                    {permissions.length}
                  </p>
                </div>
                <Settings className="h-8 w-8 text-green-600" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                    المستخدمون النشطون
                  </p>
                  <p className="text-2xl font-bold text-gray-900 dark:text-white">
                    {Math.floor(Math.random() * 100) + 50}
                  </p>
                </div>
                <Users className="h-8 w-8 text-purple-600" />
              </div>
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardContent className="p-4">
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="flex-1">
                <Input
                  placeholder="البحث عن الأدوار..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  leftIcon={<Search className="h-4 w-4" />}
                />
              </div>
              <Button variant="outline">
                <Filter className="h-4 w-4 mr-2" />
                فلاتر متقدمة
              </Button>
            </div>
          </CardContent>
        </Card>

        {filteredRoles.length > 0 ? (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredRoles.map((role) => (
                <RoleCard
                  key={role.id}
                  role={role}
                  onEdit={(role) => console.log('Edit role:', role)}
                  onDelete={(id) => {
                    if (hasPermission('admin', 'delete')) {
                      deleteRole(id)
                    }
                  }}
                  onAssign={(roleId) => console.log('Assign role:', roleId)}
                  showActions={hasPermission('admin', 'write')}
                  userCount={Math.floor(Math.random() * 50)}
                />
              ))}
            </div>

            {totalPages > 1 && (
              <div className="flex justify-center space-x-2">
                <Button
                  variant="outline"
                  onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                  disabled={currentPage === 1}
                >
                  السابق
                </Button>
                
                <div className="flex items-center space-x-2">
                  {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
                    <Button
                      key={page}
                      variant={currentPage === page ? "primary" : "outline"}
                      onClick={() => setCurrentPage(page)}
                      size="sm"
                    >
                      {page}
                    </Button>
                  ))}
                </div>

                <Button
                  variant="outline"
                  onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                  disabled={currentPage === totalPages}
                >
                  التالي
                </Button>
              </div>
            )}
          </>
        ) : (
          <Card>
            <CardContent className="p-12 text-center">
              <Shield className="h-16 w-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                لا توجد أدوار
              </h3>
              <p className="text-gray-600 dark:text-gray-400 mb-6">
                {searchTerm ? 'لم يتم العثور على أدوار تطابق البحث' : 'ابدأ بإنشاء دور جديد'}
              </p>
              {hasPermission('admin', 'write') && (
                <Button
                  onClick={handleCreateRole}
                  loading={isCreating}
                  className="bg-blue-600 hover:bg-blue-700"
                >
                  <Plus className="h-4 w-4 mr-2" />
                  إنشاء دور جديد
                </Button>
              )}
            </CardContent>
          </Card>
        )}

        <Card>
          <CardHeader>
            <CardTitle>مرجع سريع للصلاحيات</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {permissions.slice(0, 9).map((permission) => (
                <div key={permission.id} className="border border-gray-200 dark:border-gray-700 rounded-lg p-3">
                  <div className="font-medium text-sm">{permission.name}</div>
                  <div className="text-xs text-gray-600 dark:text-gray-400">
                    {permission.resource}:{permission.action}
                  </div>
                  {permission.description && (
                    <div className="text-xs text-gray-500 mt-1">
                      {permission.description}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </Layout>
  )
}

export default RolesPage