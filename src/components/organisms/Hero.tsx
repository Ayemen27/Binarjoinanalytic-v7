import React from 'react';
import { useTranslation } from 'next-i18next';
import { motion } from 'framer-motion';
import { ArrowRight, Play, TrendingUp, Shield, Zap } from 'lucide-react';

import { Button } from '@/components/atoms/Button';
import { Card } from '@/components/atoms/Card';

export const Hero: React.FC = () => {
  const { t } = useTranslation('common');

  const features = [
    {
      icon: TrendingUp,
      title: 'إشارات دقيقة 92%+',
      description: 'تحليل ذكي مدعوم بالذكاء الاصطناعي'
    },
    {
      icon: Shield,
      title: 'أمان متقدم',
      description: 'حماية شاملة للبيانات والمعاملات'
    },
    {
      icon: Zap,
      title: 'أداء فائق',
      description: 'استجابة فورية أقل من 150ms'
    }
  ];

  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden bg-gradient-to-br from-background via-background to-primary/5">
      {/* Background Elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-primary/10 rounded-full blur-3xl" />
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-accent/10 rounded-full blur-3xl" />
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-gradient-to-r from-primary/5 to-accent/5 rounded-full blur-3xl" />
      </div>

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          {/* Content Section */}
          <motion.div
            initial={{ opacity: 0, x: -50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8 }}
            className="text-center lg:text-right"
          >
            {/* Badge */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2, duration: 0.6 }}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 border border-primary/20 mb-6"
            >
              <Zap className="h-4 w-4 text-primary" />
              <span className="text-sm font-medium text-primary">منصة متكاملة • 15 نظام احترافي</span>
            </motion.div>

            {/* Main Heading */}
            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3, duration: 0.8 }}
              className="text-4xl md:text-6xl font-bold text-foreground mb-6 leading-tight"
            >
              منصة الخدمات الرقمية
              <span className="bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent block">
                المتكاملة
              </span>
            </motion.h1>

            {/* Description */}
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4, duration: 0.8 }}
              className="text-lg md:text-xl text-muted-foreground mb-8 max-w-2xl mx-auto lg:mx-0"
            >
              تطوير منصة رقمية شاملة ومتكاملة تضم 15 نظامًا احترافيًا مترابطًا لتقديم خدمات متطورة 
              في مجال التداول والإشارات الذكية مع تطبيق أحدث التقنيات العالمية.
            </motion.p>

            {/* CTA Buttons */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5, duration: 0.8 }}
              className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start mb-12"
            >
              <Button size="lg" className="group">
                ابدأ الآن مجاناً
                <ArrowRight className="mr-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
              </Button>
              <Button variant="outline" size="lg" className="group">
                <Play className="ml-2 h-5 w-5" />
                شاهد العرض التوضيحي
              </Button>
            </motion.div>

            {/* Features Grid */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6, duration: 0.8 }}
              className="grid grid-cols-1 md:grid-cols-3 gap-4"
            >
              {features.map((feature, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.7 + index * 0.1, duration: 0.6 }}
                >
                  <Card variant="filled" padding="sm" hoverable className="text-center">
                    <feature.icon className="h-8 w-8 text-primary mx-auto mb-2" />
                    <h4 className="font-semibold text-sm mb-1">{feature.title}</h4>
                    <p className="text-xs text-muted-foreground">{feature.description}</p>
                  </Card>
                </motion.div>
              ))}
            </motion.div>
          </motion.div>

          {/* Visual Section */}
          <motion.div
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, delay: 0.3 }}
            className="relative"
          >
            {/* Main Dashboard Preview */}
            <div className="relative">
              <motion.div
                animate={{ 
                  y: [0, -10, 0],
                  rotate: [0, 1, 0]
                }}
                transition={{ 
                  duration: 6,
                  repeat: Infinity,
                  ease: "easeInOut"
                }}
                className="bg-card border border-border rounded-xl shadow-2xl overflow-hidden"
              >
                {/* Dashboard Header */}
                <div className="bg-gradient-to-r from-primary to-accent p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <div className="w-3 h-3 bg-white/30 rounded-full" />
                    <div className="w-3 h-3 bg-white/30 rounded-full" />
                    <div className="w-3 h-3 bg-white/30 rounded-full" />
                  </div>
                  <h3 className="text-white font-semibold">لوحة التحكم الرئيسية</h3>
                </div>

                {/* Dashboard Content */}
                <div className="p-6 space-y-4">
                  {/* Stats Cards */}
                  <div className="grid grid-cols-2 gap-4">
                    {[
                      { label: 'الإشارات النشطة', value: '24', change: '+12%' },
                      { label: 'دقة التنبؤات', value: '94.2%', change: '+2.1%' },
                      { label: 'المستخدمين', value: '15.2K', change: '+8.5%' },
                      { label: 'الأرباح', value: '$42.1K', change: '+15.3%' }
                    ].map((stat, i) => (
                      <div key={i} className="bg-muted/30 rounded-lg p-3">
                        <div className="text-xs text-muted-foreground mb-1">{stat.label}</div>
                        <div className="font-bold text-lg">{stat.value}</div>
                        <div className="text-xs text-green-500">{stat.change}</div>
                      </div>
                    ))}
                  </div>

                  {/* Chart Placeholder */}
                  <div className="bg-muted/20 rounded-lg h-32 flex items-center justify-center">
                    <div className="text-muted-foreground text-sm">الرسوم البيانية التفاعلية</div>
                  </div>

                  {/* Activity List */}
                  <div className="space-y-2">
                    {[
                      'إشارة جديدة: EUR/USD صاعد',
                      'تحديث النظام مكتمل',
                      'تنبيه: BTC/USD هبوط محتمل'
                    ].map((activity, i) => (
                      <div key={i} className="flex items-center gap-2 text-sm">
                        <div className="w-2 h-2 bg-primary rounded-full" />
                        <span className="text-muted-foreground">{activity}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </motion.div>

              {/* Floating Elements */}
              <motion.div
                animate={{ 
                  y: [0, -15, 0],
                  x: [0, 5, 0]
                }}
                transition={{ 
                  duration: 4,
                  repeat: Infinity,
                  ease: "easeInOut",
                  delay: 1
                }}
                className="absolute -top-4 -right-4 bg-card border border-border rounded-lg p-3 shadow-lg"
              >
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse" />
                  <span className="text-xs font-medium">متصل</span>
                </div>
              </motion.div>

              <motion.div
                animate={{ 
                  y: [0, 10, 0],
                  x: [0, -5, 0]
                }}
                transition={{ 
                  duration: 5,
                  repeat: Infinity,
                  ease: "easeInOut",
                  delay: 2
                }}
                className="absolute -bottom-4 -left-4 bg-card border border-border rounded-lg p-3 shadow-lg"
              >
                <div className="text-xs text-muted-foreground">إشعار جديد</div>
                <div className="text-sm font-medium">تم تحديث الإشارات</div>
              </motion.div>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
};