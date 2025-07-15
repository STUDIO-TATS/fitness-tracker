import React, { useState, useEffect } from "react";
import {
  View,
  StyleSheet,
  FlatList,
  RefreshControl,
  Alert,
  TouchableOpacity,
  ScrollView,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Text, Card, Button } from "@fitness-tracker/ui";
import { colors, spacing } from "@fitness-tracker/ui";
import { supabase } from "../lib/supabase";
import { useAuth } from "../hooks/useAuth";
import MaterialCommunityIcons from "react-native-vector-icons/MaterialCommunityIcons";

interface UserPoints {
  id: string;
  current_points: number;
  total_earned: number;
  total_used: number;
  company: {
    name: string;
    id: string;
  };
  point_system: {
    name: string;
    point_unit: string;
    conversion_rate: number;
  };
}

interface PointTransaction {
  id: string;
  transaction_type: "earn" | "use" | "expire" | "adjust";
  amount: number;
  balance_after: number;
  description: string | null;
  expires_at: string | null;
  created_at: string;
  company: {
    name: string;
  };
}

interface CompanyFilter {
  id: string;
  name: string;
  totalPoints: number;
}

export const PointsScreen = () => {
  const [userPoints, setUserPoints] = useState<UserPoints[]>([]);
  const [transactions, setTransactions] = useState<PointTransaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [selectedCompany, setSelectedCompany] = useState<string | null>(null);
  const [companyFilters, setCompanyFilters] = useState<CompanyFilter[]>([]);
  const { user } = useAuth();

  const loadData = async () => {
    if (!user) {
      console.log(
        "❌ [DEBUG] No user in PointsScreen, setting loading to false"
      );
      setLoading(false);
      return;
    }

    try {
      // TEMPORARY: Return mock data to avoid database issues
      const mockPoints: UserPoints[] = [
        {
          id: "1",
          current_points: 1250,
          total_earned: 2500,
          total_used: 1250,
          company: {
            id: "company1",
            name: "フィットネスクラブA",
          },
          point_system: {
            name: "Aポイント",
            point_unit: "pt",
            conversion_rate: 1,
          },
        },
        {
          id: "2",
          current_points: 800,
          total_earned: 1500,
          total_used: 700,
          company: {
            id: "company2",
            name: "スポーツジムB",
          },
          point_system: {
            name: "Bポイント",
            point_unit: "pt",
            conversion_rate: 1,
          },
        },
      ];

      const mockTransactions: PointTransaction[] = [
        {
          id: "1",
          transaction_type: "earn",
          amount: 100,
          balance_after: 1250,
          description: "施設利用ポイント",
          expires_at: new Date(
            Date.now() + 30 * 24 * 60 * 60 * 1000
          ).toISOString(),
          created_at: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
          company: {
            name: "フィットネスクラブA",
          },
        },
        {
          id: "2",
          transaction_type: "use",
          amount: 50,
          balance_after: 1150,
          description: "ドリンク購入",
          expires_at: null,
          created_at: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
          company: {
            name: "フィットネスクラブA",
          },
        },
        {
          id: "3",
          transaction_type: "earn",
          amount: 75,
          balance_after: 1200,
          description: "ワークアウト完了ボーナス",
          expires_at: new Date(
            Date.now() + 45 * 24 * 60 * 60 * 1000
          ).toISOString(),
          created_at: new Date(
            Date.now() - 3 * 24 * 60 * 60 * 1000
          ).toISOString(),
          company: {
            name: "フィットネスクラブA",
          },
        },
      ];

      console.log("✅ [DEBUG] Mock points loaded:", mockPoints.length, "items");
      setUserPoints(mockPoints);

      // 会社フィルターの設定
      const filters: CompanyFilter[] = mockPoints.map((point) => ({
        id: point.company.id,
        name: point.company.name,
        totalPoints: point.current_points,
      }));
      setCompanyFilters(filters);

      // 初期選択
      if (filters.length > 0 && !selectedCompany) {
        setSelectedCompany(filters[0].id);
      }

      // フィルターされたトランザクションを設定
      const filteredTransactions = selectedCompany
        ? mockTransactions.filter((t) => {
            const company = mockPoints.find(
              (p) => p.company.id === selectedCompany
            );
            return company && t.company.name === company.company.name;
          })
        : mockTransactions;

      console.log(
        "✅ [DEBUG] Mock transactions loaded:",
        filteredTransactions.length,
        "items"
      );
      setTransactions(filteredTransactions);
    } catch (error: any) {
      console.error("💥 [DEBUG] Error in PointsScreen loadData:", error);
      Alert.alert("エラー", "ポイントデータの読み込みに失敗しました");
    } finally {
      console.log("🏁 [DEBUG] PointsScreen loading completed");
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    if (user) {
      loadData();
    } else {
      console.log(
        "❌ [DEBUG] No user in PointsScreen, setting loading to false"
      );
      setLoading(false);
    }
  }, [user, selectedCompany]);

  const onRefresh = () => {
    setRefreshing(true);
    loadData();
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("ja-JP", {
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const getTransactionIcon = (type: string) => {
    switch (type) {
      case "earn":
        return "plus-circle";
      case "use":
        return "minus-circle";
      case "expire":
        return "clock-alert";
      case "adjust":
        return "cog";
      default:
        return "circle";
    }
  };

  const getTransactionColor = (type: string) => {
    switch (type) {
      case "earn":
        return colors.mint[500];
      case "use":
        return colors.pink[500];
      case "expire":
        return colors.warning;
      case "adjust":
        return colors.purple[500];
      default:
        return colors.gray[500];
    }
  };

  const getTransactionLabel = (type: string) => {
    switch (type) {
      case "earn":
        return "獲得";
      case "use":
        return "使用";
      case "expire":
        return "期限切れ";
      case "adjust":
        return "調整";
      default:
        return type;
    }
  };

  const renderPointsSummary = () => {
    const selectedPoints = userPoints.find(
      (p) => p.company.id === selectedCompany
    );
    if (!selectedPoints) return null;

    return (
      <Card style={styles.summaryCard}>
        <View style={styles.summaryHeader}>
          <Text variant="body" weight="semibold">
            {selectedPoints.company.name}
          </Text>
          <Text variant="caption" color="gray">
            {selectedPoints.point_system.name}
          </Text>
        </View>

        <View style={styles.currentPointsContainer}>
          <Text variant="heading1" weight="bold" color="primary">
            {selectedPoints.current_points.toLocaleString()}
          </Text>
          <Text variant="body" color="gray">
            {selectedPoints.point_system.point_unit}
          </Text>
        </View>

        <View style={styles.statsContainer}>
          <View style={styles.statItem}>
            <Text variant="caption" color="gray">
              累計獲得
            </Text>
            <Text variant="body" weight="semibold">
              {selectedPoints.total_earned.toLocaleString()}
            </Text>
          </View>
          <View style={styles.statItem}>
            <Text variant="caption" color="gray">
              累計使用
            </Text>
            <Text variant="body" weight="semibold">
              {selectedPoints.total_used.toLocaleString()}
            </Text>
          </View>
          <View style={styles.statItem}>
            <Text variant="caption" color="gray">
              交換レート
            </Text>
            <Text variant="body" weight="semibold">
              1円 = {selectedPoints.point_system.conversion_rate}
              {selectedPoints.point_system.point_unit}
            </Text>
          </View>
        </View>
      </Card>
    );
  };

  const renderCompanySelector = () => (
    <View style={styles.companySelector}>
      <ScrollView horizontal showsHorizontalScrollIndicator={false}>
        {companyFilters.map((company) => (
          <TouchableOpacity
            key={company.id}
            style={[
              styles.companyTab,
              selectedCompany === company.id && styles.selectedCompanyTab,
            ]}
            onPress={() => setSelectedCompany(company.id)}
          >
            <Text
              variant="caption"
              weight="medium"
              color={selectedCompany === company.id ? "white" : "gray"}
            >
              {company.name}
            </Text>
            <Text
              variant="caption"
              color={selectedCompany === company.id ? "white" : "gray"}
            >
              {company.totalPoints.toLocaleString()}pt
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>
    </View>
  );

  const renderTransaction = ({ item }: { item: PointTransaction }) => (
    <Card style={styles.transactionCard}>
      <View style={styles.transactionHeader}>
        <View style={styles.transactionInfo}>
          <View style={styles.transactionIcon}>
            <MaterialCommunityIcons
              name={getTransactionIcon(item.transaction_type) as any}
              size={20}
              color={getTransactionColor(item.transaction_type)}
            />
          </View>
          <View>
            <Text variant="body" weight="semibold">
              {item.description || getTransactionLabel(item.transaction_type)}
            </Text>
            <Text variant="caption" color="gray">
              {formatDate(item.created_at)}
            </Text>
          </View>
        </View>
        <View style={styles.transactionAmount}>
          <Text
            variant="body"
            weight="bold"
            style={{ color: getTransactionColor(item.transaction_type) }}
          >
            {item.transaction_type === "earn" ? "+" : "-"}
            {Math.abs(item.amount).toLocaleString()}
          </Text>
          <Text variant="caption" color="gray">
            残高: {item.balance_after.toLocaleString()}
          </Text>
        </View>
      </View>

      {item.expires_at && (
        <View style={styles.expirationInfo}>
          <MaterialCommunityIcons
            name="clock"
            size={14}
            color={colors.orange[500]}
          />
          <Text variant="caption" color="gray" style={styles.expirationText}>
            有効期限: {formatDate(item.expires_at)}
          </Text>
        </View>
      )}
    </Card>
  );

  if (loading) {
    return (
      <View style={styles.container}>
        <View style={styles.loadingContainer}>
          <Text>読み込み中...</Text>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text variant="heading2" weight="bold">
          ポイント
        </Text>
      </View>

      {companyFilters.length > 1 && renderCompanySelector()}

      <FlatList
        data={transactions}
        keyExtractor={(item) => item.id}
        renderItem={renderTransaction}
        ListHeaderComponent={renderPointsSummary}
        contentContainerStyle={styles.listContainer}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <MaterialCommunityIcons
              name="star-circle"
              size={48}
              color={colors.gray[400]}
            />
            <Text variant="body" color="gray" style={styles.emptyText}>
              ポイント履歴がありません
            </Text>
            <Text variant="caption" color="gray" style={styles.emptySubtext}>
              施設を利用してポイントを貯めましょう
            </Text>
          </View>
        }
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.pink[50],
  },
  header: {
    padding: spacing.lg,
    backgroundColor: colors.white,
  },
  companySelector: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    backgroundColor: colors.white,
    borderBottomWidth: 1,
    borderBottomColor: colors.gray[200],
  },
  companyTab: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    marginRight: spacing.sm,
    borderRadius: 20,
    backgroundColor: colors.gray[100],
    alignItems: "center",
  },
  selectedCompanyTab: {
    backgroundColor: colors.purple[500],
  },
  listContainer: {
    padding: spacing.md,
  },
  summaryCard: {
    marginBottom: spacing.lg,
    backgroundColor: colors.white,
  },
  summaryHeader: {
    alignItems: "center",
    marginBottom: spacing.md,
  },
  currentPointsContainer: {
    alignItems: "center",
    marginBottom: spacing.lg,
  },
  statsContainer: {
    flexDirection: "row",
    justifyContent: "space-around",
    paddingTop: spacing.md,
    borderTopWidth: 1,
    borderTopColor: colors.gray[200],
  },
  statItem: {
    alignItems: "center",
  },
  transactionCard: {
    marginBottom: spacing.sm,
  },
  transactionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  transactionInfo: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
  },
  transactionIcon: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: colors.gray[100],
    justifyContent: "center",
    alignItems: "center",
    marginRight: spacing.sm,
  },
  transactionAmount: {
    alignItems: "flex-end",
  },
  expirationInfo: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: spacing.sm,
    paddingTop: spacing.sm,
    borderTopWidth: 1,
    borderTopColor: colors.gray[200],
  },
  expirationText: {
    marginLeft: spacing.xs,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  emptyContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingVertical: spacing.xl,
  },
  emptyText: {
    marginTop: spacing.md,
    textAlign: "center",
  },
  emptySubtext: {
    marginTop: spacing.sm,
    textAlign: "center",
  },
});
