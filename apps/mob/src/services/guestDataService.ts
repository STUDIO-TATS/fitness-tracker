import AsyncStorage from '@react-native-async-storage/async-storage';
import { supabase } from '../lib/supabase';

const STORAGE_KEYS = {
  GUEST_BACKUP: '@fitness_tracker_guest_backup',
  LAST_GUEST_USER_ID: '@fitness_tracker_last_guest_user_id',
};

interface GuestBackupData {
  userId: string;
  displayName: string;
  profile: any;
  workouts: any[];
  measurements: any[];
  goals: any[];
  backedUpAt: string;
}

class GuestDataService {
  // ゲストデータをローカルにバックアップ
  async backupGuestData(userId: string): Promise<void> {
    try {
      // プロフィールを取得
      const { data: profile } = await supabase
        .from('user_profiles')
        .select('*')
        .eq('user_id', userId)
        .single();

      // ワークアウトデータを取得
      const { data: workouts } = await supabase
        .from('workouts')
        .select(`
          *,
          workout_exercises (*)
        `)
        .eq('user_id', userId);

      // 測定データを取得
      const { data: measurements } = await supabase
        .from('measurements')
        .select('*')
        .eq('user_id', userId);

      // 目標データを取得
      const { data: goals } = await supabase
        .from('goals')
        .select('*')
        .eq('user_id', userId);

      const backupData: GuestBackupData = {
        userId,
        displayName: profile?.display_name || 'ゲスト',
        profile: profile || {},
        workouts: workouts || [],
        measurements: measurements || [],
        goals: goals || [],
        backedUpAt: new Date().toISOString(),
      };

      await AsyncStorage.setItem(STORAGE_KEYS.GUEST_BACKUP, JSON.stringify(backupData));
      await AsyncStorage.setItem(STORAGE_KEYS.LAST_GUEST_USER_ID, userId);
      
      console.log('Guest data backed up successfully');
    } catch (error) {
      console.error('Error backing up guest data:', error);
    }
  }

  // ローカルバックアップを取得
  async getGuestBackup(): Promise<GuestBackupData | null> {
    try {
      const backupJson = await AsyncStorage.getItem(STORAGE_KEYS.GUEST_BACKUP);
      return backupJson ? JSON.parse(backupJson) : null;
    } catch (error) {
      console.error('Error getting guest backup:', error);
      return null;
    }
  }

  // 最後のゲストユーザーIDを取得
  async getLastGuestUserId(): Promise<string | null> {
    try {
      return await AsyncStorage.getItem(STORAGE_KEYS.LAST_GUEST_USER_ID);
    } catch (error) {
      console.error('Error getting last guest user ID:', error);
      return null;
    }
  }

  // バックアップデータを新しいゲストユーザーに復元
  async restoreGuestData(newUserId: string, backupData: GuestBackupData): Promise<void> {
    try {
      // プロフィールを復元
      const { error: profileError } = await supabase
        .from('user_profiles')
        .upsert({
          ...backupData.profile,
          user_id: newUserId,
          updated_at: new Date().toISOString(),
        }, {
          onConflict: 'user_id',
        });

      if (profileError) throw profileError;

      // ワークアウトデータを復元
      for (const workout of backupData.workouts) {
        const { data: newWorkout, error: workoutError } = await supabase
          .from('workouts')
          .insert({
            ...workout,
            id: undefined, // 新しいIDを生成
            user_id: newUserId,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
          })
          .select()
          .single();

        if (workoutError) throw workoutError;

        // ワークアウトエクササイズも復元
        if (workout.workout_exercises && workout.workout_exercises.length > 0) {
          const exercises = workout.workout_exercises.map((exercise: any) => ({
            ...exercise,
            id: undefined,
            workout_id: newWorkout.id,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
          }));

          const { error: exerciseError } = await supabase
            .from('workout_exercises')
            .insert(exercises);

          if (exerciseError) throw exerciseError;
        }
      }

      // 測定データを復元
      if (backupData.measurements.length > 0) {
        const measurementsToRestore = backupData.measurements.map(measurement => ({
          ...measurement,
          id: undefined,
          user_id: newUserId,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        }));

        const { error: measurementError } = await supabase
          .from('measurements')
          .insert(measurementsToRestore);

        if (measurementError) throw measurementError;
      }

      // 目標データを復元
      if (backupData.goals.length > 0) {
        const goalsToRestore = backupData.goals.map(goal => ({
          ...goal,
          id: undefined,
          user_id: newUserId,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        }));

        const { error: goalError } = await supabase
          .from('goals')
          .insert(goalsToRestore);

        if (goalError) throw goalError;
      }

      // 新しいユーザーIDでバックアップを更新
      await this.backupGuestData(newUserId);
      
      console.log('Guest data restored successfully');
    } catch (error) {
      console.error('Error restoring guest data:', error);
      throw error;
    }
  }

  // バックアップデータをクリア
  async clearGuestBackup(): Promise<void> {
    try {
      await AsyncStorage.multiRemove([
        STORAGE_KEYS.GUEST_BACKUP,
        STORAGE_KEYS.LAST_GUEST_USER_ID,
      ]);
    } catch (error) {
      console.error('Error clearing guest backup:', error);
    }
  }

  // バックアップがあるかチェック
  async hasBackup(): Promise<boolean> {
    try {
      const backup = await this.getGuestBackup();
      return backup !== null;
    } catch (error) {
      return false;
    }
  }
}

export const guestDataService = new GuestDataService();