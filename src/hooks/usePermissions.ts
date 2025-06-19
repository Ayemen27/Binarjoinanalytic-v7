import { useMemo, useEffect, useState } from 'react';
import { useAuth } from '@/providers/AuthProvider';
import { rbacService } from '@/lib/rbac';

interface Permission {
  resource: string;
  action: string;
  conditions?: Record<string, any>;
}

interface UsePermissionsReturn {
  hasPermission: (permission: string | Permission) => boolean;
  hasAnyPermission: (permissions: (string | Permission)[]) => boolean;
  hasAllPermissions: (permissions: (string | Permission)[]) => boolean;
  userRole: string | null;
  isAdmin: boolean;
  isModerator: boolean;
  isUser: boolean;
}

export const usePermissions = (): UsePermissionsReturn => {
  const { user, session } = useAuth();
  const [userPermissions, setUserPermissions] = useState<string[]>([]);
  const [userRole, setUserRole] = useState<string | null>(null);

  useEffect(() => {
    if (user) {
      // Load user permissions and role from RBAC service
      const loadUserData = async () => {
        try {
          const [permissions, highestRole] = await Promise.all([
            rbacService.getUserPermissions(user.id),
            rbacService.getUserHighestRole(user.id)
          ]);
          
          setUserPermissions(permissions.map(p => p.name));
          setUserRole(highestRole?.name || null);
        } catch (error) {
          console.error('Error loading user permissions:', error);
          // Fallback to email-based role detection
          if (user.email?.includes('admin')) setUserRole('admin');
          else if (user.email?.includes('mod')) setUserRole('moderator');
          else setUserRole('user');
        }
      };
      
      loadUserData();
    }
  }, [user]);

  const hasPermission = (permission: string | Permission): boolean => {
    if (!session || !user) return false;

    if (typeof permission === 'string') {
      // Check if user has this specific permission
      if (userPermissions.includes(permission)) return true;
      
      // Fallback to role-based checks for common permissions
      switch (permission) {
        case 'dashboard.view':
          return true; // All authenticated users can view dashboard
        case 'signals.generate':
        case 'signals.view':
          return userPermissions.includes(permission) || ['user', 'premium_user', 'moderator', 'admin', 'super_admin'].includes(userRole || '');
        case 'users.view':
        case 'users.create':
        case 'users.update':
        case 'users.delete':
        case 'roles.view':
        case 'roles.create':
        case 'roles.update':
        case 'roles.delete':
          return userPermissions.includes(permission) || ['admin', 'super_admin'].includes(userRole || '');
        case 'analytics.view':
          return userPermissions.includes(permission) || ['premium_user', 'moderator', 'admin', 'super_admin'].includes(userRole || '');
        case 'system.configure':
          return userPermissions.includes(permission) || userRole === 'super_admin';
        default:
          return userPermissions.includes(permission);
      }
    }

    // Object-based permission check
    const { resource, action, conditions } = permission;
    
    // Admin has all permissions
    if (userRole === 'admin') return true;
    
    // Resource-specific permission logic
    switch (resource) {
      case 'signals':
        if (action === 'view' || action === 'generate') return true;
        if (action === 'moderate') return userRole === 'moderator';
        return false;
      case 'dashboard':
        return action === 'view';
      case 'users':
        return userRole === 'admin' && action === 'manage';
      case 'roles':
        return userRole === 'admin' && action === 'manage';
      default:
        return false;
    }
  };

  const hasAnyPermission = (permissions: (string | Permission)[]): boolean => {
    return permissions.some(permission => hasPermission(permission));
  };

  const hasAllPermissions = (permissions: (string | Permission)[]): boolean => {
    return permissions.every(permission => hasPermission(permission));
  };

  const isAdmin = userRole === 'admin';
  const isModerator = userRole === 'moderator';
  const isUser = userRole === 'user';

  return {
    hasPermission,
    hasAnyPermission,
    hasAllPermissions,
    userRole,
    isAdmin,
    isModerator,
    isUser,
  };
};

export default usePermissions;