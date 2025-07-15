import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Alert,
} from 'react-native';
import { CameraView, Camera } from 'expo-camera';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '../constants/colors';
import { typography, spacing, borderRadius, layout } from '../constants/styles';

export default function QRScannerScreen() {
  const [hasPermission, setHasPermission] = useState<boolean | null>(null);
  const [scanned, setScanned] = useState(false);
  const [torchOn, setTorchOn] = useState(false);

  useEffect(() => {
    (async () => {
      const { status } = await Camera.requestCameraPermissionsAsync();
      setHasPermission(status === 'granted');
    })();
  }, []);

  const handleBarCodeScanned = ({ type, data }: { type: string; data: string }) => {
    setScanned(true);
    Alert.alert(
      'QRコードをスキャンしました',
      `タイプ: ${type}\nデータ: ${data}`,
      [
        { text: 'もう一度スキャン', onPress: () => setScanned(false) },
        { text: 'OK', style: 'default' },
      ]
    );
  };

  if (hasPermission === null) {
    return (
      <View style={styles.container}>
        <Text>カメラの許可を確認中...</Text>
      </View>
    );
  }

  if (hasPermission === false) {
    return (
      <View style={styles.container}>
        <Ionicons name="camera-off" size={64} color={colors.gray[400]} />
        <Text style={styles.permissionText}>カメラへのアクセスが拒否されました</Text>
        <Text style={styles.permissionSubtext}>
          設定からカメラの使用を許可してください
        </Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <CameraView
        style={StyleSheet.absoluteFillObject}
        onBarcodeScanned={scanned ? undefined : handleBarCodeScanned}
        barcodeScannerSettings={{
          barcodeTypes: ['qr', 'ean13', 'ean8'],
        }}
        enableTorch={torchOn}
      />

      <View style={styles.overlay}>
        <View style={styles.header}>
          <Text style={styles.title}>QRコードをスキャン</Text>
          <TouchableOpacity
            style={styles.torchButton}
            onPress={() => setTorchOn(!torchOn)}
          >
            <Ionicons
              name={torchOn ? 'flash' : 'flash-off'}
              size={24}
              color={colors.white}
            />
          </TouchableOpacity>
        </View>

        <View style={styles.scanArea}>
          <View style={styles.corner} />
          <View style={[styles.corner, styles.cornerTR]} />
          <View style={[styles.corner, styles.cornerBL]} />
          <View style={[styles.corner, styles.cornerBR]} />
        </View>

        <Text style={styles.instruction}>
          QRコードを枠内に配置してください
        </Text>

        {scanned && (
          <TouchableOpacity
            style={styles.rescanButton}
            onPress={() => setScanned(false)}
          >
            <Text style={styles.rescanText}>再スキャン</Text>
          </TouchableOpacity>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.black,
    justifyContent: 'center',
    alignItems: 'center',
  },
  permissionText: {
    ...typography.cardTitle,
    color: colors.gray[600],
    marginTop: spacing.lg,
    textAlign: 'center',
  },
  permissionSubtext: {
    ...typography.small,
    color: colors.gray[500],
    marginTop: spacing.sm,
    textAlign: 'center',
  },
  overlay: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: 'space-between',
    padding: layout.screenPadding,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: spacing.xxxl + spacing.sm,
  },
  title: {
    ...typography.sectionTitle,
    fontSize: 24,
    color: colors.white,
  },
  torchButton: {
    width: 44,
    height: 44,
    borderRadius: borderRadius.full,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  scanArea: {
    width: 250,
    height: 250,
    alignSelf: 'center',
    position: 'relative',
  },
  corner: {
    position: 'absolute',
    width: 40,
    height: 40,
    borderColor: colors.primary,
    borderWidth: 3,
    borderTopWidth: 3,
    borderLeftWidth: 3,
    borderBottomWidth: 0,
    borderRightWidth: 0,
  },
  cornerTR: {
    top: 0,
    right: 0,
    transform: [{ rotate: '90deg' }],
  },
  cornerBL: {
    bottom: 0,
    left: 0,
    transform: [{ rotate: '-90deg' }],
  },
  cornerBR: {
    bottom: 0,
    right: 0,
    transform: [{ rotate: '180deg' }],
  },
  instruction: {
    ...typography.body,
    color: colors.white,
    textAlign: 'center',
    marginBottom: spacing.xxxl + spacing.sm,
  },
  rescanButton: {
    backgroundColor: colors.primary,
    paddingHorizontal: spacing.xxl,
    paddingVertical: spacing.md,
    borderRadius: borderRadius.xl,
    alignSelf: 'center',
    marginBottom: spacing.xxxl + spacing.sm,
  },
  rescanText: {
    ...typography.body,
    color: colors.white,
    fontWeight: '600',
  },
});