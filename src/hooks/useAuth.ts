import { useState, useEffect } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { authService } from '@/services/auth'
import { supabase } from '@/lib/supabase'
import type { User } from '@/types'
import { useToast } from './useToast'

export const useAuth = () => {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)
  const queryClient = useQueryClient()
  const { toast } = useToast()

  // Get current session
  const { data: session } = useQuery({
    queryKey: ['auth', 'session'],
    queryFn: authService.getSession,
    staleTime: 5 * 60 * 1000,
  })

  // Sign in mutation
  const signInMutation = useMutation({
    mutationFn: ({ email, password }: { email: string; password: string }) =>
      authService.signIn(email, password),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['auth'] })
      toast({
        title: 'تم تسجيل الدخول بنجاح',
        variant: 'success',
      })
    },
    onError: (error: any) => {
      toast({
        title: 'خطأ في تسجيل الدخول',
        description: error.message,
        variant: 'destructive',
      })
    },
  })

  // Sign up mutation
  const signUpMutation = useMutation({
    mutationFn: ({ email, password, userData }: { 
      email: string; 
      password: string; 
      userData?: Partial<User> 
    }) => authService.signUp(email, password, userData),
    onSuccess: () => {
      toast({
        title: 'تم إنشاء الحساب بنجاح',
        description: 'يرجى التحقق من بريدك الإلكتروني',
        variant: 'success',
      })
    },
    onError: (error: any) => {
      toast({
        title: 'خطأ في إنشاء الحساب',
        description: error.message,
        variant: 'destructive',
      })
    },
  })

  // Sign out mutation
  const signOutMutation = useMutation({
    mutationFn: authService.signOut,
    onSuccess: () => {
      setUser(null)
      queryClient.clear()
      toast({
        title: 'تم تسجيل الخروج بنجاح',
        variant: 'success',
      })
    },
  })

  // OAuth sign in mutation
  const oauthSignInMutation = useMutation({
    mutationFn: (provider: 'google' | 'github' | 'apple') =>
      authService.signInWithOAuth(provider),
    onError: (error: any) => {
      toast({
        title: 'خطأ في تسجيل الدخول',
        description: error.message,
        variant: 'destructive',
      })
    },
  })

  // Reset password mutation
  const resetPasswordMutation = useMutation({
    mutationFn: (email: string) => authService.resetPassword(email),
    onSuccess: () => {
      toast({
        title: 'تم إرسال رابط إعادة تعيين كلمة المرور',
        description: 'يرجى التحقق من بريدك الإلكتروني',
        variant: 'success',
      })
    },
    onError: (error: any) => {
      toast({
        title: 'خطأ في إرسال رابط إعادة التعيين',
        description: error.message,
        variant: 'destructive',
      })
    },
  })

  // Listen to auth state changes
  useEffect(() => {
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (session?.user) {
        // Fetch user profile from your users table
        const { data: userProfile } = await supabase
          .from('users')
          .select('*')
          .eq('id', session.user.id)
          .single()
        
        setUser(userProfile)
      } else {
        setUser(null)
      }
      setLoading(false)
    })

    return () => subscription.unsubscribe()
  }, [])

  return {
    user,
    loading,
    session,
    signIn: signInMutation.mutate,
    signUp: signUpMutation.mutate,
    signOut: signOutMutation.mutate,
    signInWithOAuth: oauthSignInMutation.mutate,
    resetPassword: resetPasswordMutation.mutate,
    isSigningIn: signInMutation.isPending,
    isSigningUp: signUpMutation.isPending,
    isSigningOut: signOutMutation.isPending,
  }
}