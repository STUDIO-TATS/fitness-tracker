import { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import { Session } from '@supabase/supabase-js';

interface AuthState {
  session: Session | null;
  isLoading: boolean;
  isAnonymous: boolean;
}

export function useAuth() {
  const [authState, setAuthState] = useState<AuthState>({
    session: null,
    isLoading: true,
    isAnonymous: false,
  });

  useEffect(() => {
    // 現在のセッションを取得
    supabase.auth.getSession().then(({ data: { session } }) => {
      setAuthState({
        session,
        isLoading: false,
        isAnonymous: session?.user?.is_anonymous || false,
      });
    });

    // セッション変更を監視
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setAuthState({
        session,
        isLoading: false,
        isAnonymous: session?.user?.is_anonymous || false,
      });
    });

    return () => subscription.unsubscribe();
  }, []);

  const convertToRegularUser = async (email: string, password: string) => {
    try {
      // 匿名ユーザーを正式ユーザーに変換
      const { data, error } = await supabase.auth.updateUser({
        email,
        password,
      });

      if (error) throw error;

      // プロフィールを更新（匿名フラグを削除）
      if (data.user) {
        const { error: profileError } = await supabase
          .from('user_profiles')
          .update({
            preferences: {
              isAnonymous: false,
              convertedAt: new Date().toISOString(),
            },
          })
          .eq('user_id', data.user.id);

        if (profileError) {
          console.error('Error updating profile:', profileError);
        }
      }

      return data;
    } catch (error) {
      console.error('Error converting to regular user:', error);
      throw error;
    }
  };

  return {
    ...authState,
    convertToRegularUser,
    isGuest: authState.isAnonymous,
    isAuthenticated: authState.session && !authState.isAnonymous,
    currentUserId: authState.session?.user?.id || null,
    userEmail: authState.session?.user?.email || null,
  };
}