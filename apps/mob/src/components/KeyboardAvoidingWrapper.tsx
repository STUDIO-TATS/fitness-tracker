import React from "react";
import { KeyboardAvoidingView, Platform, SafeAreaView, StyleSheet } from "react-native";

interface KeyboardAvoidingWrapperProps {
  children: React.ReactNode;
  style?: any;
}

export const KeyboardAvoidingWrapper: React.FC<KeyboardAvoidingWrapperProps> = ({ children, style }) => {
  return (
    <SafeAreaView style={[styles.container, style]}>
      <KeyboardAvoidingView
        style={styles.keyboardAvoidingView}
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        keyboardVerticalOffset={0}
      >
        {children}
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  keyboardAvoidingView: {
    flex: 1,
  },
});