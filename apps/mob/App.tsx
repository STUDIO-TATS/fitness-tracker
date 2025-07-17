import 'react-native-gesture-handler';
import './src/i18n'; // i18nを初期化
import { StatusBar } from 'expo-status-bar';
import { NavigationContainer } from '@react-navigation/native';
import React from 'react';
import { View, ActivityIndicator, StyleSheet } from 'react-native';
import RootNavigator from './src/navigation/RootNavigator';
import AuthScreen from './src/screens/AuthScreen';
import LoadingScreen from './src/screens/LoadingScreen';
import { useAuth } from './src/hooks/useAuth';
import { useFonts } from './src/hooks/useFonts';
import { useGuestBackup } from './src/hooks/useGuestBackup';
import { NotificationProvider } from './src/contexts/NotificationContext';
import { colors } from './src/constants/colors';

export default function App() {
  const { session, isLoading } = useAuth();
  const fontsLoaded = useFonts();
  
  // ゲストデータの自動バックアップ
  useGuestBackup();

  if (isLoading || !fontsLoaded) {
    return <LoadingScreen />;
  }

  // Show main app for any authenticated user (including anonymous)
  const showMainApp = !!session;

  return (
    <NavigationContainer>
      <NotificationProvider>
        {showMainApp ? <RootNavigator /> : <AuthScreen />}
        <StatusBar style="light" />
      </NotificationProvider>
    </NavigationContainer>
  );
}

