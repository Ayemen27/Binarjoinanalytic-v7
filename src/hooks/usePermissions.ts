import { useMemo } from 'react';
import { useAuth } from '@/providers/AuthProvider';

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

  const userRole = useMemo(() => {
    // Placeholder until RBAC is implemented
    // This will be replaced with actual role lookup from database
    if (!user) return null;
    
    // For now, check if user email indicates admin role
    if (user.email?.includes('admin')) return 'admin';
    if (user.email?.includes('mod')) return 'moderator';
    return 'user';
  }, [user]);

  const hasPermission = (permission: string | Permission): boolean => {
    if (!session || !user) return false;

    // Placeholder implementation
    // TODO: Replace with actual RBAC permission checking
    
    if (typeof permission === 'string') {
      // Simple string-based permission check
      switch (permission) {
        case 'dashboard.view':
          return true; // All authenticated users can view dashboard
        case 'signals.generate':
          return true; // All authenticated users can generate signals
        case 'signals.view':
          return true; // All authenticated users can view signals
        case 'admin.users.manage':
          return userRole === 'admin';
        case 'admin.roles.manage':
          return userRole === 'admin';
        case 'admin.system.configure':
          return userRole === 'admin';
        case 'mod.signals.moderate':
          return userRole === 'admin' || userRole === 'moderator';
        default:
          return false;
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