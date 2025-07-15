import "react-native-url-polyfill/auto";
import "react-native-gesture-handler";
import "./src/polyfills/structuredClone";
import React, { useState } from "react";
import { View, Text, TouchableOpacity, StyleSheet, ActivityIndicator } from "react-native";
import { SafeAreaProvider } from "react-native-safe-area-context";
import MaterialCommunityIcons from "react-native-vector-icons/MaterialCommunityIcons";
import Ionicons from "react-native-vector-icons/Ionicons";
import { DashboardScreen } from "./src/screens/DashboardScreen";
import { WorkoutScreen } from "./src/screens/WorkoutScreen";
import { GoalsScreen } from "./src/screens/GoalsScreen";
import { MeasurementScreen } from "./src/screens/MeasurementScreen";
import { ProfileScreen } from "./src/screens/ProfileScreen";
import { AuthScreen } from "./src/screens/AuthScreen";
import { useAuth } from "./src/hooks/useAuth";

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  tabBar: {
    flexDirection: "row",
    backgroundColor: "#FFFFFF",
    borderTopWidth: 1,
    borderTopColor: "#E5E7EB",
    paddingBottom: 5,
    paddingTop: 5,
    height: 60,
  },
  tabItem: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  tabText: {
    fontSize: 12,
    fontWeight: "600",
    marginTop: 2,
  },
});

export default function App() {
  const [activeTab, setActiveTab] = useState("Dashboard");
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <SafeAreaProvider>
        <View style={[styles.container, { justifyContent: 'center', alignItems: 'center' }]}>
          <ActivityIndicator size="large" color="#2563EB" />
        </View>
      </SafeAreaProvider>
    );
  }

  if (!user) {
    return (
      <SafeAreaProvider>
        <AuthScreen />
      </SafeAreaProvider>
    );
  }

  const renderScreen = () => {
    switch (activeTab) {
      case "Dashboard":
        return <DashboardScreen />;
      case "Workout":
        return <WorkoutScreen />;
      case "Goals":
        return <GoalsScreen />;
      case "Measurement":
        return <MeasurementScreen />;
      case "Profile":
        return <ProfileScreen />;
      default:
        return <DashboardScreen />;
    }
  };

  return (
    <SafeAreaProvider>
      <View style={styles.container}>
        {renderScreen()}
        <View style={styles.tabBar}>
          <TouchableOpacity
            style={styles.tabItem}
            onPress={() => setActiveTab("Dashboard")}
          >
            <Ionicons
              name="home"
              size={24}
              color={activeTab === "Dashboard" ? "#2563EB" : "#6B7280"}
            />
            <Text
              style={[
                styles.tabText,
                { color: activeTab === "Dashboard" ? "#2563EB" : "#6B7280" },
              ]}
            >
              ホーム
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.tabItem}
            onPress={() => setActiveTab("Workout")}
          >
            <MaterialCommunityIcons
              name="dumbbell"
              size={24}
              color={activeTab === "Workout" ? "#2563EB" : "#6B7280"}
            />
            <Text
              style={[
                styles.tabText,
                { color: activeTab === "Workout" ? "#2563EB" : "#6B7280" },
              ]}
            >
              ワークアウト
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.tabItem}
            onPress={() => setActiveTab("Goals")}
          >
            <Ionicons
              name="trophy"
              size={24}
              color={activeTab === "Goals" ? "#2563EB" : "#6B7280"}
            />
            <Text
              style={[
                styles.tabText,
                { color: activeTab === "Goals" ? "#2563EB" : "#6B7280" },
              ]}
            >
              目標
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.tabItem}
            onPress={() => setActiveTab("Measurement")}
          >
            <Ionicons
              name="scale"
              size={24}
              color={activeTab === "Measurement" ? "#2563EB" : "#6B7280"}
            />
            <Text
              style={[
                styles.tabText,
                { color: activeTab === "Measurement" ? "#2563EB" : "#6B7280" },
              ]}
            >
              体測定
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.tabItem}
            onPress={() => setActiveTab("Profile")}
          >
            <Ionicons
              name="person"
              size={24}
              color={activeTab === "Profile" ? "#2563EB" : "#6B7280"}
            />
            <Text
              style={[
                styles.tabText,
                { color: activeTab === "Profile" ? "#2563EB" : "#6B7280" },
              ]}
            >
              プロフィール
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    </SafeAreaProvider>
  );
}
