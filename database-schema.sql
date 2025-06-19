-- =====================================================
-- المنصة الاحترافية المتكاملة - مخطط قاعدة البيانات
-- Database Schema for Advanced Trading Platform
-- =====================================================

-- Enable required extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- =====================================================
-- 1. نظام إدارة المستخدمين (User Management)
-- =====================================================

-- جدول المستخدمين المحسن
CREATE TABLE users (
    id UUID PRIMARY KEY REFERENCES auth.users(id),
    email VARCHAR(255) UNIQUE NOT NULL,
    full_name VARCHAR(255),
    avatar_url TEXT,
    preferred_language VARCHAR(10) DEFAULT 'ar',
    timezone VARCHAR(50) DEFAULT 'Asia/Riyadh',
    phone_number VARCHAR(20),
    country_code VARCHAR(3),
    email_verified BOOLEAN DEFAULT false,
    phone_verified BOOLEAN DEFAULT false,
    two_factor_enabled BOOLEAN DEFAULT false,
    two_factor_secret TEXT,
    backup_codes TEXT[],
    risk_score INTEGER DEFAULT 0,
    last_login_at TIMESTAMP WITH TIME ZONE,
    last_login_ip INET,
    login_attempts INTEGER DEFAULT 0,
    locked_until TIMESTAMP WITH TIME ZONE,
    metadata JSONB DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    CONSTRAINT valid_risk_score CHECK (risk_score >= 0 AND risk_score <= 100),
    CONSTRAINT valid_login_attempts CHECK (login_attempts >= 0)
);

-- جدول جلسات المستخدمين المتقدم
CREATE TABLE user_sessions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    session_token TEXT NOT NULL UNIQUE,
    refresh_token TEXT NOT NULL UNIQUE,
    device_info JSONB,
    ip_address INET,
    user_agent TEXT,
    geolocation JSONB,
    is_active BOOLEAN DEFAULT true,
    is_trusted BOOLEAN DEFAULT false,
    expires_at TIMESTAMP WITH TIME ZONE,
    last_activity TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- جدول سجل الأمان
CREATE TABLE security_logs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    event_type VARCHAR(50) NOT NULL,
    event_data JSONB,
    ip_address INET,
    user_agent TEXT,
    risk_level VARCHAR(20) DEFAULT 'low',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =====================================================
-- 2. نظام إدارة الصلاحيات والأدوار (RBAC)
-- =====================================================

-- جدول الصلاحيات
CREATE TABLE permissions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(100) UNIQUE NOT NULL,
    resource VARCHAR(50) NOT NULL,
    action VARCHAR(50) NOT NULL,
    description TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    UNIQUE(resource, action)
);

-- جدول الأدوار المحسن
CREATE TABLE roles (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(50) UNIQUE NOT NULL,
    display_name JSONB, -- متعدد اللغات
    description TEXT,
    permissions TEXT[] DEFAULT '{}',
    is_system BOOLEAN DEFAULT false,
    parent_role_id UUID REFERENCES roles(id),
    level INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    CONSTRAINT valid_level CHECK (level >= 0 AND level <= 100)
);

-- جدول ربط المستخدمين بالأدوار
CREATE TABLE user_roles (
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    role_id UUID REFERENCES roles(id) ON DELETE CASCADE,
    assigned_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    assigned_by UUID REFERENCES users(id),
    expires_at TIMESTAMP WITH TIME ZONE,
    
    PRIMARY KEY (user_id, role_id)
);

-- جدول سجل تغييرات الأدوار
CREATE TABLE role_audit_logs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES users(id),
    action VARCHAR(50) NOT NULL,
    details JSONB,
    timestamp TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =====================================================
-- 3. نظام توليد الإشارات (Signal Generation)
-- =====================================================

