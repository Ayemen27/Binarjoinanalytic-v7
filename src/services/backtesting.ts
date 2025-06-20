/**
 * نظام اختبار الاستراتيجيات التاريخي (Backtesting)
 * Advanced Backtesting Engine
 */

export interface BacktestingStrategy {
  id: string;
  name: string;
  description: string;
  parameters: Record<string, any>;
  entryConditions: string[];
  exitConditions: string[];
  riskManagement: {
    maxRisk: number;
    stopLoss: number;
    takeProfit: number;
    positionSizing: 'fixed' | 'percentage' | 'dynamic';
  };
}

export interface BacktestingResult {
  strategy: BacktestingStrategy;
  performance: {
    totalTrades: number;
    winningTrades: number;
    losingTrades: number;
    winRate: number;
    totalReturn: number;
    maxDrawdown: number;
    sharpeRatio: number;
    profitFactor: number;
    averageWin: number;
    averageLoss: number;
    expectancy: number;
  };
  trades: BacktestTrade[];
  equityCurve: EquityPoint[];
  monthlyReturns: MonthlyReturn[];
  riskMetrics: RiskMetrics;
}

export interface BacktestTrade {
  id: string;
  symbol: string;
  direction: 'BUY' | 'SELL';
  entryDate: string;
  exitDate: string;
  entryPrice: number;
  exitPrice: number;
  quantity: number;
  commission: number;
  profit: number;
  profitPercentage: number;
  duration: number; // بالساعات
  exitReason: 'stop_loss' | 'take_profit' | 'strategy_exit' | 'time_limit';
}

export interface EquityPoint {
  date: string;
  equity: number;
  drawdown: number;
}

export interface MonthlyReturn {
  month: string;
  return: number;
  trades: number;
}

export interface RiskMetrics {
  volatility: number;
  maxConsecutiveLosses: number;
  maxConsecutiveWins: number;
  largestWin: number;
  largestLoss: number;
  averageTradeDuration: number;
  calmarRatio: number;
  sortinoRatio: number;
}

export interface BacktestingConfig {
  startDate: string;
  endDate: string;
  initialCapital: number;
  commission: number;
  slippage: number;
  symbols: string[];
  timeframe: string;
  currency: string;
}

export class BacktestingEngine {
  private config: BacktestingConfig;
  private marketData: Map<string, any[]> = new Map();

  constructor(config: BacktestingConfig) {
    this.config = config;
  }

  /**
   * تشغيل اختبار تاريخي للاستراتيجية
   */
  async runBacktest(strategy: BacktestingStrategy): Promise<BacktestingResult> {
    try {
      console.log(`بدء اختبار الاستراتيجية: ${strategy.name}`);
      
      // تحميل البيانات التاريخية
      await this.loadMarketData();
      
      // تشغيل المحاكاة
      const trades = await this.simulateStrategy(strategy);
      
      // حساب الأداء
      const performance = this.calculatePerformance(trades);
      
      // حساب منحنى الأسهم
      const equityCurve = this.calculateEquityCurve(trades);
      
      // حساب العوائد الشهرية
      const monthlyReturns = this.calculateMonthlyReturns(trades);
      
      // حساب مقاييس المخاطر
      const riskMetrics = this.calculateRiskMetrics(trades, equityCurve);
      
      return {
        strategy,
        performance,
        trades,
        equityCurve,
        monthlyReturns,
        riskMetrics
      };
      
    } catch (error) {
      console.error('خطأ في تشغيل الاختبار التاريخي:', error);
      throw error;
    }
  }

  /**
   * محاكاة تشغيل الاستراتيجية
   */
  private async simulateStrategy(strategy: BacktestingStrategy): Promise<BacktestTrade[]> {
    const trades: BacktestTrade[] = [];
    let currentCapital = this.config.initialCapital;
    let position: any = null;

    for (const symbol of this.config.symbols) {
      const data = this.marketData.get(symbol) || [];
      
      for (let i = 1; i < data.length; i++) {
        const currentBar = data[i];
        const previousBar = data[i - 1];
        
        // فحص شروط الدخول إذا لم يكن هناك مركز مفتوح
        if (!position) {
          const entrySignal = this.checkEntryConditions(
            strategy,
            currentBar,
            previousBar,
            data.slice(Math.max(0, i - 50), i)
          );
          
          if (entrySignal) {
            position = this.openPosition(
              symbol,
              entrySignal.direction,
              currentBar,
              currentCapital,
              strategy
            );
          }
        }
        
        // فحص شروط الخروج إذا كان هناك مركز مفتوح
        if (position) {
          const exitSignal = this.checkExitConditions(
            strategy,
            position,
            currentBar,
            previousBar
          );
          
          if (exitSignal) {
            const trade = this.closePosition(position, currentBar, exitSignal.reason);
            trades.push(trade);
            currentCapital += trade.profit;
            position = null;
          }
        }
      }
      
      // إغلاق أي مركز متبقي في نهاية البيانات
      if (position) {
        const lastBar = data[data.length - 1];
        const trade = this.closePosition(position, lastBar, 'strategy_exit');
        trades.push(trade);
      }
    }

    return trades;
  }

