import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { aiService, type AIRecommendation, type MarketSentiment, type RiskAssessment } from '@/services/ai'
import { useAuth } from './useAuth'
import { useToast } from './useToast'
import { supabase } from '@/lib/supabase'

export const useAIRecommendations = () => {
  const { user } = useAuth()
  const queryClient = useQueryClient()
  const { toast } = useToast()

  // Get user recommendations
  const {
    data: recommendations,
    isLoading
  } = useQuery({
    queryKey: ['ai', 'recommendations', user?.id],
    queryFn: () => user ? aiService.getUserRecommendations(user.id) : Promise.resolve([]),
    enabled: !!user,
    refetchInterval: 5 * 60 * 1000, // Refetch every 5 minutes
  })

  // Generate new recommendations
  const generateRecommendationsMutation = useMutation({
    mutationFn: () => aiService.generateRecommendations(user!.id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['ai', 'recommendations', user?.id] })
      toast({
        title: 'تم تحديث التوصيات',
        description: 'تم إنشاء توصيات جديدة بناءً على تحليل محفظتك',
        variant: 'success',
      })
    },
    onError: (error: any) => {
      toast({
        title: 'خطأ في توليد التوصيات',
        description: error.message,
        variant: 'destructive',
      })
    },
  })

  // Apply recommendation
  const applyRecommendationMutation = useMutation({
    mutationFn: (recommendationId: string) => aiService.applyRecommendation(recommendationId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['ai', 'recommendations', user?.id] })
      toast({
        title: 'تم تطبيق التوصية',
        description: 'تم تطبيق التوصية بنجاح',
        variant: 'success',
      })
    },
    onError: (error: any) => {
      toast({
        title: 'خطأ في تطبيق التوصية',
        description: error.message,
        variant: 'destructive',
      })
    },
  })

  // Dismiss recommendation
  const dismissRecommendationMutation = useMutation({
    mutationFn: (recommendationId: string) => aiService.dismissRecommendation(recommendationId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['ai', 'recommendations', user?.id] })
      toast({
        title: 'تم تجاهل التوصية',
        variant: 'success',
      })
    },
    onError: (error: any) => {
      toast({
        title: 'خطأ في تجاهل التوصية',
        description: error.message,
        variant: 'destructive',
      })
    },
  })

  return {
    recommendations: recommendations || [],
    isLoading,
    generateRecommendations: generateRecommendationsMutation.mutate,
    applyRecommendation: applyRecommendationMutation.mutate,
    dismissRecommendation: dismissRecommendationMutation.mutate,
    isGenerating: generateRecommendationsMutation.isPending,
    isApplying: applyRecommendationMutation.isPending,
    isDismissing: dismissRecommendationMutation.isPending,
  }
}

export const useMarketSentiment = (symbol: string) => {
  // Get market sentiment
  const {
    data: sentiment,
    isLoading
  } = useQuery({
    queryKey: ['ai', 'sentiment', symbol],
    queryFn: () => aiService.getMarketSentiment(symbol),
    refetchInterval: 2 * 60 * 1000, // Refetch every 2 minutes
  })

  // Update sentiment
  const updateSentimentMutation = useMutation({
    mutationFn: () => aiService.updateMarketSentiment(symbol),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['ai', 'sentiment', symbol] })
    },
  })

  const queryClient = useQueryClient()

  return {
    sentiment,
    isLoading,
    updateSentiment: updateSentimentMutation.mutate,
    isUpdating: updateSentimentMutation.isPending,
  }
}

export const useRiskAssessment = () => {
  const { user } = useAuth()
  const queryClient = useQueryClient()
  const { toast } = useToast()

  // Get latest risk assessment
  const {
    data: riskAssessment,
    isLoading
  } = useQuery({
    queryKey: ['ai', 'risk', user?.id],
    queryFn: async () => {
      if (!user) return null
      
      // Get latest assessment from database
      const { data, error } = await supabase
        .from('risk_assessments')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .limit(1)
        .single()

      if (error && error.code !== 'PGRST116') throw error
      return data
    },
    enabled: !!user,
  })

  // Generate new risk assessment
  const assessRiskMutation = useMutation({
    mutationFn: () => aiService.assessUserRisk(user!.id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['ai', 'risk', user?.id] })
      toast({
        title: 'تم تحديث تقييم المخاطر',
        description: 'تم إنشاء تقييم جديد لمستوى المخاطر في محفظتك',
        variant: 'success',
      })
    },
    onError: (error: any) => {
      toast({
        title: 'خطأ في تقييم المخاطر',
        description: error.message,
        variant: 'destructive',
      })
    },
  })

  return {
    riskAssessment,
    isLoading,
    assessRisk: assessRiskMutation.mutate,
    isAssessing: assessRiskMutation.isPending,
  }
}

export const useAISignalGeneration = () => {
  const queryClient = useQueryClient()
  const { toast } = useToast()

  // Generate AI signal
  const generateSignalMutation = useMutation({
    mutationFn: ({ symbol, timeframe }: { symbol: string; timeframe?: string }) =>
      aiService.generateSignal(symbol, timeframe),
    onSuccess: (signal) => {
      queryClient.invalidateQueries({ queryKey: ['signals'] })
      toast({
        title: 'تم توليد إشارة جديدة',
        description: `إشارة ${signal.signal_type} لـ ${signal.symbol} بثقة ${signal.confidence_score}%`,
        variant: 'success',
      })
    },
    onError: (error: any) => {
      toast({
        title: 'خطأ في توليد الإشارة',
        description: error.message,
        variant: 'destructive',
      })
    },
  })

  // Get AI models
  const {
    data: aiModels,
    isLoading: modelsLoading
  } = useQuery({
    queryKey: ['ai', 'models'],
    queryFn: aiService.getAIModels,
  })

  return {
    aiModels: aiModels || [],
    modelsLoading,
    generateSignal: generateSignalMutation.mutate,
    isGenerating: generateSignalMutation.isPending,
  }
}