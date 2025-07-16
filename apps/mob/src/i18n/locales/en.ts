export default {
  // Common
  common: {
    loading: 'Loading...',
    error: 'Error',
    retry: 'Retry',
    cancel: 'Cancel',
    save: 'Save',
    edit: 'Edit',
    delete: 'Delete',
    close: 'Close',
    back: 'Back',
    next: 'Next',
    done: 'Done',
    yes: 'Yes',
    no: 'No',
    guest: 'Guest',
  },

  // Authentication
  auth: {
    login: 'Login',
    logout: 'Logout',
    signUp: 'Sign Up',
    email: 'Email',
    password: 'Password',
    forgotPassword: 'Forgot Password',
    loginError: 'Login failed',
    logoutConfirm: 'Are you sure you want to logout?',
  },

  // Navigation
  navigation: {
    home: 'Home',
    workout: 'Workout',
    goals: 'Goals',
    measurement: 'Measurement',
    profile: 'Profile',
    facilities: 'Facilities',
    points: 'Points',
    activityLogs: 'Activities',
    calendar: 'Calendar',
    membership: 'Membership',
    aiTrainer: 'AI Trainer',
    settings: 'Settings',
    help: 'Help',
    qrScanner: 'QR Scanner',
  },

  // Home Screen
  home: {
    title: 'Dashboard',
    welcome: 'Hello, {{name}}',
    todayActivity: "Today's Activity",
    weeklyProgress: 'Weekly Progress',
    quickActions: 'Quick Actions',
    startWorkout: 'Record New Workout',
    scanQR: 'Scan QR Code',
    viewCalendar: 'View Calendar',
    recentActivities: 'Recent Activities',
    noActivities: 'No activities',
  },

  // Workout
  workout: {
    title: 'Workout',
    selectActivity: 'Select Activity',
    duration: 'Duration',
    calories: 'Calories',
    minutes: 'min',
    kcal: 'kcal',
    save: 'Save Workout',
    activities: {
      running: 'Running',
      walking: 'Walking',
      cycling: 'Cycling',
      swimming: 'Swimming',
      gym: 'Gym',
      yoga: 'Yoga',
      other: 'Other',
    },
  },

  // Goals
  goals: {
    title: 'Goals',
    current: 'Current Goals',
    weekly: 'Weekly Goals',
    monthly: 'Monthly Goals',
    calories: 'Calorie Burn',
    duration: 'Exercise Duration',
    frequency: 'Exercise Frequency',
    progress: 'Progress',
    achieved: 'Achieved',
    remaining: 'Remaining',
  },

  // Measurement
  measurement: {
    title: 'Body Measurement',
    weight: 'Weight',
    height: 'Height',
    bmi: 'BMI',
    bodyFat: 'Body Fat',
    muscleMass: 'Muscle Mass',
    kg: 'kg',
    cm: 'cm',
    percent: '%',
    record: 'Record',
    history: 'History',
    chart: 'Chart',
  },

  // Facilities
  facilities: {
    title: 'Facilities',
    nearbyFacilities: 'Nearby Facilities',
    allFacilities: 'All Facilities',
    gym: 'Gym',
    pool: 'Pool',
    yogaStudio: 'Yoga Studio',
    openNow: 'Open Now',
    closed: 'Closed',
    details: 'Details',
    pricing: 'Pricing',
    equipment: 'Equipment',
    classes: 'Classes & Programs',
    monthlyFee: 'Monthly Fee',
    yearlyFee: 'Yearly Fee',
    dayPass: 'Day Pass',
    studentDiscount: 'Student Discount',
    seniorDiscount: 'Senior Discount',
    book: 'Book / Visit',
    call: 'Call',
    email: 'Email',
  },

  // Points
  points: {
    title: 'Points',
    currentPoints: 'Current Points',
    pointHistory: 'Point History',
    earned: 'Earned',
    used: 'Used',
    expiring: 'Expiring Soon',
    rewards: 'Exchange for Rewards',
    expirationDate: 'Expiration Date',
  },

  // Calendar
  calendar: {
    title: 'Activity Calendar',
    today: 'Today',
    activities: 'Activities',
    totalDuration: 'Total Duration',
    totalCalories: 'Total Calories',
    activityDays: 'Activity Days',
    minutes: 'min',
  },

  // AI Trainer
  aiTrainer: {
    title: 'AI Trainer',
    placeholder: 'Type a message...',
    send: 'Send',
    quickActions: {
      todayPlan: "Today's Training Plan",
      nutritionAdvice: 'Nutrition Advice',
      formCheck: 'Form Check',
      motivation: 'Motivation',
    },
    typing: 'Typing...',
  },

  // Settings
  settings: {
    title: 'Settings',
    notifications: 'Notifications',
    pushNotifications: 'Push Notifications',
    emailNotifications: 'Email Notifications',
    appearance: 'App Settings',
    darkMode: 'Dark Mode',
    biometric: 'Biometric Authentication',
    language: 'Language',
    dataManagement: 'Data Management',
    exportData: 'Export Data',
    clearCache: 'Clear Cache',
    other: 'Other',
    termsOfService: 'Terms of Service',
    privacyPolicy: 'Privacy Policy',
    version: 'Version',
    help: 'Help',
    notificationEnabled: 'Fitness Tracker',
    notificationEnabledMsg: 'Notifications have been enabled!',
    dataExport: 'Data Export',
    dataExportMsg: 'Data export feature is coming soon.',
    clearCacheTitle: 'Clear Cache',
    clearCacheMsg: 'Do you want to clear the cache?',
    clear: 'Clear',
    completed: 'Completed',
    cacheCleared: 'Cache has been cleared.',
    emailNotificationMsg: 'Email notification settings are coming soon.',
    selectLanguage: 'Select Language',
    japanese: '日本語',
    english: 'English',
  },

  // Profile
  profile: {
    title: 'Profile',
    edit: 'Edit Profile',
    displayName: 'Display Name',
    username: 'Username',
    bio: 'Bio',
    age: 'Age',
    location: 'Location',
    memberSince: 'Member Since',
    statistics: 'Statistics',
    activityDays: 'Activity Days',
    currentStreak: 'Current Streak',
    longestStreak: 'Longest Streak',
    achievements: 'Achievements',
  },

  // Error Messages
  errors: {
    networkError: 'Network error occurred',
    invalidEmail: 'Please enter a valid email address',
    invalidPassword: 'Password must be at least 8 characters',
    passwordMismatch: 'Passwords do not match',
    requiredField: 'This field is required',
    somethingWentWrong: 'Something went wrong',
  },

  // Success Messages
  success: {
    saved: 'Saved',
    updated: 'Updated',
    deleted: 'Deleted',
    workoutRecorded: 'Workout recorded',
    goalAchieved: 'Goal achieved!',
    profileUpdated: 'Profile updated',
  },
};