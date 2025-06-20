import { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';

export interface Signal {
  id: string;
  symbol: string;
  direction: 'BUY' | 'SELL';
  entryPrice: number;
  targetPrice: number;
  stopLoss: number;
  confidence: number;
  riskLevel: string;
  timeframe: string;
  strategy: string;
  technicalAnalysis: {
    rsi: number;
    macd: string;
    support: number;
    resistance: number;
  };
  reasoning: string[];
  createdAt: string;
  status?: 'active' | 'closed' | 'cancelled';
  profitLoss?: number;
  profitLossPercentage?: number;
  exitPrice?: number;
  closedAt?: string;
}

export interface SignalFilters {
  symbol?: string;
  direction?: 'BUY' | 'SELL';
  status?: 'active' | 'closed' | 'cancelled';
  timeframe?: string;
  strategy?: string;
  dateRange?: {
    start: string;
    end: string;
  };
}

export interface CreateSignalData {
  symbol: string;
  timeframe: string;
  riskLevel: 'low' | 'medium' | 'high';
  strategy: 'technical' | 'ai' | 'sentiment' | 'combined';
}

/**
 * Hook لإدارة الإشارات
 */
export const useSignals = (filters?: SignalFilters) => {
  const queryClient = useQueryClient();

  // جلب قائمة الإشارات
  const {
    data: signals,
    isLoading,
    error,
    refetch
  } = useQuery({
    queryKey: ['signals', filters],
    queryFn: async () => {
      const params = new URLSearchParams();
      
      if (filters?.symbol) params.append('symbol', filters.symbol);
      if (filters?.status) params.append('status', filters.status);
      if (filters?.direction) params.append('direction', filters.direction);
      if (filters?.timeframe) params.append('timeframe', filters.timeframe);
      if (filters?.strategy) params.append('strategy', filters.strategy);
      
      const response = await fetch(`/api/signals?${params.toString()}`);
      if (!response.ok) {
        throw new Error('Failed to fetch signals');
      }
      
      const result = await response.json();
      return result.data as Signal[];
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
    cacheTime: 10 * 60 * 1000, // 10 minutes
  });

  // إنشاء إشارة جديدة
  const createSignalMutation = useMutation({
    mutationFn: async (data: CreateSignalData) => {
      const response = await fetch('/api/signals', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        throw new Error('Failed to create signal');
      }

      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['signals'] });
    },
  });

  // تحديث إشارة
  const updateSignalMutation = useMutation({
    mutationFn: async ({ id, updates }: { id: string; updates: Partial<Signal> }) => {
      const response = await fetch(`/api/signals/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(updates),
      });

      if (!response.ok) {
        throw new Error('Failed to update signal');
      }

      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['signals'] });
    },
  });

  // حذف إشارة
  const deleteSignalMutation = useMutation({
    mutationFn: async (id: string) => {
      const response = await fetch(`/api/signals/${id}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        throw new Error('Failed to delete signal');
      }

      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['signals'] });
    },
  });

  return {
    // البيانات
    signals: signals || [],
    isLoading,
    error,
    
    // العمليات
    createSignal: createSignalMutation.mutate,
    updateSignal: updateSignalMutation.mutate,
    deleteSignal: deleteSignalMutation.mutate,
    refetchSignals: refetch,
    
    // حالة العمليات
    isCreating: createSignalMutation.isPending,
    isUpdating: updateSignalMutation.isPending,
    isDeleting: deleteSignalMutation.isPending,
    
    // أخطاء العمليات
    createError: createSignalMutation.error,
    updateError: updateSignalMutation.error,
    deleteError: deleteSignalMutation.error,
  };
};

/**
 * Hook لجلب إشارة واحدة
 */
export const useSignal = (id: string) => {
  const queryClient = useQueryClient();

  const {
    data: signal,
    isLoading,
    error
  } = useQuery({
    queryKey: ['signals', id],
    queryFn: async () => {
      const response = await fetch(`/api/signals/${id}`);
      if (!response.ok) {
        throw new Error('Failed to fetch signal');
      }
      
      const result = await response.json();
      return result.data as Signal;
    },
    enabled: !!id,
  });

  return {
    signal,
    isLoading,
    error
  };
};

/**
 * Hook لإحصائيات الإشارات
 */
export const useSignalStats = (timeRange: string = '30d') => {
  const { data: stats, isLoading } = useQuery({
    queryKey: ['signal-stats', timeRange],
    queryFn: async () => {
      const response = await fetch(`/api/signals/stats?timeRange=${timeRange}`);
      if (!response.ok) {
        throw new Error('Failed to fetch signal stats');
      }
      
      const result = await response.json();
      return result.data;
    },
    staleTime: 10 * 60 * 1000, // 10 minutes
  });

  return {
    stats: stats || {
      totalSignals: 0,
      successfulSignals: 0,
      successRate: 0,
      totalProfit: 0,
      averageProfit: 0,
      averageDuration: 0,
      bestPerformer: null,
      worstPerformer: null,
    },
    isLoading
  };
};

/**
 * Hook للاشتراك في الإشارات المباشرة (WebSocket)
 */
export const useRealTimeSignals = () => {
  const [isConnected, setIsConnected] = useState(false);
  const [lastSignal, setLastSignal] = useState<Signal | null>(null);
  const queryClient = useQueryClient();

  useEffect(() => {
    // إعداد WebSocket للإشارات المباشرة
    const connectWebSocket = () => {
      try {
        const ws = new WebSocket(`${process.env.NEXT_PUBLIC_WS_URL || 'ws://localhost:3000'}/signals`);
        
        ws.onopen = () => {
          console.log('Connected to signal stream');
          setIsConnected(true);
        };

        ws.onmessage = (event) => {
          try {
            const signal = JSON.parse(event.data) as Signal;
            setLastSignal(signal);
            
            // تحديث cache الإشارات
            queryClient.setQueryData(['signals'], (old: Signal[] | undefined) => {
              if (!old) return [signal];
              return [signal, ...old];
            });
            
            // إرسال إشعار للمستخدم
            if ('Notification' in window && Notification.permission === 'granted') {
              new Notification(`إشارة جديدة: ${signal.direction} ${signal.symbol}`, {
                body: `ثقة ${signal.confidence}% - ${signal.strategy}`,
                icon: '/favicon.ico'
              });
            }
          } catch (error) {
            console.error('Error parsing WebSocket message:', error);
          }
        };

        ws.onclose = () => {
          console.log('Disconnected from signal stream');
          setIsConnected(false);
          
          // إعادة المحاولة بعد 5 ثوان
          setTimeout(connectWebSocket, 5000);
        };

        ws.onerror = (error) => {
          console.error('WebSocket error:', error);
          setIsConnected(false);
        };

        return ws;
      } catch (error) {
        console.error('Failed to connect to WebSocket:', error);
        return null;
      }
    };

    const ws = connectWebSocket();

    // طلب إذن الإشعارات
    if ('Notification' in window && Notification.permission === 'default') {
      Notification.requestPermission();
    }

    return () => {
      if (ws) {
        ws.close();
      }
    };
  }, [queryClient]);

  return {
    isConnected,
    lastSignal,
  };
};

export default useSignals;