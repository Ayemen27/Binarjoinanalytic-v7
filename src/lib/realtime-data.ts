// نظام البيانات المباشرة والتحديثات الفورية
export interface RealTimePrice {
  symbol: string;
  price: number;
  change: number;
  changePercent: number;
  volume: number;
  timestamp: Date;
  bid: number;
  ask: number;
  spread: number;
}

export interface MarketStatus {
  isOpen: boolean;
  nextOpen?: Date;
  nextClose?: Date;
  timezone: string;
  session: 'asian' | 'european' | 'american' | 'closed';
}

export class RealTimeDataService {
  private static instance: RealTimeDataService;
  private subscribers: Map<string, ((data: RealTimePrice) => void)[]> = new Map();
  private prices: Map<string, RealTimePrice> = new Map();
  private intervals: Map<string, NodeJS.Timeout> = new Map();

  static getInstance(): RealTimeDataService {
    if (!this.instance) {
      this.instance = new RealTimeDataService();
    }
    return this.instance;
  }

  // اشتراك في تحديثات الأسعار المباشرة
  subscribeToPrice(symbol: string, callback: (data: RealTimePrice) => void) {
    if (!this.subscribers.has(symbol)) {
      this.subscribers.set(symbol, []);
      this.startPriceUpdates(symbol);
    }
    
    this.subscribers.get(symbol)!.push(callback);
    
    // إرسال آخر سعر فوراً إذا كان متاحاً
    const lastPrice = this.prices.get(symbol);
    if (lastPrice) {
      callback(lastPrice);
    }
  }

  // إلغاء الاشتراك
  unsubscribeFromPrice(symbol: string, callback: (data: RealTimePrice) => void) {
    const subscribers = this.subscribers.get(symbol);
    if (subscribers) {
      const index = subscribers.indexOf(callback);
      if (index > -1) {
        subscribers.splice(index, 1);
      }
      
      // إيقاف التحديثات إذا لم يعد هناك مشتركون
      if (subscribers.length === 0) {
        this.stopPriceUpdates(symbol);
        this.subscribers.delete(symbol);
      }
    }
  }

  // بدء تحديثات الأسعار
  private startPriceUpdates(symbol: string) {
    // محاكاة تحديثات الأسعار المباشرة (في التطبيق الحقيقي ستكون من API خارجي)
    const basePrice = this.getBasePrice(symbol);
    let currentPrice = basePrice;
    let lastPrice = basePrice;

    const interval = setInterval(() => {
      // محاكاة تحركات الأسعار الطبيعية
      const volatility = 0.0001; // 0.01%
      const randomChange = (Math.random() - 0.5) * 2 * volatility * currentPrice;
      
      lastPrice = currentPrice;
      currentPrice += randomChange;
      
      const change = currentPrice - basePrice;
      const changePercent = (change / basePrice) * 100;
      
      const priceData: RealTimePrice = {
        symbol,
        price: Number(currentPrice.toFixed(5)),
        change: Number(change.toFixed(5)),
        changePercent: Number(changePercent.toFixed(3)),
        volume: Math.floor(Math.random() * 1000000) + 500000,
        timestamp: new Date(),
        bid: Number((currentPrice - 0.00002).toFixed(5)),
        ask: Number((currentPrice + 0.00002).toFixed(5)),
        spread: 0.00004
      };

      this.prices.set(symbol, priceData);
      
      // إشعار جميع المشتركين
      const subscribers = this.subscribers.get(symbol);
      if (subscribers) {
        subscribers.forEach(callback => callback(priceData));
      }
    }, 1000); // تحديث كل ثانية

    this.intervals.set(symbol, interval);
  }

  // إيقاف تحديثات الأسعار
  private stopPriceUpdates(symbol: string) {
    const interval = this.intervals.get(symbol);
    if (interval) {
      clearInterval(interval);
      this.intervals.delete(symbol);
    }
  }

  // الحصول على السعر الأساسي للرمز
  private getBasePrice(symbol: string): number {
    const basePrices: { [key: string]: number } = {
      'EUR/USD': 1.1000,
      'GBP/USD': 1.2500,
      'USD/JPY': 149.00,
      'USD/CHF': 0.9100,
      'AUD/USD': 0.6500,
      'USD/CAD': 1.3500,
      'NZD/USD': 0.6000,
      'EUR/GBP': 0.8800,
      'EUR/JPY': 163.00,
      'GBP/JPY': 186.00
    };

    return basePrices[symbol] || 1.0000;
  }

  // الحصول على آخر سعر
  getLastPrice(symbol: string): RealTimePrice | null {
    return this.prices.get(symbol) || null;
  }

