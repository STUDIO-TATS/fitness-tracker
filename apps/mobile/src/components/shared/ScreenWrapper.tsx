import React from 'react'
import { View, StyleSheet, ScrollView, RefreshControl, KeyboardAvoidingView, Platform } from 'react-native'
import { colors, spacing } from '@fitness-tracker/ui'

interface ScreenWrapperProps {
  children: React.ReactNode
  backgroundColor?: string
  padding?: number
  scrollable?: boolean
  contentPadding?: number
  refreshing?: boolean
  onRefresh?: () => void
  keyboardAvoiding?: boolean
  keyboardBehavior?: 'padding' | 'height' | 'position'
}

export const ScreenWrapper: React.FC<ScreenWrapperProps> = ({
  children,
  backgroundColor = colors.pink[50],
  padding = 0,
  scrollable = false,
  contentPadding = spacing.lg,
  refreshing = false,
  onRefresh,
  keyboardAvoiding = true,
  keyboardBehavior = Platform.OS === 'ios' ? 'padding' : 'height',
}) => {
  const content = scrollable ? (
    <ScrollView 
      showsVerticalScrollIndicator={false} 
      style={{ flex: 1 }}
      contentContainerStyle={{ padding: contentPadding }}
      keyboardShouldPersistTaps="handled"
      refreshControl={
        onRefresh ? (
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        ) : undefined
      }
    >
      {children}
    </ScrollView>
  ) : (
    <View style={[styles.content, { padding }]}>
      {children}
    </View>
  )

  if (keyboardAvoiding) {
    return (
      <KeyboardAvoidingView 
        style={[styles.container, { backgroundColor }]}
        behavior={keyboardBehavior}
      >
        {content}
      </KeyboardAvoidingView>
    )
  }

  return (
    <View style={[styles.container, { backgroundColor }]}>
      {content}
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    flex: 1,
  },
})