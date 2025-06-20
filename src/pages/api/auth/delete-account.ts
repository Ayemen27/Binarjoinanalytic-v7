import type { NextApiRequest, NextApiResponse } from 'next';
import { createClient } from '@supabase/supabase-js';

interface DeleteAccountRequest {
  password: string;
  confirmation: string;
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
  if (req.method !== 'DELETE') {
    return res.status(405).json({
      success: false,
      error: 'Method not allowed'
    });
  }

  try {
    const { password, confirmation }: DeleteAccountRequest = req.body;

    // التحقق من البيانات المطلوبة
    if (!password || !confirmation) {
      return res.status(400).json({
        success: false,
        error: 'Password and confirmation are required'
      });
    }

    // التحقق من نص التأكيد
    if (confirmation !== 'حذف حسابي') {
      return res.status(400).json({
        success: false,
        error: 'Invalid confirmation text'
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

    // منع حذف حسابات المدراء
    const { data: userData } = await supabase
      .from('users')
      .select('roles')
      .eq('id', user.id)
      .single();

    if (userData?.roles?.includes('admin')) {
      return res.status(403).json({
        success: false,
        error: 'Administrator accounts cannot be deleted'
      });
    }

    // تسجيل عملية الحذف في audit log قبل الحذف
    await supabase
      .from('security_logs')
      .insert({
        user_id: user.id,
        action: 'account_deletion_requested',
        ip_address: req.socket.remoteAddress,
        user_agent: req.headers['user-agent'],
        metadata: {
          timestamp: new Date().toISOString(),
          email: user.email
        }
      });

    // حذف البيانات المرتبطة بالمستخدم (cascade delete)
    const deleteOperations = [
      // حذف الإشارات
      supabase.from('signals').delete().eq('user_id', user.id),
      // حذف الجلسات
      supabase.from('user_sessions').delete().eq('user_id', user.id),
      // حذف الأدوار
      supabase.from('user_roles').delete().eq('user_id', user.id),
      // حذف بيانات المستخدم
      supabase.from('users').delete().eq('id', user.id)
    ];

    await Promise.all(deleteOperations);

    // حذف المستخدم من نظام المصادقة
    const { error: deleteError } = await supabase.auth.admin.deleteUser(user.id);

    if (deleteError) {
      console.error('Error deleting user from auth:', deleteError);
      // لا نوقف العملية لأن البيانات تم حذفها
    }

    return res.status(200).json({
      success: true,
      message: 'Account deleted successfully'
    });

  } catch (error) {
    console.error('Delete account error:', error);
    return res.status(500).json({
      success: false,
      error: 'Internal server error'
    });
  }
}