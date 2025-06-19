import { useState } from 'react'
import { Layout } from '@/components/organisms/Layout'
import { useAuth } from '@/hooks/useAuth'
import { useSignals } from '@/hooks/useSignals'
import { useUserAnalytics, useDashboardAnalytics } from '@/hooks/useAnalytics'
import { useUserSubscription } from '@/hooks/useSubscriptions'
import { useNotifications } from '@/hooks/useNotifications'
import { SignalCard } from '@/components/molecules/SignalCard'
import { NotificationCard } from '@/components/molecules/NotificationCard'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/atoms/Card'
import { Button } from '@/components/atoms/Button'
import { Badge } from '@/components/ui/badge'
import { 
  TrendingUp, 
  TrendingDown, 
  Target, 
  Activity,
  Bell,
  BarChart3,
  DollarSign,
  Users,
  Zap,
  ArrowRight,
  RefreshCw
} from 'lucide-react'
import { useRouter } from 'next/router'
import { useEffect } from 'react'

const DashboardPage = () => {
  const { user, loading } = useAuth()
  const { signals, isLoading: signalsLoading } = useSignals(1, 5)
  const { analytics, calculateAnalytics, isCalculating } = useUserAnalytics()
  const { dashboardData } = useDashboardAnalytics()
  const { subscription, usageStats } = useUserSubscription()
  const { notifications, markAsRead, deleteNotification } = useNotifications(1, 5)
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

  const getWinRateColor = (winRate: number) => {
    if (winRate >= 80) return 'text-green-600'
    if (winRate >= 60) return 'text-blue-600'
    if (winRate >= 40) return 'text-yellow-600'
    return 'text-red-600'
  }

  const formatPips = (pips: number) => {
    return pips >= 0 ? `+${pips.toFixed(1)}` : pips.toFixed(1)
  }

  return (
    <Layout>
      <div className="p-6 space-y-6">
        {/* Header */}
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
              مرحباً، {user.email?.split('@')[0] || 'المتداول'}
            </h1>
            <p className="text-gray-600 dark:text-gray-400">
              إليك نظرة عامة على أدائك التداولي اليوم
            </p>
          </div>
          
          <div className="flex gap-3 mt-4 lg:mt-0">
            <Button
              onClick={() => calculateAnalytics()}
              loading={isCalculating}
              variant="outline"
            >
              <RefreshCw className="h-4 w-4 mr-2" />
              تحديث البيانات
            </Button>
            <Button
              onClick={() => router.push('/signals')}
              className="bg-blue-600 hover:bg-blue-700"
            >
              <TrendingUp className="h-4 w-4 mr-2" />
              عرض جميع الإشارات
            </Button>
          </div>
        </div>

        {/* Key Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <Card className="bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-900/20 dark:to-blue-800/20 border-blue-200">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-blue-600 dark:text-blue-400">
                    معدل النجاح
                  </p>
                  <p className={`text-3xl font-bold ${getWinRateColor(analytics.win_rate)}`}>
                    {analytics.win_rate.toFixed(1)}%
                  </p>
                  <p className="text-xs text-blue-600 dark:text-blue-400 mt-1">
                    من {analytics.signals_won + analytics.signals_lost} إشارة
                  </p>
                </div>
                <Target className="h-10 w-10 text-blue-600" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-green-50 to-green-100 dark:from-green-900/20 dark:to-green-800/20 border-green-200">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-green-600 dark:text-green-400">
                    إجمالي النقاط
                  </p>
                  <p className={`text-3xl font-bold ${analytics.total_profit_pips >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                    {formatPips(analytics.total_profit_pips)}
                  </p>
                  <p className="text-xs text-green-600 dark:text-green-400 mt-1">
                    نقطة (Pips)
                  </p>
                </div>
                <DollarSign className="h-10 w-10 text-green-600" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-purple-50 to-purple-100 dark:from-purple-900/20 dark:to-purple-800/20 border-purple-200">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-purple-600 dark:text-purple-400">
                    الإشارات اليوم
                  </p>
                  <p className="text-3xl font-bold text-purple-600">
                    {dashboardData.signalStats.signalsToday}
                  </p>
                  <p className="text-xs text-purple-600 dark:text-purple-400 mt-1">
                    من {dashboardData.signalStats.totalSignals} إجمالي
                  </p>
                </div>
                <Activity className="h-10 w-10 text-purple-600" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-orange-50 to-orange-100 dark:from-orange-900/20 dark:to-orange-800/20 border-orange-200">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-orange-600 dark:text-orange-400">
                    نوع الاشتراك
                  </p>
                  <p className="text-2xl font-bold text-orange-600">
                    {subscription?.plan_id ? 'مدفوع' : 'مجاني'}
                  </p>
                  <p className="text-xs text-orange-600 dark:text-orange-400 mt-1">
                    {usageStats ? `${usageStats.signalsUsed}/${usageStats.signalsLimit}` : '0/5'} إشارة
                  </p>
                </div>
                <Zap className="h-10 w-10 text-orange-600" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Usage Progress */}
        {usageStats && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <span>استهلاك الاشتراك</span>
                <Badge variant="outline">
                  {subscription?.status || 'free'}
                </Badge>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <div className="flex justify-between text-sm mb-2">
                    <span>الإشارات المستخدمة</span>
                    <span>
                      {usageStats.signalsUsed} من {usageStats.signalsLimit === -1 ? '∞' : usageStats.signalsLimit}
                    </span>
                  </div>
                  <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                    <div
                      className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                      style={{ 
                        width: usageStats.signalsLimit === -1 
                          ? '100%' 
                          : `${Math.min((usageStats.signalsUsed / usageStats.signalsLimit) * 100, 100)}%` 
                      }}
                    />
                  </div>
                </div>
                
                {usageStats.signalsLimit !== -1 && usageStats.signalsUsed >= usageStats.signalsLimit * 0.8 && (
                  <div className="bg-yellow-50 dark:bg-yellow-900/20 p-3 rounded-lg">
                    <p className="text-sm text-yellow-800 dark:text-yellow-300">
                      اقترب استهلاكك من الحد المسموح. فكر في ترقية اشتراكك.
                    </p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Recent Signals and Notifications */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Recent Signals */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center gap-2">
                  <TrendingUp className="h-5 w-5 text-blue-600" />
                  الإشارات الأخيرة
                </CardTitle>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => router.push('/signals')}
                >
                  عرض الكل
                  <ArrowRight className="h-4 w-4 mr-1" />
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              {signalsLoading ? (
                <div className="space-y-3">
                  {[...Array(3)].map((_, i) => (
                    <div key={i} className="animate-pulse">
                      <div className="h-20 bg-gray-200 dark:bg-gray-700 rounded-lg"></div>
                    </div>
                  ))}
                </div>
              ) : signals.length > 0 ? (
                <div className="space-y-3">
                  {signals.slice(0, 3).map((signal) => (
                    <SignalCard
                      key={signal.id}
                      signal={signal}
                      showActions={false}
                    />
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <TrendingUp className="h-12 w-12 text-gray-400 mx-auto mb-3" />
                  <p className="text-gray-600 dark:text-gray-400">
                    لا توجد إشارات بعد
                  </p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Recent Notifications */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center gap-2">
                  <Bell className="h-5 w-5 text-green-600" />
                  الإشعارات الحديثة
                </CardTitle>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => router.push('/notifications')}
                >
                  عرض الكل
                  <ArrowRight className="h-4 w-4 mr-1" />
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              {notifications.length > 0 ? (
                <div className="space-y-3">
                  {notifications.slice(0, 3).map((notification) => (
                    <NotificationCard
                      key={notification.id}
                      notification={notification}
                      onMarkAsRead={markAsRead}
                      onDelete={deleteNotification}
                      showActions={false}
                    />
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <Bell className="h-12 w-12 text-gray-400 mx-auto mb-3" />
                  <p className="text-gray-600 dark:text-gray-400">
                    لا توجد إشعارات جديدة
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* System Overview */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BarChart3 className="h-5 w-5 text-purple-600" />
              نظرة عامة على النظام
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              <div className="text-center">
                <p className="text-3xl font-bold text-blue-600">
                  {dashboardData.userStats.totalUsers}
                </p>
                <p className="text-sm text-gray-600 dark:text-gray-400">إجمالي المستخدمين</p>
              </div>
              
              <div className="text-center">
                <p className="text-3xl font-bold text-green-600">
                  {dashboardData.signalStats.avgWinRate.toFixed(1)}%
                </p>
                <p className="text-sm text-gray-600 dark:text-gray-400">متوسط النجاح</p>
              </div>
              
              <div className="text-center">
                <p className="text-3xl font-bold text-purple-600">
                  {dashboardData.systemStats.systemUptime.toFixed(1)}%
                </p>
                <p className="text-sm text-gray-600 dark:text-gray-400">وقت تشغيل النظام</p>
              </div>
              
              <div className="text-center">
                <p className="text-3xl font-bold text-orange-600">
                  {dashboardData.systemStats.avgResponseTime}ms
                </p>
                <p className="text-sm text-gray-600 dark:text-gray-400">زمن الاستجابة</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Quick Actions */}
        <Card>
          <CardHeader>
            <CardTitle>إجراءات سريعة</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Button
                onClick={() => router.push('/analytics')}
                variant="outline"
                className="h-20 flex-col"
              >
                <BarChart3 className="h-6 w-6 mb-2" />
                عرض التحليلات التفصيلية
              </Button>
              
              <Button
                onClick={() => router.push('/integrations')}
                variant="outline"
                className="h-20 flex-col"
              >
                <Zap className="h-6 w-6 mb-2" />
                ربط منصات خارجية
              </Button>
              
              <Button
                onClick={() => router.push('/pricing')}
                variant="outline"
                className="h-20 flex-col"
              >
                <DollarSign className="h-6 w-6 mb-2" />
                ترقية الاشتراك
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </Layout>
  )
}

export default DashboardPage