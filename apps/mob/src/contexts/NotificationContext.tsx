import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../hooks/useAuth';

interface Notification {
  id: string;
  title: string;
  message: string;
  type: "app" | "facility" | "achievement" | "reminder";
  category: string;
  isRead: boolean;
  createdAt: string;
  facilityName?: string;
  metadata?: any;
}

interface NotificationContextType {
  notifications: Notification[];
  unreadCount: number;
  loading: boolean;
  refreshing: boolean;
  fetchNotifications: () => Promise<void>;
  markAsRead: (id: string) => Promise<void>;
  onRefresh: () => Promise<void>;
}

const NotificationContext = createContext<NotificationContextType | undefined>(undefined);

interface NotificationProviderProps {
  children: ReactNode;
}

export const NotificationProvider: React.FC<NotificationProviderProps> = ({ children }) => {
  const { session } = useAuth();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchNotifications = async () => {
    if (!session?.user?.id) {
      setNotifications([]);
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('notifications')
        .select('*')
        .eq('user_id', session.user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;

      const formattedNotifications = (data || []).map(notification => ({
        id: notification.id,
        title: notification.title,
        message: notification.message,
        type: notification.type,
        category: notification.category,
        isRead: notification.is_read,
        createdAt: notification.created_at,
        facilityName: notification.facility_name,
        metadata: notification.metadata,
      }));

      setNotifications(formattedNotifications);
    } catch (error) {
      console.error('Error fetching notifications:', error);
      setNotifications([]);
    } finally {
      setLoading(false);
    }
  };

  const markAsRead = async (id: string) => {
    try {
      // ローカル状態を即座に更新
      setNotifications((prev) =>
        prev.map((notification) =>
          notification.id === id
            ? { ...notification, isRead: true }
            : notification
        )
      );

      // データベースを更新
      const { error } = await supabase
        .from('notifications')
        .update({ is_read: true })
        .eq('id', id);

      if (error) throw error;
    } catch (error) {
      console.error('Error marking notification as read:', error);
      // エラー時は状態を元に戻す
      await fetchNotifications();
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchNotifications();
    setRefreshing(false);
  };

  useEffect(() => {
    fetchNotifications();
  }, [session]);

  const unreadCount = notifications.filter((n) => !n.isRead).length;

  const value: NotificationContextType = {
    notifications,
    unreadCount,
    loading,
    refreshing,
    fetchNotifications,
    markAsRead,
    onRefresh,
  };

  return (
    <NotificationContext.Provider value={value}>
      {children}
    </NotificationContext.Provider>
  );
};

export const useNotifications = (): NotificationContextType => {
  const context = useContext(NotificationContext);
  if (context === undefined) {
    throw new Error('useNotifications must be used within a NotificationProvider');
  }
  return context;
};