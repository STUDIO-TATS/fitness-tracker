import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  ScrollView,
  Modal,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { ScreenWrapper } from '../components/ScreenWrapper';
import { colors } from '../constants/colors';
import { commonStyles, spacing, typography, layout, borderRadius, shadows } from '../constants/styles';

interface Measurement {
  id: string;
  date: string;
  weight: number;
  bodyFat?: number;
  muscle?: number;
}

export default function MeasurementScreen() {
  const [measurements] = useState<Measurement[]>([
    { id: '1', date: '2024-01-15', weight: 70.5, bodyFat: 22.3, muscle: 35.2 },
    { id: '2', date: '2024-01-08', weight: 71.2, bodyFat: 22.8, muscle: 35.0 },
    { id: '3', date: '2024-01-01', weight: 72.0, bodyFat: 23.5, muscle: 34.8 },
  ]);
  const [modalVisible, setModalVisible] = useState(false);
  const [weight, setWeight] = useState('');
  const [bodyFat, setBodyFat] = useState('');
  const [muscle, setMuscle] = useState('');

  const latestMeasurement = measurements[0];
  const previousMeasurement = measurements[1];
  
  const weightChange = latestMeasurement && previousMeasurement
    ? latestMeasurement.weight - previousMeasurement.weight
    : 0;

  const handleSave = () => {
    // ここで新しい測定データを保存
    setModalVisible(false);
    setWeight('');
    setBodyFat('');
    setMuscle('');
  };

  return (
    <ScreenWrapper backgroundColor={colors.mint[50]}>
      <ScrollView showsVerticalScrollIndicator={false}>
        <View style={styles.header}>
          <Text style={styles.screenTitle}>体測定</Text>
          <TouchableOpacity
            style={styles.addButton}
            onPress={() => setModalVisible(true)}
          >
            <Ionicons name="add" size={24} color={colors.white} />
          </TouchableOpacity>
        </View>

        {latestMeasurement && (
          <View style={styles.currentStats}>
            <View style={styles.mainStat}>
              <Text style={styles.mainStatLabel}>現在の体重</Text>
              <Text style={styles.mainStatValue}>{latestMeasurement.weight} kg</Text>
              <View style={styles.changeIndicator}>
                <Ionicons
                  name={weightChange >= 0 ? 'arrow-up' : 'arrow-down'}
                  size={16}
                  color={weightChange >= 0 ? colors.pink[500] : colors.mint[500]}
                />
                <Text
                  style={[
                    styles.changeText,
                    { color: weightChange >= 0 ? colors.pink[500] : colors.mint[500] },
                  ]}
                >
                  {Math.abs(weightChange).toFixed(1)} kg
                </Text>
              </View>
            </View>

            <View style={styles.subStats}>
              {latestMeasurement.bodyFat && (
                <View style={styles.subStat}>
                  <Ionicons name="water" size={24} color={colors.purple[500]} />
                  <Text style={styles.subStatLabel}>体脂肪率</Text>
                  <Text style={styles.subStatValue}>{latestMeasurement.bodyFat}%</Text>
                </View>
              )}
              {latestMeasurement.muscle && (
                <View style={styles.subStat}>
                  <Ionicons name="fitness" size={24} color={colors.primary} />
                  <Text style={styles.subStatLabel}>筋肉量</Text>
                  <Text style={styles.subStatValue}>{latestMeasurement.muscle} kg</Text>
                </View>
              )}
            </View>
          </View>
        )}

        <View style={styles.historySection}>
          <Text style={styles.sectionTitle}>測定履歴</Text>
          {measurements.map((measurement) => (
            <View key={measurement.id} style={styles.historyItem}>
              <Text style={styles.historyDate}>{measurement.date}</Text>
              <View style={styles.historyStats}>
                <Text style={styles.historyWeight}>{measurement.weight} kg</Text>
                {measurement.bodyFat && (
                  <Text style={styles.historySubStat}>体脂肪 {measurement.bodyFat}%</Text>
                )}
              </View>
            </View>
          ))}
        </View>
      </ScrollView>

      <Modal
        animationType="slide"
        transparent={true}
        visible={modalVisible}
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>新しい測定を記録</Text>
              <TouchableOpacity onPress={() => setModalVisible(false)}>
                <Ionicons name="close" size={24} color={colors.gray[600]} />
              </TouchableOpacity>
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>体重 (kg)</Text>
              <TextInput
                style={styles.input}
                placeholder="70.5"
                placeholderTextColor={colors.gray[400]}
                value={weight}
                onChangeText={setWeight}
                keyboardType="numeric"
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>体脂肪率 (%)</Text>
              <TextInput
                style={styles.input}
                placeholder="22.5"
                placeholderTextColor={colors.gray[400]}
                value={bodyFat}
                onChangeText={setBodyFat}
                keyboardType="numeric"
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>筋肉量 (kg)</Text>
              <TextInput
                style={styles.input}
                placeholder="35.0"
                placeholderTextColor={colors.gray[400]}
                value={muscle}
                onChangeText={setMuscle}
                keyboardType="numeric"
              />
            </View>

            <View style={styles.modalActions}>
              <TouchableOpacity
                style={[styles.modalButton, styles.cancelButton]}
                onPress={() => setModalVisible(false)}
              >
                <Text style={styles.cancelButtonText}>キャンセル</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.modalButton, styles.saveButton]}
                onPress={handleSave}
              >
                <Text style={styles.saveButtonText}>保存</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </ScreenWrapper>
  );
}

