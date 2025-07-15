import React from 'react';
import { createDrawerNavigator } from '@react-navigation/drawer';
import { Ionicons } from '@expo/vector-icons';
import TabNavigator from './TabNavigator';
import ProfileScreen from '../screens/ProfileScreen';
import SettingsScreen from '../screens/SettingsScreen';
import QRScannerScreen from '../screens/QRScannerScreen';
import PointsScreen from '../screens/PointsScreen';
import ActivityLogsScreen from '../screens/ActivityLogsScreen';
import FacilitiesScreen from '../screens/FacilitiesScreen';
import FacilityDetailScreen from '../screens/FacilityDetailScreen';
import CalendarScreen from '../screens/CalendarScreen';
import MembershipScreen from '../screens/MembershipScreen';
import AITrainerScreen from '../screens/AITrainerScreen';
import HelpScreen from '../screens/HelpScreen';
import TermsScreen from '../screens/TermsScreen';
import PrivacyScreen from '../screens/PrivacyScreen';
import { colors } from '../constants/colors';

const Drawer = createDrawerNavigator();

export default function DrawerNavigator() {
  return (
    <Drawer.Navigator
      screenOptions={{
        drawerStyle: {
          backgroundColor: colors.pink[50],
        },
        drawerActiveTintColor: colors.primary,
        drawerInactiveTintColor: colors.gray[600],
        headerStyle: {
          backgroundColor: colors.primary,
          height: 100,
        },
        headerTintColor: colors.white,
        headerTitleStyle: {
          fontWeight: 'bold',
          fontSize: 20,
        },
      }}
    >
      <Drawer.Screen 
        name="Main" 
        component={TabNavigator}
        options={{
          title: 'Fitness Tracker',
          drawerLabel: 'ホーム',
          drawerIcon: ({ color, size }) => (
            <Ionicons name="home" size={size} color={color} />
          ),
        }}
      />
      <Drawer.Screen 
        name="Profile" 
        component={ProfileScreen}
        options={{
          title: 'プロフィール',
          drawerIcon: ({ color, size }) => (
            <Ionicons name="person" size={size} color={color} />
          ),
        }}
      />
      <Drawer.Screen 
        name="QRScanner" 
        component={QRScannerScreen}
        options={{
          title: 'QRスキャナー',
          drawerIcon: ({ color, size }) => (
            <Ionicons name="qr-code" size={size} color={color} />
          ),
        }}
      />
      <Drawer.Screen 
        name="Points" 
        component={PointsScreen}
        options={{
          title: 'ポイント',
          drawerIcon: ({ color, size }) => (
            <Ionicons name="gift" size={size} color={color} />
          ),
        }}
      />
      <Drawer.Screen 
        name="ActivityLogs" 
        component={ActivityLogsScreen}
        options={{
          title: 'アクティビティ',
          drawerIcon: ({ color, size }) => (
            <Ionicons name="list" size={size} color={color} />
          ),
        }}
      />
      <Drawer.Screen 
        name="Calendar" 
        component={CalendarScreen}
        options={{
          title: 'カレンダー',
          drawerIcon: ({ color, size }) => (
            <Ionicons name="calendar" size={size} color={color} />
          ),
        }}
      />
      <Drawer.Screen 
        name="Facilities" 
        component={FacilitiesScreen}
        options={{
          title: '施設',
          drawerIcon: ({ color, size }) => (
            <Ionicons name="business" size={size} color={color} />
          ),
        }}
      />
      <Drawer.Screen 
        name="FacilityDetail" 
        component={FacilityDetailScreen}
        options={{
          title: '施設詳細',
          drawerItemStyle: { display: 'none' },
        }}
      />
      <Drawer.Screen 
        name="Membership" 
        component={MembershipScreen}
        options={{
          title: '会員情報',
          drawerIcon: ({ color, size }) => (
            <Ionicons name="card" size={size} color={color} />
          ),
        }}
      />
      <Drawer.Screen 
        name="AITrainer" 
        component={AITrainerScreen}
        options={{
          title: 'AIトレーナー',
          drawerIcon: ({ color, size }) => (
            <Ionicons name="fitness" size={size} color={color} />
          ),
        }}
      />
      <Drawer.Screen 
        name="Settings" 
        component={SettingsScreen}
        options={{
          title: '設定',
          drawerIcon: ({ color, size }) => (
            <Ionicons name="settings" size={size} color={color} />
          ),
        }}
      />
      <Drawer.Screen 
        name="Help" 
        component={HelpScreen}
        options={{
          title: 'ヘルプ',
          drawerIcon: ({ color, size }) => (
            <Ionicons name="help-circle" size={size} color={color} />
          ),
        }}
      />
      <Drawer.Screen 
        name="Terms" 
        component={TermsScreen}
        options={{
          title: '利用規約',
          drawerItemStyle: { display: 'none' },
        }}
      />
      <Drawer.Screen 
        name="Privacy" 
        component={PrivacyScreen}
        options={{
          title: 'プライバシーポリシー',
          drawerItemStyle: { display: 'none' },
        }}
      />
    </Drawer.Navigator>
  );
}