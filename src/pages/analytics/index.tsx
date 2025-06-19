import { useState } from 'react'
import { Layout } from '@/components/organisms/Layout'
import { useAuth } from '@/hooks/useAuth'
import { useUserAnalytics, useTradingPerformance, useAnalyticsExport } from '@/hooks/useAnalytics'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/atoms/Card'
import { Button } from '@/components/atoms/Button'
import { Badge } from '@/components/ui/badge'
import { 
  BarChart3, 
  TrendingUp, 
  TrendingDown, 
  Target, 
  Award,
  Calendar,
  Download,
  RefreshCw,
  PieChart,
  Activity,
  DollarSign
} from 'lucide-react'
import { useRouter } from 'next/router'
import { useEffect } from 'react'

const AnalyticsPage = () => {
  const { user, loading } = useAuth()
  const { analytics, calculateAnalytics, isCalculating } = useUserAnalytics()
  const { performance } = useTradingPerformance()
  const { exportAnalytics, isExporting } = useAnalyticsExport()
  const [selectedPeriod, setSelectedPeriod] = useState<'7d' | '30d' | '90d' | '1y'>('30d')
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

  const periods = [
    { value: '7d', label: '7 أيام' },
    { value: '30d', label: '30 يوم' },
    { value: '90d', label: '90 يوم' },
    { value: '1y', label: 'سنة' },
  ]

  return (
    <Layout>
      <div className="p-6 space-y-6">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white flex items-center gap-3">
              <BarChart3 className="h-8 w-8 text-blue-600" />
              التحليلات والإحصائيات
            </h1>
            <p className="text-gray-600 dark:text-gray-400">
              تحليل شامل لأدائك التداولي ونشاطك على المنصة
            </p>
          </div>
          
          <div className="flex flex-col sm:flex-row gap-3 mt-4 lg:mt-0">
            <Button
              onClick={() => calculateAnalytics()}
              loading={isCalculating}
              variant="outline"
            >
              <RefreshCw className="h-4 w-4 mr-2" />
              تحديث البيانات
            </Button>
            <Button
              onClick={() => exportAnalytics('json')}
              loading={isExporting}
              className="bg-green-600 hover:bg-green-700"
            >
              <Download className="h-4 w-4 mr-2" />
              تصدير التقرير
            </Button>
          </div>
        </div>

        <Card>
          <CardContent className="p-4">
            <div className="flex flex-wrap gap-2">
              {periods.map((period) => (
                <Button
                  key={period.value}
                  variant={selectedPeriod === period.value ? "primary" : "outline"}
                  onClick={() => setSelectedPeriod(period.value as any)}
                  size="sm"
                >
                  {period.label}
                </Button>
              ))}
            </div>
          </CardContent>
        </Card>

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
                    من {analytics.signals_won + analytics.signals_lost} إشارة مكتملة
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
                    أفضل رمز
                  </p>
                  <p className="text-2xl font-bold text-purple-600">
                    {analytics.best_performing_symbol}
                  </p>
                  <p className="text-xs text-purple-600 dark:text-purple-400 mt-1">
                    الأداء الأفضل
                  </p>
                </div>
                <Award className="h-10 w-10 text-purple-600" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-orange-50 to-orange-100 dark:from-orange-900/20 dark:to-orange-800/20 border-orange-200">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-orange-600 dark:text-orange-400">
                    عمر الحساب
                  </p>
                  <p className="text-3xl font-bold text-orange-600">
                    {analytics.account_age_days}
                  </p>
                  <p className="text-xs text-orange-600 dark:text-orange-400 mt-1">
                    يوم
                  </p>
                </div>
                <Calendar className="h-10 w-10 text-orange-600" />
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="h-5 w-5 text-green-600" />
                أداء الإشارات
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-3 gap-4">
                <div className="text-center p-4 bg-green-50 dark:bg-green-900/20 rounded-lg">
                  <p className="text-2xl font-bold text-green-600">{analytics.signals_won}</p>
                  <p className="text-sm text-green-600">إشارات رابحة</p>
                </div>
                <div className="text-center p-4 bg-red-50 dark:bg-red-900/20 rounded-lg">
                  <p className="text-2xl font-bold text-red-600">{analytics.signals_lost}</p>
                  <p className="text-sm text-red-600">إشارات خاسرة</p>
                </div>
                <div className="text-center p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                  <p className="text-2xl font-bold text-blue-600">{analytics.total_signals_received}</p>
                  <p className="text-sm text-blue-600">إجمالي الإشارات</p>
                </div>
              </div>

              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span>معدل النجاح</span>
                  <span className={getWinRateColor(analytics.win_rate)}>
                    {analytics.win_rate.toFixed(1)}%
                  </span>
                </div>
                <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-3">
                  <div
                    className={`h-3 rounded-full transition-all duration-500 ${
                      analytics.win_rate >= 60 ? 'bg-green-500' : 
                      analytics.win_rate >= 40 ? 'bg-yellow-500' : 'bg-red-500'
                    }`}
                    style={{ width: `${Math.min(analytics.win_rate, 100)}%` }}
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Activity className="h-5 w-5 text-blue-600" />
                نظرة عامة على الحساب
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between py-2 border-b border-gray-200 dark:border-gray-700">
                <span className="text-gray-600 dark:text-gray-400">نوع الاشتراك</span>
                <Badge variant="outline" className="bg-blue-50 text-blue-700 dark:bg-blue-900 dark:text-blue-300">
                  {analytics.subscription_tier}
                </Badge>
              </div>
              
              <div className="flex items-center justify-between py-2 border-b border-gray-200 dark:border-gray-700">
                <span className="text-gray-600 dark:text-gray-400">الإطار الزمني المفضل</span>
                <span className="font-medium">{analytics.most_active_timeframe}</span>
              </div>
              
              <div className="flex items-center justify-between py-2 border-b border-gray-200 dark:border-gray-700">
                <span className="text-gray-600 dark:text-gray-400">آخر نشاط</span>
                <span className="font-medium">
                  {new Date(analytics.last_activity_at).toLocaleDateString('ar-SA')}
                </span>
              </div>

              <div className="flex items-center justify-between py-2">
                <span className="text-gray-600 dark:text-gray-400">تاريخ التسجيل</span>
                <span className="font-medium">
                  {new Date(analytics.created_at).toLocaleDateString('ar-SA')}
                </span>
              </div>
            </CardContent>
          </Card>
        </div>

        {performance.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <PieChart className="h-5 w-5 text-purple-600" />
                الأداء حسب الرمز
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {performance.slice(0, 5).map((perf, index) => (
                  <div key={perf.id} className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 bg-blue-100 dark:bg-blue-900 rounded-full flex items-center justify-center">
                        <span className="text-sm font-bold text-blue-600">{index + 1}</span>
                      </div>
                      <div>
                        <p className="font-semibold">{perf.symbol}</p>
                        <p className="text-sm text-gray-600 dark:text-gray-400">
                          {perf.total_signals} إشارة
                        </p>
                      </div>
                    </div>
                    
                    <div className="text-right">
                      <p className={`font-bold ${getWinRateColor(perf.win_rate)}`}>
                        {perf.win_rate.toFixed(1)}%
                      </p>
                      <p className={`text-sm ${perf.total_pips >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                        {formatPips(perf.total_pips)} نقطة
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        <Card>
          <CardHeader>
            <CardTitle>إجراءات سريعة</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Button
                onClick={() => router.push('/signals')}
                variant="outline"
                className="h-20 flex-col"
              >
                <TrendingUp className="h-6 w-6 mb-2" />
                عرض الإشارات
              </Button>
              
              <Button
                onClick={() => router.push('/settings')}
                variant="outline"
                className="h-20 flex-col"
              >
                <Activity className="h-6 w-6 mb-2" />
                إعدادات التداول
              </Button>
              
              <Button
                onClick={() => exportAnalytics('csv')}
                loading={isExporting}
                variant="outline"
                className="h-20 flex-col"
              >
                <Download className="h-6 w-6 mb-2" />
                تصدير CSV
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </Layout>
  )
}

export default AnalyticsPage