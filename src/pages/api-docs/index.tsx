import { useState } from 'react'
import { Layout } from '@/components/organisms/Layout'
import { useAuth } from '@/hooks/useAuth'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/atoms/Card'
import { Button } from '@/components/atoms/Button'
import { Badge } from '@/components/ui/badge'
import { 
  Code, 
  Key,
  BookOpen,
  Globe
} from 'lucide-react'
import { useRouter } from 'next/router'
import { useEffect } from 'react'

const APIDocsPage = () => {
  const { user, loading } = useAuth()
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
              <Code className="h-8 w-8 text-blue-600" />
              API للمطورين
            </h1>
            <p className="text-gray-600 dark:text-gray-400">
              اربط تطبيقاتك مع منصة الإشارات باستخدام واجهة برمجة التطبيقات
            </p>
          </div>
        </div>

        <Card>
          <CardContent className="p-12 text-center">
            <Code className="h-16 w-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
              API للمطورين قيد التطوير
            </h3>
            <p className="text-gray-600 dark:text-gray-400 mb-6">
              سيتم إطلاق واجهة برمجة التطبيقات للمطورين قريباً مع توثيق شامل
            </p>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 max-w-2xl mx-auto">
              <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                <Key className="h-6 w-6 text-blue-600 mx-auto mb-2" />
                <h4 className="font-medium text-blue-800 dark:text-blue-300">مفاتيح API</h4>
                <p className="text-sm text-blue-600 dark:text-blue-400">إدارة آمنة للمفاتيح</p>
              </div>
              <div className="p-4 bg-green-50 dark:bg-green-900/20 rounded-lg">
                <BookOpen className="h-6 w-6 text-green-600 mx-auto mb-2" />
                <h4 className="font-medium text-green-800 dark:text-green-300">التوثيق</h4>
                <p className="text-sm text-green-600 dark:text-green-400">دليل شامل للمطورين</p>
              </div>
              <div className="p-4 bg-purple-50 dark:bg-purple-900/20 rounded-lg">
                <Globe className="h-6 w-6 text-purple-600 mx-auto mb-2" />
                <h4 className="font-medium text-purple-800 dark:text-purple-300">Webhooks</h4>
                <p className="text-sm text-purple-600 dark:text-purple-400">تكامل في الوقت الفعلي</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </Layout>
  )
}

export default APIDocsPage