#!/usr/bin/env node

import { createClient } from '@supabase/supabase-js';

// Supabase設定
const SUPABASE_URL = 'http://localhost:54321';
const SERVICE_ROLE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZS1kZW1vIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImV4cCI6MTk4MzgxMjk5Nn0.EGIM96RAZx35lJzdJsyH-qQwv8Hdp7fsn3W0YpN81IU';

// Service Roleでクライアントを作成（RLSをバイパス）
const supabase = createClient(SUPABASE_URL, SERVICE_ROLE_KEY, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
});

// ユーザー情報の型定義
interface UserData {
  email: string;
  password: string;
  metadata: {
    name: string;
  };
  profile: {
    display_name: string;
    avatar_url: string;
    date_of_birth: string;
    gender: string;
    phone: string;
    emergency_contact: {
      name: string;
      phone: string;
      relationship: string;
    };
    preferences: {
      language: string;
      notifications: {
        email: boolean;
        push: boolean;
      };
      preferred_time?: string;
    };
  };
}

// ユーザー情報
const users: UserData[] = [
  {
    email: 'admin@fittracker.com',
    password: 'Admin123!',
    metadata: { name: 'システム管理者' },
    profile: {
      display_name: 'システム管理者',
      avatar_url: 'https://example.com/avatars/admin.jpg',
      date_of_birth: '1980-01-01',
      gender: 'other',
      phone: '090-1234-5678',
      emergency_contact: { name: '緊急連絡先', phone: '090-8765-4321', relationship: '配偶者' },
      preferences: { language: 'ja', notifications: { email: true, push: true } }
    }
  },
  {
    email: 'staff@fittracker.com',
    password: 'Staff123!',
    metadata: { name: 'スタッフ太郎' },
    profile: {
      display_name: 'スタッフ太郎',
      avatar_url: 'https://example.com/avatars/staff1.jpg',
      date_of_birth: '1990-05-15',
      gender: 'male',
      phone: '090-2345-6789',
      emergency_contact: { name: 'スタッフ母', phone: '090-3456-7890', relationship: '母' },
      preferences: { language: 'ja', notifications: { email: true, push: false } }
    }
  },
  {
    email: 'user1@example.com',
    password: 'User123!',
    metadata: { name: '田中太郎' },
    profile: {
      display_name: '田中太郎',
      avatar_url: 'https://example.com/avatars/member1.jpg',
      date_of_birth: '1995-03-20',
      gender: 'male',
      phone: '090-3456-7890',
      emergency_contact: { name: '田中母', phone: '090-4567-8901', relationship: '母' },
      preferences: { language: 'ja', notifications: { email: true, push: true }, preferred_time: 'morning' }
    }
  },
  {
    email: 'user2@example.com',
    password: 'User123!',
    metadata: { name: '鈴木花子' },
    profile: {
      display_name: '鈴木花子',
      avatar_url: 'https://example.com/avatars/member2.jpg',
      date_of_birth: '1988-07-10',
      gender: 'female',
      phone: '090-4567-8901',
      emergency_contact: { name: '鈴木夫', phone: '090-5678-9012', relationship: '夫' },
      preferences: { language: 'ja', notifications: { email: false, push: true }, preferred_time: 'evening' }
    }
  },
  {
    email: 'user3@example.com',
    password: 'User123!',
    metadata: { name: '佐藤次郎' },
    profile: {
      display_name: '佐藤次郎',
      avatar_url: 'https://example.com/avatars/member3.jpg',
      date_of_birth: '1992-11-25',
      gender: 'male',
      phone: '090-5678-9012',
      emergency_contact: { name: '佐藤父', phone: '090-6789-0123', relationship: '父' },
      preferences: { language: 'ja', notifications: { email: true, push: true }, preferred_time: 'anytime' }
    }
  }
];

