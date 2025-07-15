import React, { useState } from "react";
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Alert } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { StatusBar } from "expo-status-bar";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import MaterialCommunityIcons from "react-native-vector-icons/MaterialCommunityIcons";
import Ionicons from "react-native-vector-icons/Ionicons";
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  runOnJS,
} from "react-native-reanimated";
import { signOut } from "../lib/supabase";

interface DrawerLayoutProps {
  children: React.ReactNode;
  title: string;
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f5f5f5",
  },
  header: {
    height: 64,
    backgroundColor: "#2563EB",
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    elevation: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
  },
  headerTitle: {
    color: "#FFFFFF",
    fontSize: 20,
    fontWeight: "bold",
    marginLeft: 16,
  },
  drawer: {
    position: "absolute",
    top: 0,
    left: 0,
    width: 280,
    height: "100%",
    backgroundColor: "#FFFFFF",
    elevation: 16,
    shadowColor: "#000",
    shadowOffset: { width: 2, height: 0 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
  },
  drawerHeader: {
    backgroundColor: "#2563EB",
    padding: 20,
    paddingTop: 50,
  },
  drawerTitle: {
    color: "#FFFFFF",
    fontSize: 24,
    fontWeight: "bold",
  },
  drawerFooter: {
    borderTopWidth: 1,
    borderTopColor: "#E5E7EB",
    padding: 20,
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
  },
  logoutButton: {
    flexDirection: "row",
    alignItems: "center",
    padding: 12,
    borderRadius: 8,
  },
  logoutText: {
    fontSize: 16,
    fontWeight: "600",
    color: "#EF4444",
    marginLeft: 12,
  },
  overlay: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
  },
  menuItem: {
    flexDirection: "row",
    alignItems: "center",
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#F3F4F6",
  },
  menuText: {
    fontSize: 16,
    color: "#374151",
    marginLeft: 16,
  },
});

export const DrawerLayout: React.FC<DrawerLayoutProps> = ({ children, title }) => {
  const [drawerOpen, setDrawerOpen] = useState(false);
  const translateX = useSharedValue(-280);
  const overlayOpacity = useSharedValue(0);

  const openDrawer = () => {
    setDrawerOpen(true);
    translateX.value = withTiming(0, { duration: 200 });
    overlayOpacity.value = withTiming(0.5, { duration: 200 });
  };

  const closeDrawer = () => {
    translateX.value = withTiming(-280, { duration: 200 });
    overlayOpacity.value = withTiming(0, { duration: 200 }, () => {
      runOnJS(setDrawerOpen)(false);
    });
  };

  const animatedDrawerStyle = useAnimatedStyle(() => {
    return {
      transform: [{ translateX: translateX.value }],
    };
  });

  const animatedOverlayStyle = useAnimatedStyle(() => {
    return {
      opacity: overlayOpacity.value,
    };
  });

  const handleSignOut = async () => {
    try {
      Alert.alert(
        "ログアウト",
        "ログアウトしますか？",
        [
          { text: "キャンセル", style: "cancel" },
          {
            text: "ログアウト",
            style: "destructive",
            onPress: async () => {
              try {
                await signOut();
                closeDrawer();
              } catch (error) {
                console.error("ログアウトエラー:", error);
                Alert.alert("エラー", "ログアウトに失敗しました");
              }
            }
          }
        ]
      );
    } catch (error) {
      console.error("ログアウトエラー:", error);
    }
  };

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <SafeAreaView style={{ flex: 1, backgroundColor: '#2563EB' }} edges={['top']}>
        <StatusBar style="light" backgroundColor="#2563EB" />
        <View style={styles.container}>
          {/* ヘッダー */}
          <View style={styles.header}>
            <TouchableOpacity onPress={openDrawer}>
              <Ionicons name="menu" size={24} color="#FFFFFF" />
            </TouchableOpacity>
            <Text style={styles.headerTitle}>{title}</Text>
          </View>

          {/* コンテンツ */}
          {children}

          {/* ドロワーメニュー */}
          {drawerOpen && (
            <>
              <Animated.View 
                style={[styles.overlay, animatedOverlayStyle]}
              >
                <TouchableOpacity
                  style={{ flex: 1 }}
                  activeOpacity={1}
                  onPress={closeDrawer}
                />
              </Animated.View>
              <Animated.View style={[styles.drawer, animatedDrawerStyle]}>
                <View style={styles.drawerHeader}>
                  <MaterialCommunityIcons name="dumbbell" size={32} color="#FFFFFF" />
                  <Text style={styles.drawerTitle}>FitTracker</Text>
                </View>

                <ScrollView style={{ flex: 1 }}>
                  <TouchableOpacity style={styles.menuItem}>
                    <Ionicons name="home-outline" size={24} color="#2563EB" />
                    <Text style={styles.menuText}>ダッシュボード</Text>
                  </TouchableOpacity>
                  <TouchableOpacity style={styles.menuItem}>
                    <Ionicons name="home-outline" size={24} color="#2563EB" />
                    <Text style={styles.menuText}>ホーム</Text>
                  </TouchableOpacity>
                  <TouchableOpacity style={styles.menuItem}>
                    <MaterialCommunityIcons name="dumbbell" size={24} color="#2563EB" />
                    <Text style={styles.menuText}>ワークアウト</Text>
                  </TouchableOpacity>
                  <TouchableOpacity style={styles.menuItem}>
                    <Ionicons name="flag-outline" size={24} color="#2563EB" />
                    <Text style={styles.menuText}>目標</Text>
                  </TouchableOpacity>
                  <TouchableOpacity style={styles.menuItem}>
                    <Ionicons name="analytics-outline" size={24} color="#2563EB" />
                    <Text style={styles.menuText}>体測定</Text>
                  </TouchableOpacity>
                  <TouchableOpacity style={styles.menuItem}>
                    <Ionicons name="person-outline" size={24} color="#2563EB" />
                    <Text style={styles.menuText}>プロフィール</Text>
                  </TouchableOpacity>
                </ScrollView>

                <View style={styles.drawerFooter}>
                  <TouchableOpacity style={styles.logoutButton} onPress={handleSignOut}>
                    <Ionicons name="log-out-outline" size={24} color="#EF4444" />
                    <Text style={styles.logoutText}>ログアウト</Text>
                  </TouchableOpacity>
                </View>
              </Animated.View>
            </>
          )}
        </View>
      </SafeAreaView>
    </GestureHandlerRootView>
  );
};