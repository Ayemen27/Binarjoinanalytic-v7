import type { NextApiRequest, NextApiResponse } from 'next';
import { authenticator } from 'otplib';

interface Verify2FARequest {
  secret: string;
  code: string;
}

interface ApiResponse {
  success: boolean;
  message?: string;
  error?: string;
  backupCodes?: string[];
}

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
    const { secret, code }: Verify2FARequest = req.body;

    // التحقق من البيانات المطلوبة
    if (!secret || !code) {
      return res.status(400).json({
        success: false,
        error: 'Secret and verification code are required'
      });
    }

    // التحقق من صحة الكود
    const isValid = authenticator.verify({
      token: code,
      secret: secret
    });

    if (!isValid) {
      return res.status(400).json({
        success: false,
        error: 'Invalid verification code'
      });
    }

    // توليد رموز النسخ الاحتياطية
    const backupCodes = Array.from({ length: 8 }, () => 
      Math.random().toString(36).substring(2, 10).toUpperCase()
    );

    return res.status(200).json({
      success: true,
      message: '2FA verified successfully',
      backupCodes
    });

  } catch (error) {
    console.error('2FA verification error:', error);
    return res.status(500).json({
      success: false,
      error: 'Internal server error'
    });
  }
}