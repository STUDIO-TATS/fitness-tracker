import { createClient } from '@supabase/supabase-js'
import { config } from 'dotenv'

// .env.localファイルを読み込む
config({ path: '.env.local' })

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!

// Service roleキーを使用してadmin操作を行う
const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
})

async function seedAuth() {
  try {
    console.log('🌱 マルチテナント対応シードプロセスを開始します...')
    
    // 0. 全てのテーブルを削除
    console.log('🧹 全てのテーブルを削除しています...')
    
    // 外部キー制約を考慮して順序よく削除
    const tables = [
      'point_transactions',
      'user_points',
      'point_rules',
      'point_systems',
      'activity_logs',
      'measurements',
      'user_memberships',
      'user_profiles',
      'activity_types',
      'facilities',
      'branches',
      'companies'
    ]
    
    for (const table of tables) {
      const { error } = await supabase.from(table).delete().gte('id', '')
      if (error) {
        console.log(`⚠️  ${table}テーブル削除時の警告:`, error.message)
      } else {
        console.log(`✅ ${table}テーブルを削除しました`)
      }
    }
    
    // 認証ユーザーを削除
    const { data: users } = await supabase.auth.admin.listUsers()
    if (users && users.users.length > 0) {
      console.log(`🗑️  ${users.users.length}人のユーザーを削除しています...`)
      for (const user of users.users) {
        const { error } = await supabase.auth.admin.deleteUser(user.id)
        if (error) {
          console.log(`⚠️  ユーザー削除エラー (${user.email}):`, error.message)
        }
      }
    }
    
    console.log('✅ 全データの削除が完了しました')

    // 1. 会社データを作成
    console.log('🏢 会社データを作成しています...')
    const companies = [
      {
        id: '550e8400-e29b-41d4-a716-446655440001',
        name: 'フィットネスチェーンA',
        code: 'FCA',
        description: '全国展開するフィットネスチェーン',
        logo_url: null
      },
      {
        id: '550e8400-e29b-41d4-a716-446655440002',
        name: 'ヨガスタジオB',
        code: 'YSB',
        description: 'ヨガ専門スタジオ（支店なし）',
        logo_url: null
      },
      {
        id: '550e8400-e29b-41d4-a716-446655440003',
        name: 'アクアフィットネスC',
        code: 'AFC',
        description: 'プール中心のフィットネス施設',
        logo_url: null
      }
    ]

    const { error: companyError } = await supabase
      .from('companies')
      .insert(companies)

    if (companyError) {
      console.error('❌ 会社作成エラー:', companyError)
      return
    }
    console.log('✅ 会社データが正常に作成されました')

    // 2. 支店データを作成（フィットネスチェーンAのみ）
    console.log('🏪 支店データを作成しています...')
    const branches = [
      {
        id: '660e8400-e29b-41d4-a716-446655440001',
        company_id: '550e8400-e29b-41d4-a716-446655440001',
        name: '渋谷支店',
        code: 'SBY',
        address: '東京都渋谷区渋谷1-1-1',
        phone: '03-1234-5678',
        email: 'shibuya@fca.com'
      },
      {
        id: '660e8400-e29b-41d4-a716-446655440002',
        company_id: '550e8400-e29b-41d4-a716-446655440001',
        name: '新宿支店',
        code: 'SJK',
        address: '東京都新宿区新宿1-1-1',
        phone: '03-2345-6789',
        email: 'shinjuku@fca.com'
      }
    ]

    const { error: branchError } = await supabase
      .from('branches')
      .insert(branches)

    if (branchError) {
      console.error('❌ 支店作成エラー:', branchError)
      return
    }
    console.log('✅ 支店データが正常に作成されました')

    // 3. 施設データを作成
    console.log('🏋️‍♂️ 施設データを作成しています...')
    const facilities = [
      // フィットネスチェーンA
      {
        id: '770e8400-e29b-41d4-a716-446655440001',
        company_id: '550e8400-e29b-41d4-a716-446655440001',
        branch_id: '660e8400-e29b-41d4-a716-446655440001',
        name: 'ジムフロア',
        code: 'GYM01',
        facility_type: 'gym',
        qr_code: 'QR_FCA_SBY_GYM01',
        address: '東京都渋谷区 ジムフロア',
        opening_hours: { mon_fri: '6:00-23:00', sat_sun: '8:00-21:00' },
        features: ['free_weights', 'machines', 'cardio']
      },
      {
        id: '770e8400-e29b-41d4-a716-446655440002',
        company_id: '550e8400-e29b-41d4-a716-446655440001',
        branch_id: '660e8400-e29b-41d4-a716-446655440001',
        name: 'プールエリア',
        code: 'POOL01',
        facility_type: 'pool',
        qr_code: 'QR_FCA_SBY_POOL01',
        address: '東京都渋谷区 プールエリア',
        opening_hours: { mon_fri: '9:00-22:00', sat_sun: '8:00-20:00' },
        features: ['25m_pool', 'jacuzzi', 'sauna']
      },
      {
        id: '770e8400-e29b-41d4-a716-446655440003',
        company_id: '550e8400-e29b-41d4-a716-446655440001',
        branch_id: '660e8400-e29b-41d4-a716-446655440002',
        name: 'ジムフロア',
        code: 'GYM01',
        facility_type: 'gym',
        qr_code: 'QR_FCA_SJK_GYM01',
        address: '東京都新宿区 ジムフロア',
        opening_hours: { mon_fri: '6:00-23:00', sat_sun: '8:00-21:00' },
        features: ['free_weights', 'machines', 'functional_training']
      },
      // ヨガスタジオB（支店なし）
      {
        id: '770e8400-e29b-41d4-a716-446655440004',
        company_id: '550e8400-e29b-41d4-a716-446655440002',
        branch_id: null,
        name: 'ヨガスタジオメイン',
        code: 'YOGA01',
        facility_type: 'yoga_studio',
        qr_code: 'QR_YSB_YOGA01',
        address: '東京都表参道 ヨガスタジオ',
        opening_hours: { mon_fri: '7:00-22:00', sat_sun: '8:00-20:00' },
        features: ['hot_yoga', 'meditation_room', 'props']
      },
      // アクアフィットネスC
      {
        id: '770e8400-e29b-41d4-a716-446655440005',
        company_id: '550e8400-e29b-41d4-a716-446655440003',
        branch_id: null,
        name: 'メインプール',
        code: 'POOL01',
        facility_type: 'pool',
        qr_code: 'QR_AFC_POOL01',
        address: '東京都品川区 メインプール',
        opening_hours: { mon_fri: '5:00-23:00', sat_sun: '6:00-22:00' },
        features: ['50m_pool', 'diving_pool', 'timing_system']
      },
      {
        id: '770e8400-e29b-41d4-a716-446655440006',
        company_id: '550e8400-e29b-41d4-a716-446655440003',
        branch_id: null,
        name: 'リラクゼーションプール',
        code: 'POOL02',
        facility_type: 'pool',
        qr_code: 'QR_AFC_POOL02',
        address: '東京都品川区 リラクゼーションプール',
        opening_hours: { mon_fri: '9:00-21:00', sat_sun: '8:00-20:00' },
        features: ['jacuzzi', 'water_massage', 'relaxation_area']
      }
    ]

    const { error: facilityError } = await supabase
      .from('facilities')
      .insert(facilities)

    if (facilityError) {
      console.error('❌ 施設作成エラー:', facilityError)
      return
    }
    console.log('✅ 施設データが正常に作成されました')

    // 4. アクティビティタイプを作成
    console.log('🎯 アクティビティタイプを作成しています...')
    const activityTypes = [
      // ジム（フィットネスチェーンA 渋谷）
      {
        id: '880e8400-e29b-41d4-a716-446655440001',
        facility_id: '770e8400-e29b-41d4-a716-446655440001',
        name: 'フリーウェイト',
        code: 'FREE_WEIGHT',
        category: 'training',
        description: 'ダンベル・バーベルを使ったトレーニング',
        duration_minutes: 60,
        calories_per_hour: 300,
        equipment_required: ['dumbbells', 'barbells', 'benches']
      },
      {
        id: '880e8400-e29b-41d4-a716-446655440002',
        facility_id: '770e8400-e29b-41d4-a716-446655440001',
        name: 'マシントレーニング',
        code: 'MACHINE',
        category: 'training',
        description: 'マシンを使った筋力トレーニング',
        duration_minutes: 45,
        calories_per_hour: 250,
        equipment_required: ['weight_machines']
      },
      {
        id: '880e8400-e29b-41d4-a716-446655440003',
        facility_id: '770e8400-e29b-41d4-a716-446655440001',
        name: 'カーディオ',
        code: 'CARDIO',
        category: 'training',
        description: 'ランニングマシン・エアロバイク',
        duration_minutes: 30,
        calories_per_hour: 400,
        equipment_required: ['treadmills', 'bikes']
      },
      // プール（フィットネスチェーンA 渋谷）
      {
        id: '880e8400-e29b-41d4-a716-446655440004',
        facility_id: '770e8400-e29b-41d4-a716-446655440002',
        name: '水泳',
        code: 'SWIMMING',
        category: 'swimming',
        description: '自由遊泳・ラップスイム',
        duration_minutes: 30,
        calories_per_hour: 500,
        equipment_required: ['goggles', 'swim_cap']
      },
      {
        id: '880e8400-e29b-41d4-a716-446655440005',
        facility_id: '770e8400-e29b-41d4-a716-446655440002',
        name: 'アクアビクス',
        code: 'AQUA_AEROBICS',
        category: 'swimming',
        description: '水中エアロビクス',
        duration_minutes: 45,
        calories_per_hour: 350,
        equipment_required: ['pool_noodles', 'water_weights']
      },
      // ヨガスタジオB
      {
        id: '880e8400-e29b-41d4-a716-446655440008',
        facility_id: '770e8400-e29b-41d4-a716-446655440004',
        name: 'ハタヨガ',
        code: 'HATHA_YOGA',
        category: 'yoga',
        description: '基本的なヨガのポーズ',
        duration_minutes: 60,
        calories_per_hour: 180,
        equipment_required: ['yoga_mat', 'blocks', 'straps']
      },
      {
        id: '880e8400-e29b-41d4-a716-446655440009',
        facility_id: '770e8400-e29b-41d4-a716-446655440004',
        name: 'ヴィンヤサヨガ',
        code: 'VINYASA_YOGA',
        category: 'yoga',
        description: '流れるようなヨガ',
        duration_minutes: 75,
        calories_per_hour: 250,
        equipment_required: ['yoga_mat']
      },
      {
        id: '880e8400-e29b-41d4-a716-446655440010',
        facility_id: '770e8400-e29b-41d4-a716-446655440004',
        name: 'メディテーション',
        code: 'MEDITATION',
        category: 'yoga',
        description: '瞑想セッション',
        duration_minutes: 30,
        calories_per_hour: 50,
        equipment_required: ['meditation_cushion']
      },
      // アクアフィットネスC
      {
        id: '880e8400-e29b-41d4-a716-446655440011',
        facility_id: '770e8400-e29b-41d4-a716-446655440005',
        name: '競泳',
        code: 'COMPETITIVE_SWIM',
        category: 'swimming',
        description: '本格的な競泳トレーニング',
        duration_minutes: 60,
        calories_per_hour: 600,
        equipment_required: ['racing_goggles', 'fins', 'kickboard']
      },
      {
        id: '880e8400-e29b-41d4-a716-446655440012',
        facility_id: '770e8400-e29b-41d4-a716-446655440005',
        name: 'ウォーターウォーキング',
        code: 'WATER_WALK',
        category: 'swimming',
        description: '水中ウォーキング',
        duration_minutes: 30,
        calories_per_hour: 200,
        equipment_required: ['water_shoes']
      }
    ]

    const { error: activityTypeError } = await supabase
      .from('activity_types')
      .insert(activityTypes)

    if (activityTypeError) {
      console.error('❌ アクティビティタイプ作成エラー:', activityTypeError)
      return
    }
    console.log('✅ アクティビティタイプが正常に作成されました')

    // 5. ポイントシステムを作成
    console.log('🪙 ポイントシステムを作成しています...')
    const pointSystems = [
      {
        id: '990e8400-e29b-41d4-a716-446655440001',
        company_id: '550e8400-e29b-41d4-a716-446655440001',
        name: 'FCポイント',
        point_unit: 'FCポイント',
        conversion_rate: 1.0,
        expiration_months: 12,
        rules: { base_points_per_visit: 10, bonus_weekday: 5 }
      },
      {
        id: '990e8400-e29b-41d4-a716-446655440002',
        company_id: '550e8400-e29b-41d4-a716-446655440002',
        name: 'ヨガポイント',
        point_unit: 'YPポイント',
        conversion_rate: 1.0,
        expiration_months: 6,
        rules: { base_points_per_class: 20, monthly_bonus: 50 }
      },
      {
        id: '990e8400-e29b-41d4-a716-446655440003',
        company_id: '550e8400-e29b-41d4-a716-446655440003',
        name: 'アクアコイン',
        point_unit: 'コイン',
        conversion_rate: 2.0,
        expiration_months: 24,
        rules: { base_points_per_30min: 15, distance_bonus: true }
      }
    ]

    const { error: pointSystemError } = await supabase
      .from('point_systems')
      .insert(pointSystems)

    if (pointSystemError) {
      console.error('❌ ポイントシステム作成エラー:', pointSystemError)
      return
    }
    console.log('✅ ポイントシステムが正常に作成されました')

    // 6. ポイントルールを作成
    console.log('📋 ポイントルールを作成しています...')
    const pointRules = [
      // フィットネスチェーンA
      {
        id: 'aa0e8400-e29b-41d4-a716-446655440001',
        point_system_id: '990e8400-e29b-41d4-a716-446655440001',
        activity_category: 'training',
        points_per_session: 10,
        points_per_minute: 0.5,
        bonus_conditions: { weekend_bonus: 5 }
      },
      {
        id: 'aa0e8400-e29b-41d4-a716-446655440002',
        point_system_id: '990e8400-e29b-41d4-a716-446655440001',
        activity_category: 'swimming',
        points_per_session: 15,
        points_per_minute: 0.8,
        bonus_conditions: { distance_bonus: 2 }
      },
      // ヨガスタジオB
      {
        id: 'aa0e8400-e29b-41d4-a716-446655440003',
        point_system_id: '990e8400-e29b-41d4-a716-446655440002',
        activity_category: 'yoga',
        points_per_session: 20,
        points_per_minute: 0.3,
        bonus_conditions: { morning_class_bonus: 10 }
      },
      // アクアフィットネスC
      {
        id: 'aa0e8400-e29b-41d4-a716-446655440004',
        point_system_id: '990e8400-e29b-41d4-a716-446655440003',
        activity_category: 'swimming',
        points_per_session: 25,
        points_per_minute: 1.0,
        bonus_conditions: { lap_bonus: 1 }
      }
    ]

    const { error: pointRuleError } = await supabase
      .from('point_rules')
      .insert(pointRules)

    if (pointRuleError) {
      console.error('❌ ポイントルール作成エラー:', pointRuleError)
      return
    }
    console.log('✅ ポイントルールが正常に作成されました')

    // 7. デモユーザーを作成
    console.log('👤 デモユーザーを作成しています...')
    const { data: authData, error: authError } = await supabase.auth.admin.createUser({
      email: 'demo@fitness-tracker.com',
      password: 'demo123456',
      email_confirm: true,
      user_metadata: {
        name: 'デモユーザー'
      }
    })

    if (authError) {
      console.error('❌ 認証ユーザー作成エラー:', authError)
      return
    }

    const userId = authData.user.id
    console.log('✅ デモユーザーが作成されました:', userId)

    // 会社側ユーザー（管理者・スタッフ）を作成
    console.log('👔 会社側ユーザーを作成しています...')
    
    // フィットネスチェーンA 管理者
    const { data: companyAdminData, error: companyAdminError } = await supabase.auth.admin.createUser({
      email: 'admin@fitness-chain-a.com',
      password: 'admin123456',
      email_confirm: true,
      user_metadata: {
        name: 'フィットネスチェーンA 管理者'
      }
    })

    if (companyAdminError) {
      console.error('❌ 会社管理者作成エラー:', companyAdminError)
      return
    }

    const companyAdminId = companyAdminData.user.id
    
    // ヨガスタジオB マネージャー
    const { data: yogaManagerData, error: yogaManagerError } = await supabase.auth.admin.createUser({
      email: 'manager@yoga-studio-b.com',
      password: 'manager123456',
      email_confirm: true,
      user_metadata: {
        name: 'ヨガスタジオB マネージャー'
      }
    })

    if (yogaManagerError) {
      console.error('❌ ヨガマネージャー作成エラー:', yogaManagerError)
      return
    }

    const yogaManagerId = yogaManagerData.user.id
    
    // アクアフィットネスC スタッフ
    const { data: aquaStaffData, error: aquaStaffError } = await supabase.auth.admin.createUser({
      email: 'staff@aqua-fitness-c.com',
      password: 'staff123456',
      email_confirm: true,
      user_metadata: {
        name: 'アクアフィットネスC スタッフ'
      }
    })

    if (aquaStaffError) {
      console.error('❌ アクアスタッフ作成エラー:', aquaStaffError)
      return
    }

    const aquaStaffId = aquaStaffData.user.id
    console.log('✅ 会社側ユーザーが作成されました')

    // 8. ユーザープロファイルを作成
    console.log('📝 ユーザープロファイルを作成しています...')
    const userProfiles = [
      {
        user_id: userId,
        display_name: 'デモユーザー',
        date_of_birth: '1990-05-15',
        gender: 'male',
        phone: '090-1234-5678',
        emergency_contact: {
          name: '緊急連絡先',
          phone: '090-9876-5432',
          relationship: 'family'
        },
        preferences: {
          units: 'metric',
          privacy: 'friends',
          notifications: true
        }
      },
      {
        user_id: companyAdminId,
        display_name: 'フィットネスチェーンA 管理者',
        date_of_birth: '1985-03-20',
        gender: 'female',
        phone: '090-1111-2222',
        preferences: {
          units: 'metric',
          privacy: 'private',
          notifications: true
        }
      },
      {
        user_id: yogaManagerId,
        display_name: 'ヨガスタジオB マネージャー',
        date_of_birth: '1988-07-10',
        gender: 'female',
        phone: '090-3333-4444',
        preferences: {
          units: 'metric',
          privacy: 'private', 
          notifications: true
        }
      },
      {
        user_id: aquaStaffId,
        display_name: 'アクアフィットネスC スタッフ',
        date_of_birth: '1992-11-25',
        gender: 'male',
        phone: '090-5555-6666',
        preferences: {
          units: 'metric',
          privacy: 'private',
          notifications: true
        }
      }
    ]

    const { error: profileError } = await supabase
      .from('user_profiles')
      .insert(userProfiles)

    if (profileError) {
      console.error('❌ プロフィール作成エラー:', profileError)
      return
    }
    console.log('✅ ユーザープロファイルが正常に作成されました')

    // 8.5. 会社ユーザー（従業員・管理者）テーブルに追加
    console.log('🏢 会社ユーザー情報を作成しています...')
    const companyUsers = [
      {
        user_id: companyAdminId,
        company_id: '550e8400-e29b-41d4-a716-446655440001',
        role: 'admin',
        permissions: {
          view_analytics: true,
          manage_facilities: true,
          manage_staff: true,
          manage_members: true,
          export_data: true
        }
      },
      {
        user_id: yogaManagerId,
        company_id: '550e8400-e29b-41d4-a716-446655440002',
        role: 'manager',
        permissions: {
          view_analytics: true,
          manage_facilities: false,
          manage_staff: false,
          manage_members: true,
          export_data: true
        }
      },
      {
        user_id: aquaStaffId,
        company_id: '550e8400-e29b-41d4-a716-446655440003',
        role: 'staff',
        permissions: {
          view_analytics: true,
          manage_facilities: false,
          manage_staff: false,
          manage_members: false,
          export_data: false
        }
      }
    ]

    const { error: companyUserError } = await supabase
      .from('company_users')
      .insert(companyUsers)

    if (companyUserError) {
      console.error('❌ 会社ユーザー作成エラー:', companyUserError)
      return
    }
    console.log('✅ 会社ユーザー情報が正常に作成されました')

    // 9. ユーザーメンバーシップを作成
    console.log('🎫 メンバーシップを作成しています...')
    const memberships = [
      {
        user_id: userId,
        company_id: '550e8400-e29b-41d4-a716-446655440001',
        membership_number: 'FCA-2024-001',
        membership_type: 'premium',
        start_date: '2024-01-01',
        end_date: '2024-12-31'
      },
      {
        user_id: userId,
        company_id: '550e8400-e29b-41d4-a716-446655440002',
        membership_number: 'YSB-2024-050',
        membership_type: 'regular',
        start_date: '2024-01-15',
        end_date: '2024-07-15'
      }
    ]

    const { error: membershipError } = await supabase
      .from('user_memberships')
      .insert(memberships)

    if (membershipError) {
      console.error('❌ メンバーシップ作成エラー:', membershipError)
      return
    }
    console.log('✅ メンバーシップが正常に作成されました')

    // 10. ユーザーポイント残高を作成
    console.log('💰 ポイント残高を作成しています...')
    const userPoints = [
      {
        user_id: userId,
        company_id: '550e8400-e29b-41d4-a716-446655440001',
        current_points: 450.0,
        total_earned: 600.0,
        total_used: 150.0
      },
      {
        user_id: userId,
        company_id: '550e8400-e29b-41d4-a716-446655440002',
        current_points: 280.0,
        total_earned: 320.0,
        total_used: 40.0
      }
    ]

    const { error: userPointsError } = await supabase
      .from('user_points')
      .insert(userPoints)

    if (userPointsError) {
      console.error('❌ ポイント残高作成エラー:', userPointsError)
      return
    }
    console.log('✅ ポイント残高が正常に作成されました')

    // 11. アクティビティログを作成
    console.log('📊 アクティビティログを作成しています...')
    const now = new Date()
    const activityLogs = [
      {
        user_id: userId,
        company_id: '550e8400-e29b-41d4-a716-446655440001',
        facility_id: '770e8400-e29b-41d4-a716-446655440001',
        activity_type_id: '880e8400-e29b-41d4-a716-446655440001',
        check_in_time: new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000).toISOString(),
        check_out_time: new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000 + 60 * 60 * 1000).toISOString(),
        duration_minutes: 60,
        calories_burned: 300,
        notes: '胸と肩のトレーニング'
      },
      {
        user_id: userId,
        company_id: '550e8400-e29b-41d4-a716-446655440001',
        facility_id: '770e8400-e29b-41d4-a716-446655440002',
        activity_type_id: '880e8400-e29b-41d4-a716-446655440004',
        check_in_time: new Date(now.getTime() - 5 * 24 * 60 * 60 * 1000).toISOString(),
        check_out_time: new Date(now.getTime() - 5 * 24 * 60 * 60 * 1000 + 45 * 60 * 1000).toISOString(),
        duration_minutes: 45,
        calories_burned: 375,
        distance_km: 1.2,
        notes: 'ラップスイム 1200m'
      },
      {
        user_id: userId,
        company_id: '550e8400-e29b-41d4-a716-446655440002',
        facility_id: '770e8400-e29b-41d4-a716-446655440004',
        activity_type_id: '880e8400-e29b-41d4-a716-446655440009',
        check_in_time: new Date(now.getTime() - 3 * 24 * 60 * 60 * 1000).toISOString(),
        check_out_time: new Date(now.getTime() - 3 * 24 * 60 * 60 * 1000 + 75 * 60 * 1000).toISOString(),
        duration_minutes: 75,
        calories_burned: 310,
        notes: '朝のヴィンヤサヨガクラス'
      }
    ]

    const { error: activityLogError } = await supabase
      .from('activity_logs')
      .insert(activityLogs)

    if (activityLogError) {
      console.error('❌ アクティビティログ作成エラー:', activityLogError)
      return
    }
    console.log('✅ アクティビティログが正常に作成されました')

    // 12. 体測定データを作成
    console.log('📏 体測定データを作成しています...')
    const measurements = [
      {
        user_id: userId,
        company_id: '550e8400-e29b-41d4-a716-446655440001',
        facility_id: '770e8400-e29b-41d4-a716-446655440001',
        measurement_date: new Date(now.getTime() - 28 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        weight: 78.5,
        body_fat_percentage: 18.5,
        muscle_mass: 45.2,
        bmi: 24.1,
        measurements: { chest: 98.0, waist: 82.0, biceps: 34.5 },
        notes: '4週間前の測定'
      },
      {
        user_id: userId,
        company_id: '550e8400-e29b-41d4-a716-446655440001',
        facility_id: '770e8400-e29b-41d4-a716-446655440001',
        measurement_date: new Date(now.getTime() - 14 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        weight: 77.8,
        body_fat_percentage: 17.8,
        muscle_mass: 45.8,
        bmi: 23.9,
        measurements: { chest: 98.5, waist: 81.0, biceps: 35.0 },
        notes: '2週間前、筋肉量増加'
      },
      {
        user_id: userId,
        company_id: '550e8400-e29b-41d4-a716-446655440001',
        facility_id: '770e8400-e29b-41d4-a716-446655440001',
        measurement_date: new Date().toISOString().split('T')[0],
        weight: 77.0,
        body_fat_percentage: 17.0,
        muscle_mass: 46.5,
        bmi: 23.7,
        measurements: { chest: 99.5, waist: 79.5, biceps: 35.8 },
        notes: '本日の測定、目標に近づいている'
      }
    ]

    const { error: measurementError } = await supabase
      .from('measurements')
      .insert(measurements)

    if (measurementError) {
      console.error('❌ 体測定データ作成エラー:', measurementError)
      return
    }
    console.log('✅ 体測定データが正常に作成されました')

    console.log('🎉 マルチテナント対応シードが正常に完了しました！')
    console.log('')
    console.log('👤 エンドユーザー:')
    console.log(`- デモユーザーID: ${userId}`)
    console.log('- メール: demo@fitness-tracker.com')
    console.log('- パスワード: demo123456')
    console.log('')
    console.log('👔 会社側ユーザー:')
    console.log('- フィットネスチェーンA 管理者')
    console.log('  メール: admin@fitness-chain-a.com')
    console.log('  パスワード: admin123456')
    console.log('  権限: 全権限 (admin)')
    console.log('')
    console.log('- ヨガスタジオB マネージャー')
    console.log('  メール: manager@yoga-studio-b.com')
    console.log('  パスワード: manager123456')
    console.log('  権限: 分析・会員管理・データエクスポート (manager)')
    console.log('')
    console.log('- アクアフィットネスC スタッフ')
    console.log('  メール: staff@aqua-fitness-c.com')
    console.log('  パスワード: staff123456')
    console.log('  権限: 分析表示のみ (staff)')
    console.log('')
    console.log('🏢 作成された会社:')
    console.log('- フィットネスチェーンA (支店: 渋谷、新宿)')
    console.log('- ヨガスタジオB (支店なし)')
    console.log('- アクアフィットネスC (支店なし)')
    console.log('')
    console.log('🏋️‍♂️ QRコード例:')
    console.log('- QR_FCA_SBY_GYM01 (フィットネスチェーンA 渋谷支店 ジム)')
    console.log('- QR_YSB_YOGA01 (ヨガスタジオB)')
    console.log('- QR_AFC_POOL01 (アクアフィットネスC メインプール)')
    console.log('')
    console.log('📊 ダッシュボード機能:')
    console.log('- company_activity_summary ビュー: 会社別アクティビティ集計')
    console.log('- facility_usage_summary ビュー: 施設別利用状況')
    console.log('- point_system_summary ビュー: ポイントシステム利用状況')
    console.log('- get_company_stats() 関数: 会社統計')
    console.log('- get_facility_ranking() 関数: 施設利用ランキング')
    
  } catch (error) {
    console.error('💥 シードエラー:', error)
  }
}

seedAuth()