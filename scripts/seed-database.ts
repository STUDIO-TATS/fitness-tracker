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
    password: 'testpass123',
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
    password: 'testpass123',
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
    password: 'testpass123',
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
    password: 'testpass123',
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
    password: 'testpass123',
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
    const facility2 = facilities.find(f => f.code === 'FW-UMEDA-001');
    const facility3 = facilities.find(f => f.code === 'HL-AOYAMA-001');
    const facility4 = facilities.find(f => f.code === 'HL-YOKOHAMA-001');

    // user1 - 多様なワークアウト履歴
    if (userIds['user1@example.com'] && facility1) {
      const cardioType = activityTypes.find(at => at.facility_id === facility1.id && at.code === 'CARDIO-001');
      const weightType = activityTypes.find(at => at.facility_id === facility1.id && at.code === 'WEIGHT-001');
      const ptType = activityTypes.find(at => at.facility_id === facility1.id && at.code === 'PT-001');
      
      const activities = [];
      
      // 過去3ヶ月分のアクティビティを生成
      for (let i = 0; i < 90; i++) {
        const date = new Date();
        date.setDate(date.getDate() - i);
        
        // 週3-4回のペースでトレーニング
        if (i % 2 === 0 || i % 3 === 0) {
          // 朝トレーニングと夜トレーニングを混在
          const isEvening = i % 5 === 0;
          const checkInTime = new Date(date);
          checkInTime.setHours(isEvening ? 19 : 10, 0, 0, 0);
          
          // アクティビティタイプをローテーション
          let activityType, duration, calories, notes, data;
          
          if (i % 6 === 0) {
            // パーソナルトレーニング
            activityType = ptType;
            duration = 60;
            calories = 500;
            notes = 'パーソナルトレーニング - 全身';
            data = { trainer: '山田トレーナー', focus: '全身', satisfaction: 5 };
          } else if (i % 3 === 0) {
            // 有酸素運動
            activityType = cardioType;
            duration = 30 + (i % 4) * 10; // 30-60分
            calories = 300 + (i % 4) * 100;
            const distance = 3.0 + (i % 4) * 1.5;
            notes = `ランニング ${distance}km`;
            data = { 
              speed_avg: 5.5 + (i % 3), 
              incline: i % 5, 
              heart_rate_avg: 140 + (i % 20),
              machine: i % 2 === 0 ? 'treadmill' : 'bike'
            };
          } else {
            // ウェイトトレーニング
            activityType = weightType;
            duration = 45 + (i % 3) * 15; // 45-75分
            calories = 250 + (i % 3) * 50;
            const focus = ['胸・三頭', '背中・二頭', '脚・肩'][i % 3];
            notes = `ウェイトトレーニング - ${focus}`;
            data = { 
              focus_area: focus,
              sets_completed: 12 + (i % 4) * 2,
              personal_records: i % 10 === 0
            };
          }
          
          const checkOutTime = new Date(checkInTime);
          checkOutTime.setMinutes(checkOutTime.getMinutes() + duration);
          
          activities.push({
            user_id: userIds['user1@example.com'],
            company_id: company1.id,
            facility_id: facility1.id,
            activity_type_id: activityType?.id,
            check_in_time: checkInTime.toISOString(),
            check_out_time: checkOutTime.toISOString(),
            duration_minutes: duration,
            calories_burned: calories,
            distance_km: data?.speed_avg ? (duration / 60) * data.speed_avg : null,
            notes: notes,
            data: data
          });
        }
      }
      await supabase.from('activity_logs').insert(activities);
    }

    // user2 - ヨガ中心の活動
    if (userIds['user2@example.com'] && facility3) {
      const hataYoga = activityTypes.find(at => at.facility_id === facility3.id && at.code === 'YOGA-001');
      const powerYoga = activityTypes.find(at => at.facility_id === facility3.id && at.code === 'YOGA-002');
      const hotYoga = activityTypes.find(at => at.facility_id === facility3.id && at.code === 'YOGA-003');
      
      const activities = [];
      
      // 過去2ヶ月分のヨガ活動
      for (let i = 0; i < 60; i++) {
        const date = new Date();
        date.setDate(date.getDate() - i);
        
        // 週2-3回のペース
        if (date.getDay() === 2 || date.getDay() === 4 || (date.getDay() === 6 && i % 2 === 0)) {
          const checkInTime = new Date(date);
          checkInTime.setHours(date.getDay() === 6 ? 10 : 19, 0, 0, 0);
          
          // ヨガタイプをローテーション
          let yogaType, instructor;
          if (date.getDay() === 2) {
            yogaType = hataYoga;
            instructor = '田中先生';
          } else if (date.getDay() === 4) {
            yogaType = powerYoga;
            instructor = '佐藤先生';
          } else {
            yogaType = hotYoga;
            instructor = '鈴木先生';
          }
          
          const checkOutTime = new Date(checkInTime);
          checkOutTime.setMinutes(checkOutTime.getMinutes() + (yogaType?.duration_minutes || 60));
          
          activities.push({
            user_id: userIds['user2@example.com'],
            company_id: company2.id,
            facility_id: facility3.id,
            activity_type_id: yogaType?.id,
            check_in_time: checkInTime.toISOString(),
            check_out_time: checkOutTime.toISOString(),
            duration_minutes: yogaType?.duration_minutes || 60,
            calories_burned: (yogaType?.calories_per_hour || 200) * ((yogaType?.duration_minutes || 60) / 60),
            notes: `${yogaType?.name}クラス参加`,
            data: { 
              instructor: instructor,
              class_size: 8 + (i % 7),
              flexibility_level: 3 + Math.floor(i / 20),
              poses_completed: 20 + (i % 10)
            }
          });
        }
      }
      
      // プールも時々利用
      if (facility4) {
        const swimming = activityTypes.find(at => at.facility_id === facility4.id && at.code === 'SWIM-001');
        const aqua = activityTypes.find(at => at.facility_id === facility4.id && at.code === 'SWIM-002');
        
        for (let i = 0; i < 30; i += 7) {
          const date = new Date();
          date.setDate(date.getDate() - i);
          const checkInTime = new Date(date);
          checkInTime.setHours(11, 0, 0, 0);
          
          const isAqua = i % 14 === 0;
          const activityType = isAqua ? aqua : swimming;
          const duration = isAqua ? 45 : 30;
          
          const checkOutTime = new Date(checkInTime);
          checkOutTime.setMinutes(checkOutTime.getMinutes() + duration);
          
          activities.push({
            user_id: userIds['user2@example.com'],
            company_id: company2.id,
            facility_id: facility4.id,
            activity_type_id: activityType?.id,
            check_in_time: checkInTime.toISOString(),
            check_out_time: checkOutTime.toISOString(),
            duration_minutes: duration,
            calories_burned: isAqua ? 300 : 250,
            distance_km: isAqua ? null : 1.0,
            notes: isAqua ? 'アクアビクスクラス' : 'ゆったり水泳',
            data: isAqua ? 
              { instructor: '水野先生', intensity: 'medium' } : 
              { style: 'breaststroke', laps: 40, pool_lane: 3 }
          });
        }
      }
      
      await supabase.from('activity_logs').insert(activities);
    }

    // user3 - 早朝スイマー
    if (userIds['user3@example.com'] && facility4) {
      const swimming = activityTypes.find(at => at.facility_id === facility4.id && at.code === 'SWIM-001');
      const activities = [];
      
      // 過去4ヶ月分の早朝スイミング
      for (let i = 0; i < 120; i++) {
        const date = new Date();
        date.setDate(date.getDate() - i);
        
        // 平日のみ（月〜金）
        if (date.getDay() >= 1 && date.getDay() <= 5) {
          const checkInTime = new Date(date);
          checkInTime.setHours(6, 30, 0, 0);
          
          const checkOutTime = new Date(checkInTime);
          checkOutTime.setHours(8, 0, 0, 0);
          
          const distance = 2.0 + (i % 10) * 0.5; // 2-6.5km
          const laps = distance * 40; // 25mプール換算
          
          activities.push({
            user_id: userIds['user3@example.com'],
            company_id: company2.id,
            facility_id: facility4.id,
            activity_type_id: swimming?.id,
            check_in_time: checkInTime.toISOString(),
            check_out_time: checkOutTime.toISOString(),
            duration_minutes: 90,
            calories_burned: 600 + (distance - 2) * 100,
            distance_km: distance,
            notes: `朝スイム ${distance}km`,
            data: { 
              style: ['freestyle', 'backstroke', 'butterfly', 'breaststroke'][i % 4],
              laps: laps,
              pool_lane: (i % 6) + 1,
              avg_pace_per_100m: 1.8 - (i % 10) * 0.05,
              water_temp: 26.5,
              splits: Array(Math.floor(distance)).fill(null).map((_, idx) => ({
                km: idx + 1,
                time_minutes: 15 + (i % 3) - (idx % 2)
              }))
            }
          });
        }
      }
      await supabase.from('activity_logs').insert(activities);
    }

    // 12. 測定記録の作成
    console.log('\n📏 Creating measurements...');
    
    // user1 - 減量と筋力増強の経過
    if (userIds['user1@example.com'] && facility1) {
      const measurements = [];
      
      // 過去6ヶ月分の月次測定
      for (let i = 0; i < 6; i++) {
        const date = new Date();
        date.setMonth(date.getMonth() - i);
        
        // 体重は減少傾向、筋肉量は増加傾向
        const weight = 75.5 - (i * 0.6); // 75.5kg → 72.0kg
        const bodyFat = 18.5 - (i * 0.5); // 18.5% → 15.5%
        const muscleMass = 58.2 + (i * 0.3); // 58.2kg → 60.0kg
        const bmi = weight / (1.75 * 1.75); // 身長175cmと仮定
        
        measurements.push({
          user_id: userIds['user1@example.com'],
          company_id: company1.id,
          facility_id: facility1.id,
          measurement_date: date.toISOString().split('T')[0],
          weight: Math.round(weight * 10) / 10,
          body_fat_percentage: Math.round(bodyFat * 10) / 10,
          muscle_mass: Math.round(muscleMass * 10) / 10,
          bmi: Math.round(bmi * 10) / 10,
          measurements: {
            chest: 98 - i,
            waist: 82 - (i * 1.2),
            hip: 96 - (i * 0.5),
            arm_left: 35 + (i * 0.2),
            arm_right: 35 + (i * 0.2),
            thigh_left: 58 - (i * 0.3),
            thigh_right: 58 - (i * 0.3)
          },
          notes: i === 0 ? '目標達成間近！' : 
                 i === 5 ? '初回測定' : 
                 `${6-i}ヶ月目の測定`
        });
      }
      
      await supabase.from('measurements').insert(measurements.reverse());
    }
    
    // user2 - ヨガによる体型改善
    if (userIds['user2@example.com'] && facility3) {
      const measurements = [];
      
      // 過去4ヶ月分の月2回測定
      for (let i = 0; i < 8; i++) {
        const date = new Date();
        date.setDate(date.getDate() - (i * 15)); // 2週間ごと
        
        // 体重減少、柔軟性向上
        const weight = 58.5 - (i * 0.5); // 58.5kg → 54.5kg
        const bodyFat = 28.0 - (i * 0.6); // 28.0% → 23.2%
        const muscleMass = 39.5 + (i * 0.1); // 39.5kg → 40.3kg
        const bmi = weight / (1.60 * 1.60); // 身長160cmと仮定
        
        measurements.push({
          user_id: userIds['user2@example.com'],
          company_id: company2.id,
          facility_id: facility3.id,
          measurement_date: date.toISOString().split('T')[0],
          weight: Math.round(weight * 10) / 10,
          body_fat_percentage: Math.round(bodyFat * 10) / 10,
          muscle_mass: Math.round(muscleMass * 10) / 10,
          bmi: Math.round(bmi * 10) / 10,
          measurements: {
            chest: 86 - (i * 0.4),
            waist: 72 - (i * 0.8),
            hip: 96 - (i * 0.5),
            flexibility_score: 3 + (i * 0.5) // ヨガ特有の柔軟性スコア
          },
          notes: i === 0 ? '理想的な体型に近づいている' : 
                 i === 7 ? 'ヨガ開始前の記録' : 
                 `開始から${Math.floor((8-i)/2)}ヶ月経過`
        });
      }
      
      await supabase.from('measurements').insert(measurements.reverse());
    }
    
    // user3 - 競泳選手として体型維持
    if (userIds['user3@example.com'] && facility4) {
      const measurements = [];
      
      // 過去3ヶ月分の週次測定（競技者なので頻繁）
      for (let i = 0; i < 12; i++) {
        const date = new Date();
        date.setDate(date.getDate() - (i * 7)); // 週1回
        
        // 体重・体脂肪率は安定、筋肉量は微増
        const weight = 68.0 + Math.sin(i / 3) * 1.5; // 66.5-69.5kgで変動
        const bodyFat = 12.5 - (i * 0.12); // 12.5% → 11.0%
        const muscleMass = 55.0 + (i * 0.2); // 55.0kg → 57.4kg
        const bmi = weight / (1.78 * 1.78); // 身長178cmと仮定
        
        measurements.push({
          user_id: userIds['user3@example.com'],
          company_id: company2.id,
          facility_id: facility4.id,
          measurement_date: date.toISOString().split('T')[0],
          weight: Math.round(weight * 10) / 10,
          body_fat_percentage: Math.round(bodyFat * 10) / 10,
          muscle_mass: Math.round(muscleMass * 10) / 10,
          bmi: Math.round(bmi * 10) / 10,
          measurements: {
            chest: 92 + (i * 0.2),
            waist: 75 - (i * 0.1),
            hip: 90,
            shoulder_width: 48 + (i * 0.1),
            arm_span: 185, // 水泳選手特有の測定
            lung_capacity: 5500 + (i * 50) // 肺活量
          },
          notes: `週次測定 - ${i === 0 ? '絶好調' : i < 4 ? '調子良好' : '基礎作り期'}`
        });
      }
      
      await supabase.from('measurements').insert(measurements.reverse());
    }

    // 13. ポイント履歴の作成
    console.log('\n💎 Creating point transactions...');
    
    // user1 - アクティブなポイント利用者
    if (userIds['user1@example.com']) {
      const transactions = [];
      let balance = 0;
      
      // 初回ボーナス
      balance += 500;
      transactions.push({
        user_id: userIds['user1@example.com'],
        company_id: company1.id,
        transaction_type: 'earn',
        amount: 500,
        balance_after: balance,
        description: '新規入会ボーナス',
        created_at: new Date(Date.now() - 90 * 24 * 60 * 60 * 1000).toISOString(),
        expires_at: new Date(Date.now() + 275 * 24 * 60 * 60 * 1000).toISOString()
      });
      
      // 定期的なワークアウトポイント
      for (let i = 0; i < 30; i++) {
        const daysAgo = 90 - (i * 3);
        const earnDate = new Date(Date.now() - daysAgo * 24 * 60 * 60 * 1000);
        
        // ワークアウトポイント（50-100ポイント）
        const points = 50 + Math.floor(Math.random() * 51);
        balance += points;
        
        transactions.push({
          user_id: userIds['user1@example.com'],
          company_id: company1.id,
          transaction_type: 'earn',
          amount: points,
          balance_after: balance,
          description: `ワークアウト完了ボーナス`,
          created_at: earnDate.toISOString(),
          expires_at: new Date(earnDate.getTime() + 365 * 24 * 60 * 60 * 1000).toISOString()
        });
        
        // 時々連続ボーナス
        if (i % 7 === 6) {
          const bonus = 200;
          balance += bonus;
          transactions.push({
            user_id: userIds['user1@example.com'],
            company_id: company1.id,
            transaction_type: 'earn',
            amount: bonus,
            balance_after: balance,
            description: '週間連続達成ボーナス',
            created_at: new Date(earnDate.getTime() + 1000).toISOString(),
            expires_at: new Date(earnDate.getTime() + 365 * 24 * 60 * 60 * 1000).toISOString()
          });
        }
      }
      
      // ポイント使用履歴
      const uses = [
        { amount: 300, desc: 'プロテインバー購入', daysAgo: 60 },
        { amount: 500, desc: 'ジムタオル交換', daysAgo: 40 },
        { amount: 200, desc: 'ドリンク購入', daysAgo: 20 },
        { amount: 1000, desc: '1日無料パス交換', daysAgo: 10 }
      ];
      
      uses.forEach(use => {
        balance -= use.amount;
        transactions.push({
          user_id: userIds['user1@example.com'],
          company_id: company1.id,
          transaction_type: 'use',
          amount: -use.amount,
          balance_after: balance,
          description: use.desc,
          created_at: new Date(Date.now() - use.daysAgo * 24 * 60 * 60 * 1000).toISOString()
        });
      });
      
      await supabase.from('point_transactions').insert(transactions);
    }
    
    // user2 - 2社のポイントを活用
    if (userIds['user2@example.com']) {
      // フィットネスワールドのポイント
      const fwTransactions = [];
      let fwBalance = 0;
      
      fwBalance += 800;
      fwTransactions.push({
        user_id: userIds['user2@example.com'],
        company_id: company1.id,
        transaction_type: 'earn',
        amount: 800,
        balance_after: fwBalance,
        description: '入会キャンペーンボーナス',
        created_at: new Date(Date.now() - 60 * 24 * 60 * 60 * 1000).toISOString(),
        expires_at: new Date(Date.now() + 305 * 24 * 60 * 60 * 1000).toISOString()
      });
      
      // ヘルシーライフのポイント（ヨガクラス参加）
      const hlTransactions = [];
      let hlBalance = 0;
      
      // ヨガクラス参加ポイント
      for (let i = 0; i < 20; i++) {
        const daysAgo = 60 - (i * 3);
        const earnDate = new Date(Date.now() - daysAgo * 24 * 60 * 60 * 1000);
        
        const points = 100;
        hlBalance += points;
        
        hlTransactions.push({
          user_id: userIds['user2@example.com'],
          company_id: company2.id,
          transaction_type: 'earn',
          amount: points,
          balance_after: hlBalance,
          description: 'ヨガクラス参加',
          created_at: earnDate.toISOString(),
          expires_at: new Date(earnDate.getTime() + 730 * 24 * 60 * 60 * 1000).toISOString() // 2年
        });
      }
      
      // 特別ボーナス
      hlBalance += 1000;
      hlTransactions.push({
        user_id: userIds['user2@example.com'],
        company_id: company2.id,
        transaction_type: 'earn',
        amount: 1000,
        balance_after: hlBalance,
        description: '友人紹介ボーナス',
        created_at: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(),
        expires_at: new Date(Date.now() + 700 * 24 * 60 * 60 * 1000).toISOString()
      });
      
      await supabase.from('point_transactions').insert([...fwTransactions, ...hlTransactions]);
    }
    
    // user3 - VIP会員の大量ポイント
    if (userIds['user3@example.com']) {
      const transactions = [];
      let balance = 0;
      
      // VIP登録ボーナス
      balance += 5000;
      transactions.push({
        user_id: userIds['user3@example.com'],
        company_id: company2.id,
        transaction_type: 'earn',
        amount: 5000,
        balance_after: balance,
        description: 'VIP会員登録ボーナス',
        created_at: new Date(Date.now() - 120 * 24 * 60 * 60 * 1000).toISOString(),
        expires_at: new Date(Date.now() + 610 * 24 * 60 * 60 * 1000).toISOString()
      });
      
      // 毎日の早朝スイミングポイント（平日のみ）
      for (let i = 0; i < 80; i++) {
        const date = new Date();
        date.setDate(date.getDate() - i);
        
        if (date.getDay() >= 1 && date.getDay() <= 5) {
          const points = 80; // 早朝ボーナス付き
          balance += points;
          
          transactions.push({
            user_id: userIds['user3@example.com'],
            company_id: company2.id,
            transaction_type: 'earn',
            amount: points,
            balance_after: balance,
            description: '早朝スイミング',
            created_at: new Date(date.setHours(8, 30, 0, 0)).toISOString(),
            expires_at: new Date(date.getTime() + 730 * 24 * 60 * 60 * 1000).toISOString()
          });
        }
      }
      
      // 月間達成ボーナス
      for (let i = 0; i < 3; i++) {
        const monthsAgo = i + 1;
        const bonusDate = new Date();
        bonusDate.setMonth(bonusDate.getMonth() - monthsAgo);
        
        const bonus = 1000;
        balance += bonus;
        
        transactions.push({
          user_id: userIds['user3@example.com'],
          company_id: company2.id,
          transaction_type: 'earn',
          amount: bonus,
          balance_after: balance,
          description: `${20 + i * 2}日達成ボーナス`,
          created_at: bonusDate.toISOString(),
          expires_at: new Date(bonusDate.getTime() + 730 * 24 * 60 * 60 * 1000).toISOString()
        });
      }
      
      // まだポイントは使っていない（貯めている）
      
      await supabase.from('point_transactions').insert(transactions);
    }

    console.log('\n✨ Database seeding completed successfully!');
    
    // ポイント残高の再計算と更新
    console.log('\n🔄 Updating user points balances...');
    for (const email of Object.keys(userIds)) {
      const userId = userIds[email];
      
      // 各会社のポイント残高を計算
      const { data: userCompanies } = await supabase
        .from('user_memberships')
        .select('company_id')
        .eq('user_id', userId);
      
      if (userCompanies) {
        for (const membership of userCompanies) {
          const { data: transactions } = await supabase
            .from('point_transactions')
            .select('amount')
            .eq('user_id', userId)
            .eq('company_id', membership.company_id)
            .order('created_at', { ascending: true });
          
          if (transactions && transactions.length > 0) {
            const currentPoints = transactions.reduce((sum, t) => sum + t.amount, 0);
            const totalEarned = transactions
              .filter(t => t.amount > 0)
              .reduce((sum, t) => sum + t.amount, 0);
            const totalUsed = Math.abs(transactions
              .filter(t => t.amount < 0)
              .reduce((sum, t) => sum + t.amount, 0));
            
            await supabase
              .from('user_points')
              .update({
                current_points: currentPoints,
                total_earned: totalEarned,
                total_used: totalUsed
              })
              .eq('user_id', userId)
              .eq('company_id', membership.company_id);
          }
        }
      }
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
    
    // テストユーザー情報を表示
    console.log('\n👤 Test Users:');
    console.log('=====================================');
    users.forEach(user => {
      console.log(`Email: ${user.email}`);
      console.log(`Password: ${user.password}`);
      console.log(`Name: ${user.metadata.name}`);
      console.log('-------------------------------------');
    });

  } catch (error) {
    console.error('\n❌ Error during seeding:', error);
    process.exit(1);
  }
}

// 実行
seedDatabase();