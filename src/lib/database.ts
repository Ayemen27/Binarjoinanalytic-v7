import { createClient } from '@supabase/supabase-js';
import SignalAIEngine from './ai-engine';

// استخدام المتغيرات المتاحة
const databaseUrl = process.env.DATABASE_URL || '';
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://placeholder.supabase.co';
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'placeholder-key';

export const supabase = createClient(supabaseUrl, supabaseKey);

// دوال قاعدة البيانات للمستخدمين
export const userService = {
  async getAllUsers() {
    try {
      // محاولة جلب البيانات من Supabase أولاً
      const { data, error } = await supabase
        .from('auth.users')
        .select('*');
      
      if (error) {
        console.warn('Supabase not configured, returning sample data');
        return this.getSampleUsers();
      }
      
      return data;
    } catch (error) {
      console.warn('Database connection failed, returning sample data');
      return this.getSampleUsers();
    }
  },

  getSampleUsers() {
    return [
      {
        id: '1',
        email: 'admin@signals.com',
        full_name: 'مدير النظام',
        roles: ['admin'],
        status: 'active',
        created_at: new Date().toISOString()
      },
      {
        id: '2', 
        email: 'trader@example.com',
        full_name: 'أحمد محمد',
        roles: ['trader'],
        status: 'active',
        created_at: new Date().toISOString()
      }
    ];
  },

  async updateUserRole(userId: string, roleId: string) {
    try {
      const { data, error } = await supabase
        .from('user_roles')
        .upsert({
          user_id: userId,
          role_id: roleId,
          assigned_at: new Date().toISOString()
        });
      
      if (error) throw error;
      return data;
    } catch (error) {
      console.warn('Failed to update user role:', error);
      return null;
    }
  }
};

// دوال قاعدة البيانات للإشارات
export const signalService = {
  async createSignal(signalData: any) {
    try {
      // استخدام محرك الذكاء الاصطناعي لتوليد إشارة احترافية
      const aiSignal = await SignalAIEngine.generateIntelligentSignal(
        signalData.symbol,
        signalData.timeframe,
        signalData.risk_level,
        signalData.strategy_name
      );

      const enhancedSignal = {
        ...signalData,
        id: crypto.randomUUID(),
        direction: aiSignal.direction,
        entry_price: aiSignal.entry_price,
        target_price: aiSignal.target_price,
        stop_loss: aiSignal.stop_loss,
        confidence_score: aiSignal.confidence,
        technical_analysis: aiSignal.analysis.technical,
        ai_analysis: {
          sentiment: aiSignal.analysis.sentiment,
          volume_analysis: aiSignal.analysis.volume_analysis,
          news_impact: aiSignal.analysis.news_impact
        },
        reasoning: aiSignal.reasoning,
        created_at: new Date().toISOString()
      };

      const { data, error } = await supabase
        .from('signals')
        .insert(enhancedSignal)
        .select();
      
      if (error) throw error;
      return data[0];
    } catch (error) {
      console.warn('Failed to create signal, using AI generation');
      return this.generateAdvancedSignal(signalData);
    }
  },

  async generateAdvancedSignal(formData: any) {
    // استخدام محرك الذكاء الاصطناعي حتى بدون قاعدة بيانات
    const aiSignal = await SignalAIEngine.generateIntelligentSignal(
      formData.symbol,
      formData.timeframe,
      formData.risk_level,
      formData.strategy_name
    );

    return {
      id: crypto.randomUUID(),
      symbol: aiSignal.symbol,
      direction: aiSignal.direction,
      entry_price: aiSignal.entry_price,
      target_price: aiSignal.target_price,
      stop_loss: aiSignal.stop_loss,
      confidence_score: aiSignal.confidence,
      risk_level: formData.risk_level,
      timeframe: formData.timeframe,
      strategy_name: formData.strategy_name,
      technical_analysis: aiSignal.analysis.technical,
      ai_analysis: aiSignal.analysis,
      status: 'pending',
      created_at: new Date().toISOString(),
      reasoning: aiSignal.reasoning
    };
  },

  generateMockSignal(formData: any) {
    const currentPrice = Math.random() * (1.2000 - 1.0500) + 1.0500;
    const direction = Math.random() > 0.5 ? 'BUY' : 'SELL';
    const pipDifference = Math.random() * 0.01 + 0.005;

    return {
      id: crypto.randomUUID(),
      symbol: formData.symbol,
      direction,
      entry_price: Number(currentPrice.toFixed(5)),
      target_price: Number((direction === 'BUY' ? currentPrice + pipDifference : currentPrice - pipDifference).toFixed(5)),
      stop_loss: Number((direction === 'BUY' ? currentPrice - pipDifference/2 : currentPrice + pipDifference/2).toFixed(5)),
      confidence_score: Math.floor(Math.random() * 30) + 70,
      risk_level: formData.riskLevel,
      timeframe: formData.timeframe,
      strategy_name: formData.strategy,
      technical_analysis: {
        rsi: Math.floor(Math.random() * 40) + 30,
        macd: Math.random() > 0.5 ? 'Bullish' : 'Bearish',
        support: Number((currentPrice - 0.005).toFixed(5)),
        resistance: Number((currentPrice + 0.005).toFixed(5)),
      },
      status: 'pending',
      created_at: new Date().toISOString()
    };
  },

  async getUserSignals(userId: string) {
    try {
      const { data, error } = await supabase
        .from('signals')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      return data;
    } catch (error) {
      console.warn('Failed to fetch signals, returning sample data');
      return this.getSampleSignals();
    }
  },

  getSampleSignals() {
    return [
      {
        id: '1',
        symbol: 'EUR/USD',
        direction: 'BUY',
        entry_price: 1.0850,
        target_price: 1.0950,
        stop_loss: 1.0800,
        confidence_score: 85,
        status: 'success',
        profit_loss: 70,
        created_at: new Date(Date.now() - 86400000).toISOString()
      }
    ];
  }
};

// دوال التنبيهات
export const notificationService = {
  async getUserNotifications(userId: string) {
    try {
      const { data, error } = await supabase
        .from('notifications')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      return data;
    } catch (error) {
      console.warn('Failed to fetch notifications, returning sample data');
      return this.getSampleNotifications();
    }
  },

  getSampleNotifications() {
    return [
      {
        id: '1',
        type: 'signal',
        title: 'إشارة جديدة متاحة',
        message: 'تم توليد إشارة جديدة لزوج EUR/USD',
        is_read: false,
        is_important: true,
        created_at: new Date().toISOString()
      }
    ];
  },

  async markAsRead(notificationId: string) {
    try {
      const { data, error } = await supabase
        .from('notifications')
        .update({ is_read: true, read_at: new Date().toISOString() })
        .eq('id', notificationId);
      
      if (error) throw error;
      return data;
    } catch (error) {
      console.warn('Failed to mark notification as read');
      return null;
    }
  }
};

// فحص حالة قاعدة البيانات
export async function checkDatabaseConnection() {
  try {
    const { data, error } = await supabase
      .from('roles')
      .select('count')
      .limit(1);
    
    return !error;
  } catch (error) {
    return false;
  }
}