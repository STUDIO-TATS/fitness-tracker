import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { ScreenWrapper } from '../components/ScreenWrapper';
import { colors } from '../constants/colors';
import { useAuth } from '../hooks/useAuth';
import { commonStyles, spacing, typography, layout, borderRadius, shadows } from '../constants/styles';

export default function MembershipScreen() {
  const { session } = useAuth();

  const membershipInfo = {
    id: 'MB-2024-0001',
    type: 'プレミアム',
    status: 'アクティブ',
    joinDate: '2024-01-01',
    expiryDate: '2025-01-01',
    monthlyFee: '¥10,000',
  };

  const benefits = [
    { icon: 'fitness', text: '全施設利用可能' },
    { icon: 'people', text: 'パーソナルトレーニング月2回無料' },
    { icon: 'water', text: 'プール・サウナ無制限' },
    { icon: 'calendar', text: '予約優先権' },
    { icon: 'gift', text: 'ポイント2倍' },
    { icon: 'cafe', text: 'カフェ10%割引' },
  ];

  const paymentHistory = [
    { date: '2024-01-01', amount: '¥10,000', status: '支払済' },
    { date: '2023-12-01', amount: '¥10,000', status: '支払済' },
    { date: '2023-11-01', amount: '¥10,000', status: '支払済' },
  ];

  return (
    <ScreenWrapper backgroundColor={colors.purple[50]} scrollable>
      <View style={styles.header}>
        <Text style={styles.screenTitle}>会員情報</Text>
      </View>

      <View style={styles.membershipCard}>
        <View style={styles.cardHeader}>
          <Text style={styles.membershipType}>{membershipInfo.type}会員</Text>
          <View style={[styles.statusBadge, { backgroundColor: colors.mint[100] }]}>
            <Text style={[styles.statusText, { color: colors.mint[700] }]}>
              {membershipInfo.status}
            </Text>
          </View>
        </View>
        
        <View style={styles.memberInfo}>
          <Text style={styles.memberName}>{session?.user?.email || 'ゲスト'}</Text>
          <Text style={styles.memberId}>会員ID: {membershipInfo.id}</Text>
        </View>

        <View style={styles.cardDetails}>
          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>入会日</Text>
            <Text style={styles.detailValue}>{membershipInfo.joinDate}</Text>
          </View>
          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>有効期限</Text>
            <Text style={styles.detailValue}>{membershipInfo.expiryDate}</Text>
          </View>
          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>月額料金</Text>
            <Text style={styles.detailValue}>{membershipInfo.monthlyFee}</Text>
          </View>
        </View>

        <TouchableOpacity style={styles.renewButton}>
          <Text style={styles.renewButtonText}>会員プランを変更</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>会員特典</Text>
        <View style={styles.benefitsGrid}>
          {benefits.map((benefit, index) => (
            <View key={index} style={styles.benefitItem}>
              <View style={styles.benefitIcon}>
                <Ionicons name={benefit.icon as any} size={24} color={colors.purple[600]} />
              </View>
              <Text style={styles.benefitText}>{benefit.text}</Text>
            </View>
          ))}
        </View>
      </View>

      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>支払い履歴</Text>
          <TouchableOpacity>
            <Text style={styles.viewAllText}>すべて見る</Text>
          </TouchableOpacity>
        </View>
        
        <View style={styles.paymentHistory}>
          {paymentHistory.map((payment, index) => (
            <View key={index} style={styles.paymentItem}>
              <View>
                <Text style={styles.paymentDate}>{payment.date}</Text>
                <Text style={styles.paymentAmount}>{payment.amount}</Text>
              </View>
              <View style={[styles.paymentStatus, { backgroundColor: colors.mint[100] }]}>
                <Text style={[styles.paymentStatusText, { color: colors.mint[700] }]}>
                  {payment.status}
                </Text>
              </View>
            </View>
          ))}
        </View>
      </View>

      <View style={styles.section}>
        <TouchableOpacity style={styles.actionButton}>
          <Ionicons name="card" size={20} color={colors.purple[600]} />
          <Text style={styles.actionButtonText}>支払い方法を変更</Text>
          <Ionicons name="chevron-forward" size={20} color={colors.gray[400]} />
        </TouchableOpacity>
        
        <TouchableOpacity style={styles.actionButton}>
          <Ionicons name="document-text" size={20} color={colors.purple[600]} />
          <Text style={styles.actionButtonText}>利用規約</Text>
          <Ionicons name="chevron-forward" size={20} color={colors.gray[400]} />
        </TouchableOpacity>
        
        <TouchableOpacity style={[styles.actionButton, styles.cancelButton]}>
          <Ionicons name="close-circle" size={20} color={colors.pink[600]} />
          <Text style={[styles.actionButtonText, { color: colors.pink[600] }]}>
            退会手続き
          </Text>
          <Ionicons name="chevron-forward" size={20} color={colors.pink[400]} />
        </TouchableOpacity>
      </View>
    </ScreenWrapper>
  );
}

