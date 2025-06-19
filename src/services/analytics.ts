import { supabase } from '@/lib/supabase'
import type { PaginatedResponse } from '@/types'

export interface UserAnalytics {
  user_id: string
  total_signals_received: number
  signals_won: number
  signals_lost: number
  win_rate: number
  total_profit_pips: number
  best_performing_symbol: string
  most_active_timeframe: string
  account_age_days: number
  subscription_tier: string
  last_activity_at: string
  preferences: Record<string, any>
  created_at: string
  updated_at: string
}

export interface SystemAnalytics {
  id: string
  metric_name: string
  metric_value: number
  metric_type: 'count' | 'percentage' | 'currency' | 'time'
  period: 'daily' | 'weekly' | 'monthly' | 'yearly'
  date: string
  metadata: Record<string, any>
  created_at: string
}

export interface TradingPerformance {
  id: string
  user_id: string
  symbol: string
  timeframe: string
  total_signals: number
  won_signals: number
  lost_signals: number
  win_rate: number
  total_pips: number
  avg_risk_reward: number
  best_streak: number
  worst_streak: number
  last_signal_at: string
  period_start: string
  period_end: string
  created_at: string
}

export interface UserBehavior {
  id: string
  user_id: string
  action_type: string
  action_data: Record<string, any>
  page_url: string
  session_id: string
  device_type: string
  browser: string
  ip_address: string
  timestamp: string
}

