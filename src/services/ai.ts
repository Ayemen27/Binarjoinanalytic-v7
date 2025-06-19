import { supabase } from '@/lib/supabase'

export interface AIModel {
  id: string
  name: string
  description: string
  model_type: 'signal_generation' | 'market_analysis' | 'risk_assessment' | 'sentiment_analysis'
  configuration: Record<string, any>
  is_active: boolean
  accuracy_score: number
  created_at: string
  updated_at: string
}

export interface AIRecommendation {
  id: string
  user_id: string
  type: 'signal' | 'portfolio' | 'risk' | 'strategy'
  title: string
  description: string
  data: Record<string, any>
  confidence_score: number
  status: 'pending' | 'applied' | 'dismissed' | 'expired'
  expires_at: string | null
  created_at: string
  updated_at: string
}

export interface MarketSentiment {
  id: string
  symbol: string
  sentiment_score: number // -1 to 1
  bullish_percentage: number
  bearish_percentage: number
  neutral_percentage: number
  news_sentiment: number
  social_sentiment: number
  technical_sentiment: number
  analysis_timestamp: string
  created_at: string
}

export interface RiskAssessment {
  id: string
  user_id: string
  overall_risk_score: number // 0 to 100
  portfolio_risk: number
  market_risk: number
  volatility_risk: number
  concentration_risk: number
  recommendations: string[]
  assessment_data: Record<string, any>
  created_at: string
}

