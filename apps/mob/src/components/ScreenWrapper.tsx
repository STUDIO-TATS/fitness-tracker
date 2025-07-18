import React from 'react';
import {
  View,
  ScrollView,
  StyleSheet,
  RefreshControl,
  ViewStyle,
  KeyboardAvoidingView,
  Platform,
  TouchableWithoutFeedback,
  Keyboard,
  SafeAreaView,
} from 'react-native';
import { colors } from '../constants/colors';
import { layout } from '../constants/styles';

interface ScreenWrapperProps {
  children: React.ReactNode;
  backgroundColor?: string;
  scrollable?: boolean;
  noPadding?: boolean;
  refreshing?: boolean;
  onRefresh?: () => void;
  style?: ViewStyle;
  keyboardAvoiding?: boolean;
  dismissKeyboardOnTap?: boolean;
  refreshControl?: React.ReactElement;
  useSafeArea?: boolean;
}

export const ScreenWrapper: React.FC<ScreenWrapperProps> = ({
  children,
  backgroundColor = colors.pink[50],
  scrollable = false,
  noPadding = false,
  refreshing = false,
  onRefresh,
  style,
  keyboardAvoiding = true,
  dismissKeyboardOnTap = true,
  refreshControl,
  useSafeArea = false,
}) => {
  const contentPadding = noPadding ? 0 : layout.screenPadding;
  
  const content = scrollable ? (
    <ScrollView
      showsVerticalScrollIndicator={true}
      style={{ flex: 1 }}
      contentContainerStyle={{ 
        paddingTop: contentPadding,
        paddingBottom: contentPadding + 100,
      }}
      keyboardShouldPersistTaps="handled"
      keyboardDismissMode="on-drag"
      scrollEnabled={true}
      bounces={true}
      alwaysBounceVertical={true}
      refreshControl={
        refreshControl || (onRefresh ? (
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        ) : undefined)
      }
    >
      {dismissKeyboardOnTap ? (
        <TouchableWithoutFeedback onPress={() => Keyboard.dismiss()}>
          <View style={{ flex: 1 }}>
            {children}
          </View>
        </TouchableWithoutFeedback>
      ) : (
        children
      )}
    </ScrollView>
  ) : (
    dismissKeyboardOnTap ? (
      <TouchableWithoutFeedback onPress={() => Keyboard.dismiss()}>
        <View style={{ flex: 1 }}>
          {children}
        </View>
      </TouchableWithoutFeedback>
    ) : (
      children
    )
  );

  // SafeAreaとKeyboardAvoidingを組み合わせる場合の正しい構造
  if (useSafeArea && keyboardAvoiding) {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor }]}>
        <KeyboardAvoidingView
          style={[styles.container, style]}
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          keyboardVerticalOffset={Platform.OS === 'ios' ? 88 : 20}
        >
          {content}
        </KeyboardAvoidingView>
      </SafeAreaView>
    );
  }

  // SafeAreaのみの場合
  if (useSafeArea) {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor }]}>
        <View style={[styles.container, style]}>
          {content}
        </View>
      </SafeAreaView>
    );
  }

  // KeyboardAvoidingのみの場合
  if (keyboardAvoiding) {
    return (
      <KeyboardAvoidingView
        style={[styles.container, { backgroundColor }, style]}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 88 : 20}
      >
        {content}
      </KeyboardAvoidingView>
    );
  }

  // どちらも使わない場合
  return (
    <View
      style={[
        styles.container,
        { backgroundColor },
        style,
      ]}
    >
      {content}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});