import React, { useState, useEffect } from 'react';
import type { NextPage } from 'next';
import Head from 'next/head';
import { Bell, Check, X, Trash2, Filter, Search, AlertCircle, TrendingUp, Users, Settings, Eye } from 'lucide-react';

import { Layout } from '@/components/organisms/Layout';
import { ProtectedRoute } from '@/components/organisms/ProtectedRoute';
import { Card } from '@/components/atoms/Card';
import { Button } from '@/components/atoms/Button';
import { Input } from '@/components/atoms/Input';
import { useToast } from '@/hooks/useToast';

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

const mockNotifications: Notification[] = [
  {
    id: '1',
    type: 'signal',
    title: 'إشارة جديدة متاحة',
    message: 'تم توليد إشارة جديدة لزوج EUR/USD بثقة 89%',
    isRead: false,
    isImportant: true,
    createdAt: '2024-12-20T10:30:00Z',
    metadata: { signalId: 'sig_123', actionUrl: '/signals/history' }
  },
  {
    id: '2',
    type: 'system',
    title: 'تحديث النظام',
    message: 'تم تحديث النظام بنجاح وإضافة ميزات جديدة',
    isRead: false,
    isImportant: false,
    createdAt: '2024-12-20T09:15:00Z'
  },
  {
    id: '3',
    type: 'account',
    title: 'تم تسجيل دخول جديد',
    message: 'تم تسجيل دخول جديد لحسابك من جهاز غير معروف',
    isRead: true,
    isImportant: true,
    createdAt: '2024-12-20T08:45:00Z'
  },
  {
    id: '4',
    type: 'signal',
    title: 'إشارة مكتملة',
    message: 'تم إغلاق إشارة GBP/USD بربح 85 نقطة',
    isRead: true,
    isImportant: false,
    createdAt: '2024-12-19T16:20:00Z',
    metadata: { signalId: 'sig_122', actionUrl: '/signals/history' }
  },
  {
    id: '5',
    type: 'admin',
    title: 'مستخدم جديد',
    message: 'انضم مستخدم جديد للمنصة',
    isRead: false,
    isImportant: false,
    createdAt: '2024-12-19T14:30:00Z',
    metadata: { userId: 'user_456', actionUrl: '/admin/users' }
  }
];

