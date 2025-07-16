// モック認証サービス（ネットワークエラー回避用）
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Session, User } from '@supabase/supabase-js';

const MOCK_SESSION_KEY = 'mock_supabase_session';

export class MockAuthService {
  private currentSession: Session | null = null;
  private listeners: Array<(event: string, session: Session | null) => void> = [];

  async initialize() {
    const savedSession = await AsyncStorage.getItem(MOCK_SESSION_KEY);
    if (savedSession) {
      this.currentSession = JSON.parse(savedSession);
    }
  }

  async signUp({ email, password }: { email: string; password: string }) {
    // モック実装: 新規登録もログインと同じ処理
    return this.signInWithPassword({ email, password });
  }

  async signInWithPassword({ email, password }: { email: string; password: string }) {
    // テストユーザーの検証
    const validUsers = [
      { email: 'testuser1@example.com', password: 'Test1234!' },
      { email: 'admin@example.com', password: 'Admin1234!' },
      { email: 'demo@example.com', password: 'Demo1234!' },
    ];

    const isValid = validUsers.some(u => u.email === email && u.password === password);
    
    if (!isValid) {
      throw new Error('Invalid email or password');
    }

    // モックセッションを作成
    const mockUser: User = {
      id: `mock-${Date.now()}`,
      email,
      app_metadata: {},
      user_metadata: {},
      aud: 'authenticated',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    const mockSession: Session = {
      access_token: 'mock-access-token',
      refresh_token: 'mock-refresh-token',
      expires_in: 3600,
      expires_at: Math.floor(Date.now() / 1000) + 3600,
      token_type: 'bearer',
      user: mockUser,
    };

    this.currentSession = mockSession;
    await AsyncStorage.setItem(MOCK_SESSION_KEY, JSON.stringify(mockSession));
    
    // リスナーに通知
    this.listeners.forEach(listener => listener('SIGNED_IN', mockSession));

    return { data: { session: mockSession, user: mockUser }, error: null };
  }

  async signOut() {
    this.currentSession = null;
    await AsyncStorage.removeItem(MOCK_SESSION_KEY);
    
    // リスナーに通知
    this.listeners.forEach(listener => listener('SIGNED_OUT', null));
    
    return { error: null };
  }

  async getSession() {
    await this.initialize();
    return { data: { session: this.currentSession }, error: null };
  }

  onAuthStateChange(callback: (event: string, session: Session | null) => void) {
    this.listeners.push(callback);
    
    return {
      data: { subscription: { unsubscribe: () => {
        this.listeners = this.listeners.filter(l => l !== callback);
      }}},
    };
  }
}

export const mockAuth = new MockAuthService();