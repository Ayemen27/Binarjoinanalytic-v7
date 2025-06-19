import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { apiService, type APIKey, type APIEndpoint } from '@/services/api'
import { useAuth } from './useAuth'
import { useToast } from './useToast'
import { supabase } from '@/lib/supabase'

export const useAPIKeys = () => {
  const { user } = useAuth()
  const queryClient = useQueryClient()
  const { toast } = useToast()

  // Get user API keys
  const {
    data: apiKeys,
    isLoading
  } = useQuery({
    queryKey: ['api', 'keys', user?.id],
    queryFn: () => user ? apiService.getUserAPIKeys(user.id) : Promise.resolve([]),
    enabled: !!user,
  })

  // Create API key mutation
  const createAPIKeyMutation = useMutation({
    mutationFn: ({ name, permissions }: { name: string; permissions: string[] }) =>
      apiService.createAPIKey(user!.id, name, permissions),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['api', 'keys', user?.id] })
      toast({
        title: 'تم إنشاء مفتاح API جديد',
        description: 'احفظ المفتاح في مكان آمن، لن تتمكن من رؤيته مرة أخرى',
        variant: 'success',
      })
    },
    onError: (error: any) => {
      toast({
        title: 'خطأ في إنشاء مفتاح API',
        description: error.message,
        variant: 'destructive',
      })
    },
  })

  // Update API key mutation
  const updateAPIKeyMutation = useMutation({
    mutationFn: ({ keyId, updates }: { keyId: string; updates: Partial<APIKey> }) =>
      apiService.updateAPIKey(keyId, updates),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['api', 'keys', user?.id] })
      toast({
        title: 'تم تحديث مفتاح API',
        variant: 'success',
      })
    },
    onError: (error: any) => {
      toast({
        title: 'خطأ في تحديث مفتاح API',
        description: error.message,
        variant: 'destructive',
      })
    },
  })

  // Delete API key mutation
  const deleteAPIKeyMutation = useMutation({
    mutationFn: (keyId: string) => apiService.deleteAPIKey(keyId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['api', 'keys', user?.id] })
      toast({
        title: 'تم حذف مفتاح API',
        variant: 'success',
      })
    },
    onError: (error: any) => {
      toast({
        title: 'خطأ في حذف مفتاح API',
        description: error.message,
        variant: 'destructive',
      })
    },
  })

  return {
    apiKeys: apiKeys || [],
    isLoading,
    createAPIKey: createAPIKeyMutation.mutate,
    updateAPIKey: updateAPIKeyMutation.mutate,
    deleteAPIKey: deleteAPIKeyMutation.mutate,
    isCreating: createAPIKeyMutation.isPending,
    isUpdating: updateAPIKeyMutation.isPending,
    isDeleting: deleteAPIKeyMutation.isPending,
    createResult: createAPIKeyMutation.data,
  }
}

export const useAPIUsage = (apiKeyId?: string) => {
  // Get API usage statistics
  const {
    data: usageStats,
    isLoading
  } = useQuery({
    queryKey: ['api', 'usage', apiKeyId],
    queryFn: () => apiKeyId ? apiService.getUsageStats(apiKeyId, 'day') : Promise.resolve(null),
    enabled: !!apiKeyId,
    refetchInterval: 60000, // Refetch every minute
  })

  // Get detailed usage history
  const {
    data: usageHistory,
    isLoading: historyLoading
  } = useQuery({
    queryKey: ['api', 'usage', 'history', apiKeyId],
    queryFn: () => apiKeyId ? apiService.getAPIUsage(apiKeyId, 7) : Promise.resolve([]),
    enabled: !!apiKeyId,
  })

  return {
    usageStats: usageStats || {
      total_requests: 0,
      successful_requests: 0,
      error_rate: 0,
      avg_response_time: 0,
      rate_limit_hits: 0,
    },
    usageHistory: usageHistory || [],
    isLoading: isLoading || historyLoading,
  }
}

export const useAPIDocumentation = () => {
  // Get API endpoints documentation
  const apiEndpoints = apiService.getAPIEndpoints()

  return {
    endpoints: apiEndpoints,
  }
}

export const useWebhooks = () => {
  const { user } = useAuth()
  const queryClient = useQueryClient()
  const { toast } = useToast()

  // Get user webhooks
  const {
    data: webhooks,
    isLoading
  } = useQuery({
    queryKey: ['api', 'webhooks', user?.id],
    queryFn: async () => {
      if (!user) return []
      
      const { data, error } = await supabase
        .from('webhooks')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })

      if (error) throw error
      return data || []
    },
    enabled: !!user,
  })

  // Create webhook mutation
  const createWebhookMutation = useMutation({
    mutationFn: ({ url, events }: { url: string; events: string[] }) =>
      apiService.createWebhook(user!.id, url, events),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['api', 'webhooks', user?.id] })
      toast({
        title: 'تم إنشاء الـ Webhook',
        description: 'سيتم إرسال الأحداث إلى الرابط المحدد',
        variant: 'success',
      })
    },
    onError: (error: any) => {
      toast({
        title: 'خطأ في إنشاء الـ Webhook',
        description: error.message,
        variant: 'destructive',
      })
    },
  })

  return {
    webhooks: webhooks || [],
    isLoading,
    createWebhook: createWebhookMutation.mutate,
    isCreating: createWebhookMutation.isPending,
  }
}