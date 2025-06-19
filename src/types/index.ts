// User Management Types
export interface User {
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

// Signal Types
export interface Signal {
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

// Subscription Types
export interface Subscription {
  id: string
  user_id: string
  plan_id: string
  status: 'trial' | 'active' | 'canceled' | 'paused'
  start_date: string
  end_date: string | null
  created_at: string
  updated_at: string
}

export interface Plan {
  id: string
  name: string
  price: number
  interval: 'monthly' | 'yearly'
  features: string[]
  signal_limit: number
  created_at: string
  updated_at: string
}

// Notification Types
export interface Notification {
  id: string
  user_id: string
  title: string
  message: string
  type: 'info' | 'success' | 'warning' | 'error'
  read: boolean
  created_at: string
}

// API Response Types
export interface ApiResponse<T> {
  data: T
  message?: string
  success: boolean
}

export interface PaginatedResponse<T> {
  data: T[]
  total: number
  page: number
  limit: number
  totalPages: number
}