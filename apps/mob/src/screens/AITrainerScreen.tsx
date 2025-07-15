import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  FlatList,
  Alert,
  Animated,
  Dimensions,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { ScreenWrapper } from '../components/ScreenWrapper';
import { colors } from '../constants/colors';
import { commonStyles, spacing, typography, layout, borderRadius, shadows } from '../constants/styles';

interface Message {
  id: string;
  text: string;
  isBot: boolean;
  timestamp: Date;
  type?: 'workout' | 'nutrition' | 'motivation' | 'general';
}

interface WorkoutSuggestion {
  id: string;
  name: string;
  duration: string;
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  category: string;
}

const screenWidth = Dimensions.get('window').width;

export default function AITrainerScreen() {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      text: 'こんにちは！私はあなたのパーソナルAIトレーナーです。今日の目標やご質問があればお気軽にお話しください！',
      isBot: true,
      timestamp: new Date(),
      type: 'general',
    },
  ]);
  const [inputText, setInputText] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [quickActions] = useState([
    { id: '1', text: 'ワークアウトプランを作成', icon: 'barbell', type: 'workout' },
    { id: '2', text: '食事アドバイス', icon: 'nutrition', type: 'nutrition' },
    { id: '3', text: 'モチベーションが欲しい', icon: 'heart', type: 'motivation' },
    { id: '4', text: 'フォームチェック', icon: 'body', type: 'general' },
  ]);
  
  const flatListRef = useRef<FlatList>(null);
  const typingAnimation = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (isTyping) {
      Animated.loop(
        Animated.sequence([
          Animated.timing(typingAnimation, {
            toValue: 1,
            duration: 500,
            useNativeDriver: true,
          }),
          Animated.timing(typingAnimation, {
            toValue: 0,
            duration: 500,
            useNativeDriver: true,
          }),
        ])
      ).start();
    } else {
      typingAnimation.setValue(0);
    }
  }, [isTyping]);

  const generateAIResponse = (userMessage: string, type?: string): string => {
    const responses = {
      workout: [
        '素晴らしいですね！今日のワークアウトプランを作成しましょう。現在の体力レベルと目標を教えてください。',
        '今日はどの部位を鍛えたいですか？全身、上半身、下半身、または特定の筋肉群を選んでください。',
        'ワークアウトを始める前に、必ずウォーミングアップを行いましょう。5-10分の軽い有酸素運動から始めることをお勧めします。',
      ],
      nutrition: [
        '栄養バランスの取れた食事が重要ですね。今日の食事状況を教えてください。改善点をアドバイスします。',
        'プロテインの摂取を意識していますか？筋肉の成長と回復には、体重1kgあたり1.6-2.2gのプロテインが必要です。',
        '水分補給も大切です。1日2-3リットルの水を飲むことを心がけましょう。',
      ],
      motivation: [
        '頑張っていますね！小さな進歩も大きな成果につながります。今日も一歩ずつ前進しましょう！',
        'あなたの努力は必ず報われます。継続することが最も重要です。今日もできることから始めましょう！',
        '困難な時こそ成長のチャンスです。あなたならきっと乗り越えられます。一緒に頑張りましょう！',
      ],
      general: [
        '興味深い質問ですね。詳しく教えてください。',
        'それについてもう少し詳しく説明していただけますか？',
        'その点について、個別のアドバイスを提供させていただきます。',
      ],
    };

    const categoryResponses = responses[type as keyof typeof responses] || responses.general;
    const randomResponse = categoryResponses[Math.floor(Math.random() * categoryResponses.length)];
    
    return randomResponse;
  };

  const sendMessage = (text: string, type?: string) => {
    if (text.trim() === '') return;

    const userMessage: Message = {
      id: Date.now().toString(),
      text: text.trim(),
      isBot: false,
      timestamp: new Date(),
    };

    setMessages(prev => [...prev, userMessage]);
    setInputText('');
    setIsTyping(true);

    // Simulate AI response delay
    setTimeout(() => {
      const aiResponse: Message = {
        id: (Date.now() + 1).toString(),
        text: generateAIResponse(text, type),
        isBot: true,
        timestamp: new Date(),
        type: type as any,
      };
      
      setMessages(prev => [...prev, aiResponse]);
      setIsTyping(false);
    }, 1500);
  };

  const handleQuickAction = (action: any) => {
    sendMessage(action.text, action.type);
  };

  const renderMessage = ({ item }: { item: Message }) => {
    return (
      <View style={[
        styles.messageContainer,
        item.isBot ? styles.botMessage : styles.userMessage
      ]}>
        <View style={[
          styles.messageBubble,
          item.isBot ? styles.botBubble : styles.userBubble
        ]}>
          {item.isBot && (
            <View style={styles.botIcon}>
              <Ionicons name="fitness" size={16} color={colors.white} />
            </View>
          )}
          <Text style={[
            styles.messageText,
            item.isBot ? styles.botText : styles.userText
          ]}>
            {item.text}
          </Text>
        </View>
        <Text style={styles.timestamp}>
          {item.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
        </Text>
      </View>
    );
  };

  const renderTypingIndicator = () => {
    if (!isTyping) return null;

    return (
      <View style={[styles.messageContainer, styles.botMessage]}>
        <View style={[styles.messageBubble, styles.botBubble]}>
          <View style={styles.botIcon}>
            <Ionicons name="fitness" size={16} color={colors.white} />
          </View>
          <View style={styles.typingIndicator}>
            <Animated.View style={[
              styles.typingDot,
              { opacity: typingAnimation }
            ]} />
            <Animated.View style={[
              styles.typingDot,
              { opacity: typingAnimation, marginLeft: 4 }
            ]} />
            <Animated.View style={[
              styles.typingDot,
              { opacity: typingAnimation, marginLeft: 4 }
            ]} />
          </View>
        </View>
      </View>
    );
  };

  return (
    <ScreenWrapper backgroundColor={colors.purple[50]} noPadding dismissKeyboardOnTap={false}>
      <View style={styles.header}>
        <Text style={styles.screenTitle}>AIトレーナー</Text>
        <TouchableOpacity style={styles.settingsButton}>
          <Ionicons name="settings" size={24} color={colors.purple[700]} />
        </TouchableOpacity>
      </View>

      <View style={styles.quickActionsContainer}>
        <Text style={styles.quickActionsTitle}>クイックアクション</Text>
        <FlatList
          data={quickActions}
          horizontal
          showsHorizontalScrollIndicator={false}
          renderItem={({ item }) => (
            <TouchableOpacity
              style={styles.quickActionButton}
              onPress={() => handleQuickAction(item)}
            >
              <Ionicons name={item.icon as any} size={20} color={colors.purple[600]} />
              <Text style={styles.quickActionText}>{item.text}</Text>
            </TouchableOpacity>
          )}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.quickActionsList}
        />
      </View>

      <View style={styles.chatContainer}>
        <FlatList
          ref={flatListRef}
          data={messages}
          renderItem={renderMessage}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.messagesList}
          onContentSizeChange={() => flatListRef.current?.scrollToEnd()}
          ListFooterComponent={renderTypingIndicator}
        />
      </View>

      <View style={styles.inputContainer}>
        <TextInput
          style={styles.textInput}
          placeholder="メッセージを入力..."
          placeholderTextColor={colors.gray[400]}
          value={inputText}
          onChangeText={setInputText}
          multiline
          maxLength={500}
        />
        <TouchableOpacity
          style={[
            styles.sendButton,
            inputText.trim() ? styles.sendButtonActive : styles.sendButtonInactive
          ]}
          onPress={() => sendMessage(inputText)}
          disabled={inputText.trim() === ''}
        >
          <Ionicons
            name="send"
            size={20}
            color={inputText.trim() ? colors.white : colors.gray[400]}
          />
        </TouchableOpacity>
      </View>
    </ScreenWrapper>
  );
}

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: layout.screenPadding,
    paddingBottom: spacing.md,
    backgroundColor: colors.purple[50],
  },
  screenTitle: {
    ...typography.screenTitle,
    color: colors.purple[700],
  },
  settingsButton: {
    padding: spacing.sm,
  },
  quickActionsContainer: {
    backgroundColor: colors.white,
    paddingVertical: spacing.lg,
    borderBottomWidth: 1,
    borderBottomColor: colors.gray[100],
  },
  quickActionsTitle: {
    ...typography.small,
    color: colors.gray[600],
    marginBottom: spacing.md,
    paddingHorizontal: layout.screenPadding,
  },
  quickActionsList: {
    paddingHorizontal: layout.screenPadding,
  },
  quickActionButton: {
    backgroundColor: colors.purple[50],
    borderRadius: borderRadius.lg,
    padding: spacing.md,
    marginRight: spacing.md,
    alignItems: 'center',
    minWidth: 80,
    borderWidth: 1,
    borderColor: colors.purple[200],
  },
  quickActionText: {
    ...typography.caption,
    color: colors.purple[700],
    marginTop: spacing.xs,
    textAlign: 'center',
    fontWeight: '500',
  },
  chatContainer: {
    flex: 1,
    backgroundColor: colors.gray[50],
  },
  messagesList: {
    padding: spacing.lg,
  },
  messageContainer: {
    marginBottom: spacing.lg,
  },
  botMessage: {
    alignItems: 'flex-start',
  },
  userMessage: {
    alignItems: 'flex-end',
  },
  messageBubble: {
    maxWidth: screenWidth * 0.8,
    borderRadius: borderRadius.lg,
    padding: spacing.lg,
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  botBubble: {
    backgroundColor: colors.white,
    borderBottomLeftRadius: 4,
    ...shadows.sm,
  },
  userBubble: {
    backgroundColor: colors.purple[500],
    borderBottomRightRadius: 4,
  },
  botIcon: {
    width: 24,
    height: 24,
    borderRadius: borderRadius.full,
    backgroundColor: colors.purple[500],
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: spacing.md,
    marginTop: 2,
  },
  messageText: {
    ...typography.body,
    flex: 1,
    lineHeight: 22,
  },
  botText: {
    color: colors.gray[900],
  },
  userText: {
    color: colors.white,
  },
  timestamp: {
    ...typography.caption,
    color: colors.gray[500],
    marginTop: spacing.xs,
  },
  typingIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: spacing.sm,
  },
  typingDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: colors.gray[400],
  },
  inputContainer: {
    flexDirection: 'row',
    padding: spacing.lg,
    backgroundColor: colors.white,
    borderTopWidth: 1,
    borderTopColor: colors.gray[200],
    alignItems: 'flex-end',
  },
  textInput: {
    flex: 1,
    borderWidth: 1,
    borderColor: colors.gray[300],
    borderRadius: borderRadius.lg,
    padding: spacing.md,
    marginRight: spacing.md,
    maxHeight: 100,
    ...typography.body,
    color: colors.gray[900],
  },
  sendButton: {
    width: 40,
    height: 40,
    borderRadius: borderRadius.full,
    justifyContent: 'center',
    alignItems: 'center',
  },
  sendButtonActive: {
    backgroundColor: colors.purple[500],
  },
  sendButtonInactive: {
    backgroundColor: colors.gray[200],
  },
});