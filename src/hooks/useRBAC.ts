import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { rbacService, type Role, type Permission } from '@/services/rbac'
import { useAuth } from './useAuth'
import { useToast } from './useToast'

export const useRBAC = () => {
  const { user } = useAuth()
  const queryClient = useQueryClient()
  const { toast } = useToast()

  // Get user roles
  const {
    data: userRoles,
    isLoading: rolesLoading
  } = useQuery({
    queryKey: ['rbac', 'userRoles', user?.id],
    queryFn: () => user ? rbacService.getUserRoles(user.id) : Promise.resolve([]),
    enabled: !!user,
  })

  // Get user permissions
  const {
    data: userPermissions,
    isLoading: permissionsLoading
  } = useQuery({
    queryKey: ['rbac', 'userPermissions', user?.id],
    queryFn: () => user ? rbacService.getUserPermissions(user.id) : Promise.resolve([]),
    enabled: !!user,
  })

  // Check permission function
  const hasPermission = (resource: string, action: string): boolean => {
    if (!userPermissions) return false
    
    return userPermissions.some(permission => {
      const [permResource, permAction] = permission.split(':')
      return (permResource === resource || permResource === '*') && 
             (permAction === action || permAction === '*')
    })
  }

  // Check role function
  const hasRole = (roleName: string): boolean => {
    if (!userRoles) return false
    return userRoles.some(role => role.name === roleName)
  }

  // Check multiple permissions (OR logic)
  const hasAnyPermission = (permissions: string[]): boolean => {
    return permissions.some(permission => {
      const [resource, action] = permission.split(':')
      return hasPermission(resource, action)
    })
  }

  // Check multiple permissions (AND logic)
  const hasAllPermissions = (permissions: string[]): boolean => {
    return permissions.every(permission => {
      const [resource, action] = permission.split(':')
      return hasPermission(resource, action)
    })
  }

  return {
    userRoles: userRoles || [],
    userPermissions: userPermissions || [],
    isLoading: rolesLoading || permissionsLoading,
    hasPermission,
    hasRole,
    hasAnyPermission,
    hasAllPermissions,
  }
}

export const useRoles = (page = 1, limit = 10) => {
  const queryClient = useQueryClient()
  const { toast } = useToast()

  // Get all roles
  const {
    data: rolesData,
    isLoading,
    error
  } = useQuery({
    queryKey: ['rbac', 'roles', page, limit],
    queryFn: () => rbacService.getRoles(page, limit),
  })

  // Get role hierarchy
  const { data: roleHierarchy } = useQuery({
    queryKey: ['rbac', 'hierarchy'],
    queryFn: rbacService.getRoleHierarchy,
  })

  // Create role mutation
  const createRoleMutation = useMutation({
    mutationFn: (role: Omit<Role, 'id' | 'created_at' | 'updated_at'>) =>
      rbacService.createRole(role),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['rbac', 'roles'] })
      queryClient.invalidateQueries({ queryKey: ['rbac', 'hierarchy'] })
      toast({
        title: 'تم إنشاء الدور بنجاح',
        variant: 'success',
      })
    },
    onError: (error: any) => {
      toast({
        title: 'خطأ في إنشاء الدور',
        description: error.message,
        variant: 'destructive',
      })
    },
  })

  // Update role mutation
  const updateRoleMutation = useMutation({
    mutationFn: ({ id, updates }: { id: string; updates: Partial<Role> }) =>
      rbacService.updateRole(id, updates),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['rbac', 'roles'] })
      queryClient.invalidateQueries({ queryKey: ['rbac', 'hierarchy'] })
      toast({
        title: 'تم تحديث الدور بنجاح',
        variant: 'success',
      })
    },
    onError: (error: any) => {
      toast({
        title: 'خطأ في تحديث الدور',
        description: error.message,
        variant: 'destructive',
      })
    },
  })

  // Delete role mutation
  const deleteRoleMutation = useMutation({
    mutationFn: (id: string) => rbacService.deleteRole(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['rbac', 'roles'] })
      queryClient.invalidateQueries({ queryKey: ['rbac', 'hierarchy'] })
      toast({
        title: 'تم حذف الدور بنجاح',
        variant: 'success',
      })
    },
    onError: (error: any) => {
      toast({
        title: 'خطأ في حذف الدور',
        description: error.message,
        variant: 'destructive',
      })
    },
  })

  return {
    roles: rolesData?.data || [],
    totalRoles: rolesData?.total || 0,
    totalPages: rolesData?.totalPages || 0,
    roleHierarchy: roleHierarchy || [],
    isLoading,
    error,
    createRole: createRoleMutation.mutate,
    updateRole: updateRoleMutation.mutate,
    deleteRole: deleteRoleMutation.mutate,
    isCreating: createRoleMutation.isPending,
    isUpdating: updateRoleMutation.isPending,
    isDeleting: deleteRoleMutation.isPending,
  }
}

