import type { Database } from './supabase';

// テーブル型のエイリアス
export type Tables<T extends keyof Database['public']['Tables']> = Database['public']['Tables'][T]['Row'];
export type TablesInsert<T extends keyof Database['public']['Tables']> = Database['public']['Tables'][T]['Insert'];
export type TablesUpdate<T extends keyof Database['public']['Tables']> = Database['public']['Tables'][T]['Update'];

// よく使うテーブル型のエクスポート
export type Company = Tables<'companies'>;
export type Branch = Tables<'branches'>;
export type Facility = Tables<'facilities'>;
export type ActivityType = Tables<'activity_types'>;
export type UserProfile = Tables<'user_profiles'>;
export type CompanyUser = Tables<'company_users'>;
export type UserMembership = Tables<'user_memberships'>;
export type PointSystem = Tables<'point_systems'>;
export type PointRule = Tables<'point_rules'>;
export type UserPoint = Tables<'user_points'>;
export type ActivityLog = Tables<'activity_logs'>;
export type PointTransaction = Tables<'point_transactions'>;
export type Measurement = Tables<'measurements'>;
export type Goal = Tables<'goals'>;
export type Workout = Tables<'workouts'>;
export type WorkoutExercise = Tables<'workout_exercises'>;
export type Notification = Tables<'notifications'>;

// Join型の定義
export type FacilityWithCompany = Facility & {
  companies: Company;
};

export type ActivityLogWithDetails = ActivityLog & {
  facilities: Facility;
  activity_types?: ActivityType;
};

export type UserMembershipWithCompany = UserMembership & {
  companies: Company;
};

export type WorkoutWithExercises = Workout & {
  workout_exercises: WorkoutExercise[];
};

// ビュー型の定義
export type CompanyActivitySummary = Database['public']['Views']['company_activity_summary']['Row'];
export type FacilityUsageSummary = Database['public']['Views']['facility_usage_summary']['Row'];
export type PointSystemSummary = Database['public']['Views']['point_system_summary']['Row'];