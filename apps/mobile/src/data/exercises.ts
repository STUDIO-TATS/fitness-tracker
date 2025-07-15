export interface Exercise {
  id: string
  name: string
  category: string
  muscle_group: string
  equipment?: string
  instructions?: string
}

export const EXERCISE_CATEGORIES = [
  { id: 'chest', name: '胸', icon: 'human-male' },
  { id: 'back', name: '背中', icon: 'human-male' },
  { id: 'shoulders', name: '肩', icon: 'human-male' },
  { id: 'arms', name: '腕', icon: 'arm-flex' },
  { id: 'legs', name: '脚', icon: 'human-male' },
  { id: 'core', name: '体幹', icon: 'human-male' },
  { id: 'cardio', name: '有酸素', icon: 'run' },
]

export const EXERCISES: Exercise[] = [
  // 胸
  { id: '1', name: 'ベンチプレス', category: 'chest', muscle_group: '大胸筋', equipment: 'バーベル' },
  { id: '2', name: 'ダンベルプレス', category: 'chest', muscle_group: '大胸筋', equipment: 'ダンベル' },
  { id: '3', name: 'インクラインプレス', category: 'chest', muscle_group: '大胸筋上部', equipment: 'バーベル' },
  { id: '4', name: 'ダンベルフライ', category: 'chest', muscle_group: '大胸筋', equipment: 'ダンベル' },
  { id: '5', name: '腕立て伏せ', category: 'chest', muscle_group: '大胸筋', equipment: '自重' },
  
  // 背中
  { id: '6', name: 'デッドリフト', category: 'back', muscle_group: '背中全体', equipment: 'バーベル' },
  { id: '7', name: 'ラットプルダウン', category: 'back', muscle_group: '広背筋', equipment: 'ケーブル' },
  { id: '8', name: 'ベントオーバーロウ', category: 'back', muscle_group: '背中中部', equipment: 'バーベル' },
  { id: '9', name: 'ワンハンドロウ', category: 'back', muscle_group: '広背筋', equipment: 'ダンベル' },
  { id: '10', name: '懸垂', category: 'back', muscle_group: '広背筋', equipment: '自重' },
  
  // 肩
  { id: '11', name: 'ショルダープレス', category: 'shoulders', muscle_group: '三角筋', equipment: 'バーベル' },
  { id: '12', name: 'サイドレイズ', category: 'shoulders', muscle_group: '三角筋中部', equipment: 'ダンベル' },
  { id: '13', name: 'フロントレイズ', category: 'shoulders', muscle_group: '三角筋前部', equipment: 'ダンベル' },
  { id: '14', name: 'リアレイズ', category: 'shoulders', muscle_group: '三角筋後部', equipment: 'ダンベル' },
  { id: '15', name: 'アップライトロウ', category: 'shoulders', muscle_group: '三角筋', equipment: 'バーベル' },
  
  // 腕
  { id: '16', name: 'バーベルカール', category: 'arms', muscle_group: '上腕二頭筋', equipment: 'バーベル' },
  { id: '17', name: 'ダンベルカール', category: 'arms', muscle_group: '上腕二頭筋', equipment: 'ダンベル' },
  { id: '18', name: 'ハンマーカール', category: 'arms', muscle_group: '上腕二頭筋', equipment: 'ダンベル' },
  { id: '19', name: 'トライセプスエクステンション', category: 'arms', muscle_group: '上腕三頭筋', equipment: 'ダンベル' },
  { id: '20', name: 'ダイヤモンドプッシュアップ', category: 'arms', muscle_group: '上腕三頭筋', equipment: '自重' },
  
  // 脚
  { id: '21', name: 'スクワット', category: 'legs', muscle_group: '大腿四頭筋', equipment: 'バーベル' },
  { id: '22', name: 'レッグプレス', category: 'legs', muscle_group: '大腿四頭筋', equipment: 'マシン' },
  { id: '23', name: 'ランジ', category: 'legs', muscle_group: '大腿四頭筋', equipment: 'ダンベル' },
  { id: '24', name: 'レッグカール', category: 'legs', muscle_group: 'ハムストリング', equipment: 'マシン' },
  { id: '25', name: 'カーフレイズ', category: 'legs', muscle_group: 'ふくらはぎ', equipment: 'ダンベル' },
  
  // 体幹
  { id: '26', name: 'プランク', category: 'core', muscle_group: '腹筋', equipment: '自重' },
  { id: '27', name: 'クランチ', category: 'core', muscle_group: '腹直筋', equipment: '自重' },
  { id: '28', name: 'レッグレイズ', category: 'core', muscle_group: '下腹部', equipment: '自重' },
  { id: '29', name: 'ロシアンツイスト', category: 'core', muscle_group: '腹斜筋', equipment: '自重' },
  { id: '30', name: 'バックエクステンション', category: 'core', muscle_group: '脊柱起立筋', equipment: '自重' },
  
  // 有酸素
  { id: '31', name: 'ランニング', category: 'cardio', muscle_group: '全身', equipment: 'トレッドミル' },
  { id: '32', name: 'サイクリング', category: 'cardio', muscle_group: '下半身', equipment: 'バイク' },
  { id: '33', name: 'ローイング', category: 'cardio', muscle_group: '全身', equipment: 'ローイングマシン' },
  { id: '34', name: 'バーピー', category: 'cardio', muscle_group: '全身', equipment: '自重' },
  { id: '35', name: '縄跳び', category: 'cardio', muscle_group: '全身', equipment: '縄跳び' },
]