import React from 'react'
import { View, StyleSheet, ActivityIndicator } from 'react-native'
import { Text } from '@fitness-tracker/ui'
import { colors } from '@fitness-tracker/ui'
import { ScreenWrapper } from './ScreenWrapper'

interface LoadingScreenProps {
  message?: string
}

export const LoadingScreen: React.FC<LoadingScreenProps> = ({ 
  message = '読み込み中...' 
}) => {
  return (
    <ScreenWrapper>
      <View style={styles.container}>
        <ActivityIndicator size="large" color={colors.primary} />
        <Text variant="body" style={styles.message}>
          {message}
        </Text>
      </View>
    </ScreenWrapper>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  message: {
    marginTop: 16,
    color: colors.gray[600],
  },
})