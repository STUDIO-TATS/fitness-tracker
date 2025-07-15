import React, { useEffect, useRef } from 'react';
import { View, StyleSheet, Animated } from 'react-native';
import { colors } from '../constants/colors';

interface LoadingDotsProps {
  size?: number;
  color?: string;
  animationDelay?: number;
}

export const LoadingDots: React.FC<LoadingDotsProps> = ({
  size = 8,
  color = colors.primary,
  animationDelay = 200,
}) => {
  const dot1Anim = useRef(new Animated.Value(0)).current;
  const dot2Anim = useRef(new Animated.Value(0)).current;
  const dot3Anim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const createDotAnimation = (animatedValue: Animated.Value, delay: number) => {
      return Animated.loop(
        Animated.sequence([
          Animated.delay(delay),
          Animated.timing(animatedValue, {
            toValue: 1,
            duration: 400,
            useNativeDriver: true,
          }),
          Animated.timing(animatedValue, {
            toValue: 0,
            duration: 400,
            useNativeDriver: true,
          }),
        ])
      );
    };

    const animation1 = createDotAnimation(dot1Anim, 0);
    const animation2 = createDotAnimation(dot2Anim, animationDelay);
    const animation3 = createDotAnimation(dot3Anim, animationDelay * 2);

    animation1.start();
    animation2.start();
    animation3.start();

    return () => {
      animation1.stop();
      animation2.stop();
      animation3.stop();
    };
  }, [animationDelay]);

  const dotStyle = {
    width: size,
    height: size,
    borderRadius: size / 2,
    backgroundColor: color,
    marginHorizontal: 2,
  };

  return (
    <View style={styles.container}>
      <Animated.View
        style={[
          dotStyle,
          {
            transform: [
              {
                scale: dot1Anim.interpolate({
                  inputRange: [0, 1],
                  outputRange: [0.8, 1.2],
                }),
              },
            ],
            opacity: dot1Anim.interpolate({
              inputRange: [0, 1],
              outputRange: [0.4, 1],
            }),
          },
        ]}
      />
      <Animated.View
        style={[
          dotStyle,
          {
            transform: [
              {
                scale: dot2Anim.interpolate({
                  inputRange: [0, 1],
                  outputRange: [0.8, 1.2],
                }),
              },
            ],
            opacity: dot2Anim.interpolate({
              inputRange: [0, 1],
              outputRange: [0.4, 1],
            }),
          },
        ]}
      />
      <Animated.View
        style={[
          dotStyle,
          {
            transform: [
              {
                scale: dot3Anim.interpolate({
                  inputRange: [0, 1],
                  outputRange: [0.8, 1.2],
                }),
              },
            ],
            opacity: dot3Anim.interpolate({
              inputRange: [0, 1],
              outputRange: [0.4, 1],
            }),
          },
        ]}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
});