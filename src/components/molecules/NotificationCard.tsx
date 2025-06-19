import React from 'react'
import { Card, CardContent } from '@/components/atoms/Card'
import { Button } from '@/components/atoms/Button'
import { Badge } from '@/components/ui/badge'
import { 
  Bell, 
  AlertTriangle, 
  CheckCircle, 
  Info, 
  XCircle, 
  TrendingUp, 
  CreditCard,
  Trash2,
  Eye
} from 'lucide-react'
import type { Notification } from '@/services/notifications'

interface NotificationCardProps {
  notification: Notification
  onMarkAsRead?: (id: string) => void
  onDelete?: (id: string) => void
  showActions?: boolean
}

export const NotificationCard: React.FC<NotificationCardProps> = ({
  notification,
  onMarkAsRead,
  onDelete,
  showActions = true,
}) => {
  const getTypeIcon = (type: Notification['type']) => {
    switch (type) {
      case 'success':
        return <CheckCircle className="h-5 w-5 text-green-600" />
      case 'warning':
        return <AlertTriangle className="h-5 w-5 text-yellow-600" />
      case 'error':
        return <XCircle className="h-5 w-5 text-red-600" />
      case 'signal':
        return <TrendingUp className="h-5 w-5 text-blue-600" />
      case 'billing':
        return <CreditCard className="h-5 w-5 text-purple-600" />
      default:
        return <Info className="h-5 w-5 text-gray-600" />
    }
  }

  const getTypeColor = (type: Notification['type']) => {
    switch (type) {
      case 'success':
        return 'bg-green-50 border-green-200 dark:bg-green-900/20 dark:border-green-800'
      case 'warning':
        return 'bg-yellow-50 border-yellow-200 dark:bg-yellow-900/20 dark:border-yellow-800'
      case 'error':
        return 'bg-red-50 border-red-200 dark:bg-red-900/20 dark:border-red-800'
      case 'signal':
        return 'bg-blue-50 border-blue-200 dark:bg-blue-900/20 dark:border-blue-800'
      case 'billing':
        return 'bg-purple-50 border-purple-200 dark:bg-purple-900/20 dark:border-purple-800'
      default:
        return 'bg-gray-50 border-gray-200 dark:bg-gray-900/20 dark:border-gray-800'
    }
  }

  const getTypeText = (type: Notification['type']) => {
    switch (type) {
      case 'success':
        return 'نجاح'
      case 'warning':
        return 'تحذير'
      case 'error':
        return 'خطأ'
      case 'signal':
        return 'إشارة'
      case 'billing':
        return 'فوترة'
      default:
        return 'معلومات'
    }
  }

  const formatTime = (timeString: string) => {
    const date = new Date(timeString)
    const now = new Date()
    const diffInMinutes = Math.floor((now.getTime() - date.getTime()) / (1000 * 60))

    if (diffInMinutes < 1) return 'الآن'
    if (diffInMinutes < 60) return `منذ ${diffInMinutes} دقيقة`
    
    const diffInHours = Math.floor(diffInMinutes / 60)
    if (diffInHours < 24) return `منذ ${diffInHours} ساعة`
    
    const diffInDays = Math.floor(diffInHours / 24)
    if (diffInDays < 7) return `منذ ${diffInDays} يوم`
    
    return date.toLocaleDateString('ar-SA')
  }

  const getChannelText = (channels: Notification['channel']) => {
    const channelMap = {
      in_app: 'التطبيق',
      email: 'البريد',
      sms: 'رسائل',
      push: 'إشعارات',
      telegram: 'تلجرام'
    }
    
    return channels.map(ch => channelMap[ch] || ch).join(', ')
  }

  return (
    <Card className={`${getTypeColor(notification.type)} ${!notification.read ? 'ring-2 ring-blue-500/20' : ''} transition-all duration-200 hover:shadow-md`}>
      <CardContent className="p-4">
        <div className="flex items-start space-x-3 rtl:space-x-reverse">
          {/* Icon */}
          <div className="flex-shrink-0 mt-1">
            {getTypeIcon(notification.type)}
          </div>

          {/* Content */}
          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <h3 className={`text-sm font-semibold ${!notification.read ? 'text-gray-900 dark:text-white' : 'text-gray-700 dark:text-gray-300'}`}>
                    {notification.title}
                  </h3>
                  {!notification.read && (
                    <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                  )}
                </div>
                
                <p className="text-sm text-gray-600 dark:text-gray-400 leading-relaxed">
                  {notification.message}
                </p>

                {/* Metadata */}
                <div className="flex items-center gap-4 mt-3 text-xs text-gray-500 dark:text-gray-400">
                  <span>{formatTime(notification.created_at)}</span>
                  
                  <Badge variant="outline" className="text-xs">
                    {getTypeText(notification.type)}
                  </Badge>
                  
                  {notification.channel.length > 0 && (
                    <span>عبر: {getChannelText(notification.channel)}</span>
                  )}
                </div>

                {/* Additional data */}
                {notification.data && Object.keys(notification.data).length > 0 && (
                  <div className="mt-2 p-2 bg-gray-100 dark:bg-gray-800 rounded text-xs">
                    {Object.entries(notification.data).map(([key, value]) => (
                      <div key={key} className="flex justify-between">
                        <span className="font-medium">{key}:</span>
                        <span>{String(value)}</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Actions */}
              {showActions && (
                <div className="flex items-center gap-1 mr-2">
                  {!notification.read && onMarkAsRead && (
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => onMarkAsRead(notification.id)}
                      className="h-8 w-8 p-0"
                      title="وضع علامة كمقروء"
                    >
                      <Eye className="h-3 w-3" />
                    </Button>
                  )}
                  
                  {onDelete && (
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => onDelete(notification.id)}
                      className="h-8 w-8 p-0 text-red-600 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-900/20"
                      title="حذف الإشعار"
                    >
                      <Trash2 className="h-3 w-3" />
                    </Button>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Expiry warning */}
        {notification.expires_at && new Date(notification.expires_at) > new Date() && (
          <div className="mt-2 text-xs text-yellow-600 dark:text-yellow-400">
            ينتهي في: {formatTime(notification.expires_at)}
          </div>
        )}
      </CardContent>
    </Card>
  )
}