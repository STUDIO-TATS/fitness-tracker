import React from 'react'
import { View, StyleSheet } from 'react-native'
import { Text, Card, Button } from '@fitness-tracker/ui'
import { colors, spacing } from '@fitness-tracker/ui'
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons'

interface EmptyStateProps {
  icon: string
  title: string
  description: string
  actionText?: string
  onAction?: () => void
}

export const EmptyState: React.FC<EmptyStateProps> = ({
  icon,
  title,
  description,
  actionText,
  onAction,
}) => {
  return (
    <Card style={styles.container}>
      <MaterialCommunityIcons 
        name={icon} 
        size={64} 
        color={colors.gray[400]} 
        style={styles.icon}
      />
      <Text variant="heading3" weight="semibold" style={styles.title}>
        {title}
      </Text>
      <Text variant="body" color="gray" style={styles.description}>
        {description}
      </Text>
      {actionText && onAction && (
        <Button
          title={actionText}
          onPress={onAction}
          style={styles.action}
          variant="secondary"
        />
      )}
    </Card>
  )
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    paddingVertical: spacing.xl,
    paddingHorizontal: spacing.lg,
    margin: spacing.lg,
  },
  icon: {
    marginBottom: spacing.md,
  },
  title: {
    marginBottom: spacing.sm,
    textAlign: 'center',
  },
  description: {
    textAlign: 'center',
    marginBottom: spacing.lg,
  },
  action: {
    marginTop: spacing.md,
  },
})