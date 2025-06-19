import { useState } from 'react'
import { Layout } from '@/components/organisms/Layout'
import { useAuth } from '@/hooks/useAuth'
import { useSignals } from '@/hooks/useSignals'
import { SignalCard } from '@/components/molecules/SignalCard'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/atoms/Card'
import { Button } from '@/components/atoms/Button'
import { Input } from '@/components/atoms/Input'
import { Search, Filter, Plus, TrendingUp } from 'lucide-react'
import { useRouter } from 'next/router'
import { useEffect } from 'react'

const SignalsPage = () => {
  const { user, loading } = useAuth()
  const [currentPage, setCurrentPage] = useState(1)
  const [searchTerm, setSearchTerm] = useState('')
  const { signals, totalPages, generateSignal, updateSignal, isGenerating } = useSignals(currentPage, 12)
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
    const symbols = ['EUR/USD', 'GBP/USD', 'USD/JPY', 'AUD/USD', 'USD/CAD']
    const randomSymbol = symbols[Math.floor(Math.random() * symbols.length)]
    
    generateSignal({
      symbol: randomSymbol,
      analysis: {
        technicalIndicators: ['RSI', 'MACD', 'Bollinger Bands'],
        marketSentiment: Math.random() > 0.5 ? 'bullish' : 'bearish',
        confidence: Math.floor(Math.random() * 40) + 60,
      },
    })
  }

  const filteredSignals = signals.filter(signal =>
    signal.symbol.toLowerCase().includes(searchTerm.toLowerCase())
  )

  return (
    <Layout>
      <div className="p-6 space-y-6">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
              إشارات التداول
            </h1>
            <p className="text-gray-600 dark:text-gray-400">
              إدارة ومراقبة جميع إشارات التداول الخاصة بك
            </p>
          </div>
          
          <div className="flex flex-col sm:flex-row gap-3 mt-4 lg:mt-0">
            <Button
              onClick={handleGenerateSignal}
              loading={isGenerating}
              className="bg-green-600 hover:bg-green-700"
            >
              <Plus className="h-4 w-4 mr-2" />
              توليد إشارة جديدة
            </Button>
          </div>
        </div>

        <Card>
          <CardContent className="p-4">
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="flex-1">
                <Input
                  placeholder="البحث عن رمز العملة..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  leftIcon={<Search className="h-4 w-4" />}
                />
              </div>
              <Button variant="outline">
                <Filter className="h-4 w-4 mr-2" />
                فلاتر متقدمة
              </Button>
            </div>
          </CardContent>
        </Card>

        {filteredSignals.length > 0 ? (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredSignals.map((signal) => (
                <SignalCard
                  key={signal.id}
                  signal={signal}
                  onUpdate={(id, status) => updateSignal({ id, status })}
                  showActions={true}
                />
              ))}
            </div>

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
          <Card>
            <CardContent className="p-12 text-center">
              <TrendingUp className="h-16 w-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                لا توجد إشارات
              </h3>
              <p className="text-gray-600 dark:text-gray-400 mb-6">
                {searchTerm ? 'لم يتم العثور على إشارات تطابق البحث' : 'ابدأ بتوليد إشارتك الأولى'}
              </p>
              <Button
                onClick={handleGenerateSignal}
                loading={isGenerating}
                className="bg-blue-600 hover:bg-blue-700"
              >
                <Plus className="h-4 w-4 mr-2" />
                توليد إشارة جديدة
              </Button>
            </CardContent>
          </Card>
        )}
      </div>
    </Layout>
  )
}

export default SignalsPage