import { useState } from 'react'
import { Layout } from '@/components/organisms/Layout'
import { useAuth } from '@/hooks/useAuth'
import { useSubscriptionPlans, useUserSubscription } from '@/hooks/useSubscriptions'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/atoms/Card'
import { Button } from '@/components/atoms/Button'
import { Badge } from '@/components/ui/badge'
import { Check, Zap, Crown, Star, ArrowRight } from 'lucide-react'
import { useRouter } from 'next/router'
import type { SubscriptionPlan } from '@/services/subscriptions'

const PricingPage = () => {
  const { user } = useAuth()
  const { plans, isLoading } = useSubscriptionPlans()
  const { subscription, startTrial, isStartingTrial } = useUserSubscription()
  const [billingCycle, setBillingCycle] = useState<'monthly' | 'yearly'>('monthly')
  const router = useRouter()

  if (isLoading) {
    return (
      <Layout>
        <div className="flex items-center justify-center min-h-screen">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary"></div>
        </div>
      </Layout>
    )
  }

  const getPlanIcon = (planName: string) => {
    switch (planName.toLowerCase()) {
      case 'free':
        return <Zap className="h-6 w-6 text-gray-600" />
      case 'basic':
        return <Star className="h-6 w-6 text-blue-600" />
      case 'pro':
        return <Crown className="h-6 w-6 text-purple-600" />
      case 'enterprise':
        return <Crown className="h-6 w-6 text-gold-600" />
      default:
        return <Star className="h-6 w-6 text-blue-600" />
    }
  }

  const getPlanColor = (planName: string) => {
    switch (planName.toLowerCase()) {
      case 'free':
        return 'border-gray-200 hover:border-gray-300'
      case 'basic':
        return 'border-blue-200 hover:border-blue-300'
      case 'pro':
        return 'border-purple-200 hover:border-purple-300 ring-2 ring-purple-500'
      case 'enterprise':
        return 'border-gold-200 hover:border-gold-300'
      default:
        return 'border-gray-200 hover:border-gray-300'
    }
  }

  const getDisplayName = (plan: SubscriptionPlan) => {
    return plan.display_name?.ar || plan.display_name?.en || plan.name
  }

  const getCurrentPrice = (plan: SubscriptionPlan) => {
    if (billingCycle === 'yearly' && plan.interval === 'monthly') {
      return plan.price * 12 * 0.8 // 20% discount for yearly
    }
    return plan.price
  }

  const handleSelectPlan = async (plan: SubscriptionPlan) => {
    if (!user) {
      router.push('/auth/login')
      return
    }

    if (plan.name === 'free') {
      return // Already free
    }

    if (!subscription && plan.name !== 'free') {
      // Start trial for new users
      startTrial({ planId: plan.id, trialDays: 7 })
    } else {
      // Redirect to checkout
      router.push(`/checkout?plan=${plan.id}&cycle=${billingCycle}`)
    }
  }

  const filteredPlans = plans.filter(plan => 
    plan.interval === billingCycle || plan.interval === 'lifetime'
  )

  return (
    <Layout>
      <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white dark:from-gray-900 dark:to-gray-800">
        {/* Header */}
        <div className="container mx-auto px-4 py-16">
          <div className="text-center mb-12">
            <h1 className="text-4xl md:text-5xl font-bold text-gray-900 dark:text-white mb-4">
              اختر الخطة المناسبة لك
            </h1>
            <p className="text-xl text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
              احصل على إشارات تداول دقيقة ومدعومة بالذكاء الاصطناعي مع خطط مرنة تناسب احتياجاتك
            </p>
          </div>

          {/* Billing Toggle */}
          <div className="flex justify-center mb-12">
            <div className="bg-gray-100 dark:bg-gray-800 p-1 rounded-lg">
              <button
                onClick={() => setBillingCycle('monthly')}
                className={`px-6 py-2 rounded-md transition-all ${
                  billingCycle === 'monthly'
                    ? 'bg-white dark:bg-gray-700 shadow-sm text-gray-900 dark:text-white'
                    : 'text-gray-600 dark:text-gray-400'
                }`}
              >
                شهري
              </button>
              <button
                onClick={() => setBillingCycle('yearly')}
                className={`px-6 py-2 rounded-md transition-all relative ${
                  billingCycle === 'yearly'
                    ? 'bg-white dark:bg-gray-700 shadow-sm text-gray-900 dark:text-white'
                    : 'text-gray-600 dark:text-gray-400'
                }`}
              >
                سنوي
                <Badge className="absolute -top-2 -right-2 bg-green-500 text-white text-xs">
                  وفر 20%
                </Badge>
              </button>
            </div>
          </div>

          {/* Plans Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 max-w-7xl mx-auto">
            {filteredPlans.map((plan) => (
              <Card key={plan.id} className={`relative ${getPlanColor(plan.name)} transition-all duration-200`}>
                {plan.name === 'pro' && (
                  <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                    <Badge className="bg-purple-500 text-white px-3 py-1">
                      الأكثر شعبية
                    </Badge>
                  </div>
                )}

                <CardHeader className="text-center pb-4">
                  <div className="flex justify-center mb-4">
                    {getPlanIcon(plan.name)}
                  </div>
                  <CardTitle className="text-2xl font-bold">
                    {getDisplayName(plan)}
                  </CardTitle>
                  <div className="mt-4">
                    <span className="text-4xl font-bold text-gray-900 dark:text-white">
                      {plan.price === 0 ? 'مجاني' : `$${getCurrentPrice(plan)}`}
                    </span>
                    {plan.price > 0 && (
                      <span className="text-gray-600 dark:text-gray-400 text-sm">
                        /{billingCycle === 'monthly' ? 'شهر' : 'سنة'}
                      </span>
                    )}
                  </div>
                  {plan.description && (
                    <p className="text-gray-600 dark:text-gray-400 text-sm mt-2">
                      {plan.description}
                    </p>
                  )}
                </CardHeader>

                <CardContent className="space-y-6">
                  {/* Features */}
                  <div className="space-y-3">
                    <div className="flex items-center">
                      <Check className="h-4 w-4 text-green-500 mr-3" />
                      <span className="text-sm">
                        {plan.signal_limit === -1 
                          ? 'إشارات غير محدودة' 
                          : `${plan.signal_limit} إشارة شهرياً`}
                      </span>
                    </div>
                    
                    {plan.features?.support && (
                      <div className="flex items-center">
                        <Check className="h-4 w-4 text-green-500 mr-3" />
                        <span className="text-sm">
                          دعم {plan.features.support === 'basic' ? 'أساسي' : 
                               plan.features.support === 'priority' ? 'أولوية' : 'مخصص'}
                        </span>
                      </div>
                    )}

                    {plan.features?.history && (
                      <div className="flex items-center">
                        <Check className="h-4 w-4 text-green-500 mr-3" />
                        <span className="text-sm">
                          سجل {plan.features.history === 'unlimited' ? 'غير محدود' : plan.features.history}
                        </span>
                      </div>
                    )}

                    {plan.features?.ai_analysis && (
                      <div className="flex items-center">
                        <Check className="h-4 w-4 text-green-500 mr-3" />
                        <span className="text-sm">تحليل ذكي متقدم</span>
                      </div>
                    )}

                    {plan.features?.custom_signals && (
                      <div className="flex items-center">
                        <Check className="h-4 w-4 text-green-500 mr-3" />
                        <span className="text-sm">إشارات مخصصة</span>
                      </div>
                    )}
                  </div>

                  {/* CTA Button */}
                  <Button
                    onClick={() => handleSelectPlan(plan)}
                    loading={isStartingTrial && plan.name !== 'free'}
                    disabled={subscription?.plan_id === plan.id}
                    className={`w-full ${
                      plan.name === 'pro' 
                        ? 'bg-purple-600 hover:bg-purple-700' 
                        : plan.name === 'enterprise'
                        ? 'bg-gradient-to-r from-yellow-600 to-orange-600 hover:from-yellow-700 hover:to-orange-700'
                        : ''
                    }`}
                    variant={plan.name === 'free' ? 'outline' : 'primary'}
                  >
                    {subscription?.plan_id === plan.id ? (
                      'الخطة الحالية'
                    ) : plan.name === 'free' ? (
                      'البدء مجاناً'
                    ) : !subscription ? (
                      'تجربة مجانية 7 أيام'
                    ) : (
                      <>
                        ترقية الآن
                        <ArrowRight className="h-4 w-4 mr-2" />
                      </>
                    )}
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* FAQ Section */}
          <div className="mt-24 max-w-4xl mx-auto">
            <h2 className="text-3xl font-bold text-center text-gray-900 dark:text-white mb-12">
              الأسئلة الشائعة
            </h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div>
                <h3 className="font-semibold text-lg mb-2">هل يمكنني إلغاء الاشتراك في أي وقت؟</h3>
                <p className="text-gray-600 dark:text-gray-400">
                  نعم، يمكنك إلغاء اشتراكك في أي وقت من خلال إعدادات الحساب. سيستمر وصولك حتى نهاية دورة الفوترة الحالية.
                </p>
              </div>
              
              <div>
                <h3 className="font-semibold text-lg mb-2">ما مدى دقة الإشارات؟</h3>
                <p className="text-gray-600 dark:text-gray-400">
                  إشاراتنا مدعومة بالذكاء الاصطناعي المتقدم مع معدل نجاح يتراوح بين 75-85% حسب ظروف السوق.
                </p>
              </div>
              
              <div>
                <h3 className="font-semibold text-lg mb-2">هل هناك تكاليف خفية؟</h3>
                <p className="text-gray-600 dark:text-gray-400">
                  لا، جميع الأسعار شاملة ولا توجد رسوم إضافية. ما تراه هو ما تدفعه.
                </p>
              </div>
              
              <div>
                <h3 className="font-semibold text-lg mb-2">كيف يعمل الدعم الفني؟</h3>
                <p className="text-gray-600 dark:text-gray-400">
                  نقدم دعماً عبر البريد الإلكتروني والدردشة المباشرة. خطط Pro و Enterprise تحصل على دعم أولوية.
                </p>
              </div>
            </div>
          </div>

          {/* Enterprise CTA */}
          <div className="mt-16 text-center">
            <div className="bg-gradient-to-r from-gray-900 to-gray-800 dark:from-gray-800 dark:to-gray-700 rounded-2xl p-8">
              <h3 className="text-2xl font-bold text-white mb-4">
                تحتاج حلول مؤسسية؟
              </h3>
              <p className="text-gray-300 mb-6">
                احصل على خطة مخصصة تناسب احتياجات مؤسستك مع ميزات متقدمة ودعم مخصص
              </p>
              <Button 
                onClick={() => router.push('/contact')}
                className="bg-white text-gray-900 hover:bg-gray-100"
              >
                تواصل معنا
              </Button>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  )
}

export default PricingPage