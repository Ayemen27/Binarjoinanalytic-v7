import type { NextApiRequest, NextApiResponse } from 'next';
import { notificationService } from '@/lib/database';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  switch (req.method) {
    case 'GET':
      try {
        const userId = req.query.userId as string || 'temp-user';
        const notifications = await notificationService.getUserNotifications(userId);

        res.status(200).json({
          success: true,
          data: notifications,
          count: notifications.length
        });
      } catch (error: any) {
        console.error('Error fetching notifications:', error);
        res.status(500).json({
          success: false,
          error: 'فشل في جلب التنبيهات'
        });
      }
      break;

    case 'PATCH':
      try {
        const { notificationId } = req.body;
        
        if (!notificationId) {
          return res.status(400).json({
            success: false,
            error: 'معرف التنبيه مطلوب'
          });
        }

        await notificationService.markAsRead(notificationId);

        res.status(200).json({
          success: true,
          message: 'تم تعليم التنبيه كمقروء'
        });
      } catch (error: any) {
        console.error('Error marking notification as read:', error);
        res.status(500).json({
          success: false,
          error: 'فشل في تحديث التنبيه'
        });
      }
      break;

    default:
      res.setHeader('Allow', ['GET', 'PATCH']);
      res.status(405).json({
        success: false,
        error: `الطريقة ${req.method} غير مدعومة`
      });
  }
}