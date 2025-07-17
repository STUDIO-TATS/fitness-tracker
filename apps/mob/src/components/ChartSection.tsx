import React from "react";
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  Dimensions,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { LineChart, BarChart } from "react-native-chart-kit";
import { commonStyles, typography } from "../constants/styles";
import { theme } from "../constants/theme";

const screenWidth = Dimensions.get("window").width;

interface ChartSectionProps {
  title: string;
  unit: string;
  data: { [key: string]: any };
  chartType: "line" | "bar";
  currentPeriod: string;
  periods: Array<{ key: string; label: string }>;
  onPeriodChange: (period: string) => void;
  chartConfig?: any;
  isModal?: boolean;
  modalPeriods?: Array<{ key: string; label: string }>;
  icon?: string;
}

export const ChartSection: React.FC<ChartSectionProps> = ({
  title,
  unit,
  data,
  chartType,
  currentPeriod,
  periods,
  onPeriodChange,
  chartConfig,
  isModal = false,
  modalPeriods,
  icon,
}) => {
  const defaultChartConfig = {
    backgroundGradientFrom: theme.colors.background.primary,
    backgroundGradientTo: theme.colors.background.primary,
    decimalPlaces: 1,
    color: (opacity = 1) => theme.colors.chart.primary,
    labelColor: (opacity = 1) => theme.colors.text.secondary,
    style: {
      borderRadius: theme.borderRadius.lg,
    },
    propsForDots: {
      r: "6",
      strokeWidth: "2",
      stroke: theme.colors.action.primary,
    },
    propsForVerticalLabels: {
      fontSize: 12,
    },
    propsForHorizontalLabels: {
      fontSize: 12,
    },
  };

  const finalChartConfig = { ...defaultChartConfig, ...chartConfig };

  const renderChart = () => {
    const chartData = data?.[currentPeriod];
    // グラフの幅を計算 - データポイント数に応じて幅を調整
    const dataPointCount = chartData?.labels?.length || 5;
    const minChartWidth = screenWidth - 64;
    const calculatedWidth = Math.max(dataPointCount * 80, minChartWidth);
    const chartWidth = isModal ? calculatedWidth - 20 : calculatedWidth;
    const chartHeight = isModal ? 250 : 200;

    // データがない場合は空のチャートを表示
    if (!chartData || !chartData.labels || chartData.labels.length === 0) {
      const emptyData = {
        labels: ["データなし"],
        datasets: [
          {
            data: [0],
            color: (opacity = 1) => theme.colors.chart.primary,
            strokeWidth: 2,
          },
        ],
      };

      if (chartType === "line") {
        return (
          <LineChart
            data={emptyData}
            width={chartWidth}
            height={chartHeight}
            chartConfig={finalChartConfig}
            bezier
            style={styles.chart}
            withInnerLines={false}
            withOuterLines={true}
            withVerticalLabels={true}
            withHorizontalLabels={true}
            withDots={true}
            withShadow={false}
          />
        );
      } else {
        return (
          <BarChart
            data={emptyData}
            width={chartWidth}
            height={chartHeight}
            yAxisLabel=""
            yAxisSuffix=""
            chartConfig={finalChartConfig}
            style={styles.chart}
            withInnerLines={false}
            showBarTops={false}
          />
        );
      }
    }

    if (chartType === "line") {
      return (
        <LineChart
          data={chartData}
          width={chartWidth}
          height={chartHeight}
          chartConfig={finalChartConfig}
          bezier
          style={styles.chart}
          withInnerLines={false}
          withOuterLines={true}
          withVerticalLabels={true}
          withHorizontalLabels={true}
          withDots={true}
          withShadow={false}
          formatXLabel={(value) => {
            // 数字のみを抽出して月を追加
            const match = value.match(/(\d+)/);
            if (match) {
              return `${match[1]}月`;
            }
            return value;
          }}
        />
      );
    } else {
      return (
        <BarChart
          data={chartData}
          width={chartWidth}
          height={chartHeight}
          yAxisLabel=""
          yAxisSuffix=""
          chartConfig={finalChartConfig}
          style={styles.chart}
          withInnerLines={false}
          showBarTops={false}
        />
      );
    }
  };

  return (
    <View style={isModal ? styles.modalSection : commonStyles.section}>
      <View
        style={isModal ? styles.modalSectionHeader : commonStyles.sectionHeader}
      >
        {!isModal && (
          <View style={styles.titleContainer}>
            {icon && (
              <Ionicons
                name={icon as any}
                size={20}
                color={theme.colors.text.primary}
                style={styles.titleIcon}
              />
            )}
            <Text style={commonStyles.sectionTitle}>{title}</Text>
          </View>
        )}
        <View style={styles.tabContainer}>
          {(isModal ? modalPeriods || periods : periods).map((period) => (
            <TouchableOpacity
              key={period.key}
              style={[
                styles.tab,
                currentPeriod === period.key && styles.activeTab,
              ]}
              onPress={() => onPeriodChange(period.key)}
            >
              <Text
                style={[
                  styles.tabText,
                  currentPeriod === period.key && styles.activeTabText,
                ]}
              >
                {period.label}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>
      {isModal ? (
        <View style={styles.modalChartWrapper}>
          <View style={styles.chartUnitWrapper}>
            <Text style={styles.chartUnit}>{unit}</Text>
          </View>
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            {renderChart()}
          </ScrollView>
        </View>
      ) : (
        <View style={styles.chartContainer}>
          <View style={styles.chartUnitWrapper}>
            <Text style={styles.chartUnit}>{unit}</Text>
          </View>
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            {renderChart()}
          </ScrollView>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  chartContainer: {
    padding: theme.spacing.md,
    paddingLeft: 0,
    marginHorizontal: 0,
    position: "relative",
  },
  chartUnitWrapper: {
    position: "absolute",
    top: 0,
    right: theme.spacing.lg,
    zIndex: 1,
  },
  chartUnit: {
    ...typography.small,
    color: theme.colors.text.secondary,
    fontWeight: theme.fontWeight.medium,
  },
  chart: {
    borderRadius: theme.borderRadius.sm,
  },
  tabContainer: {
    flexDirection: "row",
    backgroundColor: theme.colors.background.secondary,
    borderRadius: theme.borderRadius.md,
    padding: 2,
  },
  tab: {
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.sm,
    borderRadius: theme.borderRadius.sm,
    minWidth: 50,
    alignItems: "center",
  },
  activeTab: {
    backgroundColor: theme.colors.background.primary,
    ...theme.shadows.sm,
  },
  tabText: {
    ...typography.small,
    color: theme.colors.text.secondary,
    fontWeight: theme.fontWeight.medium,
  },
  activeTabText: {
    color: theme.colors.text.primary,
    fontWeight: theme.fontWeight.semibold,
  },
  modalSection: {
    marginBottom: theme.spacing.lg,
  },
  modalSectionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: theme.spacing.lg,
    paddingHorizontal: 0,
  },
  modalChartWrapper: {
    position: "relative",
    marginHorizontal: 0,
  },
  titleContainer: {
    flexDirection: "row",
    alignItems: "center",
  },
  titleIcon: {
    marginRight: theme.spacing.sm,
  },
});
