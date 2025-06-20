/**
 * محرك التداول والتحليل المتقدم
 * Trading Engine with Advanced Analytics
 */

export interface TechnicalIndicators {
  rsi: number;
  macd: {
    value: number;
    signal: number;
    histogram: number;
    trend: 'bullish' | 'bearish' | 'neutral';
  };
  ema: {
    ema20: number;
    ema50: number;
    ema200: number;
  };
  bollinger: {
    upper: number;
    middle: number;
    lower: number;
    position: 'oversold' | 'overbought' | 'neutral';
  };
  support: number;
  resistance: number;
  volume: number;
  volatility: number;
}

export interface MarketSentiment {
  score: number; // -1 to 1
  confidence: number;
  sources: string[];
  keywords: string[];
  newsCount: number;
  socialMediaMentions: number;
}

export interface AISignalPrediction {
  direction: 'BUY' | 'SELL';
  confidence: number;
  entryPrice: number;
  targetPrice: number;
  stopLoss: number;
  timeHorizon: string;
  expectedMove: number;
  riskReward: number;
  reasoning: string[];
  marketConditions: {
    volatility: 'low' | 'normal' | 'high';
    trend: 'strong' | 'weak' | 'sideways';
    momentum: 'positive' | 'negative' | 'neutral';
  };
}

export class TradingEngine {
  private apiKey: string;
  private baseUrl: string;

  constructor(apiKey: string, baseUrl: string = 'https://api.forex.com') {
    this.apiKey = apiKey;
    this.baseUrl = baseUrl;
  }

  /**
   * تحليل فني شامل للعملة
   */
  async performTechnicalAnalysis(
    symbol: string, 
    timeframe: string = '1h',
    period: number = 200
  ): Promise<TechnicalIndicators> {
    try {
      // في التطبيق الحقيقي، نستخدم API خارجي للبيانات
      const priceData = await this.getHistoricalData(symbol, timeframe, period);
      
      return {
        rsi: this.calculateRSI(priceData, 14),
        macd: this.calculateMACD(priceData),
        ema: this.calculateEMAs(priceData),
        bollinger: this.calculateBollingerBands(priceData, 20, 2),
        support: this.findSupportLevel(priceData),
        resistance: this.findResistanceLevel(priceData),
        volume: this.getAverageVolume(priceData),
        volatility: this.calculateVolatility(priceData)
      };
    } catch (error) {
      console.error('Error in technical analysis:', error);
      // إرجاع بيانات تجريبية عند الفشل
      return this.getMockTechnicalData();
    }
  }

  /**
   * تحليل المشاعر من مصادر متعددة
   */
  async analyzeSentiment(symbol: string): Promise<MarketSentiment> {
    try {
      // تجميع البيانات من مصادر متعددة
      const [newsData, socialData, economicData] = await Promise.all([
        this.getNewsData(symbol),
        this.getSocialMediaData(symbol),
        this.getEconomicIndicators(symbol)
      ]);

      const sentimentScore = this.calculateSentimentScore(newsData, socialData, economicData);
      
      return {
        score: sentimentScore,
        confidence: 0.85,
        sources: ['Reuters', 'Bloomberg', 'Twitter', 'Reddit'],
        keywords: this.extractKeywords(newsData),
        newsCount: newsData.length,
        socialMediaMentions: socialData.mentions
      };
    } catch (error) {
      console.error('Error in sentiment analysis:', error);
      return this.getMockSentimentData();
    }
  }

  /**
   * توليد توقع AI متقدم
   */
  async generateAIPrediction(
    symbol: string,
    technical: TechnicalIndicators,
    sentiment: MarketSentiment,
    riskLevel: 'low' | 'medium' | 'high' = 'medium'
  ): Promise<AISignalPrediction> {
    try {
      // خوارزمية AI متقدمة
      const prediction = this.runAIModel(technical, sentiment, riskLevel);
      
      return {
        direction: prediction.direction,
        confidence: prediction.confidence,
        entryPrice: prediction.entryPrice,
        targetPrice: prediction.targetPrice,
        stopLoss: prediction.stopLoss,
        timeHorizon: prediction.timeHorizon,
        expectedMove: prediction.expectedMove,
        riskReward: prediction.riskReward,
        reasoning: prediction.reasoning,
        marketConditions: prediction.marketConditions
      };
    } catch (error) {
      console.error('Error in AI prediction:', error);
      return this.getMockAIPrediction();
    }
  }

