import type { NextApiRequest, NextApiResponse } from 'next';
import { createClient } from '@supabase/supabase-js';

interface ChangePasswordRequest {
  currentPassword: string;
  newPassword: string;
}

interface ApiResponse {
  success: boolean;
  message?: string;
  error?: string;
}

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<ApiResponse>
) {
  if (req.method !== 'POST') {
    return res.status(405).json({
      success: false,
      error: 'Method not allowed'
    });
  }

  try {
    const { currentPassword, newPassword }: ChangePasswordRequest = req.body;

    // التحقق من البيانات المطلوبة
    if (!currentPassword || !newPassword) {
      return res.status(400).json({
        success: false,
        error: 'Current password and new password are required'
      });
    }

    // التحقق من قوة كلمة المرور الجديدة
    if (newPassword.length < 8) {
      return res.status(400).json({
        success: false,
        error: 'New password must be at least 8 characters long'
      });
    }

    // الحصول على JWT token من headers
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({
        success: false,
        error: 'Authentication required'
      });
    }

    const token = authHeader.split(' ')[1];

    // التحقق من صحة Token والحصول على بيانات المستخدم
    const { data: { user }, error: userError } = await supabase.auth.getUser(token);
    
    if (userError || !user) {
      return res.status(401).json({
        success: false,
        error: 'Invalid or expired token'
      });
    }

    // تحديث كلمة المرور
    const { error: updateError } = await supabase.auth.updateUser({
      password: newPassword
    });

    if (updateError) {
      return res.status(400).json({
        success: false,
        error: updateError.message
      });
    }

    // تسجيل عملية تغيير كلمة المرور في audit log
    await supabase
      .from('security_logs')
      .insert({
        user_id: user.id,
        action: 'password_changed',
        ip_address: req.socket.remoteAddress,
        user_agent: req.headers['user-agent'],
        metadata: {
          timestamp: new Date().toISOString(),
          success: true
        }
      });

    return res.status(200).json({
      success: true,
      message: 'Password updated successfully'
    });

  } catch (error) {
    console.error('Change password error:', error);
    return res.status(500).json({
      success: false,
      error: 'Internal server error'
    });
  }
}