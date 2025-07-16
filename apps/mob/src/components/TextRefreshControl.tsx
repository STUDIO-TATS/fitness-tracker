import React, { useState, useRef } from 'react';
import {
  ScrollView,
  View,
  Text,
  StyleSheet,
  Animated,
  PanResponder,
  RefreshControl,
} from 'react-native';
import { colors } from '../constants/colors';
import { typography, spacing } from '../constants/styles';

interface TextRefreshControlProps {
  refreshing: boolean;
  onRefresh: () => void;
  tintColor?: string;
  title?: string;
  titleColor?: string;
  pullDownText?: string;
  releaseText?: string;
  refreshingText?: string;
}

export const TextRefreshControl: React.FC<TextRefreshControlProps> = ({
  refreshing,
  onRefresh,
  tintColor = colors.purple[500],
  titleColor = colors.purple[600],
  pullDownText = '引っ張って更新',
  releaseText = '離して更新',
  refreshingText = '更新中...',
}) => {
  const [pullDistance, setPullDistance] = useState(0);
  const [isReleasing, setIsReleasing] = useState(false);
  
  const getMessage = () => {
    if (refreshing) return refreshingText;
    if (pullDistance > 60) return releaseText;
    if (pullDistance > 0) return pullDownText;
    return '';
  };

  return (
    <RefreshControl
      refreshing={refreshing}
      onRefresh={onRefresh}
      tintColor="transparent"
      colors={['transparent']}
      style={{ backgroundColor: 'transparent' }}
      progressViewOffset={-1000}
      title={getMessage()}
      titleColor={titleColor}
    />
  );
};

const styles = StyleSheet.create({
  container: {
    height: 60,
    justifyContent: 'center',
    alignItems: 'center',
  },
  text: {
    ...typography.body,
    fontWeight: '600',
  },
});