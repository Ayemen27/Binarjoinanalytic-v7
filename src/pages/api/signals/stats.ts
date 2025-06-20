import type { NextApiRequest, NextApiResponse } from 'next';

interface SignalStats {
  totalSignals: number;
  successfulSignals: number;
  successRate: number;
  totalProfit: number;
  averageProfit: number;
  averageDuration: number;
  bestPerformer: {
    symbol: string;
    profit: number;
    successRate: number;
  } | null;
  worstPerformer: {
    symbol: string;
    profit: number;
    successRate: number;
  } | null;
  timeDistribution: {
    [key: string]: number;
  };
  strategyPerformance: {
    strategy: string;
    signals: number;
    successRate: number;
    avgProfit: number;
  }[];
}

interface ApiResponse {
  success: boolean;
  data?: SignalStats;
  error?: string;
}

export default function handler(
  req: NextApiRequest,
  res: NextApiResponse<ApiResponse>
) {
  if (req.method !== 'GET') {
    return res.status(405).json({
      success: false,
      error: 'Method not allowed'
    });
  }

  try {
    const { timeRange = '30d', userId } = req.query;

    // محاكاة حساب الإحصائيات
    const stats = calculateSignalStats(timeRange as string, userId as string);

    return res.status(200).json({
      success: true,
      data: stats
    });

  } catch (error) {
    console.error('Signal stats API error:', error);
    return res.status(500).json({
      success: false,
      error: 'Internal server error'
    });
  }
}

function calculateSignalStats(timeRange: string, userId?: string): SignalStats {
  // محاكاة بيانات حقيقية بناءً على الفترة الزمنية
  const multiplier = getTimeRangeMultiplier(timeRange);
  
  const totalSignals = Math.floor(150 * multiplier);
  const successfulSignals = Math.floor(totalSignals * 0.73); // 73% نسبة نجاح
  const successRate = (successfulSignals / totalSignals) * 100;
  
  const totalProfit = (Math.random() * 5000 + 2000) * multiplier;
  const averageProfit = totalProfit / totalSignals;
  const averageDuration = 4.5 + Math.random() * 3; // 4.5 - 7.5 ساعات

  return {
    totalSignals,
    successfulSignals,
    successRate,
    totalProfit,
    averageProfit,
    averageDuration,
    bestPerformer: {
      symbol: 'EUR/USD',
      profit: 1250 * multiplier,
      successRate: 89.2
    },
    worstPerformer: {
      symbol: 'USD/CHF',
      profit: -340 * multiplier,
      successRate: 45.6
    },
    timeDistribution: generateTimeDistribution(timeRange),
    strategyPerformance: [
      {
        strategy: 'AI Combined',
        signals: Math.floor(60 * multiplier),
        successRate: 78.5,
        avgProfit: 85 * multiplier
      },
      {
        strategy: 'Technical Analysis',
        signals: Math.floor(45 * multiplier),
        successRate: 71.2,
        avgProfit: 62 * multiplier
      },
      {
        strategy: 'Sentiment',
        signals: Math.floor(30 * multiplier),
        successRate: 65.8,
        avgProfit: 48 * multiplier
      },
      {
        strategy: 'Momentum',
        signals: Math.floor(15 * multiplier),
        successRate: 82.1,
        avgProfit: 112 * multiplier
      }
    ]
  };
}

function getTimeRangeMultiplier(timeRange: string): number {
  switch (timeRange) {
    case '7d':
      return 0.25;
    case '30d':
      return 1;
    case '90d':
      return 3;
    case '1y':
      return 12;
    default:
      return 1;
  }
}

function generateTimeDistribution(timeRange: string): { [key: string]: number } {
  const distribution: { [key: string]: number } = {};
  
  if (timeRange === '7d') {
    // توزيع أسبوعي (الأيام)
    const days = ['الأحد', 'الاثنين', 'الثلاثاء', 'الأربعاء', 'الخميس', 'الجمعة', 'السبت'];
    days.forEach(day => {
      distribution[day] = Math.floor(Math.random() * 10 + 5);
    });
  } else if (timeRange === '30d') {
    // توزيع شهري (الأسابيع)
    for (let week = 1; week <= 4; week++) {
      distribution[`الأسبوع ${week}`] = Math.floor(Math.random() * 40 + 20);
    }
  } else if (timeRange === '90d') {
    // توزيع ربع سنوي (الشهور)
    const months = ['الشهر الأول', 'الشهر الثاني', 'الشهر الثالث'];
    months.forEach(month => {
      distribution[month] = Math.floor(Math.random() * 120 + 80);
    });
  } else {
    // توزيع سنوي (الأشهر)
    const months = [
      'يناير', 'فبراير', 'مارس', 'أبريل', 'مايو', 'يونيو',
      'يوليو', 'أغسطس', 'سبتمبر', 'أكتوبر', 'نوفمبر', 'ديسمبر'
    ];
    months.forEach(month => {
      distribution[month] = Math.floor(Math.random() * 200 + 100);
    });
  }
  
  return distribution;
}