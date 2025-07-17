import React from 'react';
import { TouchableOpacity } from 'react-native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { DrawerNavigationProp } from '@react-navigation/drawer';
import HomeScreen from '../screens/HomeScreen';
import GoalsStackNavigator from './GoalsStackNavigator';
import MeasurementStackNavigator from './MeasurementStackNavigator';
import WorkoutStackNavigator from './WorkoutStackNavigator';
import { NotificationBadge } from '../components/NotificationBadge';
import { icons } from '../constants/icons';
import { theme } from '../constants/theme';
import { useI18n } from '../hooks/useI18n';
import { RootDrawerParamList } from '../types/navigation';

const Tab = createBottomTabNavigator();

export default function TabNavigator() {
  const { t } = useI18n();
  const navigation = useNavigation<DrawerNavigationProp<RootDrawerParamList>>();
  const rootNavigation = useNavigation<any>();

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
        headerShown: true,
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
            onPress={() => rootNavigation.navigate('Notifications')}
          />
        ),
      })}
    >
      <Tab.Screen 
        name="Home" 
        component={HomeScreen} 
        options={{ 
          tabBarLabel: t('navigation.home'),
          headerTitle: t('navigation.home')
        }}
      />
      <Tab.Screen 
        name="Goals" 
        component={GoalsStackNavigator}
        options={{ 
          tabBarLabel: t('navigation.goals'),
          headerTitle: t('navigation.goals')
        }}
      />
      <Tab.Screen 
        name="Measurement" 
        component={MeasurementStackNavigator}
        options={{ 
          tabBarLabel: t('navigation.measurement'),
          headerTitle: t('navigation.measurement')
        }}
      />
      <Tab.Screen 
        name="Workout" 
        component={WorkoutStackNavigator}
        options={{ 
          tabBarLabel: t('navigation.workout'),
          headerTitle: t('navigation.workout')
        }}
      />
    </Tab.Navigator>
  );
}