import React, { useState, useEffect } from "react";
import { TouchableOpacity } from "react-native";
import { createDrawerNavigator, DrawerNavigationProp } from "@react-navigation/drawer";
import { Ionicons } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";
import TabNavigator from "./TabNavigator";
import { NotificationBadge } from "../components/NotificationBadge";
import { icons } from "../constants/icons";
import { theme } from "../constants/theme";
import { useI18n } from "../hooks/useI18n";
import { RootDrawerParamList } from "../types/navigation";
import { supabase } from "../lib/supabase";
import { useAuth } from "../hooks/useAuth";
import NotificationScreen from "../screens/NotificationScreen";

const Drawer = createDrawerNavigator<RootDrawerParamList>();

export default function DrawerNavigator() {
  const { t } = useI18n();
  const navigation = useNavigation<any>();
  const { session } = useAuth();
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    if (session?.user?.id) {
      fetchUnreadCount();
      
      // リアルタイムサブスクリプションを設定
      const subscription = supabase
        .channel('notifications')
        .on(
          'postgres_changes',
          {
            event: '*',
            schema: 'public',
            table: 'notifications',
            filter: `user_id=eq.${session.user.id}`,
          },
          () => {
            fetchUnreadCount();
          }
        )
        .subscribe();

      return () => {
        subscription.unsubscribe();
      };
    }
  }, [session]);

  const fetchUnreadCount = async () => {
    if (!session?.user?.id) return;
    
    try {
      const { count, error } = await supabase
        .from('notifications')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', session.user.id)
        .eq('is_read', false);

      if (error) throw error;
      setUnreadCount(count || 0);
    } catch (error) {
      console.error('Error fetching unread count:', error);
    }
  };

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
        swipeEnabled: true,
      }}
    >
      <Drawer.Screen
        name="Main"
        component={TabNavigator}
        options={({ navigation, route }) => {
          // 現在のタブに基づいてタイトルを決定
          const getTitle = () => {
            const state = navigation.getState();
            const tabState = state.routes[state.index]?.state;
            
            if (tabState) {
              const activeTab = tabState.routes[tabState.index || 0];
              switch (activeTab.name) {
                case 'Home':
                  return "Fitness Tracker";
                case 'Goals':
                  return t("navigation.goals");
                case 'Measurement':
                  return t("navigation.measurement");
                case 'Workout':
                  return t("navigation.workout");
                default:
                  return "Fitness Tracker";
              }
            }
            return "Fitness Tracker";
          };

          return {
            title: getTitle(),
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
            headerRight: () => (
              <NotificationBadge
                count={unreadCount}
                onPress={() => navigation.navigate('Notifications')}
              />
            ),
          };
        }}
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
        name="Notifications"
        component={NotificationScreen}
        options={{
          drawerLabel: t("navigation.notifications"),
          drawerIcon: ({ color, size }) => (
            <Ionicons name="notifications-outline" size={size} color={color} />
          ),
        }}
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