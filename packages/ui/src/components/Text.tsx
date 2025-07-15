import React from 'react'
import { Text as RNText, TextProps as RNTextProps, StyleSheet } from 'react-native'
import { colors, fontSize } from '../theme'

interface TextProps extends RNTextProps {
  variant?: 'heading1' | 'heading2' | 'heading3' | 'body' | 'caption'
  color?: keyof typeof colors | string
  weight?: 'normal' | 'medium' | 'semibold' | 'bold'
}

export const Text: React.FC<TextProps> = ({ 
  variant = 'body',
  color = 'dark',
  weight = 'normal',
  style,
  children,
  ...props 
}) => {
  const textColor = colors[color as keyof typeof colors] || color

  return (
    <RNText
      style={[
        styles[variant],
        styles[weight],
        { color: textColor },
        style
      ]}
      {...props}
    >
      {children}
    </RNText>
  )
}

const styles = StyleSheet.create({
  heading1: {
    fontSize: fontSize.xxxl,
    lineHeight: fontSize.xxxl * 1.2,
  },
  heading2: {
    fontSize: fontSize.xxl,
    lineHeight: fontSize.xxl * 1.2,
  },
  heading3: {
    fontSize: fontSize.xl,
    lineHeight: fontSize.xl * 1.2,
  },
  body: {
    fontSize: fontSize.base,
    lineHeight: fontSize.base * 1.5,
  },
  caption: {
    fontSize: fontSize.sm,
    lineHeight: fontSize.sm * 1.5,
  },
  normal: {
    fontWeight: '400',
  },
  medium: {
    fontWeight: '500',
  },
  semibold: {
    fontWeight: '600',
  },
  bold: {
    fontWeight: '700',
  },
})