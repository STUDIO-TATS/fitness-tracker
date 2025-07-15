import { useEffect, useState, useRef } from 'react';
import { Platform } from 'react-native';

// Expo GO用のモック実装
// 実際のプッシュ通知機能は開発ビルドでのみ利用可能

export function useNotifications() {
  const [expoPushToken, setExpoPushToken] = useState<string>('');
  const [notification, setNotification] = useState<any>(null);

  useEffect(() => {
    // Expo GOでは通知機能は無効
    console.log('通知機能はExpo GOでは無効です。開発ビルドを使用してください。');
  }, []);

  // モック関数
  const scheduleNotification = async (
    title: string,
    body: string,
    triggerSeconds: number = 5
  ) => {
    console.log(`通知予定: ${title} - ${body} (${triggerSeconds}秒後)`);
    // Expo GOでは実際の通知は送信されません
  };

  const scheduleDailyReminder = async (hour: number, minute: number) => {
    console.log(`毎日のリマインダー設定: ${hour}:${minute}`);
    // Expo GOでは実際の通知は送信されません
  };

  const cancelAllNotifications = async () => {
    console.log('すべての通知をキャンセル');
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