-- جدول الإشارات
CREATE TABLE signals (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    symbol VARCHAR(20) NOT NULL,
    signal_type signal_type_enum NOT NULL,
    entry_price DECIMAL(10,5) NOT NULL,
    target_price DECIMAL(10,5) NOT NULL,
    stop_loss DECIMAL(10,5) NOT NULL,
    expiry_time TIMESTAMP WITH TIME ZONE NOT NULL,
    confidence_score INTEGER NOT NULL,
    ai_analysis JSONB DEFAULT '{}',
    status signal_status_enum DEFAULT 'pending',
    result DECIMAL(10,2), -- النتيجة بالنقاط
    created_by UUID REFERENCES users(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    CONSTRAINT valid_confidence CHECK (confidence_score >= 0 AND confidence_score <= 100),
    CONSTRAINT valid_prices CHECK (entry_price > 0 AND target_price > 0 AND stop_loss > 0)
);

-- إنشاء الـ enums
CREATE TYPE signal_type_enum AS ENUM ('call', 'put');
CREATE TYPE signal_status_enum AS ENUM ('pending', 'active', 'won', 'lost', 'expired');

-- جدول إعدادات الذكاء الاصطناعي
CREATE TABLE ai_settings (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    model_name VARCHAR(100) NOT NULL,
    model_version VARCHAR(50),
    parameters JSONB DEFAULT '{}',
    is_active BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- جدول تحليلات السوق
CREATE TABLE market_analysis (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    symbol VARCHAR(20) NOT NULL,
    timeframe VARCHAR(10) NOT NULL,
    technical_indicators JSONB DEFAULT '{}',
    fundamental_data JSONB DEFAULT '{}',
    sentiment_score DECIMAL(3,2),
    analysis_timestamp TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    CONSTRAINT valid_sentiment CHECK (sentiment_score >= -1 AND sentiment_score <= 1)
);

-- =====================================================
-- 4. نظام الاشتراكات والفوترة (Subscriptions)
-- =====================================================

-- جدول خطط الاشتراك
CREATE TABLE subscription_plans (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(100) NOT NULL,
    display_name JSONB, -- متعدد اللغات
    description TEXT,
    price DECIMAL(10,2) NOT NULL,
    currency VARCHAR(3) DEFAULT 'USD',
    interval plan_interval_enum NOT NULL,
    features JSONB DEFAULT '{}',
    signal_limit INTEGER,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    CONSTRAINT valid_price CHECK (price >= 0)
);

CREATE TYPE plan_interval_enum AS ENUM ('monthly', 'yearly', 'lifetime');

-- جدول اشتراكات المستخدمين
CREATE TABLE subscriptions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    plan_id UUID REFERENCES subscription_plans(id),
    status subscription_status_enum DEFAULT 'trial',
    start_date TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    end_date TIMESTAMP WITH TIME ZONE,
    trial_end_date TIMESTAMP WITH TIME ZONE,
    auto_renew BOOLEAN DEFAULT true,
    payment_method_id TEXT,
    stripe_subscription_id TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TYPE subscription_status_enum AS ENUM ('trial', 'active', 'canceled', 'paused', 'expired');

-- جدول سجلات الفواتير
CREATE TABLE billing_records (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    subscription_id UUID REFERENCES subscriptions(id),
    amount DECIMAL(10,2) NOT NULL,
    currency VARCHAR(3) DEFAULT 'USD',
    status billing_status_enum DEFAULT 'pending',
    payment_method VARCHAR(50),
    transaction_id TEXT,
    invoice_url TEXT,
    issued_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    paid_at TIMESTAMP WITH TIME ZONE,
    due_date TIMESTAMP WITH TIME ZONE,
    
    CONSTRAINT valid_amount CHECK (amount >= 0)
);

CREATE TYPE billing_status_enum AS ENUM ('pending', 'paid', 'failed', 'refunded');

-- جدول القسائم والخصومات
CREATE TABLE coupons (
    code VARCHAR(50) PRIMARY KEY,
    discount_type discount_type_enum NOT NULL,
    discount_value DECIMAL(10,2) NOT NULL,
    max_uses INTEGER,
    used_count INTEGER DEFAULT 0,
    expiry_date DATE,
    is_active BOOLEAN DEFAULT true,
    applicable_plans UUID[],
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    CONSTRAINT valid_discount CHECK (discount_value > 0),
    CONSTRAINT valid_uses CHECK (max_uses IS NULL OR max_uses > 0)
);

CREATE TYPE discount_type_enum AS ENUM ('percentage', 'fixed');

-- =====================================================
-- 5. نظام التنبيهات والإشعارات (Notifications)
-- =====================================================

-- جدول الإشعارات
CREATE TABLE notifications (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    title VARCHAR(255) NOT NULL,
    message TEXT NOT NULL,
    type notification_type_enum NOT NULL,
    channel notification_channel_enum[] DEFAULT '{"in_app"}',
    data JSONB DEFAULT '{}',
    read BOOLEAN DEFAULT false,
    sent_at TIMESTAMP WITH TIME ZONE,
    expires_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TYPE notification_type_enum AS ENUM ('info', 'success', 'warning', 'error', 'signal', 'billing');
CREATE TYPE notification_channel_enum AS ENUM ('in_app', 'email', 'sms', 'push', 'telegram');

-- جدول إعدادات الإشعارات
CREATE TABLE notification_settings (
    user_id UUID PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE,
    email_notifications BOOLEAN DEFAULT true,
    sms_notifications BOOLEAN DEFAULT false,
    push_notifications BOOLEAN DEFAULT true,
    signal_alerts BOOLEAN DEFAULT true,
    billing_alerts BOOLEAN DEFAULT true,
    marketing_emails BOOLEAN DEFAULT false,
    telegram_chat_id TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- جدول قوالب الإشعارات
CREATE TABLE notification_templates (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(100) UNIQUE NOT NULL,
    type notification_type_enum NOT NULL,
    channel notification_channel_enum NOT NULL,
    subject JSONB, -- متعدد اللغات
    content JSONB, -- متعدد اللغات
    variables TEXT[], -- المتغيرات المتاحة
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =====================================================
-- 6. نظام التحليلات والإحصائيات (Analytics)
-- =====================================================

-- جدول إحصائيات الإشارات
CREATE TABLE signal_statistics (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES users(id),
    symbol VARCHAR(20),
    total_signals INTEGER DEFAULT 0,
    won_signals INTEGER DEFAULT 0,
    lost_signals INTEGER DEFAULT 0,
    win_rate DECIMAL(5,2) DEFAULT 0,
    total_pips DECIMAL(10,2) DEFAULT 0,
    date_from DATE NOT NULL,
    date_to DATE NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    CONSTRAINT valid_win_rate CHECK (win_rate >= 0 AND win_rate <= 100)
);

-- جدول أحداث التتبع
CREATE TABLE tracking_events (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES users(id),
    event_name VARCHAR(100) NOT NULL,
    event_properties JSONB DEFAULT '{}',
    session_id TEXT,
    page_url TEXT,
    user_agent TEXT,
    ip_address INET,
    timestamp TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =====================================================
-- 7. فهارس الأداء (Performance Indexes)
-- =====================================================

-- فهارس المستخدمين
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_phone ON users(phone_number);
CREATE INDEX idx_users_created_at ON users(created_at);

-- فهارس الجلسات
CREATE INDEX idx_user_sessions_user_id ON user_sessions(user_id);
CREATE INDEX idx_user_sessions_token ON user_sessions(session_token);
CREATE INDEX idx_user_sessions_active ON user_sessions(is_active, expires_at);

-- فهارس الإشارات
CREATE INDEX idx_signals_symbol ON signals(symbol);
CREATE INDEX idx_signals_status ON signals(status);
CREATE INDEX idx_signals_created_at ON signals(created_at);
CREATE INDEX idx_signals_expiry ON signals(expiry_time);
CREATE INDEX idx_signals_user ON signals(created_by);

-- فهارس الاشتراكات
CREATE INDEX idx_subscriptions_user ON subscriptions(user_id);
CREATE INDEX idx_subscriptions_status ON subscriptions(status);
CREATE INDEX idx_subscriptions_dates ON subscriptions(start_date, end_date);

-- فهارس الإشعارات
CREATE INDEX idx_notifications_user ON notifications(user_id);
CREATE INDEX idx_notifications_read ON notifications(read);
CREATE INDEX idx_notifications_created ON notifications(created_at);

-- =====================================================
-- 8. الدوال المساعدة (Helper Functions)
-- =====================================================

-- دالة تحديث updated_at تلقائياً
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- تطبيق الدالة على الجداول المطلوبة
CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_roles_updated_at BEFORE UPDATE ON roles
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_signals_updated_at BEFORE UPDATE ON signals
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_subscriptions_updated_at BEFORE UPDATE ON subscriptions
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- دالة حساب معدل نجاح الإشارات
CREATE OR REPLACE FUNCTION calculate_signal_win_rate(user_uuid UUID)
RETURNS DECIMAL AS $$
DECLARE
    total_count INTEGER;
    won_count INTEGER;
    win_rate DECIMAL;
BEGIN
    SELECT COUNT(*) INTO total_count
    FROM signals 
    WHERE created_by = user_uuid AND status IN ('won', 'lost');
    
    IF total_count = 0 THEN
        RETURN 0;
    END IF;
    
    SELECT COUNT(*) INTO won_count
    FROM signals 
    WHERE created_by = user_uuid AND status = 'won';
    
    win_rate := (won_count::DECIMAL / total_count::DECIMAL) * 100;
    RETURN win_rate;
END;
$$ LANGUAGE plpgsql;

-- =====================================================
-- 9. Row Level Security (RLS) Policies
-- =====================================================

-- تفعيل RLS على الجداول الحساسة
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE signals ENABLE ROW LEVEL SECURITY;
ALTER TABLE subscriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;

-- سياسات الأمان للمستخدمين
CREATE POLICY "Users can view their own profile" ON users
    FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update their own profile" ON users
    FOR UPDATE USING (auth.uid() = id);

-- سياسات الأمان للإشارات
CREATE POLICY "Users can view all signals" ON signals
    FOR SELECT USING (true);

CREATE POLICY "Only admins can create signals" ON signals
    FOR INSERT WITH CHECK (
        EXISTS (
            SELECT 1 FROM user_roles ur
            JOIN roles r ON ur.role_id = r.id
            WHERE ur.user_id = auth.uid() 
            AND 'signals:create' = ANY(r.permissions)
        )
    );

-- =====================================================
-- 10. البيانات الأولية (Seed Data)
-- =====================================================

-- إنشاء الصلاحيات الأساسية
INSERT INTO permissions (name, resource, action, description) VALUES
('signals:read', 'signals', 'read', 'عرض الإشارات'),
('signals:create', 'signals', 'create', 'إنشاء إشارات جديدة'),
('signals:update', 'signals', 'update', 'تحديث الإشارات'),
('signals:delete', 'signals', 'delete', 'حذف الإشارات'),
('admin:read', 'admin', 'read', 'الوصول لللوحة الإدارية'),
('admin:write', 'admin', 'write', 'التعديل في اللوحة الإدارية'),
('admin:delete', 'admin', 'delete', 'الحذف من اللوحة الإدارية'),
('users:read', 'users', 'read', 'عرض المستخدمين'),
('users:update', 'users', 'update', 'تحديث بيانات المستخدمين'),
('billing:read', 'billing', 'read', 'عرض الفواتير'),
('billing:manage', 'billing', 'manage', 'إدارة الفواتير');

-- إنشاء الأدوار الأساسية
INSERT INTO roles (name, display_name, description, permissions, is_system, level) VALUES
('super_admin', '{"ar": "مدير عام", "en": "Super Admin"}', 'مدير النظام الأعلى', ARRAY['*:*'], true, 100),
('admin', '{"ar": "مدير", "en": "Admin"}', 'مدير النظام', ARRAY['admin:read', 'admin:write', 'signals:*', 'users:read', 'users:update'], true, 80),
('analyst', '{"ar": "محلل", "en": "Analyst"}', 'محلل الإشارات', ARRAY['signals:read', 'signals:create', 'signals:update'], false, 60),
('vip_user', '{"ar": "مستخدم مميز", "en": "VIP User"}', 'مستخدم مميز', ARRAY['signals:read'], false, 30),
('basic_user', '{"ar": "مستخدم أساسي", "en": "Basic User"}', 'مستخدم أساسي', ARRAY['signals:read'], false, 10);

-- إنشاء خطط الاشتراك
INSERT INTO subscription_plans (name, display_name, description, price, interval, features, signal_limit) VALUES
('free', '{"ar": "مجاني", "en": "Free"}', 'خطة مجانية أساسية', 0, 'monthly', '{"signals": 5, "support": "basic"}', 5),
('basic', '{"ar": "أساسي", "en": "Basic"}', 'خطة أساسية للمستخدمين الجدد', 29.99, 'monthly', '{"signals": 50, "support": "email", "history": "1_month"}', 50),
('pro', '{"ar": "احترافي", "en": "Professional"}', 'خطة احترافية للمتداولين', 79.99, 'monthly', '{"signals": 200, "support": "priority", "history": "6_months", "ai_analysis": true}', 200),
('enterprise', '{"ar": "مؤسسي", "en": "Enterprise"}', 'خطة للمؤسسات', 199.99, 'monthly', '{"signals": -1, "support": "dedicated", "history": "unlimited", "ai_analysis": true, "custom_signals": true}', -1);

-- إنشاء قوالب الإشعارات
INSERT INTO notification_templates (name, type, channel, subject, content) VALUES
('signal_created', 'signal', 'in_app', 
 '{"ar": "إشارة جديدة", "en": "New Signal"}', 
 '{"ar": "تم إنشاء إشارة جديدة لـ {symbol}", "en": "New signal created for {symbol}"}'),
('subscription_expiring', 'warning', 'email', 
 '{"ar": "انتهاء صلاحية الاشتراك قريباً", "en": "Subscription Expiring Soon"}', 
 '{"ar": "ينتهي اشتراكك في {days} أيام", "en": "Your subscription expires in {days} days"}'),
('payment_successful', 'success', 'email', 
 '{"ar": "تم الدفع بنجاح", "en": "Payment Successful"}', 
 '{"ar": "تم استلام دفعتك بمبلغ {amount}", "en": "Payment of {amount} received successfully"}');

-- =====================================================
-- النهاية - تم إنشاء قاعدة البيانات الشاملة
-- =====================================================