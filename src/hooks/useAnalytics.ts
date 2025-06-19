import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { analyticsService, type UserAnalytics, type TradingPerformance } from '@/services/analytics'
import { useAuth } from './useAuth'
import { useToast } from './useToast'

export const useUserAnalytics = () => {
  const { user } = useAuth()
  const queryClient = useQueryClient()

  // Get user analytics
  const {
    data: analytics,
    isLoading
  } = useQuery({
    queryKey: ['analytics', 'user', user?.id],
    queryFn: () => user ? analyticsService.getUserAnalytics(user.id) : Promise.resolve(null),
    enabled: !!user,
  })

  // Calculate analytics mutation
  const calculateAnalyticsMutation = useMutation({
    mutationFn: () => analyticsService.calculateUserAnalytics(user!.id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['analytics', 'user', user?.id] })
    },
  })

  return {
    analytics: analytics || {
      user_id: user?.id || '',
      total_signals_received: 0,
      signals_won: 0,
      signals_lost: 0,
      win_rate: 0,
      total_profit_pips: 0,
      best_performing_symbol: 'N/A',
      most_active_timeframe: '1H',
      account_age_days: 0,
      subscription_tier: 'basic',
      last_activity_at: new Date().toISOString(),
      preferences: {},
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    },
    isLoading,
    calculateAnalytics: calculateAnalyticsMutation.mutate,
    isCalculating: calculateAnalyticsMutation.isPending,
  }
}

export const useTradingPerformance = (symbol?: string, days = 30) => {
  const { user } = useAuth()

  // Get trading performance
  const {
    data: performance,
    isLoading
  } = useQuery({
    queryKey: ['analytics', 'performance', user?.id, symbol, days],
    queryFn: () => user ? analyticsService.getTradingPerformance(user.id, symbol, undefined, days) : Promise.resolve([]),
    enabled: !!user,
  })

  // Calculate performance mutation
  const calculatePerformanceMutation = useMutation({
    mutationFn: ({ symbol, days }: { symbol: string; days?: number }) =>
      analyticsService.calculateTradingPerformance(user!.id, symbol, days),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['analytics', 'performance', user?.id] })
    },
  })

  const queryClient = useQueryClient()

  return {
    performance: performance || [],
    isLoading,
    calculatePerformance: calculatePerformanceMutation.mutate,
    isCalculating: calculatePerformanceMutation.isPending,
  }
}

export const useDashboardAnalytics = () => {
  const { user } = useAuth()

  // Get dashboard analytics
  const {
    data: dashboardData,
    isLoading
  } = useQuery({
    queryKey: ['analytics', 'dashboard'],
    queryFn: () => analyticsService.getDashboardAnalytics(),
    refetchInterval: 5 * 60 * 1000, // Refetch every 5 minutes
  })

  return {
    dashboardData: dashboardData || {
      userStats: {
        totalUsers: 0,
        activeUsers: 0,
        newUsersToday: 0,
        churnRate: 0,
      },
      signalStats: {
        totalSignals: 0,
        signalsToday: 0,
        avgWinRate: 0,
        topPerformingSymbol: 'N/A',
      },
      revenueStats: {
        totalRevenue: 0,
        monthlyRevenue: 0,
        avgRevenuePerUser: 0,
        subscriptionGrowth: 0,
      },
      systemStats: {
        systemUptime: 0,
        avgResponseTime: 0,
        errorRate: 0,
        activeConnections: 0,
      },
    },
    isLoading,
  }
}

export const useRealtimeAnalytics = () => {
  // Get real-time metrics
  const {
    data: realtimeMetrics,
    isLoading
  } = useQuery({
    queryKey: ['analytics', 'realtime'],
    queryFn: analyticsService.getRealtimeMetrics,
    refetchInterval: 10000, // Refetch every 10 seconds
  })

  return {
    realtimeMetrics: realtimeMetrics || {
      activeUsers: 0,
      signalsGenerated: 0,
      systemLoad: 0,
      errorCount: 0,
    },
    isLoading,
  }
}

export const useUserBehavior = (days = 30, actionType?: string) => {
  const { user } = useAuth()

  // Get user behavior
  const {
    data: behavior,
    isLoading
  } = useQuery({
    queryKey: ['analytics', 'behavior', user?.id, days, actionType],
    queryFn: () => user ? analyticsService.getUserBehavior(user.id, days, actionType) : Promise.resolve([]),
    enabled: !!user,
  })

  // Track action mutation
  const trackActionMutation = useMutation({
    mutationFn: ({ actionType, actionData, pageUrl, sessionId }: {
      actionType: string
      actionData?: Record<string, any>
      pageUrl?: string
      sessionId?: string
    }) => analyticsService.trackUserAction(
      user!.id,
      actionType,
      actionData,
      pageUrl,
      sessionId
    ),
  })

  return {
    behavior: behavior || [],
    isLoading,
    trackAction: trackActionMutation.mutate,
    isTracking: trackActionMutation.isPending,
  }
}

export const useAnalyticsExport = () => {
  const { user } = useAuth()
  const { toast } = useToast()

  // Export analytics mutation
  const exportAnalyticsMutation = useMutation({
    mutationFn: (format: 'json' | 'csv' = 'json') =>
      analyticsService.exportUserAnalytics(user!.id, format),
    onSuccess: (data) => {
      // Create download link
      const blob = new Blob([data], { type: 'application/json' })
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `analytics-${user!.id}-${new Date().toISOString().split('T')[0]}.json`
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)
      URL.revokeObjectURL(url)

      toast({
        title: 'تم تصدير البيانات بنجاح',
        description: 'تم تحميل ملف التحليلات',
        variant: 'success',
      })
    },
    onError: (error: any) => {
      toast({
        title: 'خطأ في تصدير البيانات',
        description: error.message,
        variant: 'destructive',
      })
    },
  })

  return {
    exportAnalytics: exportAnalyticsMutation.mutate,
    isExporting: exportAnalyticsMutation.isPending,
  }
}