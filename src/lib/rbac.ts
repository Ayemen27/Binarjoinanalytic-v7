import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';

export interface Role {
  id: string;
  name: string;
  display_name: Record<string, string>;
  description?: Record<string, string>;
  parent_role_id?: string;
  level: number;
  is_system_role: boolean;
  is_active: boolean;
  metadata: Record<string, any>;
  created_at: string;
  updated_at: string;
}

export interface Permission {
  id: string;
  name: string;
  display_name: Record<string, string>;
  resource: string;
  action: string;
  conditions: Record<string, any>;
  description?: Record<string, string>;
  category: string;
  is_system_permission: boolean;
  created_at: string;
}

export interface UserRole {
  id: string;
  user_id: string;
  role_id: string;
  assigned_by?: string;
  context: Record<string, any>;
  assigned_at: string;
  expires_at?: string;
  is_active: boolean;
  role?: Role;
}

export interface RolePermission {
  id: string;
  role_id: string;
  permission_id: string;
  granted_by?: string;
  conditions: Record<string, any>;
  granted_at: string;
  expires_at?: string;
  permission?: Permission;
}

export class RBACService {
  private supabase = createClientComponentClient();

  // User Roles Management
  async getUserRoles(userId: string): Promise<UserRole[]> {
    const { data, error } = await this.supabase
      .from('user_roles')
      .select(`
        *,
        role:roles(*)
      `)
      .eq('user_id', userId)
      .eq('is_active', true);

    if (error) throw error;
    return data || [];
  }

  async assignRoleToUser(userId: string, roleId: string, assignedBy?: string): Promise<UserRole> {
    const { data, error } = await this.supabase
      .from('user_roles')
      .insert({
        user_id: userId,
        role_id: roleId,
        assigned_by: assignedBy,
      })
      .select('*')
      .single();

    if (error) throw error;
    return data;
  }

  async removeRoleFromUser(userId: string, roleId: string): Promise<void> {
    const { error } = await this.supabase
      .from('user_roles')
      .update({ is_active: false })
      .eq('user_id', userId)
      .eq('role_id', roleId);

    if (error) throw error;
  }

  // Permission Checking
  async getUserPermissions(userId: string): Promise<Permission[]> {
    const { data, error } = await this.supabase
      .from('user_roles')
      .select(`
        role:roles!inner(
          role_permissions!inner(
            permission:permissions(*)
          )
        )
      `)
      .eq('user_id', userId)
      .eq('is_active', true);

    if (error) throw error;

    const permissions: Permission[] = [];
    data?.forEach((userRole: any) => {
      userRole.role.role_permissions.forEach((rp: any) => {
        if (rp.permission && !permissions.find(p => p.id === rp.permission.id)) {
          permissions.push(rp.permission);
        }
      });
    });

    return permissions;
  }

  async checkPermission(userId: string, permission: string): Promise<boolean> {
    const permissions = await this.getUserPermissions(userId);
    return permissions.some(p => p.name === permission);
  }

  async checkResourcePermission(
    userId: string, 
    resource: string, 
    action: string
  ): Promise<boolean> {
    const permissions = await this.getUserPermissions(userId);
    return permissions.some(p => p.resource === resource && p.action === action);
  }

  // Roles Management
  async getAllRoles(): Promise<Role[]> {
    const { data, error } = await this.supabase
      .from('roles')
      .select('*')
      .eq('is_active', true)
      .order('level');

    if (error) throw error;
    return data || [];
  }

  async createRole(role: Partial<Role>): Promise<Role> {
    const { data, error } = await this.supabase
      .from('roles')
      .insert(role)
      .select('*')
      .single();

    if (error) throw error;
    return data;
  }

  async updateRole(id: string, updates: Partial<Role>): Promise<Role> {
    const { data, error } = await this.supabase
      .from('roles')
      .update({ ...updates, updated_at: new Date().toISOString() })
      .eq('id', id)
      .select('*')
      .single();

    if (error) throw error;
    return data;
  }

  async deleteRole(id: string): Promise<void> {
    const { error } = await this.supabase
      .from('roles')
      .update({ is_active: false })
      .eq('id', id);

    if (error) throw error;
  }

  // Permissions Management
  async getAllPermissions(): Promise<Permission[]> {
    const { data, error } = await this.supabase
      .from('permissions')
      .select('*')
      .order('category', { ascending: true })
      .order('name', { ascending: true });

    if (error) throw error;
    return data || [];
  }

  async getRolePermissions(roleId: string): Promise<RolePermission[]> {
    const { data, error } = await this.supabase
      .from('role_permissions')
      .select(`
        *,
        permission:permissions(*)
      `)
      .eq('role_id', roleId);

    if (error) throw error;
    return data || [];
  }

  async grantPermissionToRole(roleId: string, permissionId: string, grantedBy?: string): Promise<RolePermission> {
    const { data, error } = await this.supabase
      .from('role_permissions')
      .insert({
        role_id: roleId,
        permission_id: permissionId,
        granted_by: grantedBy,
      })
      .select('*')
      .single();

    if (error) throw error;
    return data;
  }

  async revokePermissionFromRole(roleId: string, permissionId: string): Promise<void> {
    const { error } = await this.supabase
      .from('role_permissions')
      .delete()
      .eq('role_id', roleId)
      .eq('permission_id', permissionId);

    if (error) throw error;
  }

  // Audit Logging
  async logPermissionUsage(
    userId: string,
    permissionId: string,
    result: 'allowed' | 'denied',
    resourceId?: string,
    reason?: string
  ): Promise<void> {
    const { error } = await this.supabase
      .from('permission_audit')
      .insert({
        user_id: userId,
        permission_id: permissionId,
        action_type: 'used',
        result,
        resource_id: resourceId,
        reason,
      });

    if (error) console.error('Failed to log permission usage:', error);
  }

  // Helper Methods
  async isUserAdmin(userId: string): Promise<boolean> {
    const roles = await this.getUserRoles(userId);
    return roles.some(ur => ur.role?.name === 'admin' || ur.role?.name === 'super_admin');
  }

  async isUserModerator(userId: string): Promise<boolean> {
    const roles = await this.getUserRoles(userId);
    return roles.some(ur => 
      ur.role?.name === 'moderator' || 
      ur.role?.name === 'admin' || 
      ur.role?.name === 'super_admin'
    );
  }

  async getUserHighestRole(userId: string): Promise<Role | null> {
    const roles = await this.getUserRoles(userId);
    if (roles.length === 0) return null;
    
    // Sort by role level (lower level = higher privilege)
    const sortedRoles = roles.sort((a, b) => (a.role?.level || 999) - (b.role?.level || 999));
    return sortedRoles[0]?.role || null;
  }
}

export const rbacService = new RBACService();