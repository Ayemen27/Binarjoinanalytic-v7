import type { NextApiRequest, NextApiResponse } from 'next';
import { signalService } from '@/lib/database';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method === 'GET') {
    try {
      const userId = req.query.userId as string || 'temp-user';
      
      const signals = await signalService.getUserSignals(userId);

      res.status(200).json({
        success: true,
        data: signals,
        count: signals.length
      });
    } catch (error: any) {
      console.error('Error fetching signal history:', error);
      res.status(500).json({
        success: false,
        error: 'فشل في جلب سجل الإشارات'
      });
    }
  } else {
    res.setHeader('Allow', ['GET']);
    res.status(405).json({
      success: false,
      error: `الطريقة ${req.method} غير مدعومة`
    });
  }
}