import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { integrationsService, type ExternalPlatform, type UserIntegration } from '@/services/integrations'
import { useAuth } from './useAuth'
import { useToast } from './useToast'

export const useIntegrations = () => {
  const { user } = useAuth()
  const queryClient = useQueryClient()
  const { toast } = useToast()

  // Get available platforms
  const {
    data: platforms,
    isLoading: platformsLoading
  } = useQuery({
    queryKey: ['integrations', 'platforms'],
    queryFn: integrationsService.getPlatforms,
  })

  // Get user integrations
  const {
    data: userIntegrations,
    isLoading: integrationsLoading
  } = useQuery({
    queryKey: ['integrations', 'user', user?.id],
    queryFn: () => user ? integrationsService.getUserIntegrations(user.id) : Promise.resolve([]),
    enabled: !!user,
  })

  // Connect integration mutation
  const connectMutation = useMutation({
    mutationFn: (integration: Omit<UserIntegration, 'id' | 'created_at' | 'updated_at'>) =>
      integrationsService.createIntegration(integration),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['integrations', 'user', user?.id] })
      toast({
        title: 'تم ربط المنصة بنجاح',
        description: 'يمكنك الآن استخدام المنصة المتصلة',
        variant: 'success',
      })
    },
    onError: (error: any) => {
      toast({
        title: 'خطأ في ربط المنصة',
        description: error.message,
        variant: 'destructive',
      })
    },
  })

  // Disconnect integration mutation
  const disconnectMutation = useMutation({
    mutationFn: (integrationId: string) => integrationsService.deleteIntegration(integrationId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['integrations', 'user', user?.id] })
      toast({
        title: 'تم قطع الاتصال',
        description: 'تم قطع الاتصال مع المنصة بنجاح',
        variant: 'success',
      })
    },
    onError: (error: any) => {
      toast({
        title: 'خطأ في قطع الاتصال',
        description: error.message,
        variant: 'destructive',
      })
    },
  })

  // Update integration mutation
  const updateMutation = useMutation({
    mutationFn: ({ id, updates }: { id: string; updates: Partial<UserIntegration> }) =>
      integrationsService.updateIntegration(id, updates),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['integrations', 'user', user?.id] })
      toast({
        title: 'تم تحديث الإعدادات',
        variant: 'success',
      })
    },
    onError: (error: any) => {
      toast({
        title: 'خطأ في التحديث',
        description: error.message,
        variant: 'destructive',
      })
    },
  })

  return {
    platforms: platforms || [],
    userIntegrations: userIntegrations || [],
    isLoading: platformsLoading || integrationsLoading,
    connect: connectMutation.mutate,
    disconnect: disconnectMutation.mutate,
    updateIntegration: updateMutation.mutate,
    isConnecting: connectMutation.isPending,
    isDisconnecting: disconnectMutation.isPending,
    isUpdating: updateMutation.isPending,
  }
}

export const useBinanceIntegration = () => {
  const { user } = useAuth()
  const queryClient = useQueryClient()
  const { toast } = useToast()

  // Connect Binance mutation
  const connectBinanceMutation = useMutation({
    mutationFn: ({ apiKey, secretKey }: { apiKey: string; secretKey: string }) =>
      integrationsService.connectBinance(user!.id, apiKey, secretKey),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['integrations', 'user', user?.id] })
      toast({
        title: 'تم ربط Binance بنجاح',
        description: 'يمكنك الآن مزامنة بيانات التداول',
        variant: 'success',
      })
    },
    onError: (error: any) => {
      toast({
        title: 'خطأ في ربط Binance',
        description: error.message,
        variant: 'destructive',
      })
    },
  })

  // Sync Binance data mutation
  const syncBinanceMutation = useMutation({
    mutationFn: (integrationId: string) => integrationsService.syncBinanceData(integrationId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['integrations', 'user', user?.id] })
      toast({
        title: 'تم تحديث البيانات',
        description: 'تم مزامنة بيانات Binance بنجاح',
        variant: 'success',
      })
    },
    onError: (error: any) => {
      toast({
        title: 'خطأ في المزامنة',
        description: error.message,
        variant: 'destructive',
      })
    },
  })

  return {
    connectBinance: connectBinanceMutation.mutate,
    syncBinance: syncBinanceMutation.mutate,
    isConnecting: connectBinanceMutation.isPending,
    isSyncing: syncBinanceMutation.isPending,
  }
}

