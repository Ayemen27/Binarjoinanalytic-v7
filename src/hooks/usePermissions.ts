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
    if (!user) return null;
    
    // استخراج الدور من metadata المستخدم أو email
    const userMetadata = user.user_metadata || {};
    const assignedRole = userMetadata.role;
    
    if (assignedRole) return assignedRole;
    
    // فحص البريد الإلكتروني لتحديد الدور
    if (user.email?.includes('admin')) return 'admin';
    if (user.email?.includes('mod')) return 'moderator';
    if (user.email?.includes('viewer')) return 'viewer';
    
    // الدور الافتراضي
    return 'trader';
  }, [user]);

  const hasPermission = (permission: string | Permission): boolean => {
    if (!session || !user) return false;

    // المديرون لديهم جميع الصلاحيات
    if (userRole === 'admin') return true;
    
    // تحديد الصلاحيات بناءً على الدور
    const rolePermissions: Record<string, string[]> = {
      admin: ['*'], // جميع الصلاحيات
      moderator: [
        'signals.view', 'signals.moderate', 'dashboard.view', 
        'users.view', 'reports.manage'
      ],
      trader: [
        'signals.generate', 'signals.view', 'dashboard.view'
      ],
      viewer: [
        'signals.view', 'dashboard.view'
      ]
    };

    const userPermissions = rolePermissions[userRole || 'viewer'] || [];
    
    // فحص الصلاحية المطلوبة
    if (typeof permission === 'string') {
      // إذا كان لدى المستخدم صلاحية شاملة
      if (userPermissions.includes('*')) return true;
      
      // فحص الصلاحية المحددة
      if (userPermissions.includes(permission)) return true;
      
      // فحص الصلاحيات المشتقة
      const permissionParts = permission.split('.');
      if (permissionParts.length === 2) {
        const [resource, action] = permissionParts;
        
        // صلاحيات خاصة بالإدارة
        if (permission.startsWith('users.') || permission.startsWith('roles.')) {
          return userRole === 'admin';
        }
        
        // صلاحيات المشرفين
        if (permission === 'signals.moderate') {
          return userRole === 'admin' || userRole === 'moderator';
        }
      }
      
      return false;
    }

    // فحص الصلاحيات المعقدة (Object-based)
    const { resource, action } = permission;
    const permissionString = `${resource}.${action}`;
    
    return hasPermission(permissionString);
  };

  const hasAnyPermission = (permissions: (string | Permission)[]): boolean => {
    return permissions.some(permission => hasPermission(permission));
  };

  const hasAllPermissions = (permissions: (string | Permission)[]): boolean => {
    return permissions.every(permission => hasPermission(permission));
  };

  const isAdmin = userRole === 'admin';
  const isModerator = userRole === 'moderator';
  const isUser = userRole === 'trader' || userRole === 'viewer';

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