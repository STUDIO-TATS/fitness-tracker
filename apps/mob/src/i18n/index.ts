import { I18n } from 'i18n-js';
import { getLocales } from 'expo-localization';

// 翻訳ファイル
import ja from './locales/ja';
import en from './locales/en';

// i18nインスタンスを作成
const i18n = new I18n({
  ja,
  en,
});

// デバイスの言語設定を取得
const deviceLocales = getLocales();
const deviceLanguage = deviceLocales?.[0]?.languageCode || 'ja';

// サポートされている言語コードに正規化
const normalizedLocale = deviceLanguage.startsWith('ja') ? 'ja' : 
                        deviceLanguage.startsWith('en') ? 'en' : 'ja';

i18n.locale = normalizedLocale;

// フォールバックを有効化
i18n.enableFallback = true;
// デフォルト言語を日本語に設定
i18n.defaultLocale = 'ja';

export default i18n;