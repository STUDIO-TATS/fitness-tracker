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
    console.log('Starting data restoration for user:', newUserId);
    console.log('Backup data:', { 
      workouts: backupData.workouts.length, 
      measurements: backupData.measurements.length, 
      goals: backupData.goals.length 
    });
    
    try {
      // プロフィールを復元（update のみ、既存のプロフィールを更新）
      const { error: profileError } = await supabase
        .from('user_profiles')
        .update({
          display_name: backupData.profile.display_name || 'ゲスト',
          phone: backupData.profile.phone,
          date_of_birth: backupData.profile.date_of_birth,
          gender: backupData.profile.gender,
          avatar_url: backupData.profile.avatar_url,
          emergency_contact: backupData.profile.emergency_contact,
          preferences: {
            ...backupData.profile.preferences,
            isAnonymous: true,
            restoredAt: new Date().toISOString(),
          },
          updated_at: new Date().toISOString(),
        })
        .eq('user_id', newUserId);

      if (profileError) {
        console.error('Profile update error:', profileError);
        throw profileError;
      }

      // ワークアウトデータを復元
      for (const workout of backupData.workouts) {
        // IDプロパティを削除して新しいレコードとして挿入
        const { id, workout_exercises, ...workoutData } = workout;
        
        const { data: newWorkout, error: workoutError } = await supabase
          .from('workouts')
          .insert({
            ...workoutData,
            user_id: newUserId,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
          })
          .select()
          .single();

        if (workoutError) {
          console.error('Workout insert error:', workoutError);
          throw workoutError;
        }

        // ワークアウトエクササイズも復元
        if (workout_exercises && workout_exercises.length > 0) {
          const exercises = workout_exercises.map((exercise: any) => {
            const { id: exerciseId, ...exerciseData } = exercise;
            return {
              ...exerciseData,
              workout_id: newWorkout.id,
              created_at: new Date().toISOString(),
              updated_at: new Date().toISOString(),
            };
          });

          const { error: exerciseError } = await supabase
            .from('workout_exercises')
            .insert(exercises);

          if (exerciseError) {
            console.error('Exercise insert error:', exerciseError);
            throw exerciseError;
          }
        }
      }

      // 測定データを復元
      if (backupData.measurements.length > 0) {
        const measurementsToRestore = backupData.measurements.map(measurement => {
          const { id, ...measurementData } = measurement;
          return {
            ...measurementData,
            user_id: newUserId,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
          };
        });

        const { error: measurementError } = await supabase
          .from('measurements')
          .insert(measurementsToRestore);

        if (measurementError) {
          console.error('Measurement insert error:', measurementError);
          throw measurementError;
        }
      }

      // 目標データを復元
      if (backupData.goals.length > 0) {
        const goalsToRestore = backupData.goals.map(goal => {
          const { id, ...goalData } = goal;
          return {
            ...goalData,
            user_id: newUserId,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
          };
        });

        const { error: goalError } = await supabase
          .from('goals')
          .insert(goalsToRestore);

        if (goalError) {
          console.error('Goal insert error:', goalError);
          throw goalError;
        }
      }

      // 新しいユーザーIDでバックアップを更新
      await this.backupGuestData(newUserId);
      
      console.log('Guest data restored successfully for user:', newUserId);
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