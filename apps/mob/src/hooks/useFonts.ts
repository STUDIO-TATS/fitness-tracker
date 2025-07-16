import { useEffect, useState } from 'react';
import * as Font from 'expo-font';
import {
  NotoSansJP_400Regular,
  NotoSansJP_500Medium,
  NotoSansJP_700Bold,
} from '@expo-google-fonts/noto-sans-jp';

export const useFonts = () => {
  const [fontsLoaded, setFontsLoaded] = useState(false);

  useEffect(() => {
    async function loadFonts() {
      try {
        await Font.loadAsync({
          'NotoSansJP-Regular': NotoSansJP_400Regular,
          'NotoSansJP-Medium': NotoSansJP_500Medium,
          'NotoSansJP-Bold': NotoSansJP_700Bold,
        });
        setFontsLoaded(true);
      } catch (error) {
        console.error('Failed to load fonts:', error);
        // フォントの読み込みに失敗してもアプリは動作させる
        setFontsLoaded(true);
      }
    }

    loadFonts();
  }, []);

  return fontsLoaded;
};