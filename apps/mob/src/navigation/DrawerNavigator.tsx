import React, { useState, useEffect } from "react";
import { TouchableOpacity } from "react-native";
import { createDrawerNavigator } from "@react-navigation/drawer";
import { Ionicons } from "@expo/vector-icons";
import { useNavigation, useNavigationState } from "@react-navigation/native";
import TabNavigator from "./TabNavigator";
import CalendarScreen from "../screens/CalendarScreen";
import QRScannerScreen from "../screens/QRScannerScreen";
import FacilitiesScreen from "../screens/FacilitiesScreen";
import PointsScreen from "../screens/PointsScreen";
import ActivityLogsScreen from "../screens/ActivityLogsScreen";
import ProfileScreen from "../screens/ProfileScreen";
import SettingsScreen from "../screens/SettingsScreen";
import MembershipScreen from "../screens/MembershipScreen";
import AITrainerScreen from "../screens/AITrainerScreen";
import HelpScreen from "../screens/HelpScreen";
import TermsScreen from "../screens/TermsScreen";
import PrivacyScreen from "../screens/PrivacyScreen";
import { NotificationBadge } from "../components/NotificationBadge";
import { icons } from "../constants/icons";
import { theme } from "../constants/theme";
import { useI18n } from "../hooks/useI18n";
import { useNotifications } from "../contexts/NotificationContext";
import { RootDrawerParamList } from "../types/navigation";

const Drawer = createDrawerNavigator<RootDrawerParamList>();