export const aiService = {
  // AI Models Management
  async getAIModels(): Promise<AIModel[]> {
    const { data, error } = await supabase
      .from('ai_models')
      .select('*')
      .eq('is_active', true)
      .order('accuracy_score', { ascending: false })

    if (error) throw error
    return data || []
  },

  async getModel(id: string): Promise<AIModel> {
    const { data, error } = await supabase
      .from('ai_models')
      .select('*')
      .eq('id', id)
      .single()

    if (error) throw error
    return data
  },

  // Signal Generation with AI
  async generateSignal(symbol: string, timeframe: string = '1H'): Promise<any> {
    try {
      // Get market data and technical indicators
      const marketData = await this.getMarketData(symbol, timeframe)
      const technicalAnalysis = await this.analyzeTechnical(marketData)
      const sentimentData = await this.getMarketSentiment(symbol)
      
      // AI signal generation logic
      const signal = await this.processAISignal({
        symbol,
        timeframe,
        marketData,
        technicalAnalysis,
        sentimentData
      })

      // Save signal to database
      const { data, error } = await supabase
        .from('signals')
        .insert({
          symbol,
          signal_type: signal.type,
          entry_price: signal.entry_price,
          target_price: signal.target_price,
          stop_loss: signal.stop_loss,
          expiry_time: signal.expiry_time,
          confidence_score: signal.confidence,
          ai_analysis: signal.analysis,
          status: 'pending'
        })
        .select()
        .single()

      if (error) throw error
      return data
    } catch (error) {
      console.error('Signal generation failed:', error)
      throw error
    }
  },

  async processAISignal(input: any): Promise<any> {
    // Simplified AI logic - in production would use actual ML models
    const { symbol, marketData, technicalAnalysis, sentimentData } = input
    
    // Calculate signal type based on multiple factors
    const bullishSignals = [
      technicalAnalysis.rsi < 30, // Oversold
      technicalAnalysis.macd_signal > 0, // Bullish MACD
      sentimentData?.sentiment_score > 0.3, // Positive sentiment
      technicalAnalysis.price_above_ma20,
    ].filter(Boolean).length

    const bearishSignals = [
      technicalAnalysis.rsi > 70, // Overbought
      technicalAnalysis.macd_signal < 0, // Bearish MACD
      sentimentData?.sentiment_score < -0.3, // Negative sentiment
      !technicalAnalysis.price_above_ma20,
    ].filter(Boolean).length

    const signalType = bullishSignals > bearishSignals ? 'call' : 'put'
    const currentPrice = marketData.close
    
    // Calculate entry, target, and stop loss
    const volatility = technicalAnalysis.atr || (currentPrice * 0.02)
    const riskRewardRatio = 2

    let entry_price, target_price, stop_loss

    if (signalType === 'call') {
      entry_price = currentPrice
      target_price = currentPrice + (volatility * riskRewardRatio)
      stop_loss = currentPrice - volatility
    } else {
      entry_price = currentPrice
      target_price = currentPrice - (volatility * riskRewardRatio)
      stop_loss = currentPrice + volatility
    }

    // Calculate confidence based on signal strength
    const totalSignals = bullishSignals + bearishSignals
    const confidence = Math.min(95, Math.max(60, (Math.abs(bullishSignals - bearishSignals) / totalSignals) * 100))

    return {
      type: signalType,
      entry_price,
      target_price,
      stop_loss,
      expiry_time: new Date(Date.now() + 4 * 60 * 60 * 1000).toISOString(), // 4 hours
      confidence,
      analysis: {
        technical_score: (bullishSignals - bearishSignals) / 4,
        sentiment_score: sentimentData?.sentiment_score || 0,
        volatility,
        rsi: technicalAnalysis.rsi,
        macd: technicalAnalysis.macd_signal,
        support_levels: technicalAnalysis.support_levels,
        resistance_levels: technicalAnalysis.resistance_levels
      }
    }
  },

  // Market Data and Analysis
  async getMarketData(symbol: string, timeframe: string): Promise<any> {
    // In production, integrate with real market data APIs
    // For now, return mock data structure
    return {
      symbol,
      timeframe,
      open: 1.1234,
      high: 1.1267,
      low: 1.1201,
      close: 1.1245,
      volume: 15420,
      timestamp: new Date().toISOString()
    }
  },

  async analyzeTechnical(marketData: any): Promise<any> {
    // Simplified technical analysis - in production use proper libraries
    const price = marketData.close
    const high = marketData.high
    const low = marketData.low
    
    return {
      rsi: Math.random() * 100, // Mock RSI
      macd_signal: (Math.random() - 0.5) * 0.01, // Mock MACD
      atr: (high - low), // Average True Range
      price_above_ma20: Math.random() > 0.5,
      support_levels: [price * 0.98, price * 0.96],
      resistance_levels: [price * 1.02, price * 1.04],
      bollinger_upper: price * 1.015,
      bollinger_lower: price * 0.985,
      volume_trend: Math.random() > 0.5 ? 'increasing' : 'decreasing'
    }
  },

  // AI Recommendations
  async getUserRecommendations(userId: string): Promise<AIRecommendation[]> {
    const { data, error } = await supabase
      .from('ai_recommendations')
      .select('*')
      .eq('user_id', userId)
      .eq('status', 'pending')
      .order('confidence_score', { ascending: false })
      .limit(10)

    if (error) throw error
    return data || []
  },

  async generateRecommendations(userId: string): Promise<AIRecommendation[]> {
    // Get user's trading history and preferences
    const userAnalytics = await this.getUserTradingProfile(userId)
    const marketConditions = await this.getCurrentMarketConditions()
    
    const recommendations = []

    // Portfolio rebalancing recommendation
    if (userAnalytics.risk_score > 70) {
      recommendations.push({
        user_id: userId,
        type: 'portfolio' as const,
        title: 'تخفيض المخاطر المطلوب',
        description: 'مستوى المخاطر في محفظتك مرتفع. ننصح بتقليل حجم المراكز وتنويع الاستثمارات.',
        data: {
          current_risk: userAnalytics.risk_score,
          recommended_risk: 50,
          suggested_actions: ['تقليل حجم المراكز بنسبة 30%', 'تنويع في 3 أزواج عملات مختلفة']
        },
        confidence_score: 85,
        status: 'pending' as const,
        expires_at: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString()
      })
    }

    // Trading strategy recommendation
    if (userAnalytics.win_rate < 60) {
      recommendations.push({
        user_id: userId,
        type: 'strategy' as const,
        title: 'تحسين استراتيجية التداول',
        description: 'معدل النجاح الحالي يمكن تحسينه باتباع إشارات الاتجاه القوي فقط.',
        data: {
          current_win_rate: userAnalytics.win_rate,
          target_win_rate: 75,
          recommended_strategy: 'trend_following',
          focus_symbols: ['EURUSD', 'GBPUSD', 'USDJPY']
        },
        confidence_score: 78,
        status: 'pending' as const,
        expires_at: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString()
      })
    }

    // Market opportunity recommendation
    if (marketConditions.volatility_score > 80) {
      recommendations.push({
        user_id: userId,
        type: 'signal' as const,
        title: 'فرصة تداول عالية التقلب',
        description: 'السوق يظهر تقلبات عالية. فرص ممتازة للتداول قصير المدى.',
        data: {
          volatility_level: marketConditions.volatility_score,
          recommended_timeframes: ['15M', '1H'],
          risk_level: 'medium',
          expected_profit: '2-4%'
        },
        confidence_score: 90,
        status: 'pending' as const,
        expires_at: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString()
      })
    }

    // Save recommendations to database
    for (const rec of recommendations) {
      const { data, error } = await supabase
        .from('ai_recommendations')
        .insert(rec)
        .select()
        .single()

      if (error) {
        console.error('Failed to save recommendation:', error)
        continue
      }
    }

    return recommendations
  },

  async applyRecommendation(recommendationId: string): Promise<void> {
    const { error } = await supabase
      .from('ai_recommendations')
      .update({ status: 'applied', updated_at: new Date().toISOString() })
      .eq('id', recommendationId)

    if (error) throw error
  },

  async dismissRecommendation(recommendationId: string): Promise<void> {
    const { error } = await supabase
      .from('ai_recommendations')
      .update({ status: 'dismissed', updated_at: new Date().toISOString() })
      .eq('id', recommendationId)

    if (error) throw error
  },

  // Market Sentiment Analysis
  async getMarketSentiment(symbol: string): Promise<MarketSentiment | null> {
    const { data, error } = await supabase
      .from('market_sentiment')
      .select('*')
      .eq('symbol', symbol)
      .order('analysis_timestamp', { ascending: false })
      .limit(1)
      .single()

    if (error && error.code !== 'PGRST116') throw error
    return data || null
  },

  async updateMarketSentiment(symbol: string): Promise<MarketSentiment> {
    // Analyze sentiment from multiple sources
    const newsData = await this.analyzeNewsSentiment(symbol)
    const socialData = await this.analyzeSocialSentiment(symbol)
    const technicalData = await this.analyzeTechnicalSentiment(symbol)

    // Calculate overall sentiment
    const overallSentiment = (newsData.score + socialData.score + technicalData.score) / 3
    
    const sentimentData = {
      symbol,
      sentiment_score: overallSentiment,
      bullish_percentage: Math.max(0, overallSentiment * 50 + 50),
      bearish_percentage: Math.max(0, -overallSentiment * 50 + 50),
      neutral_percentage: Math.max(0, 100 - Math.abs(overallSentiment * 100)),
      news_sentiment: newsData.score,
      social_sentiment: socialData.score,
      technical_sentiment: technicalData.score,
      analysis_timestamp: new Date().toISOString()
    }

    const { data, error } = await supabase
      .from('market_sentiment')
      .insert(sentimentData)
      .select()
      .single()

    if (error) throw error
    return data
  },

  // Risk Assessment
  async assessUserRisk(userId: string): Promise<RiskAssessment> {
    const userProfile = await this.getUserTradingProfile(userId)
    const portfolioData = await this.getUserPortfolio(userId)
    const marketRisk = await this.getMarketRiskLevel()

    // Calculate different risk components
    const portfolioRisk = this.calculatePortfolioRisk(portfolioData)
    const concentrationRisk = this.calculateConcentrationRisk(portfolioData)
    const volatilityRisk = this.calculateVolatilityRisk(portfolioData)

    // Overall risk score (weighted average)
    const overallRisk = (
      portfolioRisk * 0.4 +
      marketRisk * 0.3 +
      concentrationRisk * 0.2 +
      volatilityRisk * 0.1
    )

    const recommendations = this.generateRiskRecommendations(overallRisk, {
      portfolioRisk,
      marketRisk,
      concentrationRisk,
      volatilityRisk
    })

    const assessment = {
      user_id: userId,
      overall_risk_score: Math.round(overallRisk),
      portfolio_risk: Math.round(portfolioRisk),
      market_risk: Math.round(marketRisk),
      volatility_risk: Math.round(volatilityRisk),
      concentration_risk: Math.round(concentrationRisk),
      recommendations,
      assessment_data: {
        methodology: 'composite_risk_model_v1',
        factors_analyzed: ['portfolio_composition', 'market_conditions', 'historical_volatility', 'concentration'],
        confidence_level: 0.85
      }
    }

    const { data, error } = await supabase
      .from('risk_assessments')
      .insert(assessment)
      .select()
      .single()

    if (error) throw error
    return data
  },

  // Helper methods
  async getUserTradingProfile(userId: string): Promise<any> {
    // Mock user profile - in production, get from analytics
    return {
      risk_score: 65,
      win_rate: 68,
      avg_trade_size: 0.1,
      trading_frequency: 'moderate',
      preferred_symbols: ['EURUSD', 'GBPUSD'],
      experience_level: 'intermediate'
    }
  },

  async getCurrentMarketConditions(): Promise<any> {
    return {
      volatility_score: 75,
      trend_strength: 'strong',
      liquidity_level: 'high',
      major_events: ['ECB Meeting', 'NFP Release']
    }
  },

  async analyzeNewsSentiment(symbol: string): Promise<{ score: number }> {
    // Mock news sentiment analysis
    return { score: (Math.random() - 0.5) * 2 }
  },

  async analyzeSocialSentiment(symbol: string): Promise<{ score: number }> {
    // Mock social sentiment analysis
    return { score: (Math.random() - 0.5) * 2 }
  },

  async analyzeTechnicalSentiment(symbol: string): Promise<{ score: number }> {
    // Mock technical sentiment analysis
    return { score: (Math.random() - 0.5) * 2 }
  },

  async getUserPortfolio(userId: string): Promise<any> {
    // Mock portfolio data
    return {
      positions: [
        { symbol: 'EURUSD', size: 0.5, pnl: 150 },
        { symbol: 'GBPUSD', size: 0.3, pnl: -80 },
        { symbol: 'USDJPY', size: 0.2, pnl: 200 }
      ],
      total_value: 10000,
      available_margin: 5000
    }
  },

  async getMarketRiskLevel(): Promise<number> {
    // Mock market risk calculation
    return Math.random() * 100
  },

  calculatePortfolioRisk(portfolio: any): number {
    // Simplified portfolio risk calculation
    const totalExposure = portfolio.positions.reduce((sum: number, pos: any) => sum + Math.abs(pos.size), 0)
    return Math.min(100, totalExposure * 50)
  },

  calculateConcentrationRisk(portfolio: any): number {
    // Calculate concentration in single positions
    const positions = portfolio.positions
    const maxPosition = Math.max(...positions.map((p: any) => Math.abs(p.size)))
    return maxPosition > 0.5 ? 80 : 30
  },

  calculateVolatilityRisk(portfolio: any): number {
    // Mock volatility risk based on PnL variation
    const pnls = portfolio.positions.map((p: any) => p.pnl)
    const variance = pnls.reduce((sum: number, pnl: number) => sum + Math.pow(pnl, 2), 0) / pnls.length
    return Math.min(100, Math.sqrt(variance) / 10)
  },

  generateRiskRecommendations(overallRisk: number, riskComponents: any): string[] {
    const recommendations = []

    if (overallRisk > 80) {
      recommendations.push('تقليل حجم المراكز المفتوحة فوراً')
      recommendations.push('إغلاق المراكز الخاسرة لتقليل المخاطر')
    } else if (overallRisk > 60) {
      recommendations.push('مراجعة استراتيجية إدارة المخاطر')
      recommendations.push('تنويع المحفظة عبر أزواج عملات مختلفة')
    }

    if (riskComponents.concentrationRisk > 70) {
      recommendations.push('تجنب التركيز في زوج عملة واحد')
    }

    if (riskComponents.volatilityRisk > 70) {
      recommendations.push('تجنب التداول في الأسواق عالية التقلب')
    }

    return recommendations
  }
}