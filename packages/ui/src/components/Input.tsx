import React from 'react'
import { TextInput, View, Text, StyleSheet, TextInputProps } from 'react-native'
import { colors, spacing, fontSize, borderRadius } from '../theme'

interface InputProps extends TextInputProps {
  label?: string
  error?: string
}

export const Input: React.FC<InputProps> = ({ 
  label, 
  error,
  style,
  ...props 
}) => {
  return (
    <View style={styles.container}>
      {label && <Text style={styles.label}>{label}</Text>}
      <TextInput
        style={[
          styles.input,
          error && styles.inputError,
          style
        ]}
        placeholderTextColor={colors.gray[500]}
        {...props}
      />
      {error && <Text style={styles.error}>{error}</Text>}
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    marginBottom: spacing.md,
  },
  label: {
    fontSize: fontSize.sm,
    fontWeight: '600',
    color: colors.dark,
    marginBottom: spacing.xs,
  },
  input: {
    borderWidth: 1,
    borderColor: colors.gray[300],
    borderRadius: borderRadius.md,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    fontSize: fontSize.base,
    color: colors.dark,
    backgroundColor: 'white',
  },
  inputError: {
    borderColor: colors.danger,
  },
  error: {
    fontSize: fontSize.xs,
    color: colors.danger,
    marginTop: spacing.xs,
  },
})