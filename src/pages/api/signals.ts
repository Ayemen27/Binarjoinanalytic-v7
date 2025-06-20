import type { NextApiRequest, NextApiResponse } from 'next';

interface Signal {
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
}

interface ApiResponse {
  success: boolean;
  data?: Signal | Signal[];
  error?: string;
  message?: string;
}

// محاكاة قاعدة بيانات في الذاكرة
let signalsDB: Signal[] = [];

export default function handler(
  req: NextApiRequest,
  res: NextApiResponse<ApiResponse>
) {
  const { method } = req;

  // إعداد CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  if (method === 'OPTIONS') {
    return res.status(200).end();
  }

  try {
    switch (method) {
      case 'GET':
        return handleGetSignals(req, res);
      case 'POST':
        return handleCreateSignal(req, res);
      case 'PUT':
        return handleUpdateSignal(req, res);
      case 'DELETE':
        return handleDeleteSignal(req, res);
      default:
        return res.status(405).json({
          success: false,
          error: 'Method not allowed'
        });
    }
  } catch (error) {
    console.error('API Error:', error);
    return res.status(500).json({
      success: false,
      error: 'Internal server error'
    });
  }
}

function handleGetSignals(req: NextApiRequest, res: NextApiResponse<ApiResponse>) {
  const { id, symbol, status, limit = '50' } = req.query;

  let filteredSignals = [...signalsDB];

  // فلترة حسب ID محدد
  if (id) {
    const signal = signalsDB.find(s => s.id === id);
    if (!signal) {
      return res.status(404).json({
        success: false,
        error: 'Signal not found'
      });
    }
    return res.status(200).json({
      success: true,
      data: signal
    });
  }

  // فلترة حسب الرمز
  if (symbol) {
    filteredSignals = filteredSignals.filter(s => 
      s.symbol.toLowerCase() === (symbol as string).toLowerCase()
    );
  }

  // تحديد العدد
  const limitNum = parseInt(limit as string);
  filteredSignals = filteredSignals.slice(0, limitNum);

  // ترتيب حسب التاريخ (الأحدث أولاً)
  filteredSignals.sort((a, b) => 
    new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  );

  return res.status(200).json({
    success: true,
    data: filteredSignals
  });
}

function handleCreateSignal(req: NextApiRequest, res: NextApiResponse<ApiResponse>) {
  const signalData = req.body;

  // التحقق من البيانات المطلوبة
  if (!signalData.symbol || !signalData.direction) {
    return res.status(400).json({
      success: false,
      error: 'Missing required fields: symbol and direction'
    });
  }

  // إنشاء إشارة جديدة
  const newSignal: Signal = {
    id: generateSignalId(),
    symbol: signalData.symbol,
    direction: signalData.direction,
    entryPrice: signalData.entryPrice || generateRandomPrice(signalData.symbol),
    targetPrice: signalData.targetPrice || 0,
    stopLoss: signalData.stopLoss || 0,
    confidence: signalData.confidence || Math.floor(Math.random() * 30) + 70,
    riskLevel: signalData.riskLevel || 'medium',
    timeframe: signalData.timeframe || '1h',
    strategy: signalData.strategy || 'combined',
    technicalAnalysis: signalData.technicalAnalysis || {
      rsi: Math.floor(Math.random() * 40) + 30,
      macd: Math.random() > 0.5 ? 'Bullish' : 'Bearish',
      support: 0,
      resistance: 0
    },
    reasoning: signalData.reasoning || [
      'تحليل فني قوي يشير إلى الاتجاه المتوقع',
      'مؤشرات إيجابية في السوق',
      'كسر مستويات مقاومة مهمة'
    ],
    createdAt: new Date().toISOString()
  };

  // حساب الأسعار المشتقة
  const currentPrice = newSignal.entryPrice;
  const pipDifference = Math.random() * 0.01 + 0.005;

  if (newSignal.direction === 'BUY') {
    newSignal.targetPrice = Number((currentPrice + pipDifference).toFixed(5));
    newSignal.stopLoss = Number((currentPrice - pipDifference/2).toFixed(5));
  } else {
    newSignal.targetPrice = Number((currentPrice - pipDifference).toFixed(5));
    newSignal.stopLoss = Number((currentPrice + pipDifference/2).toFixed(5));
  }

  newSignal.technicalAnalysis.support = Number((currentPrice - 0.005).toFixed(5));
  newSignal.technicalAnalysis.resistance = Number((currentPrice + 0.005).toFixed(5));

  // حفظ في قاعدة البيانات المؤقتة
  signalsDB.push(newSignal);

  return res.status(201).json({
    success: true,
    data: newSignal,
    message: 'Signal created successfully'
  });
}

function handleUpdateSignal(req: NextApiRequest, res: NextApiResponse<ApiResponse>) {
  const { id } = req.query;
  const updateData = req.body;

  if (!id) {
    return res.status(400).json({
      success: false,
      error: 'Signal ID is required'
    });
  }

  const signalIndex = signalsDB.findIndex(s => s.id === id);
  if (signalIndex === -1) {
    return res.status(404).json({
      success: false,
      error: 'Signal not found'
    });
  }

  // تحديث الإشارة
  signalsDB[signalIndex] = {
    ...signalsDB[signalIndex],
    ...updateData,
    id: signalsDB[signalIndex].id, // الحفاظ على ID الأصلي
    createdAt: signalsDB[signalIndex].createdAt // الحفاظ على تاريخ الإنشاء
  };

  return res.status(200).json({
    success: true,
    data: signalsDB[signalIndex],
    message: 'Signal updated successfully'
  });
}

function handleDeleteSignal(req: NextApiRequest, res: NextApiResponse<ApiResponse>) {
  const { id } = req.query;

  if (!id) {
    return res.status(400).json({
      success: false,
      error: 'Signal ID is required'
    });
  }

  const signalIndex = signalsDB.findIndex(s => s.id === id);
  if (signalIndex === -1) {
    return res.status(404).json({
      success: false,
      error: 'Signal not found'
    });
  }

  // حذف الإشارة
  const deletedSignal = signalsDB.splice(signalIndex, 1)[0];

  return res.status(200).json({
    success: true,
    data: deletedSignal,
    message: 'Signal deleted successfully'
  });
}

// دوال مساعدة
function generateSignalId(): string {
  return `signal_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
}

function generateRandomPrice(symbol: string): number {
  // أسعار أساسية لأزواج العملات الشائعة
  const basePrices: Record<string, number> = {
    'EUR/USD': 1.0850,
    'GBP/USD': 1.2650,
    'USD/JPY': 149.50,
    'USD/CHF': 0.8750,
    'AUD/USD': 0.6650,
    'USD/CAD': 1.3650,
    'NZD/USD': 0.6150,
    'EUR/GBP': 0.8650
  };

  const basePrice = basePrices[symbol] || 1.0000;
  const variation = (Math.random() - 0.5) * 0.02; // تغيير عشوائي ±1%
  
  return Number((basePrice + variation).toFixed(5));
}