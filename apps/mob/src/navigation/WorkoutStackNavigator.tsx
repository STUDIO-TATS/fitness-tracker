import React from "react";
import { createStackNavigator } from "@react-navigation/stack";
import WorkoutScreen from "../screens/WorkoutScreen";
import WorkoutInputScreen from "../screens/WorkoutInputScreen";

export type WorkoutStackParamList = {
  WorkoutMain: undefined;
  WorkoutInput: undefined;
};

const Stack = createStackNavigator<WorkoutStackParamList>();

export default function WorkoutStackNavigator() {
  return (
    <Stack.Navigator
      screenOptions={{
        headerShown: false,
        cardStyleInterpolator: ({ current, layouts }) => {
          return {
            cardStyle: {
              transform: [
                {
                  translateX: current.progress.interpolate({
                    inputRange: [0, 1],
                    outputRange: [layouts.screen.width, 0],
                  }),
                },
              ],
            },
          };
        },
      }}
    >
      <Stack.Screen name="WorkoutMain" component={WorkoutScreen} />
      <Stack.Screen name="WorkoutInput" component={WorkoutInputScreen} />
    </Stack.Navigator>
  );
}