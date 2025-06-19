import React from 'react';
import { useRouter } from 'next/router';
import { useAuth } from '@/providers/AuthProvider';
import { usePermissions, PERMISSIONS, ROLES } from '@/lib/permissions';
import { AlertCircle, Shield } from 'lucide-react';
import { Card, CardContent } from './Card';
import { Button } from './Button';

interface ProtectedRouteProps {
  children: React.ReactNode;
  requiredPermissions?: string[];
  requiredRoles?: string[];
  requireAny?: boolean; // If true, user needs ANY of the permissions/roles, not ALL
  fallback?: React.ReactNode;
}

export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({
  children,
  requiredPermissions = [],
  requiredRoles = [],
  requireAny = false,
  fallback
}) => {
  const { user, loading: authLoading } = useAuth();
  const { hasPermission, hasRole, hasAnyPermission, hasAnyRole, loading: permissionsLoading } = usePermissions(user?.id);
  const router = useRouter();

  // Show loading while checking auth and permissions
  if (authLoading || permissionsLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary"></div>
      </div>
    );
  }

  // Redirect to signin if not authenticated
  if (!user) {
    router.push('/auth/signin');
    return null;
  }

  // Check permissions
  const hasRequiredPermissions = () => {
    if (requiredPermissions.length === 0) return true;
    
    if (requireAny) {
      return hasAnyPermission(requiredPermissions);
    } else {
      return requiredPermissions.every(permission => hasPermission(permission));
    }
  };

  // Check roles
  const hasRequiredRoles = () => {
    if (requiredRoles.length === 0) return true;
    
    if (requireAny) {
      return hasAnyRole(requiredRoles);
    } else {
      return requiredRoles.every(role => hasRole(role));
    }
  };

  // Check if user has required access
  const hasAccess = hasRequiredPermissions() && hasRequiredRoles();

  if (!hasAccess) {
    if (fallback) {
      return <>{fallback}</>;
    }

    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <Card className="max-w-md">
          <CardContent className="p-8 text-center">
            <div className="w-16 h-16 bg-red-100 dark:bg-red-900 rounded-full flex items-center justify-center mx-auto mb-4">
              <Shield className="h-8 w-8 text-red-600 dark:text-red-400" />
            </div>
            <h2 className="text-2xl font-bold mb-2">غير مصرح بالدخول</h2>
            <p className="text-muted-foreground mb-6">
              ليس لديك الصلاحيات المطلوبة للوصول إلى هذه الصفحة
            </p>
            <div className="space-y-2 text-sm text-muted-foreground mb-6">
              {requiredPermissions.length > 0 && (
                <div>
                  <strong>الصلاحيات المطلوبة:</strong>
                  <ul className="list-disc list-inside mt-1">
                    {requiredPermissions.map(permission => (
                      <li key={permission}>{permission}</li>
                    ))}
                  </ul>
                </div>
              )}
              {requiredRoles.length > 0 && (
                <div>
                  <strong>الأدوار المطلوبة:</strong>
                  <ul className="list-disc list-inside mt-1">
                    {requiredRoles.map(role => (
                      <li key={role}>{role}</li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
            <div className="flex gap-4">
              <Button
                variant="outline"
                onClick={() => router.back()}
                className="flex-1"
              >
                العودة
              </Button>
              <Button
                onClick={() => router.push('/dashboard')}
                className="flex-1"
              >
                لوحة التحكم
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return <>{children}</>;
};

// Convenience components for common permission checks
export const AdminRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <ProtectedRoute requiredRoles={[ROLES.SUPER_ADMIN, ROLES.ADMIN]} requireAny>
    {children}
  </ProtectedRoute>
);

export const PremiumRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <ProtectedRoute requiredRoles={[ROLES.SUPER_ADMIN, ROLES.ADMIN, ROLES.PREMIUM_USER]} requireAny>
    {children}
  </ProtectedRoute>
);

export const SignalsCreateRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <ProtectedRoute requiredPermissions={[PERMISSIONS.SIGNALS_CREATE]}>
    {children}
  </ProtectedRoute>
);

export const UsersManageRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <ProtectedRoute requiredPermissions={[PERMISSIONS.USERS_MANAGE]}>
    {children}
  </ProtectedRoute>
);