import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { subscriptionsService, type SubscriptionPlan, type Subscription, type Coupon } from '@/services/subscriptions'
import { useAuth } from './useAuth'
import { useToast } from './useToast'

export const useSubscriptionPlans = () => {
  const { data: plans, isLoading, error } = useQuery({
    queryKey: ['subscriptions', 'plans'],
    queryFn: subscriptionsService.getPlans,
  })

  return {
    plans: plans || [],
    isLoading,
    error,
  }
}

export const useUserSubscription = () => {
  const { user } = useAuth()
  const queryClient = useQueryClient()
  const { toast } = useToast()

  // Get user's current subscription
  const {
    data: subscription,
    isLoading
  } = useQuery({
    queryKey: ['subscriptions', 'user', user?.id],
    queryFn: () => user ? subscriptionsService.getUserSubscription(user.id) : Promise.resolve(null),
    enabled: !!user,
  })

  // Get usage statistics
  const {
    data: usageStats
  } = useQuery({
    queryKey: ['subscriptions', 'usage', user?.id],
    queryFn: () => user ? subscriptionsService.getUsageStats(user.id) : Promise.resolve(null),
    enabled: !!user,
    refetchInterval: 5 * 60 * 1000, // Refetch every 5 minutes
  })

  // Start trial mutation
  const startTrialMutation = useMutation({
    mutationFn: ({ planId, trialDays }: { planId: string; trialDays?: number }) =>
      subscriptionsService.startTrial(user!.id, planId, trialDays),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['subscriptions', 'user', user?.id] })
      queryClient.invalidateQueries({ queryKey: ['subscriptions', 'usage', user?.id] })
      toast({
        title: 'تم بدء فترة التجربة المجانية',
        description: 'يمكنك الآن الاستفادة من جميع الميزات',
        variant: 'success',
      })
    },
    onError: (error: any) => {
      toast({
        title: 'خطأ في بدء التجربة المجانية',
        description: error.message,
        variant: 'destructive',
      })
    },
  })

  // Subscribe mutation
  const subscribeMutation = useMutation({
    mutationFn: (subscription: Omit<Subscription, 'id' | 'created_at' | 'updated_at'>) =>
      subscriptionsService.createSubscription(subscription),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['subscriptions', 'user', user?.id] })
      queryClient.invalidateQueries({ queryKey: ['subscriptions', 'usage', user?.id] })
      toast({
        title: 'تم الاشتراك بنجاح',
        description: 'مرحباً بك في الخطة الجديدة',
        variant: 'success',
      })
    },
    onError: (error: any) => {
      toast({
        title: 'خطأ في الاشتراك',
        description: error.message,
        variant: 'destructive',
      })
    },
  })

  // Cancel subscription mutation
  const cancelMutation = useMutation({
    mutationFn: (subscriptionId: string) => subscriptionsService.cancelSubscription(subscriptionId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['subscriptions', 'user', user?.id] })
      toast({
        title: 'تم إلغاء الاشتراك',
        description: 'سيستمر حسابك حتى نهاية دورة الفوترة الحالية',
        variant: 'success',
      })
    },
    onError: (error: any) => {
      toast({
        title: 'خطأ في إلغاء الاشتراك',
        description: error.message,
        variant: 'destructive',
      })
    },
  })

  // Resume subscription mutation
  const resumeMutation = useMutation({
    mutationFn: (subscriptionId: string) => subscriptionsService.resumeSubscription(subscriptionId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['subscriptions', 'user', user?.id] })
      toast({
        title: 'تم استئناف الاشتراك',
        description: 'سيتم تجديد اشتراكك تلقائياً',
        variant: 'success',
      })
    },
    onError: (error: any) => {
      toast({
        title: 'خطأ في استئناف الاشتراك',
        description: error.message,
        variant: 'destructive',
      })
    },
  })

  return {
    subscription,
    usageStats,
    isLoading,
    startTrial: startTrialMutation.mutate,
    subscribe: subscribeMutation.mutate,
    cancelSubscription: cancelMutation.mutate,
    resumeSubscription: resumeMutation.mutate,
    isStartingTrial: startTrialMutation.isPending,
    isSubscribing: subscribeMutation.isPending,
    isCanceling: cancelMutation.isPending,
    isResuming: resumeMutation.isPending,
  }
}

export const useBilling = () => {
  const { user } = useAuth()
  const [currentPage, setCurrentPage] = useState(1)

  // Get billing history
  const {
    data: billingData,
    isLoading
  } = useQuery({
    queryKey: ['billing', 'history', user?.id, currentPage],
    queryFn: () => user ? subscriptionsService.getBillingHistory(user.id, currentPage, 10) : Promise.resolve(null),
    enabled: !!user,
  })

  return {
    billingHistory: billingData?.data || [],
    totalPages: billingData?.totalPages || 0,
    currentPage,
    setCurrentPage,
    isLoading,
  }
}

export const useCoupons = () => {
  const queryClient = useQueryClient()
  const { toast } = useToast()

  // Get available coupons
  const {
    data: coupons,
    isLoading
  } = useQuery({
    queryKey: ['coupons'],
    queryFn: subscriptionsService.getCoupons,
  })

  // Validate coupon mutation
  const validateCouponMutation = useMutation({
    mutationFn: ({ code, planId }: { code: string; planId?: string }) =>
      subscriptionsService.validateCoupon(code, planId),
    onError: (error: any) => {
      toast({
        title: 'كوبون غير صالح',
        description: error.message,
        variant: 'destructive',
      })
    },
  })

  // Apply coupon mutation
  const applyCouponMutation = useMutation({
    mutationFn: (code: string) => subscriptionsService.applyCoupon(code),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['coupons'] })
      toast({
        title: 'تم تطبيق الكوبون',
        description: 'تم خصم القيمة من إجمالي المبلغ',
        variant: 'success',
      })
    },
    onError: (error: any) => {
      toast({
        title: 'خطأ في تطبيق الكوبون',
        description: error.message,
        variant: 'destructive',
      })
    },
  })

  return {
    coupons: coupons || [],
    isLoading,
    validateCoupon: validateCouponMutation.mutate,
    applyCoupon: applyCouponMutation.mutate,
    isValidating: validateCouponMutation.isPending,
    isApplying: applyCouponMutation.isPending,
    validationResult: validateCouponMutation.data,
  }
}

export const useSubscriptionStats = () => {
  // Get subscription statistics
  const {
    data: stats,
    isLoading
  } = useQuery({
    queryKey: ['subscriptions', 'stats'],
    queryFn: subscriptionsService.getSubscriptionStats,
    refetchInterval: 5 * 60 * 1000, // Refetch every 5 minutes
  })

  return {
    stats: stats || {
      total: 0,
      active: 0,
      trial: 0,
      canceled: 0,
      revenue: 0,
    },
    isLoading,
  }
}