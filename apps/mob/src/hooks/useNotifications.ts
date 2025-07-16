import { useEffect, useState, useRef } from 'react';
import { Platform } from 'react-native';

// Expo GO用のモック実装
// 実際のプッシュ通知機能は開発ビルドでのみ利用可能

export function useNotifications() {
  const [expoPushToken, setExpoPushToken] = useState<string>('');
  const [notification, setNotification] = useState<any>(null);

  useEffect(() => {
    // Expo GOでは通知機能は無効
    // 通知機能はExpo GOでは無効
  }, []);

  // モック関数
  const scheduleNotification = async (
    title: string,
    body: string,
    triggerSeconds: number = 5
  ) => {
    // Expo GOでは実際の通知は送信されません
  };

  const scheduleDailyReminder = async (hour: number, minute: number) => {
    // Expo GOでは実際の通知は送信されません
  };

  const cancelAllNotifications = async () => {
    // Expo GOでは実際の通知は送信されません
  };

  return {
    expoPushToken,
    notification,
    scheduleNotification,
    scheduleDailyReminder,
    cancelAllNotifications,
  };
}