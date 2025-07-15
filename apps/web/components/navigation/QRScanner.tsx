'use client'

import { useState } from 'react'
import dynamic from 'next/dynamic'
import Icon from 'react-native-vector-icons/Ionicons'

const QrReader = dynamic(() => import('react-qr-reader').then((mod) => mod.QrReader), {
  ssr: false,
})

interface QRScannerProps {
  onClose: () => void
}

export default function QRScanner({ onClose }: QRScannerProps) {
  const [scanResult, setScanResult] = useState<string>('')
  const [isScanning, setIsScanning] = useState(true)

  const handleScan = (result: any) => {
    if (result?.text) {
      setScanResult(result.text)
      setIsScanning(false)
    }
  }

  const handleError = (error: any) => {
    console.error('QRスキャンエラー:', error)
  }

  const resetScanner = () => {
    setScanResult('')
    setIsScanning(true)
  }

  return (
    <div className="p-4">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
          QRコードスキャナー
        </h3>
        <button
          onClick={onClose}
          className="p-2 rounded-md text-gray-400 hover:text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-700"
          aria-label="閉じる"
        >
          <Icon name="close-outline" size={24} />
        </button>
      </div>

      {isScanning ? (
        <div className="relative">
          <QrReader
            onResult={handleScan}
            onError={handleError}
            constraints={{ facingMode: 'environment' }}
            className="w-full"
          />
          <div className="mt-2 text-sm text-gray-600 dark:text-gray-400 text-center">
            QRコードをカメラに向けてください
          </div>
        </div>
      ) : (
        <div className="space-y-4">
          <div className="p-4 bg-green-50 dark:bg-green-900/20 rounded-lg">
            <div className="flex items-start">
              <Icon name="checkmark-circle" size={24} color="#10B981" style={{ marginRight: 8 }} />
              <div className="flex-1">
                <h4 className="text-sm font-medium text-green-800 dark:text-green-200">
                  読み取り成功
                </h4>
                <p className="mt-1 text-sm text-gray-700 dark:text-gray-300 break-all">
                  {scanResult}
                </p>
              </div>
            </div>
          </div>
          <button
            onClick={resetScanner}
            className="w-full px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            もう一度スキャンする
          </button>
        </div>
      )}
    </div>
  )
}