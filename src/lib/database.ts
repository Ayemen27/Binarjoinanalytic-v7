// Database utility functions and types
import { supabase } from './supabase';

// Database interfaces matching the created tables
export interface Profile {
  id: string;
  user_id: string;
  full_name?: string;
  avatar_url?: string;
  phone_number?: string;
  country_code: string;
  preferred_language: string;
  timezone: string;
  email_verified: boolean;
  phone_verified: boolean;
  two_factor_enabled: boolean;
  notification_preferences: any;
  trading_preferences: any;
  subscription_plan: string;
  subscription_expires_at?: string;
  total_signals_generated: number;
  successful_signals: number;
  total_profit_loss: number;
  created_at: string;
  updated_at: string;
}

export interface Signal {
  id: string;
  user_id: string;
  signal_type: 'buy' | 'sell' | 'hold';
  symbol: string;
  timeframe: '1m' | '5m' | '15m' | '30m' | '1h' | '4h' | '1d' | '1w';
  direction: 'buy' | 'sell';
  entry_price?: number;
  target_price?: number;
  stop_loss?: number;
  confidence_score?: number;
  technical_analysis?: any;
  ai_analysis?: any;
  status: 'pending' | 'active' | 'completed' | 'cancelled' | 'expired';
  result_price?: number;
  profit_loss_percentage?: number;
  ai_model_version?: string;
  market_conditions?: any;
  risk_level: 'low' | 'medium' | 'high';
  expires_at?: string;
  completed_at?: string;
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

// Database functions
export class DatabaseService {
  // Profile operations
  static async getProfile(userId: string): Promise<Profile | null> {
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('user_id', userId)
      .single();

    if (error) {
      console.error('Error fetching profile:', error);
      return null;
    }

    return data;
  }

  static async createProfile(profile: Partial<Profile>): Promise<Profile | null> {
    const { data, error } = await supabase
      .from('profiles')
      .insert([profile])
      .select()
      .single();

    if (error) {
      console.error('Error creating profile:', error);
      return null;
    }

    return data;
  }

  static async updateProfile(userId: string, updates: Partial<Profile>): Promise<Profile | null> {
    const { data, error } = await supabase
      .from('profiles')
      .update({ ...updates, updated_at: new Date().toISOString() })
      .eq('user_id', userId)
      .select()
      .single();

    if (error) {
      console.error('Error updating profile:', error);
      return null;
    }

    return data;
  }

  // Signal operations
  static async getSignals(userId?: string, limit = 50): Promise<Signal[]> {
    let query = supabase
      .from('signals')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(limit);

    if (userId) {
      query = query.eq('user_id', userId);
    }

    const { data, error } = await query;

    if (error) {
      console.error('Error fetching signals:', error);
      return [];
    }

    return data || [];
  }

  static async getSignal(id: string): Promise<Signal | null> {
    const { data, error } = await supabase
      .from('signals')
      .select('*')
      .eq('id', id)
      .single();

    if (error) {
      console.error('Error fetching signal:', error);
      return null;
    }

    return data;
  }

  static async createSignal(signal: Partial<Signal>): Promise<Signal | null> {
    const { data, error } = await supabase
      .from('signals')
      .insert([signal])
      .select()
      .single();

    if (error) {
      console.error('Error creating signal:', error);
      return null;
    }

    return data;
  }

  static async updateSignal(id: string, updates: Partial<Signal>): Promise<Signal | null> {
    const { data, error } = await supabase
      .from('signals')
      .update({ ...updates, updated_at: new Date().toISOString() })
      .eq('id', id)
      .select()
      .single();

    if (error) {
      console.error('Error updating signal:', error);
      return null;
    }

    return data;
  }

  // Analytics functions
  static async getUserStats(userId: string) {
    const { data: profile } = await supabase
      .from('profiles')
      .select('total_signals_generated, successful_signals, total_profit_loss')
      .eq('user_id', userId)
      .single();

    const { data: signals } = await supabase
      .from('signals')
      .select('status, profit_loss_percentage')
      .eq('user_id', userId);

    const activeSignals = signals?.filter(s => s.status === 'active').length || 0;
    const successRate = profile?.total_signals_generated 
      ? (profile.successful_signals / profile.total_signals_generated) * 100 
      : 0;

    return {
      totalSignals: profile?.total_signals_generated || 0,
      successfulSignals: profile?.successful_signals || 0,
      totalProfitLoss: profile?.total_profit_loss || 0,
      activeSignals,
      successRate: Math.round(successRate)
    };
  }

  // Role and permission operations
  static async getUserRoles(userId: string): Promise<Role[]> {
    const { data, error } = await supabase
      .from('user_roles')
      .select(`
        roles (
          id,
          name,
          display_name,
          description,
          level
        )
      `)
      .eq('user_id', userId)
      .eq('is_active', true);

    if (error) {
      console.error('Error fetching user roles:', error);
      return [];
    }

    return data?.map(item => item.roles).flat() || [];
  }

  static async getUserPermissions(userId: string): Promise<Permission[]> {
    const { data, error } = await supabase
      .from('user_roles')
      .select(`
        roles!inner (
          role_permissions!inner (
            permissions (
              id,
              name,
              display_name,
              resource,
              action,
              category
            )
          )
        )
      `)
      .eq('user_id', userId)
      .eq('is_active', true);

    if (error) {
      console.error('Error fetching user permissions:', error);
      return [];
    }

    const permissions: Permission[] = [];
    data?.forEach(userRole => {
      userRole.roles?.role_permissions?.forEach(rolePermission => {
        if (rolePermission.permissions) {
          permissions.push(rolePermission.permissions);
        }
      });
    });

    // Remove duplicates
    return permissions.filter((permission, index, self) => 
      index === self.findIndex(p => p.id === permission.id)
    );
  }
}