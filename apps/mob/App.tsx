import 'react-native-gesture-handler';
import './src/i18n'; // i18nを初期化
import { StatusBar } from 'expo-status-bar';
import { NavigationContainer } from '@react-navigation/native';
import { View, ActivityIndicator, StyleSheet } from 'react-native';
import DrawerNavigator from './src/navigation/DrawerNavigator';
import AuthScreen from './src/screens/AuthScreen';
import LoadingScreen from './src/screens/LoadingScreen';
import { useAuth } from './src/hooks/useAuth';
import { colors } from './src/constants/colors';

export default function App() {
  const { session, isLoading } = useAuth();

  if (isLoading) {
    return <LoadingScreen />;
  }

  return (
    <NavigationContainer>
      {session ? <DrawerNavigator /> : <AuthScreen />}
      <StatusBar style="light" />
    </NavigationContainer>
  );
}

