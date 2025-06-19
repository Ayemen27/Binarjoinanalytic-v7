import { supabase } from '@/lib/supabase'
import type { PaginatedResponse } from '@/types'

export interface SubscriptionPlan {
  id: string
  name: string
  display_name: Record<string, string>
  description: string | null
  price: number
  currency: string
  interval: 'monthly' | 'yearly' | 'lifetime'
  features: Record<string, any>
  signal_limit: number | null
  is_active: boolean
  created_at: string
  updated_at: string
}

export interface Subscription {
  id: string
  user_id: string
  plan_id: string
  status: 'trial' | 'active' | 'canceled' | 'paused' | 'expired'
  start_date: string
  end_date: string | null
  trial_end_date: string | null
  auto_renew: boolean
  payment_method_id: string | null
  stripe_subscription_id: string | null
  created_at: string
  updated_at: string
}

export interface BillingRecord {
  id: string
  subscription_id: string
  amount: number
  currency: string
  status: 'pending' | 'paid' | 'failed' | 'refunded'
  payment_method: string | null
  transaction_id: string | null
  invoice_url: string | null
  issued_at: string
  paid_at: string | null
  due_date: string | null
}

export interface Coupon {
  code: string
  discount_type: 'percentage' | 'fixed'
  discount_value: number
  max_uses: number | null
  used_count: number
  expiry_date: string | null
  is_active: boolean
  applicable_plans: string[]
  created_at: string
}

