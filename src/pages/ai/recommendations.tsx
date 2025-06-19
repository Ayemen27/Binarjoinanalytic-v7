import { useState } from 'react'
import { Layout } from '@/components/organisms/Layout'
import { useAuth } from '@/hooks/useAuth'
import { useAIRecommendations, useRiskAssessment } from '@/hooks/useAI'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/atoms/Card'
import { Button } from '@/components/atoms/Button'
import { Badge } from '@/components/ui/badge'
import { 
  Brain, 
  TrendingUp, 
  Shield, 
  Target,
  AlertTriangle,
  CheckCircle,
  X,
  RefreshCw,
  Lightbulb,
  BarChart3,
  Settings
} from 'lucide-react'
import { useRouter } from 'next/router'
import { useEffect } from 'react'

const AIRecommendationsPage = () => {
  const { user, loading } = useAuth()
  const { 
    recommendations, 
    isLoading, 
    generateRecommendations, 
    applyRecommendation, 
    dismissRecommendation,
    isGenerating,
    isApplying,
    isDismissing
  } = useAIRecommendations()
  const { riskAssessment, assessRisk, isAssessing } = useRiskAssessment()
  const [selectedType, setSelectedType] = useState<string>('all')
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

  return (
    <Layout>
      <div className="p-6 space-y-6">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white flex items-center gap-3">
              <Brain className="h-8 w-8 text-purple-600" />
              توصيات الذكاء الاصطناعي
            </h1>
            <p className="text-gray-600 dark:text-gray-400">
              توصيات مخصصة ومدعومة بالذكاء الاصطناعي لتحسين أدائك التداولي
            </p>
          </div>
          
          <div className="flex flex-col sm:flex-row gap-3 mt-4 lg:mt-0">
            <Button
              onClick={() => assessRisk()}
              loading={isAssessing}
              variant="outline"
            >
              <Shield className="h-4 w-4 mr-2" />
              تقييم المخاطر
            </Button>
            <Button
              onClick={() => generateRecommendations()}
              loading={isGenerating}
              className="bg-purple-600 hover:bg-purple-700"
            >
              <RefreshCw className="h-4 w-4 mr-2" />
              إنشاء توصيات جديدة
            </Button>
          </div>
        </div>

        <Card>
          <CardContent className="p-12 text-center">
            <Brain className="h-16 w-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
              نظام الذكاء الاصطناعي قيد التطوير
            </h3>
            <p className="text-gray-600 dark:text-gray-400 mb-6">
              سيتم إطلاق نظام التوصيات الذكية قريباً مع تحليلات متقدمة
            </p>
            <Button
              onClick={() => router.push('/signals')}
              className="bg-purple-600 hover:bg-purple-700"
            >
              عرض الإشارات الحالية
            </Button>
          </CardContent>
        </Card>
      </div>
    </Layout>
  )
}

export default AIRecommendationsPage