const styles = StyleSheet.create({
  header: {
    ...commonStyles.screenHeader,
  },
  screenTitle: {
    ...commonStyles.screenTitle,
    color: colors.purple[700],
  },
  membershipCard: {
    ...commonStyles.card,
    marginHorizontal: layout.screenPadding,
    padding: layout.screenPadding,
    borderRadius: borderRadius.xl,
    ...shadows.lg,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.lg,
  },
  membershipType: {
    ...typography.sectionTitle,
    color: colors.purple[700],
  },
  statusBadge: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: borderRadius.lg,
  },
  statusText: {
    ...typography.small,
    fontWeight: '600',
  },
  memberInfo: {
    marginBottom: layout.screenPadding,
  },
  memberName: {
    ...typography.cardTitle,
    color: colors.gray[900],
  },
  memberId: {
    ...typography.small,
    color: colors.gray[500],
    marginTop: spacing.xs,
  },
  cardDetails: {
    borderTopWidth: 1,
    borderTopColor: colors.gray[200],
    paddingTop: spacing.lg,
    marginBottom: layout.screenPadding,
  },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: spacing.md,
  },
  detailLabel: {
    ...typography.small,
    color: colors.gray[600],
  },
  detailValue: {
    ...typography.small,
    fontWeight: '500',
    color: colors.gray[900],
  },
  renewButton: {
    ...commonStyles.primaryButton,
    backgroundColor: colors.purple[500],
    paddingVertical: spacing.sm,
    borderRadius: borderRadius.md,
  },
  renewButtonText: {
    ...commonStyles.primaryButtonText,
  },
  section: {
    ...commonStyles.section,
  },
  sectionHeader: {
    ...commonStyles.sectionHeader,
  },
  sectionTitle: {
    ...commonStyles.sectionTitle,
  },
  viewAllText: {
    ...typography.small,
    color: colors.purple[600],
  },
  benefitsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    paddingHorizontal: layout.screenPadding,
    gap: spacing.lg,
  },
  benefitItem: {
    width: '47%',
    ...commonStyles.card,
    borderRadius: borderRadius.md,
    padding: spacing.lg,
    alignItems: 'center',
    marginBottom: 0,
    ...shadows.sm,
  },
  benefitIcon: {
    width: 48,
    height: 48,
    borderRadius: borderRadius.full,
    backgroundColor: colors.purple[100],
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: spacing.sm,
  },
  benefitText: {
    ...typography.small,
    color: colors.gray[700],
    textAlign: 'center',
  },
  paymentHistory: {
    backgroundColor: colors.white,
    marginHorizontal: layout.screenPadding,
    borderRadius: borderRadius.lg,
    overflow: 'hidden',
  },
  paymentItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: spacing.lg,
    borderBottomWidth: 1,
    borderBottomColor: colors.gray[100],
  },
  paymentDate: {
    ...typography.small,
    color: colors.gray[600],
  },
  paymentAmount: {
    ...typography.body,
    fontWeight: '600',
    color: colors.gray[900],
    marginTop: spacing.xs,
  },
  paymentStatus: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: borderRadius.md,
  },
  paymentStatusText: {
    ...typography.caption,
    fontWeight: '600',
  },
  actionButton: {
    ...commonStyles.listItem,
    flexDirection: 'row',
    alignItems: 'center',
    marginHorizontal: layout.screenPadding,
    marginBottom: spacing.md,
    ...shadows.sm,
  },
  actionButtonText: {
    flex: 1,
    ...typography.body,
    color: colors.gray[900],
    marginLeft: spacing.md,
  },
  cancelButton: {
    marginTop: spacing.sm,
    borderWidth: 1,
    borderColor: colors.pink[200],
  },
});