import type { NextApiRequest, NextApiResponse } from 'next';

interface User {
  id: string;
  email: string;
  fullName: string;
  avatar?: string;
  roles: string[];
  status: 'active' | 'inactive' | 'suspended';
  lastLogin?: string;
  signalsCount: number;
  successRate: number;
  createdAt: string;
  metadata: {
    country?: string;
    timezone?: string;
    language?: string;
    phone?: string;
  };
}

interface ApiResponse {
  success: boolean;
  data?: User | User[] | { users: User[], total: number, page: number, limit: number };
  error?: string;
  message?: string;
}

// محاكاة قاعدة بيانات في الذاكرة
let usersDB: User[] = [
  {
    id: '1',
    email: 'admin@signals.com',
    fullName: 'مدير النظام',
    roles: ['admin'],
    status: 'active',
    lastLogin: '2024-12-20T10:30:00Z',
    signalsCount: 0,
    successRate: 0,
    createdAt: '2024-01-01T00:00:00Z',
    metadata: { country: 'SA', timezone: 'Asia/Riyadh', language: 'ar' }
  },
  {
    id: '2',
    email: 'trader1@example.com',
    fullName: 'أحمد محمد',
    roles: ['trader'],
    status: 'active',
    lastLogin: '2024-12-20T09:15:00Z',
    signalsCount: 156,
    successRate: 87.5,
    createdAt: '2024-03-15T00:00:00Z',
    metadata: { country: 'SA', timezone: 'Asia/Riyadh', language: 'ar', phone: '+966501234567' }
  },
  {
    id: '3',
    email: 'mod@signals.com',
    fullName: 'سارة أحمد',
    roles: ['moderator'],
    status: 'active',
    lastLogin: '2024-12-20T08:45:00Z',
    signalsCount: 45,
    successRate: 92.3,
    createdAt: '2024-02-10T00:00:00Z',
    metadata: { country: 'AE', timezone: 'Asia/Dubai', language: 'ar', phone: '+971501234567' }
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
        return handleGetUsers(req, res);
      case 'POST':
        return handleCreateUser(req, res);
      case 'PUT':
        return handleUpdateUser(req, res);
      case 'DELETE':
        return handleDeleteUser(req, res);
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

function handleGetUsers(req: NextApiRequest, res: NextApiResponse<ApiResponse>) {
  const { 
    id, 
    page = '1', 
    limit = '10', 
    search, 
    role, 
    status,
    sortBy = 'createdAt',
    sortOrder = 'desc'
  } = req.query;

  // إذا كان ID محدد، إرجاع مستخدم واحد
  if (id) {
    const user = usersDB.find(u => u.id === id);
    if (!user) {
      return res.status(404).json({
        success: false,
        error: 'User not found'
      });
    }
    return res.status(200).json({
      success: true,
      data: user
    });
  }

  let filteredUsers = [...usersDB];

  // فلترة حسب البحث
  if (search) {
    const searchTerm = (search as string).toLowerCase();
    filteredUsers = filteredUsers.filter(user =>
      user.fullName.toLowerCase().includes(searchTerm) ||
      user.email.toLowerCase().includes(searchTerm)
    );
  }

  // فلترة حسب الدور
  if (role) {
    filteredUsers = filteredUsers.filter(user =>
      user.roles.includes(role as string)
    );
  }

  // فلترة حسب الحالة
  if (status) {
    filteredUsers = filteredUsers.filter(user =>
      user.status === status
    );
  }

  // ترتيب
  filteredUsers.sort((a, b) => {
    const aValue = a[sortBy as keyof User];
    const bValue = b[sortBy as keyof User];
    
    if (sortOrder === 'asc') {
      return aValue < bValue ? -1 : aValue > bValue ? 1 : 0;
    } else {
      return aValue > bValue ? -1 : aValue < bValue ? 1 : 0;
    }
  });

  // تقسيم الصفحات
  const pageNum = parseInt(page as string);
  const limitNum = parseInt(limit as string);
  const startIndex = (pageNum - 1) * limitNum;
  const endIndex = startIndex + limitNum;
  
  const paginatedUsers = filteredUsers.slice(startIndex, endIndex);

  return res.status(200).json({
    success: true,
    data: {
      users: paginatedUsers,
      total: filteredUsers.length,
      page: pageNum,
      limit: limitNum
    }
  });
}

function handleCreateUser(req: NextApiRequest, res: NextApiResponse<ApiResponse>) {
  const userData = req.body;

  // التحقق من البيانات المطلوبة
  if (!userData.email || !userData.fullName) {
    return res.status(400).json({
      success: false,
      error: 'Missing required fields: email and fullName'
    });
  }

  // التحقق من عدم تكرار البريد الإلكتروني
  if (usersDB.find(u => u.email === userData.email)) {
    return res.status(400).json({
      success: false,
      error: 'Email already exists'
    });
  }

  // إنشاء مستخدم جديد
  const newUser: User = {
    id: generateUserId(),
    email: userData.email,
    fullName: userData.fullName,
    avatar: userData.avatar,
    roles: userData.roles || ['trader'],
    status: userData.status || 'active',
    signalsCount: 0,
    successRate: 0,
    createdAt: new Date().toISOString(),
    metadata: {
      country: userData.country,
      timezone: userData.timezone || 'Asia/Riyadh',
      language: userData.language || 'ar',
      phone: userData.phone
    }
  };

  // حفظ في قاعدة البيانات المؤقتة
  usersDB.push(newUser);

  return res.status(201).json({
    success: true,
    data: newUser,
    message: 'User created successfully'
  });
}

function handleUpdateUser(req: NextApiRequest, res: NextApiResponse<ApiResponse>) {
  const { id } = req.query;
  const updateData = req.body;

  if (!id) {
    return res.status(400).json({
      success: false,
      error: 'User ID is required'
    });
  }

  const userIndex = usersDB.findIndex(u => u.id === id);
  if (userIndex === -1) {
    return res.status(404).json({
      success: false,
      error: 'User not found'
    });
  }

  // التحقق من عدم تكرار البريد الإلكتروني
  if (updateData.email && updateData.email !== usersDB[userIndex].email) {
    if (usersDB.find(u => u.email === updateData.email)) {
      return res.status(400).json({
        success: false,
        error: 'Email already exists'
      });
    }
  }

  // تحديث المستخدم
  usersDB[userIndex] = {
    ...usersDB[userIndex],
    ...updateData,
    id: usersDB[userIndex].id, // الحفاظ على ID الأصلي
    createdAt: usersDB[userIndex].createdAt, // الحفاظ على تاريخ الإنشاء
    metadata: {
      ...usersDB[userIndex].metadata,
      ...updateData.metadata
    }
  };

  return res.status(200).json({
    success: true,
    data: usersDB[userIndex],
    message: 'User updated successfully'
  });
}

function handleDeleteUser(req: NextApiRequest, res: NextApiResponse<ApiResponse>) {
  const { id } = req.query;

  if (!id) {
    return res.status(400).json({
      success: false,
      error: 'User ID is required'
    });
  }

  const userIndex = usersDB.findIndex(u => u.id === id);
  if (userIndex === -1) {
    return res.status(404).json({
      success: false,
      error: 'User not found'
    });
  }

  // منع حذف المدير الأساسي
  if (usersDB[userIndex].roles.includes('admin') && usersDB[userIndex].email === 'admin@signals.com') {
    return res.status(403).json({
      success: false,
      error: 'Cannot delete system administrator'
    });
  }

  // حذف المستخدم
  const deletedUser = usersDB.splice(userIndex, 1)[0];

  return res.status(200).json({
    success: true,
    data: deletedUser,
    message: 'User deleted successfully'
  });
}

// دوال مساعدة
function generateUserId(): string {
  return `user_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
}