// Common constants used across the app
export const SCREEN_PADDING = 16
export const CARD_RADIUS = 12
export const BUTTON_RADIUS = 8

// Common screen names
export const SCREEN_NAMES = {
  HOME: 'Home',
  DASHBOARD: 'Dashboard',
  WORKOUT: 'Workout',
  GOALS: 'Goals',
  MEASUREMENT: 'Measurement',
  PROFILE: 'Profile',
  FACILITIES: 'Facilities',
  ACTIVITY_LOGS: 'ActivityLogs',
  POINTS: 'Points',
  QR_SCANNER: 'QRScanner',
  COMPANY: 'Company',
  USER_MEMBERSHIPS: 'UserMemberships',
  ACTIVITY_TYPES: 'ActivityTypes',
  SETTINGS: 'Settings',
} as const

// Common status values
export const GOAL_STATUS = {
  ACTIVE: 'active',
  COMPLETED: 'completed',
  PAUSED: 'paused',
  CANCELLED: 'cancelled',
} as const

// Common error messages
export const ERROR_MESSAGES = {
  NETWORK_ERROR: 'ネットワークエラーが発生しました',
  UNKNOWN_ERROR: '予期しないエラーが発生しました',
  LOADING_ERROR: 'データの読み込みに失敗しました',
  SAVE_ERROR: 'データの保存に失敗しました',
} as const

// Common success messages
export const SUCCESS_MESSAGES = {
  SAVE_SUCCESS: 'データが保存されました',
  UPDATE_SUCCESS: 'データが更新されました',
  DELETE_SUCCESS: 'データが削除されました',
} as const