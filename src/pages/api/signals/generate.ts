import type { NextApiRequest, NextApiResponse } from 'next';
import { signalService } from '@/lib/database';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method === 'POST') {
    try {
      const { symbol, timeframe, riskLevel, strategy, userId } = req.body;

      if (!symbol || !timeframe || !riskLevel || !strategy) {
        return res.status(400).json({
          success: false,
          error: 'جميع البيانات مطلوبة'
        });
      }

      const signalData = {
        user_id: userId || 'temp-user',
        symbol,
        timeframe,
        risk_level: riskLevel,
        strategy_name: strategy,
        signal_type: 'technical'
      };

      const signal = await signalService.createSignal(signalData);
      
      // إضافة تنبيه للمستخدم
      if (signal) {
        // يمكن إضافة إشعار هنا في المستقبل
        console.log(`تم إنشاء إشارة جديدة: ${signal.symbol} - ${signal.direction}`);
      }

      res.status(201).json({
        success: true,
        data: signal,
        message: 'تم توليد الإشارة بنجاح'
      });
    } catch (error: any) {
      console.error('Error generating signal:', error);
      res.status(500).json({
        success: false,
        error: 'فشل في توليد الإشارة'
      });
    }
  } else {
    res.setHeader('Allow', ['POST']);
    res.status(405).json({
      success: false,
      error: `الطريقة ${req.method} غير مدعومة`
    });
  }
}