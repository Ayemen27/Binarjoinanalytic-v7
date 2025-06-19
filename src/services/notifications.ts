import { supabase } from '@/lib/supabase'
import type { PaginatedResponse } from '@/types'

export interface Notification {
  id: string
  user_id: string
  title: string
  message: string
  type: 'info' | 'success' | 'warning' | 'error' | 'signal' | 'billing'
  channel: ('in_app' | 'email' | 'sms' | 'push' | 'telegram')[]
  data: Record<string, any>
  read: boolean
  sent_at: string | null
  expires_at: string | null
  created_at: string
}

export interface NotificationSettings {
  user_id: string
  email_notifications: boolean
  sms_notifications: boolean
  push_notifications: boolean
  signal_alerts: boolean
  billing_alerts: boolean
  marketing_emails: boolean
  telegram_chat_id: string | null
  created_at: string
  updated_at: string
}

export interface NotificationTemplate {
  id: string
  name: string
  type: 'info' | 'success' | 'warning' | 'error' | 'signal' | 'billing'
  channel: 'in_app' | 'email' | 'sms' | 'push' | 'telegram'
  subject: Record<string, string>
  content: Record<string, string>
  variables: string[]
  is_active: boolean
  created_at: string
  updated_at: string
}

export const notificationsService = {
  // User Notifications
  async getUserNotifications(userId: string, page = 1, limit = 20): Promise<PaginatedResponse<Notification>> {
    const start = (page - 1) * limit
    const end = start + limit - 1

    const { data, error, count } = await supabase
      .from('notifications')
      .select('*', { count: 'exact' })
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .range(start, end)

    if (error) throw error

    return {
      data: data || [],
      total: count || 0,
      page,
      limit,
      totalPages: Math.ceil((count || 0) / limit),
    }
  },

  async getUnreadCount(userId: string): Promise<number> {
    const { count, error } = await supabase
      .from('notifications')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', userId)
      .eq('read', false)

    if (error) throw error
    return count || 0
  },

  async markAsRead(notificationId: string): Promise<Notification> {
    const { data, error } = await supabase
      .from('notifications')
      .update({ read: true })
      .eq('id', notificationId)
      .select()
      .single()

    if (error) throw error
    return data
  },

  async markAllAsRead(userId: string): Promise<void> {
    const { error } = await supabase
      .from('notifications')
      .update({ read: true })
      .eq('user_id', userId)
      .eq('read', false)

    if (error) throw error
  },

  async deleteNotification(notificationId: string): Promise<void> {
    const { error } = await supabase
      .from('notifications')
      .delete()
      .eq('id', notificationId)

    if (error) throw error
  },

  // Send Notifications
  async sendNotification(notification: Omit<Notification, 'id' | 'created_at' | 'read' | 'sent_at'>): Promise<Notification> {
    const { data, error } = await supabase
      .from('notifications')
      .insert({
        ...notification,
        read: false,
        sent_at: new Date().toISOString(),
      })
      .select()
      .single()

    if (error) throw error

    // Process different channels
    await this.processNotificationChannels(data)

    return data
  },

  async sendBulkNotifications(notifications: Omit<Notification, 'id' | 'created_at' | 'read' | 'sent_at'>[]): Promise<Notification[]> {
    const notificationsWithDefaults = notifications.map(notification => ({
      ...notification,
      read: false,
      sent_at: new Date().toISOString(),
    }))

    const { data, error } = await supabase
      .from('notifications')
      .insert(notificationsWithDefaults)
      .select()

    if (error) throw error

    // Process channels for each notification
    for (const notification of data) {
      await this.processNotificationChannels(notification)
    }

    return data || []
  },

  // Process different notification channels
  async processNotificationChannels(notification: Notification): Promise<void> {
    const settings = await this.getUserSettings(notification.user_id)
    
    for (const channel of notification.channel) {
      switch (channel) {
        case 'email':
          if (settings?.email_notifications) {
            await this.sendEmailNotification(notification)
          }
          break
        case 'sms':
          if (settings?.sms_notifications) {
            await this.sendSMSNotification(notification)
          }
          break
        case 'push':
          if (settings?.push_notifications) {
            await this.sendPushNotification(notification)
          }
          break
        case 'telegram':
          if (settings?.telegram_chat_id) {
            await this.sendTelegramNotification(notification, settings.telegram_chat_id)
          }
          break
        case 'in_app':
          // Already saved to database
          break
      }
    }
  },

  async sendEmailNotification(notification: Notification): Promise<void> {
    // Implementation would integrate with email service (SendGrid, AWS SES, etc.)
    console.log('Sending email notification:', notification.title)
  },

  async sendSMSNotification(notification: Notification): Promise<void> {
    // Implementation would integrate with SMS service (Twilio, AWS SNS, etc.)
    console.log('Sending SMS notification:', notification.title)
  },

  async sendPushNotification(notification: Notification): Promise<void> {
    // Implementation would integrate with push service (Firebase, OneSignal, etc.)
    console.log('Sending push notification:', notification.title)
  },

  async sendTelegramNotification(notification: Notification, chatId: string): Promise<void> {
    // Implementation would integrate with Telegram Bot API
    console.log('Sending Telegram notification:', notification.title, 'to', chatId)
  },

  // User Settings
  async getUserSettings(userId: string): Promise<NotificationSettings | null> {
    const { data, error } = await supabase
      .from('notification_settings')
      .select('*')
      .eq('user_id', userId)
      .single()

    if (error && error.code !== 'PGRST116') throw error
    return data || null
  },

  async updateUserSettings(userId: string, settings: Partial<NotificationSettings>): Promise<NotificationSettings> {
    const { data, error } = await supabase
      .from('notification_settings')
      .upsert({
        user_id: userId,
        ...settings,
        updated_at: new Date().toISOString(),
      })
      .select()
      .single()

    if (error) throw error
    return data
  },

  // Templates Management
  async getTemplates(): Promise<NotificationTemplate[]> {
    const { data, error } = await supabase
      .from('notification_templates')
      .select('*')
      .eq('is_active', true)
      .order('name')

    if (error) throw error
    return data || []
  },

  async getTemplate(name: string, channel: string): Promise<NotificationTemplate | null> {
    const { data, error } = await supabase
      .from('notification_templates')
      .select('*')
      .eq('name', name)
      .eq('channel', channel)
      .eq('is_active', true)
      .single()

    if (error && error.code !== 'PGRST116') throw error
    return data || null
  },

  async createTemplate(template: Omit<NotificationTemplate, 'id' | 'created_at' | 'updated_at'>): Promise<NotificationTemplate> {
    const { data, error } = await supabase
      .from('notification_templates')
      .insert(template)
      .select()
      .single()

    if (error) throw error
    return data
  },

  async updateTemplate(id: string, updates: Partial<NotificationTemplate>): Promise<NotificationTemplate> {
    const { data, error } = await supabase
      .from('notification_templates')
      .update({ ...updates, updated_at: new Date().toISOString() })
      .eq('id', id)
      .select()
      .single()

    if (error) throw error
    return data
  },

  // Send from template
  async sendFromTemplate(
    templateName: string,
    userId: string,
    variables: Record<string, string>,
    channel: ('in_app' | 'email' | 'sms' | 'push' | 'telegram')[] = ['in_app']
  ): Promise<Notification[]> {
    const notifications: Notification[] = []

    for (const ch of channel) {
      const template = await this.getTemplate(templateName, ch)
      if (!template) continue

      // Replace variables in subject and content
      let subject = template.subject.ar || template.subject.en || ''
      let content = template.content.ar || template.content.en || ''

      for (const [key, value] of Object.entries(variables)) {
        subject = subject.replace(new RegExp(`{${key}}`, 'g'), value)
        content = content.replace(new RegExp(`{${key}}`, 'g'), value)
      }

      const notification = await this.sendNotification({
        user_id: userId,
        title: subject,
        message: content,
        type: template.type,
        channel: [ch],
        data: variables,
        expires_at: null,
      })

      notifications.push(notification)
    }

    return notifications
  },

  // Signal-specific notifications
  async notifySignalCreated(userId: string, signalData: any): Promise<void> {
    await this.sendFromTemplate(
      'signal_created',
      userId,
      {
        symbol: signalData.symbol,
        type: signalData.signal_type,
        confidence: signalData.confidence_score.toString(),
      },
      ['in_app', 'push']
    )
  },

  async notifySignalResult(userId: string, signalData: any): Promise<void> {
    const templateName = signalData.status === 'won' ? 'signal_won' : 'signal_lost'
    await this.sendFromTemplate(
      templateName,
      userId,
      {
        symbol: signalData.symbol,
        result: signalData.result?.toString() || '0',
      },
      ['in_app', 'push']
    )
  },

  // Billing-specific notifications
  async notifySubscriptionExpiring(userId: string, daysLeft: number): Promise<void> {
    await this.sendFromTemplate(
      'subscription_expiring',
      userId,
      { days: daysLeft.toString() },
      ['in_app', 'email']
    )
  },

  async notifyPaymentSuccessful(userId: string, amount: string): Promise<void> {
    await this.sendFromTemplate(
      'payment_successful',
      userId,
      { amount },
      ['in_app', 'email']
    )
  },

  async notifyPaymentFailed(userId: string, reason: string): Promise<void> {
    await this.sendFromTemplate(
      'payment_failed',
      userId,
      { reason },
      ['in_app', 'email']
    )
  },

  // Real-time subscriptions
  async subscribeToUserNotifications(userId: string, callback: (notification: Notification) => void) {
    return supabase
      .channel(`notifications:${userId}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'notifications',
          filter: `user_id=eq.${userId}`,
        },
        (payload) => {
          callback(payload.new as Notification)
        }
      )
      .subscribe()
  },

  // Analytics
  async getNotificationStats(userId?: string): Promise<{
    total: number
    unread: number
    byType: Record<string, number>
    byChannel: Record<string, number>
  }> {
    let query = supabase.from('notifications').select('type, channel, read')
    
    if (userId) {
      query = query.eq('user_id', userId)
    }

    const { data, error } = await query

    if (error) throw error

    const stats = data?.reduce(
      (acc, notification) => {
        acc.total++
        if (!notification.read) acc.unread++
        
        acc.byType[notification.type] = (acc.byType[notification.type] || 0) + 1
        
        notification.channel.forEach((ch: string) => {
          acc.byChannel[ch] = (acc.byChannel[ch] || 0) + 1
        })
        
        return acc
      },
      {
        total: 0,
        unread: 0,
        byType: {} as Record<string, number>,
        byChannel: {} as Record<string, number>,
      }
    ) || {
      total: 0,
      unread: 0,
      byType: {},
      byChannel: {},
    }

    return stats
  },
}