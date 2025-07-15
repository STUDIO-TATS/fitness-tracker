import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Ionicons } from '@expo/vector-icons';
import HomeScreen from '../screens/HomeScreen';
import GoalsScreen from '../screens/GoalsScreen';
import MeasurementScreen from '../screens/MeasurementScreen';
import WorkoutScreen from '../screens/WorkoutScreen';
import { colors } from '../constants/colors';

const Tab = createBottomTabNavigator();

export default function TabNavigator() {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        tabBarIcon: ({ focused, color, size }) => {
          let iconName: keyof typeof Ionicons.glyphMap = 'home';

          if (route.name === 'ホーム') {
            iconName = focused ? 'home' : 'home-outline';
          } else if (route.name === '目標') {
            iconName = focused ? 'flag' : 'flag-outline';
          } else if (route.name === '体測定') {
            iconName = focused ? 'body' : 'body-outline';
          } else if (route.name === 'ワークアウト') {
            iconName = focused ? 'barbell' : 'barbell-outline';
          }

          return <Ionicons name={iconName} size={size} color={color} />;
        },
        tabBarActiveTintColor: colors.primary,
        tabBarInactiveTintColor: colors.gray[400],
        tabBarStyle: {
          backgroundColor: colors.white,
          borderTopColor: colors.gray[200],
          height: 80,
          paddingBottom: 20,
          paddingTop: 10,
        },
        tabBarLabelStyle: {
          fontSize: 12,
          fontWeight: '600',
        },
        headerShown: false,
      })}
    >
      <Tab.Screen name="ホーム" component={HomeScreen} />
      <Tab.Screen name="目標" component={GoalsScreen} />
      <Tab.Screen name="体測定" component={MeasurementScreen} />
      <Tab.Screen name="ワークアウト" component={WorkoutScreen} />
    </Tab.Navigator>
  );
}