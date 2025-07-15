import React from 'react'
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs'
import { createDrawerNavigator } from '@react-navigation/drawer'
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons'
import Ionicons from 'react-native-vector-icons/Ionicons'
import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native'
import { DrawerContentScrollView, DrawerItemList, DrawerContentComponentProps } from '@react-navigation/drawer'

// 画面をインポート
import { DashboardScreen } from '../screens/DashboardScreen'
import { WorkoutScreen } from '../screens/WorkoutScreen'
import { GoalsScreen } from '../screens/GoalsScreen'
import { MeasurementScreen } from '../screens/MeasurementScreen'
import { ProfileScreen } from '../screens/ProfileScreen'
// import { QRScannerScreen } from '../screens/QRScannerScreen'

const Tab = createBottomTabNavigator()
const Drawer = createDrawerNavigator()

// ボトムタブナビゲーター
function BottomTabNavigator() {
  return (
    <Tab.Navigator
      screenOptions={{
        tabBarActiveTintColor: '#2563EB',
        tabBarInactiveTintColor: '#6B7280',
        tabBarStyle: {
          backgroundColor: '#FFFFFF',
          borderTopWidth: 1,
          borderTopColor: '#E5E7EB',
          paddingBottom: 5,
          paddingTop: 5,
          height: 60,
        },
        tabBarLabelStyle: {
          fontSize: 12,
          fontWeight: '600',
        },
      }}
    >
      <Tab.Screen
        name="Dashboard"
        component={DashboardScreen}
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
  
  const handleSignOut = async () => {
    try {
      console.log('ログアウト処理')
      // TODO: 実際のログアウト処理を実装
    } catch (error) {
      console.error('ログアウトエラー:', error)
    }
  }

  return (
    <DrawerContentScrollView {...props} style={styles.drawerContainer}>
      {/* ドロワーヘッダー */}
      <View style={styles.drawerHeader}>
        <View style={styles.drawerIconContainer}>
          <MaterialCommunityIcons name="dumbbell" size={32} color="#FFFFFF" />
        </View>
        <Text style={styles.drawerTitle}>FitTracker</Text>
        <Text style={styles.drawerSubtitle}>{'ゲストユーザー'}</Text>
      </View>

      {/* ドロワーアイテム */}
      <View style={styles.drawerItemsContainer}>
        <DrawerItemList {...props} />
      </View>

      {/* ログアウトボタン */}
      <View style={styles.drawerFooter}>
        <TouchableOpacity style={styles.logoutButton} onPress={handleSignOut}>
          <Ionicons name="log-out-outline" size={24} color="#EF4444" />
          <Text style={styles.logoutText}>ログアウト</Text>
        </TouchableOpacity>
      </View>
    </DrawerContentScrollView>
  )
}

// ドロワーナビゲーター
export function MainNavigator() {
  return (
    <Drawer.Navigator
      drawerContent={(props: any) => <CustomDrawerContent {...props} />}
      screenOptions={{
        drawerActiveTintColor: '#2563EB',
        drawerInactiveTintColor: '#6B7280',
        drawerLabelStyle: {
          fontSize: 16,
          fontWeight: '600',
          marginLeft: -16,
        },
        drawerItemStyle: {
          borderRadius: 8,
          paddingHorizontal: 8,
        },
        headerStyle: {
          backgroundColor: '#FFFFFF',
          elevation: 0,
          shadowOpacity: 0,
          borderBottomWidth: 1,
          borderBottomColor: '#E5E7EB',
        },
        headerTitleStyle: {
          fontWeight: '700',
          fontSize: 20,
        },
        headerTintColor: '#1F2937',
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
        name="WorkoutHistory"
        component={DashboardScreen} // 仮で設定
        options={{
          title: 'ワークアウト履歴',
          drawerIcon: ({ color, size }: any) => (
            <Ionicons name="time-outline" size={size} color={color} />
          ),
        }}
      />
      <Drawer.Screen
        name="Progress"
        component={DashboardScreen} // 仮で設定
        options={{
          title: '進捗',
          drawerIcon: ({ color, size }: any) => (
            <Ionicons name="analytics-outline" size={size} color={color} />
          ),
        }}
      />
      <Drawer.Screen
        name="Templates"
        component={DashboardScreen} // 仮で設定
        options={{
          title: 'テンプレート',
          drawerIcon: ({ color, size }: any) => (
            <Ionicons name="document-text-outline" size={size} color={color} />
          ),
        }}
      />
      <Drawer.Screen
        name="Settings"
        component={DashboardScreen} // 仮で設定
        options={{
          title: '設定',
          drawerIcon: ({ color, size }: any) => (
            <Ionicons name="settings-outline" size={size} color={color} />
          ),
        }}
      />
      {/* <Drawer.Screen
        name="QRScanner"
        component={QRScannerScreen}
        options={{
          title: 'QRスキャナー',
          drawerIcon: ({ color, size }: any) => (
            <Ionicons name="qr-code-outline" size={size} color={color} />
          ),
        }}
      /> */}
    </Drawer.Navigator>
  )
}

const styles = StyleSheet.create({
  drawerContainer: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  drawerHeader: {
    backgroundColor: '#2563EB',
    padding: 20,
    paddingTop: 50,
    marginTop: -50,
  },
  drawerIconContainer: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },
  drawerTitle: {
    fontSize: 24,
    fontWeight: '800',
    color: '#FFFFFF',
    marginBottom: 4,
  },
  drawerSubtitle: {
    fontSize: 14,
    color: '#DBEAFE',
  },
  drawerItemsContainer: {
    flex: 1,
    paddingTop: 10,
  },
  drawerFooter: {
    borderTopWidth: 1,
    borderTopColor: '#E5E7EB',
    padding: 20,
  },
  logoutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    borderRadius: 8,
  },
  logoutText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#EF4444',
    marginLeft: 12,
  },
})