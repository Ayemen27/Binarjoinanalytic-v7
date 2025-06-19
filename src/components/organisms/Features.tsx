import React from 'react';
import { useTranslation } from 'next-i18next';
import { motion } from 'framer-motion';
import { 
  Shield, 
  TrendingUp, 
  Zap, 
  Users, 
  Globe, 
  BarChart3,
  Bell,
  Lock,
  Smartphone,
  Cloud,
  Cpu,
  Database
} from 'lucide-react';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/atoms/Card';

export const Features: React.FC = () => {
  const { t } = useTranslation('common');

  const systemCategories = [
    {
      title: 'الأنظمة الأساسية',
      description: 'البنية التحتية والمصادقة',
      systems: [
        {
          icon: Shield,
          title: 'نظام إدارة المستخدمين والمصادقة',
          description: '2FA, TOTP, SMS, WebAuthn مع OAuth 2.0 + OpenID Connect',
          features: ['مصادقة متعددة العوامل', 'إدارة الجلسات المتقدمة', 'مصادقة قائمة على المخاطر']
        },
        {
          icon: Users,
          title: 'نظام إدارة الصلاحيات والأدوار',
          description: 'نظام RBAC متقدم مع تحكم دقيق في الصلاحيات',
          features: ['أدوار هرمية', 'صلاحيات دقيقة', 'تسجيل شامل للعمليات']
        },
        {
          icon: TrendingUp,
          title: 'نظام توليد الإشارات الذكية',
          description: 'تحليل مدعوم بالذكاء الاصطناعي مع 50+ مؤشر تقني',
          features: ['تحليل ذكي', 'اختبار استراتيجيات', 'بيانات السوق الفورية']
        }
      ]
    },
    {
      title: 'الخدمات الأساسية',
      description: 'إدارة البيانات والتنبيهات',
      systems: [
        {
          icon: Database,
          title: 'نظام سجل الإشارات',
          description: 'تخزين وإدارة شاملة لجميع الإشارات والتحليلات',
          features: ['تخزين محسن', 'بحث متقدم', 'تحليل الأداء']
        },
        {
          icon: Bell,
          title: 'نظام التنبيهات الذكية',
          description: 'إشعارات فورية ومخصصة عبر قنوات متعددة',
          features: ['إشعارات فورية', 'تخصيص كامل', 'قنوات متعددة']
        },
        {
          icon: BarChart3,
          title: 'نظام الاشتراكات والفوترة',
          description: 'إدارة متطورة للاشتراكات والمدفوعات',
          features: ['خطط مرنة', 'دفع آمن', 'إدارة الفواتير']
        }
      ]
    },
    {
      title: 'التكامل والذكاء',
      description: 'ربط خارجي وتحليلات',
      systems: [
        {
          icon: Globe,
          title: 'نظام التكامل الخارجي',
          description: 'ربط مع منصات التداول والخدمات الخارجية',
          features: ['APIs متعددة', 'مزامنة فورية', 'إدارة البيانات']
        },
        {
          icon: Cpu,
          title: 'نظام التحليلات المتقدمة',
          description: 'تحليل عميق للبيانات والأداء',
          features: ['تحليل ذكي', 'تقارير تفاعلية', 'رؤى عميقة']
        },
        {
          icon: Zap,
          title: 'نظام التوصيات والAI',
          description: 'محرك توصيات ذكي مدعوم بالذكاء الاصطناعي',
          features: ['توصيات ذكية', 'تعلم آلي', 'تحسين مستمر']
        }
      ]
    }
  ];

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.6
      }
    }
  };

  return (
    <section className="py-24 bg-muted/30">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
          className="text-center mb-16"
        >
          <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
            الأنظمة الـ15 المتكاملة
          </h2>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
            منصة شاملة تضم 15 نظامًا احترافيًا مترابطًا لتقديم خدمات متطورة 
            مع تطبيق أحدث التقنيات العالمية
          </p>
        </motion.div>

        {/* Systems Categories */}
        <div className="space-y-16">
          {systemCategories.map((category, categoryIndex) => (
            <motion.div
              key={categoryIndex}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
              variants={containerVariants}
            >
              {/* Category Header */}
              <motion.div
                variants={itemVariants}
                className="text-center mb-8"
              >
                <h3 className="text-2xl font-bold text-foreground mb-2">
                  {category.title}
                </h3>
                <p className="text-muted-foreground">
                  {category.description}
                </p>
              </motion.div>

              {/* Systems Grid */}
              <motion.div
                variants={containerVariants}
                className="grid md:grid-cols-2 lg:grid-cols-3 gap-6"
              >
                {category.systems.map((system, systemIndex) => (
                  <motion.div
                    key={systemIndex}
                    variants={itemVariants}
                  >
                    <Card 
                      variant="elevated" 
                      hoverable 
                      className="h-full group hover:border-primary/50 transition-all duration-300"
                    >
                      <CardHeader>
                        <div className="flex items-center gap-3 mb-3">
                          <div className="p-2 bg-primary/10 rounded-lg group-hover:bg-primary/20 transition-colors">
                            <system.icon className="h-6 w-6 text-primary" />
                          </div>
                        </div>
                        <CardTitle className="text-lg leading-tight">
                          {system.title}
                        </CardTitle>
                        <CardDescription className="text-sm">
                          {system.description}
                        </CardDescription>
                      </CardHeader>
                      <CardContent>
                        <ul className="space-y-2">
                          {system.features.map((feature, featureIndex) => (
                            <li key={featureIndex} className="flex items-center gap-2 text-sm">
                              <div className="w-1.5 h-1.5 bg-primary rounded-full" />
                              <span className="text-muted-foreground">{feature}</span>
                            </li>
                          ))}
                        </ul>
                      </CardContent>
                    </Card>
                  </motion.div>
                ))}
              </motion.div>
            </motion.div>
          ))}
        </div>

        {/* Technical Highlights */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8, delay: 0.3 }}
          className="mt-20"
        >
          <Card variant="filled" className="bg-gradient-to-r from-primary/10 to-accent/10 border-primary/20">
            <CardContent className="p-8">
              <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
                {[
                  {
                    icon: Smartphone,
                    title: 'متجاوب بالكامل',
                    description: 'تصميم Mobile-first مع دعم جميع الأجهزة'
                  },
                  {
                    icon: Lock,
                    title: 'أمان متقدم',
                    description: 'Zero Trust Architecture مع تشفير شامل'
                  },
                  {
                    icon: Cloud,
                    title: 'سحابي متطور',
                    description: 'بنية سحابية قابلة للتوسع'
                  },
                  {
                    icon: Zap,
                    title: 'أداء فائق',
                    description: 'استجابة أقل من 150ms'
                  }
                ].map((highlight, index) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.6, delay: index * 0.1 }}
                    className="text-center"
                  >
                    <div className="p-3 bg-primary/10 rounded-lg w-fit mx-auto mb-3">
                      <highlight.icon className="h-8 w-8 text-primary" />
                    </div>
                    <h4 className="font-semibold text-foreground mb-2">
                      {highlight.title}
                    </h4>
                    <p className="text-sm text-muted-foreground">
                      {highlight.description}
                    </p>
                  </motion.div>
                ))}
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </section>
  );
};