export const useMetaTraderIntegration = () => {
  const { user } = useAuth()
  const queryClient = useQueryClient()
  const { toast } = useToast()

  // Connect MetaTrader mutation
  const connectMTMutation = useMutation({
    mutationFn: ({ serverUrl, login, password }: { 
      serverUrl: string; 
      login: string; 
      password: string 
    }) => integrationsService.connectMetaTrader(user!.id, serverUrl, login, password),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['integrations', 'user', user?.id] })
      toast({
        title: 'تم ربط MetaTrader بنجاح',
        description: 'يمكنك الآن إرسال الإشارات تلقائياً',
        variant: 'success',
      })
    },
    onError: (error: any) => {
      toast({
        title: 'خطأ في ربط MetaTrader',
        description: error.message,
        variant: 'destructive',
      })
    },
  })

  // Send signal to MetaTrader mutation
  const sendSignalMutation = useMutation({
    mutationFn: ({ integrationId, signal }: { integrationId: string; signal: any }) =>
      integrationsService.sendSignalToMetaTrader(integrationId, signal),
    onSuccess: (success) => {
      if (success) {
        toast({
          title: 'تم إرسال الإشارة',
          description: 'تم إرسال الإشارة إلى MetaTrader بنجاح',
          variant: 'success',
        })
      } else {
        toast({
          title: 'فشل في إرسال الإشارة',
          description: 'تعذر إرسال الإشارة إلى MetaTrader',
          variant: 'destructive',
        })
      }
    },
    onError: (error: any) => {
      toast({
        title: 'خطأ في إرسال الإشارة',
        description: error.message,
        variant: 'destructive',
      })
    },
  })

  return {
    connectMetaTrader: connectMTMutation.mutate,
    sendSignal: sendSignalMutation.mutate,
    isConnecting: connectMTMutation.isPending,
    isSending: sendSignalMutation.isPending,
  }
}

export const useTelegramIntegration = () => {
  const { user } = useAuth()
  const queryClient = useQueryClient()
  const { toast } = useToast()

  // Connect Telegram mutation
  const connectTelegramMutation = useMutation({
    mutationFn: ({ botToken, chatId }: { botToken: string; chatId: string }) =>
      integrationsService.connectTelegram(user!.id, botToken, chatId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['integrations', 'user', user?.id] })
      toast({
        title: 'تم ربط Telegram بنجاح',
        description: 'ستصلك الإشارات عبر Telegram الآن',
        variant: 'success',
      })
    },
    onError: (error: any) => {
      toast({
        title: 'خطأ في ربط Telegram',
        description: error.message,
        variant: 'destructive',
      })
    },
  })

  // Send message mutation
  const sendMessageMutation = useMutation({
    mutationFn: ({ integrationId, message }: { integrationId: string; message: string }) =>
      integrationsService.sendTelegramMessage(integrationId, message),
    onSuccess: (success) => {
      if (success) {
        toast({
          title: 'تم إرسال الرسالة',
          description: 'تم إرسال الرسالة عبر Telegram بنجاح',
          variant: 'success',
        })
      }
    },
    onError: (error: any) => {
      toast({
        title: 'خطأ في إرسال الرسالة',
        description: error.message,
        variant: 'destructive',
      })
    },
  })

  return {
    connectTelegram: connectTelegramMutation.mutate,
    sendMessage: sendMessageMutation.mutate,
    isConnecting: connectTelegramMutation.isPending,
    isSending: sendMessageMutation.isPending,
  }
}

export const useTradingViewIntegration = () => {
  const { user } = useAuth()
  const queryClient = useQueryClient()
  const { toast } = useToast()

  // Connect TradingView mutation
  const connectTVMutation = useMutation({
    mutationFn: (webhookUrl: string) =>
      integrationsService.connectTradingView(user!.id, webhookUrl),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['integrations', 'user', user?.id] })
      toast({
        title: 'تم ربط TradingView بنجاح',
        description: 'يمكنك الآن نشر الإشارات على TradingView',
        variant: 'success',
      })
    },
    onError: (error: any) => {
      toast({
        title: 'خطأ في ربط TradingView',
        description: error.message,
        variant: 'destructive',
      })
    },
  })

  // Publish signal mutation
  const publishSignalMutation = useMutation({
    mutationFn: ({ integrationId, signal }: { integrationId: string; signal: any }) =>
      integrationsService.publishToTradingView(integrationId, signal),
    onSuccess: (success) => {
      if (success) {
        toast({
          title: 'تم نشر الإشارة',
          description: 'تم نشر الإشارة على TradingView بنجاح',
          variant: 'success',
        })
      }
    },
    onError: (error: any) => {
      toast({
        title: 'خطأ في نشر الإشارة',
        description: error.message,
        variant: 'destructive',
      })
    },
  })

  return {
    connectTradingView: connectTVMutation.mutate,
    publishSignal: publishSignalMutation.mutate,
    isConnecting: connectTVMutation.isPending,
    isPublishing: publishSignalMutation.isPending,
  }
}