export default function DrawerNavigator() {
  const { t } = useI18n();
  const navigation = useNavigation<any>();

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
          height: 120,
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
        options={({ navigation: drawerNav }) => ({
          drawerLabel: t("navigation.home"),
          drawerIcon: ({ color, size }) => (
            <Ionicons name={icons.navigation.homeOutline} size={size} color={color} />
          ),
          headerShown: false, // TabNavigatorで個別にヘッダーを設定するため
        })}
      />
      <Drawer.Screen
        name="Calendar"
        component={CalendarScreen}
        options={({ navigation: drawerNav }) => ({
          drawerLabel: t("navigation.calendar"),
          drawerIcon: ({ color, size }) => (
            <Ionicons name="calendar-outline" size={size} color={color} />
          ),
          headerTitle: t("navigation.calendar"),
          headerLeft: () => (
            <TouchableOpacity
              onPress={() => drawerNav.openDrawer()}
              style={{
                marginLeft: 16,
                padding: 8,
              }}
            >
              <Ionicons
                name="menu"
                size={24}
                color={theme.colors.text.inverse}
              />
            </TouchableOpacity>
          ),
          headerRight: () => (
            <NotificationBadge
              onPress={() => navigation.navigate('Notifications')}
            />
          ),
        })}
      />
      <Drawer.Screen
        name="QRScanner"
        component={QRScannerScreen}
        options={({ navigation: drawerNav }) => ({
          drawerLabel: t("navigation.qrScanner"),
          drawerIcon: ({ color, size }) => (
            <Ionicons name="qr-code-outline" size={size} color={color} />
          ),
          headerTitle: t("navigation.qrScanner"),
          headerLeft: () => (
            <TouchableOpacity
              onPress={() => drawerNav.openDrawer()}
              style={{
                marginLeft: 16,
                padding: 8,
              }}
            >
              <Ionicons
                name="menu"
                size={24}
                color={theme.colors.text.inverse}
              />
            </TouchableOpacity>
          ),
          headerRight: () => (
            <NotificationBadge
              onPress={() => navigation.navigate('Notifications')}
            />
          ),
        })}
      />
      <Drawer.Screen
        name="Facilities"
        component={FacilitiesScreen}
        options={({ navigation: drawerNav }) => ({
          drawerLabel: t("navigation.facilities"),
          drawerIcon: ({ color, size }) => (
            <Ionicons name="business-outline" size={size} color={color} />
          ),
          headerTitle: t("navigation.facilities"),
          headerLeft: () => (
            <TouchableOpacity
              onPress={() => drawerNav.openDrawer()}
              style={{
                marginLeft: 16,
                padding: 8,
              }}
            >
              <Ionicons
                name="menu"
                size={24}
                color={theme.colors.text.inverse}
              />
            </TouchableOpacity>
          ),
          headerRight: () => (
            <NotificationBadge
              onPress={() => navigation.navigate('Notifications')}
            />
          ),
        })}
      />
      <Drawer.Screen
        name="Points"
        component={PointsScreen}
        options={({ navigation: drawerNav }) => ({
          drawerLabel: t("navigation.points"),
          drawerIcon: ({ color, size }) => (
            <Ionicons name="star-outline" size={size} color={color} />
          ),
          headerTitle: t("navigation.points"),
          headerLeft: () => (
            <TouchableOpacity
              onPress={() => drawerNav.openDrawer()}
              style={{
                marginLeft: 16,
                padding: 8,
              }}
            >
              <Ionicons
                name="menu"
                size={24}
                color={theme.colors.text.inverse}
              />
            </TouchableOpacity>
          ),
          headerRight: () => (
            <NotificationBadge
              onPress={() => navigation.navigate('Notifications')}
            />
          ),
        })}
      />
      <Drawer.Screen
        name="ActivityLogs"
        component={ActivityLogsScreen}
        options={({ navigation: drawerNav }) => ({
          drawerLabel: t("navigation.activityLogs"),
          drawerIcon: ({ color, size }) => (
            <Ionicons name="list-outline" size={size} color={color} />
          ),
          headerTitle: t("navigation.activityLogs"),
          headerLeft: () => (
            <TouchableOpacity
              onPress={() => drawerNav.openDrawer()}
              style={{
                marginLeft: 16,
                padding: 8,
              }}
            >
              <Ionicons
                name="menu"
                size={24}
                color={theme.colors.text.inverse}
              />
            </TouchableOpacity>
          ),
          headerRight: () => (
            <NotificationBadge
              onPress={() => navigation.navigate('Notifications')}
            />
          ),
        })}
      />
      <Drawer.Screen
        name="Profile"
        component={ProfileScreen}
        options={({ navigation: drawerNav }) => ({
          drawerLabel: t("navigation.profile"),
          drawerIcon: ({ color, size }) => (
            <Ionicons name="person-outline" size={size} color={color} />
          ),
          headerTitle: t("navigation.profile"),
          headerLeft: () => (
            <TouchableOpacity
              onPress={() => drawerNav.openDrawer()}
              style={{
                marginLeft: 16,
                padding: 8,
              }}
            >
              <Ionicons
                name="menu"
                size={24}
                color={theme.colors.text.inverse}
              />
            </TouchableOpacity>
          ),
          headerRight: () => (
            <NotificationBadge
              onPress={() => navigation.navigate('Notifications')}
            />
          ),
        })}
      />
      <Drawer.Screen
        name="Settings"
        component={SettingsScreen}
        options={({ navigation: drawerNav }) => ({
          drawerLabel: t("navigation.settings"),
          drawerIcon: ({ color, size }) => (
            <Ionicons name="settings-outline" size={size} color={color} />
          ),
          headerTitle: t("navigation.settings"),
          headerLeft: () => (
            <TouchableOpacity
              onPress={() => drawerNav.openDrawer()}
              style={{
                marginLeft: 16,
                padding: 8,
              }}
            >
              <Ionicons
                name="menu"
                size={24}
                color={theme.colors.text.inverse}
              />
            </TouchableOpacity>
          ),
          headerRight: () => (
            <NotificationBadge
              onPress={() => navigation.navigate('Notifications')}
            />
          ),
        })}
      />
      <Drawer.Screen
        name="Membership"
        component={MembershipScreen}
        options={({ navigation: drawerNav }) => ({
          drawerLabel: t("navigation.membership"),
          drawerIcon: ({ color, size }) => (
            <Ionicons name="card-outline" size={size} color={color} />
          ),
          headerTitle: t("navigation.membership"),
          headerLeft: () => (
            <TouchableOpacity
              onPress={() => drawerNav.openDrawer()}
              style={{
                marginLeft: 16,
                padding: 8,
              }}
            >
              <Ionicons
                name="menu"
                size={24}
                color={theme.colors.text.inverse}
              />
            </TouchableOpacity>
          ),
          headerRight: () => (
            <NotificationBadge
              onPress={() => navigation.navigate('Notifications')}
            />
          ),
        })}
      />
      <Drawer.Screen
        name="AITrainer"
        component={AITrainerScreen}
        options={({ navigation: drawerNav }) => ({
          drawerLabel: t("navigation.aiTrainer"),
          drawerIcon: ({ color, size }) => (
            <Ionicons name="fitness-outline" size={size} color={color} />
          ),
          headerTitle: t("navigation.aiTrainer"),
          headerLeft: () => (
            <TouchableOpacity
              onPress={() => drawerNav.openDrawer()}
              style={{
                marginLeft: 16,
                padding: 8,
              }}
            >
              <Ionicons
                name="menu"
                size={24}
                color={theme.colors.text.inverse}
              />
            </TouchableOpacity>
          ),
          headerRight: () => (
            <NotificationBadge
              onPress={() => navigation.navigate('Notifications')}
            />
          ),
        })}
      />
      <Drawer.Screen
        name="Help"
        component={HelpScreen}
        options={({ navigation: drawerNav }) => ({
          drawerLabel: t("navigation.help"),
          drawerIcon: ({ color, size }) => (
            <Ionicons name="help-circle-outline" size={size} color={color} />
          ),
          headerTitle: t("navigation.help"),
          headerLeft: () => (
            <TouchableOpacity
              onPress={() => drawerNav.openDrawer()}
              style={{
                marginLeft: 16,
                padding: 8,
              }}
            >
              <Ionicons
                name="menu"
                size={24}
                color={theme.colors.text.inverse}
              />
            </TouchableOpacity>
          ),
          headerRight: () => (
            <NotificationBadge
              onPress={() => navigation.navigate('Notifications')}
            />
          ),
        })}
      />
      <Drawer.Screen
        name="Terms"
        component={TermsScreen}
        options={({ navigation: drawerNav }) => ({
          drawerLabel: t("navigation.terms"),
          drawerIcon: ({ color, size }) => (
            <Ionicons name="document-text-outline" size={size} color={color} />
          ),
          headerTitle: t("navigation.terms"),
          headerLeft: () => (
            <TouchableOpacity
              onPress={() => drawerNav.openDrawer()}
              style={{
                marginLeft: 16,
                padding: 8,
              }}
            >
              <Ionicons
                name="menu"
                size={24}
                color={theme.colors.text.inverse}
              />
            </TouchableOpacity>
          ),
          headerRight: () => (
            <NotificationBadge
              onPress={() => navigation.navigate('Notifications')}
            />
          ),
        })}
      />
      <Drawer.Screen
        name="Privacy"
        component={PrivacyScreen}
        options={({ navigation: drawerNav }) => ({
          drawerLabel: t("navigation.privacy"),
          drawerIcon: ({ color, size }) => (
            <Ionicons name="shield-checkmark-outline" size={size} color={color} />
          ),
          headerTitle: t("navigation.privacy"),
          headerLeft: () => (
            <TouchableOpacity
              onPress={() => drawerNav.openDrawer()}
              style={{
                marginLeft: 16,
                padding: 8,
              }}
            >
              <Ionicons
                name="menu"
                size={24}
                color={theme.colors.text.inverse}
              />
            </TouchableOpacity>
          ),
          headerRight: () => (
            <NotificationBadge
              onPress={() => navigation.navigate('Notifications')}
            />
          ),
        })}
      />
    </Drawer.Navigator>
  );
}