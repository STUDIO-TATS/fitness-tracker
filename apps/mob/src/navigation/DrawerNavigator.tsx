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
import { icons } from '../constants/icons';
import { theme } from '../constants/theme';
import { useI18n } from '../hooks/useI18n';

const Drawer = createDrawerNavigator();

export default function DrawerNavigator() {
  const { t } = useI18n();

  return (
    <Drawer.Navigator
      screenOptions={{
        drawerStyle: {
          backgroundColor: theme.colors.background.tertiary,
        },
        drawerActiveTintColor: theme.colors.action.primary,
        drawerInactiveTintColor: theme.colors.text.secondary,
        headerStyle: {
          backgroundColor: theme.colors.action.primary,
          height: 100,
          ...theme.shadows.md,
        },
        headerTintColor: theme.colors.text.inverse,
        headerTitleStyle: {
          fontWeight: theme.fontWeight.bold,
          fontSize: theme.fontSize.xl,
        },
      }}
    >
      <Drawer.Screen 
        name="Main" 
        component={TabNavigator}
        options={{
          title: 'Fitness Tracker',
          drawerLabel: t('navigation.home'),
          drawerIcon: ({ color, size }) => (
            <Ionicons name={icons.navigation.home} size={size} color={color} />
          ),
        }}
      />
      <Drawer.Screen 
        name="Profile" 
        component={ProfileScreen}
        options={{
          title: t('navigation.profile'),
          drawerIcon: ({ color, size }) => (
            <Ionicons name={icons.membership.person} size={size} color={color} />
          ),
        }}
      />
      <Drawer.Screen 
        name="QRScanner" 
        component={QRScannerScreen}
        options={{
          title: t('navigation.qrScanner'),
          drawerIcon: ({ color, size }) => (
            <Ionicons name={icons.scanning.qrCode} size={size} color={color} />
          ),
        }}
      />
      <Drawer.Screen 
        name="Points" 
        component={PointsScreen}
        options={{
          title: t('navigation.points'),
          drawerIcon: ({ color, size }) => (
            <Ionicons name={icons.rewards.gift} size={size} color={color} />
          ),
        }}
      />
      <Drawer.Screen 
        name="ActivityLogs" 
        component={ActivityLogsScreen}
        options={{
          title: t('navigation.activityLogs'),
          drawerIcon: ({ color, size }) => (
            <Ionicons name={icons.misc.list} size={size} color={color} />
          ),
        }}
      />
      <Drawer.Screen 
        name="Calendar" 
        component={CalendarScreen}
        options={{
          title: t('navigation.calendar'),
          drawerIcon: ({ color, size }) => (
            <Ionicons name={icons.activity.calendar} size={size} color={color} />
          ),
        }}
      />
      <Drawer.Screen 
        name="Facilities" 
        component={FacilitiesScreen}
        options={{
          title: t('navigation.facilities'),
          drawerIcon: ({ color, size }) => (
            <Ionicons name={icons.facility.business} size={size} color={color} />
          ),
        }}
      />
      <Drawer.Screen 
        name="FacilityDetail" 
        component={FacilityDetailScreen}
        options={{
          title: t('facilities.details'),
          drawerItemStyle: { display: 'none' },
        }}
      />
      <Drawer.Screen 
        name="Membership" 
        component={MembershipScreen}
        options={{
          title: t('navigation.membership'),
          drawerIcon: ({ color, size }) => (
            <Ionicons name={icons.membership.card} size={size} color={color} />
          ),
        }}
      />
      <Drawer.Screen 
        name="AITrainer" 
        component={AITrainerScreen}
        options={{
          title: t('navigation.aiTrainer'),
          drawerIcon: ({ color, size }) => (
            <Ionicons name={icons.ai.robot} size={size} color={color} />
          ),
        }}
      />
      <Drawer.Screen 
        name="Settings" 
        component={SettingsScreen}
        options={{
          title: t('navigation.settings'),
          drawerIcon: ({ color, size }) => (
            <Ionicons name={icons.system.settings} size={size} color={color} />
          ),
        }}
      />
      <Drawer.Screen 
        name="Help" 
        component={HelpScreen}
        options={{
          title: t('navigation.help'),
          drawerIcon: ({ color, size }) => (
            <Ionicons name={icons.system.help} size={size} color={color} />
          ),
        }}
      />
      <Drawer.Screen 
        name="Terms" 
        component={TermsScreen}
        options={{
          title: t('settings.termsOfService'),
          drawerItemStyle: { display: 'none' },
        }}
      />
      <Drawer.Screen 
        name="Privacy" 
        component={PrivacyScreen}
        options={{
          title: t('settings.privacyPolicy'),
          drawerItemStyle: { display: 'none' },
        }}
      />
    </Drawer.Navigator>
  );
}