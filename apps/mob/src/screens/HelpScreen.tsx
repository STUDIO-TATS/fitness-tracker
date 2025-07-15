import React, { useState } from 'react';
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
import { commonStyles, spacing, typography, layout, borderRadius, shadows } from '../constants/styles';

interface FAQItem {
  id: string;
  question: string;
  answer: string;
  category: string;
}

interface HelpCategory {
  id: string;
  title: string;
  icon: string;
  items: FAQItem[];
}

export default function HelpScreen() {
  const [expandedItem, setExpandedItem] = useState<string | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<string>('general');

  const helpCategories: HelpCategory[] = [
    {
      id: 'general',
      title: '基本操作',
      icon: 'help-circle',
      items: [
        {
          id: 'login',
          question: 'ログイン方法を教えてください',
          answer: 'アプリを起動し、メールアドレスとパスワードを入力してログインボタンをタップしてください。初回利用の場合は「新規登録」から会員登録を行ってください。',
          category: 'general'
        },
        {
          id: 'navigation',
          question: '画面の操作方法は？',
          answer: '左上のメニューボタン（≡）をタップするとサイドメニューが表示されます。各機能へのアクセスはこちらから行えます。また、画面下部のタブからもメイン機能にアクセスできます。',
          category: 'general'
        },
        {
          id: 'profile',
          question: 'プロフィール情報を変更したい',
          answer: 'サイドメニューから「プロフィール」を選択し、右上の編集ボタンをタップしてください。各項目を編集後、保存ボタンで変更を確定できます。',
          category: 'general'
        }
      ]
    },
    {
      id: 'activities',
      title: 'アクティビティ',
      icon: 'fitness',
      items: [
        {
          id: 'record_activity',
          question: 'アクティビティの記録方法は？',
          answer: 'ホーム画面の「新しいワークアウトを記録」ボタンまたはワークアウト画面から運動内容を入力できます。運動種目、時間、施設などの情報を記録してください。',
          category: 'activities'
        },
        {
          id: 'calendar_view',
          question: 'カレンダーでアクティビティを確認したい',
          answer: 'サイドメニューの「カレンダー」からアクセスできます。アクティビティがある日には緑の印が表示され、その日をタップすると詳細な記録を確認できます。',
          category: 'activities'
        },
        {
          id: 'activity_edit',
          question: '記録したアクティビティを修正できますか？',
          answer: 'アクティビティログ画面から過去の記録を選択し、編集ボタンをタップすることで修正可能です。',
          category: 'activities'
        }
      ]
    },
    {
      id: 'facilities',
      title: '施設・料金',
      icon: 'business',
      items: [
        {
          id: 'find_facilities',
          question: '利用可能な施設を探したい',
          answer: 'サイドメニューの「施設」から近くの提携施設を検索できます。各施設の詳細情報、営業時間、料金なども確認できます。',
          category: 'facilities'
        },
        {
          id: 'facility_booking',
          question: '施設の予約はできますか？',
          answer: '施設詳細画面の「予約・見学申込」ボタンから予約を行えます。直接施設に電話をかけることも可能です。',
          category: 'facilities'
        },
        {
          id: 'pricing',
          question: '料金体系について教えてください',
          answer: '各施設により異なりますが、月会費、年会費、1日利用券があります。学生割引やシニア割引も用意されている施設もあります。詳細は施設詳細画面でご確認ください。',
          category: 'facilities'
        }
      ]
    },
    {
      id: 'points',
      title: 'ポイント',
      icon: 'gift',
      items: [
        {
          id: 'earn_points',
          question: 'ポイントの獲得方法は？',
          answer: '施設でのワークアウト、チェックイン、目標達成などでポイントを獲得できます。QRコードをスキャンすることでも自動的にポイントが加算されます。',
          category: 'points'
        },
        {
          id: 'use_points',
          question: 'ポイントの使い方は？',
          answer: '貯まったポイントは施設利用料の割引や特典グッズとの交換に使用できます。ポイント画面で利用可能な特典を確認してください。',
          category: 'points'
        },
        {
          id: 'point_expiry',
          question: 'ポイントに有効期限はありますか？',
          answer: 'ポイントの有効期限は獲得から1年間です。期限が近づくとアプリ内で通知されます。',
          category: 'points'
        }
      ]
    },
    {
      id: 'troubleshooting',
      title: 'トラブルシューティング',
      icon: 'warning',
      items: [
        {
          id: 'app_crash',
          question: 'アプリが強制終了してしまいます',
          answer: 'アプリを完全に終了し、再起動してください。問題が続く場合は、端末の再起動やアプリの再インストールをお試しください。',
          category: 'troubleshooting'
        },
        {
          id: 'sync_issues',
          question: 'データが同期されません',
          answer: 'インターネット接続を確認し、アプリを再起動してください。Wi-Fi環境での同期をお勧めします。',
          category: 'troubleshooting'
        },
        {
          id: 'qr_scan_issues',
          question: 'QRコードが読み取れません',
          answer: 'カメラの権限が許可されているか確認してください。また、QRコードに汚れがないか、明るい場所で読み取りを行ってください。',
          category: 'troubleshooting'
        }
      ]
    }
  ];

  const toggleExpand = (itemId: string) => {
    setExpandedItem(expandedItem === itemId ? null : itemId);
  };

  const currentCategory = helpCategories.find(cat => cat.id === selectedCategory);

  return (
    <ScreenWrapper backgroundColor={colors.purple[50]} scrollable>
      <View style={styles.header}>
        <Text style={styles.screenTitle}>ヘルプ・サポート</Text>
      </View>

      {/* カテゴリタブ */}
      <ScrollView 
        horizontal 
        showsHorizontalScrollIndicator={false}
        style={styles.categoryTabs}
        contentContainerStyle={styles.categoryTabsContent}
      >
        {helpCategories.map((category) => (
          <TouchableOpacity
            key={category.id}
            style={[
              styles.categoryTab,
              selectedCategory === category.id && styles.activeCategoryTab
            ]}
            onPress={() => setSelectedCategory(category.id)}
          >
            <Ionicons
              name={category.icon as any}
              size={20}
              color={selectedCategory === category.id ? colors.white : colors.purple[600]}
            />
            <Text style={[
              styles.categoryTabText,
              selectedCategory === category.id && styles.activeCategoryTabText
            ]}>
              {category.title}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      {/* FAQ一覧 */}
      <View style={styles.faqContainer}>
        {currentCategory?.items.map((item) => (
          <View key={item.id} style={styles.faqItem}>
            <TouchableOpacity
              style={styles.questionContainer}
              onPress={() => toggleExpand(item.id)}
            >
              <Text style={styles.questionText}>{item.question}</Text>
              <Ionicons
                name={expandedItem === item.id ? 'chevron-up' : 'chevron-down'}
                size={20}
                color={colors.gray[600]}
              />
            </TouchableOpacity>
            
            {expandedItem === item.id && (
              <View style={styles.answerContainer}>
                <Text style={styles.answerText}>{item.answer}</Text>
              </View>
            )}
          </View>
        ))}
      </View>

      {/* お問い合わせセクション */}
      <View style={styles.contactSection}>
        <Text style={styles.contactTitle}>その他のお問い合わせ</Text>
        <Text style={styles.contactDescription}>
          上記で解決しない場合は、以下の方法でお問い合わせください。
        </Text>
        
        <TouchableOpacity style={styles.contactButton}>
          <Ionicons name="mail" size={20} color={colors.white} />
          <Text style={styles.contactButtonText}>メールでお問い合わせ</Text>
        </TouchableOpacity>
        
        <TouchableOpacity style={[styles.contactButton, styles.phoneButton]}>
          <Ionicons name="call" size={20} color={colors.primary} />
          <Text style={[styles.contactButtonText, styles.phoneButtonText]}>
            電話でお問い合わせ
          </Text>
        </TouchableOpacity>
        
        <View style={styles.contactInfo}>
          <Text style={styles.contactInfoText}>営業時間: 平日 9:00-18:00</Text>
          <Text style={styles.contactInfoText}>土日祝日: 10:00-17:00</Text>
        </View>
      </View>

      <View style={{ height: 20 }} />
    </ScreenWrapper>
  );
}

const styles = StyleSheet.create({
  header: {
    padding: layout.screenPadding,
    paddingBottom: spacing.md,
  },
  screenTitle: {
    ...typography.screenTitle,
    color: colors.purple[700],
  },
  categoryTabs: {
    paddingLeft: layout.screenPadding,
    marginBottom: spacing.lg,
  },
  categoryTabsContent: {
    paddingRight: layout.screenPadding,
  },
  categoryTab: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.white,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    borderRadius: borderRadius.full,
    marginRight: spacing.md,
    gap: spacing.sm,
    ...shadows.sm,
  },
  activeCategoryTab: {
    backgroundColor: colors.primary,
  },
  categoryTabText: {
    ...typography.small,
    color: colors.purple[600],
    fontWeight: '600',
  },
  activeCategoryTabText: {
    color: colors.white,
  },
  faqContainer: {
    paddingHorizontal: layout.screenPadding,
    marginBottom: spacing.xl,
  },
  faqItem: {
    backgroundColor: colors.white,
    borderRadius: borderRadius.md,
    marginBottom: spacing.md,
    overflow: 'hidden',
    ...shadows.sm,
  },
  questionContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: spacing.lg,
  },
  questionText: {
    ...typography.body,
    color: colors.gray[900],
    fontWeight: '600',
    flex: 1,
    marginRight: spacing.md,
  },
  answerContainer: {
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing.lg,
    borderTopWidth: 1,
    borderTopColor: colors.gray[200],
  },
  answerText: {
    ...typography.body,
    color: colors.gray[700],
    lineHeight: 22,
  },
  contactSection: {
    backgroundColor: colors.white,
    marginHorizontal: layout.screenPadding,
    borderRadius: borderRadius.lg,
    padding: spacing.xl,
    ...shadows.md,
  },
  contactTitle: {
    ...typography.sectionTitle,
    color: colors.gray[900],
    marginBottom: spacing.md,
  },
  contactDescription: {
    ...typography.body,
    color: colors.gray[600],
    marginBottom: spacing.lg,
    lineHeight: 20,
  },
  contactButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.primary,
    paddingVertical: spacing.lg,
    borderRadius: borderRadius.md,
    marginBottom: spacing.md,
    gap: spacing.sm,
  },
  phoneButton: {
    backgroundColor: colors.white,
    borderWidth: 1,
    borderColor: colors.primary,
  },
  contactButtonText: {
    ...typography.body,
    color: colors.white,
    fontWeight: '600',
  },
  phoneButtonText: {
    color: colors.primary,
  },
  contactInfo: {
    marginTop: spacing.md,
    paddingTop: spacing.md,
    borderTopWidth: 1,
    borderTopColor: colors.gray[200],
  },
  contactInfoText: {
    ...typography.small,
    color: colors.gray[600],
    textAlign: 'center',
    marginBottom: spacing.xs,
  },
});