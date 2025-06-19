import React, { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/router'
import { useAuth } from '@/hooks/useAuth'
import { useRBAC } from '@/hooks/useRBAC'
import { useNotifications } from '@/hooks/useNotifications'
import { Button } from '@/components/atoms/Button'
import { Badge } from '@/components/ui/badge'
import { 
  Home,
  TrendingUp,
  BarChart3,
  Bell,
  Settings,
  User,
  Shield,
  CreditCard,
  Link as LinkIcon,
  Brain,
  Code,
  Menu,
  X,
  LogOut,
  Moon,
  Sun
} from 'lucide-react'
import { useTheme } from '@/providers/ThemeProvider'

export const Navigation: React.FC = () => {
  const { user, signOut } = useAuth()
  const { hasPermission } = useRBAC()
  const { unreadCount } = useNotifications()
  const { theme, setTheme } = useTheme()
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const router = useRouter()

  const navigationItems = [
    {
      name: 'الرئيسية',
      href: '/',
      icon: Home,
      permission: null
    },
    {
      name: 'الإشارات',
      href: '/signals',
      icon: TrendingUp,
      permission: 'signals:read'
    },
    {
      name: 'التحليلات',
      href: '/analytics',
      icon: BarChart3,
      permission: null
    },
    {
      name: 'الإشعارات',
      href: '/notifications',
      icon: Bell,
      permission: null,
      badge: unreadCount > 0 ? unreadCount : null
    },
    {
      name: 'الاشتراكات',
      href: '/pricing',
      icon: CreditCard,
      permission: null
    },
    {
      name: 'التكامل',
      href: '/integrations',
      icon: LinkIcon,
      permission: null
    },
    {
      name: 'الذكاء الاصطناعي',
      href: '/ai/recommendations',
      icon: Brain,
      permission: null
    },
    {
      name: 'API للمطورين',
      href: '/api-docs',
      icon: Code,
      permission: null
    }
  ]

  const adminItems = [
    {
      name: 'إدارة الأدوار',
      href: '/admin/roles',
      icon: Shield,
      permission: 'admin:read'
    }
  ]

  const isActiveRoute = (href: string) => {
    if (href === '/') {
      return router.pathname === '/'
    }
    return router.pathname.startsWith(href)
  }

  const filteredNavItems = navigationItems.filter(item => 
    !item.permission || hasPermission(item.permission.split(':')[0], item.permission.split(':')[1])
  )

  const filteredAdminItems = adminItems.filter(item => 
    hasPermission(item.permission.split(':')[0], item.permission.split(':')[1])
  )

  return (
    <>
      {/* Desktop Sidebar */}
      <div className="hidden lg:flex lg:w-64 lg:flex-col lg:fixed lg:inset-y-0 bg-white dark:bg-gray-900 border-r border-gray-200 dark:border-gray-700">
        <div className="flex flex-col flex-grow pt-5 pb-4 overflow-y-auto">
          {/* Logo */}
          <div className="flex items-center flex-shrink-0 px-4">
            <TrendingUp className="h-8 w-8 text-blue-600" />
            <span className="ml-2 text-xl font-bold text-gray-900 dark:text-white">
              منصة الإشارات
            </span>
          </div>

          {/* Navigation */}
          <nav className="mt-8 flex-1 px-2 space-y-1">
            {filteredNavItems.map((item) => {
              const isActive = isActiveRoute(item.href)
              return (
                <Link
                  key={item.name}
                  href={item.href}
                  className={`group flex items-center px-2 py-2 text-sm font-medium rounded-md transition-colors ${
                    isActive
                      ? 'bg-blue-100 text-blue-900 dark:bg-blue-900 dark:text-blue-100'
                      : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900 dark:text-gray-300 dark:hover:bg-gray-800 dark:hover:text-white'
                  }`}
                >
                  <item.icon
                    className={`mr-3 flex-shrink-0 h-5 w-5 ${
                      isActive ? 'text-blue-500' : 'text-gray-400 group-hover:text-gray-500'
                    }`}
                  />
                  {item.name}
                  {item.badge && (
                    <Badge className="ml-auto bg-red-500 text-white">
                      {item.badge}
                    </Badge>
                  )}
                </Link>
              )
            })}

            {/* Admin Section */}
            {filteredAdminItems.length > 0 && (
              <>
                <div className="mt-8">
                  <h3 className="px-3 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    الإدارة
                  </h3>
                  <div className="mt-2 space-y-1">
                    {filteredAdminItems.map((item) => {
                      const isActive = isActiveRoute(item.href)
                      return (
                        <Link
                          key={item.name}
                          href={item.href}
                          className={`group flex items-center px-2 py-2 text-sm font-medium rounded-md transition-colors ${
                            isActive
                              ? 'bg-blue-100 text-blue-900 dark:bg-blue-900 dark:text-blue-100'
                              : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900 dark:text-gray-300 dark:hover:bg-gray-800 dark:hover:text-white'
                          }`}
                        >
                          <item.icon
                            className={`mr-3 flex-shrink-0 h-5 w-5 ${
                              isActive ? 'text-blue-500' : 'text-gray-400 group-hover:text-gray-500'
                            }`}
                          />
                          {item.name}
                        </Link>
                      )
                    })}
                  </div>
                </div>
              </>
            )}
          </nav>

          {/* User Section */}
          <div className="flex-shrink-0 flex border-t border-gray-200 dark:border-gray-700 p-4">
            <div className="flex items-center w-full">
              <div className="flex-shrink-0">
                <div className="h-8 w-8 rounded-full bg-blue-600 flex items-center justify-center">
                  <User className="h-5 w-5 text-white" />
                </div>
              </div>
              <div className="ml-3 flex-1">
                <p className="text-sm font-medium text-gray-700 dark:text-gray-200">
                  {user?.email || 'مستخدم'}
                </p>
              </div>
              <div className="flex items-center space-x-1">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
                >
                  {theme === 'dark' ? (
                    <Sun className="h-4 w-4" />
                  ) : (
                    <Moon className="h-4 w-4" />
                  )}
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => signOut()}
                >
                  <LogOut className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Mobile Header */}
      <div className="lg:hidden">
        <div className="flex items-center justify-between bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-700 px-4 py-3">
          <div className="flex items-center">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            >
              {isMobileMenuOpen ? (
                <X className="h-6 w-6" />
              ) : (
                <Menu className="h-6 w-6" />
              )}
            </Button>
            <div className="ml-2 flex items-center">
              <TrendingUp className="h-6 w-6 text-blue-600" />
              <span className="ml-2 text-lg font-bold text-gray-900 dark:text-white">
                منصة الإشارات
              </span>
            </div>
          </div>
          
          <div className="flex items-center space-x-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
            >
              {theme === 'dark' ? (
                <Sun className="h-4 w-4" />
              ) : (
                <Moon className="h-4 w-4" />
              )}
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => signOut()}
            >
              <LogOut className="h-4 w-4" />
            </Button>
          </div>
        </div>

        {/* Mobile Menu */}
        {isMobileMenuOpen && (
          <div className="lg:hidden">
            <div className="bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-700">
              <nav className="px-2 pt-2 pb-3 space-y-1">
                {filteredNavItems.map((item) => {
                  const isActive = isActiveRoute(item.href)
                  return (
                    <Link
                      key={item.name}
                      href={item.href}
                      onClick={() => setIsMobileMenuOpen(false)}
                      className={`group flex items-center px-2 py-2 text-base font-medium rounded-md transition-colors ${
                        isActive
                          ? 'bg-blue-100 text-blue-900 dark:bg-blue-900 dark:text-blue-100'
                          : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900 dark:text-gray-300 dark:hover:bg-gray-800 dark:hover:text-white'
                      }`}
                    >
                      <item.icon
                        className={`mr-3 flex-shrink-0 h-5 w-5 ${
                          isActive ? 'text-blue-500' : 'text-gray-400 group-hover:text-gray-500'
                        }`}
                      />
                      {item.name}
                      {item.badge && (
                        <Badge className="ml-auto bg-red-500 text-white">
                          {item.badge}
                        </Badge>
                      )}
                    </Link>
                  )
                })}

                {/* Admin Items for Mobile */}
                {filteredAdminItems.map((item) => {
                  const isActive = isActiveRoute(item.href)
                  return (
                    <Link
                      key={item.name}
                      href={item.href}
                      onClick={() => setIsMobileMenuOpen(false)}
                      className={`group flex items-center px-2 py-2 text-base font-medium rounded-md transition-colors ${
                        isActive
                          ? 'bg-blue-100 text-blue-900 dark:bg-blue-900 dark:text-blue-100'
                          : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900 dark:text-gray-300 dark:hover:bg-gray-800 dark:hover:text-white'
                      }`}
                    >
                      <item.icon
                        className={`mr-3 flex-shrink-0 h-5 w-5 ${
                          isActive ? 'text-blue-500' : 'text-gray-400 group-hover:text-gray-500'
                        }`}
                      />
                      {item.name}
                    </Link>
                  )
                })}
              </nav>

              <div className="pt-4 pb-3 border-t border-gray-200 dark:border-gray-700">
                <div className="px-2">
                  <div className="flex items-center">
                    <div className="flex-shrink-0">
                      <div className="h-8 w-8 rounded-full bg-blue-600 flex items-center justify-center">
                        <User className="h-5 w-5 text-white" />
                      </div>
                    </div>
                    <div className="ml-3">
                      <div className="text-base font-medium text-gray-800 dark:text-gray-200">
                        {user?.email || 'مستخدم'}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </>
  )
}