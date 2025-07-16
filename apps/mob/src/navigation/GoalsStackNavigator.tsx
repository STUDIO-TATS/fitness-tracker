import React from "react";
import { createStackNavigator } from "@react-navigation/stack";
import GoalsScreen from "../screens/GoalsScreen";
import GoalsInputScreen from "../screens/GoalsInputScreen";

export type GoalsStackParamList = {
  GoalsMain: undefined;
  GoalsInput: undefined;
};

const Stack = createStackNavigator<GoalsStackParamList>();

export default function GoalsStackNavigator() {
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
      <Stack.Screen name="GoalsMain" component={GoalsScreen} />
      <Stack.Screen name="GoalsInput" component={GoalsInputScreen} />
    </Stack.Navigator>
  );
}