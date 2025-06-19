import React from 'react';
import Link from 'next/link';
import { useTranslation } from 'next-i18next';
import { motion } from 'framer-motion';
import { 
  Mail, 
  Phone, 
  MapPin, 
  Twitter, 
  Facebook, 
  Linkedin, 
  Instagram,
  Send,
  ArrowUp
} from 'lucide-react';

import { Button } from '@/components/atoms/Button';
import { Input } from '@/components/atoms/Input';

export const Footer: React.FC = () => {
  const { t } = useTranslation('common');
  const [email, setEmail] = React.useState('');

  const footerSections = [
    {
      title: 'المنصة',
      links: [
        { name: 'الرئيسية', href: '/' },
        { name: 'المميزات', href: '/features' },
        { name: 'الأسعار', href: '/pricing' },
        { name: 'من نحن', href: '/about' }
      ]
    },
    {
      title: 'الخدمات',
      links: [
        { name: 'إشارات التداول', href: '/signals' },
        { name: 'التحليل الفني', href: '/analysis' },
        { name: 'التداول الآلي', href: '/automation' },
        { name: 'إدارة المحافظ', href: '/portfolio' }
      ]
    },
    {
      title: 'الدعم',
      links: [
        { name: 'مركز المساعدة', href: '/help' },
        { name: 'الأسئلة الشائعة', href: '/faq' },
        { name: 'اتصل بنا', href: '/contact' },
        { name: 'الحالة', href: '/status' }
      ]
    },
    {
      title: 'قانوني',
      links: [
        { name: 'سياسة الخصوصية', href: '/privacy' },
        { name: 'شروط الاستخدام', href: '/terms' },
        { name: 'سياسة ملفات تعريف الارتباط', href: '/cookies' },
        { name: 'إخلاء المسؤولية', href: '/disclaimer' }
      ]
    }
  ];

  const socialLinks = [
    { name: 'Twitter', icon: Twitter, href: '#', color: 'hover:text-blue-400' },
    { name: 'Facebook', icon: Facebook, href: '#', color: 'hover:text-blue-600' },
    { name: 'LinkedIn', icon: Linkedin, href: '#', color: 'hover:text-blue-700' },
    { name: 'Instagram', icon: Instagram, href: '#', color: 'hover:text-pink-500' }
  ];

  const contactInfo = [
    {
      icon: Mail,
      label: 'البريد الإلكتروني',
      value: 'support@platform.com',
      href: 'mailto:support@platform.com'
    },
    {
      icon: Phone,
      label: 'الهاتف',
      value: '+966 11 123 4567',
      href: 'tel:+966111234567'
    },
    {
      icon: MapPin,
      label: 'العنوان',
      value: 'الرياض، المملكة العربية السعودية',
      href: '#'
    }
  ];

  const handleNewsletterSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Handle newsletter subscription
    console.log('Newsletter subscription:', email);
    setEmail('');
  };

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <footer className="bg-card border-t border-border">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Main Footer Content */}
        <div className="py-16">
          <div className="grid lg:grid-cols-12 gap-8">
            {/* Brand Section */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
              className="lg:col-span-4"
            >
              {/* Logo */}
              <div className="flex items-center gap-2 mb-6">
                <div className="w-10 h-10 bg-gradient-to-br from-primary to-accent rounded-lg flex items-center justify-center">
                  <span className="text-white font-bold">DP</span>
                </div>
                <span className="font-bold text-xl text-foreground">
                  منصة الخدمات الرقمية
                </span>
              </div>

              {/* Description */}
              <p className="text-muted-foreground mb-6 leading-relaxed">
                منصة رقمية شاملة ومتكاملة تضم 15 نظامًا احترافيًا مترابطًا لتقديم خدمات متطورة 
                في مجال التداول والإشارات الذكية مع تطبيق أحدث التقنيات العالمية.
              </p>

              {/* Newsletter Subscription */}
              <div className="mb-6">
                <h4 className="font-semibold text-foreground mb-3">
                  اشترك في النشرة الإخبارية
                </h4>
                <form onSubmit={handleNewsletterSubmit} className="flex gap-2">
                  <Input
                    type="email"
                    placeholder="أدخل بريدك الإلكتروني"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="flex-1"
                    required
                  />
                  <Button type="submit" size="sm">
                    <Send className="h-4 w-4" />
                  </Button>
                </form>
              </div>

              {/* Social Links */}
              <div>
                <h4 className="font-semibold text-foreground mb-3">
                  تابعنا
                </h4>
                <div className="flex gap-2">
                  {socialLinks.map((social) => (
                    <Button
                      key={social.name}
                      variant="ghost"
                      size="icon"
                      className={`${social.color} transition-colors`}
                      asChild
                    >
                      <a href={social.href} target="_blank" rel="noopener noreferrer">
                        <social.icon className="h-5 w-5" />
                      </a>
                    </Button>
                  ))}
                </div>
              </div>
            </motion.div>

            {/* Footer Links */}
            <div className="lg:col-span-6 grid grid-cols-2 md:grid-cols-4 gap-8">
              {footerSections.map((section, index) => (
                <motion.div
                  key={section.title}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.6, delay: index * 0.1 }}
                >
                  <h4 className="font-semibold text-foreground mb-4">
                    {section.title}
                  </h4>
                  <ul className="space-y-2">
                    {section.links.map((link) => (
                      <li key={link.name}>
                        <Link
                          href={link.href}
                          className="text-muted-foreground hover:text-primary transition-colors text-sm"
                        >
                          {link.name}
                        </Link>
                      </li>
                    ))}
                  </ul>
                </motion.div>
              ))}
            </div>

            {/* Contact Info */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: 0.4 }}
              className="lg:col-span-2"
            >
              <h4 className="font-semibold text-foreground mb-4">
                تواصل معنا
              </h4>
              <div className="space-y-3">
                {contactInfo.map((contact, index) => (
                  <a
                    key={index}
                    href={contact.href}
                    className="flex items-center gap-3 text-muted-foreground hover:text-primary transition-colors group"
                  >
                    <contact.icon className="h-4 w-4 flex-shrink-0" />
                    <div>
                      <div className="text-xs text-muted-foreground/70">
                        {contact.label}
                      </div>
                      <div className="text-sm">{contact.value}</div>
                    </div>
                  </a>
                ))}
              </div>
            </motion.div>
          </div>
        </div>

        {/* Bottom Footer */}
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="py-6 border-t border-border"
        >
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            {/* Copyright */}
            <div className="text-sm text-muted-foreground">
              © {new Date().getFullYear()} منصة الخدمات الرقمية. جميع الحقوق محفوظة.
            </div>

            {/* Additional Links */}
            <div className="flex items-center gap-6 text-sm">
              <Link 
                href="/privacy" 
                className="text-muted-foreground hover:text-primary transition-colors"
              >
                الخصوصية
              </Link>
              <Link 
                href="/terms" 
                className="text-muted-foreground hover:text-primary transition-colors"
              >
                الشروط
              </Link>
              <Link 
                href="/cookies" 
                className="text-muted-foreground hover:text-primary transition-colors"
              >
                ملفات تعريف الارتباط
              </Link>
            </div>

            {/* Scroll to Top */}
            <Button
              variant="ghost"
              size="icon"
              onClick={scrollToTop}
              className="hover:bg-primary/10"
            >
              <ArrowUp className="h-4 w-4" />
            </Button>
          </div>
        </motion.div>
      </div>
    </footer>
  );
};