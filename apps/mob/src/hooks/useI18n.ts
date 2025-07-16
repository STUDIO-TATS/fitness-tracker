import { useState, useEffect } from 'react';
import i18n from '../i18n';
import AsyncStorage from '@react-native-async-storage/async-storage';

const LANGUAGE_KEY = '@fitness_tracker_language';

export const useI18n = () => {
  const [currentLanguage, setCurrentLanguage] = useState(i18n.locale || 'ja');

  useEffect(() => {
    // 保存された言語設定を読み込む
    loadLanguage();
  }, []);

  const loadLanguage = async () => {
    try {
      const savedLanguage = await AsyncStorage.getItem(LANGUAGE_KEY);
      if (savedLanguage && (savedLanguage === 'ja' || savedLanguage === 'en')) {
        i18n.locale = savedLanguage;
        setCurrentLanguage(savedLanguage);
      }
    } catch (error) {
      console.error('Failed to load language:', error);
    }
  };

  const changeLanguage = async (language: string) => {
    try {
      if (language === 'ja' || language === 'en') {
        i18n.locale = language;
        setCurrentLanguage(language);
        await AsyncStorage.setItem(LANGUAGE_KEY, language);
      }
    } catch (error) {
      console.error('Failed to save language:', error);
    }
  };

  const t = (key: string, options?: any) => {
    try {
      return i18n.t(key, options);
    } catch (error) {
      console.error('Translation error for key:', key, error);
      return key; // フォールバックとしてキーを返す
    }
  };

  return {
    t,
    currentLanguage,
    changeLanguage,
    availableLanguages: [
      { code: 'ja', name: '日本語' },
      { code: 'en', name: 'English' },
    ],
  };
};