const styles = StyleSheet.create({
  header: {
    ...commonStyles.screenHeader,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  screenTitle: {
    ...commonStyles.screenTitle,
    color: colors.mint[700],
  },
  addButton: {
    ...commonStyles.addButton,
    backgroundColor: colors.mint[500],
  },
  currentStats: {
    paddingHorizontal: layout.screenPadding,
  },
  mainStat: {
    ...commonStyles.card,
    borderRadius: borderRadius.xl,
    padding: spacing.xxl,
    alignItems: 'center',
    marginBottom: spacing.lg,
    ...shadows.md,
  },
  mainStatLabel: {
    ...typography.body,
    color: colors.gray[600],
    marginBottom: spacing.sm,
  },
  mainStatValue: {
    fontSize: 48,
    fontWeight: 'bold',
    color: colors.gray[900],
  },
  changeIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: spacing.sm,
  },
  changeText: {
    ...typography.body,
    fontWeight: '600',
    marginLeft: spacing.xs,
  },
  subStats: {
    flexDirection: 'row',
    gap: spacing.md,
  },
  subStat: {
    flex: 1,
    ...commonStyles.card,
    borderRadius: borderRadius.lg,
    padding: spacing.lg,
    alignItems: 'center',
    marginBottom: 0,
    ...shadows.sm,
  },
  subStatLabel: {
    ...typography.small,
    color: colors.gray[600],
    marginTop: spacing.sm,
    marginBottom: spacing.xs,
  },
  subStatValue: {
    ...typography.cardTitle,
    fontWeight: 'bold',
    color: colors.gray[900],
  },
  historySection: {
    ...commonStyles.listContainer,
    ...commonStyles.section,
  },
  sectionTitle: {
    ...commonStyles.sectionTitle,
  },
  historyItem: {
    ...commonStyles.listItem,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  historyDate: {
    ...typography.body,
    color: colors.gray[600],
  },
  historyStats: {
    alignItems: 'flex-end',
  },
  historyWeight: {
    ...typography.cardTitle,
    color: colors.gray[900],
  },
  historySubStat: {
    ...typography.small,
    color: colors.gray[500],
    marginTop: spacing.xs,
  },
  modalContainer: {
    flex: 1,
    justifyContent: 'flex-end',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  modalContent: {
    backgroundColor: colors.white,
    borderTopLeftRadius: borderRadius.xl,
    borderTopRightRadius: borderRadius.xl,
    padding: layout.screenPadding,
    paddingBottom: spacing.xxxl + spacing.sm,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.xxl,
  },
  modalTitle: {
    ...typography.sectionTitle,
    color: colors.gray[900],
  },
  inputGroup: {
    marginBottom: layout.screenPadding,
  },
  inputLabel: {
    ...typography.body,
    fontWeight: '600',
    color: colors.gray[700],
    marginBottom: spacing.sm,
  },
  input: {
    backgroundColor: colors.gray[100],
    borderRadius: borderRadius.sm,
    padding: spacing.lg,
    ...typography.body,
    color: colors.gray[900],
  },
  modalActions: {
    flexDirection: 'row',
    gap: spacing.md,
    marginTop: spacing.md,
  },
  modalButton: {
    flex: 1,
    paddingVertical: spacing.lg,
    borderRadius: borderRadius.sm,
    alignItems: 'center',
  },
  cancelButton: {
    backgroundColor: colors.gray[200],
  },
  cancelButtonText: {
    ...typography.body,
    color: colors.gray[700],
    fontWeight: '600',
  },
  saveButton: {
    backgroundColor: colors.mint[500],
  },
  saveButtonText: {
    ...typography.body,
    color: colors.white,
    fontWeight: '600',
  },
});