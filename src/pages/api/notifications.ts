import type { NextApiRequest, NextApiResponse } from 'next';

interface Notification {
  id: string;
  type: 'signal' | 'system' | 'account' | 'admin';
  title: string;
  message: string;
  isRead: boolean;
  isImportant: boolean;
  createdAt: string;
  metadata?: {
    signalId?: string;
    userId?: string;
    actionUrl?: string;
  };
}

interface ApiResponse {
  success: boolean;
  data?: Notification | Notification[] | { notifications: Notification[], total: number, unread: number };
  error?: string;
  message?: string;
}

// محاكاة قاعدة بيانات في الذاكرة
let notificationsDB: Notification[] = [
  {
    id: '1',
    type: 'signal',
    title: 'إشارة جديدة متاحة',
    message: 'تم توليد إشارة جديدة لزوج EUR/USD بثقة 89%',
    isRead: false,
    isImportant: true,
    createdAt: new Date(Date.now() - 1000 * 60 * 30).toISOString(), // 30 minutes ago
    metadata: { signalId: 'sig_123', actionUrl: '/signals/history' }
  },
  {
    id: '2',
    type: 'system',
    title: 'تحديث النظام',
    message: 'تم تحديث النظام بنجاح وإضافة ميزات جديدة',
    isRead: false,
    isImportant: false,
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 2).toISOString(), // 2 hours ago
  },
  {
    id: '3',
    type: 'account',
    title: 'تم تسجيل دخول جديد',
    message: 'تم تسجيل دخول جديد لحسابك من جهاز غير معروف',
    isRead: true,
    isImportant: true,
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 5).toISOString(), // 5 hours ago
  },
  {
    id: '4',
    type: 'signal',
    title: 'إشارة مكتملة',
    message: 'تم إغلاق إشارة GBP/USD بربح 85 نقطة',
    isRead: true,
    isImportant: false,
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24).toISOString(), // 1 day ago
    metadata: { signalId: 'sig_122', actionUrl: '/signals/history' }
  }
];

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
        return handleGetNotifications(req, res);
      case 'POST':
        return handleCreateNotification(req, res);
      case 'PUT':
        return handleUpdateNotification(req, res);
      case 'DELETE':
        return handleDeleteNotification(req, res);
      default:
        return res.status(405).json({
          success: false,
          error: 'Method not allowed'
        });
    }
  } catch (error) {
    console.error('Notifications API Error:', error);
    return res.status(500).json({
      success: false,
      error: 'Internal server error'
    });
  }
}

function handleGetNotifications(req: NextApiRequest, res: NextApiResponse<ApiResponse>) {
  const { 
    id, 
    type, 
    isRead, 
    isImportant,
    limit = '50',
    offset = '0'
  } = req.query;

  // إذا كان ID محدد، إرجاع إشعار واحد
  if (id) {
    const notification = notificationsDB.find(n => n.id === id);
    if (!notification) {
      return res.status(404).json({
        success: false,
        error: 'Notification not found'
      });
    }
    return res.status(200).json({
      success: true,
      data: notification
    });
  }

  let filteredNotifications = [...notificationsDB];

  // فلترة حسب النوع
  if (type) {
    filteredNotifications = filteredNotifications.filter(n => n.type === type);
  }

  // فلترة حسب حالة القراءة
  if (isRead !== undefined) {
    const readStatus = isRead === 'true';
    filteredNotifications = filteredNotifications.filter(n => n.isRead === readStatus);
  }

  // فلترة حسب الأهمية
  if (isImportant !== undefined) {
    const importantStatus = isImportant === 'true';
    filteredNotifications = filteredNotifications.filter(n => n.isImportant === importantStatus);
  }

  // ترتيب حسب التاريخ (الأحدث أولاً)
  filteredNotifications.sort((a, b) => 
    new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  );

  // تقسيم الصفحات
  const limitNum = parseInt(limit as string);
  const offsetNum = parseInt(offset as string);
  const paginatedNotifications = filteredNotifications.slice(offsetNum, offsetNum + limitNum);

  // حساب عدد الإشعارات غير المقروءة
  const unreadCount = notificationsDB.filter(n => !n.isRead).length;

  return res.status(200).json({
    success: true,
    data: {
      notifications: paginatedNotifications,
      total: filteredNotifications.length,
      unread: unreadCount
    }
  });
}

function handleCreateNotification(req: NextApiRequest, res: NextApiResponse<ApiResponse>) {
  const notificationData = req.body;

  // التحقق من البيانات المطلوبة
  if (!notificationData.title || !notificationData.message) {
    return res.status(400).json({
      success: false,
      error: 'Title and message are required'
    });
  }

  // إنشاء إشعار جديد
  const newNotification: Notification = {
    id: generateNotificationId(),
    type: notificationData.type || 'system',
    title: notificationData.title,
    message: notificationData.message,
    isRead: false,
    isImportant: notificationData.isImportant || false,
    createdAt: new Date().toISOString(),
    metadata: notificationData.metadata
  };

  // حفظ في قاعدة البيانات المؤقتة
  notificationsDB.unshift(newNotification); // إضافة في المقدمة

  // الحفاظ على عدد محدود من الإشعارات (1000 إشعار كحد أقصى)
  if (notificationsDB.length > 1000) {
    notificationsDB = notificationsDB.slice(0, 1000);
  }

  return res.status(201).json({
    success: true,
    data: newNotification,
    message: 'Notification created successfully'
  });
}

function handleUpdateNotification(req: NextApiRequest, res: NextApiResponse<ApiResponse>) {
  const { id } = req.query;
  const updateData = req.body;

  if (!id) {
    return res.status(400).json({
      success: false,
      error: 'Notification ID is required'
    });
  }

  const notificationIndex = notificationsDB.findIndex(n => n.id === id);
  if (notificationIndex === -1) {
    return res.status(404).json({
      success: false,
      error: 'Notification not found'
    });
  }

  // تحديث الإشعار
  notificationsDB[notificationIndex] = {
    ...notificationsDB[notificationIndex],
    ...updateData,
    id: notificationsDB[notificationIndex].id, // الحفاظ على ID الأصلي
    createdAt: notificationsDB[notificationIndex].createdAt // الحفاظ على تاريخ الإنشاء
  };

  return res.status(200).json({
    success: true,
    data: notificationsDB[notificationIndex],
    message: 'Notification updated successfully'
  });
}

function handleDeleteNotification(req: NextApiRequest, res: NextApiResponse<ApiResponse>) {
  const { id } = req.query;

  if (!id) {
    return res.status(400).json({
      success: false,
      error: 'Notification ID is required'
    });
  }

  const notificationIndex = notificationsDB.findIndex(n => n.id === id);
  if (notificationIndex === -1) {
    return res.status(404).json({
      success: false,
      error: 'Notification not found'
    });
  }

  // حذف الإشعار
  const deletedNotification = notificationsDB.splice(notificationIndex, 1)[0];

  return res.status(200).json({
    success: true,
    data: deletedNotification,
    message: 'Notification deleted successfully'
  });
}

// دوال مساعدة
function generateNotificationId(): string {
  return `notif_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
}