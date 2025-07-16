# ゲストモード ユーザーフロー

## 概要

フィットネストラッカーアプリでは、ユーザー登録なしでアプリを体験できるゲストモードを提供しています。Supabaseの匿名認証とローカルバックアップシステムを組み合わせて、安全で便利なゲスト体験を実現しています。

## 技術構成

- **認証**: Supabase匿名認証
- **データ保存**: Supabaseデータベース（RLS適用）
- **バックアップ**: AsyncStorage（ローカルストレージ）
- **復元**: 自動検出 + ユーザー選択

## ユーザーフロー

### 1. 初回ゲストログイン

```
ログイン画面 
    ↓ 
「ゲストとして続ける」タップ
    ↓
Supabase匿名認証実行
    ↓
プロフィール作成（表示名：「ゲスト」）
    ↓
メイン画面へ遷移
```

**実装詳細:**
- `supabase.auth.signInAnonymously()` でセッション作成
- `user_profiles` テーブルに匿名フラグ付きプロフィール作成
- 既存のRLSポリシーが自動適用

### 2. データ蓄積・自動バックアップ

```
アプリ使用中
    ↓
データ入力（ワークアウト、測定、目標など）
    ↓
Supabaseに自動保存
    ↓
定期バックアップ（5分間隔）
    ↓
バックグラウンド移行時バックアップ
```

**バックアップタイミング:**
- 5分間隔の定期バックアップ
- アプリがバックグラウンド/非アクティブ時
- ログアウト処理時

**バックアップデータ:**
- プロフィール情報
- ワークアウトデータ + エクササイズ
- 測定データ
- 目標データ

### 3. ログアウト（データ保護）

```
プロフィール画面でログアウトタップ
    ↓
⚠️ 強化された警告ダイアログ表示
「重要なお知らせ
ゲストモードを終了すると、現在のデータに
アクセスできなくなります。

データはローカルにバックアップされ、
後で復元できますが、アカウント作成を
強くおすすめします。」
    ↓
3つの選択肢:
├── キャンセル → ログアウト中止
├── アカウント作成 → 正式ユーザー変換
└── 終了してバックアップ → データ保存後ログアウト
```

**実装詳細:**
```typescript
// 強化された警告
if (isGuest) {
  Alert.alert(
    'ゲストモード終了',
    '⚠️ 重要なお知らせ...',
    [
      { text: 'キャンセル', style: 'cancel' },
      { text: 'アカウント作成', onPress: () => setShowAccountCreation(true) },
      { 
        text: '終了してバックアップ', 
        style: 'destructive',
        onPress: async () => {
          await guestDataService.backupGuestData(session.user.id);
          await supabase.auth.signOut();
        }
      }
    ]
  );
}
```

### 4. 再ログイン・データ復元

```
ログイン画面表示
    ↓
バックアップデータ検出
    ↓
「ゲストとして続ける」ボタンの
サブテキストが変更：
「登録不要・以前のデータを復元可能」
    ↓
ボタンタップ
    ↓
復元確認ダイアログ表示
「以前のゲストデータが見つかりました。
復元しますか？」
├── 新しく開始 → 新規ゲストユーザー作成
└── 復元して開始 → データ復元
    ↓
復元処理実行
├── 新しい匿名ユーザー作成
├── バックアップデータを新ユーザーIDで復元
├── プロフィール、ワークアウト、測定、目標すべて復元
└── 成功メッセージ表示
    ↓
以前の状態でアプリ継続使用
```

**実装詳細:**
```typescript
// バックアップ検出
useEffect(() => {
  checkForBackup();
}, []);

const checkForBackup = async () => {
  const backup = await guestDataService.hasBackup();
  setHasBackup(backup);
};

// 復元処理
const handleRestoreBackup = () => {
  Alert.alert(
    'データ復元',
    '以前のゲストデータが見つかりました。復元しますか？',
    [
      { text: '新しく開始', onPress: () => handleContinueAsGuest(false) },
      { text: '復元して開始', onPress: () => handleContinueAsGuest(true) }
    ]
  );
};
```

