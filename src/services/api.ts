import { supabase } from '@/lib/supabase'

export interface APIKey {
  id: string
  user_id: string
  name: string
  key_prefix: string
  key_hash: string
  permissions: string[]
  rate_limit: number
  is_active: boolean
  last_used_at: string | null
  expires_at: string | null
  created_at: string
  updated_at: string
}

export interface APIUsage {
  id: string
  api_key_id: string
  endpoint: string
  method: string
  status_code: number
  response_time_ms: number
  request_size: number
  response_size: number
  user_agent: string | null
  ip_address: string
  timestamp: string
}

export interface APIEndpoint {
  path: string
  method: string
  description: string
  parameters: APIParameter[]
  responses: APIResponse[]
  rate_limit: number
  authentication_required: boolean
}

export interface APIParameter {
  name: string
  type: string
  required: boolean
  description: string
  example: any
}

export interface APIResponse {
  status_code: number
  description: string
  schema: Record<string, any>
}

export const apiService = {
  // API Key Management
  async getUserAPIKeys(userId: string): Promise<APIKey[]> {
    const { data, error } = await supabase
      .from('api_keys')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })

    if (error) throw error
    return data || []
  },

  async createAPIKey(userId: string, name: string, permissions: string[]): Promise<{ apiKey: APIKey; plainKey: string }> {
    // Generate new API key
    const plainKey = this.generateAPIKey()
    const keyPrefix = plainKey.substring(0, 8)
    const keyHash = await this.hashAPIKey(plainKey)

    const apiKeyData = {
      user_id: userId,
      name,
      key_prefix: keyPrefix,
      key_hash: keyHash,
      permissions,
      rate_limit: 1000, // requests per hour
      is_active: true,
      expires_at: null,
    }

    const { data, error } = await supabase
      .from('api_keys')
      .insert(apiKeyData)
      .select()
      .single()

    if (error) throw error

    return {
      apiKey: data,
      plainKey
    }
  },

  async updateAPIKey(keyId: string, updates: Partial<APIKey>): Promise<APIKey> {
    const { data, error } = await supabase
      .from('api_keys')
      .update({ ...updates, updated_at: new Date().toISOString() })
      .eq('id', keyId)
      .select()
      .single()

    if (error) throw error
    return data
  },

  async deleteAPIKey(keyId: string): Promise<void> {
    const { error } = await supabase
      .from('api_keys')
      .delete()
      .eq('id', keyId)

    if (error) throw error
  },

  async validateAPIKey(apiKey: string): Promise<APIKey | null> {
    const keyHash = await this.hashAPIKey(apiKey)
    
    const { data, error } = await supabase
      .from('api_keys')
      .select('*')
      .eq('key_hash', keyHash)
      .eq('is_active', true)
      .single()

    if (error && error.code !== 'PGRST116') throw error
    
    if (data) {
      // Check if key is expired
      if (data.expires_at && new Date(data.expires_at) < new Date()) {
        return null
      }

      // Update last used timestamp
      await supabase
        .from('api_keys')
        .update({ last_used_at: new Date().toISOString() })
        .eq('id', data.id)
    }

    return data || null
  },

  // API Usage Tracking
  async logAPIUsage(usage: Omit<APIUsage, 'id' | 'timestamp'>): Promise<void> {
    const { error } = await supabase
      .from('api_usage')
      .insert({
        ...usage,
        timestamp: new Date().toISOString(),
      })

    if (error) throw error
  },

  async getAPIUsage(apiKeyId: string, days = 30): Promise<APIUsage[]> {
    const startDate = new Date()
    startDate.setDate(startDate.getDate() - days)

    const { data, error } = await supabase
      .from('api_usage')
      .select('*')
      .eq('api_key_id', apiKeyId)
      .gte('timestamp', startDate.toISOString())
      .order('timestamp', { ascending: false })

    if (error) throw error
    return data || []
  },

  async getUsageStats(apiKeyId: string, period: 'hour' | 'day' | 'week' = 'day'): Promise<{
    total_requests: number
    successful_requests: number
    error_rate: number
    avg_response_time: number
    rate_limit_hits: number
  }> {
    const usage = await this.getAPIUsage(apiKeyId, period === 'hour' ? 1 : period === 'day' ? 1 : 7)
    
    const totalRequests = usage.length
    const successfulRequests = usage.filter(u => u.status_code < 400).length
    const errorRate = totalRequests > 0 ? ((totalRequests - successfulRequests) / totalRequests) * 100 : 0
    const avgResponseTime = totalRequests > 0 ? usage.reduce((sum, u) => sum + u.response_time_ms, 0) / totalRequests : 0
    const rateLimitHits = usage.filter(u => u.status_code === 429).length

    return {
      total_requests: totalRequests,
      successful_requests: successfulRequests,
      error_rate: errorRate,
      avg_response_time: avgResponseTime,
      rate_limit_hits: rateLimitHits,
    }
  },

  // Rate Limiting
  async checkRateLimit(apiKeyId: string, rateLimit: number): Promise<boolean> {
    const oneHourAgo = new Date()
    oneHourAgo.setHours(oneHourAgo.getHours() - 1)

    const { count, error } = await supabase
      .from('api_usage')
      .select('*', { count: 'exact', head: true })
      .eq('api_key_id', apiKeyId)
      .gte('timestamp', oneHourAgo.toISOString())

    if (error) throw error

    return (count || 0) < rateLimit
  },

  // API Documentation
  getAPIEndpoints(): APIEndpoint[] {
    return [
      {
        path: '/api/signals',
        method: 'GET',
        description: 'الحصول على قائمة الإشارات',
        parameters: [
          {
            name: 'page',
            type: 'number',
            required: false,
            description: 'رقم الصفحة',
            example: 1
          },
          {
            name: 'limit',
            type: 'number',
            required: false,
            description: 'عدد الإشارات في الصفحة',
            example: 10
          },
          {
            name: 'symbol',
            type: 'string',
            required: false,
            description: 'رمز العملة',
            example: 'EURUSD'
          }
        ],
        responses: [
          {
            status_code: 200,
            description: 'نجح الطلب',
            schema: {
              data: 'array',
              total: 'number',
              page: 'number',
              totalPages: 'number'
            }
          },
          {
            status_code: 401,
            description: 'غير مصرح',
            schema: {
              error: 'string'
            }
          }
        ],
        rate_limit: 100,
        authentication_required: true
      },
      {
        path: '/api/signals',
        method: 'POST',
        description: 'إنشاء إشارة جديدة',
        parameters: [
          {
            name: 'symbol',
            type: 'string',
            required: true,
            description: 'رمز العملة',
            example: 'EURUSD'
          },
          {
            name: 'signal_type',
            type: 'string',
            required: true,
            description: 'نوع الإشارة',
            example: 'call'
          },
          {
            name: 'entry_price',
            type: 'number',
            required: true,
            description: 'سعر الدخول',
            example: 1.1234
          }
        ],
        responses: [
          {
            status_code: 201,
            description: 'تم إنشاء الإشارة',
            schema: {
              id: 'string',
              symbol: 'string',
              signal_type: 'string',
              created_at: 'string'
            }
          }
        ],
        rate_limit: 50,
        authentication_required: true
      },
      {
        path: '/api/analytics/user',
        method: 'GET',
        description: 'الحصول على تحليلات المستخدم',
        parameters: [],
        responses: [
          {
            status_code: 200,
            description: 'تحليلات المستخدم',
            schema: {
              total_signals: 'number',
              win_rate: 'number',
              total_profit: 'number'
            }
          }
        ],
        rate_limit: 200,
        authentication_required: true
      },
      {
        path: '/api/market/sentiment',
        method: 'GET',
        description: 'الحصول على مشاعر السوق',
        parameters: [
          {
            name: 'symbol',
            type: 'string',
            required: true,
            description: 'رمز العملة',
            example: 'EURUSD'
          }
        ],
        responses: [
          {
            status_code: 200,
            description: 'مشاعر السوق',
            schema: {
              sentiment_score: 'number',
              bullish_percentage: 'number',
              bearish_percentage: 'number'
            }
          }
        ],
        rate_limit: 300,
        authentication_required: true
      }
    ]
  },

  // Helper Methods
  generateAPIKey(): string {
    const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789'
    let result = 'sk_'
    for (let i = 0; i < 48; i++) {
      result += characters.charAt(Math.floor(Math.random() * characters.length))
    }
    return result
  },

  async hashAPIKey(apiKey: string): Promise<string> {
    // In production, use proper cryptographic hashing
    // For now, use a simple hash
    const encoder = new TextEncoder()
    const data = encoder.encode(apiKey)
    const hashBuffer = await crypto.subtle.digest('SHA-256', data)
    const hashArray = Array.from(new Uint8Array(hashBuffer))
    return hashArray.map(b => b.toString(16).padStart(2, '0')).join('')
  },

  // API Response Helpers
  createAPIResponse(data: any, status = 200): Response {
    return new Response(JSON.stringify(data), {
      status,
      headers: {
        'Content-Type': 'application/json',
        'X-RateLimit-Limit': '1000',
        'X-RateLimit-Remaining': '999',
        'X-RateLimit-Reset': String(Math.floor(Date.now() / 1000) + 3600),
      },
    })
  },

  createErrorResponse(message: string, status = 400): Response {
    return new Response(JSON.stringify({ error: message }), {
      status,
      headers: {
        'Content-Type': 'application/json',
      },
    })
  },

  // Webhook Management
  async createWebhook(userId: string, url: string, events: string[]): Promise<any> {
    const webhook = {
      user_id: userId,
      url,
      events,
      secret: this.generateWebhookSecret(),
      is_active: true,
    }

    const { data, error } = await supabase
      .from('webhooks')
      .insert(webhook)
      .select()
      .single()

    if (error) throw error
    return data
  },

  async sendWebhook(webhookId: string, event: string, data: any): Promise<boolean> {
    try {
      const { data: webhook, error } = await supabase
        .from('webhooks')
        .select('*')
        .eq('id', webhookId)
        .eq('is_active', true)
        .single()

      if (error || !webhook) return false

      if (!webhook.events.includes(event)) return false

      const payload = {
        event,
        data,
        timestamp: new Date().toISOString(),
      }

      const signature = await this.generateWebhookSignature(JSON.stringify(payload), webhook.secret)

      const response = await fetch(webhook.url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Signature': signature,
          'X-Event': event,
        },
        body: JSON.stringify(payload),
      })

      return response.ok
    } catch (error) {
      console.error('Webhook delivery failed:', error)
      return false
    }
  },

  generateWebhookSecret(): string {
    return 'whsec_' + this.generateAPIKey().substring(3)
  },

  async generateWebhookSignature(payload: string, secret: string): Promise<string> {
    const encoder = new TextEncoder()
    const keyData = encoder.encode(secret)
    const messageData = encoder.encode(payload)
    
    const cryptoKey = await crypto.subtle.importKey(
      'raw',
      keyData,
      { name: 'HMAC', hash: 'SHA-256' },
      false,
      ['sign']
    )
    
    const signature = await crypto.subtle.sign('HMAC', cryptoKey, messageData)
    const hashArray = Array.from(new Uint8Array(signature))
    return hashArray.map(b => b.toString(16).padStart(2, '0')).join('')
  }
}