const NotificationsPage: NextPage = () => {
  const [notifications, setNotifications] = useState<Notification[]>(mockNotifications);
  const [filteredNotifications, setFilteredNotifications] = useState<Notification[]>(mockNotifications);
  const [searchTerm, setSearchTerm] = useState('');
  const [typeFilter, setTypeFilter] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [selectedNotifications, setSelectedNotifications] = useState<string[]>([]);
  const { toast } = useToast();

  useEffect(() => {
    let filtered = notifications;

    if (searchTerm) {
      filtered = filtered.filter(notification =>
        notification.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        notification.message.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    if (typeFilter !== 'all') {
      filtered = filtered.filter(notification => notification.type === typeFilter);
    }

    if (statusFilter !== 'all') {
      if (statusFilter === 'unread') {
        filtered = filtered.filter(notification => !notification.isRead);
      } else if (statusFilter === 'read') {
        filtered = filtered.filter(notification => notification.isRead);
      } else if (statusFilter === 'important') {
        filtered = filtered.filter(notification => notification.isImportant);
      }
    }

    setFilteredNotifications(filtered);
  }, [notifications, searchTerm, typeFilter, statusFilter]);

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'signal':
        return TrendingUp;
      case 'system':
        return Settings;
      case 'account':
        return Users;
      case 'admin':
        return AlertCircle;
      default:
        return Bell;
    }
  };

  const getNotificationColor = (type: string) => {
    switch (type) {
      case 'signal':
        return 'text-primary bg-primary/10';
      case 'system':
        return 'text-warning bg-warning/10';
      case 'account':
        return 'text-success bg-success/10';
      case 'admin':
        return 'text-destructive bg-destructive/10';
      default:
        return 'text-muted-foreground bg-muted/10';
    }
  };

  const getTypeDisplayName = (type: string) => {
    switch (type) {
      case 'signal':
        return 'إشارة';
      case 'system':
        return 'نظام';
      case 'account':
        return 'حساب';
      case 'admin':
        return 'إدارة';
      default:
        return 'عام';
    }
  };

  const formatDate = (dateString: string) => {
    return new Intl.DateTimeFormat('ar-SA', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    }).format(new Date(dateString));
  };

  const markAsRead = (notificationId: string) => {
    setNotifications(prev =>
      prev.map(notification =>
        notification.id === notificationId
          ? { ...notification, isRead: true }
          : notification
      )
    );
  };

  const markAsUnread = (notificationId: string) => {
    setNotifications(prev =>
      prev.map(notification =>
        notification.id === notificationId
          ? { ...notification, isRead: false }
          : notification
      )
    );
  };

  const deleteNotification = (notificationId: string) => {
    setNotifications(prev =>
      prev.filter(notification => notification.id !== notificationId)
    );
    toast({
      title: 'تم الحذف',
      description: 'تم حذف التنبيه بنجاح',
      variant: 'success',
    });
  };

  const markAllAsRead = () => {
    setNotifications(prev =>
      prev.map(notification => ({ ...notification, isRead: true }))
    );
    toast({
      title: 'تم التحديث',
      description: 'تم تعليم جميع التنبيهات كمقروءة',
      variant: 'success',
    });
  };

  const deleteSelected = () => {
    if (selectedNotifications.length === 0) return;

    setNotifications(prev =>
      prev.filter(notification => !selectedNotifications.includes(notification.id))
    );
    setSelectedNotifications([]);
    toast({
      title: 'تم الحذف',
      description: `تم حذف ${selectedNotifications.length} تنبيه`,
      variant: 'success',
    });
  };

  const toggleSelection = (notificationId: string) => {
    setSelectedNotifications(prev =>
      prev.includes(notificationId)
        ? prev.filter(id => id !== notificationId)
        : [...prev, notificationId]
    );
  };

  const selectAll = () => {
    setSelectedNotifications(filteredNotifications.map(n => n.id));
  };

  const clearSelection = () => {
    setSelectedNotifications([]);
  };

  const calculateStats = () => {
    const total = notifications.length;
    const unread = notifications.filter(n => !n.isRead).length;
    const important = notifications.filter(n => n.isImportant).length;
    const today = notifications.filter(n => {
      const notificationDate = new Date(n.createdAt);
      const today = new Date();
      return notificationDate.toDateString() === today.toDateString();
    }).length;

    return { total, unread, important, today };
  };

  const stats = calculateStats();

  const handleNotificationClick = (notification: Notification) => {
    if (!notification.isRead) {
      markAsRead(notification.id);
    }

    if (notification.metadata?.actionUrl) {
      window.location.href = notification.metadata.actionUrl;
    }
  };

  return (
    <ProtectedRoute>
      <Head>
        <title>التنبيهات - منصة الإشارات</title>
        <meta name="description" content="مركز التنبيهات والإشعارات" />
      </Head>

      <Layout showSidebar={true}>
        <div className="p-6 space-y-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-foreground">التنبيهات</h1>
              <p className="text-muted-foreground mt-2">
                مركز الإشعارات والتنبيهات الخاصة بك
              </p>
            </div>
            <div className="flex space-x-3 space-x-reverse">
              {selectedNotifications.length > 0 && (
                <Button
                  variant="destructive"
                  onClick={deleteSelected}
                  leftIcon={<Trash2 className="w-4 h-4" />}
                >
                  حذف المحدد ({selectedNotifications.length})
                </Button>
              )}
              <Button
                variant="outline"
                onClick={markAllAsRead}
                leftIcon={<Check className="w-4 h-4" />}
              >
                تعليم الكل كمقروء
              </Button>
            </div>
          </div>

          {/* إحصائيات سريعة */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <Card className="p-4 text-center">
              <Bell className="w-6 h-6 text-primary mx-auto mb-2" />
              <div className="text-xl font-bold text-foreground">{stats.total}</div>
              <div className="text-sm text-muted-foreground">إجمالي التنبيهات</div>
            </Card>
            <Card className="p-4 text-center">
              <div className="w-6 h-6 text-warning mx-auto mb-2">📨</div>
              <div className="text-xl font-bold text-foreground">{stats.unread}</div>
              <div className="text-sm text-muted-foreground">غير مقروءة</div>
            </Card>
            <Card className="p-4 text-center">
              <AlertCircle className="w-6 h-6 text-destructive mx-auto mb-2" />
              <div className="text-xl font-bold text-foreground">{stats.important}</div>
              <div className="text-sm text-muted-foreground">مهمة</div>
            </Card>
            <Card className="p-4 text-center">
              <div className="w-6 h-6 text-success mx-auto mb-2">📅</div>
              <div className="text-xl font-bold text-foreground">{stats.today}</div>
              <div className="text-sm text-muted-foreground">اليوم</div>
            </Card>
          </div>

          {/* فلاتر البحث */}
          <Card className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div>
                <Input
                  placeholder="البحث في التنبيهات..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  leftIcon={<Search className="w-4 h-4" />}
                />
              </div>
              <div>
                <select
                  value={typeFilter}
                  onChange={(e) => setTypeFilter(e.target.value)}
                  className="w-full px-3 py-2 border border-border rounded-md bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                >
                  <option value="all">جميع الأنواع</option>
                  <option value="signal">إشارات</option>
                  <option value="system">نظام</option>
                  <option value="account">حساب</option>
                  <option value="admin">إدارة</option>
                </select>
              </div>
              <div>
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="w-full px-3 py-2 border border-border rounded-md bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                >
                  <option value="all">جميع الحالات</option>
                  <option value="unread">غير مقروءة</option>
                  <option value="read">مقروءة</option>
                  <option value="important">مهمة</option>
                </select>
              </div>
              <div className="flex space-x-2 space-x-reverse">
                {selectedNotifications.length > 0 ? (
                  <Button variant="outline" onClick={clearSelection}>
                    إلغاء التحديد
                  </Button>
                ) : (
                  <Button variant="outline" onClick={selectAll}>
                    تحديد الكل
                  </Button>
                )}
              </div>
            </div>
          </Card>

          {/* قائمة التنبيهات */}
          <div className="space-y-4">
            {filteredNotifications.map((notification) => {
              const NotificationIcon = getNotificationIcon(notification.type);
              return (
                <Card 
                  key={notification.id} 
                  className={`p-4 transition-all hover:shadow-md cursor-pointer ${
                    !notification.isRead ? 'border-l-4 border-l-primary bg-primary/5' : ''
                  } ${
                    selectedNotifications.includes(notification.id) ? 'ring-2 ring-primary' : ''
                  }`}
                  onClick={() => handleNotificationClick(notification)}
                >
                  <div className="flex items-start space-x-4 space-x-reverse">
                    <div className="flex items-center space-x-3 space-x-reverse">
                      <input
                        type="checkbox"
                        checked={selectedNotifications.includes(notification.id)}
                        onChange={(e) => {
                          e.stopPropagation();
                          toggleSelection(notification.id);
                        }}
                        className="w-4 h-4 text-primary focus:ring-primary border-border rounded"
                      />
                      <div className={`p-2 rounded-full ${getNotificationColor(notification.type)}`}>
                        <NotificationIcon className="w-5 h-5" />
                      </div>
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center space-x-2 space-x-reverse mb-1">
                            <h3 className={`text-sm font-medium ${!notification.isRead ? 'text-foreground font-semibold' : 'text-foreground'}`}>
                              {notification.title}
                            </h3>
                            {notification.isImportant && (
                              <span className="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-destructive/10 text-destructive">
                                مهم
                              </span>
                            )}
                            <span className="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-muted/30 text-muted-foreground">
                              {getTypeDisplayName(notification.type)}
                            </span>
                          </div>
                          <p className="text-sm text-muted-foreground mb-2">
                            {notification.message}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            {formatDate(notification.createdAt)}
                          </p>
                        </div>

                        <div className="flex items-center space-x-2 space-x-reverse">
                          {notification.metadata?.actionUrl && (
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={(e) => {
                                e.stopPropagation();
                                window.location.href = notification.metadata!.actionUrl!;
                              }}
                            >
                              <Eye className="w-4 h-4" />
                            </Button>
                          )}
                          
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={(e) => {
                              e.stopPropagation();
                              notification.isRead 
                                ? markAsUnread(notification.id)
                                : markAsRead(notification.id);
                            }}
                          >
                            {notification.isRead ? (
                              <X className="w-4 h-4" />
                            ) : (
                              <Check className="w-4 h-4" />
                            )}
                          </Button>

                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={(e) => {
                              e.stopPropagation();
                              deleteNotification(notification.id);
                            }}
                            className="text-destructive hover:text-destructive"
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </div>
                    </div>
                  </div>
                </Card>
              );
            })}
          </div>

          {filteredNotifications.length === 0 && (
            <Card className="p-12 text-center">
              <Bell className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-medium text-foreground mb-2">
                لا توجد تنبيهات
              </h3>
              <p className="text-muted-foreground">
                {searchTerm || typeFilter !== 'all' || statusFilter !== 'all' 
                  ? 'لا توجد تنبيهات تطابق معايير البحث المحددة'
                  : 'ستظهر التنبيهات هنا عند توفرها'
                }
              </p>
            </Card>
          )}
        </div>
      </Layout>
    </ProtectedRoute>
  );
};

export default NotificationsPage;