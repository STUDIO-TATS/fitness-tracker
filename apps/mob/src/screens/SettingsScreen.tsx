import React from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Switch,
  ScrollView,
  Alert,
  Modal,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";
import { ScreenWrapper } from "../components/ScreenWrapper";
import { colors } from "../constants/colors";
import { useNotifications } from "../hooks/useNotifications";
import { useI18n } from "../hooks/useI18n";
import {
  commonStyles,
  spacing,
  typography,
  layout,
  borderRadius,
  shadows,
} from "../constants/styles";

export default function SettingsScreen() {
  const navigation = useNavigation();
  const { t, currentLanguage, changeLanguage, availableLanguages } = useI18n();
  const [notifications, setNotifications] = React.useState(true);
  const [darkMode, setDarkMode] = React.useState(false);
  const [biometric, setBiometric] = React.useState(false);
  const [languageModalVisible, setLanguageModalVisible] = React.useState(false);
  const {
    scheduleNotification,
    scheduleDailyReminder,
    cancelAllNotifications,
  } = useNotifications();

  const handleNotificationToggle = async (value: boolean) => {
    setNotifications(value);
    if (value) {
      // 通知を有効化 - テスト通知を送信
      await scheduleNotification(
        t("settings.notificationEnabled"),
        t("settings.notificationEnabledMsg"),
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
    switch (item.id) {
      case "help":
        navigation.navigate("Help" as never);
        break;
      case "terms":
        navigation.navigate("Terms" as never);
        break;
      case "privacy":
        navigation.navigate("Privacy" as never);
        break;
      case "export":
        Alert.alert(t("settings.dataExport"), t("settings.dataExportMsg"));
        break;
      case "clearCache":
        Alert.alert(
          t("settings.clearCacheTitle"),
          t("settings.clearCacheMsg"),
          [
            { text: t("common.cancel"), style: "cancel" },
            {
              text: t("settings.clear"),
              onPress: () =>
                Alert.alert(
                  t("settings.completed"),
                  t("settings.cacheCleared")
                ),
            },
          ]
        );
        break;
      case "emailNotifications":
        Alert.alert(
          t("settings.emailNotifications"),
          t("settings.emailNotificationMsg")
        );
        break;
      case "language":
        setLanguageModalVisible(true);
        break;
      default:
        break;
    }
  };

  const settingSections = [
    {
      title: t("settings.notifications"),
      items: [
        {
          id: "pushNotifications",
          icon: "notifications",
          label: t("settings.pushNotifications"),
          value: notifications,
          onValueChange: handleNotificationToggle,
          type: "switch",
        },
        {
          id: "emailNotifications",
          icon: "mail",
          label: t("settings.emailNotifications"),
          type: "link",
        },
      ],
    },
    {
      title: t("settings.appearance"),
      items: [
        {
          id: "darkMode",
          icon: "moon",
          label: t("settings.darkMode"),
          value: darkMode,
          onValueChange: setDarkMode,
          type: "switch",
        },
        {
          id: "biometric",
          icon: "finger-print",
          label: t("settings.biometric"),
          value: biometric,
          onValueChange: setBiometric,
          type: "switch",
        },
        {
          id: "language",
          icon: "language",
          label: t("settings.language"),
          type: "link",
          value:
            availableLanguages.find((lang) => lang.code === currentLanguage)
              ?.name || currentLanguage,
        },
      ],
    },
    {
      title: t("settings.dataManagement"),
      items: [
        {
          id: "export",
          icon: "cloud-download",
          label: t("settings.exportData"),
          type: "link",
        },
        {
          id: "clearCache",
          icon: "trash",
          label: t("settings.clearCache"),
          type: "link",
        },
      ],
    },
    {
      title: t("settings.other"),
      items: [
        {
          id: "help",
          icon: "help-circle",
          label: t("settings.help"),
          type: "link",
        },
        {
          id: "terms",
          icon: "document-text",
          label: t("settings.termsOfService"),
          type: "link",
        },
        {
          id: "privacy",
          icon: "shield-checkmark",
          label: t("settings.privacyPolicy"),
          type: "link",
        },
      ],
    },
  ];

  return (
    <ScreenWrapper backgroundColor={colors.gray[50]} scrollable>
      <View style={styles.header}>
        <Text style={styles.screenTitle}>{t("settings.title")}</Text>
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
                  disabled={item.type === "switch"}
                  onPress={() =>
                    item.type === "link" && handleSettingPress(item)
                  }
                >
                  <View style={styles.settingLeft}>
                    <Ionicons
                      name={item.icon as any}
                      size={24}
                      color={colors.gray[600]}
                    />
                    <Text style={styles.settingLabel}>{item.label}</Text>
                  </View>

                  {item.type === "switch" ? (
                    <Switch
                      value={item.value as boolean}
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
          <Text style={styles.versionText}>{t("settings.version")} 1.0.0</Text>
          <Text style={styles.versionSubtext}>Expo SDK 53</Text>
        </View>
      </ScrollView>

      {/* Language Selection Modal */}
      <Modal
        visible={languageModalVisible}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setLanguageModalVisible(false)}
      >
        <TouchableOpacity
          style={styles.modalOverlay}
          activeOpacity={1}
          onPress={() => setLanguageModalVisible(false)}
        >
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>
              {t("settings.selectLanguage")}
            </Text>
            {availableLanguages.map((language) => (
              <TouchableOpacity
                key={language.code}
                style={[
                  styles.languageItem,
                  currentLanguage === language.code &&
                    styles.selectedLanguageItem,
                ]}
                onPress={() => {
                  changeLanguage(language.code);
                  setLanguageModalVisible(false);
                }}
              >
                <Text
                  style={[
                    styles.languageText,
                    currentLanguage === language.code &&
                      styles.selectedLanguageText,
                  ]}
                >
                  {language.name}
                </Text>
                {currentLanguage === language.code && (
                  <Ionicons name="checkmark" size={24} color={colors.primary} />
                )}
              </TouchableOpacity>
            ))}
          </View>
        </TouchableOpacity>
      </Modal>
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
    fontWeight: "600",
    color: colors.gray[500],
    textTransform: "uppercase",
    marginBottom: spacing.sm,
    paddingHorizontal: layout.screenPadding,
  },
  sectionContent: {
    backgroundColor: colors.white,
    marginHorizontal: layout.screenPadding,
    borderRadius: borderRadius.md,
    overflow: "hidden",
  },
  settingItem: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    padding: spacing.lg,
    borderBottomWidth: 1,
    borderBottomColor: colors.gray[100],
  },
  lastItem: {
    borderBottomWidth: 0,
  },
  settingLeft: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
  },
  settingLabel: {
    ...typography.body,
    color: colors.gray[900],
    marginLeft: spacing.md,
  },
  settingRight: {
    flexDirection: "row",
    alignItems: "center",
  },
  settingValue: {
    ...typography.small,
    color: colors.gray[500],
    marginRight: spacing.xs,
  },
  versionInfo: {
    alignItems: "center",
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
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "flex-end",
  },
  modalContent: {
    backgroundColor: colors.white,
    borderTopLeftRadius: borderRadius.xl,
    borderTopRightRadius: borderRadius.xl,
    paddingHorizontal: layout.screenPadding,
    paddingTop: spacing.xl,
    paddingBottom: spacing.xxxl,
    maxHeight: "50%",
  },
  modalTitle: {
    ...typography.sectionTitle,
    color: colors.gray[900],
    marginBottom: spacing.lg,
  },
  languageItem: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: spacing.lg,
    paddingHorizontal: spacing.md,
    borderRadius: borderRadius.md,
    marginBottom: spacing.sm,
  },
  selectedLanguageItem: {
    backgroundColor: colors.gray[50],
  },
  languageText: {
    ...typography.body,
    color: colors.gray[700],
  },
  selectedLanguageText: {
    color: colors.primary,
    fontWeight: "600",
  },
});
