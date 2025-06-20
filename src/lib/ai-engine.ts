// محرك الذكاء الاصطناعي لتوليد الإشارات
export interface MarketData {
  symbol: string;
  price: number;
  volume: number;
  timestamp: Date;
  ohlc: {
    open: number;
    high: number;
    low: number;
    close: number;
  };
}

export interface TechnicalIndicators {
  rsi: number;
  macd: {
    value: number;
    signal: number;
    histogram: number;
  };
  ema_20: number;
  ema_50: number;
  bollinger: {
    upper: number;
    middle: number;
    lower: number;
  };
  support: number;
  resistance: number;
}

export interface AISignalGeneration {
  symbol: string;
  direction: 'BUY' | 'SELL';
  confidence: number;
  entry_price: number;
  target_price: number;
  stop_loss: number;
  timeframe: string;
  analysis: {
    technical: TechnicalIndicators;
    sentiment: number; // -1 to 1
    volume_analysis: string;
    news_impact: number;
  };
  reasoning: string[];
}

export class SignalAIEngine {
  // تحليل المؤشرات الفنية
  static calculateTechnicalIndicators(marketData: MarketData[]): TechnicalIndicators {
    const prices = marketData.map(d => d.price);
    const volumes = marketData.map(d => d.volume);
    
    // حساب RSI
    const rsi = this.calculateRSI(prices);
    
    // حساب MACD
    const macd = this.calculateMACD(prices);
    
    // حساب المتوسطات المتحركة
    const ema_20 = this.calculateEMA(prices, 20);
    const ema_50 = this.calculateEMA(prices, 50);
    
    // حساب بولينجر باندز
    const bollinger = this.calculateBollingerBands(prices);
    
    // حساب الدعم والمقاومة
    const support = Math.min(...prices.slice(-20));
    const resistance = Math.max(...prices.slice(-20));

    return {
      rsi,
      macd,
      ema_20,
      ema_50,
      bollinger,
      support,
      resistance
    };
  }

  // حساب مؤشر RSI
  static calculateRSI(prices: number[], period = 14): number {
    if (prices.length < period + 1) return 50;

    let gains = 0;
    let losses = 0;

    for (let i = 1; i <= period; i++) {
      const change = prices[i] - prices[i - 1];
      if (change > 0) gains += change;
      else losses -= change;
    }

    const avgGain = gains / period;
    const avgLoss = losses / period;
    const rs = avgGain / avgLoss;
    
    return 100 - (100 / (1 + rs));
  }

  // حساب MACD
  static calculateMACD(prices: number[]): { value: number; signal: number; histogram: number } {
    if (prices.length < 26) {
      return { value: 0, signal: 0, histogram: 0 };
    }

    const ema12 = this.calculateEMA(prices, 12);
    const ema26 = this.calculateEMA(prices, 26);
    const macdLine = ema12 - ema26;
    
    // تبسيط حساب signal line
    const signalLine = macdLine * 0.8;
    const histogram = macdLine - signalLine;

    return {
      value: macdLine,
      signal: signalLine,
      histogram
    };
  }

  // حساب المتوسط المتحرك الأسي
  static calculateEMA(prices: number[], period: number): number {
    if (prices.length === 0) return 0;
    
    const multiplier = 2 / (period + 1);
    let ema = prices[0];

    for (let i = 1; i < prices.length; i++) {
      ema = (prices[i] * multiplier) + (ema * (1 - multiplier));
    }

    return ema;
  }

  // حساب بولينجر باندز
  static calculateBollingerBands(prices: number[], period = 20): { upper: number; middle: number; lower: number } {
    if (prices.length < period) {
      const avg = prices.reduce((a, b) => a + b, 0) / prices.length;
      return { upper: avg * 1.02, middle: avg, lower: avg * 0.98 };
    }

    const recentPrices = prices.slice(-period);
    const sma = recentPrices.reduce((a, b) => a + b, 0) / period;
    
    const variance = recentPrices.reduce((acc, price) => acc + Math.pow(price - sma, 2), 0) / period;
    const stdDev = Math.sqrt(variance);

    return {
      upper: sma + (stdDev * 2),
      middle: sma,
      lower: sma - (stdDev * 2)
    };
  }

  // تحليل المشاعر (sentiment analysis)
  static analyzeSentiment(symbol: string): number {
    // محاكاة تحليل المشاعر بناءً على الأخبار والسوشيال ميديا
    const sentimentFactors = [
      Math.random() - 0.5, // أخبار عامة
      Math.random() - 0.5, // تغريدات
      Math.random() - 0.5, // تحليلات الخبراء
    ];
    
    return sentimentFactors.reduce((a, b) => a + b, 0) / sentimentFactors.length;
  }

