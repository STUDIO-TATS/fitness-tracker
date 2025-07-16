import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Ionicons } from '@expo/vector-icons';
import HomeScreen from '../screens/HomeScreen';
import GoalsScreen from '../screens/GoalsScreen';
import MeasurementScreen from '../screens/MeasurementScreen';
import WorkoutScreen from '../screens/WorkoutScreen';
import { icons } from '../constants/icons';
import { theme } from '../constants/theme';
import { useI18n } from '../hooks/useI18n';

const Tab = createBottomTabNavigator();

export default function TabNavigator() {
  const { t } = useI18n();

  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        tabBarIcon: ({ focused, color, size }) => {
          let iconName: keyof typeof Ionicons.glyphMap = icons.navigation.home;

          if (route.name === 'Home') {
            iconName = focused ? icons.navigation.home : icons.navigation.homeOutline;
          } else if (route.name === 'Goals') {
            iconName = focused ? icons.navigation.goals : icons.navigation.goalsOutline;
          } else if (route.name === 'Measurement') {
            iconName = focused ? icons.navigation.measurement : icons.navigation.measurementOutline;
          } else if (route.name === 'Workout') {
            iconName = focused ? icons.navigation.workout : icons.navigation.workoutOutline;
          }

          return <Ionicons name={iconName} size={size} color={color} />;
        },
        tabBarActiveTintColor: theme.colors.action.primary,
        tabBarInactiveTintColor: theme.colors.text.tertiary,
        tabBarStyle: {
          backgroundColor: theme.colors.background.primary,
          borderTopColor: theme.colors.border.light,
          height: 80,
          paddingBottom: 20,
          paddingTop: 10,
          ...theme.shadows.sm,
        },
        tabBarLabelStyle: {
          fontSize: theme.fontSize.xs,
          fontWeight: theme.fontWeight.semibold,
        },
        headerShown: false,
      })}
    >
      <Tab.Screen 
        name="Home" 
        component={HomeScreen} 
        options={{ tabBarLabel: t('navigation.home') }}
      />
      <Tab.Screen 
        name="Goals" 
        component={GoalsScreen}
        options={{ tabBarLabel: t('navigation.goals') }}
      />
      <Tab.Screen 
        name="Measurement" 
        component={MeasurementScreen}
        options={{ tabBarLabel: t('navigation.measurement') }}
      />
      <Tab.Screen 
        name="Workout" 
        component={WorkoutScreen}
        options={{ tabBarLabel: t('navigation.workout') }}
      />
    </Tab.Navigator>
  );
}