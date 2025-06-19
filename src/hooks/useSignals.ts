import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { signalsService } from '@/services/signals'
import type { Signal } from '@/types'
import { useToast } from './useToast'

export const useSignals = (page = 1, limit = 10) => {
  const queryClient = useQueryClient()
  const { toast } = useToast()

  // Get signals with pagination
  const {
    data: signalsData,
    isLoading,
    error
  } = useQuery({
    queryKey: ['signals', page, limit],
    queryFn: () => signalsService.getSignals(page, limit),
  })

  // Get active signals
  const { data: activeSignals } = useQuery({
    queryKey: ['signals', 'active'],
    queryFn: signalsService.getActiveSignals,
    refetchInterval: 30000, // Refetch every 30 seconds
  })

  // Get signal statistics
  const { data: signalStats } = useQuery({
    queryKey: ['signals', 'stats'],
    queryFn: signalsService.getSignalStats,
    refetchInterval: 60000, // Refetch every minute
  })

  // Generate AI signal mutation
  const generateSignalMutation = useMutation({
    mutationFn: ({ symbol, analysis }: { symbol: string; analysis: any }) =>
      signalsService.generateAISignal(symbol, analysis),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['signals'] })
      toast({
        title: 'تم توليد إشارة جديدة',
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

  // Update signal status mutation
  const updateSignalMutation = useMutation({
    mutationFn: ({ id, status }: { id: string; status: Signal['status'] }) =>
      signalsService.updateSignalStatus(id, status),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['signals'] })
      toast({
        title: 'تم تحديث حالة الإشارة',
        variant: 'success',
      })
    },
    onError: (error: any) => {
      toast({
        title: 'خطأ في تحديث الإشارة',
        description: error.message,
        variant: 'destructive',
      })
    },
  })

  return {
    signals: signalsData?.data || [],
    totalSignals: signalsData?.total || 0,
    totalPages: signalsData?.totalPages || 0,
    currentPage: page,
    activeSignals: activeSignals || [],
    signalStats,
    isLoading,
    error,
    generateSignal: generateSignalMutation.mutate,
    updateSignal: updateSignalMutation.mutate,
    isGenerating: generateSignalMutation.isPending,
    isUpdating: updateSignalMutation.isPending,
  }
}