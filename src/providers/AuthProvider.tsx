import React, { createContext, useContext, useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import type { Session, User } from '@supabase/supabase-js';

import { useToast } from '@/hooks/useToast';

interface AuthContextType {
  user: User | null;
  session: Session | null;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (email: string, password: string, metadata?: Record<string, any>) => Promise<void>;
  signOut: () => Promise<void>;
  resetPassword: (email: string) => Promise<void>;
  updateProfile: (updates: Record<string, any>) => Promise<void>;
  refreshSession: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

interface AuthProviderProps {
  children: React.ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();
  const { toast } = useToast();
  const supabase = createClientComponentClient();

  useEffect(() => {
    // Get initial session
    const getInitialSession = async () => {
      try {
        const { data: { session }, error } = await supabase.auth.getSession();
        
        if (error) {
          console.error('Error getting session:', error);
          toast({
            title: 'خطأ في المصادقة',
            description: 'حدث خطأ أثناء التحقق من جلسة المستخدم',
            variant: 'destructive',
          });
        } else {
          setSession(session);
          setUser(session?.user ?? null);
        }
      } catch (error) {
        console.error('Unexpected error during session retrieval:', error);
      } finally {
        setLoading(false);
      }
    };

    getInitialSession();

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        console.log('Auth event:', event, session?.user?.id);
        
        setSession(session);
        setUser(session?.user ?? null);
        setLoading(false);

        // Handle different auth events
        switch (event) {
          case 'SIGNED_IN':
            toast({
              title: 'تم تسجيل الدخول بنجاح',
              description: 'مرحباً بك في المنصة',
              variant: 'default',
            });
            break;
          
          case 'SIGNED_OUT':
            toast({
              title: 'تم تسجيل الخروج',
              description: 'تم تسجيل خروجك بنجاح',
              variant: 'default',
            });
            router.push('/');
            break;
          
          case 'TOKEN_REFRESHED':
            console.log('Token refreshed successfully');
            break;
          
          case 'USER_UPDATED':
            toast({
              title: 'تم تحديث الملف الشخصي',
              description: 'تم حفظ التغييرات بنجاح',
              variant: 'default',
            });
            break;
        }
      }
    );

    return () => {
      subscription.unsubscribe();
    };
  }, [supabase, router, toast]);

  const signIn = async (email: string, password: string) => {
    try {
      setLoading(true);
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        throw error;
      }
    } catch (error: any) {
      console.error('Sign in error:', error);
      toast({
        title: 'خطأ في تسجيل الدخول',
        description: error.message || 'حدث خطأ أثناء تسجيل الدخول',
        variant: 'destructive',
      });
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const signUp = async (email: string, password: string, metadata?: Record<string, any>) => {
    try {
      setLoading(true);
      const { error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: metadata,
        },
      });

      if (error) {
        throw error;
      }

      toast({
        title: 'تم إنشاء الحساب',
        description: 'تحقق من بريدك الإلكتروني لتفعيل الحساب',
        variant: 'default',
      });
    } catch (error: any) {
      console.error('Sign up error:', error);
      toast({
        title: 'خطأ في إنشاء الحساب',
        description: error.message || 'حدث خطأ أثناء إنشاء الحساب',
        variant: 'destructive',
      });
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const signOut = async () => {
    try {
      setLoading(true);
      const { error } = await supabase.auth.signOut();
      
      if (error) {
        throw error;
      }
    } catch (error: any) {
      console.error('Sign out error:', error);
      toast({
        title: 'خطأ في تسجيل الخروج',
        description: error.message || 'حدث خطأ أثناء تسجيل الخروج',
        variant: 'destructive',
      });
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const resetPassword = async (email: string) => {
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/auth/reset-password`,
      });

      if (error) {
        throw error;
      }

      toast({
        title: 'تم إرسال رابط إعادة التعيين',
        description: 'تحقق من بريدك الإلكتروني',
        variant: 'default',
      });
    } catch (error: any) {
      console.error('Reset password error:', error);
      toast({
        title: 'خطأ في إعادة تعيين كلمة المرور',
        description: error.message || 'حدث خطأ أثناء إرسال رابط إعادة التعيين',
        variant: 'destructive',
      });
      throw error;
    }
  };

  const updateProfile = async (updates: Record<string, any>) => {
    try {
      setLoading(true);
      const { error } = await supabase.auth.updateUser({
        data: updates,
      });

      if (error) {
        throw error;
      }
    } catch (error: any) {
      console.error('Update profile error:', error);
      toast({
        title: 'خطأ في تحديث الملف الشخصي',
        description: error.message || 'حدث خطأ أثناء تحديث الملف الشخصي',
        variant: 'destructive',
      });
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const refreshSession = async () => {
    try {
      const { error } = await supabase.auth.refreshSession();
      
      if (error) {
        throw error;
      }
    } catch (error: any) {
      console.error('Refresh session error:', error);
      // Don't show toast for session refresh errors as they're automatic
      throw error;
    }
  };

  const value: AuthContextType = {
    user,
    session,
    loading,
    signIn,
    signUp,
    signOut,
    resetPassword,
    updateProfile,
    refreshSession,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};