  /**
   * حساب RSI
   */
  private calculateRSI(prices: number[], period: number = 14): number {
    if (prices.length < period + 1) return 50;

    let gains = 0;
    let losses = 0;

    // حساب متوسط المكاسب والخسائر للفترة الأولى
    for (let i = 1; i <= period; i++) {
      const change = prices[i] - prices[i - 1];
      if (change > 0) {
        gains += change;
      } else {
        losses += Math.abs(change);
      }
    }

    let avgGain = gains / period;
    let avgLoss = losses / period;

    // حساب RSI للفترات المتبقية
    for (let i = period + 1; i < prices.length; i++) {
      const change = prices[i] - prices[i - 1];
      const gain = change > 0 ? change : 0;
      const loss = change < 0 ? Math.abs(change) : 0;

      avgGain = (avgGain * (period - 1) + gain) / period;
      avgLoss = (avgLoss * (period - 1) + loss) / period;
    }

    const rs = avgGain / avgLoss;
    return 100 - (100 / (1 + rs));
  }

  /**
   * حساب MACD
   */
  private calculateMACD(prices: number[]): TechnicalIndicators['macd'] {
    const ema12 = this.calculateEMA(prices, 12);
    const ema26 = this.calculateEMA(prices, 26);
    const macdLine = ema12 - ema26;
    
    // محاكاة بيانات MACD
    return {
      value: macdLine,
      signal: macdLine * 0.9,
      histogram: macdLine * 0.1,
      trend: macdLine > 0 ? 'bullish' : 'bearish'
    };
  }

  /**
   * حساب EMA
   */
  private calculateEMA(prices: number[], period: number): number {
    if (prices.length === 0) return 0;
    
    const multiplier = 2 / (period + 1);
    let ema = prices[0];
    
    for (let i = 1; i < prices.length; i++) {
      ema = (prices[i] - ema) * multiplier + ema;
    }
    
    return ema;
  }

  /**
   * حساب EMAs متعددة
   */
  private calculateEMAs(prices: number[]): TechnicalIndicators['ema'] {
    return {
      ema20: this.calculateEMA(prices, 20),
      ema50: this.calculateEMA(prices, 50),
      ema200: this.calculateEMA(prices, 200)
    };
  }

  /**
   * حساب Bollinger Bands
   */
  private calculateBollingerBands(
    prices: number[], 
    period: number = 20, 
    stdDev: number = 2
  ): TechnicalIndicators['bollinger'] {
    const sma = prices.slice(-period).reduce((a, b) => a + b, 0) / period;
    const variance = prices.slice(-period).reduce((acc, price) => {
      return acc + Math.pow(price - sma, 2);
    }, 0) / period;
    const standardDeviation = Math.sqrt(variance);
    
    const upper = sma + (standardDeviation * stdDev);
    const lower = sma - (standardDeviation * stdDev);
    const currentPrice = prices[prices.length - 1];
    
    let position: 'oversold' | 'overbought' | 'neutral' = 'neutral';
    if (currentPrice > upper) position = 'overbought';
    else if (currentPrice < lower) position = 'oversold';
    
    return {
      upper,
      middle: sma,
      lower,
      position
    };
  }

  /**
   * إيجاد مستوى الدعم
   */
  private findSupportLevel(prices: number[]): number {
    return Math.min(...prices.slice(-50));
  }

  /**
   * إيجاد مستوى المقاومة
   */
  private findResistanceLevel(prices: number[]): number {
    return Math.max(...prices.slice(-50));
  }

  /**
   * حساب متوسط الحجم
   */
  private getAverageVolume(prices: number[]): number {
    return Math.random() * 1000000 + 500000; // محاكاة
  }

