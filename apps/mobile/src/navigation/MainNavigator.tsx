import React from 'react'
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs'
import { createDrawerNavigator } from '@react-navigation/drawer'
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons'
import Ionicons from 'react-native-vector-icons/Ionicons'
import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native'
import { DrawerContentScrollView, DrawerItemList, DrawerContentComponentProps } from '@react-navigation/drawer'
import { supabase } from '../lib/supabase'
import { colors } from '@fitness-tracker/ui'
import { useAuth } from '../hooks/useAuth'
import { getProfile } from '../lib/supabase'

// 画面をインポート
import { HomeScreen } from '../screens/HomeScreen'
import { WorkoutScreen } from '../screens/WorkoutScreen'
import { GoalsScreen } from '../screens/GoalsScreen'
import { MeasurementScreen } from '../screens/MeasurementScreen'
import { ProfileScreen } from '../screens/ProfileScreen'
import { FacilitiesScreen } from '../screens/FacilitiesScreen'
import { ActivityLogsScreen } from '../screens/ActivityLogsScreen'
import { PointsScreen } from '../screens/PointsScreen'
import { QRScannerScreen } from '../screens/QRScannerScreen'
import { CompanyScreen } from '../screens/CompanyScreen'
import { UserMembershipsScreen } from '../screens/UserMembershipsScreen'
import { ActivityTypesScreen } from '../screens/ActivityTypesScreen'
import { SettingsScreen } from '../screens/SettingsScreen'

const Tab = createBottomTabNavigator()
const Drawer = createDrawerNavigator()

// ボトムタブナビゲーター
function BottomTabNavigator() {
  return (
    <Tab.Navigator
      screenOptions={{
        tabBarActiveTintColor: colors.purple[500],
        tabBarInactiveTintColor: colors.gray[500],
        tabBarStyle: {
          backgroundColor: colors.white,
          borderTopWidth: 1,
          borderTopColor: colors.purple[100],
          paddingBottom: 8,
          paddingTop: 8,
          height: 80,
        },
        tabBarLabelStyle: {
          fontSize: 12,
          fontWeight: '600',
        },
      }}
    >
      <Tab.Screen
        name="Dashboard"
        component={HomeScreen}
        options={{
          title: 'ホーム',
          headerShown: false,
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="home" size={size} color={color} />
          ),
        }}
      />
      <Tab.Screen
        name="Workout"
        component={WorkoutScreen}
        options={{
          title: 'ワークアウト',
          headerShown: false,
          tabBarIcon: ({ color, size }) => (
            <MaterialCommunityIcons name="dumbbell" size={size} color={color} />
          ),
        }}
      />
      <Tab.Screen
        name="Goals"
        component={GoalsScreen}
        options={{
          title: '目標',
          headerShown: false,
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="trophy" size={size} color={color} />
          ),
        }}
      />
      <Tab.Screen
        name="Measurement"
        component={MeasurementScreen}
        options={{
          title: '体測定',
          headerShown: false,
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="scale" size={size} color={color} />
          ),
        }}
      />
      <Tab.Screen
        name="Profile"
        component={ProfileScreen}
        options={{
          title: 'プロフィール',
          headerShown: false,
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="person" size={size} color={color} />
          ),
        }}
      />
    </Tab.Navigator>
  )
}

// カスタムドロワーコンテンツ
function CustomDrawerContent(props: DrawerContentComponentProps) {
  const { user } = useAuth()
  const [displayName, setDisplayName] = React.useState<string>('ゲストユーザー')
  
  React.useEffect(() => {
    const loadUserProfile = async () => {
      if (!user) {
        setDisplayName('ゲストユーザー')
        return
      }
      
      try {
        const { data: profile } = await getProfile(user.id)
        if (profile?.display_name) {
          setDisplayName(profile.display_name)
        } else {
          // Use email as fallback
          setDisplayName(user.email || 'ユーザー')
        }
      } catch (error) {
        console.error('Error loading profile for drawer:', error)
        setDisplayName(user.email || 'ユーザー')
      }
    }
    
    loadUserProfile()
  }, [user])
  
  const handleSignOut = async () => {
    try {
      const { error } = await supabase.auth.signOut()
      if (error) {
        console.error('ログアウトエラー:', error)
      }
    } catch (error) {
      console.error('ログアウトエラー:', error)
    }
  }

  return (
    <View style={styles.drawerContainer}>
      {/* ドロワーヘッダー - 固定 */}
      <View style={styles.drawerHeader}>
        <Text style={styles.drawerTitle}>FitTracker</Text>
        <Text style={styles.drawerSubtitle}>{displayName}</Text>
      </View>

      {/* ドロワーアイテム - スクロール可能 */}
      <DrawerContentScrollView {...props} style={styles.drawerItemsContainer} contentContainerStyle={styles.drawerItemsContent}>
        <DrawerItemList {...props} />
      </DrawerContentScrollView>

      {/* ログアウトボタン - 固定 */}
      <View style={styles.drawerFooter}>
        <TouchableOpacity style={styles.logoutButton} onPress={handleSignOut}>
          <Ionicons name="log-out-outline" size={24} color="#EF4444" />
          <Text style={styles.logoutText}>ログアウト</Text>
        </TouchableOpacity>
      </View>
    </View>
  )
}

