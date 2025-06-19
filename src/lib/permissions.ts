// Permission management system
import { supabase } from './supabase';

export interface UserPermissions {
  userId: string;
  permissions: string[];
  roles: string[];
}

export class PermissionService {
  private static cache = new Map<string, UserPermissions>();
  private static cacheExpiry = new Map<string, number>();
  private static readonly CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

  static async getUserPermissions(userId: string): Promise<UserPermissions> {
    // Check cache first
    const cached = this.cache.get(userId);
    const expiry = this.cacheExpiry.get(userId);
    
    if (cached && expiry && Date.now() < expiry) {
      return cached;
    }

    try {
      // Get user roles and permissions
      const { data, error } = await supabase
        .from('user_roles')
        .select(`
          roles!inner (
            id,
            name,
            role_permissions!inner (
              permissions (
                name
              )
            )
          )
        `)
        .eq('user_id', userId)
        .eq('is_active', true);

      if (error) throw error;

      const roles: string[] = [];
      const permissions: string[] = [];

      data?.forEach(userRole => {
        const role = userRole.roles;
        if (role) {
          roles.push(role.name);
          role.role_permissions?.forEach(rp => {
            if (rp.permissions?.name && !permissions.includes(rp.permissions.name)) {
              permissions.push(rp.permissions.name);
            }
          });
        }
      });

      const userPermissions: UserPermissions = {
        userId,
        permissions,
        roles
      };

      // Cache the result
      this.cache.set(userId, userPermissions);
      this.cacheExpiry.set(userId, Date.now() + this.CACHE_DURATION);

      return userPermissions;
    } catch (error) {
      console.error('Error fetching user permissions:', error);
      return { userId, permissions: [], roles: [] };
    }
  }

  static async hasPermission(userId: string, permission: string): Promise<boolean> {
    const userPermissions = await this.getUserPermissions(userId);
    return userPermissions.permissions.includes(permission);
  }

  static async hasAnyPermission(userId: string, permissions: string[]): Promise<boolean> {
    const userPermissions = await this.getUserPermissions(userId);
    return permissions.some(permission => userPermissions.permissions.includes(permission));
  }

  static async hasRole(userId: string, role: string): Promise<boolean> {
    const userPermissions = await this.getUserPermissions(userId);
    return userPermissions.roles.includes(role);
  }

  static async hasAnyRole(userId: string, roles: string[]): Promise<boolean> {
    const userPermissions = await this.getUserPermissions(userId);
    return roles.some(role => userPermissions.roles.includes(role));
  }

  static async isAdmin(userId: string): Promise<boolean> {
    return this.hasAnyRole(userId, ['super_admin', 'admin']);
  }

  static async assignRoleToUser(userId: string, roleId: string, assignedBy: string): Promise<boolean> {
    try {
      const { error } = await supabase
        .from('user_roles')
        .insert([{
          user_id: userId,
          role_id: roleId,
          assigned_by: assignedBy,
          is_active: true
        }]);

      if (error) throw error;

      // Clear cache for this user
      this.clearUserCache(userId);
      return true;
    } catch (error) {
      console.error('Error assigning role:', error);
      return false;
    }
  }

  static async removeRoleFromUser(userId: string, roleId: string): Promise<boolean> {
    try {
      const { error } = await supabase
        .from('user_roles')
        .update({ is_active: false })
        .eq('user_id', userId)
        .eq('role_id', roleId);

      if (error) throw error;

      // Clear cache for this user
      this.clearUserCache(userId);
      return true;
    } catch (error) {
      console.error('Error removing role:', error);
      return false;
    }
  }

  static clearUserCache(userId: string): void {
    this.cache.delete(userId);
    this.cacheExpiry.delete(userId);
  }

  static clearAllCache(): void {
    this.cache.clear();
    this.cacheExpiry.clear();
  }
}

// React hook for permissions
export function usePermissions(userId?: string) {
  const [permissions, setPermissions] = React.useState<UserPermissions>({
    userId: userId || '',
    permissions: [],
    roles: []
  });
  const [loading, setLoading] = React.useState(true);

  React.useEffect(() => {
    if (!userId) {
      setLoading(false);
      return;
    }

    const loadPermissions = async () => {
      setLoading(true);
      try {
        const userPermissions = await PermissionService.getUserPermissions(userId);
        setPermissions(userPermissions);
      } catch (error) {
        console.error('Error loading permissions:', error);
      } finally {
        setLoading(false);
      }
    };

    loadPermissions();
  }, [userId]);

  const hasPermission = (permission: string) => {
    return permissions.permissions.includes(permission);
  };

  const hasAnyPermission = (permissionList: string[]) => {
    return permissionList.some(permission => permissions.permissions.includes(permission));
  };

  const hasRole = (role: string) => {
    return permissions.roles.includes(role);
  };

  const hasAnyRole = (roleList: string[]) => {
    return roleList.some(role => permissions.roles.includes(role));
  };

  const isAdmin = () => {
    return hasAnyRole(['super_admin', 'admin']);
  };

  return {
    permissions: permissions.permissions,
    roles: permissions.roles,
    loading,
    hasPermission,
    hasAnyPermission,
    hasRole,
    hasAnyRole,
    isAdmin
  };
}

// Permission constants
export const PERMISSIONS = {
  // Signals permissions
  SIGNALS_CREATE: 'signals.create',
  SIGNALS_VIEW: 'signals.view',
  SIGNALS_EDIT: 'signals.edit',
  SIGNALS_DELETE: 'signals.delete',
  
  // User management permissions
  USERS_MANAGE: 'users.manage',
  
  // Analytics permissions
  ANALYTICS_VIEW: 'analytics.view',
  
  // Settings permissions
  SETTINGS_MANAGE: 'settings.manage'
} as const;

export const ROLES = {
  SUPER_ADMIN: 'super_admin',
  ADMIN: 'admin',
  PREMIUM_USER: 'premium_user',
  FREE_USER: 'free_user'
} as const;