  /**
   * فحص شروط الدخول
   */
  private checkEntryConditions(
    strategy: BacktestingStrategy,
    currentBar: any,
    previousBar: any,
    historicalData: any[]
  ): { direction: 'BUY' | 'SELL' } | null {
    // تطبيق شروط الدخول حسب الاستراتيجية
    const indicators = this.calculateIndicators(historicalData);
    
    // مثال: استراتيجية قائمة على RSI و MACD
    if (strategy.name === 'RSI_MACD_Strategy') {
      if (indicators.rsi < 30 && indicators.macd > indicators.macdSignal) {
        return { direction: 'BUY' };
      } else if (indicators.rsi > 70 && indicators.macd < indicators.macdSignal) {
        return { direction: 'SELL' };
      }
    }
    
    // مثال: استراتيجية الاختراق
    if (strategy.name === 'Breakout_Strategy') {
      const resistance = Math.max(...historicalData.slice(-20).map(d => d.high));
      const support = Math.min(...historicalData.slice(-20).map(d => d.low));
      
      if (currentBar.close > resistance) {
        return { direction: 'BUY' };
      } else if (currentBar.close < support) {
        return { direction: 'SELL' };
      }
    }
    
    return null;
  }

  /**
   * فحص شروط الخروج
   */
  private checkExitConditions(
    strategy: BacktestingStrategy,
    position: any,
    currentBar: any,
    previousBar: any
  ): { reason: string } | null {
    const currentPrice = currentBar.close;
    const entryPrice = position.entryPrice;
    
    // فحص وقف الخسارة
    if (position.direction === 'BUY') {
      if (currentPrice <= position.stopLoss) {
        return { reason: 'stop_loss' };
      }
      if (currentPrice >= position.takeProfit) {
        return { reason: 'take_profit' };
      }
    } else {
      if (currentPrice >= position.stopLoss) {
        return { reason: 'stop_loss' };
      }
      if (currentPrice <= position.takeProfit) {
        return { reason: 'take_profit' };
      }
    }
    
    // فحص حد الوقت
    const maxHours = strategy.parameters.maxHoldingTime || 24;
    const positionAge = (new Date(currentBar.date).getTime() - new Date(position.entryDate).getTime()) / (1000 * 60 * 60);
    
    if (positionAge >= maxHours) {
      return { reason: 'time_limit' };
    }
    
    return null;
  }

  /**
   * فتح مركز جديد
   */
  private openPosition(
    symbol: string,
    direction: 'BUY' | 'SELL',
    bar: any,
    capital: number,
    strategy: BacktestingStrategy
  ): any {
    const entryPrice = bar.close;
    const riskPerTrade = capital * (strategy.riskManagement.maxRisk / 100);
    
    let stopLoss: number;
    let takeProfit: number;
    
    if (direction === 'BUY') {
      stopLoss = entryPrice * (1 - strategy.riskManagement.stopLoss / 100);
      takeProfit = entryPrice * (1 + strategy.riskManagement.takeProfit / 100);
    } else {
      stopLoss = entryPrice * (1 + strategy.riskManagement.stopLoss / 100);
      takeProfit = entryPrice * (1 - strategy.riskManagement.takeProfit / 100);
    }
    
    const riskPerUnit = Math.abs(entryPrice - stopLoss);
    const quantity = riskPerTrade / riskPerUnit;
    
    return {
      symbol,
      direction,
      entryPrice,
      entryDate: bar.date,
      stopLoss,
      takeProfit,
      quantity
    };
  }

