import { useState } from 'react'
import { Layout } from '@/components/organisms/Layout'
import { useAuth } from '@/hooks/useAuth'
import { useIntegrations, useBinanceIntegration, useMetaTraderIntegration, useTelegramIntegration, useTradingViewIntegration } from '@/hooks/useIntegrations'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/atoms/Card'
import { Button } from '@/components/atoms/Button'
import { Input } from '@/components/atoms/Input'
import { Badge } from '@/components/ui/badge'
import { 
  Link as LinkIcon, 
  Unlink,
  Settings,
  RefreshCw,
  CheckCircle,
  AlertCircle,
  XCircle,
  ExternalLink,
  Zap,
  TrendingUp,
  MessageSquare,
  BarChart3
} from 'lucide-react'
import { useRouter } from 'next/router'
import { useEffect } from 'react'

const IntegrationsPage = () => {
  const { user, loading } = useAuth()
  const { platforms, userIntegrations, connect, disconnect, isConnecting, isDisconnecting } = useIntegrations()
  const { connectBinance, syncBinance, isConnecting: isConnectingBinance, isSyncing } = useBinanceIntegration()
  const { connectMetaTrader, sendSignal, isConnecting: isConnectingMT } = useMetaTraderIntegration()
  const { connectTelegram, isConnecting: isConnectingTelegram } = useTelegramIntegration()
  const { connectTradingView, isConnecting: isConnectingTV } = useTradingViewIntegration()
  const router = useRouter()

  const [connectionForms, setConnectionForms] = useState<Record<string, boolean>>({})
  const [formData, setFormData] = useState<Record<string, any>>({})

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

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'connected':
        return <CheckCircle className="h-5 w-5 text-green-600" />
      case 'error':
        return <XCircle className="h-5 w-5 text-red-600" />
      case 'pending':
        return <AlertCircle className="h-5 w-5 text-yellow-600" />
      default:
        return <XCircle className="h-5 w-5 text-gray-400" />
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'connected':
        return 'bg-green-50 text-green-700 border-green-200 dark:bg-green-900/20 dark:text-green-300'
      case 'error':
        return 'bg-red-50 text-red-700 border-red-200 dark:bg-red-900/20 dark:text-red-300'
      case 'pending':
        return 'bg-yellow-50 text-yellow-700 border-yellow-200 dark:bg-yellow-900/20 dark:text-yellow-300'
      default:
        return 'bg-gray-50 text-gray-700 border-gray-200 dark:bg-gray-900/20 dark:text-gray-300'
    }
  }

  const getPlatformIcon = (type: string) => {
    switch (type) {
      case 'broker':
        return <TrendingUp className="h-6 w-6" />
      case 'exchange':
        return <BarChart3 className="h-6 w-6" />
      case 'social':
        return <MessageSquare className="h-6 w-6" />
      case 'analytics':
        return <BarChart3 className="h-6 w-6" />
      default:
        return <LinkIcon className="h-6 w-6" />
    }
  }

  const isConnected = (platformName: string) => {
    return userIntegrations.some(
      integration => integration.platform_id === platformName && integration.status === 'connected'
    )
  }

  const getIntegration = (platformName: string) => {
    return userIntegrations.find(
      integration => integration.platform_id === platformName
    )
  }

  const handleConnectBinance = () => {
    const apiKey = formData.binance_api_key
    const secretKey = formData.binance_secret_key
    
    if (!apiKey || !secretKey) return
    
    connectBinance({ apiKey, secretKey })
    setConnectionForms({ ...connectionForms, binance: false })
    setFormData({ ...formData, binance_api_key: '', binance_secret_key: '' })
  }

  const handleConnectMetaTrader = () => {
    const serverUrl = formData.mt_server_url
    const login = formData.mt_login
    const password = formData.mt_password
    
    if (!serverUrl || !login || !password) return
    
    connectMetaTrader({ serverUrl, login, password })
    setConnectionForms({ ...connectionForms, metatrader: false })
    setFormData({ ...formData, mt_server_url: '', mt_login: '', mt_password: '' })
  }

  const handleConnectTelegram = () => {
    const botToken = formData.telegram_bot_token
    const chatId = formData.telegram_chat_id
    
    if (!botToken || !chatId) return
    
    connectTelegram({ botToken, chatId })
    setConnectionForms({ ...connectionForms, telegram: false })
    setFormData({ ...formData, telegram_bot_token: '', telegram_chat_id: '' })
  }

  const handleConnectTradingView = () => {
    const webhookUrl = formData.tv_webhook_url
    
    if (!webhookUrl) return
    
    connectTradingView(webhookUrl)
    setConnectionForms({ ...connectionForms, tradingview: false })
    setFormData({ ...formData, tv_webhook_url: '' })
  }

  const platformsData = [
    {
      name: 'binance',
      displayName: 'Binance',
      description: 'مزامنة بيانات التداول وإدارة المحفظة',
      type: 'exchange',
      features: ['مزامنة المحفظة', 'سجل التداول', 'إحصائيات الأداء'],
      isAvailable: true,
    },
    {
      name: 'metatrader',
      displayName: 'MetaTrader 4/5',
      description: 'إرسال الإشارات تلقائياً لحساب التداول',
      type: 'broker',
      features: ['تنفيذ تلقائي', 'إدارة المخاطر', 'تقارير التداول'],
      isAvailable: true,
    },
    {
      name: 'telegram',
      displayName: 'Telegram',
      description: 'استقبال الإشارات والتنبيهات فورياً',
      type: 'social',
      features: ['إشعارات فورية', 'إشارات مفصلة', 'تحديثات السوق'],
      isAvailable: true,
    },
    {
      name: 'tradingview',
      displayName: 'TradingView',
      description: 'نشر الإشارات والتحليلات على المنصة',
      type: 'analytics',
      features: ['نشر الإشارات', 'التحليل الفني', 'مشاركة الأفكار'],
      isAvailable: true,
    },
  ]

  return (
    <Layout>
      <div className="p-6 space-y-6">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white flex items-center gap-3">
              <LinkIcon className="h-8 w-8 text-blue-600" />
              التكامل مع المنصات الخارجية
            </h1>
            <p className="text-gray-600 dark:text-gray-400">
              ربط حسابك مع منصات التداول والتحليل الخارجية
            </p>
          </div>
          
          <div className="flex gap-3 mt-4 lg:mt-0">
            <Button variant="outline">
              <Settings className="h-4 w-4 mr-2" />
              إعدادات متقدمة
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                    المنصات المتصلة
                  </p>
                  <p className="text-2xl font-bold text-gray-900 dark:text-white">
                    {userIntegrations.filter(i => i.status === 'connected').length}
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
                    المنصات المتاحة
                  </p>
                  <p className="text-2xl font-bold text-gray-900 dark:text-white">
                    {platformsData.length}
                  </p>
                </div>
                <LinkIcon className="h-8 w-8 text-blue-600" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                    آخر مزامنة
                  </p>
                  <p className="text-lg font-bold text-gray-900 dark:text-white">
                    الآن
                  </p>
                </div>
                <RefreshCw className="h-8 w-8 text-purple-600" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                    حالة النظام
                  </p>
                  <p className="text-lg font-bold text-green-600">
                    نشط
                  </p>
                </div>
                <Zap className="h-8 w-8 text-yellow-600" />
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {platformsData.map((platform) => {
            const integration = getIntegration(platform.name)
            const connected = isConnected(platform.name)
            const showForm = connectionForms[platform.name]

            return (
              <Card key={platform.name} className={`${connected ? 'ring-2 ring-green-500/20' : ''}`}>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className={`p-2 rounded-lg ${connected ? 'bg-green-100 dark:bg-green-900/20' : 'bg-gray-100 dark:bg-gray-800'}`}>
                        {getPlatformIcon(platform.type)}
                      </div>
                      <div>
                        <CardTitle className="text-lg">{platform.displayName}</CardTitle>
                        <p className="text-sm text-gray-600 dark:text-gray-400">
                          {platform.description}
                        </p>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-2">
                      {connected && getStatusIcon(integration?.status || 'disconnected')}
                      <Badge className={getStatusColor(integration?.status || 'disconnected')}>
                        {connected ? 'متصل' : 'غير متصل'}
                      </Badge>
                    </div>
                  </div>
                </CardHeader>

                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <h4 className="font-medium text-sm">الميزات المتاحة:</h4>
                    <div className="flex flex-wrap gap-1">
                      {platform.features.map((feature, index) => (
                        <Badge key={index} variant="outline" className="text-xs">
                          {feature}
                        </Badge>
                      ))}
                    </div>
                  </div>

                  {connected && integration && (
                    <div className="bg-green-50 dark:bg-green-900/20 p-3 rounded-lg">
                      <div className="flex items-center justify-between text-sm">
                        <span>حساب متصل:</span>
                        <span className="font-medium">{integration.platform_account_id}</span>
                      </div>
                      {integration.last_sync_at && (
                        <div className="flex items-center justify-between text-sm mt-1">
                          <span>آخر مزامنة:</span>
                          <span>{new Date(integration.last_sync_at).toLocaleDateString('ar-SA')}</span>
                        </div>
                      )}
                    </div>
                  )}

                  {integration?.error_message && (
                    <div className="bg-red-50 dark:bg-red-900/20 p-3 rounded-lg">
                      <p className="text-sm text-red-600 dark:text-red-400">
                        خطأ: {integration.error_message}
                      </p>
                    </div>
                  )}

                  {/* Connection Forms */}
                  {showForm && (
                    <div className="border-t pt-4 space-y-3">
                      {platform.name === 'binance' && (
                        <>
                          <Input
                            placeholder="API Key"
                            value={formData.binance_api_key || ''}
                            onChange={(e) => setFormData({ ...formData, binance_api_key: e.target.value })}
                          />
                          <Input
                            type="password"
                            placeholder="Secret Key"
                            value={formData.binance_secret_key || ''}
                            onChange={(e) => setFormData({ ...formData, binance_secret_key: e.target.value })}
                          />
                        </>
                      )}

                      {platform.name === 'metatrader' && (
                        <>
                          <Input
                            placeholder="Server URL"
                            value={formData.mt_server_url || ''}
                            onChange={(e) => setFormData({ ...formData, mt_server_url: e.target.value })}
                          />
                          <Input
                            placeholder="Login"
                            value={formData.mt_login || ''}
                            onChange={(e) => setFormData({ ...formData, mt_login: e.target.value })}
                          />
                          <Input
                            type="password"
                            placeholder="Password"
                            value={formData.mt_password || ''}
                            onChange={(e) => setFormData({ ...formData, mt_password: e.target.value })}
                          />
                        </>
                      )}

                      {platform.name === 'telegram' && (
                        <>
                          <Input
                            placeholder="Bot Token"
                            value={formData.telegram_bot_token || ''}
                            onChange={(e) => setFormData({ ...formData, telegram_bot_token: e.target.value })}
                          />
                          <Input
                            placeholder="Chat ID"
                            value={formData.telegram_chat_id || ''}
                            onChange={(e) => setFormData({ ...formData, telegram_chat_id: e.target.value })}
                          />
                        </>
                      )}

                      {platform.name === 'tradingview' && (
                        <Input
                          placeholder="Webhook URL"
                          value={formData.tv_webhook_url || ''}
                          onChange={(e) => setFormData({ ...formData, tv_webhook_url: e.target.value })}
                        />
                      )}
                    </div>
                  )}

                  {/* Action Buttons */}
                  <div className="flex gap-2">
                    {!connected ? (
                      <>
                        {!showForm ? (
                          <Button
                            onClick={() => setConnectionForms({ ...connectionForms, [platform.name]: true })}
                            className="flex-1"
                          >
                            <LinkIcon className="h-4 w-4 mr-2" />
                            ربط الحساب
                          </Button>
                        ) : (
                          <>
                            <Button
                              onClick={() => {
                                if (platform.name === 'binance') handleConnectBinance()
                                else if (platform.name === 'metatrader') handleConnectMetaTrader()
                                else if (platform.name === 'telegram') handleConnectTelegram()
                                else if (platform.name === 'tradingview') handleConnectTradingView()
                              }}
                              loading={
                                isConnectingBinance || isConnectingMT || 
                                isConnectingTelegram || isConnectingTV
                              }
                              className="flex-1"
                            >
                              تأكيد الربط
                            </Button>
                            <Button
                              variant="outline"
                              onClick={() => setConnectionForms({ ...connectionForms, [platform.name]: false })}
                            >
                              إلغاء
                            </Button>
                          </>
                        )}
                      </>
                    ) : (
                      <>
                        {platform.name === 'binance' && (
                          <Button
                            onClick={() => syncBinance(integration!.id)}
                            loading={isSyncing}
                            variant="outline"
                            size="sm"
                          >
                            <RefreshCw className="h-4 w-4 mr-2" />
                            مزامنة
                          </Button>
                        )}
                        <Button
                          onClick={() => disconnect(integration!.id)}
                          loading={isDisconnecting}
                          variant="destructive"
                          size="sm"
                        >
                          <Unlink className="h-4 w-4 mr-2" />
                          قطع الاتصال
                        </Button>
                      </>
                    )}
                  </div>
                </CardContent>
              </Card>
            )
          })}
        </div>

        <Card>
          <CardHeader>
            <CardTitle>دليل التكامل</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h3 className="font-semibold mb-2">Binance</h3>
                <ul className="text-sm text-gray-600 dark:text-gray-400 space-y-1">
                  <li>• احصل على API Key من إعدادات Binance</li>
                  <li>• تأكد من تفعيل صلاحية القراءة فقط</li>
                  <li>• لا تشارك المفاتيح مع أي شخص</li>
                </ul>
              </div>
              
              <div>
                <h3 className="font-semibold mb-2">MetaTrader</h3>
                <ul className="text-sm text-gray-600 dark:text-gray-400 space-y-1">
                  <li>• احصل على بيانات الخادم من الوسيط</li>
                  <li>• استخدم حساب تجريبي للاختبار</li>
                  <li>• تأكد من تفعيل Expert Advisors</li>
                </ul>
              </div>
              
              <div>
                <h3 className="font-semibold mb-2">Telegram</h3>
                <ul className="text-sm text-gray-600 dark:text-gray-400 space-y-1">
                  <li>• أنشئ بوت جديد باستخدام @BotFather</li>
                  <li>• احصل على Chat ID من @userinfobot</li>
                  <li>• تأكد من بدء محادثة مع البوت</li>
                </ul>
              </div>
              
              <div>
                <h3 className="font-semibold mb-2">TradingView</h3>
                <ul className="text-sm text-gray-600 dark:text-gray-400 space-y-1">
                  <li>• إنشاء Webhook URL في إعدادات الحساب</li>
                  <li>• تأكد من الاشتراك المدفوع للميزات المتقدمة</li>
                  <li>• اختبر الاتصال قبل الاستخدام الفعلي</li>
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </Layout>
  )
}

export default IntegrationsPage