// ドロワーナビゲーター
export function MainNavigator() {
  return (
    <Drawer.Navigator
      drawerContent={(props: any) => <CustomDrawerContent {...props} />}
      screenOptions={{
        drawerActiveTintColor: colors.purple[500],
        drawerInactiveTintColor: colors.gray[600],
        drawerLabelStyle: {
          fontSize: 16,
          fontWeight: '600',
          marginLeft: 8,
        },
        drawerItemStyle: {
          borderRadius: 12,
          paddingHorizontal: 16,
          paddingVertical: 8,
          marginHorizontal: 0,
          marginVertical: 0,
        },
        drawerActiveBackgroundColor: colors.purple[50],
        drawerInactiveBackgroundColor: 'transparent',
        headerStyle: {
          backgroundColor: colors.white,
          elevation: 0,
          shadowOpacity: 0,
          borderBottomWidth: 1,
          borderBottomColor: colors.purple[100],
        },
        headerTitleStyle: {
          fontWeight: '700',
          fontSize: 20,
        },
        headerTintColor: colors.purple[700],
      }}
    >
      <Drawer.Screen
        name="Home"
        component={BottomTabNavigator}
        options={{
          title: 'FitTracker',
          drawerLabel: 'ホーム',
          drawerIcon: ({ color, size }: any) => (
            <Ionicons name="home-outline" size={size} color={color} />
          ),
        }}
      />
      <Drawer.Screen
        name="Facilities"
        component={FacilitiesScreen}
        options={{
          title: '施設一覧',
          drawerIcon: ({ color, size }: any) => (
            <Ionicons name="business-outline" size={size} color={color} />
          ),
        }}
      />
      <Drawer.Screen
        name="ActivityLogs"
        component={ActivityLogsScreen}
        options={{
          title: 'アクティビティログ',
          drawerIcon: ({ color, size }: any) => (
            <Ionicons name="time-outline" size={size} color={color} />
          ),
        }}
      />
      <Drawer.Screen
        name="MeasurementHistory"
        component={MeasurementScreen}
        options={{
          title: '体測定履歴',
          drawerIcon: ({ color, size }: any) => (
            <Ionicons name="scale-outline" size={size} color={color} />
          ),
        }}
      />
      <Drawer.Screen
        name="Points"
        component={PointsScreen}
        options={{
          title: 'ポイント',
          drawerIcon: ({ color, size }: any) => (
            <Ionicons name="star-outline" size={size} color={color} />
          ),
        }}
      />
      <Drawer.Screen
        name="QRScanner"
        component={QRScannerScreen}
        options={{
          title: 'QRスキャナー',
          drawerIcon: ({ color, size }: any) => (
            <Ionicons name="qr-code-outline" size={size} color={color} />
          ),
        }}
      />
      <Drawer.Screen
        name="Company"
        component={CompanyScreen}
        options={{
          title: '会社情報',
          drawerIcon: ({ color, size }: any) => (
            <Ionicons name="business-outline" size={size} color={color} />
          ),
        }}
      />
      <Drawer.Screen
        name="UserMemberships"
        component={UserMembershipsScreen}
        options={{
          title: 'メンバーシップ',
          drawerIcon: ({ color, size }: any) => (
            <Ionicons name="card-outline" size={size} color={color} />
          ),
        }}
      />
      <Drawer.Screen
        name="ActivityTypes"
        component={ActivityTypesScreen}
        options={{
          title: 'アクティビティタイプ',
          drawerIcon: ({ color, size }: any) => (
            <Ionicons name="play-circle-outline" size={size} color={color} />
          ),
        }}
      />
      <Drawer.Screen
        name="Settings"
        component={SettingsScreen}
        options={{
          title: '設定',
          drawerIcon: ({ color, size }: any) => (
            <Ionicons name="settings-outline" size={size} color={color} />
          ),
        }}
      />
    </Drawer.Navigator>
  )
}

const styles = StyleSheet.create({
  drawerContainer: {
    flex: 1,
    backgroundColor: colors.white,
  },
  drawerHeader: {
    backgroundColor: colors.purple[500],
    padding: 20,
    paddingTop: 70,
    paddingBottom: 40,
  },
  drawerTitle: {
    fontSize: 24,
    fontWeight: '800',
    color: colors.white,
    marginBottom: 4,
  },
  drawerSubtitle: {
    fontSize: 14,
    color: colors.purple[100],
  },
  drawerItemsContainer: {
    flex: 1,
    paddingHorizontal: 0,
  },
  drawerItemsContent: {
    paddingTop: 20,
    paddingBottom: 20,
  },
  drawerFooter: {
    borderTopWidth: 1,
    borderTopColor: colors.purple[100],
    padding: 20,
  },
  logoutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderRadius: 12,
    backgroundColor: colors.pink[50],
    marginHorizontal: 0,
  },
  logoutText: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.pink[600],
    marginLeft: 12,
  },
})