async function seedDatabase(): Promise<void> {
  try {
    console.log('🌱 Starting database seeding...\n');

    // 1. 既存データのクリーンアップ
    console.log('🧹 Cleaning up existing data...');
    
    // まず既存のユーザーを取得して削除
    const { data: existingUsers } = await supabase.auth.admin.listUsers();
    if (existingUsers && existingUsers.users.length > 0) {
      console.log(`Deleting ${existingUsers.users.length} existing users...`);
      for (const user of existingUsers.users) {
        await supabase.auth.admin.deleteUser(user.id);
      }
    }

    // 次に関連テーブルのデータを削除
    const tables = [
      'point_transactions',
      'activity_logs',
      'measurements',
      'user_points',
      'point_rules',
      'point_systems',
      'user_memberships',
      'company_users',
      'user_profiles',
      'activity_types',
      'facilities',
      'branches',
      'companies'
    ];

    for (const table of tables) {
      const { error } = await supabase.from(table).delete().neq('id', '00000000-0000-0000-0000-000000000000');
      if (error && error.code !== 'PGRST116') {
        console.error(`Error cleaning ${table}:`, error);
      }
    }

    // 2. 会社データの作成
    console.log('\n🏢 Creating companies...');
    const { data: companies, error: companiesError } = await supabase
      .from('companies')
      .insert([
        {
          name: 'フィットネスワールド株式会社',
          code: 'FW001',
          logo_url: 'https://example.com/logos/fw.png',
          description: '全国展開の総合フィットネスチェーン',
          is_active: true
        },
        {
          name: 'ヘルシーライフ株式会社',
          code: 'HL001',
          logo_url: 'https://example.com/logos/hl.png',
          description: '健康と美容に特化したフィットネスクラブ',
          is_active: true
        }
      ])
      .select();

    if (companiesError) throw companiesError;
    if (!companies) throw new Error('Failed to create companies');
    console.log(`✅ Created ${companies.length} companies`);

    const company1 = companies[0];
    const company2 = companies[1];

    // 3. 支店データの作成
    console.log('\n🏢 Creating branches...');
    const { data: branches, error: branchesError } = await supabase
      .from('branches')
      .insert([
        {
          company_id: company1.id,
          name: '東京本店',
          code: 'FW-TOKYO-001',
          address: '東京都渋谷区渋谷1-1-1',
          phone: '03-1234-5678',
          email: 'tokyo@fitnessworld.jp',
          is_active: true
        },
        {
          company_id: company1.id,
          name: '大阪支店',
          code: 'FW-OSAKA-001',
          address: '大阪府大阪市北区梅田2-2-2',
          phone: '06-1234-5678',
          email: 'osaka@fitnessworld.jp',
          is_active: true
        }
      ])
      .select();

    if (branchesError) throw branchesError;
    if (!branches) throw new Error('Failed to create branches');
    console.log(`✅ Created ${branches.length} branches`);

    const branch1 = branches[0];
    const branch2 = branches[1];

    // 4. 施設データの作成
    console.log('\n🏋️ Creating facilities...');
    const { data: facilities, error: facilitiesError } = await supabase
      .from('facilities')
      .insert([
        {
          company_id: company1.id,
          branch_id: branch1.id,
          name: 'フィットネスワールド渋谷店',
          code: 'FW-SHIBUYA-001',
          facility_type: 'gym',
          address: '東京都渋谷区渋谷1-1-1 FWビル1-3F',
          phone: '03-1234-5678',
          email: 'shibuya@fitnessworld.jp',
          qr_code: 'QR-FW-SHIBUYA-001',
          opening_hours: {
            mon: '6:00-23:00', tue: '6:00-23:00', wed: '6:00-23:00',
            thu: '6:00-23:00', fri: '6:00-23:00', sat: '8:00-21:00', sun: '8:00-21:00'
          },
          features: { pool: true, sauna: true, parking: true, personal_training: true },
          is_active: true
        },
        {
          company_id: company1.id,
          branch_id: branch2.id,
          name: 'フィットネスワールド梅田店',
          code: 'FW-UMEDA-001',
          facility_type: 'gym',
          address: '大阪府大阪市北区梅田2-2-2 FWタワー5-7F',
          phone: '06-1234-5678',
          email: 'umeda@fitnessworld.jp',
          qr_code: 'QR-FW-UMEDA-001',
          opening_hours: {
            mon: '6:00-23:00', tue: '6:00-23:00', wed: '6:00-23:00',
            thu: '6:00-23:00', fri: '6:00-23:00', sat: '8:00-21:00', sun: '8:00-21:00'
          },
          features: { pool: false, sauna: true, parking: false, personal_training: true },
          is_active: true
        },
        {
          company_id: company2.id,
          branch_id: null,
          name: 'ヘルシーライフ青山スタジオ',
          code: 'HL-AOYAMA-001',
          facility_type: 'yoga_studio',
          address: '東京都港区南青山3-3-3',
          phone: '03-9876-5432',
          email: 'aoyama@healthylife.jp',
          qr_code: 'QR-HL-AOYAMA-001',
          opening_hours: {
            mon: '7:00-22:00', tue: '7:00-22:00', wed: '7:00-22:00',
            thu: '7:00-22:00', fri: '7:00-22:00', sat: '8:00-20:00', sun: '8:00-20:00'
          },
          features: { yoga_room: 3, shower_room: true, locker: true, cafe: true },
          is_active: true
        },
        {
          company_id: company2.id,
          branch_id: null,
          name: 'ヘルシーライフ横浜プール',
          code: 'HL-YOKOHAMA-001',
          facility_type: 'pool',
          address: '神奈川県横浜市西区みなとみらい4-4-4',
          phone: '045-1234-5678',
          email: 'yokohama@healthylife.jp',
          qr_code: 'QR-HL-YOKOHAMA-001',
          opening_hours: {
            mon: '9:00-21:00', tue: '9:00-21:00', wed: '9:00-21:00',
            thu: '9:00-21:00', fri: '9:00-21:00', sat: '9:00-20:00', sun: '9:00-20:00'
          },
          features: { pool_lanes: 8, kids_pool: true, jacuzzi: true, sauna: true },
          is_active: true
        }
      ])
      .select();

    if (facilitiesError) throw facilitiesError;
    if (!facilities) throw new Error('Failed to create facilities');
    console.log(`✅ Created ${facilities.length} facilities`);

    // 5. アクティビティタイプの作成
    console.log('\n🏃 Creating activity types...');
    const activityTypes = [];
    
    // ジム施設のアクティビティ
    for (const facility of facilities.filter(f => f.facility_type === 'gym')) {
      activityTypes.push(
        {
          facility_id: facility.id,
          name: '有酸素運動',
          code: 'CARDIO-001',
          category: 'training',
          description: 'ランニングマシン、エアロバイクなどを使った有酸素運動',
          duration_minutes: 30,
          calories_per_hour: 400,
          equipment_required: { treadmill: true, bike: true, elliptical: true },
          is_active: true
        },
        {
          facility_id: facility.id,
          name: 'ウェイトトレーニング',
          code: 'WEIGHT-001',
          category: 'training',
          description: 'フリーウェイトやマシンを使った筋力トレーニング',
          duration_minutes: 45,
          calories_per_hour: 300,
          equipment_required: { dumbbells: true, barbell: true, machines: true },
          is_active: true
        },
        {
          facility_id: facility.id,
          name: 'パーソナルトレーニング',
          code: 'PT-001',
          category: 'training',
          description: 'トレーナーとのマンツーマントレーニング',
          duration_minutes: 60,
          calories_per_hour: 500,
          equipment_required: { trainer: true },
          is_active: true
        }
      );
    }

    // ヨガスタジオのアクティビティ
    for (const facility of facilities.filter(f => f.facility_type === 'yoga_studio')) {
      activityTypes.push(
        {
          facility_id: facility.id,
          name: 'ハタヨガ',
          code: 'YOGA-001',
          category: 'yoga',
          description: '基本的なヨガポーズを中心とした初心者向けクラス',
          duration_minutes: 60,
          calories_per_hour: 200,
          equipment_required: { yoga_mat: true },
          is_active: true
        },
        {
          facility_id: facility.id,
          name: 'パワーヨガ',
          code: 'YOGA-002',
          category: 'yoga',
          description: '運動量の多いダイナミックなヨガクラス',
          duration_minutes: 75,
          calories_per_hour: 350,
          equipment_required: { yoga_mat: true, blocks: true },
          is_active: true
        },
        {
          facility_id: facility.id,
          name: 'ホットヨガ',
          code: 'YOGA-003',
          category: 'yoga',
          description: '温かい環境で行うデトックス効果の高いヨガ',
          duration_minutes: 60,
          calories_per_hour: 400,
          equipment_required: { yoga_mat: true, towel: true },
          is_active: true
        }
      );
    }

    // プール施設のアクティビティ
    for (const facility of facilities.filter(f => f.facility_type === 'pool')) {
      activityTypes.push(
        {
          facility_id: facility.id,
          name: '自由遊泳',
          code: 'SWIM-001',
          category: 'swimming',
          description: 'プールでの自由な水泳',
          duration_minutes: null,
          calories_per_hour: 500,
          equipment_required: { swimsuit: true },
          is_active: true
        },
        {
          facility_id: facility.id,
          name: 'アクアビクス',
          code: 'SWIM-002',
          category: 'swimming',
          description: '水中で行うエアロビクスクラス',
          duration_minutes: 45,
          calories_per_hour: 400,
          equipment_required: { swimsuit: true },
          is_active: true
        },
        {
          facility_id: facility.id,
          name: '水泳教室',
          code: 'SWIM-003',
          category: 'swimming',
          description: 'インストラクターによる水泳指導',
          duration_minutes: 60,
          calories_per_hour: 450,
          equipment_required: { swimsuit: true, cap: true },
          is_active: true
        }
      );
    }

    const { error: activityTypesError } = await supabase
      .from('activity_types')
      .insert(activityTypes);

    if (activityTypesError) throw activityTypesError;
    console.log(`✅ Created ${activityTypes.length} activity types`);

    // 6. ポイントシステムの作成
    console.log('\n💰 Creating point systems...');
    const { data: pointSystems, error: pointSystemsError } = await supabase
      .from('point_systems')
      .insert([
        {
          company_id: company1.id,
          name: 'FWポイントプログラム',
          point_unit: 'FWポイント',
          conversion_rate: 1.0,
          expiration_months: 12,
          rules: { min_points_to_use: 100, point_usage_unit: 100 },
          is_active: true
        },
        {
          company_id: company2.id,
          name: 'ヘルシーマイル',
          point_unit: 'マイル',
          conversion_rate: 2.0,
          expiration_months: 24,
          rules: { min_points_to_use: 500, point_usage_unit: 100 },
          is_active: true
        }
      ])
      .select();

    if (pointSystemsError) throw pointSystemsError;
    if (!pointSystems) throw new Error('Failed to create point systems');
    console.log(`✅ Created ${pointSystems.length} point systems`);

    const pointSystem1 = pointSystems[0];
    const pointSystem2 = pointSystems[1];

    // 7. ポイントルールの作成
    console.log('\n📋 Creating point rules...');
    const { error: pointRulesError } = await supabase
      .from('point_rules')
      .insert([
        {
          point_system_id: pointSystem1.id,
          activity_category: 'training',
          points_per_session: 50,
          points_per_minute: 1.0,
          bonus_conditions: { consecutive_days: { 3: 50, 7: 200 }, monthly_visits: { 10: 500, 20: 1500 } },
          is_active: true
        },
        {
          point_system_id: pointSystem1.id,
          activity_category: 'swimming',
          points_per_session: 40,
          points_per_minute: 0.8,
          bonus_conditions: { duration_bonus: { 60: 100, 120: 300 } },
          is_active: true
        },
        {
          point_system_id: pointSystem2.id,
          activity_category: 'yoga',
          points_per_session: 100,
          points_per_minute: 2.0,
          bonus_conditions: { class_completion: 50, perfect_attendance_week: 500 },
          is_active: true
        },
        {
          point_system_id: pointSystem2.id,
          activity_category: 'swimming',
          points_per_session: 80,
          points_per_minute: 1.5,
          bonus_conditions: { distance_km: { 1: 50, 3: 200, 5: 500 } },
          is_active: true
        }
      ]);

    if (pointRulesError) throw pointRulesError;
    console.log(`✅ Created point rules`);

    // 8. ユーザーの作成とプロファイル設定
    console.log('\n👤 Creating users and profiles...');
    const userIds: Record<string, string> = {};

    for (const user of users) {
      // ユーザーを作成
      const { data: authUser, error: authError } = await supabase.auth.admin.createUser({
        email: user.email,
        password: user.password,
        email_confirm: true,
        user_metadata: user.metadata
      });

      if (authError) {
        console.error(`Error creating user ${user.email}:`, authError);
        continue;
      }

      // プロファイルの更新（トリガーで作成されているので更新）
      const { error: profileError } = await supabase
        .from('user_profiles')
        .update(user.profile)
        .eq('user_id', authUser.user.id);

      if (profileError) {
        console.error(`Error updating profile for ${user.email}:`, profileError);
      } else {
        console.log(`✅ Created user: ${user.email}`);
        userIds[user.email] = authUser.user.id;
      }
    }

    // 9. 会社ユーザー（スタッフ）の設定
    console.log('\n👔 Creating company users...');
    if (userIds['admin@fittracker.com']) {
      await supabase
        .from('company_users')
        .insert({
          user_id: userIds['admin@fittracker.com'],
          company_id: company1.id,
          role: 'admin',
          permissions: { all: true },
          is_active: true
        });
    }

    if (userIds['staff@fittracker.com']) {
      await supabase
        .from('company_users')
        .insert({
          user_id: userIds['staff@fittracker.com'],
          company_id: company1.id,
          role: 'staff',
          permissions: { check_in: true, view_reports: false },
          branch_id: branch1.id,
          is_active: true
        });
    }

    // 10. メンバーシップの作成
    console.log('\n🎫 Creating memberships...');
    if (userIds['user1@example.com']) {
      await supabase
        .from('user_memberships')
        .insert({
          user_id: userIds['user1@example.com'],
          company_id: company1.id,
          membership_number: 'FW-2024-0001',
          membership_type: 'premium',
          start_date: '2024-01-01',
          end_date: '2024-12-31',
          is_active: true
        });

      // ポイントの初期設定
      await supabase
        .from('user_points')
        .insert({
          user_id: userIds['user1@example.com'],
          company_id: company1.id,
          current_points: 1500,
          total_earned: 2000,
          total_used: 500
        });
    }

    if (userIds['user2@example.com']) {
      await supabase
        .from('user_memberships')
        .insert([
          {
            user_id: userIds['user2@example.com'],
            company_id: company1.id,
            membership_number: 'FW-2024-0002',
            membership_type: 'regular',
            start_date: '2024-02-15',
            end_date: '2025-02-14',
            is_active: true
          },
          {
            user_id: userIds['user2@example.com'],
            company_id: company2.id,
            membership_number: 'HL-2024-0002',
            membership_type: 'regular',
            start_date: '2024-03-01',
            end_date: '2025-02-28',
            is_active: true
          }
        ]);

      // ポイントの初期設定
      await supabase
        .from('user_points')
        .insert([
          {
            user_id: userIds['user2@example.com'],
            company_id: company1.id,
            current_points: 800,
            total_earned: 800,
            total_used: 0
          },
          {
            user_id: userIds['user2@example.com'],
            company_id: company2.id,
            current_points: 3000,
            total_earned: 3000,
            total_used: 0
          }
        ]);
    }

    if (userIds['user3@example.com']) {
      await supabase
        .from('user_memberships')
        .insert({
          user_id: userIds['user3@example.com'],
          company_id: company2.id,
          membership_number: 'HL-2024-0001',
          membership_type: 'vip',
          start_date: '2024-01-01',
          end_date: null,
          is_active: true
        });

      // ポイントの初期設定
      await supabase
        .from('user_points')
        .insert({
          user_id: userIds['user3@example.com'],
          company_id: company2.id,
          current_points: 5000,
          total_earned: 5000,
          total_used: 0
        });
    }

    // 11. アクティビティログの作成
    console.log('\n📊 Creating activity logs...');
    const facility1 = facilities.find(f => f.code === 'FW-SHIBUYA-001');
    const facility3 = facilities.find(f => f.code === 'HL-AOYAMA-001');
    const facility4 = facilities.find(f => f.code === 'HL-YOKOHAMA-001');

    if (userIds['user1@example.com'] && facility1) {
      const activityType = activityTypes.find(at => at.facility_id === facility1.id && at.code === 'CARDIO-001');
      if (activityType) {
        const activities = [];
        for (let i = 0; i < 30; i += 3) {
          const checkInTime = new Date();
          checkInTime.setDate(checkInTime.getDate() - (30 - i));
          checkInTime.setHours(10, 0, 0, 0);
          
          const checkOutTime = new Date(checkInTime);
          checkOutTime.setHours(11, 0, 0, 0);

          activities.push({
            user_id: userIds['user1@example.com'],
            company_id: company1.id,
            facility_id: facility1.id,
            activity_type_id: activityType.id,
            check_in_time: checkInTime.toISOString(),
            check_out_time: checkOutTime.toISOString(),
            duration_minutes: 60,
            calories_burned: 400,
            distance_km: 5.5,
            notes: 'ランニングマシンで5.5km走行',
            data: { speed_avg: 5.5, incline: 2, heart_rate_avg: 145 }
          });
        }
        await supabase.from('activity_logs').insert(activities);
      }
    }

    // 12. 測定記録の作成
    console.log('\n📏 Creating measurements...');
    if (userIds['user1@example.com'] && facility1) {
      await supabase
        .from('measurements')
        .insert([
          {
            user_id: userIds['user1@example.com'],
            company_id: company1.id,
            facility_id: facility1.id,
            measurement_date: new Date(Date.now() - 90 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
            weight: 75.5,
            body_fat_percentage: 18.5,
            muscle_mass: 58.2,
            bmi: 23.4,
            measurements: { chest: 98, waist: 82, hip: 96 },
            notes: '初回測定'
          },
          {
            user_id: userIds['user1@example.com'],
            company_id: company1.id,
            facility_id: facility1.id,
            measurement_date: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
            weight: 73.2,
            body_fat_percentage: 16.8,
            muscle_mass: 59.1,
            bmi: 22.7,
            measurements: { chest: 96, waist: 78, hip: 94 },
            notes: '順調に減量中'
          },
          {
            user_id: userIds['user1@example.com'],
            company_id: company1.id,
            facility_id: facility1.id,
            measurement_date: new Date().toISOString().split('T')[0],
            weight: 72.0,
            body_fat_percentage: 15.5,
            muscle_mass: 60.0,
            bmi: 22.3,
            measurements: { chest: 95, waist: 76, hip: 93 },
            notes: '目標達成間近！'
          }
        ]);
    }

    // 13. ポイント履歴の作成
    console.log('\n💎 Creating point transactions...');
    if (userIds['user1@example.com']) {
      await supabase
        .from('point_transactions')
        .insert([
          {
            user_id: userIds['user1@example.com'],
            company_id: company1.id,
            transaction_type: 'earn',
            amount: 500,
            balance_after: 500,
            description: '新規入会ボーナス',
            expires_at: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString()
          },
          {
            user_id: userIds['user1@example.com'],
            company_id: company1.id,
            transaction_type: 'earn',
            amount: 1500,
            balance_after: 2000,
            description: '月間利用ボーナス',
            expires_at: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString()
          },
          {
            user_id: userIds['user1@example.com'],
            company_id: company1.id,
            transaction_type: 'use',
            amount: -500,
            balance_after: 1500,
            description: 'プロテイン購入'
          }
        ]);
    }

    console.log('\n✨ Database seeding completed successfully!');
    
    // 最終確認
    console.log('\n📊 Final counts:');
    const finalTables = [
      'companies', 'branches', 'facilities', 'activity_types',
      'user_profiles', 'company_users', 'user_memberships',
      'point_systems', 'point_rules', 'user_points',
      'activity_logs', 'point_transactions', 'measurements'
    ];

    for (const table of finalTables) {
      const { count } = await supabase.from(table).select('*', { count: 'exact', head: true });
      console.log(`${table}: ${count}`);
    }

  } catch (error) {
    console.error('\n❌ Error during seeding:', error);
    process.exit(1);
  }
}

// 実行
seedDatabase();