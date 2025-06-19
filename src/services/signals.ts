import { supabase } from '@/lib/supabase'
import type { Signal, PaginatedResponse } from '@/types'

export const signalsService = {
  // Get all signals with pagination
  async getSignals(page = 1, limit = 10): Promise<PaginatedResponse<Signal>> {
    const start = (page - 1) * limit
    const end = start + limit - 1

    const { data, error, count } = await supabase
      .from('signals')
      .select('*', { count: 'exact' })
      .order('created_at', { ascending: false })
      .range(start, end)

    if (error) throw error

    return {
      data: data || [],
      total: count || 0,
      page,
      limit,
      totalPages: Math.ceil((count || 0) / limit),
    }
  },

  // Get signal by ID
  async getSignal(id: string): Promise<Signal> {
    const { data, error } = await supabase
      .from('signals')
      .select('*')
      .eq('id', id)
      .single()

    if (error) throw error
    return data
  },

  // Create new signal
  async createSignal(signal: Omit<Signal, 'id' | 'created_at' | 'updated_at'>): Promise<Signal> {
    const { data, error } = await supabase
      .from('signals')
      .insert(signal)
      .select()
      .single()

    if (error) throw error
    return data
  },

  // Update signal status
  async updateSignalStatus(id: string, status: Signal['status']): Promise<Signal> {
    const { data, error } = await supabase
      .from('signals')
      .update({ 
        status, 
        updated_at: new Date().toISOString() 
      })
      .eq('id', id)
      .select()
      .single()

    if (error) throw error
    return data
  },

  // Get signals by symbol
  async getSignalsBySymbol(symbol: string): Promise<Signal[]> {
    const { data, error } = await supabase
      .from('signals')
      .select('*')
      .eq('symbol', symbol)
      .order('created_at', { ascending: false })

    if (error) throw error
    return data || []
  },

  // Get active signals
  async getActiveSignals(): Promise<Signal[]> {
    const { data, error } = await supabase
      .from('signals')
      .select('*')
      .eq('status', 'active')
      .order('created_at', { ascending: false })

    if (error) throw error
    return data || []
  },

  // Generate AI signal
  async generateAISignal(symbol: string, analysis: any): Promise<Signal> {
    const signal = {
      symbol,
      signal_type: (Math.random() > 0.5 ? 'call' : 'put') as 'call' | 'put',
      entry_price: Math.random() * 100 + 50,
      target_price: Math.random() * 100 + 50,
      stop_loss: Math.random() * 50 + 25,
      expiry_time: new Date(Date.now() + 60 * 60 * 1000).toISOString(),
      confidence_score: Math.floor(Math.random() * 40) + 60,
      ai_analysis: analysis,
      status: 'pending' as 'pending' | 'active' | 'won' | 'lost' | 'expired',
    }

    return this.createSignal(signal)
  },

  // Get signal statistics
  async getSignalStats(): Promise<{
    total: number
    active: number
    won: number
    lost: number
    accuracy: number
  }> {
    const { data, error } = await supabase
      .from('signals')
      .select('status')

    if (error) throw error

    const stats = data?.reduce((acc, signal) => {
      acc.total++
      if (signal.status === 'active') acc.active++
      if (signal.status === 'won') acc.won++
      if (signal.status === 'lost') acc.lost++
      return acc
    }, { total: 0, active: 0, won: 0, lost: 0 }) || { total: 0, active: 0, won: 0, lost: 0 }

    const accuracy = stats.total > 0 ? (stats.won / (stats.won + stats.lost)) * 100 : 0

    return { ...stats, accuracy }
  },
}