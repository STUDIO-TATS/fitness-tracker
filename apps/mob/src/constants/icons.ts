import { Ionicons } from '@expo/vector-icons';

// アイコンの型定義
export type IconName = keyof typeof Ionicons.glyphMap;

// カテゴリ別アイコン定義
export const icons = {
  // ナビゲーション
  navigation: {
    home: 'home' as IconName,
    homeOutline: 'home-outline' as IconName,
    workout: 'barbell' as IconName,
    workoutOutline: 'barbell-outline' as IconName,
    goals: 'trophy' as IconName,
    goalsOutline: 'trophy-outline' as IconName,
    measurement: 'analytics' as IconName,
    measurementOutline: 'analytics-outline' as IconName,
    profile: 'person-circle' as IconName,
    profileOutline: 'person-circle-outline' as IconName,
    menu: 'menu' as IconName,
    back: 'arrow-back' as IconName,
    forward: 'chevron-forward' as IconName,
    close: 'close' as IconName,
  },

  // アクティビティ
  activity: {
    running: 'walk' as IconName,
    cycling: 'bicycle' as IconName,
    swimming: 'water' as IconName,
    gym: 'fitness' as IconName,
    yoga: 'flower' as IconName,
    basketball: 'basketball' as IconName,
    tennis: 'tennisball' as IconName,
    soccer: 'football' as IconName,
    time: 'time' as IconName,
    calendar: 'calendar' as IconName,
    calendarOutline: 'calendar-outline' as IconName,
    location: 'location' as IconName,
    locationOutline: 'location-outline' as IconName,
  },

  // 施設
  facility: {
    business: 'business' as IconName,
    businessOutline: 'business-outline' as IconName,
    gym: 'barbell' as IconName,
    pool: 'water' as IconName,
    studio: 'flower' as IconName,
    phone: 'call' as IconName,
    phoneOutline: 'call-outline' as IconName,
    email: 'mail' as IconName,
    emailOutline: 'mail-outline' as IconName,
    map: 'map' as IconName,
    mapOutline: 'map-outline' as IconName,
    filter: 'filter' as IconName,
    filterOutline: 'filter-outline' as IconName,
  },

  // ポイント・リワード
  rewards: {
    gift: 'gift' as IconName,
    giftOutline: 'gift-outline' as IconName,
    star: 'star' as IconName,
    starOutline: 'star-outline' as IconName,
    trophy: 'trophy' as IconName,
    trophyOutline: 'trophy-outline' as IconName,
    medal: 'medal' as IconName,
    medalOutline: 'medal-outline' as IconName,
    cash: 'cash' as IconName,
    cashOutline: 'cash-outline' as IconName,
  },

  // ソーシャル
  social: {
    heart: 'heart' as IconName,
    heartOutline: 'heart-outline' as IconName,
    share: 'share-social' as IconName,
    shareOutline: 'share-social-outline' as IconName,
    chatbubble: 'chatbubble' as IconName,
    chatbubbleOutline: 'chatbubble-outline' as IconName,
    people: 'people' as IconName,
    peopleOutline: 'people-outline' as IconName,
  },

  // 測定・統計
  stats: {
    scale: 'scale' as IconName,
    scaleOutline: 'scale-outline' as IconName,
    trending: 'trending-up' as IconName,
    stats: 'stats-chart' as IconName,
    statsOutline: 'stats-chart-outline' as IconName,
    body: 'body' as IconName,
    bodyOutline: 'body-outline' as IconName,
    nutrition: 'nutrition' as IconName,
    nutritionOutline: 'nutrition-outline' as IconName,
  },

  // 設定・システム
  system: {
    settings: 'settings' as IconName,
    settingsOutline: 'settings-outline' as IconName,
    notifications: 'notifications' as IconName,
    notificationsOutline: 'notifications-outline' as IconName,
    moon: 'moon' as IconName,
    moonOutline: 'moon-outline' as IconName,
    sunny: 'sunny' as IconName,
    sunnyOutline: 'sunny-outline' as IconName,
    language: 'language' as IconName,
    languageOutline: 'language-outline' as IconName,
    fingerPrint: 'finger-print' as IconName,
    shield: 'shield-checkmark' as IconName,
    shieldOutline: 'shield-checkmark-outline' as IconName,
    document: 'document-text' as IconName,
    documentOutline: 'document-text-outline' as IconName,
    help: 'help-circle' as IconName,
    helpOutline: 'help-circle-outline' as IconName,
    information: 'information-circle' as IconName,
    informationOutline: 'information-circle-outline' as IconName,
  },

  // QR・カメラ
  scanning: {
    qrCode: 'qr-code' as IconName,
    qrCodeOutline: 'qr-code-outline' as IconName,
    camera: 'camera' as IconName,
    cameraOutline: 'camera-outline' as IconName,
    scan: 'scan' as IconName,
    scanOutline: 'scan-outline' as IconName,
    barcode: 'barcode' as IconName,
    barcodeOutline: 'barcode-outline' as IconName,
  },

  // AI・チャット
  ai: {
    robot: 'hardware-chip' as IconName,
    robotOutline: 'hardware-chip-outline' as IconName,
    bulb: 'bulb' as IconName,
    bulbOutline: 'bulb-outline' as IconName,
    flash: 'flash' as IconName,
    flashOutline: 'flash-outline' as IconName,
    send: 'send' as IconName,
    sendOutline: 'send-outline' as IconName,
    mic: 'mic' as IconName,
    micOutline: 'mic-outline' as IconName,
  },

  // 状態・アクション
  status: {
    checkmark: 'checkmark' as IconName,
    checkmarkCircle: 'checkmark-circle' as IconName,
    checkmarkCircleOutline: 'checkmark-circle-outline' as IconName,
    close: 'close' as IconName,
    closeCircle: 'close-circle' as IconName,
    closeCircleOutline: 'close-circle-outline' as IconName,
    add: 'add' as IconName,
    addCircle: 'add-circle' as IconName,
    addCircleOutline: 'add-circle-outline' as IconName,
    remove: 'remove' as IconName,
    removeCircle: 'remove-circle' as IconName,
    removeCircleOutline: 'remove-circle-outline' as IconName,
    refresh: 'refresh' as IconName,
    refreshCircle: 'refresh-circle' as IconName,
    refreshCircleOutline: 'refresh-circle-outline' as IconName,
    play: 'play' as IconName,
    playCircle: 'play-circle' as IconName,
    playCircleOutline: 'play-circle-outline' as IconName,
    pause: 'pause' as IconName,
    pauseCircle: 'pause-circle' as IconName,
    pauseCircleOutline: 'pause-circle-outline' as IconName,
    stop: 'stop' as IconName,
    stopCircle: 'stop-circle' as IconName,
    stopCircleOutline: 'stop-circle-outline' as IconName,
  },

  // 会員・認証
  membership: {
    card: 'card' as IconName,
    cardOutline: 'card-outline' as IconName,
    person: 'person' as IconName,
    personOutline: 'person-outline' as IconName,
    personAdd: 'person-add' as IconName,
    personAddOutline: 'person-add-outline' as IconName,
    key: 'key' as IconName,
    keyOutline: 'key-outline' as IconName,
    lockClosed: 'lock-closed' as IconName,
    lockClosedOutline: 'lock-closed-outline' as IconName,
    lockOpen: 'lock-open' as IconName,
    lockOpenOutline: 'lock-open-outline' as IconName,
    logIn: 'log-in' as IconName,
    logInOutline: 'log-in-outline' as IconName,
    logOut: 'log-out' as IconName,
    logOutOutline: 'log-out-outline' as IconName,
  },

  // データ管理
  data: {
    cloudDownload: 'cloud-download' as IconName,
    cloudDownloadOutline: 'cloud-download-outline' as IconName,
    cloudUpload: 'cloud-upload' as IconName,
    cloudUploadOutline: 'cloud-upload-outline' as IconName,
    trash: 'trash' as IconName,
    trashOutline: 'trash-outline' as IconName,
    save: 'save' as IconName,
    saveOutline: 'save-outline' as IconName,
    download: 'download' as IconName,
    downloadOutline: 'download-outline' as IconName,
    share: 'share' as IconName,
    shareOutline: 'share-outline' as IconName,
  },

  // 警告・エラー
  alerts: {
    warning: 'warning' as IconName,
    warningOutline: 'warning-outline' as IconName,
    alert: 'alert-circle' as IconName,
    alertOutline: 'alert-circle-outline' as IconName,
    error: 'close-circle' as IconName,
    errorOutline: 'close-circle-outline' as IconName,
  },

  // その他
  misc: {
    ellipsisHorizontal: 'ellipsis-horizontal' as IconName,
    ellipsisVertical: 'ellipsis-vertical' as IconName,
    options: 'options' as IconName,
    optionsOutline: 'options-outline' as IconName,
    search: 'search' as IconName,
    searchOutline: 'search-outline' as IconName,
    flame: 'flame' as IconName,
    flameOutline: 'flame-outline' as IconName,
    ribbon: 'ribbon' as IconName,
    ribbonOutline: 'ribbon-outline' as IconName,
    list: 'list' as IconName,
    listOutline: 'list-outline' as IconName,
    grid: 'grid' as IconName,
    gridOutline: 'grid-outline' as IconName,
  },
};

// よく使うアイコンへのショートカット
export const commonIcons = {
  menu: icons.navigation.menu,
  back: icons.navigation.back,
  close: icons.navigation.close,
  add: icons.status.add,
  edit: icons.system.settingsOutline,
  delete: icons.data.trash,
  save: icons.data.save,
  share: icons.data.share,
  search: icons.misc.search,
  filter: icons.facility.filter,
  refresh: icons.status.refresh,
  check: icons.status.checkmark,
  error: icons.alerts.error,
  warning: icons.alerts.warning,
  info: icons.system.information,
};