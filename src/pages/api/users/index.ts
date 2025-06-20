import type { NextApiRequest, NextApiResponse } from 'next';
import { userService } from '@/lib/database';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method === 'GET') {
    try {
      const users = await userService.getAllUsers();
      res.status(200).json({ 
        success: true, 
        data: users,
        count: users.length 
      });
    } catch (error: any) {
      console.error('Error in /api/users:', error);
      res.status(500).json({ 
        success: false, 
        error: 'فشل في جلب بيانات المستخدمين' 
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