import { Layout } from '@/components/organisms/Layout'
import { useAuth } from '@/hooks/useAuth'
import { useSignals } from '@/hooks/useSignals'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/atoms/Card'
import { Button } from '@/components/atoms/Button'
import { TrendingUp, TrendingDown, Activity, Users, Bell, Settings } from 'lucide-react'
import { useRouter } from 'next/router'
import { useEffect } from 'react'

const DashboardPage = () => {
  const { user, loading } = useAuth()
  const { activeSignals, signalStats, generateSignal, isGenerating } = useSignals()
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

  const handleGenerateSignal = () => {
    generateSignal({
      symbol: 'EUR/USD',
      analysis: {
        technicalIndicators: ['RSI', 'MACD', 'Bollinger Bands'],
        marketSentiment: 'bullish',
        confidence: 85,
      },
    })
  }

  return (
    <Layout>
      <div className="p-6 space-y-6">
        <div className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg p-6 text-white">
          <h1 className="text-3xl font-bold mb-2">
            مرحباً {user.full_name || user.email}
          </h1>
          <p className="text-blue-100">
            مرحباً بك في لوحة التحكم الخاصة بك. تابع إشاراتك وإحصائياتك هنا.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                    إجمالي الإشارات
                  </p>
                  <p className="text-2xl font-bold text-gray-900 dark:text-white">
                    {signalStats?.total || 0}
                  </p>
                </div>
                <Activity className="h-8 w-8 text-blue-600" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                    الإشارات النشطة
                  </p>
                  <p className="text-2xl font-bold text-gray-900 dark:text-white">
                    {signalStats?.active || 0}
                  </p>
                </div>
                <TrendingUp className="h-8 w-8 text-green-600" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                    معدل النجاح
                  </p>
                  <p className="text-2xl font-bold text-gray-900 dark:text-white">
                    {signalStats?.accuracy?.toFixed(1) || 0}%
                  </p>
                </div>
                <TrendingDown className="h-8 w-8 text-purple-600" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                    الإشارات الفائزة
                  </p>
                  <p className="text-2xl font-bold text-gray-900 dark:text-white">
                    {signalStats?.won || 0}
                  </p>
                </div>
                <Users className="h-8 w-8 text-orange-600" />
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="flex flex-wrap gap-4">
          <Button
            onClick={handleGenerateSignal}
            loading={isGenerating}
            className="bg-green-600 hover:bg-green-700"
          >
            توليد إشارة جديدة
          </Button>
          <Button variant="outline">
            <Bell className="h-4 w-4 mr-2" />
            الإشعارات
          </Button>
          <Button variant="outline">
            <Settings className="h-4 w-4 mr-2" />
            الإعدادات
          </Button>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>الإشارات النشطة</CardTitle>
          </CardHeader>
          <CardContent>
            {activeSignals && activeSignals.length > 0 ? (
              <div className="space-y-4">
                {activeSignals.map((signal) => (
                  <div
                    key={signal.id}
                    className="border border-gray-200 dark:border-gray-700 rounded-lg p-4"
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <h3 className="font-semibold text-lg">{signal.symbol}</h3>
                        <p className="text-gray-600 dark:text-gray-400">
                          {signal.signal_type === 'call' ? 'شراء' : 'بيع'} - ثقة: {signal.confidence_score}%
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="font-medium">
                          سعر الدخول: {signal.entry_price}
                        </p>
                        <p className="text-sm text-gray-600 dark:text-gray-400">
                          الهدف: {signal.target_price}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8">
                <Activity className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-600 dark:text-gray-400">
                  لا توجد إشارات نشطة حالياً
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </Layout>
  )
}

export default DashboardPage