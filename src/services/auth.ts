import { supabase } from '@/lib/supabase'
import type { User } from '@/types'

export const authService = {
  // Sign up with email and password
  async signUp(email: string, password: string, userData?: Partial<User>) {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: userData,
      },
    })

    if (error) throw error
    return data
  },

  // Sign in with email and password
  async signIn(email: string, password: string) {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    })

    if (error) throw error
    return data
  },

  // Sign in with OAuth
  async signInWithOAuth(provider: 'google' | 'github' | 'apple') {
    const { data, error } = await supabase.auth.signInWithOAuth({
      provider,
      options: {
        redirectTo: `${window.location.origin}/auth/callback`,
      },
    })

    if (error) throw error
    return data
  },

  // Sign out
  async signOut() {
    const { error } = await supabase.auth.signOut()
    if (error) throw error
  },

  // Reset password
  async resetPassword(email: string) {
    const { data, error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/auth/reset-password`,
    })

    if (error) throw error
    return data
  },

  // Update password
  async updatePassword(password: string) {
    const { data, error } = await supabase.auth.updateUser({
      password,
    })

    if (error) throw error
    return data
  },

  // Get current session
  async getSession() {
    const { data, error } = await supabase.auth.getSession()
    if (error) throw error
    return data.session
  },

  // Get current user
  async getCurrentUser() {
    const { data, error } = await supabase.auth.getUser()
    if (error) throw error
    return data.user
  },

  // Update user profile
  async updateProfile(updates: Partial<User>) {
    const { data, error } = await supabase.auth.updateUser({
      data: updates,
    })

    if (error) throw error
    return data
  },

  // Enable 2FA
  async enable2FA() {
    // Implementation will depend on your 2FA setup
    // This is a placeholder for the actual implementation
    throw new Error('2FA implementation needed')
  },

  // Verify 2FA
  async verify2FA(token: string) {
    // Implementation will depend on your 2FA setup
    // This is a placeholder for the actual implementation
    throw new Error('2FA verification implementation needed')
  },
}