import { useState, useEffect } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { notificationsService, type Notification, type NotificationSettings } from '@/services/notifications'
import { useAuth } from './useAuth'
import { useToast } from './useToast'

export const useNotifications = (page = 1, limit = 20) => {
  const { user } = useAuth()
  const queryClient = useQueryClient()

  // Get user notifications
  const {
    data: notificationsData,
    isLoading,
    error
  } = useQuery({
    queryKey: ['notifications', user?.id, page, limit],
    queryFn: () => user ? notificationsService.getUserNotifications(user.id, page, limit) : Promise.resolve(null),
    enabled: !!user,
  })

  // Get unread count
  const {
    data: unreadCount
  } = useQuery({
    queryKey: ['notifications', 'unread', user?.id],
    queryFn: () => user ? notificationsService.getUnreadCount(user.id) : Promise.resolve(0),
    enabled: !!user,
    refetchInterval: 30000, // Refetch every 30 seconds
  })

  // Mark as read mutation
  const markAsReadMutation = useMutation({
    mutationFn: (notificationId: string) => notificationsService.markAsRead(notificationId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notifications', user?.id] })
      queryClient.invalidateQueries({ queryKey: ['notifications', 'unread', user?.id] })
    },
  })

  // Mark all as read mutation
  const markAllAsReadMutation = useMutation({
    mutationFn: () => notificationsService.markAllAsRead(user!.id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notifications', user?.id] })
      queryClient.invalidateQueries({ queryKey: ['notifications', 'unread', user?.id] })
    },
  })

  // Delete notification mutation
  const deleteNotificationMutation = useMutation({
    mutationFn: (notificationId: string) => notificationsService.deleteNotification(notificationId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notifications', user?.id] })
      queryClient.invalidateQueries({ queryKey: ['notifications', 'unread', user?.id] })
    },
  })

  return {
    notifications: notificationsData?.data || [],
    totalNotifications: notificationsData?.total || 0,
    totalPages: notificationsData?.totalPages || 0,
    unreadCount: unreadCount || 0,
    isLoading,
    error,
    markAsRead: markAsReadMutation.mutate,
    markAllAsRead: markAllAsReadMutation.mutate,
    deleteNotification: deleteNotificationMutation.mutate,
    isMarkingAsRead: markAsReadMutation.isPending,
    isMarkingAllAsRead: markAllAsReadMutation.isPending,
    isDeletingNotification: deleteNotificationMutation.isPending,
  }
}

export const useNotificationSettings = () => {
  const { user } = useAuth()
  const queryClient = useQueryClient()
  const { toast } = useToast()

  // Get user settings
  const {
    data: settings,
    isLoading
  } = useQuery({
    queryKey: ['notifications', 'settings', user?.id],
    queryFn: () => user ? notificationsService.getUserSettings(user.id) : Promise.resolve(null),
    enabled: !!user,
  })

  // Update settings mutation
  const updateSettingsMutation = useMutation({
    mutationFn: (updates: Partial<NotificationSettings>) =>
      notificationsService.updateUserSettings(user!.id, updates),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notifications', 'settings', user?.id] })
      toast({
        title: 'تم حفظ الإعدادات',
        description: 'تم تحديث إعدادات الإشعارات بنجاح',
        variant: 'success',
      })
    },
    onError: (error: any) => {
      toast({
        title: 'خطأ في حفظ الإعدادات',
        description: error.message,
        variant: 'destructive',
      })
    },
  })

  return {
    settings: settings || {
      user_id: user?.id || '',
      email_notifications: true,
      sms_notifications: false,
      push_notifications: true,
      signal_alerts: true,
      billing_alerts: true,
      marketing_emails: false,
      telegram_chat_id: null,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    },
    isLoading,
    updateSettings: updateSettingsMutation.mutate,
    isUpdating: updateSettingsMutation.isPending,
  }
}

export const useRealtimeNotifications = () => {
  const { user } = useAuth()
  const queryClient = useQueryClient()
  const [isConnected, setIsConnected] = useState(false)

  useEffect(() => {
    if (!user) return

    let subscription: any

    notificationsService.subscribeToUserNotifications(
      user.id,
      (notification) => {
        queryClient.invalidateQueries({ queryKey: ['notifications', user.id] })
        queryClient.invalidateQueries({ queryKey: ['notifications', 'unread', user.id] })
      }
    ).then(sub => {
      subscription = sub
      setIsConnected(true)
    })

    return () => {
      if (subscription) {
        subscription.unsubscribe()
      }
      setIsConnected(false)
    }
  }, [user, queryClient])

  return {
    isConnected,
  }
}

export const useNotificationStats = () => {
  const { user } = useAuth()

  // Get notification statistics
  const {
    data: stats,
    isLoading
  } = useQuery({
    queryKey: ['notifications', 'stats', user?.id],
    queryFn: () => notificationsService.getNotificationStats(user?.id),
    enabled: !!user,
  })

  return {
    stats: stats || {
      total: 0,
      unread: 0,
      byType: {},
      byChannel: {},
    },
    isLoading,
  }
}