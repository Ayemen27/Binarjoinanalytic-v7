import React from 'react'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/atoms/Card'
import { Button } from '@/components/atoms/Button'
import { TrendingUp, TrendingDown, Clock, Target, Shield } from 'lucide-react'
import type { Signal } from '@/types'

interface SignalCardProps {
  signal: Signal
  onUpdate?: (id: string, status: Signal['status']) => void
  showActions?: boolean
}

export const SignalCard: React.FC<SignalCardProps> = ({
  signal,
  onUpdate,
  showActions = false,
}) => {
  const getStatusColor = (status: Signal['status']) => {
    switch (status) {
      case 'active':
        return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300'
      case 'won':
        return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300'
      case 'lost':
        return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300'
      case 'expired':
        return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-300'
      default:
        return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300'
    }
  }

  const getStatusText = (status: Signal['status']) => {
    switch (status) {
      case 'active': return 'نشط'
      case 'won': return 'رابح'
      case 'lost': return 'خاسر'
      case 'expired': return 'منتهي'
      default: return 'في الانتظار'
    }
  }

  const formatTime = (timeString: string) => {
    const date = new Date(timeString)
    return date.toLocaleString('ar-SA', {
      hour: '2-digit',
      minute: '2-digit',
      day: '2-digit',
      month: '2-digit',
    })
  }

  return (
    <Card className="hover:shadow-lg transition-shadow duration-200">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg font-bold flex items-center gap-2">
            {signal.signal_type === 'call' ? (
              <TrendingUp className="h-5 w-5 text-green-600" />
            ) : (
              <TrendingDown className="h-5 w-5 text-red-600" />
            )}
            {signal.symbol}
          </CardTitle>
          <span className={`px-2 py-1 rounded-full text-xs font-semibold ${getStatusColor(signal.status)}`}>
            {getStatusText(signal.status)}
          </span>
        </div>
      </CardHeader>
      
      <CardContent className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div className="flex items-center gap-2">
            <Target className="h-4 w-4 text-blue-600" />
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400">سعر الدخول</p>
              <p className="font-semibold">{signal.entry_price.toFixed(4)}</p>
            </div>
          </div>
          
          <div className="flex items-center gap-2">
            <TrendingUp className="h-4 w-4 text-green-600" />
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400">الهدف</p>
              <p className="font-semibold text-green-600">{signal.target_price.toFixed(4)}</p>
            </div>
          </div>
          
          <div className="flex items-center gap-2">
            <Shield className="h-4 w-4 text-red-600" />
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400">وقف الخسارة</p>
              <p className="font-semibold text-red-600">{signal.stop_loss.toFixed(4)}</p>
            </div>
          </div>
          
          <div className="flex items-center gap-2">
            <Clock className="h-4 w-4 text-purple-600" />
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400">انتهاء الصلاحية</p>
              <p className="font-semibold text-purple-600">{formatTime(signal.expiry_time)}</p>
            </div>
          </div>
        </div>

        <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-3">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
              مستوى الثقة
            </span>
            <span className="text-lg font-bold text-primary">
              {signal.confidence_score}%
            </span>
          </div>
          <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
            <div
              className="bg-gradient-to-r from-blue-500 to-purple-600 h-2 rounded-full transition-all duration-300"
              style={{ width: `${signal.confidence_score}%` }}
            />
          </div>
        </div>

        <div className="flex items-center justify-between">
          <span className={`px-2 py-1 rounded-full text-xs font-semibold ${
            signal.signal_type === 'call' 
              ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300' 
              : 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300'
          }`}>
            {signal.signal_type === 'call' ? 'شراء (Call)' : 'بيع (Put)'}
          </span>
          
          <span className="text-xs text-gray-500 dark:text-gray-400">
            {formatTime(signal.created_at)}
          </span>
        </div>

        {showActions && signal.status === 'pending' && onUpdate && (
          <div className="flex gap-2 pt-2">
            <Button
              size="sm"
              onClick={() => onUpdate(signal.id, 'active')}
              className="flex-1 bg-blue-600 hover:bg-blue-700"
            >
              تفعيل
            </Button>
            <Button
              size="sm"
              variant="outline"
              onClick={() => onUpdate(signal.id, 'expired')}
              className="flex-1"
            >
              إلغاء
            </Button>
          </div>
        )}

        {showActions && signal.status === 'active' && onUpdate && (
          <div className="flex gap-2 pt-2">
            <Button
              size="sm"
              onClick={() => onUpdate(signal.id, 'won')}
              className="flex-1 bg-green-600 hover:bg-green-700"
            >
              رابح
            </Button>
            <Button
              size="sm"
              onClick={() => onUpdate(signal.id, 'lost')}
              className="flex-1 bg-red-600 hover:bg-red-700"
            >
              خاسر
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  )
}