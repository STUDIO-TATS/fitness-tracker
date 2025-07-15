import React from 'react'
import { View, StyleSheet, TouchableOpacity } from 'react-native'
import { Text, Card } from '@fitness-tracker/ui'
import { colors, spacing } from '@fitness-tracker/ui'
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons'

interface StatsCardProps {
  title: string
  value: string | number
  subtitle?: string
  icon?: string
  color?: string
  onPress?: () => void
}

export const StatsCard: React.FC<StatsCardProps> = ({
  title,
  value,
  subtitle,
  icon,
  color = colors.purple[500],
  onPress,
}) => {
  const CardComponent = onPress ? TouchableOpacity : View

  return (
    <CardComponent onPress={onPress} activeOpacity={0.7}>
      <Card style={styles.container}>
        <View style={styles.content}>
          {icon && (
            <MaterialCommunityIcons
              name={icon}
              size={24}
              color={color}
              style={styles.icon}
            />
          )}
          <View style={styles.textContainer}>
            <Text variant="heading2" weight="bold" style={[styles.value, { color }]}>
              {value}
            </Text>
            <Text variant="body" color="gray" style={styles.title}>
              {title}
            </Text>
            {subtitle && (
              <Text variant="caption" color="gray" style={styles.subtitle}>
                {subtitle}
              </Text>
            )}
          </View>
        </View>
      </Card>
    </CardComponent>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    minHeight: 80,
  },
  content: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  icon: {
    marginRight: spacing.sm,
  },
  textContainer: {
    flex: 1,
    alignItems: 'center',
  },
  value: {
    fontSize: 24,
    lineHeight: 28,
  },
  title: {
    fontSize: 14,
    marginTop: 2,
  },
  subtitle: {
    fontSize: 12,
    marginTop: 2,
  },
})