export const usePermissions = () => {
  const queryClient = useQueryClient()
  const { toast } = useToast()

  // Get all permissions
  const {
    data: permissions,
    isLoading,
    error
  } = useQuery({
    queryKey: ['rbac', 'permissions'],
    queryFn: rbacService.getPermissions,
  })

  // Create permission mutation
  const createPermissionMutation = useMutation({
    mutationFn: (permission: Omit<Permission, 'id' | 'created_at'>) =>
      rbacService.createPermission(permission),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['rbac', 'permissions'] })
      toast({
        title: 'تم إنشاء الصلاحية بنجاح',
        variant: 'success',
      })
    },
    onError: (error: any) => {
      toast({
        title: 'خطأ في إنشاء الصلاحية',
        description: error.message,
        variant: 'destructive',
      })
    },
  })

  return {
    permissions: permissions || [],
    isLoading,
    error,
    createPermission: createPermissionMutation.mutate,
    isCreating: createPermissionMutation.isPending,
  }
}

export const useUserRoles = (userId?: string) => {
  const queryClient = useQueryClient()
  const { user } = useAuth()
  const { toast } = useToast()
  const targetUserId = userId || user?.id

  // Get user roles
  const {
    data: userRoles,
    isLoading
  } = useQuery({
    queryKey: ['rbac', 'userRoles', targetUserId],
    queryFn: () => targetUserId ? rbacService.getUserRoles(targetUserId) : Promise.resolve([]),
    enabled: !!targetUserId,
  })

  // Assign role mutation
  const assignRoleMutation = useMutation({
    mutationFn: ({ roleId, expiresAt }: { roleId: string; expiresAt?: string }) =>
      rbacService.assignRole(targetUserId!, roleId, user!.id, expiresAt),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['rbac', 'userRoles', targetUserId] })
      queryClient.invalidateQueries({ queryKey: ['rbac', 'userPermissions', targetUserId] })
      toast({
        title: 'تم تعيين الدور بنجاح',
        variant: 'success',
      })
    },
    onError: (error: any) => {
      toast({
        title: 'خطأ في تعيين الدور',
        description: error.message,
        variant: 'destructive',
      })
    },
  })

  // Revoke role mutation
  const revokeRoleMutation = useMutation({
    mutationFn: (roleId: string) => rbacService.revokeRole(targetUserId!, roleId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['rbac', 'userRoles', targetUserId] })
      queryClient.invalidateQueries({ queryKey: ['rbac', 'userPermissions', targetUserId] })
      toast({
        title: 'تم إلغاء الدور بنجاح',
        variant: 'success',
      })
    },
    onError: (error: any) => {
      toast({
        title: 'خطأ في إلغاء الدور',
        description: error.message,
        variant: 'destructive',
      })
    },
  })

  return {
    userRoles: userRoles || [],
    isLoading,
    assignRole: assignRoleMutation.mutate,
    revokeRole: revokeRoleMutation.mutate,
    isAssigning: assignRoleMutation.isPending,
    isRevoking: revokeRoleMutation.isPending,
  }
}