  /**
   * إغلاق مركز
   */
  private closePosition(position: any, bar: any, exitReason: string): BacktestTrade {
    const exitPrice = bar.close;
    const exitDate = bar.date;
    
    let profit: number;
    if (position.direction === 'BUY') {
      profit = (exitPrice - position.entryPrice) * position.quantity;
    } else {
      profit = (position.entryPrice - exitPrice) * position.quantity;
    }
    
    // خصم العمولة
    const commission = (position.entryPrice + exitPrice) * position.quantity * (this.config.commission / 100);
    profit -= commission;
    
    const profitPercentage = (profit / (position.entryPrice * position.quantity)) * 100;
    const duration = (new Date(exitDate).getTime() - new Date(position.entryDate).getTime()) / (1000 * 60 * 60);
    
    return {
      id: `trade_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      symbol: position.symbol,
      direction: position.direction,
      entryDate: position.entryDate,
      exitDate,
      entryPrice: position.entryPrice,
      exitPrice,
      quantity: position.quantity,
      commission,
      profit,
      profitPercentage,
      duration,
      exitReason: exitReason as any
    };
  }

  /**
   * حساب الأداء العام
   */
  private calculatePerformance(trades: BacktestTrade[]): BacktestingResult['performance'] {
    if (trades.length === 0) {
      return {
        totalTrades: 0,
        winningTrades: 0,
        losingTrades: 0,
        winRate: 0,
        totalReturn: 0,
        maxDrawdown: 0,
        sharpeRatio: 0,
        profitFactor: 0,
        averageWin: 0,
        averageLoss: 0,
        expectancy: 0
      };
    }
    
    const winningTrades = trades.filter(t => t.profit > 0);
    const losingTrades = trades.filter(t => t.profit < 0);
    
    const totalProfit = trades.reduce((sum, t) => sum + t.profit, 0);
    const totalWins = winningTrades.reduce((sum, t) => sum + t.profit, 0);
    const totalLosses = Math.abs(losingTrades.reduce((sum, t) => sum + t.profit, 0));
    
    const winRate = (winningTrades.length / trades.length) * 100;
    const averageWin = winningTrades.length > 0 ? totalWins / winningTrades.length : 0;
    const averageLoss = losingTrades.length > 0 ? totalLosses / losingTrades.length : 0;
    const profitFactor = totalLosses > 0 ? totalWins / totalLosses : totalWins;
    const expectancy = (winRate / 100) * averageWin - ((100 - winRate) / 100) * averageLoss;
    
    return {
      totalTrades: trades.length,
      winningTrades: winningTrades.length,
      losingTrades: losingTrades.length,
      winRate,
      totalReturn: (totalProfit / this.config.initialCapital) * 100,
      maxDrawdown: this.calculateMaxDrawdown(trades),
      sharpeRatio: this.calculateSharpeRatio(trades),
      profitFactor,
      averageWin,
      averageLoss,
      expectancy
    };
  }

  /**
   * حساب منحنى الأسهم
   */
  private calculateEquityCurve(trades: BacktestTrade[]): EquityPoint[] {
    const curve: EquityPoint[] = [];
    let equity = this.config.initialCapital;
    let peak = equity;
    
    curve.push({
      date: this.config.startDate,
      equity,
      drawdown: 0
    });
    
    for (const trade of trades) {
      equity += trade.profit;
      
      if (equity > peak) {
        peak = equity;
      }
      
      const drawdown = ((peak - equity) / peak) * 100;
      
      curve.push({
        date: trade.exitDate,
        equity,
        drawdown
      });
    }
    
    return curve;
  }

  /**
   * حساب العوائد الشهرية
   */
  private calculateMonthlyReturns(trades: BacktestTrade[]): MonthlyReturn[] {
    const monthlyData: Map<string, { profit: number, trades: number }> = new Map();
    
    for (const trade of trades) {
      const month = trade.exitDate.substring(0, 7); // YYYY-MM
      const existing = monthlyData.get(month) || { profit: 0, trades: 0 };
      
      monthlyData.set(month, {
        profit: existing.profit + trade.profit,
        trades: existing.trades + 1
      });
    }
    
    return Array.from(monthlyData.entries()).map(([month, data]) => ({
      month,
      return: (data.profit / this.config.initialCapital) * 100,
      trades: data.trades
    }));
  }

  /**
   * حساب مقاييس المخاطر
   */
  private calculateRiskMetrics(trades: BacktestTrade[], equityCurve: EquityPoint[]): RiskMetrics {
    const returns = trades.map(t => t.profitPercentage);
    const volatility = this.calculateVolatility(returns);
    
    // أطول سلسلة خسائر/أرباح متتالية
    let maxConsecutiveLosses = 0;
    let maxConsecutiveWins = 0;
    let currentLosses = 0;
    let currentWins = 0;
    
    for (const trade of trades) {
      if (trade.profit < 0) {
        currentLosses++;
        currentWins = 0;
        maxConsecutiveLosses = Math.max(maxConsecutiveLosses, currentLosses);
      } else {
        currentWins++;
        currentLosses = 0;
        maxConsecutiveWins = Math.max(maxConsecutiveWins, currentWins);
      }
    }
    
    const profits = trades.map(t => t.profit);
    const largestWin = Math.max(...profits);
    const largestLoss = Math.min(...profits);
    const averageTradeDuration = trades.reduce((sum, t) => sum + t.duration, 0) / trades.length;
    
    const maxDrawdown = Math.max(...equityCurve.map(p => p.drawdown));
    const totalReturn = equityCurve[equityCurve.length - 1].equity / this.config.initialCapital - 1;
    const calmarRatio = maxDrawdown > 0 ? (totalReturn * 100) / maxDrawdown : 0;
    
    const negativeReturns = returns.filter(r => r < 0);
    const downvol = negativeReturns.length > 0 ? this.calculateVolatility(negativeReturns) : 0;
    const sortinoRatio = downvol > 0 ? (totalReturn * 100) / downvol : 0;
    
    return {
      volatility,
      maxConsecutiveLosses,
      maxConsecutiveWins,
      largestWin,
      largestLoss,
      averageTradeDuration,
      calmarRatio,
      sortinoRatio
    };
  }

  private calculateMaxDrawdown(trades: BacktestTrade[]): number {
    let equity = this.config.initialCapital;
    let peak = equity;
    let maxDrawdown = 0;
    
    for (const trade of trades) {
      equity += trade.profit;
      
      if (equity > peak) {
        peak = equity;
      }
      
      const drawdown = ((peak - equity) / peak) * 100;
      maxDrawdown = Math.max(maxDrawdown, drawdown);
    }
    
    return maxDrawdown;
  }

  private calculateSharpeRatio(trades: BacktestTrade[]): number {
    if (trades.length === 0) return 0;
    
    const returns = trades.map(t => t.profitPercentage);
    const avgReturn = returns.reduce((sum, r) => sum + r, 0) / returns.length;
    const volatility = this.calculateVolatility(returns);
    
    return volatility > 0 ? avgReturn / volatility : 0;
  }

  private calculateVolatility(returns: number[]): number {
    if (returns.length < 2) return 0;
    
    const avgReturn = returns.reduce((sum, r) => sum + r, 0) / returns.length;
    const variance = returns.reduce((sum, r) => sum + Math.pow(r - avgReturn, 2), 0) / (returns.length - 1);
    
    return Math.sqrt(variance);
  }

  private calculateIndicators(data: any[]): any {
    if (data.length < 14) return { rsi: 50, macd: 0, macdSignal: 0 };
    
    // حساب RSI مبسط
    const prices = data.map(d => d.close);
    const rsi = this.calculateRSI(prices, 14);
    
    // حساب MACD مبسط
    const ema12 = this.calculateEMA(prices, 12);
    const ema26 = this.calculateEMA(prices, 26);
    const macd = ema12 - ema26;
    const macdSignal = macd * 0.9; // تبسيط
    
    return { rsi, macd, macdSignal };
  }

  private calculateRSI(prices: number[], period: number): number {
    if (prices.length < period + 1) return 50;

    let gains = 0;
    let losses = 0;

    for (let i = 1; i <= period; i++) {
      const change = prices[i] - prices[i - 1];
      if (change > 0) {
        gains += change;
      } else {
        losses += Math.abs(change);
      }
    }

    const avgGain = gains / period;
    const avgLoss = losses / period;
    const rs = avgGain / avgLoss;
    
    return 100 - (100 / (1 + rs));
  }

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
   * تحميل البيانات التاريخية (محاكاة)
   */
  private async loadMarketData(): Promise<void> {
    for (const symbol of this.config.symbols) {
      const data = this.generateMockMarketData(symbol);
      this.marketData.set(symbol, data);
    }
  }

  private generateMockMarketData(symbol: string): any[] {
    const data = [];
    const startDate = new Date(this.config.startDate);
    const endDate = new Date(this.config.endDate);
    const basePrice = 1.0850;
    
    let currentPrice = basePrice;
    let currentDate = new Date(startDate);
    
    while (currentDate <= endDate) {
      const change = (Math.random() - 0.5) * 0.02; // ±1%
      currentPrice = currentPrice * (1 + change);
      
      const high = currentPrice * (1 + Math.random() * 0.01);
      const low = currentPrice * (1 - Math.random() * 0.01);
      const volume = Math.random() * 1000000 + 500000;
      
      data.push({
        date: currentDate.toISOString(),
        open: currentPrice,
        high,
        low,
        close: currentPrice,
        volume
      });
      
      // إضافة ساعة للبيانات التالية
      currentDate = new Date(currentDate.getTime() + 60 * 60 * 1000);
    }
    
    return data;
  }
}

export default BacktestingEngine;