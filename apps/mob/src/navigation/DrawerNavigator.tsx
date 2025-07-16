import React from "react";
import { TouchableOpacity } from "react-native";
import { createDrawerNavigator, DrawerNavigationProp } from "@react-navigation/drawer";
import { Ionicons } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";
import TabNavigator from "./TabNavigator";
import { icons } from "../constants/icons";
import { theme } from "../constants/theme";
import { useI18n } from "../hooks/useI18n";
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
        // スライドアニメーションの設定
        drawerType: 'slide',
        overlayColor: 'rgba(0, 0, 0, 0.5)',
        gestureEnabled: true,
        swipeEnabled: true,
      }}
    >
      <Drawer.Screen
        name="Main"
        component={TabNavigator}
        options={({ navigation }) => ({
          title: "Fitness Tracker",
          drawerLabel: t("navigation.home"),
          drawerIcon: ({ color, size }) => (
            <Ionicons name={icons.navigation.home} size={size} color={color} />
          ),
          headerLeft: () => (
            <TouchableOpacity
              onPress={() => navigation.openDrawer()}
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
        })}
      />
      <Drawer.Screen
        name="Profile"
        component={TabNavigator}
        options={{
          drawerLabel: t("navigation.profile"),
          drawerIcon: ({ color, size }) => (
            <Ionicons
              name={icons.membership.person}
              size={size}
              color={color}
            />
          ),
          drawerItemStyle: { display: "flex" },
        }}
        listeners={({ navigation: drawerNav }) => ({
          drawerItemPress: (e) => {
            e.preventDefault();
            drawerNav.closeDrawer();
            navigation.navigate('Profile');
          },
        })}
      />
      <Drawer.Screen
        name="QRScanner"
        component={TabNavigator}
        options={{
          drawerLabel: t("navigation.qrScanner"),
          drawerIcon: ({ color, size }) => (
            <Ionicons name={icons.scanning.qrCode} size={size} color={color} />
          ),
          drawerItemStyle: { display: "flex" },
        }}
        listeners={({ navigation: drawerNav }) => ({
          drawerItemPress: (e) => {
            e.preventDefault();
            drawerNav.closeDrawer();
            navigation.navigate('QRScanner');
          },
        })}
      />
      <Drawer.Screen
        name="Points"
        component={TabNavigator}
        options={{
          drawerLabel: t("navigation.points"),
          drawerIcon: ({ color, size }) => (
            <Ionicons name={icons.rewards.gift} size={size} color={color} />
          ),
          drawerItemStyle: { display: "flex" },
        }}
        listeners={({ navigation: drawerNav }) => ({
          drawerItemPress: (e) => {
            e.preventDefault();
            drawerNav.closeDrawer();
            navigation.navigate('Points');
          },
        })}
      />
      <Drawer.Screen
        name="ActivityLogs"
        component={TabNavigator}
        options={{
          drawerLabel: t("navigation.activityLogs"),
          drawerIcon: ({ color, size }) => (
            <Ionicons name={icons.misc.list} size={size} color={color} />
          ),
          drawerItemStyle: { display: "flex" },
        }}
        listeners={({ navigation: drawerNav }) => ({
          drawerItemPress: (e) => {
            e.preventDefault();
            drawerNav.closeDrawer();
            navigation.navigate('ActivityLogs');
          },
        })}
      />
      <Drawer.Screen
        name="Calendar"
        component={TabNavigator}
        options={{
          drawerLabel: t("navigation.calendar"),
          drawerIcon: ({ color, size }) => (
            <Ionicons
              name={icons.activity.calendar}
              size={size}
              color={color}
            />
          ),
          drawerItemStyle: { display: "flex" },
        }}
        listeners={({ navigation: drawerNav }) => ({
          drawerItemPress: (e) => {
            e.preventDefault();
            drawerNav.closeDrawer();
            navigation.navigate('Calendar');
          },
        })}
      />
      <Drawer.Screen
        name="Facilities"
        component={TabNavigator}
        options={{
          drawerLabel: t("navigation.facilities"),
          drawerIcon: ({ color, size }) => (
            <Ionicons
              name={icons.facility.business}
              size={size}
              color={color}
            />
          ),
          drawerItemStyle: { display: "flex" },
        }}
        listeners={({ navigation: drawerNav }) => ({
          drawerItemPress: (e) => {
            e.preventDefault();
            drawerNav.closeDrawer();
            navigation.navigate('Facilities');
          },
        })}
      />
      <Drawer.Screen
        name="FacilityDetail"
        component={TabNavigator}
        options={{
          drawerItemStyle: { display: "none" },
        }}
      />
      <Drawer.Screen
        name="Membership"
        component={TabNavigator}
        options={{
          drawerLabel: t("navigation.membership"),
          drawerIcon: ({ color, size }) => (
            <Ionicons name={icons.membership.card} size={size} color={color} />
          ),
          drawerItemStyle: { display: "flex" },
        }}
        listeners={({ navigation: drawerNav }) => ({
          drawerItemPress: (e) => {
            e.preventDefault();
            drawerNav.closeDrawer();
            navigation.navigate('Membership');
          },
        })}
      />
      <Drawer.Screen
        name="AITrainer"
        component={TabNavigator}
        options={{
          drawerLabel: t("navigation.aiTrainer"),
          drawerIcon: ({ color, size }) => (
            <Ionicons name={icons.ai.robot} size={size} color={color} />
          ),
          drawerItemStyle: { display: "flex" },
        }}
        listeners={({ navigation: drawerNav }) => ({
          drawerItemPress: (e) => {
            e.preventDefault();
            drawerNav.closeDrawer();
            navigation.navigate('AITrainer');
          },
        })}
      />
      <Drawer.Screen
        name="Settings"
        component={TabNavigator}
        options={{
          drawerLabel: t("navigation.settings"),
          drawerIcon: ({ color, size }) => (
            <Ionicons name={icons.system.settings} size={size} color={color} />
          ),
          drawerItemStyle: { display: "flex" },
        }}
        listeners={({ navigation: drawerNav }) => ({
          drawerItemPress: (e) => {
            e.preventDefault();
            drawerNav.closeDrawer();
            navigation.navigate('Settings');
          },
        })}
      />
      <Drawer.Screen
        name="Help"
        component={TabNavigator}
        options={{
          drawerLabel: t("navigation.help"),
          drawerIcon: ({ color, size }) => (
            <Ionicons name={icons.system.help} size={size} color={color} />
          ),
          drawerItemStyle: { display: "flex" },
        }}
        listeners={({ navigation: drawerNav }) => ({
          drawerItemPress: (e) => {
            e.preventDefault();
            drawerNav.closeDrawer();
            navigation.navigate('Help');
          },
        })}
      />
      <Drawer.Screen
        name="Terms"
        component={TabNavigator}
        options={{
          drawerItemStyle: { display: "none" },
        }}
      />
      <Drawer.Screen
        name="Privacy"
        component={TabNavigator}
        options={{
          drawerItemStyle: { display: "none" },
        }}
      />
    </Drawer.Navigator>
  );
}