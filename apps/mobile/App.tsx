import "react-native-url-polyfill/auto";
import "react-native-gesture-handler";
import "./src/polyfills/structuredClone";
import React from "react";
import { View, ActivityIndicator } from "react-native";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { NavigationContainer } from "@react-navigation/native";
import { AuthScreen } from "./src/screens/AuthScreen";
import { MainNavigator } from "./src/navigation/MainNavigator";
import { useAuth } from "./src/hooks/useAuth";

export default function App() {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <SafeAreaProvider>
        <View
          style={{ flex: 1, justifyContent: "center", alignItems: "center" }}
        >
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

  return (
    <SafeAreaProvider>
      <NavigationContainer>
        <MainNavigator />
      </NavigationContainer>
    </SafeAreaProvider>
  );
}
