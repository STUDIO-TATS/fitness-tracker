import { colors } from './colors';

// セマンティックカラー定義
export const semanticColors = {
  // 背景色
  background: {
    primary: colors.white,
    secondary: colors.gray[50],
    tertiary: colors.purple[50],
    card: colors.white,
    modal: colors.white,
    overlay: 'rgba(0, 0, 0, 0.5)',
    success: colors.mint[50],
    error: colors.pink[50],
    warning: colors.yellow[50],
    info: colors.purple[50],
  },

  // テキスト色
  text: {
    primary: colors.gray[900],
    secondary: colors.gray[600],
    tertiary: colors.gray[400],
    inverse: colors.white,
    link: colors.purple[600],
    success: colors.mint[700],
    error: colors.pink[700],
    warning: colors.yellow[700],
    info: colors.purple[700],
  },

  // ボーダー色
  border: {
    default: colors.gray[200],
    light: colors.gray[100],
    dark: colors.gray[300],
    focus: colors.purple[500],
    error: colors.pink[500],
    success: colors.mint[500],
  },

  // アクション色
  action: {
    primary: colors.purple[600],
    primaryHover: colors.purple[700],
    primaryPressed: colors.purple[800],
    secondary: colors.pink[500],
    secondaryHover: colors.pink[600],
    secondaryPressed: colors.pink[700],
    success: colors.mint[600],
    successHover: colors.mint[700],
    danger: colors.pink[600],
    dangerHover: colors.pink[700],
  },

  // ステータス色
  status: {
    active: colors.mint[500],
    inactive: colors.gray[400],
    pending: colors.yellow[500],
    completed: colors.mint[600],
    error: colors.pink[600],
    warning: colors.yellow[600],
  },

  // チャート・グラフ用カラーパレット
  chart: {
    primary: colors.purple[600],
    secondary: colors.pink[500],
    tertiary: colors.mint[500],
    quaternary: colors.yellow[500],
    series: [
      colors.purple[600],
      colors.pink[500],
      colors.mint[500],
      colors.yellow[500],
      colors.purple[400],
      colors.pink[400],
      colors.mint[400],
      colors.yellow[400],
    ],
  },

  // ソーシャル・アクティビティ色
  activity: {
    running: '#FF6B6B',
    walking: '#4ECDC4',
    cycling: '#45B7D1',
    swimming: '#3498DB',
    gym: '#9B59B6',
    yoga: '#E8B4F8',
    other: colors.gray[500],
  },

  // グラデーション
  gradient: {
    primary: ['#E879F9', '#F0ABFC'],
    secondary: ['#F472B6', '#F9A8D4'],
    success: ['#10B981', '#34D399'],
    sunset: ['#F472B6', '#F9A8D4', '#FBCFE8'],
    aurora: ['#E879F9', '#C084FC', '#A855F7'],
    mint: ['#10B981', '#34D399', '#6EE7B7'],
  },
};

// 影の定義
export const shadows = {
  sm: {
    shadowColor: colors.black,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 2,
  },
  md: {
    shadowColor: colors.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 4,
  },
  lg: {
    shadowColor: colors.black,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 8,
  },
  xl: {
    shadowColor: colors.black,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.2,
    shadowRadius: 16,
    elevation: 16,
  },
};

// スペーシング
export const spacing = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
  xxl: 48,
};

// ボーダー半径
export const borderRadius = {
  none: 0,
  sm: 4,
  md: 8,
  lg: 12,
  xl: 16,
  xxl: 24,
  full: 9999,
};

// フォントサイズ
export const fontSize = {
  xs: 12,
  sm: 14,
  base: 16,
  lg: 18,
  xl: 20,
  '2xl': 24,
  '3xl': 30,
  '4xl': 36,
};

// フォントウェイト
export const fontWeight = {
  normal: '400' as const,
  medium: '500' as const,
  semibold: '600' as const,
  bold: '700' as const,
};

// アニメーション設定
export const animation = {
  duration: {
    fast: 150,
    normal: 300,
    slow: 500,
  },
  easing: {
    linear: 'linear',
    easeIn: 'ease-in',
    easeOut: 'ease-out',
    easeInOut: 'ease-in-out',
  },
};

// テーマ全体のエクスポート
export const theme = {
  colors: semanticColors,
  rawColors: colors,
  shadows,
  spacing,
  borderRadius,
  fontSize,
  fontWeight,
  animation,
};

export type Theme = typeof theme;