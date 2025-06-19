export interface PaginatedResponse<T> {
  data: T[]
  total: number
  page: number
  limit: number
  totalPages: number
}

export interface User {
  id: string
  email: string
  full_name?: string
  avatar_url?: string
  preferred_language: string
  timezone: string
  phone_number?: string
  country_code?: string
  email_verified: boolean
  phone_verified: boolean
  two_factor_enabled: boolean
  risk_score: number
  last_login_at?: string
  metadata: Record<string, any>
  created_at: string
  updated_at: string
}

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

export interface ApiResponse<T = any> {
  data?: T
  error?: string
  message?: string
}