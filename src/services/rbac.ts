import { supabase } from '@/lib/supabase'
import type { PaginatedResponse } from '@/types'

export interface Role {
  id: string
  name: string
  display_name: Record<string, string>
  description: string | null
  permissions: string[]
  is_system: boolean
  parent_role_id: string | null
  level: number
  created_at: string
  updated_at: string
}

export interface Permission {
  id: string
  name: string
  resource: string
  action: string
  description: string | null
  created_at: string
}

export interface UserRole {
  user_id: string
  role_id: string
  assigned_at: string
  assigned_by: string
  expires_at: string | null
}

export const rbacService = {
  // Role Management
  async getRoles(page = 1, limit = 10): Promise<PaginatedResponse<Role>> {
    const start = (page - 1) * limit
    const end = start + limit - 1

    const { data, error, count } = await supabase
      .from('roles')
      .select('*', { count: 'exact' })
      .order('level', { ascending: true })
      .range(start, end)

    if (error) throw error

    return {
      data: data || [],
      total: count || 0,
      page,
      limit,
      totalPages: Math.ceil((count || 0) / limit),
    }
  },

  async createRole(role: Omit<Role, 'id' | 'created_at' | 'updated_at'>): Promise<Role> {
    const { data, error } = await supabase
      .from('roles')
      .insert(role)
      .select()
      .single()

    if (error) throw error
    return data
  },

  async updateRole(id: string, updates: Partial<Role>): Promise<Role> {
    const { data, error } = await supabase
      .from('roles')
      .update({ ...updates, updated_at: new Date().toISOString() })
      .eq('id', id)
      .select()
      .single()

    if (error) throw error
    return data
  },

  async deleteRole(id: string): Promise<void> {
    const { error } = await supabase
      .from('roles')
      .delete()
      .eq('id', id)

    if (error) throw error
  },

  // Permission Management
  async getPermissions(): Promise<Permission[]> {
    const { data, error } = await supabase
      .from('permissions')
      .select('*')
      .order('resource', { ascending: true })

    if (error) throw error
    return data || []
  },

  async createPermission(permission: Omit<Permission, 'id' | 'created_at'>): Promise<Permission> {
    const { data, error } = await supabase
      .from('permissions')
      .insert(permission)
      .select()
      .single()

    if (error) throw error
    return data
  },

  // User Role Assignment
  async getUserRoles(userId: string): Promise<Role[]> {
    const { data, error } = await supabase
      .from('user_roles')
      .select(`
        role_id,
        roles!inner (
          id,
          name,
          display_name,
          description,
          permissions,
          level,
          is_system,
          parent_role_id,
          created_at,
          updated_at
        )
      `)
      .eq('user_id', userId)
      .is('expires_at', null)
      .or('expires_at.gt.now()')

    if (error) throw error
    return data?.map(ur => ur.roles as any).filter(Boolean) || []
  },

  async assignRole(userId: string, roleId: string, assignedBy: string, expiresAt?: string): Promise<UserRole> {
    const { data, error } = await supabase
      .from('user_roles')
      .insert({
        user_id: userId,
        role_id: roleId,
        assigned_by: assignedBy,
        expires_at: expiresAt || null,
      })
      .select()
      .single()

    if (error) throw error
    return data
  },

  async revokeRole(userId: string, roleId: string): Promise<void> {
    const { error } = await supabase
      .from('user_roles')
      .delete()
      .eq('user_id', userId)
      .eq('role_id', roleId)

    if (error) throw error
  },

  // Permission Checking
  async hasPermission(userId: string, resource: string, action: string): Promise<boolean> {
    const userRoles = await this.getUserRoles(userId)
    
    for (const role of userRoles) {
      if (role.permissions.some(permission => {
        const [permResource, permAction] = permission.split(':')
        return (permResource === resource || permResource === '*') && 
               (permAction === action || permAction === '*')
      })) {
        return true
      }
    }
    
    return false
  },

  async getUserPermissions(userId: string): Promise<string[]> {
    const userRoles = await this.getUserRoles(userId)
    const permissions = new Set<string>()
    
    userRoles.forEach(role => {
      role.permissions.forEach(permission => permissions.add(permission))
    })
    
    return Array.from(permissions)
  },

  // Role Hierarchy
  async getRoleHierarchy(): Promise<Role[]> {
    const { data, error } = await supabase
      .from('roles')
      .select('*')
      .order('level', { ascending: true })

    if (error) throw error
    return data || []
  },

  async canAssignRole(assignerId: string, targetRoleId: string): Promise<boolean> {
    const assignerRoles = await this.getUserRoles(assignerId)
    const { data: targetRole, error } = await supabase
      .from('roles')
      .select('level')
      .eq('id', targetRoleId)
      .single()

    if (error) return false

    const assignerMaxLevel = Math.max(...assignerRoles.map(role => role.level))
    return assignerMaxLevel > (targetRole?.level || 0)
  },

  // Audit Functions
  async logRoleChange(userId: string, action: string, details: any): Promise<void> {
    const { error } = await supabase
      .from('role_audit_logs')
      .insert({
        user_id: userId,
        action,
        details,
        timestamp: new Date().toISOString(),
      })

    if (error) console.error('Failed to log role change:', error)
  },

  // Context-aware permissions
  async hasContextPermission(
    userId: string, 
    resource: string, 
    action: string, 
    context: Record<string, any>
  ): Promise<boolean> {
    // Basic permission check first
    const hasBasicPermission = await this.hasPermission(userId, resource, action)
    if (!hasBasicPermission) return false

    // Add context-specific logic here
    // For example, check if user owns the resource or is in the same organization
    if (context.ownerId && context.ownerId === userId) {
      return true
    }

    if (context.organizationId) {
      // Check if user belongs to the same organization
      const { data, error } = await supabase
        .from('user_organizations')
        .select('id')
        .eq('user_id', userId)
        .eq('organization_id', context.organizationId)
        .single()

      return !error && !!data
    }

    return true
  },
}