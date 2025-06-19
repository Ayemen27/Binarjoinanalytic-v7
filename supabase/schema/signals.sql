-- نظام توليد الإشارات - قاعدة البيانات
-- إنشاء الجداول الأساسية لنظام الإشارات

-- جدول الإشارات الرئيسي
CREATE TABLE IF NOT EXISTS signals (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL,
    
    -- معلومات الإشارة الأساسية
    signal_type VARCHAR(50) NOT NULL DEFAULT 'technical', -- 'technical', 'ai', 'hybrid', 'sentiment'
    strategy_name VARCHAR(100) DEFAULT 'RSI_MACD',
    symbol VARCHAR(20) NOT NULL,
    timeframe VARCHAR(10) NOT NULL,
    direction VARCHAR(10) NOT NULL, -- 'CALL', 'PUT', 'BUY', 'SELL'
    
    -- أسعار ومستويات
    entry_price DECIMAL(15,8),
    current_price DECIMAL(15,8),
    target_price DECIMAL(15,8),
    stop_loss DECIMAL(15,8),
    take_profit DECIMAL(15,8),
    
    -- توقيت
    entry_time TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    expiry_time TIMESTAMP WITH TIME ZONE,
    duration_minutes INTEGER DEFAULT 60,
    
    -- تقييم ونتائج
    confidence_score INTEGER CHECK (confidence_score BETWEEN 0 AND 100) DEFAULT 75,
    risk_level VARCHAR(20) DEFAULT 'medium',
    expected_payout DECIMAL(5,2) DEFAULT 80.00,
    actual_payout DECIMAL(5,2),
    
    -- تحليل وبيانات
    technical_analysis JSONB DEFAULT '{}',
    ai_analysis JSONB DEFAULT '{}',
    sentiment_analysis JSONB DEFAULT '{}',
    market_conditions JSONB DEFAULT '{}',
    indicators_used TEXT[] DEFAULT ARRAY['RSI', 'MACD'],
    
    -- حالة ونتائج
    status VARCHAR(20) DEFAULT 'pending', -- 'pending', 'active', 'won', 'lost', 'expired', 'cancelled'
    result_price DECIMAL(15,8),
    profit_loss DECIMAL(15,8),
    profit_loss_percentage DECIMAL(7,4),
    
    -- معلومات تقنية
    ai_model_version VARCHAR(50) DEFAULT 'v1.0',
    data_sources TEXT[] DEFAULT ARRAY['technical'],
    execution_time_ms INTEGER DEFAULT 0,
    
    -- تصنيف ومشاركة
    category VARCHAR(50) DEFAULT 'forex',
    tags TEXT[] DEFAULT ARRAY[],
    is_public BOOLEAN DEFAULT false,
    is_premium BOOLEAN DEFAULT false,
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- جدول إعدادات توليد الإشارات
CREATE TABLE IF NOT EXISTS signal_generation_settings (
    user_id UUID PRIMARY KEY,
    
    -- إعدادات عامة
    auto_generation_enabled BOOLEAN DEFAULT true,
    max_signals_per_day INTEGER DEFAULT 10,
    preferred_timeframes TEXT[] DEFAULT ARRAY['5m', '15m', '1h'],
    preferred_symbols TEXT[] DEFAULT ARRAY['EUR/USD', 'GBP/USD', 'USD/JPY'],
    
    -- إعدادات المخاطر
    max_risk_per_signal DECIMAL(5,2) DEFAULT 2.00,
    min_confidence_score INTEGER DEFAULT 70,
    risk_tolerance VARCHAR(20) DEFAULT 'medium',
    
    -- إعدادات AI والتحليل
    ai_models_enabled TEXT[] DEFAULT ARRAY['technical', 'sentiment'],
    technical_indicators TEXT[] DEFAULT ARRAY['RSI', 'MACD', 'EMA'],
    sentiment_sources TEXT[] DEFAULT ARRAY['news', 'social'],
    
    -- إعدادات التنبيهات
    notify_on_generation BOOLEAN DEFAULT true,
    notify_on_expiry BOOLEAN DEFAULT true,
    notify_on_result BOOLEAN DEFAULT true,
    
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- جدول بيانات السوق
CREATE TABLE IF NOT EXISTS market_data (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    symbol VARCHAR(20) NOT NULL,
    timeframe VARCHAR(10) NOT NULL,
    timestamp TIMESTAMP WITH TIME ZONE NOT NULL,
    
    -- OHLCV data
    open_price DECIMAL(15,8),
    high_price DECIMAL(15,8),
    low_price DECIMAL(15,8),
    close_price DECIMAL(15,8),
    volume BIGINT DEFAULT 0,
    
    -- مؤشرات محسوبة
    indicators JSONB DEFAULT '{}',
    
    -- معلومات المصدر
    data_source VARCHAR(50) DEFAULT 'mock',
    quality_score INTEGER DEFAULT 100,
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    UNIQUE(symbol, timeframe, timestamp)
);

-- جدول أداء الاستراتيجيات
CREATE TABLE IF NOT EXISTS strategy_performance (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    strategy_name VARCHAR(100) NOT NULL,
    user_id UUID,
    
    -- إحصائيات الأداء
    total_signals INTEGER DEFAULT 0,
    winning_signals INTEGER DEFAULT 0,
    losing_signals INTEGER DEFAULT 0,
    win_rate DECIMAL(5,2) DEFAULT 0,
    
    -- أرباح وخسائر
    total_profit_loss DECIMAL(15,8) DEFAULT 0,
    average_profit DECIMAL(15,8) DEFAULT 0,
    average_loss DECIMAL(15,8) DEFAULT 0,
    max_consecutive_wins INTEGER DEFAULT 0,
    max_consecutive_losses INTEGER DEFAULT 0,
    
    -- مقاييس المخاطر
    sharpe_ratio DECIMAL(10,6),
    max_drawdown DECIMAL(5,2),
    volatility DECIMAL(5,2),
    
    -- فترة التقييم
    period_start TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    period_end TIMESTAMP WITH TIME ZONE,
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    UNIQUE(strategy_name, user_id, period_start)
);

-- إنشاء الفهارس للأداء
CREATE INDEX IF NOT EXISTS idx_signals_user_id ON signals(user_id);
CREATE INDEX IF NOT EXISTS idx_signals_symbol ON signals(symbol);
CREATE INDEX IF NOT EXISTS idx_signals_status ON signals(status);
CREATE INDEX IF NOT EXISTS idx_signals_created_at ON signals(created_at);
CREATE INDEX IF NOT EXISTS idx_signals_expiry ON signals(expiry_time);
CREATE INDEX IF NOT EXISTS idx_signals_performance ON signals(profit_loss_percentage);
CREATE INDEX IF NOT EXISTS idx_signals_confidence ON signals(confidence_score);
CREATE INDEX IF NOT EXISTS idx_market_data_symbol_time ON market_data(symbol, timeframe, timestamp);
CREATE INDEX IF NOT EXISTS idx_market_data_timestamp ON market_data(timestamp);

-- إدخال بيانات تجريبية للأسعار
INSERT INTO market_data (symbol, timeframe, timestamp, open_price, high_price, low_price, close_price, volume, indicators) VALUES
('EUR/USD', '1h', NOW() - INTERVAL '1 hour', 1.0950, 1.0965, 1.0945, 1.0960, 150000, '{"rsi": 65, "macd": 0.0012, "ema": 1.0958}'),
('EUR/USD', '1h', NOW() - INTERVAL '2 hours', 1.0945, 1.0955, 1.0940, 1.0950, 140000, '{"rsi": 62, "macd": 0.0008, "ema": 1.0952}'),
('GBP/USD', '1h', NOW() - INTERVAL '1 hour', 1.2650, 1.2670, 1.2640, 1.2665, 180000, '{"rsi": 58, "macd": -0.0005, "ema": 1.2655}'),
('USD/JPY', '1h', NOW() - INTERVAL '1 hour', 148.50, 148.80, 148.30, 148.75, 200000, '{"rsi": 70, "macd": 0.25, "ema": 148.60}');

-- إدخال إعدادات افتراضية للمستخدمين
INSERT INTO signal_generation_settings (user_id) 
SELECT id FROM (
    VALUES 
    ('11111111-1111-1111-1111-111111111111'::UUID),
    ('22222222-2222-2222-2222-222222222222'::UUID),
    ('33333333-3333-3333-3333-333333333333'::UUID)
) AS user_ids(id)
ON CONFLICT (user_id) DO NOTHING;