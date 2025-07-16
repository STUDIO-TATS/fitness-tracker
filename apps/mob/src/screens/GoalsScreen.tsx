import React, { useState, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  FlatList,
  Modal,
  TextInput,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import ViewShot from 'react-native-view-shot';
import * as Sharing from 'expo-sharing';
import { ScreenWrapper } from '../components/ScreenWrapper';
import { colors } from '../constants/colors';
import { icons } from '../constants/icons';
import { theme } from '../constants/theme';
import { useI18n } from '../hooks/useI18n';
import { commonStyles, spacing, typography, layout, borderRadius, shadows } from '../constants/styles';

interface Goal {
  id: string;
  title: string;
  target: string;
  current: number;
  total: number;
  unit: string;
  color: string;
}

export default function GoalsScreen() {
  const { t } = useI18n();
  const viewShotRef = useRef<ViewShot>(null);
  const [goals, setGoals] = useState<Goal[]>([
    {
      id: '1',
      title: '週3回のワークアウト',
      target: '今週',
      current: 2,
      total: 3,
      unit: '回',
      color: colors.primary,
    },
    {
      id: '2',
      title: '体重を減らす',
      target: '今月',
      current: 1.5,
      total: 3,
      unit: 'kg',
      color: colors.purple[500],
    },
    {
      id: '3',
      title: '水分摂取',
      target: '毎日',
      current: 1.8,
      total: 2,
      unit: 'L',
      color: colors.mint[500],
    },
  ]);
  const [modalVisible, setModalVisible] = useState(false);
  const [shareModalVisible, setShareModalVisible] = useState(false);
  const [selectedGoal, setSelectedGoal] = useState<Goal | null>(null);

  const handleShare = async () => {
    try {
      const uri = await viewShotRef.current?.capture?.();
      if (uri) {
        await Sharing.shareAsync(uri, {
          mimeType: 'image/png',
          dialogTitle: '目標を共有',
        });
      }
    } catch (error) {
      Alert.alert('エラー', 'シェアに失敗しました');
    }
  };

  const openShareModal = (goal: Goal) => {
    setSelectedGoal(goal);
    setShareModalVisible(true);
  };

  const renderGoalItem = ({ item }: { item: Goal }) => {
    const progress = (item.current / item.total) * 100;

    return (
      <TouchableOpacity style={styles.goalCard} onLongPress={() => openShareModal(item)}>
        <View style={styles.goalHeader}>
          <Text style={styles.goalTitle}>{item.title}</Text>
          <Text style={styles.goalTarget}>{item.target}</Text>
        </View>
        
        <View style={styles.progressContainer}>
          <View style={styles.progressBar}>
            <View
              style={[
                styles.progressFill,
                { width: `${progress}%`, backgroundColor: item.color },
              ]}
            />
          </View>
          <Text style={styles.progressText}>
            {item.current} / {item.total} {item.unit}
          </Text>
        </View>
        
        <Text style={styles.progressPercentage}>{Math.round(progress)}%</Text>
      </TouchableOpacity>
    );
  };

  return (
    <ScreenWrapper backgroundColor={theme.colors.background.tertiary}>
      <View style={[commonStyles.screenHeader, styles.header]}>
        <Text style={[commonStyles.screenTitle, { color: theme.colors.text.primary }]}>{t('navigation.goals')}</Text>
        <TouchableOpacity
          style={styles.addButton}
          onPress={() => setModalVisible(true)}
        >
          <LinearGradient
            colors={theme.colors.gradient.aurora}
            style={styles.addButtonGradient}
          >
            <Ionicons name={icons.status.add} size={24} color={theme.colors.text.inverse} />
          </LinearGradient>
        </TouchableOpacity>
      </View>

      <FlatList
        data={goals}
        renderItem={renderGoalItem}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
      />

      <Modal
        animationType="slide"
        transparent={true}
        visible={modalVisible}
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>新しい目標を追加</Text>
              <TouchableOpacity onPress={() => setModalVisible(false)}>
                <Ionicons name="close" size={24} color={colors.gray[600]} />
              </TouchableOpacity>
            </View>
            
            <TextInput
              style={styles.input}
              placeholder="目標のタイトル"
              placeholderTextColor={colors.gray[400]}
            />
            
            <View style={styles.modalActions}>
              <TouchableOpacity
                style={[styles.modalButton, styles.cancelButton]}
                onPress={() => setModalVisible(false)}
              >
                <Text style={styles.cancelButtonText}>キャンセル</Text>
              </TouchableOpacity>
              
              <TouchableOpacity
                style={[styles.modalButton, styles.saveButton]}
                onPress={() => setModalVisible(false)}
              >
                <Text style={styles.saveButtonText}>保存</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      <Modal
        animationType="fade"
        transparent={true}
        visible={shareModalVisible}
        onRequestClose={() => setShareModalVisible(false)}
      >
        <TouchableOpacity
          style={styles.shareModalOverlay}
          activeOpacity={1}
          onPress={() => setShareModalVisible(false)}
        >
          <ViewShot ref={viewShotRef} options={{ format: 'png', quality: 1 }}>
            <View style={styles.shareCard}>
              <Text style={styles.shareTitle}>目標達成中！ 🎯</Text>
              {selectedGoal && (
                <>
                  <Text style={styles.shareGoalTitle}>{selectedGoal.title}</Text>
                  <View style={styles.shareProgressContainer}>
                    <View style={styles.shareProgressBar}>
                      <View
                        style={[
                          styles.shareProgressFill,
                          {
                            width: `${(selectedGoal.current / selectedGoal.total) * 100}%`,
                            backgroundColor: selectedGoal.color,
                          },
                        ]}
                      />
                    </View>
                  </View>
                  <Text style={styles.shareProgressText}>
                    {Math.round((selectedGoal.current / selectedGoal.total) * 100)}% 完了
                  </Text>
                  <Text style={styles.shareStats}>
                    {selectedGoal.current} / {selectedGoal.total} {selectedGoal.unit}
                  </Text>
                </>
              )}
              <Text style={styles.shareFooter}>Fitness Tracker</Text>
            </View>
          </ViewShot>
          
          <View style={styles.shareActions}>
            <TouchableOpacity style={styles.shareButton} onPress={handleShare}>
              <Ionicons name="share-social" size={24} color={colors.white} />
              <Text style={styles.shareButtonText}>シェア</Text>
            </TouchableOpacity>
          </View>
        </TouchableOpacity>
      </Modal>
    </ScreenWrapper>
  );
}

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    paddingBottom: 0,
  },
  screenTitle: {
    fontSize: 32,
    fontWeight: 'bold',
    color: colors.purple[700],
  },
  addButton: {
    width: 44,
    height: 44,
    borderRadius: theme.borderRadius.full,
    overflow: 'hidden',
  },
  addButtonGradient: {
    width: '100%',
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
  },
  listContent: {
    padding: 20,
    paddingTop: spacing.lg,
    paddingBottom: 100,
  },
  goalCard: {
    backgroundColor: colors.white,
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  goalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  goalTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.gray[900],
    flex: 1,
  },
  goalTarget: {
    fontSize: 14,
    color: colors.gray[500],
  },
  progressContainer: {
    marginBottom: 8,
  },
  progressBar: {
    height: 8,
    backgroundColor: colors.gray[200],
    borderRadius: 4,
    marginBottom: 8,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    borderRadius: 4,
  },
  progressText: {
    fontSize: 14,
    color: colors.gray[600],
  },
  progressPercentage: {
    fontSize: 24,
    fontWeight: 'bold',
    color: colors.gray[900],
    textAlign: 'right',
  },
  modalContainer: {
    flex: 1,
    justifyContent: 'flex-end',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  modalContent: {
    backgroundColor: colors.white,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 20,
    paddingBottom: 40,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: colors.gray[900],
  },
  input: {
    backgroundColor: colors.gray[100],
    borderRadius: 8,
    padding: 16,
    fontSize: 16,
    marginBottom: 20,
    color: colors.gray[900],
  },
  modalActions: {
    flexDirection: 'row',
    gap: 12,
  },
  modalButton: {
    flex: 1,
    paddingVertical: 16,
    borderRadius: 8,
    alignItems: 'center',
  },
  cancelButton: {
    backgroundColor: colors.gray[200],
  },
  cancelButtonText: {
    color: colors.gray[700],
    fontSize: 16,
    fontWeight: '600',
  },
  saveButton: {
    backgroundColor: colors.purple[500],
  },
  saveButtonText: {
    color: colors.white,
    fontSize: 16,
    fontWeight: '600',
  },
  shareModalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.8)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  shareCard: {
    backgroundColor: colors.white,
    borderRadius: 20,
    padding: 32,
    alignItems: 'center',
    minWidth: 300,
  },
  shareTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: colors.purple[700],
    marginBottom: 20,
  },
  shareGoalTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: colors.gray[900],
    marginBottom: 20,
    textAlign: 'center',
  },
  shareProgressContainer: {
    width: '100%',
    marginBottom: 16,
  },
  shareProgressBar: {
    height: 20,
    backgroundColor: colors.gray[200],
    borderRadius: 10,
    overflow: 'hidden',
  },
  shareProgressFill: {
    height: '100%',
    borderRadius: 10,
  },
  shareProgressText: {
    fontSize: 28,
    fontWeight: 'bold',
    color: colors.gray[900],
    marginBottom: 8,
  },
  shareStats: {
    fontSize: 16,
    color: colors.gray[600],
    marginBottom: 24,
  },
  shareFooter: {
    fontSize: 14,
    color: colors.gray[500],
    fontStyle: 'italic',
  },
  shareActions: {
    marginTop: 24,
  },
  shareButton: {
    flexDirection: 'row',
    backgroundColor: colors.purple[500],
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 24,
    alignItems: 'center',
    gap: 8,
  },
  shareButtonText: {
    color: colors.white,
    fontSize: 16,
    fontWeight: '600',
  },
});