  // الحصول على حالة السوق
  getMarketStatus(): MarketStatus {
    const now = new Date();
    const hours = now.getUTCHours();
    const day = now.getUTCDay();

    // السوق مغلق في عطلة نهاية الأسبوع
    if (day === 0 || day === 6) {
      return {
        isOpen: false,
        nextOpen: this.getNextMonday(),
        timezone: 'UTC',
        session: 'closed'
      };
    }

    // تحديد الجلسة النشطة
    let session: 'asian' | 'european' | 'american' | 'closed' = 'closed';
    let isOpen = false;

    if (hours >= 0 && hours < 9) {
      session = 'asian';
      isOpen = true;
    } else if (hours >= 8 && hours < 17) {
      session = 'european';
      isOpen = true;
    } else if (hours >= 13 && hours < 22) {
      session = 'american';
      isOpen = true;
    }

    return {
      isOpen,
      timezone: 'UTC',
      session
    };
  }

  // الحصول على يوم الاثنين التالي
  private getNextMonday(): Date {
    const now = new Date();
    const daysUntilMonday = (8 - now.getUTCDay()) % 7;
    const nextMonday = new Date(now);
    nextMonday.setUTCDate(now.getUTCDate() + daysUntilMonday);
    nextMonday.setUTCHours(0, 0, 0, 0);
    return nextMonday;
  }

  // تنظيف الموارد
  cleanup() {
    this.intervals.forEach(interval => clearInterval(interval));
    this.intervals.clear();
    this.subscribers.clear();
    this.prices.clear();
  }
}

// خدمة الإشعارات المباشرة
export class RealTimeNotificationService {
  private static instance: RealTimeNotificationService;
  private eventSource: EventSource | null = null;
  private callbacks: ((notification: any) => void)[] = [];

  static getInstance(): RealTimeNotificationService {
    if (!this.instance) {
      this.instance = new RealTimeNotificationService();
    }
    return this.instance;
  }

  // اشتراك في الإشعارات المباشرة
  subscribe(callback: (notification: any) => void) {
    this.callbacks.push(callback);
    
    // بدء الاتصال إذا لم يكن موجوداً
    if (!this.eventSource && this.callbacks.length === 1) {
      this.startEventSource();
    }
  }

  // إلغاء الاشتراك
  unsubscribe(callback: (notification: any) => void) {
    const index = this.callbacks.indexOf(callback);
    if (index > -1) {
      this.callbacks.splice(index, 1);
    }

    // إيقاف الاتصال إذا لم يعد هناك مشتركون
    if (this.callbacks.length === 0) {
      this.stopEventSource();
    }
  }

  // بدء EventSource للإشعارات المباشرة
  private startEventSource() {
    try {
      // في التطبيق الحقيقي، سيكون هذا URL لخدمة الإشعارات
      // this.eventSource = new EventSource('/api/notifications/stream');
      
      // محاكاة الإشعارات المباشرة
      this.simulateRealTimeNotifications();
    } catch (error) {
      console.error('Failed to start EventSource:', error);
    }
  }

  // محاكاة الإشعارات المباشرة
  private simulateRealTimeNotifications() {
    // إشعار دوري كل 30 ثانية
    const interval = setInterval(() => {
      const notifications = [
        {
          id: crypto.randomUUID(),
          type: 'signal',
          title: 'إشارة جديدة متاحة',
          message: 'تم توليد إشارة جديدة بثقة عالية',
          timestamp: new Date().toISOString()
        },
        {
          id: crypto.randomUUID(),
          type: 'market',
          title: 'تحديث السوق',
          message: 'تحركات قوية في السوق الأمريكي',
          timestamp: new Date().toISOString()
        },
        {
          id: crypto.randomUUID(),
          type: 'system',
          title: 'تحديث النظام',
          message: 'تم إضافة ميزات جديدة للمنصة',
          timestamp: new Date().toISOString()
        }
      ];

      // إرسال إشعار عشوائي
      if (Math.random() > 0.7) { // 30% احتمال
        const randomNotification = notifications[Math.floor(Math.random() * notifications.length)];
        this.notifyCallbacks(randomNotification);
      }
    }, 30000);

    // حفظ المرجع لإيقافه لاحقاً
    (this as any).simulationInterval = interval;
  }

  // إيقاف EventSource
  private stopEventSource() {
    if (this.eventSource) {
      this.eventSource.close();
      this.eventSource = null;
    }

    // إيقاف المحاكاة
    if ((this as any).simulationInterval) {
      clearInterval((this as any).simulationInterval);
      (this as any).simulationInterval = null;
    }
  }

  // إشعار جميع المشتركين
  private notifyCallbacks(notification: any) {
    this.callbacks.forEach(callback => {
      try {
        callback(notification);
      } catch (error) {
        console.error('Error in notification callback:', error);
      }
    });
  }

  // تنظيف الموارد
  cleanup() {
    this.stopEventSource();
    this.callbacks = [];
  }
}

export default RealTimeDataService;