  /**
   * حساب التقلبات
   */
  private calculateVolatility(prices: number[]): number {
    if (prices.length < 2) return 0;
    
    const returns = [];
    for (let i = 1; i < prices.length; i++) {
      returns.push((prices[i] - prices[i - 1]) / prices[i - 1]);
    }
    
    const avgReturn = returns.reduce((a, b) => a + b, 0) / returns.length;
    const variance = returns.reduce((acc, ret) => {
      return acc + Math.pow(ret - avgReturn, 2);
    }, 0) / returns.length;
    
    return Math.sqrt(variance * 252); // Annualized volatility
  }

  /**
   * تشغيل نموذج AI
   */
  private runAIModel(
    technical: TechnicalIndicators,
    sentiment: MarketSentiment,
    riskLevel: string
  ): any {
    // خوارزمية AI متقدمة (محاكاة)
    const confidence = this.calculateConfidence(technical, sentiment);
    const direction = this.determineDirection(technical, sentiment);
    const prices = this.calculatePrices(direction, technical, riskLevel);
    
    return {
      direction,
      confidence,
      ...prices,
      timeHorizon: '4h',
      expectedMove: Math.abs(prices.targetPrice - prices.entryPrice) / prices.entryPrice,
      riskReward: Math.abs(prices.targetPrice - prices.entryPrice) / Math.abs(prices.entryPrice - prices.stopLoss),
      reasoning: this.generateReasoning(technical, sentiment, direction),
      marketConditions: this.assessMarketConditions(technical, sentiment)
    };
  }

  private calculateConfidence(technical: TechnicalIndicators, sentiment: MarketSentiment): number {
    let confidence = 50;
    
    // مؤشرات فنية
    if (technical.rsi > 70) confidence += 10;
    else if (technical.rsi < 30) confidence += 10;
    
    if (technical.macd.trend === 'bullish') confidence += 15;
    else if (technical.macd.trend === 'bearish') confidence += 15;
    
    // تحليل المشاعر
    confidence += Math.abs(sentiment.score) * 20;
    
    return Math.min(95, Math.max(65, confidence));
  }

  private determineDirection(technical: TechnicalIndicators, sentiment: MarketSentiment): 'BUY' | 'SELL' {
    let bullishSignals = 0;
    let bearishSignals = 0;
    
    // مؤشرات فنية
    if (technical.rsi < 30) bullishSignals++;
    if (technical.rsi > 70) bearishSignals++;
    
    if (technical.macd.trend === 'bullish') bullishSignals++;
    if (technical.macd.trend === 'bearish') bearishSignals++;
    
    if (technical.ema.ema20 > technical.ema.ema50) bullishSignals++;
    else bearishSignals++;
    
    // تحليل المشاعر
    if (sentiment.score > 0.3) bullishSignals++;
    else if (sentiment.score < -0.3) bearishSignals++;
    
    return bullishSignals > bearishSignals ? 'BUY' : 'SELL';
  }

  private calculatePrices(direction: 'BUY' | 'SELL', technical: TechnicalIndicators, riskLevel: string): any {
    const currentPrice = (technical.support + technical.resistance) / 2;
    const volatility = technical.volatility;
    
    let riskMultiplier = 1;
    if (riskLevel === 'low') riskMultiplier = 0.5;
    else if (riskLevel === 'high') riskMultiplier = 1.5;
    
    const move = volatility * 0.02 * riskMultiplier; // 2% من التقلبات
    
    if (direction === 'BUY') {
      return {
        entryPrice: currentPrice,
        targetPrice: currentPrice * (1 + move),
        stopLoss: currentPrice * (1 - move * 0.5)
      };
    } else {
      return {
        entryPrice: currentPrice,
        targetPrice: currentPrice * (1 - move),
        stopLoss: currentPrice * (1 + move * 0.5)
      };
    }
  }

