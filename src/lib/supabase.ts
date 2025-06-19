import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

// Database types
export interface Database {
  public: {
    Tables: {
      users: {
        Row: {
          id: string
          email: string
          full_name: string | null
          avatar_url: string | null
          preferred_language: string
          timezone: string
          phone_number: string | null
          country_code: string | null
          email_verified: boolean
          phone_verified: boolean
          two_factor_enabled: boolean
          risk_score: number
          last_login_at: string | null
          metadata: Record<string, any>
          created_at: string
          updated_at: string
        }
        Insert: {
          id: string
          email: string
          full_name?: string | null
          avatar_url?: string | null
          preferred_language?: string
          timezone?: string
          phone_number?: string | null
          country_code?: string | null
          email_verified?: boolean
          phone_verified?: boolean
          two_factor_enabled?: boolean
          risk_score?: number
          metadata?: Record<string, any>
        }
        Update: {
          full_name?: string | null
          avatar_url?: string | null
          preferred_language?: string
          timezone?: string
          phone_number?: string | null
          country_code?: string | null
          email_verified?: boolean
          phone_verified?: boolean
          two_factor_enabled?: boolean
          risk_score?: number
          metadata?: Record<string, any>
          updated_at?: string
        }
      }
      signals: {
        Row: {
          id: string
          symbol: string
          signal_type: 'call' | 'put'
          entry_price: number
          target_price: number
          stop_loss: number
          expiry_time: string
          confidence_score: number
          ai_analysis: Record<string, any>
          status: 'pending' | 'active' | 'won' | 'lost' | 'expired'
          created_at: string
          updated_at: string
        }
        Insert: {
          symbol: string
          signal_type: 'call' | 'put'
          entry_price: number
          target_price: number
          stop_loss: number
          expiry_time: string
          confidence_score: number
          ai_analysis?: Record<string, any>
          status?: 'pending' | 'active' | 'won' | 'lost' | 'expired'
        }
        Update: {
          status?: 'pending' | 'active' | 'won' | 'lost' | 'expired'
          updated_at?: string
        }
      }
      subscriptions: {
        Row: {
          id: string
          user_id: string
          plan_id: string
          status: 'trial' | 'active' | 'canceled' | 'paused'
          start_date: string
          end_date: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          user_id: string
          plan_id: string
          status?: 'trial' | 'active' | 'canceled' | 'paused'
          start_date?: string
          end_date?: string | null
        }
        Update: {
          status?: 'trial' | 'active' | 'canceled' | 'paused'
          end_date?: string | null
          updated_at?: string
        }
      }
    }
  }
}