export const subscriptionsService = {
  // Subscription Plans Management
  async getPlans(): Promise<SubscriptionPlan[]> {
    const { data, error } = await supabase
      .from('subscription_plans')
      .select('*')
      .eq('is_active', true)
      .order('price', { ascending: true })

    if (error) throw error
    return data || []
  },

  async getPlan(id: string): Promise<SubscriptionPlan> {
    const { data, error } = await supabase
      .from('subscription_plans')
      .select('*')
      .eq('id', id)
      .single()

    if (error) throw error
    return data
  },

  async createPlan(plan: Omit<SubscriptionPlan, 'id' | 'created_at' | 'updated_at'>): Promise<SubscriptionPlan> {
    const { data, error } = await supabase
      .from('subscription_plans')
      .insert(plan)
      .select()
      .single()

    if (error) throw error
    return data
  },

  async updatePlan(id: string, updates: Partial<SubscriptionPlan>): Promise<SubscriptionPlan> {
    const { data, error } = await supabase
      .from('subscription_plans')
      .update({ ...updates, updated_at: new Date().toISOString() })
      .eq('id', id)
      .select()
      .single()

    if (error) throw error
    return data
  },

  // User Subscriptions
  async getUserSubscription(userId: string): Promise<Subscription | null> {
    const { data, error } = await supabase
      .from('subscriptions')
      .select('*')
      .eq('user_id', userId)
      .eq('status', 'active')
      .single()

    if (error && error.code !== 'PGRST116') throw error
    return data || null
  },

  async createSubscription(subscription: Omit<Subscription, 'id' | 'created_at' | 'updated_at'>): Promise<Subscription> {
    const { data, error } = await supabase
      .from('subscriptions')
      .insert(subscription)
      .select()
      .single()

    if (error) throw error
    return data
  },

  async updateSubscription(id: string, updates: Partial<Subscription>): Promise<Subscription> {
    const { data, error } = await supabase
      .from('subscriptions')
      .update({ ...updates, updated_at: new Date().toISOString() })
      .eq('id', id)
      .select()
      .single()

    if (error) throw error
    return data
  },

  async cancelSubscription(subscriptionId: string): Promise<Subscription> {
    const { data, error } = await supabase
      .from('subscriptions')
      .update({ 
        status: 'canceled',
        auto_renew: false,
        updated_at: new Date().toISOString() 
      })
      .eq('id', subscriptionId)
      .select()
      .single()

    if (error) throw error
    return data
  },

  async resumeSubscription(subscriptionId: string): Promise<Subscription> {
    const { data, error } = await supabase
      .from('subscriptions')
      .update({ 
        status: 'active',
        auto_renew: true,
        updated_at: new Date().toISOString() 
      })
      .eq('id', subscriptionId)
      .select()
      .single()

    if (error) throw error
    return data
  },

  // Billing Management
  async getBillingHistory(userId: string, page = 1, limit = 10): Promise<PaginatedResponse<BillingRecord>> {
    const start = (page - 1) * limit
    const end = start + limit - 1

    const { data, error, count } = await supabase
      .from('billing_records')
      .select(`
        *,
        subscriptions!inner(user_id)
      `, { count: 'exact' })
      .eq('subscriptions.user_id', userId)
      .order('issued_at', { ascending: false })
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

  async createBillingRecord(record: Omit<BillingRecord, 'id' | 'issued_at'>): Promise<BillingRecord> {
    const { data, error } = await supabase
      .from('billing_records')
      .insert({ ...record, issued_at: new Date().toISOString() })
      .select()
      .single()

    if (error) throw error
    return data
  },

  async updateBillingRecord(id: string, updates: Partial<BillingRecord>): Promise<BillingRecord> {
    const { data, error } = await supabase
      .from('billing_records')
      .update(updates)
      .eq('id', id)
      .select()
      .single()

    if (error) throw error
    return data
  },

  // Coupons Management
  async getCoupons(): Promise<Coupon[]> {
    const { data, error } = await supabase
      .from('coupons')
      .select('*')
      .eq('is_active', true)
      .order('created_at', { ascending: false })

    if (error) throw error
    return data || []
  },

  async validateCoupon(code: string, planId?: string): Promise<Coupon | null> {
    const { data, error } = await supabase
      .from('coupons')
      .select('*')
      .eq('code', code.toUpperCase())
      .eq('is_active', true)
      .single()

    if (error && error.code !== 'PGRST116') throw error
    if (!data) return null

    // Check if coupon is expired
    if (data.expiry_date && new Date(data.expiry_date) < new Date()) {
      return null
    }

    // Check if coupon has reached max uses
    if (data.max_uses && data.used_count >= data.max_uses) {
      return null
    }

    // Check if coupon is applicable to the plan
    if (planId && data.applicable_plans.length > 0 && !data.applicable_plans.includes(planId)) {
      return null
    }

    return data
  },

  async applyCoupon(code: string): Promise<Coupon> {
    const { data, error } = await supabase
      .from('coupons')
      .update({ used_count: supabase.rpc('increment_used_count', { coupon_code: code }) })
      .eq('code', code.toUpperCase())
      .select()
      .single()

    if (error) throw error
    return data
  },

  async createCoupon(coupon: Omit<Coupon, 'created_at' | 'used_count'>): Promise<Coupon> {
    const { data, error } = await supabase
      .from('coupons')
      .insert({ ...coupon, code: coupon.code.toUpperCase(), used_count: 0 })
      .select()
      .single()

    if (error) throw error
    return data
  },

  // Subscription Analytics
  async getSubscriptionStats(): Promise<{
    total: number
    active: number
    trial: number
    canceled: number
    revenue: number
  }> {
    const { data: subscriptions, error } = await supabase
      .from('subscriptions')
      .select('status')

    if (error) throw error

    const stats = subscriptions?.reduce((acc, sub) => {
      acc.total++
      acc[sub.status as keyof typeof acc]++
      return acc
    }, { total: 0, active: 0, trial: 0, canceled: 0, paused: 0, expired: 0 }) || 
    { total: 0, active: 0, trial: 0, canceled: 0, paused: 0, expired: 0 }

    // Get revenue from billing records
    const { data: billingData, error: billingError } = await supabase
      .from('billing_records')
      .select('amount')
      .eq('status', 'paid')
      .gte('paid_at', new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString()) // Last 30 days

    if (billingError) throw billingError

    const revenue = billingData?.reduce((sum, record) => sum + record.amount, 0) || 0

    return {
      total: stats.total,
      active: stats.active,
      trial: stats.trial,
      canceled: stats.canceled,
      revenue,
    }
  },

  // Trial Management
  async startTrial(userId: string, planId: string, trialDays = 7): Promise<Subscription> {
    const startDate = new Date()
    const trialEndDate = new Date(Date.now() + trialDays * 24 * 60 * 60 * 1000)

    const subscription = {
      user_id: userId,
      plan_id: planId,
      status: 'trial' as const,
      start_date: startDate.toISOString(),
      end_date: null,
      trial_end_date: trialEndDate.toISOString(),
      auto_renew: false,
      payment_method_id: null,
      stripe_subscription_id: null,
    }

    return this.createSubscription(subscription)
  },

  async convertTrialToActive(subscriptionId: string, paymentMethodId: string): Promise<Subscription> {
    const updates = {
      status: 'active' as const,
      auto_renew: true,
      payment_method_id: paymentMethodId,
    }

    return this.updateSubscription(subscriptionId, updates)
  },

  // Usage Tracking
  async getUsageStats(userId: string): Promise<{
    signalsUsed: number
    signalsLimit: number
    billingCycle: string
    nextBillingDate: string | null
  }> {
    const subscription = await this.getUserSubscription(userId)
    if (!subscription) {
      return {
        signalsUsed: 0,
        signalsLimit: 5, // Free tier default
        billingCycle: 'free',
        nextBillingDate: null,
      }
    }

    const plan = await this.getPlan(subscription.plan_id)
    
    // Count signals used in current billing cycle
    const cycleStart = new Date(subscription.start_date)
    const { data: signalsData, error } = await supabase
      .from('signals')
      .select('id')
      .eq('created_by', userId)
      .gte('created_at', cycleStart.toISOString())

    if (error) throw error

    return {
      signalsUsed: signalsData?.length || 0,
      signalsLimit: plan.signal_limit || -1, // -1 means unlimited
      billingCycle: plan.interval,
      nextBillingDate: subscription.end_date,
    }
  },
}