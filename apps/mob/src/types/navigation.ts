import type { Database } from './supabase';

// Supabaseから生成された型を使用
export type Facility = Database['public']['Tables']['facilities']['Row'] & {
  companies?: Database['public']['Tables']['companies']['Row'];
};

export type RootDrawerParamList = {
  Main: undefined;
  Profile: undefined;
  QRScanner: undefined;
  Points: undefined;
  ActivityLogs: undefined;
  Calendar: undefined;
  Facilities: undefined;
  FacilityDetail: { facility: Facility };
  Membership: undefined;
  AITrainer: undefined;
  Settings: undefined;
  Help: undefined;
  Terms: undefined;
  Privacy: undefined;
  Notifications: undefined;
};

export type RootTabParamList = {
  Home: undefined;
  Workout: undefined;
  Goals: undefined;
  Measurement: undefined;
  Profile: undefined;
};