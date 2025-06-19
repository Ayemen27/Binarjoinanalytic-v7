import React, { useEffect } from 'react';
import { useRouter } from 'next/router';
import { useAuth } from '@/providers/AuthProvider';
import { Button } from '@/components/atoms/Button';
import { Card } from '@/components/atoms/Card';
import { Loader2, Lock, Shield } from 'lucide-react';

interface ProtectedRouteProps {
  children: React.ReactNode;
  fallback?: React.ReactNode;
  redirectTo?: string;
  requireAuth?: boolean;
  requiredPermissions?: string[];
  fallbackComponent?: 'login' | 'unauthorized' | 'loading';
}

export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({
  children,
  fallback,
  redirectTo = '/auth/login',
  requireAuth = true,
  requiredPermissions = [],
  fallbackComponent = 'login',
}) => {
  const { user, session, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && requireAuth && !session) {
      router.push(redirectTo);
    }
  }, [loading, session, requireAuth, redirectTo, router]);

  // Show loading state
  if (loading) {
    if (fallback) return <>{fallback}</>;
    return <LoadingComponent />;
  }

  // Check authentication
  if (requireAuth && !session) {
    if (fallback) return <>{fallback}</>;
    
    switch (fallbackComponent) {
      case 'unauthorized':
        return <UnauthorizedComponent />;
      case 'loading':
        return <LoadingComponent />;
      default:
        return <LoginRequiredComponent redirectTo={redirectTo} />;
    }
  }

  // Check permissions (placeholder for future RBAC implementation)
  if (requiredPermissions.length > 0) {
    // TODO: Implement permission checking when RBAC is ready
    // For now, allow all authenticated users
    console.log('Permission check needed for:', requiredPermissions);
  }

  // Render protected content
  return <>{children}</>;
};

const LoadingComponent: React.FC = () => (
  <div className="min-h-screen bg-gradient-to-br from-background via-background to-primary/5 flex items-center justify-center">
    <div className="text-center">
      <Loader2 className="w-8 h-8 animate-spin text-primary mx-auto mb-4" />
      <p className="text-muted-foreground">جاري التحقق من صحة الجلسة...</p>
    </div>
  </div>
);

const UnauthorizedComponent: React.FC = () => (
  <div className="min-h-screen bg-gradient-to-br from-background via-background to-primary/5 flex items-center justify-center p-4">
    <Card className="p-8 text-center max-w-md w-full">
      <div className="w-16 h-16 bg-destructive/10 rounded-full flex items-center justify-center mx-auto mb-6">
        <Shield className="w-8 h-8 text-destructive" />
      </div>
      
      <h1 className="text-2xl font-bold text-foreground mb-4">
        غير مصرح بالوصول
      </h1>
      
      <p className="text-muted-foreground mb-6">
        ليس لديك الصلاحيات اللازمة للوصول إلى هذه الصفحة.
      </p>
      
      <div className="space-y-3">
        <Button 
          onClick={() => window.history.back()}
          fullWidth
        >
          العودة للصفحة السابقة
        </Button>
        
        <Button 
          variant="outline"
          onClick={() => window.location.href = '/'}
          fullWidth
        >
          الذهاب للصفحة الرئيسية
        </Button>
      </div>
    </Card>
  </div>
);

interface LoginRequiredComponentProps {
  redirectTo: string;
}

const LoginRequiredComponent: React.FC<LoginRequiredComponentProps> = ({ redirectTo }) => (
  <div className="min-h-screen bg-gradient-to-br from-background via-background to-primary/5 flex items-center justify-center p-4">
    <Card className="p-8 text-center max-w-md w-full">
      <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-6">
        <Lock className="w-8 h-8 text-primary" />
      </div>
      
      <h1 className="text-2xl font-bold text-foreground mb-4">
        تسجيل الدخول مطلوب
      </h1>
      
      <p className="text-muted-foreground mb-6">
        يجب تسجيل الدخول للوصول إلى هذه الصفحة.
      </p>
      
      <div className="space-y-3">
        <Button 
          onClick={() => window.location.href = redirectTo}
          fullWidth
        >
          تسجيل الدخول
        </Button>
        
        <Button 
          variant="outline"
          onClick={() => window.location.href = '/auth/register'}
          fullWidth
        >
          إنشاء حساب جديد
        </Button>
        
        <Button 
          variant="ghost"
          onClick={() => window.location.href = '/'}
          fullWidth
        >
          العودة للصفحة الرئيسية
        </Button>
      </div>
    </Card>
  </div>
);

export default ProtectedRoute;