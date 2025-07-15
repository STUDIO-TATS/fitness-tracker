import React from 'react'
import { View, StyleSheet } from 'react-native'
import { Text } from '@fitness-tracker/ui'
import { colors, spacing } from '@fitness-tracker/ui'

interface ProgressBarProps {
  current: number
  target: number
  unit?: string
  color?: string
  showText?: boolean
  height?: number
}

export const ProgressBar: React.FC<ProgressBarProps> = ({
  current,
  target,
  unit = '',
  color = colors.mint[500],
  showText = true,
  height = 8,
}) => {
  const percentage = Math.min((current / target) * 100, 100)
  
  return (
    <View style={styles.container}>
      {showText && (
        <View style={styles.textContainer}>
          <Text variant="body" weight="semibold">
            {current} / {target} {unit}
          </Text>
          <Text variant="caption" color="gray">
            {Math.round(percentage)}% 完了
          </Text>
        </View>
      )}
      <View style={[styles.track, { height }]}>
        <View
          style={[
            styles.fill,
            {
              width: `${percentage}%`,
              backgroundColor: color,
              height,
            },
          ]}
        />
      </View>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    width: '100%',
  },
  textContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.sm,
  },
  track: {
    backgroundColor: colors.purple[100],
    borderRadius: 4,
    overflow: 'hidden',
  },
  fill: {
    borderRadius: 4,
  },
})