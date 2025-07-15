export interface Food {
  id: string
  name: string
  category: string
  calories: number // per 100g
  protein: number
  carbs: number
  fat: number
  fiber?: number
  serving_size?: string
}

export interface Meal {
  id: string
  date: string
  type: 'breakfast' | 'lunch' | 'dinner' | 'snack'
  foods: {
    food: Food
    amount: number // in grams
  }[]
  notes?: string
}

export const FOOD_CATEGORIES = [
  { id: 'protein', name: 'タンパク質', icon: 'food-steak' },
  { id: 'carbs', name: '炭水化物', icon: 'rice' },
  { id: 'vegetables', name: '野菜', icon: 'leaf' },
  { id: 'fruits', name: 'フルーツ', icon: 'fruit-watermelon' },
  { id: 'dairy', name: '乳製品', icon: 'cheese' },
  { id: 'fats', name: '脂質', icon: 'oil' },
  { id: 'beverages', name: '飲み物', icon: 'cup' },
  { id: 'snacks', name: 'スナック', icon: 'cookie' },
]

export const COMMON_FOODS: Food[] = [
  // タンパク質
  { id: 'f1', name: '鶏むね肉（皮なし）', category: 'protein', calories: 108, protein: 22.3, carbs: 0, fat: 1.5, serving_size: '100g' },
  { id: 'f2', name: '鶏もも肉（皮なし）', category: 'protein', calories: 116, protein: 18.7, carbs: 0, fat: 3.9, serving_size: '100g' },
  { id: 'f3', name: '牛肉（赤身）', category: 'protein', calories: 143, protein: 21.5, carbs: 0.3, fat: 5.6, serving_size: '100g' },
  { id: 'f4', name: '豚肉（ヒレ）', category: 'protein', calories: 115, protein: 22.8, carbs: 0.2, fat: 1.9, serving_size: '100g' },
  { id: 'f5', name: 'サーモン', category: 'protein', calories: 208, protein: 20.4, carbs: 0, fat: 13.4, serving_size: '100g' },
  { id: 'f6', name: 'ツナ缶（水煮）', category: 'protein', calories: 71, protein: 16.5, carbs: 0.1, fat: 0.7, serving_size: '80g' },
  { id: 'f7', name: '卵', category: 'protein', calories: 151, protein: 12.6, carbs: 1.1, fat: 10.3, serving_size: '1個(50g)' },
  { id: 'f8', name: '納豆', category: 'protein', calories: 200, protein: 16.5, carbs: 12.1, fat: 10.0, fiber: 6.7, serving_size: '1パック(45g)' },
  { id: 'f9', name: '豆腐（木綿）', category: 'protein', calories: 72, protein: 6.6, carbs: 1.6, fat: 4.2, serving_size: '100g' },
  
  // 炭水化物
  { id: 'f10', name: '白米（炊飯済み）', category: 'carbs', calories: 168, protein: 2.5, carbs: 37.1, fat: 0.3, fiber: 0.3, serving_size: '茶碗1杯(150g)' },
  { id: 'f11', name: '玄米（炊飯済み）', category: 'carbs', calories: 165, protein: 2.8, carbs: 35.6, fat: 1.0, fiber: 1.4, serving_size: '茶碗1杯(150g)' },
  { id: 'f12', name: 'オートミール', category: 'carbs', calories: 380, protein: 13.7, carbs: 69.1, fat: 5.7, fiber: 9.4, serving_size: '30g' },
  { id: 'f13', name: '食パン', category: 'carbs', calories: 264, protein: 9.3, carbs: 46.7, fat: 4.4, fiber: 2.3, serving_size: '1枚(60g)' },
  { id: 'f14', name: 'パスタ（茹で）', category: 'carbs', calories: 149, protein: 5.2, carbs: 30.3, fat: 0.9, fiber: 1.5, serving_size: '100g' },
  { id: 'f15', name: 'さつまいも', category: 'carbs', calories: 132, protein: 1.2, carbs: 31.5, fat: 0.2, fiber: 2.3, serving_size: '100g' },
  { id: 'f16', name: 'じゃがいも', category: 'carbs', calories: 76, protein: 1.6, carbs: 17.6, fat: 0.1, fiber: 1.3, serving_size: '100g' },
  
  // 野菜
  { id: 'f17', name: 'ブロッコリー', category: 'vegetables', calories: 33, protein: 4.3, carbs: 5.2, fat: 0.5, fiber: 4.4, serving_size: '100g' },
  { id: 'f18', name: 'ほうれん草', category: 'vegetables', calories: 20, protein: 2.2, carbs: 3.1, fat: 0.4, fiber: 2.8, serving_size: '100g' },
  { id: 'f19', name: 'トマト', category: 'vegetables', calories: 19, protein: 0.7, carbs: 3.9, fat: 0.2, fiber: 1.0, serving_size: '1個(150g)' },
  { id: 'f20', name: 'きゅうり', category: 'vegetables', calories: 14, protein: 1.0, carbs: 3.0, fat: 0.1, fiber: 1.1, serving_size: '1本(100g)' },
  { id: 'f21', name: 'レタス', category: 'vegetables', calories: 12, protein: 0.6, carbs: 2.8, fat: 0.1, fiber: 1.1, serving_size: '100g' },
  { id: 'f22', name: 'にんじん', category: 'vegetables', calories: 37, protein: 0.7, carbs: 8.8, fat: 0.2, fiber: 2.7, serving_size: '1本(150g)' },
  { id: 'f23', name: 'キャベツ', category: 'vegetables', calories: 23, protein: 1.3, carbs: 5.2, fat: 0.2, fiber: 1.8, serving_size: '100g' },
  
  // フルーツ
  { id: 'f24', name: 'バナナ', category: 'fruits', calories: 86, protein: 1.1, carbs: 22.5, fat: 0.2, fiber: 1.1, serving_size: '1本(100g)' },
  { id: 'f25', name: 'りんご', category: 'fruits', calories: 54, protein: 0.2, carbs: 14.3, fat: 0.2, fiber: 1.5, serving_size: '1個(250g)' },
  { id: 'f26', name: 'いちご', category: 'fruits', calories: 34, protein: 0.9, carbs: 8.5, fat: 0.1, fiber: 1.4, serving_size: '100g' },
  { id: 'f27', name: 'オレンジ', category: 'fruits', calories: 46, protein: 0.9, carbs: 11.8, fat: 0.1, fiber: 2.0, serving_size: '1個(180g)' },
  { id: 'f28', name: 'ぶどう', category: 'fruits', calories: 59, protein: 0.4, carbs: 15.7, fat: 0.1, fiber: 0.5, serving_size: '100g' },
  { id: 'f29', name: 'キウイ', category: 'fruits', calories: 53, protein: 1.0, carbs: 13.5, fat: 0.5, fiber: 2.5, serving_size: '1個(100g)' },
  
  // 乳製品
  { id: 'f30', name: '牛乳', category: 'dairy', calories: 67, protein: 3.3, carbs: 4.8, fat: 3.8, serving_size: '200ml' },
  { id: 'f31', name: 'ヨーグルト（無糖）', category: 'dairy', calories: 62, protein: 3.6, carbs: 4.9, fat: 3.0, serving_size: '100g' },
  { id: 'f32', name: 'ギリシャヨーグルト', category: 'dairy', calories: 90, protein: 9.9, carbs: 3.6, fat: 4.4, serving_size: '100g' },
  { id: 'f33', name: 'チーズ', category: 'dairy', calories: 356, protein: 22.7, carbs: 1.3, fat: 28.5, serving_size: '20g' },
  { id: 'f34', name: 'カッテージチーズ', category: 'dairy', calories: 103, protein: 13.3, carbs: 2.7, fat: 4.5, serving_size: '100g' },
  
  // 脂質
  { id: 'f35', name: 'アーモンド', category: 'fats', calories: 598, protein: 20.0, carbs: 19.5, fat: 54.2, fiber: 11.8, serving_size: '20粒(20g)' },
  { id: 'f36', name: 'くるみ', category: 'fats', calories: 674, protein: 14.6, carbs: 11.7, fat: 68.8, fiber: 6.9, serving_size: '20g' },
  { id: 'f37', name: 'アボカド', category: 'fats', calories: 187, protein: 2.5, carbs: 8.5, fat: 18.7, fiber: 5.3, serving_size: '1/2個(100g)' },
  { id: 'f38', name: 'オリーブオイル', category: 'fats', calories: 921, protein: 0, carbs: 0, fat: 100, serving_size: '大さじ1(15ml)' },
  { id: 'f39', name: 'ピーナッツバター', category: 'fats', calories: 588, protein: 25.4, carbs: 20.5, fat: 49.9, fiber: 6.0, serving_size: '大さじ1(15g)' },
  
  // 飲み物
  { id: 'f40', name: 'プロテインシェイク', category: 'beverages', calories: 120, protein: 24, carbs: 3, fat: 1.5, serving_size: '1杯(30g)' },
  { id: 'f41', name: 'スポーツドリンク', category: 'beverages', calories: 27, protein: 0, carbs: 6.7, fat: 0, serving_size: '500ml' },
  { id: 'f42', name: '緑茶', category: 'beverages', calories: 0, protein: 0, carbs: 0, fat: 0, serving_size: '200ml' },
  { id: 'f43', name: 'コーヒー（ブラック）', category: 'beverages', calories: 4, protein: 0.2, carbs: 0.7, fat: 0, serving_size: '200ml' },
  { id: 'f44', name: 'オレンジジュース', category: 'beverages', calories: 43, protein: 0.7, carbs: 10.1, fat: 0.2, serving_size: '200ml' },
]