import React from 'react';
import { useTranslation } from 'next-i18next';
import { motion } from 'framer-motion';
import { ArrowRight, CheckCircle, Star } from 'lucide-react';

import { Button } from '@/components/atoms/Button';
import { Card, CardContent } from '@/components/atoms/Card';

export const CTA: React.FC = () => {
  const { t } = useTranslation('common');

  const benefits = [
    'بدء مجاني لمدة 30 يوم',
    'دعم فني متخصص 24/7',
    'تحديثات مستمرة ومجانية',
    'ضمان استرداد المبلغ',
    'تدريب شامل ومجاني'
  ];

  const testimonials = [
    {
      name: 'أحمد محمد',
      role: 'متداول محترف',
      content: 'منصة استثنائية غيرت طريقة تداولي بالكامل',
      rating: 5
    },
    {
      name: 'سارة أحمد',
      role: 'مدير استثمار',
      content: 'الإشارات دقيقة والواجهة سهلة الاستخدام',
      rating: 5
    },
    {
      name: 'محمد علي',
      role: 'مطور تطبيقات',
      content: 'تقنيات حديثة وأداء مذهل',
      rating: 5
    }
  ];

  return (
    <section className="py-24 bg-gradient-to-br from-primary/10 via-background to-accent/10 relative overflow-hidden">
      {/* Background Elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-24 -right-24 w-48 h-48 bg-primary/20 rounded-full blur-3xl" />
        <div className="absolute -bottom-24 -left-24 w-48 h-48 bg-accent/20 rounded-full blur-3xl" />
      </div>

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Main CTA Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
          className="text-center mb-16"
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8, delay: 0.2 }}
          >
            <Card variant="elevated" className="max-w-4xl mx-auto bg-card/80 backdrop-blur-sm border-primary/20">
              <CardContent className="p-12">
                {/* Main Heading */}
                <h2 className="text-4xl md:text-5xl font-bold text-foreground mb-6">
                  ابدأ رحلتك في عالم
                  <span className="bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent block">
                    التداول الذكي
                  </span>
                </h2>

                {/* Description */}
                <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
                  انضم لآلاف المتداولين الذين يثقون في منصتنا لتحقيق نتائج استثنائية 
                  مع إشارات دقيقة وتحليل متطور
                </p>

                {/* Benefits List */}
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.6, delay: 0.3 }}
                  className="grid md:grid-cols-2 lg:grid-cols-3 gap-4 mb-8"
                >
                  {benefits.map((benefit, index) => (
                    <motion.div
                      key={index}
                      initial={{ opacity: 0, x: -20 }}
                      whileInView={{ opacity: 1, x: 0 }}
                      viewport={{ once: true }}
                      transition={{ duration: 0.5, delay: index * 0.1 }}
                      className="flex items-center gap-3 text-sm"
                    >
                      <CheckCircle className="h-5 w-5 text-green-500 flex-shrink-0" />
                      <span className="text-foreground">{benefit}</span>
                    </motion.div>
                  ))}
                </motion.div>

                {/* CTA Buttons */}
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.6, delay: 0.4 }}
                  className="flex flex-col sm:flex-row gap-4 justify-center"
                >
                  <Button size="lg" className="group text-lg px-8 py-4">
                    ابدأ النسخة التجريبية المجانية
                    <ArrowRight className="mr-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
                  </Button>
                  <Button variant="outline" size="lg" className="text-lg px-8 py-4">
                    تحدث مع خبير
                  </Button>
                </motion.div>

                {/* Trust Indicators */}
                <motion.div
                  initial={{ opacity: 0 }}
                  whileInView={{ opacity: 1 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.6, delay: 0.5 }}
                  className="mt-8 pt-8 border-t border-border"
                >
                  <div className="flex flex-col md:flex-row items-center justify-center gap-8 text-sm text-muted-foreground">
                    <div className="flex items-center gap-2">
                      <CheckCircle className="h-4 w-4 text-green-500" />
                      <span>بدون التزام مالي</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <CheckCircle className="h-4 w-4 text-green-500" />
                      <span>إلغاء في أي وقت</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <CheckCircle className="h-4 w-4 text-green-500" />
                      <span>دعم فوري</span>
                    </div>
                  </div>
                </motion.div>
              </CardContent>
            </Card>
          </motion.div>
        </motion.div>

        {/* Testimonials Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8, delay: 0.3 }}
          className="mb-16"
        >
          <h3 className="text-2xl font-bold text-center text-foreground mb-8">
            ماذا يقول عملاؤنا؟
          </h3>
          
          <div className="grid md:grid-cols-3 gap-6">
            {testimonials.map((testimonial, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
              >
                <Card variant="elevated" hoverable className="h-full">
                  <CardContent className="p-6">
                    {/* Rating */}
                    <div className="flex items-center gap-1 mb-4">
                      {Array.from({ length: testimonial.rating }).map((_, i) => (
                        <Star key={i} className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                      ))}
                    </div>
                    
                    {/* Content */}
                    <p className="text-muted-foreground mb-4 italic">
                      "{testimonial.content}"
                    </p>
                    
                    {/* Author */}
                    <div>
                      <div className="font-semibold text-foreground">
                        {testimonial.name}
                      </div>
                      <div className="text-sm text-muted-foreground">
                        {testimonial.role}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* Final Stats */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8, delay: 0.4 }}
          className="text-center"
        >
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 max-w-2xl mx-auto">
            {[
              { value: '10K+', label: 'عميل راضي' },
              { value: '95%', label: 'معدل النجاح' },
              { value: '24/7', label: 'دعم فني' },
              { value: '99.9%', label: 'وقت التشغيل' }
            ].map((stat, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, scale: 0.8 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                className="text-center"
              >
                <div className="text-2xl md:text-3xl font-bold text-primary mb-1">
                  {stat.value}
                </div>
                <div className="text-sm text-muted-foreground">
                  {stat.label}
                </div>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </div>
    </section>
  );
};