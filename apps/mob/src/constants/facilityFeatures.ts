// 施設の機能/特徴のラベル定義
export const FEATURE_LABELS = {
  pool: "プール",
  sauna: "サウナ",
  parking: "駐車場",
  gym: "ジム",
  basketball: "バスケットボール",
  badminton: "バドミントン",
  volleyball: "バレーボール",
  shower: "シャワー",
  yoga_room: "ヨガルーム",
  studio: "スタジオ",
  cafe: "カフェ",
  wheelchair_accessible: "バリアフリー",
  conference_room: "会議室",
  locker_room: "ロッカールーム",
  wifi: "Wi-Fi",
  personal_training: "パーソナルトレーニング",
  group_lesson: "グループレッスン",
  kids_space: "キッズスペース",
  massage_room: "マッサージルーム",
  hot_bath: "温浴施設",
} as const;

// 型定義
export type FeatureKey = keyof typeof FEATURE_LABELS;
export type FeatureLabel = typeof FEATURE_LABELS[FeatureKey];

// 施設タイプの定義
export const FACILITY_TYPES = {
  gym: "gym",
  pool: "pool",
  yoga_studio: "yoga_studio",
  exercise_studio: "exercise_studio",
  sports_complex: "sports_complex",
  fitness_center: "fitness_center",
} as const;

export type FacilityType = typeof FACILITY_TYPES[keyof typeof FACILITY_TYPES];

// 施設タイプのラベル
export const FACILITY_TYPE_LABELS: Record<FacilityType, string> = {
  gym: "ジム",
  pool: "プール",
  yoga_studio: "ヨガスタジオ",
  exercise_studio: "エクササイズスタジオ",
  sports_complex: "総合スポーツ施設",
  fitness_center: "フィットネスセンター",
};