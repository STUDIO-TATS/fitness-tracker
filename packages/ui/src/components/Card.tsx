import React from 'react'
import { View, StyleSheet, ViewStyle } from 'react-native'
import { colors, spacing, borderRadius } from '../theme'

interface CardProps {
  children: React.ReactNode
  style?: ViewStyle
  padding?: keyof typeof spacing
}

export const Card: React.FC<CardProps> = ({ 
  children, 
  style,
  padding = 'md' 
}) => {
  return (
    <View style={[styles.card, { padding: spacing[padding] }, style]}>
      {children}
    </View>
  )
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: 'white',
    borderRadius: borderRadius.lg,
    shadowColor: colors.dark,
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
})