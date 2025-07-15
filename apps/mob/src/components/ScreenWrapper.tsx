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
}) => {
  const contentPadding = noPadding ? 0 : layout.screenPadding;
  
  const content = scrollable ? (
    <ScrollView
      showsVerticalScrollIndicator={true}
      style={{ flex: 1 }}
      contentContainerStyle={{ 
        paddingBottom: contentPadding,
      }}
      keyboardShouldPersistTaps="handled"
      scrollEnabled={true}
      bounces={true}
      alwaysBounceVertical={true}
      refreshControl={
        onRefresh ? (
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        ) : undefined
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

  const wrappedContent = content;

  if (keyboardAvoiding) {
    return (
      <KeyboardAvoidingView
        style={[styles.container, { backgroundColor }, style]}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 0}
      >
        {wrappedContent}
      </KeyboardAvoidingView>
    );
  }

  return (
    <View
      style={[
        styles.container,
        { backgroundColor },
        style,
      ]}
    >
      {wrappedContent}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});