import React, { useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Animated,
  Dimensions,
  Easing,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '../constants/colors';
import { typography, spacing } from '../constants/styles';

const { width, height } = Dimensions.get('window');

export default function LoadingScreen() {
  const bounceAnim = useRef(new Animated.Value(0)).current;
  const scaleAnim = useRef(new Animated.Value(0.8)).current;
  const rotateAnim = useRef(new Animated.Value(0)).current;
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const pulseAnim = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    // フェードイン
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 800,
      useNativeDriver: true,
    }).start();

    // メインアイコンのスケールアニメーション
    Animated.sequence([
      Animated.timing(scaleAnim, {
        toValue: 1,
        duration: 600,
        easing: Easing.elastic(1),
        useNativeDriver: true,
      }),
      Animated.delay(200),
      Animated.loop(
        Animated.sequence([
          Animated.timing(pulseAnim, {
            toValue: 1.1,
            duration: 1000,
            easing: Easing.inOut(Easing.ease),
            useNativeDriver: true,
          }),
          Animated.timing(pulseAnim, {
            toValue: 1,
            duration: 1000,
            easing: Easing.inOut(Easing.ease),
            useNativeDriver: true,
          }),
        ])
      ),
    ]).start();

    // バウンスアニメーション
    Animated.loop(
      Animated.sequence([
        Animated.timing(bounceAnim, {
          toValue: 1,
          duration: 800,
          easing: Easing.out(Easing.quad),
          useNativeDriver: true,
        }),
        Animated.timing(bounceAnim, {
          toValue: 0,
          duration: 800,
          easing: Easing.in(Easing.quad),
          useNativeDriver: true,
        }),
      ])
    ).start();

    // 回転アニメーション
    Animated.loop(
      Animated.timing(rotateAnim, {
        toValue: 1,
        duration: 3000,
        easing: Easing.linear,
        useNativeDriver: true,
      })
    ).start();
  }, []);

  const bounceTransform = bounceAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [0, -20],
  });

  const rotateTransform = rotateAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '360deg'],
  });

  return (
    <View style={styles.container}>
      <Animated.View
        style={[
          styles.content,
          {
            opacity: fadeAnim,
            transform: [{ scale: scaleAnim }],
          },
        ]}
      >
        {/* メインアイコン */}
        <Animated.View
          style={[
            styles.mainIconContainer,
            {
              transform: [
                { scale: pulseAnim },
                { translateY: bounceTransform },
              ],
            },
          ]}
        >
          <View style={styles.iconBackground}>
            <Ionicons name="fitness" size={60} color={colors.white} />
          </View>
        </Animated.View>

        {/* 回転するアクセント */}
        <Animated.View
          style={[
            styles.accentRing,
            {
              transform: [{ rotate: rotateTransform }],
            },
          ]}
        >
          <View style={styles.accentDot1} />
          <View style={styles.accentDot2} />
          <View style={styles.accentDot3} />
        </Animated.View>

        {/* タイトル */}
        <Text style={styles.title}>Fitness Tracker</Text>
        <Text style={styles.subtitle}>健康的な毎日をサポート</Text>

        {/* ローディングバー */}
        <View style={styles.loadingContainer}>
          <View style={styles.loadingBar}>
            <Animated.View
              style={[
                styles.loadingFill,
                {
                  transform: [{ translateX: bounceTransform }],
                },
              ]}
            />
          </View>
          <Text style={styles.loadingText}>読み込み中...</Text>
        </View>
      </Animated.View>

      {/* 背景の装飾 */}
      <View style={styles.backgroundDecoration}>
        <Animated.View
          style={[
            styles.bgCircle1,
            {
              transform: [{ rotate: rotateTransform }],
            },
          ]}
        />
        <Animated.View
          style={[
            styles.bgCircle2,
            {
              transform: [{ rotate: rotateTransform }],
            },
          ]}
        />
        <Animated.View
          style={[
            styles.bgCircle3,
            {
              transform: [{ rotate: rotateTransform }],
            },
          ]}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.purple[50],
    justifyContent: 'center',
    alignItems: 'center',
  },
  content: {
    alignItems: 'center',
    zIndex: 1,
  },
  mainIconContainer: {
    marginBottom: spacing.xxxl,
  },
  iconBackground: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: colors.primary,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.3,
    shadowRadius: 20,
    elevation: 10,
  },
  accentRing: {
    position: 'absolute',
    top: -20,
    width: 160,
    height: 160,
    borderRadius: 80,
    borderWidth: 2,
    borderColor: colors.mint[300],
    borderStyle: 'dashed',
  },
  accentDot1: {
    position: 'absolute',
    top: -4,
    left: 76,
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: colors.mint[500],
  },
  accentDot2: {
    position: 'absolute',
    top: 76,
    right: -4,
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: colors.pink[500],
  },
  accentDot3: {
    position: 'absolute',
    bottom: -4,
    left: 76,
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: colors.purple[500],
  },
  title: {
    ...typography.screenTitle,
    color: colors.purple[700],
    marginBottom: spacing.sm,
    textAlign: 'center',
  },
  subtitle: {
    ...typography.body,
    color: colors.gray[600],
    marginBottom: spacing.xxxl,
    textAlign: 'center',
  },
  loadingContainer: {
    alignItems: 'center',
    width: 200,
  },
  loadingBar: {
    width: '100%',
    height: 4,
    backgroundColor: colors.gray[200],
    borderRadius: 2,
    overflow: 'hidden',
    marginBottom: spacing.md,
  },
  loadingFill: {
    width: '60%',
    height: '100%',
    backgroundColor: colors.primary,
    borderRadius: 2,
  },
  loadingText: {
    ...typography.small,
    color: colors.gray[500],
  },
  backgroundDecoration: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    zIndex: 0,
  },
  bgCircle1: {
    position: 'absolute',
    top: height * 0.1,
    left: width * 0.1,
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: colors.pink[200],
    opacity: 0.3,
  },
  bgCircle2: {
    position: 'absolute',
    top: height * 0.2,
    right: width * 0.15,
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.mint[300],
    opacity: 0.4,
  },
  bgCircle3: {
    position: 'absolute',
    bottom: height * 0.15,
    left: width * 0.2,
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: colors.purple[200],
    opacity: 0.2,
  },
});