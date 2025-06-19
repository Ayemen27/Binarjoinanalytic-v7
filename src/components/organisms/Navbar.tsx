import React from 'react';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { useTranslation } from 'next-i18next';
import { motion } from 'framer-motion';
import { 
  Menu, 
  X, 
  Globe, 
  Moon, 
  Sun, 
  Monitor,
  Settings,
  LogOut,
  User,
  Bell,
  Search
} from 'lucide-react';

import { Button } from '@/components/atoms/Button';
import { Input } from '@/components/atoms/Input';
import { useAuth } from '@/providers/AuthProvider';
import { useTheme } from '@/providers/ThemeProvider';
import { cn } from '@/utils/cn';

interface NavbarProps {
  onSidebarToggle?: () => void;
  showSidebarToggle?: boolean;
}

export const Navbar: React.FC<NavbarProps> = ({
  onSidebarToggle,
  showSidebarToggle = false,
}) => {
  const { t } = useTranslation('navigation');
  const router = useRouter();
  const { user, signOut } = useAuth();
  const { theme, setTheme } = useTheme();
  
  const [mobileMenuOpen, setMobileMenuOpen] = React.useState(false);
  const [userMenuOpen, setUserMenuOpen] = React.useState(false);
  const [searchQuery, setSearchQuery] = React.useState('');

  // Navigation items
  const navigationItems = [
    { name: t('home'), href: '/', current: router.pathname === '/' },
    { name: t('features'), href: '/features', current: router.pathname === '/features' },
    { name: t('pricing'), href: '/pricing', current: router.pathname === '/pricing' },
    { name: t('about'), href: '/about', current: router.pathname === '/about' },
    { name: t('contact'), href: '/contact', current: router.pathname === '/contact' },
  ];

  // Theme options
  const themeOptions = [
    { value: 'light', label: t('theme.light'), icon: Sun },
    { value: 'dark', label: t('theme.dark'), icon: Moon },
    { value: 'system', label: t('theme.system'), icon: Monitor },
  ];

  // Language options
  const languageOptions = [
    { value: 'ar', label: 'العربية', flag: '🇸🇦' },
    { value: 'en', label: 'English', flag: '🇺🇸' },
  ];

  const handleLanguageChange = (locale: string) => {
    router.push(router.pathname, router.asPath, { locale });
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      router.push(`/search?q=${encodeURIComponent(searchQuery)}`);
    }
  };

  return (
    <nav className="bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 border-b border-border">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Left Section */}
          <div className="flex items-center gap-4">
            {/* Sidebar Toggle (Dashboard) */}
            {showSidebarToggle && (
              <Button
                variant="ghost"
                size="icon"
                onClick={onSidebarToggle}
                className="lg:hidden"
              >
                <Menu className="h-5 w-5" />
              </Button>
            )}

            {/* Logo */}
            <Link href="/" className="flex items-center gap-2">
              <motion.div
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="flex items-center gap-2"
              >
                <div className="w-8 h-8 bg-gradient-to-br from-primary to-accent rounded-lg flex items-center justify-center">
                  <span className="text-white font-bold text-sm">DP</span>
                </div>
                <span className="font-bold text-lg text-foreground hidden sm:block">
                  {t('brand')}
                </span>
              </motion.div>
            </Link>

            {/* Desktop Navigation */}
            <div className="hidden lg:flex items-center gap-1">
              {navigationItems.map((item) => (
                <Link key={item.name} href={item.href}>
                  <Button
                    variant={item.current ? 'secondary' : 'ghost'}
                    className="text-sm"
                  >
                    {item.name}
                  </Button>
                </Link>
              ))}
            </div>
          </div>

          {/* Center Section - Search (Dashboard) */}
          {user && (
            <div className="hidden md:flex flex-1 max-w-md mx-8">
              <form onSubmit={handleSearch} className="w-full">
                <Input
                  type="search"
                  placeholder={t('search.placeholder')}
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  leftIcon={<Search className="h-4 w-4" />}
                  variant="filled"
                />
              </form>
            </div>
          )}

          {/* Right Section */}
          <div className="flex items-center gap-2">
            {/* Theme Switcher */}
            <div className="relative">
              <Button
                variant="ghost"
                size="icon"
                onClick={() => {
                  const themes = ['light', 'dark', 'system'];
                  const currentIndex = themes.indexOf(theme);
                  const nextTheme = themes[(currentIndex + 1) % themes.length];
                  setTheme(nextTheme as any);
                }}
                className="hidden sm:flex"
              >
                {theme === 'dark' ? (
                  <Moon className="h-4 w-4" />
                ) : theme === 'light' ? (
                  <Sun className="h-4 w-4" />
                ) : (
                  <Monitor className="h-4 w-4" />
                )}
              </Button>
            </div>

            {/* Language Switcher */}
            <div className="relative">
              <Button
                variant="ghost"
                size="icon"
                onClick={() => handleLanguageChange(router.locale === 'ar' ? 'en' : 'ar')}
                className="hidden sm:flex"
              >
                <Globe className="h-4 w-4" />
              </Button>
            </div>

            {/* User Section */}
            {user ? (
              <div className="flex items-center gap-2">
                {/* Notifications */}
                <Button variant="ghost" size="icon" className="relative">
                  <Bell className="h-4 w-4" />
                  <span className="absolute -top-1 -right-1 h-3 w-3 bg-destructive rounded-full text-xs flex items-center justify-center text-white">
                    3
                  </span>
                </Button>

                {/* User Menu */}
                <div className="relative">
                  <Button
                    variant="ghost"
                    onClick={() => setUserMenuOpen(!userMenuOpen)}
                    className="flex items-center gap-2"
                  >
                    <div className="w-8 h-8 bg-primary rounded-full flex items-center justify-center">
                      <User className="h-4 w-4 text-primary-foreground" />
                    </div>
                    <span className="hidden md:block text-sm">
                      {user.email?.split('@')[0]}
                    </span>
                  </Button>

                  {/* User Dropdown */}
                  {userMenuOpen && (
                    <motion.div
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: 10 }}
                      className="absolute right-0 mt-2 w-48 bg-popover border border-border rounded-md shadow-lg z-50"
                    >
                      <div className="py-1">
                        <Link href="/dashboard">
                          <Button variant="ghost" className="w-full justify-start gap-2">
                            <User className="h-4 w-4" />
                            {t('user.profile')}
                          </Button>
                        </Link>
                        <Link href="/dashboard/settings">
                          <Button variant="ghost" className="w-full justify-start gap-2">
                            <Settings className="h-4 w-4" />
                            {t('user.settings')}
                          </Button>
                        </Link>
                        <hr className="my-1 border-border" />
                        <Button
                          variant="ghost"
                          onClick={signOut}
                          className="w-full justify-start gap-2 text-destructive hover:text-destructive"
                        >
                          <LogOut className="h-4 w-4" />
                          {t('user.signOut')}
                        </Button>
                      </div>
                    </motion.div>
                  )}
                </div>
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <Link href="/auth/signin">
                  <Button variant="ghost">
                    {t('auth.signIn')}
                  </Button>
                </Link>
                <Link href="/auth/signup">
                  <Button variant="primary">
                    {t('auth.signUp')}
                  </Button>
                </Link>
              </div>
            )}

            {/* Mobile Menu Toggle */}
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="lg:hidden"
            >
              {mobileMenuOpen ? (
                <X className="h-5 w-5" />
              ) : (
                <Menu className="h-5 w-5" />
              )}
            </Button>
          </div>
        </div>

        {/* Mobile Menu */}
        {mobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="lg:hidden border-t border-border"
          >
            <div className="px-2 pt-2 pb-3 space-y-1">
              {navigationItems.map((item) => (
                <Link key={item.name} href={item.href}>
                  <Button
                    variant={item.current ? 'secondary' : 'ghost'}
                    className="w-full justify-start"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    {item.name}
                  </Button>
                </Link>
              ))}
            </div>
          </motion.div>
        )}
      </div>
    </nav>
  );
};