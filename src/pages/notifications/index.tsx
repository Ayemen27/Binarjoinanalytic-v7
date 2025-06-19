import React, { useState, useEffect } from 'react';
import type { NextPage } from 'next';
import Head from 'next/head';
import { Bell, Check, Trash2, Filter, MoreVertical, AlertCircle, Info, CheckCircle, AlertTriangle } from 'lucide-react';

import { Layout } from '@/components/organisms/Layout';
import { ProtectedRoute } from '@/components/organisms/ProtectedRoute';
import { Card } from '@/components/atoms/Card';
import { Button } from '@/components/atoms/Button';
import { Input } from '@/components/atoms/Input';
import { useAuth } from '@/providers/AuthProvider';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';

interface Notification {
  id: string;
  title: string;
  message: string;
  type: 'info' | 'success' | 'warning' | 'error';
  category: 'signal' | 'account' | 'system' | 'trade';
  read: boolean;
  createdAt: string;
  actionUrl?: string;
  data?: Record<string, any>;
}

const NotificationsPage: NextPage = () => {
  const { user } = useAuth();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  
  const supabase = createClientComponentClient();

  useEffect(() => {
    if (user) {
      fetchNotifications();
      // Set up real-time subscription
      const subscription = supabase
        .channel('notifications')
        .on('postgres_changes', 
          { event: '*', schema: 'public', table: 'notifications', filter: `user_id=eq.${user.id}` },
          (payload) => {
            console.log('New notification:', payload);
            if (payload.eventType === 'INSERT') {
              fetchNotifications(); // Refresh notifications
            }
          }
        )
        .subscribe();

      return () => {
        subscription.unsubscribe();
      };
    }
  }, [user]);

  const fetchNotifications = async () => {
    try {
      // For demo purposes, create sample notifications since we don't have a notifications table yet
      const sampleNotifications: Notification[] = [
        {
          id: '1',
          title: 'إشارة جديدة متاحة',
          message: 'تم توليد إشارة جديدة لـ EUR/USD بنسبة ثقة 85%',
          type: 'success',
          category: 'signal',
          read: false,
          createdAt: new Date(Date.now() - 5 * 60 * 1000).toISOString(), // 5 minutes ago
          actionUrl: '/signals/history',
          data: { symbol: 'EUR/USD', confidence: 85 }
        },
        {
          id: '2',
          title: 'إنتهاء إشارة',
          message: 'انتهت صلاحية الإشارة GBP/USD - النتيجة: ربح +$45.50',
          type: 'info',
          category: 'trade',
          read: false,
          createdAt: new Date(Date.now() - 15 * 60 * 1000).toISOString(), // 15 minutes ago
          data: { symbol: 'GBP/USD', result: 'win', profit: 45.50 }
        },
        {
          id: '3',
          title: 'تحديث إعدادات الحساب',
          message: 'تم تحديث إعدادات الإشعارات بنجاح',
          type: 'success',
          category: 'account',
          read: true,
          createdAt: new Date(Date.now() - 60 * 60 * 1000).toISOString(), // 1 hour ago
        },
        {
          id: '4',
          title: 'تحذير: اقتراب انتهاء الاشتراك',
          message: 'ينتهي اشتراكك المميز خلال 3 أيام. قم بالتجديد لمواصلة الاستفادة من الميزات المتقدمة',
          type: 'warning',
          category: 'account',
          read: false,
          createdAt: new Date(Date.now() - 3 * 60 * 60 * 1000).toISOString(), // 3 hours ago
          actionUrl: '/subscription'
        },
        {
          id: '5',
          title: 'خطأ في الاتصال',
          message: 'فشل في تحديث بيانات السوق مؤقتاً. الخدمة عادت للعمل الآن.',
          type: 'error',
          category: 'system',
          read: true,
          createdAt: new Date(Date.now() - 6 * 60 * 60 * 1000).toISOString(), // 6 hours ago
        },
        {
          id: '6',
          title: 'تحليل الأداء الأسبوعي',
          message: 'تم إنشاء تقرير الأداء الأسبوعي. نسبة النجاح: 78% | الربح: +$234.50',
          type: 'info',
          category: 'signal',
          read: true,
          createdAt: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(), // 1 day ago
          actionUrl: '/analytics'
        }
      ];

      setNotifications(sampleNotifications);
    } catch (error) {
      console.error('Error fetching notifications:', error);
    } finally {
      setLoading(false);
    }
  };

  const markAsRead = async (notificationId: string) => {
    setNotifications(prev => 
      prev.map(n => n.id === notificationId ? { ...n, read: true } : n)
    );
    
    try {
      // In a real implementation, update the database
      console.log('Marking notification as read:', notificationId);
    } catch (error) {
      console.error('Error marking notification as read:', error);
    }
  };

  const markAllAsRead = async () => {
    setNotifications(prev => prev.map(n => ({ ...n, read: true })));
    
    try {
      // In a real implementation, update all unread notifications
      console.log('Marking all notifications as read');
    } catch (error) {
      console.error('Error marking all as read:', error);
    }
  };

  const deleteNotification = async (notificationId: string) => {
    setNotifications(prev => prev.filter(n => n.id !== notificationId));
    
    try {
      // In a real implementation, delete from database
      console.log('Deleting notification:', notificationId);
    } catch (error) {
      console.error('Error deleting notification:', error);
    }
  };

  const getIcon = (type: string) => {
    switch (type) {
      case 'success':
        return <CheckCircle className="w-5 h-5 text-success" />;
      case 'warning':
        return <AlertTriangle className="w-5 h-5 text-warning" />;
      case 'error':
        return <AlertCircle className="w-5 h-5 text-destructive" />;
      default:
        return <Info className="w-5 h-5 text-primary" />;
    }
  };

  const getTimeAgo = (date: string) => {
    const now = new Date();
    const notificationDate = new Date(date);
    const diffInMinutes = Math.floor((now.getTime() - notificationDate.getTime()) / (1000 * 60));
    
    if (diffInMinutes < 1) return 'الآن';
    if (diffInMinutes < 60) return `منذ ${diffInMinutes} دقيقة`;
    
    const diffInHours = Math.floor(diffInMinutes / 60);
    if (diffInHours < 24) return `منذ ${diffInHours} ساعة`;
    
    const diffInDays = Math.floor(diffInHours / 24);
    return `منذ ${diffInDays} يوم`;
  };

  const filteredNotifications = notifications.filter(notification => {
    const matchesFilter = filter === 'all' || 
                         (filter === 'unread' && !notification.read) ||
                         (filter === 'read' && notification.read) ||
                         notification.category === filter;
    
    const matchesSearch = searchTerm === '' ||
                         notification.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         notification.message.toLowerCase().includes(searchTerm.toLowerCase());
    
    return matchesFilter && matchesSearch;
  });

  const unreadCount = notifications.filter(n => !n.read).length;

  if (loading) {
    return (
      <ProtectedRoute>
        <Layout showSidebar={true}>
          <div className="p-6 flex items-center justify-center min-h-96">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
              <p className="text-muted-foreground">جاري تحميل الإشعارات...</p>
            </div>
          </div>
        </Layout>
      </ProtectedRoute>
    );
  }

  return (
    <ProtectedRoute>
      <Head>
        <title>الإشعارات - منصة الإشارات</title>
      </Head>

      <Layout showSidebar={true}>
        <div className="p-6 space-y-6">
          {/* Header */}
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-foreground">الإشعارات</h1>
              <p className="text-muted-foreground mt-2">
                مركز الإشعارات والتنبيهات
                {unreadCount > 0 && (
                  <span className="mr-2 px-2 py-1 bg-primary text-primary-foreground text-xs rounded-full">
                    {unreadCount} جديد
                  </span>
                )}
              </p>
            </div>
            
            <div className="flex items-center gap-3">
              {unreadCount > 0 && (
                <Button variant="outline" onClick={markAllAsRead}>
                  <Check className="w-4 h-4 mr-2" />
                  قراءة الكل
                </Button>
              )}
              <Button variant="outline">
                <Bell className="w-4 h-4 mr-2" />
                الإعدادات
              </Button>
            </div>
          </div>

          {/* Filters */}
          <Card className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <Input
                  placeholder="البحث في الإشعارات..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>

              <div>
                <select
                  value={filter}
                  onChange={(e) => setFilter(e.target.value)}
                  className="w-full px-3 py-2 border border-border rounded-md bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                >
                  <option value="all">جميع الإشعارات</option>
                  <option value="unread">غير مقروءة</option>
                  <option value="read">مقروءة</option>
                  <option value="signal">الإشارات</option>
                  <option value="trade">التداول</option>
                  <option value="account">الحساب</option>
                  <option value="system">النظام</option>
                </select>
              </div>

              <div>
                <Button variant="outline" fullWidth leftIcon={<Filter className="w-4 h-4" />}>
                  مرشحات متقدمة
                </Button>
              </div>
            </div>
          </Card>

          {/* Notifications List */}
          <div className="space-y-3">
            {filteredNotifications.length === 0 ? (
              <Card className="p-8 text-center">
                <Bell className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-medium text-foreground mb-2">لا توجد إشعارات</h3>
                <p className="text-muted-foreground">
                  {notifications.length === 0 
                    ? 'لم تستلم أي إشعارات بعد'
                    : 'لا توجد إشعارات مطابقة للمرشحات المحددة'
                  }
                </p>
              </Card>
            ) : (
              filteredNotifications.map((notification) => (
                <Card 
                  key={notification.id} 
                  className={`p-4 transition-all hover:shadow-md ${
                    !notification.read ? 'border-primary/50 bg-primary/5' : ''
                  }`}
                >
                  <div className="flex items-start gap-4">
                    {/* Icon */}
                    <div className="mt-1">
                      {getIcon(notification.type)}
                    </div>

                    {/* Content */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <h3 className={`font-medium ${!notification.read ? 'text-foreground' : 'text-muted-foreground'}`}>
                            {notification.title}
                          </h3>
                          <p className="text-sm text-muted-foreground mt-1 line-clamp-2">
                            {notification.message}
                          </p>
                          
                          {/* Metadata */}
                          <div className="flex items-center gap-4 mt-2">
                            <span className="text-xs text-muted-foreground">
                              {getTimeAgo(notification.createdAt)}
                            </span>
                            <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                              notification.category === 'signal' ? 'bg-primary/10 text-primary' :
                              notification.category === 'trade' ? 'bg-success/10 text-success' :
                              notification.category === 'account' ? 'bg-warning/10 text-warning' :
                              'bg-muted/10 text-muted-foreground'
                            }`}>
                              {
                                notification.category === 'signal' ? 'إشارة' :
                                notification.category === 'trade' ? 'تداول' :
                                notification.category === 'account' ? 'حساب' : 'نظام'
                              }
                            </span>
                            {!notification.read && (
                              <span className="w-2 h-2 bg-primary rounded-full"></span>
                            )}
                          </div>
                        </div>

                        {/* Actions */}
                        <div className="flex items-center gap-2 ml-4">
                          {notification.actionUrl && (
                            <Button 
                              size="sm" 
                              variant="outline"
                              onClick={() => window.location.href = notification.actionUrl!}
                            >
                              عرض
                            </Button>
                          )}
                          
                          {!notification.read && (
                            <Button 
                              size="sm" 
                              variant="ghost"
                              onClick={() => markAsRead(notification.id)}
                            >
                              <Check className="w-4 h-4" />
                            </Button>
                          )}
                          
                          <Button 
                            size="sm" 
                            variant="ghost"
                            onClick={() => deleteNotification(notification.id)}
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </div>
                    </div>
                  </div>
                </Card>
              ))
            )}
          </div>

          {/* Load More */}
          {filteredNotifications.length > 0 && (
            <div className="text-center pt-6">
              <Button variant="outline">
                تحميل المزيد
              </Button>
            </div>
          )}
        </div>
      </Layout>
    </ProtectedRoute>
  );
};

export default NotificationsPage;