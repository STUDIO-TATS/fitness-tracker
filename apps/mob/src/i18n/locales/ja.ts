export default {
  // 共通
  common: {
    loading: 'ローディング中...',
    error: 'エラー',
    retry: '再試行',
    cancel: 'キャンセル',
    save: '保存',
    edit: '編集',
    delete: '削除',
    close: '閉じる',
    back: '戻る',
    next: '次へ',
    done: '完了',
    yes: 'はい',
    no: 'いいえ',
    guest: 'ゲスト',
  },

  // 認証
  auth: {
    login: 'ログイン',
    logout: 'ログアウト',
    signUp: '新規登録',
    email: 'メールアドレス',
    password: 'パスワード',
    forgotPassword: 'パスワードを忘れた方',
    loginError: 'ログインに失敗しました',
    logoutConfirm: 'ログアウトしますか？',
  },

  // ナビゲーション
  navigation: {
    home: 'ホーム',
    workout: 'ワークアウト',
    goals: '目標',
    measurement: '測定',
    profile: 'プロフィール',
    facilities: '施設',
    points: 'ポイント',
    activityLogs: 'アクティビティ',
    calendar: 'カレンダー',
    membership: '会員情報',
    aiTrainer: 'AIトレーナー',
    settings: '設定',
    help: 'ヘルプ',
    qrScanner: 'QRスキャナー',
  },

  // ホーム画面
  home: {
    title: 'ダッシュボード',
    welcome: 'こんにちは、{{name}}さん',
    todayActivity: '今日のアクティビティ',
    weeklyProgress: '週間進捗',
    quickActions: 'クイックアクション',
    startWorkout: '新しいワークアウトを記録',
    scanQR: 'QRコードをスキャン',
    viewCalendar: 'カレンダーを見る',
    recentActivities: '最近のアクティビティ',
    noActivities: 'アクティビティがありません',
  },

  // ワークアウト
  workout: {
    title: 'ワークアウト',
    selectActivity: 'アクティビティを選択',
    duration: '時間',
    calories: 'カロリー',
    minutes: '分',
    kcal: 'kcal',
    save: 'ワークアウトを保存',
    activities: {
      running: 'ランニング',
      walking: 'ウォーキング',
      cycling: 'サイクリング',
      swimming: '水泳',
      gym: 'ジム',
      yoga: 'ヨガ',
      other: 'その他',
    },
  },

  // 目標
  goals: {
    title: '目標設定',
    current: '現在の目標',
    weekly: '週間目標',
    monthly: '月間目標',
    calories: 'カロリー消費',
    duration: '運動時間',
    frequency: '運動回数',
    progress: '進捗率',
    achieved: '達成',
    remaining: '残り',
  },

  // 測定
  measurement: {
    title: '体測定',
    weight: '体重',
    height: '身長',
    bmi: 'BMI',
    bodyFat: '体脂肪率',
    muscleMass: '筋肉量',
    kg: 'kg',
    cm: 'cm',
    percent: '%',
    record: '記録する',
    history: '履歴',
    chart: 'チャート',
  },

  // 施設
  facilities: {
    title: '施設一覧',
    nearbyFacilities: '近くの施設',
    allFacilities: 'すべての施設',
    gym: 'ジム',
    pool: 'プール',
    yogaStudio: 'ヨガスタジオ',
    openNow: '営業中',
    closed: '営業時間外',
    details: '詳細',
    pricing: '料金',
    equipment: '設備・機器',
    classes: 'クラス・プログラム',
    monthlyFee: '月会費',
    yearlyFee: '年会費',
    dayPass: '1日利用券',
    studentDiscount: '学生割引',
    seniorDiscount: 'シニア割引',
    book: '予約・見学申込',
    call: '電話',
    email: 'メール',
  },

  // ポイント
  points: {
    title: 'ポイント',
    currentPoints: '現在のポイント',
    pointHistory: 'ポイント履歴',
    earned: '獲得',
    used: '使用',
    expiring: '期限切れ間近',
    rewards: '特典と交換',
    expirationDate: '有効期限',
  },

  // カレンダー
  calendar: {
    title: 'アクティビティカレンダー',
    today: '今日',
    activities: '活動',
    totalDuration: '総運動時間',
    totalCalories: '総消費カロリー',
    activityDays: '活動日数',
    minutes: '分',
  },

  // AIトレーナー
  aiTrainer: {
    title: 'AIトレーナー',
    placeholder: 'メッセージを入力...',
    send: '送信',
    quickActions: {
      todayPlan: '今日のトレーニングプラン',
      nutritionAdvice: '栄養アドバイス',
      formCheck: 'フォームチェック',
      motivation: 'モチベーション',
    },
    typing: '入力中...',
  },

  // 設定
  settings: {
    title: '設定',
    notifications: '通知',
    pushNotifications: 'プッシュ通知',
    emailNotifications: 'メール通知',
    appearance: 'アプリの設定',
    darkMode: 'ダークモード',
    biometric: '生体認証',
    language: '言語',
    dataManagement: 'データ管理',
    exportData: 'データをエクスポート',
    clearCache: 'キャッシュをクリア',
    other: 'その他',
    termsOfService: '利用規約',
    privacyPolicy: 'プライバシーポリシー',
    version: 'バージョン',
    help: 'ヘルプ',
    notificationEnabled: 'フィットネストラッカー',
    notificationEnabledMsg: '通知が有効になりました！',
    dataExport: 'データエクスポート',
    dataExportMsg: 'データのエクスポート機能は準備中です。',
    clearCacheTitle: 'キャッシュクリア',
    clearCacheMsg: 'キャッシュをクリアしますか？',
    clear: 'クリア',
    completed: '完了',
    cacheCleared: 'キャッシュをクリアしました。',
    emailNotificationMsg: 'メール通知設定は準備中です。',
    selectLanguage: '言語を選択',
    japanese: '日本語',
    english: 'English',
  },

  // プロフィール
  profile: {
    title: 'プロフィール',
    edit: 'プロフィールを編集',
    displayName: '表示名',
    username: 'ユーザー名',
    bio: '自己紹介',
    age: '年齢',
    location: '地域',
    memberSince: '登録日',
    statistics: '統計',
    activityDays: '活動日数',
    currentStreak: '現在の連続日数',
    longestStreak: '最長連続日数',
    achievements: '獲得バッジ',
  },

  // エラーメッセージ
  errors: {
    networkError: 'ネットワークエラーが発生しました',
    invalidEmail: '有効なメールアドレスを入力してください',
    invalidPassword: 'パスワードは8文字以上で入力してください',
    passwordMismatch: 'パスワードが一致しません',
    requiredField: 'この項目は必須です',
    somethingWentWrong: '問題が発生しました',
  },

  // 成功メッセージ
  success: {
    saved: '保存しました',
    updated: '更新しました',
    deleted: '削除しました',
    workoutRecorded: 'ワークアウトを記録しました',
    goalAchieved: '目標を達成しました！',
    profileUpdated: 'プロフィールを更新しました',
  },
};