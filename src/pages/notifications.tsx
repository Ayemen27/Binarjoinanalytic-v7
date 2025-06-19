import { useState } from 'react'
import { Layout } from '@/components/organisms/Layout'
import { useAuth } from '@/hooks/useAuth'
import { useNotifications, useNotificationSettings, useRealtimeNotifications } from '@/hooks/useNotifications'
import { NotificationCard } from '@/components/molecules/NotificationCard'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/atoms/Card'
import { Button } from '@/components/atoms/Button'
import { Input } from '@/components/atoms/Input'
import { Badge } from '@/components/ui/badge'
import { 
  Bell, 
  CheckCircle, 
  Search, 
  Filter, 
  Settings as SettingsIcon,
  Wifi,
  WifiOff,
  CheckCheck,
  Trash2
} from 'lucide-react'
import { useRouter } from 'next/router'
import { useEffect } from 'react'

const NotificationsPage = () => {
  const { user, loading } = useAuth()
  const [currentPage, setCurrentPage] = useState(1)
  const [searchTerm, setSearchTerm] = useState('')
  const [typeFilter, setTypeFilter] = useState<string>('all')
  const { 
    notifications, 
    totalPages, 
    unreadCount, 
    markAsRead, 
    markAllAsRead, 
    deleteNotification,
    isMarkingAllAsRead
  } = useNotifications(currentPage, 20)
  const { settings, updateSettings } = useNotificationSettings()
  const { isConnected } = useRealtimeNotifications()
  const router = useRouter()

  useEffect(() => {
    if (!loading && !user) {
      router.push('/auth/login')
    }
  }, [user, loading, router])

  if (loading) {
    return (
      <Layout>
        <div className="flex items-center justify-center min-h-screen">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary"></div>
        </div>
      </Layout>
    )
  }

  if (!user) {
    return null
  }

  const filteredNotifications = notifications.filter(notification => {
    const matchesSearch = notification.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         notification.message.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesType = typeFilter === 'all' || notification.type === typeFilter
    return matchesSearch && matchesType
  })

  const notificationTypes = [
    { value: 'all', label: 'الكل', count: notifications.length },
    { value: 'signal', label: 'الإشارات', count: notifications.filter(n => n.type === 'signal').length },
    { value: 'billing', label: 'الفوترة', count: notifications.filter(n => n.type === 'billing').length },
    { value: 'success', label: 'نجاح', count: notifications.filter(n => n.type === 'success').length },
    { value: 'warning', label: 'تحذير', count: notifications.filter(n => n.type === 'warning').length },
    { value: 'error', label: 'أخطاء', count: notifications.filter(n => n.type === 'error').length },
  ]

  return (
    <Layout>
      <div className="p-6 space-y-6">
        {/* Header */}
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white flex items-center gap-3">
              <Bell className="h-8 w-8 text-blue-600" />
              الإشعارات
              {unreadCount > 0 && (
                <Badge className="bg-red-500 text-white">
                  {unreadCount}
                </Badge>
              )}
            </h1>
            <p className="text-gray-600 dark:text-gray-400 flex items-center gap-2">
              إدارة جميع إشعاراتك ورسائل النظام
              {isConnected ? (
                <div className="flex items-center gap-1 text-green-600">
                  <Wifi className="h-4 w-4" />
                  <span className="text-xs">متصل</span>
                </div>
              ) : (
                <div className="flex items-center gap-1 text-red-600">
                  <WifiOff className="h-4 w-4" />
                  <span className="text-xs">غير متصل</span>
                </div>
              )}
            </p>
          </div>
          
          <div className="flex flex-col sm:flex-row gap-3 mt-4 lg:mt-0">
            <Button
              onClick={() => markAllAsRead()}
              loading={isMarkingAllAsRead}
              disabled={unreadCount === 0}
              variant="outline"
            >
              <CheckCircle className="h-4 w-4 mr-2" />
              تحديد الكل كمقروء
            </Button>
            <Button
              onClick={() => router.push('/settings/notifications')}
              variant="outline"
            >
              <SettingsIcon className="h-4 w-4 mr-2" />
              إعدادات الإشعارات
            </Button>
          </div>
        </div>

        {/* Statistics */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                    إجمالي الإشعارات
                  </p>
                  <p className="text-2xl font-bold text-gray-900 dark:text-white">
                    {notifications.length}
                  </p>
                </div>
                <Bell className="h-8 w-8 text-blue-600" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                    غير مقروءة
                  </p>
                  <p className="text-2xl font-bold text-gray-900 dark:text-white">
                    {unreadCount}
                  </p>
                </div>
                <Badge className="bg-red-500 text-white h-8 w-8 rounded-full flex items-center justify-center">
                  !
                </Badge>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                    إشعارات الإشارات
                  </p>
                  <p className="text-2xl font-bold text-gray-900 dark:text-white">
                    {notifications.filter(n => n.type === 'signal').length}
                  </p>
                </div>
                <CheckCircle className="h-8 w-8 text-green-600" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                    الحالة
                  </p>
                  <p className="text-sm font-bold text-green-600">
                    {isConnected ? 'متصل' : 'غير متصل'}
                  </p>
                </div>
                {isConnected ? (
                  <Wifi className="h-8 w-8 text-green-600" />
                ) : (
                  <WifiOff className="h-8 w-8 text-red-600" />
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Filters */}
        <Card>
          <CardContent className="p-4">
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="flex-1">
                <Input
                  placeholder="البحث في الإشعارات..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  leftIcon={<Search className="h-4 w-4" />}
                />
              </div>
              
              <div className="flex gap-2 overflow-x-auto">
                {notificationTypes.map((type) => (
                  <Button
                    key={type.value}
                    variant={typeFilter === type.value ? "primary" : "outline"}
                    onClick={() => setTypeFilter(type.value)}
                    size="sm"
                    className="whitespace-nowrap"
                  >
                    {type.label}
                    {type.count > 0 && (
                      <Badge className="ml-1 bg-gray-500 text-white text-xs">
                        {type.count}
                      </Badge>
                    )}
                  </Button>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Notifications List */}
        {filteredNotifications.length > 0 ? (
          <>
            <div className="space-y-4">
              {filteredNotifications.map((notification) => (
                <NotificationCard
                  key={notification.id}
                  notification={notification}
                  onMarkAsRead={markAsRead}
                  onDelete={deleteNotification}
                  showActions={true}
                />
              ))}
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex justify-center space-x-2">
                <Button
                  variant="outline"
                  onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                  disabled={currentPage === 1}
                >
                  السابق
                </Button>
                
                <div className="flex items-center space-x-2">
                  {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
                    <Button
                      key={page}
                      variant={currentPage === page ? "primary" : "outline"}
                      onClick={() => setCurrentPage(page)}
                      size="sm"
                    >
                      {page}
                    </Button>
                  ))}
                </div>

                <Button
                  variant="outline"
                  onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                  disabled={currentPage === totalPages}
                >
                  التالي
                </Button>
              </div>
            )}
          </>
        ) : (
          /* Empty State */
          <Card>
            <CardContent className="p-12 text-center">
              <Bell className="h-16 w-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                لا توجد إشعارات
              </h3>
              <p className="text-gray-600 dark:text-gray-400 mb-6">
                {searchTerm || typeFilter !== 'all' 
                  ? 'لم يتم العثور على إشعارات تطابق الفلاتر المحددة' 
                  : 'لم تتلق أي إشعارات بعد'}
              </p>
              {(searchTerm || typeFilter !== 'all') && (
                <Button
                  onClick={() => {
                    setSearchTerm('')
                    setTypeFilter('all')
                  }}
                  variant="outline"
                >
                  مسح الفلاتر
                </Button>
              )}
            </CardContent>
          </Card>
        )}

        {/* Quick Settings */}
        <Card>
          <CardHeader>
            <CardTitle>الإعدادات السريعة</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              <div className="flex items-center justify-between p-3 border border-gray-200 dark:border-gray-700 rounded-lg">
                <span className="text-sm font-medium">إشعارات الإشارات</span>
                <Button
                  size="sm"
                  variant={settings.signal_alerts ? "primary" : "outline"}
                  onClick={() => updateSettings({ signal_alerts: !settings.signal_alerts })}
                >
                  {settings.signal_alerts ? 'مفعل' : 'معطل'}
                </Button>
              </div>

              <div className="flex items-center justify-between p-3 border border-gray-200 dark:border-gray-700 rounded-lg">
                <span className="text-sm font-medium">إشعارات الفوترة</span>
                <Button
                  size="sm"
                  variant={settings.billing_alerts ? "primary" : "outline"}
                  onClick={() => updateSettings({ billing_alerts: !settings.billing_alerts })}
                >
                  {settings.billing_alerts ? 'مفعل' : 'معطل'}
                </Button>
              </div>

              <div className="flex items-center justify-between p-3 border border-gray-200 dark:border-gray-700 rounded-lg">
                <span className="text-sm font-medium">إشعارات البريد</span>
                <Button
                  size="sm"
                  variant={settings.email_notifications ? "primary" : "outline"}
                  onClick={() => updateSettings({ email_notifications: !settings.email_notifications })}
                >
                  {settings.email_notifications ? 'مفعل' : 'معطل'}
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </Layout>
  )
}

export default NotificationsPage