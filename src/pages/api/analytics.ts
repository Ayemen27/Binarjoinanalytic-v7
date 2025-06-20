import type { NextApiRequest, NextApiResponse } from 'next';

interface AnalyticsData {
  totalSignals: number;
  successRate: number;
  totalProfit: number;
  activeUsers: number;
  performanceData: {
    month: string;
    signals: number;
    success: number;
  }[];
  distributionData: {
    name: string;
    value: number;
    color: string;
  }[];
  topPerformers: {
    symbol: string;
    signalsCount: number;
    successRate: number;
    avgProfit: number;
    status: string;
  }[];
}

interface ApiResponse {
  success: boolean;
  data?: AnalyticsData;
  error?: string;
}

export default function handler(
  req: NextApiRequest,
  res: NextApiResponse<ApiResponse>
) {
  const { method } = req;

  // إعداد CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  if (method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (method !== 'GET') {
    return res.status(405).json({
      success: false,
      error: 'Method not allowed'
    });
  }

  try {
    const { timeRange = '30d', userId } = req.query;

    // محاكاة بيانات التحليلات الحقيقية
    const analyticsData: AnalyticsData = {
      totalSignals: 1234,
      successRate: 87.5,
      totalProfit: 12847,
      activeUsers: 2847,
      
      performanceData: [
        { month: 'يناير', signals: 65, success: 56 },
        { month: 'فبراير', signals: 78, success: 68 },
        { month: 'مارس', signals: 92, success: 81 },
        { month: 'أبريل', signals: 88, success: 77 },
        { month: 'مايو', signals: 105, success: 93 },
        { month: 'يونيو', signals: 118, success: 104 },
        { month: 'يوليو', signals: 134, success: 119 },
        { month: 'أغسطس', signals: 142, success: 126 },
        { month: 'سبتمبر', signals: 156, success: 139 },
        { month: 'أكتوبر', signals: 168, success: 148 },
        { month: 'نوفمبر', signals: 175, success: 154 },
        { month: 'ديسمبر', signals: 183, success: 162 }
      ],
      
      distributionData: [
        { name: 'EUR/USD', value: 35, color: '#3b82f6' },
        { name: 'GBP/USD', value: 25, color: '#10b981' },
        { name: 'USD/JPY', value: 20, color: '#f59e0b' },
        { name: 'USD/CHF', value: 12, color: '#ef4444' },
        { name: 'أخرى', value: 8, color: '#8b5cf6' }
      ],
      
      topPerformers: [
        {
          symbol: 'EUR/USD',
          signalsCount: 245,
          successRate: 89.2,
          avgProfit: 156,
          status: 'ممتاز'
        },
        {
          symbol: 'GBP/USD',
          signalsCount: 189,
          successRate: 85.7,
          avgProfit: 134,
          status: 'جيد'
        },
        {
          symbol: 'USD/JPY',
          signalsCount: 156,
          successRate: 78.3,
          avgProfit: 98,
          status: 'متوسط'
        },
        {
          symbol: 'USD/CHF',
          signalsCount: 123,
          successRate: 82.1,
          avgProfit: 112,
          status: 'جيد'
        },
        {
          symbol: 'AUD/USD',
          signalsCount: 98,
          successRate: 76.5,
          avgProfit: 89,
          status: 'متوسط'
        }
      ]
    };

    // تطبيق فلاتر بناءً على المعاملات
    if (timeRange === '7d') {
      // تقليل البيانات للأسبوع الماضي
      analyticsData.performanceData = analyticsData.performanceData.slice(-1);
      analyticsData.totalSignals = Math.floor(analyticsData.totalSignals * 0.2);
    } else if (timeRange === '90d') {
      // زيادة البيانات للـ90 يوم الماضية
      analyticsData.totalSignals = Math.floor(analyticsData.totalSignals * 1.5);
    }

    if (userId) {
      // فلترة البيانات لمستخدم محدد
      analyticsData.totalSignals = Math.floor(analyticsData.totalSignals * 0.1);
      analyticsData.totalProfit = Math.floor(analyticsData.totalProfit * 0.15);
    }

    return res.status(200).json({
      success: true,
      data: analyticsData
    });

  } catch (error) {
    console.error('Analytics API Error:', error);
    return res.status(500).json({
      success: false,
      error: 'Internal server error'
    });
  }
}