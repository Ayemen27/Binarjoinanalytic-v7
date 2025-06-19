import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables');
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: true
  }
});

// Database types
export interface User {
  id: string;
  email: string;
  full_name?: string;
  avatar_url?: string;
  phone_number?: string;
  preferred_language?: string;
  timezone?: string;
  email_verified?: boolean;
  phone_verified?: boolean;
  two_factor_enabled?: boolean;
  metadata?: any;
  created_at: string;
  updated_at: string;
}

export interface Profile {
  id: string;
  user_id: string;
  full_name?: string;
  avatar_url?: string;
  phone_number?: string;
  country_code?: string;
  preferred_language: string;
  timezone: string;
  notification_preferences?: any;
  trading_preferences?: any;
  created_at: string;
  updated_at: string;
}

export interface Signal {
  id: string;
  user_id: string;
  signal_type: string;
  symbol: string;
  timeframe: string;
  direction: 'buy' | 'sell';
  entry_price?: number;
  target_price?: number;
  stop_loss?: number;
  confidence_score: number;
  technical_analysis?: any;
  ai_analysis?: any;
  status: 'pending' | 'active' | 'completed' | 'cancelled';
  result_price?: number;
  profit_loss_percentage?: number;
  ai_model_version?: string;
  created_at: string;
  updated_at: string;
}

export interface Role {
  id: string;
  name: string;
  display_name: any;
  description?: any;
  parent_role_id?: string;
  level: number;
  is_system_role: boolean;
  is_active: boolean;
  created_at: string;
}

export interface Permission {
  id: string;
  name: string;
  display_name: any;
  resource: string;
  action: string;
  conditions?: any;
  category?: string;
  created_at: string;
}