  // توليد إشارة ذكية
  static async generateIntelligentSignal(
    symbol: string,
    timeframe: string,
    riskLevel: string,
    strategy: string
  ): Promise<AISignalGeneration> {
    // محاكاة جلب بيانات السوق الحقيقية
    const marketData = this.simulateMarketData(symbol);
    
    // تحليل المؤشرات الفنية
    const technical = this.calculateTechnicalIndicators(marketData);
    
    // تحليل المشاعر
    const sentiment = this.analyzeSentiment(symbol);
    
    // تحديد الاتجاه بناءً على التحليل المتقدم
    const direction = this.determineDirection(technical, sentiment, strategy);
    
    // حساب مستوى الثقة
    const confidence = this.calculateConfidence(technical, sentiment, riskLevel);
    
    // تحديد نقاط الدخول والخروج
    const currentPrice = marketData[marketData.length - 1].price;
    const { entry_price, target_price, stop_loss } = this.calculateTradingLevels(
      currentPrice, direction, riskLevel, technical
    );

    // تحليل الحجم
    const volumeAnalysis = this.analyzeVolume(marketData);
    
    // تأثير الأخبار
    const newsImpact = Math.random() * 0.4 - 0.2; // -0.2 to 0.2

    return {
      symbol,
      direction,
      confidence,
      entry_price,
      target_price,
      stop_loss,
      timeframe,
      analysis: {
        technical,
        sentiment,
        volume_analysis: volumeAnalysis,
        news_impact: newsImpact
      },
      reasoning: this.generateReasoning(technical, sentiment, direction, strategy)
    };
  }

  // تحديد اتجاه التداول
  static determineDirection(
    technical: TechnicalIndicators,
    sentiment: number,
    strategy: string
  ): 'BUY' | 'SELL' {
    let bullishSignals = 0;
    let bearishSignals = 0;

    // تحليل RSI
    if (technical.rsi < 30) bullishSignals += 2; // oversold
    if (technical.rsi > 70) bearishSignals += 2; // overbought
    if (technical.rsi > 50) bullishSignals += 1;
    else bearishSignals += 1;

    // تحليل MACD
    if (technical.macd.value > technical.macd.signal) bullishSignals += 2;
    else bearishSignals += 2;

    // تحليل المتوسطات المتحركة
    if (technical.ema_20 > technical.ema_50) bullishSignals += 1;
    else bearishSignals += 1;

    // تحليل المشاعر
    if (sentiment > 0.1) bullishSignals += 1;
    else if (sentiment < -0.1) bearishSignals += 1;

    // تطبيق استراتيجية محددة
    switch (strategy) {
      case 'technical':
        // التركيز على المؤشرات الفنية فقط
        break;
      case 'sentiment':
        // زيادة وزن تحليل المشاعر
        if (sentiment > 0) bullishSignals += 2;
        else bearishSignals += 2;
        break;
      case 'ai':
        // تحليل متقدم بوزن متوازن
        bullishSignals *= 1.2;
        bearishSignals *= 1.2;
        break;
    }

    return bullishSignals > bearishSignals ? 'BUY' : 'SELL';
  }

  // حساب مستوى الثقة
  static calculateConfidence(
    technical: TechnicalIndicators,
    sentiment: number,
    riskLevel: string
  ): number {
    let confidence = 60; // قاعدة أساسية

    // تحليل قوة الإشارات
    if (Math.abs(technical.rsi - 50) > 20) confidence += 10;
    if (Math.abs(technical.macd.histogram) > 0.001) confidence += 10;
    if (Math.abs(sentiment) > 0.3) confidence += 10;

    // تعديل بناءً على مستوى المخاطرة
    switch (riskLevel) {
      case 'low':
        confidence = Math.min(confidence, 85); // حد أقصى للمخاطرة المنخفضة
        break;
      case 'high':
        confidence += 5; // السماح بثقة أعلى للمخاطرة العالية
        break;
    }

    return Math.min(Math.max(confidence, 60), 95);
  }

