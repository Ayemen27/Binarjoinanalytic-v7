import React, { useState } from 'react';
import type { NextPage } from 'next';
import Head from 'next/head';
import { 
  Search, 
  MessageCircle, 
  Book, 
  Video, 
  Mail, 
  Phone,
  HelpCircle,
  ChevronDown,
  ChevronRight,
  ExternalLink
} from 'lucide-react';

import { Layout } from '@/components/organisms/Layout';
import { ProtectedRoute } from '@/components/organisms/ProtectedRoute';
import { Card } from '@/components/atoms/Card';
import { Button } from '@/components/atoms/Button';
import { Input } from '@/components/atoms/Input';

interface FAQItem {
  id: string;
  question: string;
  answer: string;
  category: string;
}

const HelpPage: NextPage = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [expandedFAQ, setExpandedFAQ] = useState<string | null>(null);

  const faqData: FAQItem[] = [
    {
      id: '1',
      question: 'كيف أقوم بتوليد إشارة جديدة؟',
      answer: 'انتقل إلى صفحة "توليد إشارة" من القائمة الجانبية، اختر الرمز والإطار الزمني والاستراتيجية المفضلة، ثم اضغط على "توليد الإشارة". ستحصل على إشارة مع تحليل تقني مفصل ونسبة الثقة.',
      category: 'signals'
    },
    {
      id: '2',
      question: 'كيف أتابع أداء إشاراتي؟',
      answer: 'يمكنك متابعة الأداء من خلال صفحة "سجل الإشارات" التي تعرض جميع إشاراتك السابقة مع النتائج والأرباح/الخسائر. كما يمكنك استخدام صفحة "التحليلات" لرؤية إحصائيات مفصلة عن أدائك.',
      category: 'analytics'
    },
    {
      id: '3',
      question: 'ما هي نسبة الثقة في الإشارات؟',
      answer: 'نسبة الثقة هي مقياس يتراوح من 0 إلى 100% يحدد مدى قوة الإشارة بناء على التحليل التقني والذكاء الاصطناعي. الإشارات بنسبة ثقة أعلى من 70% تعتبر قوية، و80% أو أكثر تعتبر ممتازة.',
      category: 'signals'
    },
    {
      id: '4',
      question: 'كيف أغير كلمة المرور؟',
      answer: 'انتقل إلى "الملف الشخصي" من القائمة الجانبية، ثم اضغط على "تغيير كلمة المرور" في قسم إعدادات الحساب. ستحتاج لإدخال كلمة المرور الحالية والجديدة.',
      category: 'account'
    },
    {
      id: '5',
      question: 'كيف أفعل المصادقة الثنائية؟',
      answer: 'في صفحة الملف الشخصي، اضغط على "تفعيل" بجانب المصادقة الثنائية. ستحتاج لتطبيق مصادقة على هاتفك مثل Google Authenticator لمسح رمز QR واستكمال التفعيل.',
      category: 'security'
    },
    {
      id: '6',
      question: 'ما هي الأطر الزمنية المتاحة؟',
      answer: 'المنصة تدعم عدة أطر زمنية: 5 دقائق، 15 دقيقة، ساعة، 4 ساعات، ويوم. كل إطار زمني مناسب لاستراتيجيات تداول مختلفة حسب أسلوبك في التداول.',
      category: 'signals'
    },
    {
      id: '7',
      question: 'كيف أتواصل مع الدعم الفني؟',
      answer: 'يمكنك التواصل معنا عبر البريد الإلكتروني support@signals-platform.com أو استخدام نموذج الاتصال في هذه الصفحة. فريق الدعم متاح 24/7 للرد على استفساراتك.',
      category: 'support'
    }
  ];

  const categories = [
    { id: 'all', name: 'جميع الفئات', count: faqData.length },
    { id: 'signals', name: 'الإشارات', count: faqData.filter(f => f.category === 'signals').length },
    { id: 'analytics', name: 'التحليلات', count: faqData.filter(f => f.category === 'analytics').length },
    { id: 'account', name: 'الحساب', count: faqData.filter(f => f.category === 'account').length },
    { id: 'security', name: 'الأمان', count: faqData.filter(f => f.category === 'security').length },
    { id: 'support', name: 'الدعم', count: faqData.filter(f => f.category === 'support').length }
  ];

  const filteredFAQs = faqData.filter(faq => {
    const matchesCategory = selectedCategory === 'all' || faq.category === selectedCategory;
    const matchesSearch = searchTerm === '' || 
                         faq.question.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         faq.answer.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  const quickLinks = [
    {
      title: 'دليل البدء السريع',
      description: 'تعلم أساسيات استخدام المنصة',
      icon: Book,
      href: '/help/getting-started'
    },
    {
      title: 'فيديوهات تعليمية',
      description: 'شاهد شروحات مصورة للميزات',
      icon: Video,
      href: '/help/videos'
    },
    {
      title: 'الدعم المباشر',
      description: 'تحدث مع فريق الدعم',
      icon: MessageCircle,
      href: '/help/chat'
    },
    {
      title: 'أرسل طلب دعم',
      description: 'أرسل استفسارك وسنرد خلال 24 ساعة',
      icon: Mail,
      href: '/help/contact'
    }
  ];

  return (
    <ProtectedRoute>
      <Head>
        <title>المساعدة والدعم - منصة الإشارات</title>
      </Head>

      <Layout showSidebar={true}>
        <div className="p-6 space-y-8">
          {/* Header */}
          <div className="text-center">
            <h1 className="text-4xl font-bold text-foreground mb-4">كيف يمكننا مساعدتك؟</h1>
            <p className="text-xl text-muted-foreground mb-8">
              ابحث عن الإجابات أو تواصل مع فريق الدعم
            </p>
            
            {/* Search Bar */}
            <div className="max-w-2xl mx-auto">
              <Input
                placeholder="ابحث عن سؤال أو موضوع..."
                leftIcon={<Search className="w-5 h-5" />}
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="text-lg h-14"
              />
            </div>
          </div>

          {/* Quick Links */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {quickLinks.map((link, index) => (
              <Card key={index} className="p-6 hover:shadow-md transition-shadow cursor-pointer">
                <div className="text-center">
                  <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                    <link.icon className="w-6 h-6 text-primary" />
                  </div>
                  <h3 className="font-semibold text-foreground mb-2">{link.title}</h3>
                  <p className="text-sm text-muted-foreground mb-4">{link.description}</p>
                  <Button size="sm" variant="outline">
                    الانتقال
                    <ExternalLink className="w-4 h-4 mr-2" />
                  </Button>
                </div>
              </Card>
            ))}
          </div>

          {/* FAQ Section */}
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
            {/* Categories Sidebar */}
            <div className="lg:col-span-1">
              <Card className="p-6">
                <h3 className="font-semibold text-foreground mb-4">الفئات</h3>
                <div className="space-y-2">
                  {categories.map((category) => (
                    <button
                      key={category.id}
                      onClick={() => setSelectedCategory(category.id)}
                      className={`w-full text-right p-3 rounded-lg transition-colors flex items-center justify-between ${
                        selectedCategory === category.id
                          ? 'bg-primary text-primary-foreground'
                          : 'hover:bg-muted text-foreground'
                      }`}
                    >
                      <span>{category.name}</span>
                      <span className={`text-xs px-2 py-1 rounded-full ${
                        selectedCategory === category.id
                          ? 'bg-primary-foreground/20'
                          : 'bg-muted'
                      }`}>
                        {category.count}
                      </span>
                    </button>
                  ))}
                </div>
              </Card>
            </div>

            {/* FAQ List */}
            <div className="lg:col-span-3">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h2 className="text-2xl font-bold text-foreground">الأسئلة الشائعة</h2>
                  <span className="text-muted-foreground">
                    {filteredFAQs.length} من {faqData.length} سؤال
                  </span>
                </div>

                {filteredFAQs.length === 0 ? (
                  <Card className="p-8 text-center">
                    <HelpCircle className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-foreground mb-2">لا توجد نتائج</h3>
                    <p className="text-muted-foreground">
                      جرب البحث بكلمات مختلفة أو تصفح فئة أخرى
                    </p>
                  </Card>
                ) : (
                  <div className="space-y-3">
                    {filteredFAQs.map((faq) => (
                      <Card key={faq.id} className="overflow-hidden">
                        <button
                          onClick={() => setExpandedFAQ(expandedFAQ === faq.id ? null : faq.id)}
                          className="w-full p-6 text-right hover:bg-muted/50 transition-colors"
                        >
                          <div className="flex items-center justify-between">
                            <h3 className="font-medium text-foreground text-lg">
                              {faq.question}
                            </h3>
                            {expandedFAQ === faq.id ? (
                              <ChevronDown className="w-5 h-5 text-muted-foreground" />
                            ) : (
                              <ChevronRight className="w-5 h-5 text-muted-foreground" />
                            )}
                          </div>
                        </button>
                        
                        {expandedFAQ === faq.id && (
                          <div className="px-6 pb-6 border-t border-border">
                            <p className="text-muted-foreground leading-relaxed pt-4">
                              {faq.answer}
                            </p>
                          </div>
                        )}
                      </Card>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Contact Section */}
          <Card className="p-8">
            <div className="text-center">
              <h2 className="text-2xl font-bold text-foreground mb-4">لم تجد ما تبحث عنه؟</h2>
              <p className="text-muted-foreground mb-6">
                فريق الدعم جاهز لمساعدتك على مدار الساعة
              </p>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="text-center">
                  <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-3">
                    <Mail className="w-6 h-6 text-primary" />
                  </div>
                  <h3 className="font-medium text-foreground mb-2">البريد الإلكتروني</h3>
                  <p className="text-sm text-muted-foreground mb-3">
                    نرد خلال 24 ساعة
                  </p>
                  <Button size="sm">
                    support@platform.com
                  </Button>
                </div>

                <div className="text-center">
                  <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-3">
                    <MessageCircle className="w-6 h-6 text-primary" />
                  </div>
                  <h3 className="font-medium text-foreground mb-2">الدردشة المباشرة</h3>
                  <p className="text-sm text-muted-foreground mb-3">
                    متاح 24/7
                  </p>
                  <Button size="sm">
                    بدء المحادثة
                  </Button>
                </div>

                <div className="text-center">
                  <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-3">
                    <Phone className="w-6 h-6 text-primary" />
                  </div>
                  <h3 className="font-medium text-foreground mb-2">الهاتف</h3>
                  <p className="text-sm text-muted-foreground mb-3">
                    الأحد - الخميس 9ص - 6م
                  </p>
                  <Button size="sm">
                    +966 11 123 4567
                  </Button>
                </div>
              </div>
            </div>
          </Card>
        </div>
      </Layout>
    </ProtectedRoute>
  );
};

export default HelpPage;