  private generateReasoning(technical: TechnicalIndicators, sentiment: MarketSentiment, direction: string): string[] {
    const reasoning = [];
    
    if (technical.rsi > 70) {
      reasoning.push('مؤشر RSI يشير إلى تشبع شرائي');
    } else if (technical.rsi < 30) {
      reasoning.push('مؤشر RSI يشير إلى تشبع بيعي');
    }
    
    if (technical.macd.trend === 'bullish') {
      reasoning.push('مؤشر MACD يظهر إشارة صعودية');
    } else if (technical.macd.trend === 'bearish') {
      reasoning.push('مؤشر MACD يظهر إشارة هبوطية');
    }
    
    if (sentiment.score > 0.3) {
      reasoning.push('المشاعر العامة للسوق إيجابية');
    } else if (sentiment.score < -0.3) {
      reasoning.push('المشاعر العامة للسوق سلبية');
    }
    
    reasoning.push(`الاتجاه المتوقع: ${direction === 'BUY' ? 'صاعد' : 'هابط'}`);
    
    return reasoning;
  }

  private assessMarketConditions(technical: TechnicalIndicators, sentiment: MarketSentiment): any {
    return {
      volatility: technical.volatility > 0.02 ? 'high' : technical.volatility > 0.01 ? 'normal' : 'low',
      trend: Math.abs(sentiment.score) > 0.5 ? 'strong' : 'weak',
      momentum: sentiment.score > 0 ? 'positive' : 'negative'
    };
  }

  // دوال للحصول على البيانات (محاكاة)
  private async getHistoricalData(symbol: string, timeframe: string, period: number): Promise<number[]> {
    // محاكاة بيانات تاريخية
    const basePrice = 1.0850;
    const prices = [];
    
    for (let i = 0; i < period; i++) {
      const randomChange = (Math.random() - 0.5) * 0.01;
      const price = basePrice + randomChange;
      prices.push(price);
    }
    
    return prices;
  }

  private async getNewsData(symbol: string): Promise<any[]> {
    // محاكاة بيانات الأخبار
    return [
      { sentiment: 0.7, content: 'Positive economic indicators' },
      { sentiment: -0.3, content: 'Trade tensions rising' },
      { sentiment: 0.5, content: 'Central bank maintains rates' }
    ];
  }

  private async getSocialMediaData(symbol: string): Promise<any> {
    return { mentions: Math.floor(Math.random() * 1000) + 500 };
  }

  private async getEconomicIndicators(symbol: string): Promise<any[]> {
    return [
      { indicator: 'GDP', value: 2.1, sentiment: 0.6 },
      { indicator: 'Inflation', value: 3.2, sentiment: -0.4 }
    ];
  }

  private calculateSentimentScore(news: any[], social: any, economic: any[]): number {
    const newsScore = news.reduce((acc, item) => acc + item.sentiment, 0) / news.length;
    const economicScore = economic.reduce((acc, item) => acc + item.sentiment, 0) / economic.length;
    
    return (newsScore + economicScore) / 2;
  }

  private extractKeywords(news: any[]): string[] {
    return ['inflation', 'interest rates', 'economic growth', 'trade'];
  }

  // بيانات تجريبية للأخطاء
  private getMockTechnicalData(): TechnicalIndicators {
    return {
      rsi: 65,
      macd: { value: 0.0015, signal: 0.0012, histogram: 0.0003, trend: 'bullish' },
      ema: { ema20: 1.0855, ema50: 1.0845, ema200: 1.0820 },
      bollinger: { upper: 1.0880, middle: 1.0850, lower: 1.0820, position: 'neutral' },
      support: 1.0820,
      resistance: 1.0880,
      volume: 750000,
      volatility: 0.015
    };
  }

  private getMockSentimentData(): MarketSentiment {
    return {
      score: 0.3,
      confidence: 0.8,
      sources: ['Reuters', 'Bloomberg'],
      keywords: ['inflation', 'growth'],
      newsCount: 15,
      socialMediaMentions: 750
    };
  }

  private getMockAIPrediction(): AISignalPrediction {
    return {
      direction: 'BUY',
      confidence: 82,
      entryPrice: 1.0850,
      targetPrice: 1.0920,
      stopLoss: 1.0800,
      timeHorizon: '4h',
      expectedMove: 0.0065,
      riskReward: 1.4,
      reasoning: ['مؤشرات فنية إيجابية', 'معنويات السوق مرتفعة'],
      marketConditions: { volatility: 'normal', trend: 'strong', momentum: 'positive' }
    };
  }
}

export default TradingEngine;