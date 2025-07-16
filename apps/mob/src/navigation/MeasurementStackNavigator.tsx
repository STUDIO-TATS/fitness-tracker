import React from "react";
import { createStackNavigator } from "@react-navigation/stack";
import MeasurementScreen from "../screens/MeasurementScreen";
import MeasurementInputScreen from "../screens/MeasurementInputScreen";

export type MeasurementStackParamList = {
  MeasurementMain: undefined;
  MeasurementInput: undefined;
};

const Stack = createStackNavigator<MeasurementStackParamList>();

export default function MeasurementStackNavigator() {
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
      <Stack.Screen name="MeasurementMain" component={MeasurementScreen} />
      <Stack.Screen name="MeasurementInput" component={MeasurementInputScreen} />
    </Stack.Navigator>
  );
}