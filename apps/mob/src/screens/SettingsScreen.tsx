import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Switch,
  ScrollView,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { ScreenWrapper } from '../components/ScreenWrapper';
import { colors } from '../constants/colors';
import { useNotifications } from '../hooks/useNotifications';
import { commonStyles, spacing, typography, layout, borderRadius, shadows } from '../constants/styles';

export default function SettingsScreen() {
  const navigation = useNavigation();
  const [notifications, setNotifications] = React.useState(true);
  const [darkMode, setDarkMode] = React.useState(false);
  const [biometric, setBiometric] = React.useState(false);
  const { scheduleNotification, scheduleDailyReminder, cancelAllNotifications } = useNotifications();

  const handleNotificationToggle = async (value: boolean) => {
    setNotifications(value);
    if (value) {
      // 通知を有効化 - テスト通知を送信
      await scheduleNotification(
        'フィットネストラッカー',
        '通知が有効になりました！',
        3
      );
      // 毎日のリマインダーを設定（例：朝8時）
      await scheduleDailyReminder(8, 0);
    } else {
      // すべての通知をキャンセル
      await cancelAllNotifications();
    }
  };

  const handleSettingPress = (item: any) => {
    switch (item.label) {
      case 'ヘルプ':
        navigation.navigate('Help' as never);
        break;
      case '利用規約':
        navigation.navigate('Terms' as never);
        break;
      case 'プライバシーポリシー':
        navigation.navigate('Privacy' as never);
        break;
      case 'データをエクスポート':
        Alert.alert('データエクスポート', 'データのエクスポート機能は準備中です。');
        break;
      case 'キャッシュをクリア':
        Alert.alert(
          'キャッシュクリア',
          'キャッシュをクリアしますか？',
          [
            { text: 'キャンセル', style: 'cancel' },
            { text: 'クリア', onPress: () => Alert.alert('完了', 'キャッシュをクリアしました。') }
          ]
        );
        break;
      case 'メール通知':
        Alert.alert('メール通知', 'メール通知設定は準備中です。');
        break;
      case '言語':
        Alert.alert('言語設定', '言語設定は準備中です。');
        break;
      default:
        break;
    }
  };

  const settingSections = [
    {
      title: '通知',
      items: [
        {
          icon: 'notifications',
          label: 'プッシュ通知',
          value: notifications,
          onValueChange: handleNotificationToggle,
          type: 'switch',
        },
        {
          icon: 'mail',
          label: 'メール通知',
          type: 'link',
        },
      ],
    },
    {
      title: 'アプリの設定',
      items: [
        {
          icon: 'moon',
          label: 'ダークモード',
          value: darkMode,
          onValueChange: setDarkMode,
          type: 'switch',
        },
        {
          icon: 'finger-print',
          label: '生体認証',
          value: biometric,
          onValueChange: setBiometric,
          type: 'switch',
        },
        {
          icon: 'language',
          label: '言語',
          type: 'link',
          value: '日本語',
        },
      ],
    },
    {
      title: 'データ管理',
      items: [
        {
          icon: 'cloud-download',
          label: 'データをエクスポート',
          type: 'link',
        },
        {
          icon: 'trash',
          label: 'キャッシュをクリア',
          type: 'link',
        },
      ],
    },
    {
      title: 'その他',
      items: [
        {
          icon: 'help-circle',
          label: 'ヘルプ',
          type: 'link',
        },
        {
          icon: 'document-text',
          label: '利用規約',
          type: 'link',
        },
        {
          icon: 'shield-checkmark',
          label: 'プライバシーポリシー',
          type: 'link',
        },
      ],
    },
  ];

  return (
    <ScreenWrapper backgroundColor={colors.gray[50]} scrollable>
      <View style={styles.header}>
        <Text style={styles.screenTitle}>設定</Text>
      </View>

      <ScrollView showsVerticalScrollIndicator={false}>
        {settingSections.map((section, sectionIndex) => (
          <View key={sectionIndex} style={styles.section}>
            <Text style={styles.sectionTitle}>{section.title}</Text>
            <View style={styles.sectionContent}>
              {section.items.map((item, itemIndex) => (
                <TouchableOpacity
                  key={itemIndex}
                  style={[
                    styles.settingItem,
                    itemIndex === section.items.length - 1 && styles.lastItem,
                  ]}
                  disabled={item.type === 'switch'}
                  onPress={() => item.type === 'link' && handleSettingPress(item)}
                >
                  <View style={styles.settingLeft}>
                    <Ionicons
                      name={item.icon as any}
                      size={24}
                      color={colors.gray[600]}
                    />
                    <Text style={styles.settingLabel}>{item.label}</Text>
                  </View>
                  
                  {item.type === 'switch' ? (
                    <Switch
                      value={item.value}
                      onValueChange={item.onValueChange}
                      trackColor={{
                        false: colors.gray[200],
                        true: colors.primary,
                      }}
                      thumbColor={colors.white}
                    />
                  ) : (
                    <View style={styles.settingRight}>
                      {item.value && (
                        <Text style={styles.settingValue}>{item.value}</Text>
                      )}
                      <Ionicons
                        name="chevron-forward"
                        size={20}
                        color={colors.gray[400]}
                      />
                    </View>
                  )}
                </TouchableOpacity>
              ))}
            </View>
          </View>
        ))}

        <View style={styles.versionInfo}>
          <Text style={styles.versionText}>バージョン 1.0.0</Text>
          <Text style={styles.versionSubtext}>Expo SDK 53</Text>
        </View>
      </ScrollView>
    </ScreenWrapper>
  );
}

const styles = StyleSheet.create({
  header: {
    ...commonStyles.screenHeader,
  },
  screenTitle: {
    ...commonStyles.screenTitle,
  },
  section: {
    ...commonStyles.section,
  },
  sectionTitle: {
    ...typography.small,
    fontWeight: '600',
    color: colors.gray[500],
    textTransform: 'uppercase',
    marginBottom: spacing.sm,
    paddingHorizontal: layout.screenPadding,
  },
  sectionContent: {
    backgroundColor: colors.white,
    marginHorizontal: layout.screenPadding,
    borderRadius: borderRadius.md,
    overflow: 'hidden',
  },
  settingItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: spacing.lg,
    borderBottomWidth: 1,
    borderBottomColor: colors.gray[100],
  },
  lastItem: {
    borderBottomWidth: 0,
  },
  settingLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  settingLabel: {
    ...typography.body,
    color: colors.gray[900],
    marginLeft: spacing.md,
  },
  settingRight: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  settingValue: {
    ...typography.small,
    color: colors.gray[500],
    marginRight: spacing.xs,
  },
  versionInfo: {
    alignItems: 'center',
    marginTop: spacing.xxxl + spacing.sm,
    marginBottom: spacing.xxxl + spacing.sm,
  },
  versionText: {
    ...typography.small,
    color: colors.gray[500],
  },
  versionSubtext: {
    ...typography.caption,
    color: colors.gray[400],
    marginTop: spacing.xs,
  },
});