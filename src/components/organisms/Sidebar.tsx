import React from 'react';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { useTranslation } from 'next-i18next';
import { motion } from 'framer-motion';
import { 
  Home,
  TrendingUp,
  BarChart3,
  Bell,
  Settings,
  Users,
  Shield,
  Database,
  Zap,
  Globe,
  CreditCard,
  HelpCircle,
  LogOut
} from 'lucide-react';

import { Button } from '@/components/atoms/Button';
import { useAuth } from '@/providers/AuthProvider';

export const Sidebar: React.FC = () => {
  const { t } = useTranslation('navigation');
  const router = useRouter();
  const { signOut } = useAuth();

  const menuItems = [
    {
      title: 'الرئيسية',
      items: [
        { name: 'لوحة التحكم', href: '/dashboard', icon: Home },
        { name: 'الإشارات', href: '/dashboard/signals', icon: TrendingUp },
        { name: 'التحليلات', href: '/dashboard/analytics', icon: BarChart3 },
        { name: 'التنبيهات', href: '/dashboard/notifications', icon: Bell }
      ]
    },
    {
      title: 'إدارة النظام',
      items: [
        { name: 'المستخدمين', href: '/dashboard/admin/users', icon: Users },
        { name: 'الأدوار', href: '/dashboard/admin/roles', icon: Shield },
        { name: 'الصلاحيات', href: '/dashboard/admin/permissions', icon: Shield },
        { name: 'قاعدة البيانات', href: '/dashboard/admin/database', icon: Database }
      ]
    },
    {
      title: 'التكامل',
      items: [
        { name: 'الخدمات الخارجية', href: '/dashboard/integrations', icon: Globe },
        { name: 'المدفوعات', href: '/dashboard/billing', icon: CreditCard },
        { name: 'الإعدادات', href: '/dashboard/settings', icon: Settings },
        { name: 'المساعدة', href: '/dashboard/help', icon: HelpCircle }
      ]
    }
  ];

  const isActive = (href: string) => {
    if (href === '/dashboard') {
      return router.pathname === '/dashboard';
    }
    return router.pathname.startsWith(href);
  };

  return (
    <div className="flex flex-col h-full bg-card border-r border-border">
      {/* Sidebar Header */}
      <div className="p-6 border-b border-border">
        <Link href="/dashboard" className="flex items-center gap-2">
          <div className="w-8 h-8 bg-gradient-to-br from-primary to-accent rounded-lg flex items-center justify-center">
            <span className="text-white font-bold text-sm">DP</span>
          </div>
          <span className="font-bold text-lg text-foreground">
            لوحة التحكم
          </span>
        </Link>
      </div>

      {/* Navigation Menu */}
      <nav className="flex-1 overflow-y-auto p-4">
        <div className="space-y-6">
          {menuItems.map((section, sectionIndex) => (
            <motion.div
              key={section.title}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: sectionIndex * 0.1 }}
            >
              <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3">
                {section.title}
              </h3>
              <div className="space-y-1">
                {section.items.map((item, itemIndex) => (
                  <motion.div
                    key={item.name}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.3, delay: (sectionIndex * 0.1) + (itemIndex * 0.05) }}
                  >
                    <Link href={item.href}>
                      <Button
                        variant={isActive(item.href) ? 'secondary' : 'ghost'}
                        className={`
                          w-full justify-start gap-3 h-10 px-3
                          ${isActive(item.href) 
                            ? 'bg-primary/10 text-primary border-primary/20' 
                            : 'text-muted-foreground hover:text-foreground hover:bg-accent'
                          }
                        `}
                      >
                        <item.icon className="h-4 w-4" />
                        <span className="text-sm">{item.name}</span>
                      </Button>
                    </Link>
                  </motion.div>
                ))}
              </div>
            </motion.div>
          ))}
        </div>
      </nav>

      {/* Sidebar Footer */}
      <div className="p-4 border-t border-border">
        <Button
          variant="ghost"
          onClick={signOut}
          className="w-full justify-start gap-3 text-destructive hover:text-destructive hover:bg-destructive/10"
        >
          <LogOut className="h-4 w-4" />
          <span className="text-sm">تسجيل الخروج</span>
        </Button>
      </div>
    </div>
  );
};