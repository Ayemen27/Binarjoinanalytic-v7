import React from 'react';
import { useTranslation } from 'next-i18next';
import { motion } from 'framer-motion';
import { Card, CardContent } from '@/components/atoms/Card';

export const Statistics: React.FC = () => {
  const { t } = useTranslation('common');

  const stats = [
    {
      value: '99.99%',
      label: 'وقت التشغيل',
      description: 'توفر عالي للخدمات الأساسية',
      color: 'text-green-500'
    },
    {
      value: '< 150ms',
      label: 'زمن الاستجابة',
      description: 'أداء فائق السرعة',
      color: 'text-blue-500'
    },
    {
      value: '92%+',
      label: 'دقة الإشارات',
      description: 'تحليل ذكي موثوق',
      color: 'text-primary'
    },
    {
      value: '100K+',
      label: 'مستخدم متزامن',
      description: 'قابلية توسع عالية',
      color: 'text-accent'
    },
    {
      value: '4.8/5',
      label: 'رضا المستخدمين',
      description: 'تجربة استخدام متميزة',
      color: 'text-yellow-500'
    },
    {
      value: '24/7',
      label: 'دعم فني',
      description: 'مساعدة متواصلة',
      color: 'text-purple-500'
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
    <section className="py-24 bg-background">
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
            أرقام تتحدث عن التميز
          </h2>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
            مؤشرات الأداء والنجاح التي تعكس جودة وموثوقية منصتنا المتطورة
          </p>
        </motion.div>

        {/* Statistics Grid */}
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          variants={containerVariants}
          className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-6"
        >
          {stats.map((stat, index) => (
            <motion.div
              key={index}
              variants={itemVariants}
            >
              <Card 
                variant="elevated" 
                hoverable 
                className="text-center group hover:scale-105 transition-all duration-300"
              >
                <CardContent className="p-6">
                  <motion.div
                    initial={{ scale: 0 }}
                    whileInView={{ scale: 1 }}
                    viewport={{ once: true }}
                    transition={{ 
                      delay: index * 0.1,
                      type: "spring",
                      stiffness: 200,
                      damping: 10
                    }}
                    className={`text-3xl md:text-4xl font-bold mb-2 ${stat.color}`}
                  >
                    {stat.value}
                  </motion.div>
                  <h3 className="font-semibold text-foreground mb-1">
                    {stat.label}
                  </h3>
                  <p className="text-sm text-muted-foreground">
                    {stat.description}
                  </p>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </motion.div>

        {/* Progress Indicators */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8, delay: 0.3 }}
          className="mt-16"
        >
          <Card variant="filled" className="bg-gradient-to-r from-primary/5 to-accent/5">
            <CardContent className="p-8">
              <h3 className="text-2xl font-bold text-center text-foreground mb-8">
                مؤشرات الأداء التقني
              </h3>
              
              <div className="grid md:grid-cols-2 gap-8">
                {[
                  {
                    label: 'Security Score',
                    value: 98,
                    description: 'معدل الأمان والحماية',
                    color: 'bg-green-500'
                  },
                  {
                    label: 'Performance Score',
                    value: 95,
                    description: 'مؤشر الأداء العام',
                    color: 'bg-blue-500'
                  },
                  {
                    label: 'Test Coverage',
                    value: 95,
                    description: 'تغطية الاختبارات',
                    color: 'bg-primary'
                  },
                  {
                    label: 'Code Quality',
                    value: 92,
                    description: 'جودة الكود البرمجي',
                    color: 'bg-accent'
                  }
                ].map((progress, index) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, x: -20 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.6, delay: index * 0.1 }}
                    className="space-y-2"
                  >
                    <div className="flex justify-between items-center">
                      <span className="font-medium text-foreground">{progress.label}</span>
                      <span className="text-sm text-muted-foreground">{progress.value}%</span>
                    </div>
                    <div className="w-full bg-muted rounded-full h-2">
                      <motion.div
                        initial={{ width: 0 }}
                        whileInView={{ width: `${progress.value}%` }}
                        viewport={{ once: true }}
                        transition={{ duration: 1, delay: index * 0.2 }}
                        className={`h-2 rounded-full ${progress.color}`}
                      />
                    </div>
                    <p className="text-xs text-muted-foreground">{progress.description}</p>
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