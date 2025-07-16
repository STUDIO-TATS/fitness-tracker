import React from 'react';
import { createStackNavigator, TransitionPresets } from '@react-navigation/stack';
import DrawerNavigator from './DrawerNavigator';
import ProfileScreen from '../screens/ProfileScreen';
import QRScannerScreen from '../screens/QRScannerScreen';
import PointsScreen from '../screens/PointsScreen';
import ActivityLogsScreen from '../screens/ActivityLogsScreen';
import CalendarScreen from '../screens/CalendarScreen';
import FacilitiesScreen from '../screens/FacilitiesScreen';
import FacilityDetailScreen from '../screens/FacilityDetailScreen';
import MembershipScreen from '../screens/MembershipScreen';
import AITrainerScreen from '../screens/AITrainerScreen';
import SettingsScreen from '../screens/SettingsScreen';
import HelpScreen from '../screens/HelpScreen';
import TermsScreen from '../screens/TermsScreen';
import PrivacyScreen from '../screens/PrivacyScreen';
import { theme } from '../constants/theme';
import { useI18n } from '../hooks/useI18n';
import { TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

const Stack = createStackNavigator();

export default function RootNavigator() {
  const { t } = useI18n();

  return (
    <Stack.Navigator
      screenOptions={{
        ...TransitionPresets.SlideFromRightIOS,
        headerStyle: {
          backgroundColor: theme.colors.action.primary,
          height: 120,
          ...theme.shadows.md,
        },
        headerTintColor: theme.colors.text.inverse,
        headerTitleStyle: {
          fontWeight: theme.fontWeight.bold,
          fontSize: theme.fontSize.xl,
        },
        headerBackTitleVisible: false,
        headerLeft: ({ onPress, canGoBack }) =>
          canGoBack ? (
            <TouchableOpacity
              onPress={onPress}
              style={{
                marginLeft: 16,
                padding: 8,
              }}
            >
              <Ionicons
                name="arrow-back"
                size={24}
                color={theme.colors.text.inverse}
              />
            </TouchableOpacity>
          ) : null,
      }}
    >
      <Stack.Screen
        name="Drawer"
        component={DrawerNavigator}
        options={{ headerShown: false }}
      />
      <Stack.Screen
        name="Profile"
        component={ProfileScreen}
        options={{ title: t("navigation.profile") }}
      />
      <Stack.Screen
        name="QRScanner"
        component={QRScannerScreen}
        options={{ title: t("navigation.qrScanner") }}
      />
      <Stack.Screen
        name="Points"
        component={PointsScreen}
        options={{ title: t("navigation.points") }}
      />
      <Stack.Screen
        name="ActivityLogs"
        component={ActivityLogsScreen}
        options={{ title: t("navigation.activityLogs") }}
      />
      <Stack.Screen
        name="Calendar"
        component={CalendarScreen}
        options={{ title: t("navigation.calendar") }}
      />
      <Stack.Screen
        name="Facilities"
        component={FacilitiesScreen}
        options={{ title: t("navigation.facilities") }}
      />
      <Stack.Screen
        name="FacilityDetail"
        component={FacilityDetailScreen}
        options={{ title: t("facilities.details") }}
      />
      <Stack.Screen
        name="Membership"
        component={MembershipScreen}
        options={{ title: t("navigation.membership") }}
      />
      <Stack.Screen
        name="AITrainer"
        component={AITrainerScreen}
        options={{ title: t("navigation.aiTrainer") }}
      />
      <Stack.Screen
        name="Settings"
        component={SettingsScreen}
        options={{ title: t("navigation.settings") }}
      />
      <Stack.Screen
        name="Help"
        component={HelpScreen}
        options={{ title: t("navigation.help") }}
      />
      <Stack.Screen
        name="Terms"
        component={TermsScreen}
        options={{ title: t("settings.termsOfService") }}
      />
      <Stack.Screen
        name="Privacy"
        component={PrivacyScreen}
        options={{ title: t("settings.privacyPolicy") }}
      />
    </Stack.Navigator>
  );
}