  // حساب مستويات التداول
  static calculateTradingLevels(
    currentPrice: number,
    direction: 'BUY' | 'SELL',
    riskLevel: string,
    technical: TechnicalIndicators
  ) {
    const riskMultipliers = {
      low: 0.5,
      medium: 1.0,
      high: 1.5
    };

    const multiplier = riskMultipliers[riskLevel as keyof typeof riskMultipliers] || 1.0;
    const baseRisk = currentPrice * 0.01 * multiplier; // 1% base risk

    let entry_price = currentPrice;
    let target_price: number;
    let stop_loss: number;

    if (direction === 'BUY') {
      target_price = currentPrice + (baseRisk * 2); // 2:1 reward ratio
      stop_loss = currentPrice - baseRisk;
      
      // تعديل بناءً على الدعم والمقاومة
      if (technical.resistance > currentPrice) {
        target_price = Math.min(target_price, technical.resistance * 0.99);
      }
      if (technical.support < currentPrice) {
        stop_loss = Math.max(stop_loss, technical.support * 1.01);
      }
    } else {
      target_price = currentPrice - (baseRisk * 2);
      stop_loss = currentPrice + baseRisk;
      
      // تعديل بناءً على الدعم والمقاومة
      if (technical.support < currentPrice) {
        target_price = Math.max(target_price, technical.support * 1.01);
      }
      if (technical.resistance > currentPrice) {
        stop_loss = Math.min(stop_loss, technical.resistance * 0.99);
      }
    }

    return {
      entry_price: Number(entry_price.toFixed(5)),
      target_price: Number(target_price.toFixed(5)),
      stop_loss: Number(stop_loss.toFixed(5))
    };
  }

  // تحليل الحجم
  static analyzeVolume(marketData: MarketData[]): string {
    const volumes = marketData.map(d => d.volume);
    const avgVolume = volumes.reduce((a, b) => a + b, 0) / volumes.length;
    const currentVolume = volumes[volumes.length - 1];

    if (currentVolume > avgVolume * 1.5) return 'High volume confirms the signal';
    if (currentVolume < avgVolume * 0.5) return 'Low volume - weak signal';
    return 'Normal volume';
  }

  // توليد التبرير
  static generateReasoning(
    technical: TechnicalIndicators,
    sentiment: number,
    direction: 'BUY' | 'SELL',
    strategy: string
  ): string[] {
    const reasoning: string[] = [];

    // تحليل RSI
    if (technical.rsi < 30) {
      reasoning.push('مؤشر RSI يشير إلى منطقة تشبع بيع - فرصة شراء');
    } else if (technical.rsi > 70) {
      reasoning.push('مؤشر RSI يشير إلى منطقة تشبع شراء - فرصة بيع');
    }

    // تحليل MACD
    if (technical.macd.value > technical.macd.signal) {
      reasoning.push('مؤشر MACD إيجابي - اتجاه صاعد');
    } else {
      reasoning.push('مؤشر MACD سلبي - اتجاه هابط');
    }

    // تحليل المتوسطات المتحركة
    if (technical.ema_20 > technical.ema_50) {
      reasoning.push('المتوسط المتحرك قصير المدى أعلى من طويل المدى - إشارة إيجابية');
    } else {
      reasoning.push('المتوسط المتحرك قصير المدى أقل من طويل المدى - إشارة سلبية');
    }

    // تحليل المشاعر
    if (Math.abs(sentiment) > 0.2) {
      reasoning.push(`تحليل المشاعر ${sentiment > 0 ? 'إيجابي' : 'سلبي'} - يدعم الاتجاه`);
    }

    // إضافة تحليل استراتيجي
    reasoning.push(`تطبيق استراتيجية ${strategy} - تأكيد الإشارة`);

    return reasoning;
  }

  // محاكاة بيانات السوق (للاختبار)
  static simulateMarketData(symbol: string): MarketData[] {
    const data: MarketData[] = [];
    let basePrice = 1.1000; // سعر أساسي

    // تعديل السعر الأساسي حسب الرمز
    if (symbol.includes('GBP')) basePrice = 1.2500;
    if (symbol.includes('JPY')) basePrice = 149.00;
    if (symbol.includes('CHF')) basePrice = 0.9100;

    for (let i = 0; i < 50; i++) {
      const price = basePrice + (Math.random() - 0.5) * 0.01;
      const volume = Math.floor(Math.random() * 100000) + 50000;
      
      data.push({
        symbol,
        price,
        volume,
        timestamp: new Date(Date.now() - (50 - i) * 3600000), // ساعة لكل نقطة
        ohlc: {
          open: price - 0.0005,
          high: price + 0.001,
          low: price - 0.001,
          close: price
        }
      });
    }

    return data;
  }
}

export default SignalAIEngine;