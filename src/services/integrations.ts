import { supabase } from '@/lib/supabase'

export interface ExternalPlatform {
  id: string
  name: string
  type: 'broker' | 'exchange' | 'social' | 'payment' | 'analytics'
  display_name: Record<string, string>
  description: string
  api_endpoint: string
  auth_type: 'api_key' | 'oauth' | 'webhook' | 'none'
  supported_features: string[]
  is_active: boolean
  configuration: Record<string, any>
  created_at: string
  updated_at: string
}

export interface UserIntegration {
  id: string
  user_id: string
  platform_id: string
  platform_account_id: string
  credentials: Record<string, any> // Encrypted
  settings: Record<string, any>
  status: 'connected' | 'disconnected' | 'error' | 'pending'
  last_sync_at: string | null
  error_message: string | null
  created_at: string
  updated_at: string
}

export interface SyncLog {
  id: string
  integration_id: string
  action: 'import' | 'export' | 'sync' | 'webhook'
  status: 'pending' | 'success' | 'failed'
  data_count: number
  error_details: string | null
  duration_ms: number
  created_at: string
}

export const integrationsService = {
  // Platform Management
  async getPlatforms(): Promise<ExternalPlatform[]> {
    const { data, error } = await supabase
      .from('external_platforms')
      .select('*')
      .eq('is_active', true)
      .order('name')

    if (error) throw error
    return data || []
  },

  async getPlatform(id: string): Promise<ExternalPlatform> {
    const { data, error } = await supabase
      .from('external_platforms')
      .select('*')
      .eq('id', id)
      .single()

    if (error) throw error
    return data
  },

  // User Integrations
  async getUserIntegrations(userId: string): Promise<UserIntegration[]> {
    const { data, error } = await supabase
      .from('user_integrations')
      .select(`
        *,
        external_platforms (
          name,
          display_name,
          type,
          supported_features
        )
      `)
      .eq('user_id', userId)
      .order('created_at', { ascending: false })

    if (error) throw error
    return data || []
  },

  async createIntegration(integration: Omit<UserIntegration, 'id' | 'created_at' | 'updated_at'>): Promise<UserIntegration> {
    const { data, error } = await supabase
      .from('user_integrations')
      .insert(integration)
      .select()
      .single()

    if (error) throw error
    return data
  },

  async updateIntegration(id: string, updates: Partial<UserIntegration>): Promise<UserIntegration> {
    const { data, error } = await supabase
      .from('user_integrations')
      .update({ ...updates, updated_at: new Date().toISOString() })
      .eq('id', id)
      .select()
      .single()

    if (error) throw error
    return data
  },

  async deleteIntegration(id: string): Promise<void> {
    const { error } = await supabase
      .from('user_integrations')
      .delete()
      .eq('id', id)

    if (error) throw error
  },

  // Binance Integration
  async connectBinance(userId: string, apiKey: string, secretKey: string): Promise<UserIntegration> {
    // Validate Binance credentials
    const isValid = await this.validateBinanceCredentials(apiKey, secretKey)
    if (!isValid) {
      throw new Error('Invalid Binance API credentials')
    }

    const binancePlatform = await this.getPlatformByName('binance')
    
    return this.createIntegration({
      user_id: userId,
      platform_id: binancePlatform.id,
      platform_account_id: apiKey.substring(0, 8) + '...',
      credentials: {
        api_key: this.encryptCredential(apiKey),
        secret_key: this.encryptCredential(secretKey),
      },
      settings: {
        auto_sync: true,
        sync_interval: 300, // 5 minutes
      },
      status: 'connected',
      last_sync_at: null,
      error_message: null,
    })
  },

  async validateBinanceCredentials(apiKey: string, secretKey: string): Promise<boolean> {
    try {
      // In real implementation, make actual API call to Binance
      // For now, return true if credentials are provided
      return !!(apiKey && secretKey && apiKey.length > 10 && secretKey.length > 10)
    } catch (error) {
      return false
    }
  },

  async syncBinanceData(integrationId: string): Promise<SyncLog> {
    const integration = await this.getIntegration(integrationId)
    const startTime = Date.now()

    try {
      // Decrypt credentials
      const apiKey = this.decryptCredential(integration.credentials.api_key)
      const secretKey = this.decryptCredential(integration.credentials.secret_key)

      // Fetch data from Binance API
      const accountInfo = await this.fetchBinanceAccountInfo(apiKey, secretKey)
      const trades = await this.fetchBinanceTrades(apiKey, secretKey)

      // Store data in our system
      await this.storeTradingData(integration.user_id, 'binance', {
        account: accountInfo,
        trades: trades,
      })

      const syncLog = await this.createSyncLog({
        integration_id: integrationId,
        action: 'sync',
        status: 'success',
        data_count: trades.length,
        error_details: null,
        duration_ms: Date.now() - startTime,
      })

      // Update integration status
      await this.updateIntegration(integrationId, {
        status: 'connected',
        last_sync_at: new Date().toISOString(),
        error_message: null,
      })

      return syncLog
    } catch (error: any) {
      const syncLog = await this.createSyncLog({
        integration_id: integrationId,
        action: 'sync',
        status: 'failed',
        data_count: 0,
        error_details: error.message,
        duration_ms: Date.now() - startTime,
      })

      // Update integration status
      await this.updateIntegration(integrationId, {
        status: 'error',
        error_message: error.message,
      })

      throw error
    }
  },

  // MetaTrader Integration
  async connectMetaTrader(userId: string, serverUrl: string, login: string, password: string): Promise<UserIntegration> {
    const mtPlatform = await this.getPlatformByName('metatrader')
    
    return this.createIntegration({
      user_id: userId,
      platform_id: mtPlatform.id,
      platform_account_id: login,
      credentials: {
        server_url: serverUrl,
        login: login,
        password: this.encryptCredential(password),
      },
      settings: {
        auto_copy_signals: false,
        lot_size: 0.1,
        max_risk_per_trade: 2,
      },
      status: 'connected',
      last_sync_at: null,
      error_message: null,
    })
  },

  async sendSignalToMetaTrader(integrationId: string, signal: any): Promise<boolean> {
    const integration = await this.getIntegration(integrationId)
    
    try {
      // In real implementation, send signal to MetaTrader via API/WebSocket
      const success = await this.executeMTTrade(integration, signal)
      
      if (success) {
        await this.createSyncLog({
          integration_id: integrationId,
          action: 'export',
          status: 'success',
          data_count: 1,
          error_details: null,
          duration_ms: 1000,
        })
      }

      return success
    } catch (error: any) {
      await this.createSyncLog({
        integration_id: integrationId,
        action: 'export',
        status: 'failed',
        data_count: 0,
        error_details: error.message,
        duration_ms: 1000,
      })
      
      return false
    }
  },

  // TradingView Integration
  async connectTradingView(userId: string, webhookUrl: string): Promise<UserIntegration> {
    const tvPlatform = await this.getPlatformByName('tradingview')
    
    return this.createIntegration({
      user_id: userId,
      platform_id: tvPlatform.id,
      platform_account_id: 'webhook',
      credentials: {
        webhook_url: webhookUrl,
      },
      settings: {
        auto_publish: true,
        signal_format: 'json',
      },
      status: 'connected',
      last_sync_at: null,
      error_message: null,
    })
  },

  async publishToTradingView(integrationId: string, signal: any): Promise<boolean> {
    const integration = await this.getIntegration(integrationId)
    
    try {
      const webhookUrl = integration.credentials.webhook_url
      const payload = this.formatSignalForTradingView(signal)
      
      const response = await fetch(webhookUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      })

      const success = response.ok

      await this.createSyncLog({
        integration_id: integrationId,
        action: 'export',
        status: success ? 'success' : 'failed',
        data_count: 1,
        error_details: success ? null : `HTTP ${response.status}`,
        duration_ms: 500,
      })

      return success
    } catch (error: any) {
      await this.createSyncLog({
        integration_id: integrationId,
        action: 'export',
        status: 'failed',
        data_count: 0,
        error_details: error.message,
        duration_ms: 500,
      })
      
      return false
    }
  },

  // Telegram Integration
  async connectTelegram(userId: string, botToken: string, chatId: string): Promise<UserIntegration> {
    // Validate Telegram bot
    const isValid = await this.validateTelegramBot(botToken, chatId)
    if (!isValid) {
      throw new Error('Invalid Telegram bot credentials')
    }

    const telegramPlatform = await this.getPlatformByName('telegram')
    
    return this.createIntegration({
      user_id: userId,
      platform_id: telegramPlatform.id,
      platform_account_id: chatId,
      credentials: {
        bot_token: this.encryptCredential(botToken),
        chat_id: chatId,
      },
      settings: {
        auto_send_signals: true,
        message_format: 'detailed',
      },
      status: 'connected',
      last_sync_at: null,
      error_message: null,
    })
  },

  async sendTelegramMessage(integrationId: string, message: string): Promise<boolean> {
    const integration = await this.getIntegration(integrationId)
    
    try {
      const botToken = this.decryptCredential(integration.credentials.bot_token)
      const chatId = integration.credentials.chat_id
      
      const response = await fetch(`https://api.telegram.org/bot${botToken}/sendMessage`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          chat_id: chatId,
          text: message,
          parse_mode: 'HTML',
        }),
      })

      const success = response.ok

      await this.createSyncLog({
        integration_id: integrationId,
        action: 'export',
        status: success ? 'success' : 'failed',
        data_count: 1,
        error_details: success ? null : `HTTP ${response.status}`,
        duration_ms: 1000,
      })

      return success
    } catch (error: any) {
      await this.createSyncLog({
        integration_id: integrationId,
        action: 'export',
        status: 'failed',
        data_count: 0,
        error_details: error.message,
        duration_ms: 1000,
      })
      
      return false
    }
  },

  // Helper Methods
  async getPlatformByName(name: string): Promise<ExternalPlatform> {
    const { data, error } = await supabase
      .from('external_platforms')
      .select('*')
      .eq('name', name)
      .single()

    if (error) throw error
    return data
  },

  async getIntegration(id: string): Promise<UserIntegration> {
    const { data, error } = await supabase
      .from('user_integrations')
      .select('*')
      .eq('id', id)
      .single()

    if (error) throw error
    return data
  },

  async createSyncLog(log: Omit<SyncLog, 'id' | 'created_at'>): Promise<SyncLog> {
    const { data, error } = await supabase
      .from('sync_logs')
      .insert(log)
      .select()
      .single()

    if (error) throw error
    return data
  },

  // Encryption/Decryption (simplified)
  encryptCredential(credential: string): string {
    // In real implementation, use proper encryption
    return Buffer.from(credential).toString('base64')
  },

  decryptCredential(encryptedCredential: string): string {
    // In real implementation, use proper decryption
    return Buffer.from(encryptedCredential, 'base64').toString()
  },

  // External API calls (mock implementations)
  async fetchBinanceAccountInfo(apiKey: string, secretKey: string): Promise<any> {
    // Mock implementation
    return {
      accountType: 'SPOT',
      balances: [
        { asset: 'BTC', free: '0.1', locked: '0.0' },
        { asset: 'USDT', free: '1000.0', locked: '0.0' },
      ],
    }
  },

  async fetchBinanceTrades(apiKey: string, secretKey: string): Promise<any[]> {
    // Mock implementation
    return [
      {
        symbol: 'BTCUSDT',
        side: 'BUY',
        qty: '0.001',
        price: '45000.0',
        time: Date.now(),
      },
    ]
  },

  async executeMTTrade(integration: UserIntegration, signal: any): Promise<boolean> {
    // Mock implementation
    console.log('Executing MT trade:', signal)
    return true
  },

  async validateTelegramBot(botToken: string, chatId: string): Promise<boolean> {
    try {
      const response = await fetch(`https://api.telegram.org/bot${botToken}/getMe`)
      return response.ok
    } catch {
      return false
    }
  },

  formatSignalForTradingView(signal: any): any {
    return {
      symbol: signal.symbol,
      action: signal.signal_type === 'call' ? 'buy' : 'sell',
      entry: signal.entry_price,
      target: signal.target_price,
      stop: signal.stop_loss,
      confidence: signal.confidence_score,
      timestamp: new Date().toISOString(),
    }
  },

  async storeTradingData(userId: string, source: string, data: any): Promise<void> {
    // Store external trading data in our system
    const { error } = await supabase
      .from('external_trading_data')
      .insert({
        user_id: userId,
        source: source,
        data: data,
        imported_at: new Date().toISOString(),
      })

    if (error) throw error
  },
}