import { useEffect } from "react";
import { AppState, AppStateStatus } from "react-native";
import { useAuth } from "./useAuth";
import { guestDataService } from "../services/guestDataService";

export function useGuestBackup() {
  const { isGuest, currentUserId } = useAuth();

  useEffect(() => {
    if (!isGuest || !currentUserId) return;

    // アプリがバックグラウンドに移行した際にバックアップ
    const handleAppStateChange = async (nextAppState: AppStateStatus) => {
      if (nextAppState === "background" || nextAppState === "inactive") {
        try {
          await guestDataService.backupGuestData(currentUserId);
        } catch (error) {
          console.error("Failed to backup guest data:", error);
        }
      }
    };

    const subscription = AppState.addEventListener(
      "change",
      handleAppStateChange
    );

    // 定期バックアップ（5分間隔）
    const interval = setInterval(async () => {
      try {
        await guestDataService.backupGuestData(currentUserId);
      } catch (error) {
        console.error("Failed to backup guest data:", error);
      }
    }, 5 * 60 * 1000); // 5分

    return () => {
      subscription?.remove();
      clearInterval(interval);
    };
  }, [isGuest, currentUserId]);
}