export const analyticsService = {
  // User Analytics
  async getUserAnalytics(userId: string): Promise<UserAnalytics | null> {
    const { data, error } = await supabase
      .from('user_analytics')
      .select('*')
      .eq('user_id', userId)
      .single()

    if (error && error.code !== 'PGRST116') throw error
    return data || null
  },

  async updateUserAnalytics(userId: string, updates: Partial<UserAnalytics>): Promise<UserAnalytics> {
    const { data, error } = await supabase
      .from('user_analytics')
      .upsert({
        user_id: userId,
        ...updates,
        updated_at: new Date().toISOString(),
      })
      .select()
      .single()

    if (error) throw error
    return data
  },

  async calculateUserAnalytics(userId: string): Promise<UserAnalytics> {
    // Get user's signals
    const { data: signals, error: signalsError } = await supabase
      .from('signals')
      .select('*')
      .eq('created_by', userId)

    if (signalsError) throw signalsError

    // Get user info
    const { data: user, error: userError } = await supabase
      .from('users')
      .select('created_at')
      .eq('id', userId)
      .single()

    if (userError) throw userError

    // Calculate analytics
    const totalSignals = signals?.length || 0
    const wonSignals = signals?.filter(s => s.status === 'won').length || 0
    const lostSignals = signals?.filter(s => s.status === 'lost').length || 0
    const winRate = totalSignals > 0 ? (wonSignals / (wonSignals + lostSignals)) * 100 : 0

    // Calculate profit in pips (simplified)
    const totalPips = signals?.reduce((acc, signal) => {
      if (signal.status === 'won') {
        return acc + Math.abs(signal.target_price - signal.entry_price) * 10000
      } else if (signal.status === 'lost') {
        return acc - Math.abs(signal.stop_loss - signal.entry_price) * 10000
      }
      return acc
    }, 0) || 0

    // Find best performing symbol
    const symbolPerformance = signals?.reduce((acc: Record<string, number>, signal) => {
      if (!acc[signal.symbol]) acc[signal.symbol] = 0
      if (signal.status === 'won') acc[signal.symbol]++
      return acc
    }, {}) || {}
    
    const bestSymbol = Object.entries(symbolPerformance).sort(([,a], [,b]) => b - a)[0]?.[0] || 'N/A'

    // Calculate account age
    const accountAge = Math.floor(
      (new Date().getTime() - new Date(user.created_at).getTime()) / (1000 * 60 * 60 * 24)
    )

    const analytics = {
      user_id: userId,
      total_signals_received: totalSignals,
      signals_won: wonSignals,
      signals_lost: lostSignals,
      win_rate: winRate,
      total_profit_pips: totalPips,
      best_performing_symbol: bestSymbol,
      most_active_timeframe: '1H', // Default
      account_age_days: accountAge,
      subscription_tier: 'basic', // Default
      last_activity_at: new Date().toISOString(),
      preferences: {},
    }

    return this.updateUserAnalytics(userId, analytics)
  },

  // System Analytics
  async getSystemMetrics(period: 'daily' | 'weekly' | 'monthly' = 'daily', days = 30): Promise<SystemAnalytics[]> {
    const startDate = new Date()
    startDate.setDate(startDate.getDate() - days)

    const { data, error } = await supabase
      .from('system_analytics')
      .select('*')
      .eq('period', period)
      .gte('date', startDate.toISOString())
      .order('date', { ascending: false })

    if (error) throw error
    return data || []
  },

  async recordSystemMetric(
    metricName: string,
    value: number,
    type: 'count' | 'percentage' | 'currency' | 'time',
    period: 'daily' | 'weekly' | 'monthly' = 'daily',
    metadata: Record<string, any> = {}
  ): Promise<SystemAnalytics> {
    const { data, error } = await supabase
      .from('system_analytics')
      .insert({
        metric_name: metricName,
        metric_value: value,
        metric_type: type,
        period,
        date: new Date().toISOString().split('T')[0], // Date only
        metadata,
      })
      .select()
      .single()

    if (error) throw error
    return data
  },

  // Trading Performance
  async getTradingPerformance(
    userId?: string,
    symbol?: string,
    timeframe?: string,
    days = 30
  ): Promise<TradingPerformance[]> {
    const startDate = new Date()
    startDate.setDate(startDate.getDate() - days)

    let query = supabase
      .from('trading_performance')
      .select('*')
      .gte('period_start', startDate.toISOString())
      .order('created_at', { ascending: false })

    if (userId) query = query.eq('user_id', userId)
    if (symbol) query = query.eq('symbol', symbol)
    if (timeframe) query = query.eq('timeframe', timeframe)

    const { data, error } = await query

    if (error) throw error
    return data || []
  },

  async calculateTradingPerformance(
    userId: string,
    symbol: string,
    periodDays = 30
  ): Promise<TradingPerformance> {
    const endDate = new Date()
    const startDate = new Date()
    startDate.setDate(startDate.getDate() - periodDays)

    // Get signals for the period
    const { data: signals, error } = await supabase
      .from('signals')
      .select('*')
      .eq('created_by', userId)
      .eq('symbol', symbol)
      .gte('created_at', startDate.toISOString())
      .lte('created_at', endDate.toISOString())
      .order('created_at')

    if (error) throw error

    const totalSignals = signals?.length || 0
    const wonSignals = signals?.filter(s => s.status === 'won').length || 0
    const lostSignals = signals?.filter(s => s.status === 'lost').length || 0
    const winRate = totalSignals > 0 ? (wonSignals / (wonSignals + lostSignals)) * 100 : 0

    // Calculate streaks
    let currentStreak = 0
    let bestStreak = 0
    let worstStreak = 0
    let tempStreak = 0

    signals?.forEach((signal, index) => {
      if (signal.status === 'won') {
        if (tempStreak >= 0) {
          tempStreak++
        } else {
          tempStreak = 1
        }
        bestStreak = Math.max(bestStreak, tempStreak)
      } else if (signal.status === 'lost') {
        if (tempStreak <= 0) {
          tempStreak--
        } else {
          tempStreak = -1
        }
        worstStreak = Math.min(worstStreak, tempStreak)
      }
      
      if (index === signals.length - 1) {
        currentStreak = tempStreak
      }
    })

    // Calculate total pips
    const totalPips = signals?.reduce((acc, signal) => {
      if (signal.status === 'won') {
        return acc + Math.abs(signal.target_price - signal.entry_price) * 10000
      } else if (signal.status === 'lost') {
        return acc - Math.abs(signal.stop_loss - signal.entry_price) * 10000
      }
      return acc
    }, 0) || 0

    // Calculate average risk-reward ratio
    const avgRiskReward = signals?.reduce((acc, signal) => {
      const reward = Math.abs(signal.target_price - signal.entry_price)
      const risk = Math.abs(signal.entry_price - signal.stop_loss)
      return acc + (risk > 0 ? reward / risk : 0)
    }, 0) / (totalSignals || 1) || 0

    const performance = {
      user_id: userId,
      symbol,
      timeframe: '1H', // Default
      total_signals: totalSignals,
      won_signals: wonSignals,
      lost_signals: lostSignals,
      win_rate: winRate,
      total_pips: totalPips,
      avg_risk_reward: avgRiskReward,
      best_streak: bestStreak,
      worst_streak: Math.abs(worstStreak),
      last_signal_at: signals?.[signals.length - 1]?.created_at || new Date().toISOString(),
      period_start: startDate.toISOString(),
      period_end: endDate.toISOString(),
    }

    const { data, error: insertError } = await supabase
      .from('trading_performance')
      .insert(performance)
      .select()
      .single()

    if (insertError) throw insertError
    return data
  },

  // User Behavior Tracking
  async trackUserAction(
    userId: string,
    actionType: string,
    actionData: Record<string, any> = {},
    pageUrl: string = '',
    sessionId: string = ''
  ): Promise<UserBehavior> {
    const { data, error } = await supabase
      .from('user_behavior')
      .insert({
        user_id: userId,
        action_type: actionType,
        action_data: actionData,
        page_url: pageUrl,
        session_id: sessionId,
        device_type: 'web', // Default
        browser: 'unknown', // Would be detected client-side
        ip_address: '0.0.0.0', // Would be set server-side
        timestamp: new Date().toISOString(),
      })
      .select()
      .single()

    if (error) throw error
    return data
  },

  async getUserBehavior(
    userId: string,
    days = 30,
    actionType?: string
  ): Promise<UserBehavior[]> {
    const startDate = new Date()
    startDate.setDate(startDate.getDate() - days)

    let query = supabase
      .from('user_behavior')
      .select('*')
      .eq('user_id', userId)
      .gte('timestamp', startDate.toISOString())
      .order('timestamp', { ascending: false })

    if (actionType) {
      query = query.eq('action_type', actionType)
    }

    const { data, error } = await query

    if (error) throw error
    return data || []
  },

  // Dashboard Analytics
  async getDashboardAnalytics(userId?: string): Promise<{
    userStats: {
      totalUsers: number
      activeUsers: number
      newUsersToday: number
      churnRate: number
    }
    signalStats: {
      totalSignals: number
      signalsToday: number
      avgWinRate: number
      topPerformingSymbol: string
    }
    revenueStats: {
      totalRevenue: number
      monthlyRevenue: number
      avgRevenuePerUser: number
      subscriptionGrowth: number
    }
    systemStats: {
      systemUptime: number
      avgResponseTime: number
      errorRate: number
      activeConnections: number
    }
  }> {
    const today = new Date().toISOString().split('T')[0]

    // User Statistics
    const { data: users } = await supabase.from('users').select('id, created_at, last_login_at')
    const totalUsers = users?.length || 0
    const activeUsers = users?.filter(u => {
      const lastLogin = new Date(u.last_login_at || 0)
      const daysDiff = (new Date().getTime() - lastLogin.getTime()) / (1000 * 60 * 60 * 24)
      return daysDiff <= 7
    }).length || 0
    const newUsersToday = users?.filter(u => u.created_at.startsWith(today)).length || 0

    // Signal Statistics
    const { data: signals } = await supabase.from('signals').select('*')
    const totalSignals = signals?.length || 0
    const signalsToday = signals?.filter(s => s.created_at.startsWith(today)).length || 0
    const completedSignals = signals?.filter(s => ['won', 'lost'].includes(s.status)) || []
    const avgWinRate = completedSignals.length > 0 
      ? (completedSignals.filter(s => s.status === 'won').length / completedSignals.length) * 100
      : 0

    // Top performing symbol
    const symbolStats = signals?.reduce((acc: Record<string, number>, signal) => {
      if (signal.status === 'won') {
        acc[signal.symbol] = (acc[signal.symbol] || 0) + 1
      }
      return acc
    }, {}) || {}
    const topSymbol = Object.entries(symbolStats).sort(([,a], [,b]) => b - a)[0]?.[0] || 'N/A'

    // Revenue Statistics (mock data for now)
    const totalRevenue = 50000
    const monthlyRevenue = 8500
    const avgRevenuePerUser = totalUsers > 0 ? totalRevenue / totalUsers : 0

    return {
      userStats: {
        totalUsers,
        activeUsers,
        newUsersToday,
        churnRate: 5.2, // Mock
      },
      signalStats: {
        totalSignals,
        signalsToday,
        avgWinRate,
        topPerformingSymbol: topSymbol,
      },
      revenueStats: {
        totalRevenue,
        monthlyRevenue,
        avgRevenuePerUser,
        subscriptionGrowth: 15.3, // Mock
      },
      systemStats: {
        systemUptime: 99.8, // Mock
        avgResponseTime: 120, // Mock
        errorRate: 0.1, // Mock
        activeConnections: 1250, // Mock
      },
    }
  },

  // Export Analytics
  async exportUserAnalytics(userId: string, format: 'json' | 'csv' = 'json'): Promise<string> {
    const analytics = await this.getUserAnalytics(userId)
    const performance = await this.getTradingPerformance(userId)
    const behavior = await this.getUserBehavior(userId, 90)

    const exportData = {
      user_analytics: analytics,
      trading_performance: performance,
      user_behavior: behavior,
      exported_at: new Date().toISOString(),
    }

    if (format === 'csv') {
      // Convert to CSV format (simplified)
      return JSON.stringify(exportData) // In real implementation, convert to actual CSV
    }

    return JSON.stringify(exportData, null, 2)
  },

  // Real-time Analytics
  async getRealtimeMetrics(): Promise<{
    activeUsers: number
    signalsGenerated: number
    systemLoad: number
    errorCount: number
  }> {
    // In a real implementation, this would connect to real-time metrics
    return {
      activeUsers: Math.floor(Math.random() * 100) + 50,
      signalsGenerated: Math.floor(Math.random() * 10) + 5,
      systemLoad: Math.random() * 100,
      errorCount: Math.floor(Math.random() * 3),
    }
  },
}