### 5. 正式アカウント変換

```
プロフィール画面でアカウント作成バナー表示
「アカウントを作成してデータを保持しませんか？」
    ↓
「アカウント作成」タップ
    ↓
モーダル表示
├── メールアドレス入力
├── パスワード入力（6文字以上）
└── 「アカウント作成」ボタン
    ↓
匿名ユーザーを正式ユーザーに変換
    ↓
プロフィール更新（匿名フラグ削除）
    ↓
ローカルバックアップクリア（不要になるため）
    ↓
正式ユーザーとして継続使用
```

**実装詳細:**
```typescript
const convertToRegularUser = async (email: string, password: string) => {
  // 匿名ユーザーを正式ユーザーに変換
  const { data, error } = await supabase.auth.updateUser({
    email,
    password,
  });

  if (error) throw error;

  // プロフィール更新
  await supabase
    .from('user_profiles')
    .update({
      preferences: {
        isAnonymous: false,
        convertedAt: new Date().toISOString(),
      },
    })
    .eq('user_id', data.user.id);
};
```

## データ構造

### バックアップデータ形式

```typescript
interface GuestBackupData {
  userId: string;                    // バックアップ元のユーザーID
  displayName: string;               // 表示名
  profile: any;                      // プロフィール情報
  workouts: any[];                   // ワークアウトデータ
  measurements: any[];               // 測定データ
  goals: any[];                      // 目標データ
  backedUpAt: string;                // バックアップ作成日時
}
```

### ローカルストレージキー

```typescript
const STORAGE_KEYS = {
  GUEST_BACKUP: '@fitness_tracker_guest_backup',        // バックアップデータ
  LAST_GUEST_USER_ID: '@fitness_tracker_last_guest_user_id'  // 最後のゲストユーザーID
};
```

## セキュリティとプライバシー

### データ保護
- **Supabase RLS**: 匿名ユーザーも既存のRow Level Securityポリシー適用
- **ローカル暗号化**: AsyncStorageはOS標準の暗号化を使用
- **一意性保証**: 各匿名セッションは独立したユーザーID

### データライフサイクル
- **匿名データ**: ログアウト後はSupabaseからアクセス不可
- **ローカルバックアップ**: デバイス内に永続保存（アプリ削除まで）
- **正式変換後**: ローカルバックアップは自動クリア

## トラブルシューティング

### よくある問題

1. **バックアップ復元失敗**
   - 原因: ネットワーク接続不良、データ形式不整合
   - 対処: エラーログ確認、手動で新規開始

2. **アカウント変換エラー**
   - 原因: メールアドレス重複、パスワード要件不足
   - 対処: 別のメールアドレス使用、パスワード強化

3. **データ同期問題**
   - 原因: Supabase接続エラー、RLSポリシー問題
   - 対処: 接続確認、ポリシー見直し

### デバッグ情報

```typescript
// デバッグログの確認
console.log('Guest data backed up successfully');
console.log('Guest data restored successfully');
console.error('Error backing up guest data:', error);
```

## 今後の改善案

1. **クラウド同期**: 複数デバイス間でのゲストデータ同期
2. **データエクスポート**: ゲストデータのJSONエクスポート機能
3. **使用期限**: 一定期間後のローカルバックアップ自動削除
4. **容量管理**: バックアップサイズ制限とクリーンアップ

---

## 関連ファイル

- `/src/services/guestDataService.ts` - バックアップ・復元処理
- `/src/hooks/useGuestBackup.ts` - 自動バックアップ機能
- `/src/screens/AuthScreen.tsx` - ログイン・復元UI
- `/src/screens/ProfileScreen.tsx` - ログアウト・変換UI
- `/src/hooks/useAuth.ts` - 認証状態管理
- `/supabase/config.toml` - 匿名認証設定