import { createClient } from '@supabase/supabase-js'
import * as dotenv from 'dotenv'
import { resolve } from 'path'

// Try to load environment variables from multiple locations
dotenv.config({ path: resolve(__dirname, '../apps/mobile/.env') })
dotenv.config({ path: resolve(__dirname, '../.env.local') })
dotenv.config({ path: resolve(__dirname, '../.env') })

// Use local Supabase by default
const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL || 'http://localhost:54321'
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZS1kZW1vIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImV4cCI6MTk4MzgxMjk5Nn0.EGIM96RAZx35lJzdJsyH-qQwv8Hdp7fsn3W0YpN81IU'

console.log('🔗 Using Supabase URL:', supabaseUrl)

const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
})

async function seed() {
  try {
    console.log('🌱 Starting seed process...')
    
    // 1. Clean all tables
    console.log('🧹 Cleaning all tables...')
    const tables = [
      'point_transactions',
      'user_points',
      'activity_logs',
      'measurements',
      'user_memberships',
      'user_profiles',
      'activity_types',
      'facilities',
      'branches',
      'companies',
      'company_users',
      'point_rules',
      'point_systems'
    ]
    
    for (const table of tables) {
      try {
        const { error } = await supabase.from(table).delete().gte('id', '00000000-0000-0000-0000-000000000000')
        if (error && !error.message.includes('does not exist')) {
          console.log(`⚠️  Warning deleting ${table}:`, error.message)
        }
      } catch (e) {
        // Table might not exist
      }
    }
    
    // Delete auth users
    const { data: users } = await supabase.auth.admin.listUsers()
    if (users && users.users.length > 0) {
      console.log(`🗑️  Deleting ${users.users.length} users...`)
      for (const user of users.users) {
        await supabase.auth.admin.deleteUser(user.id)
      }
    }
    
    console.log('✅ All data cleaned')

    // 2. Create test user
    console.log('👤 Creating test user...')
    const { data: testUserData, error: testUserError } = await supabase.auth.admin.createUser({
      email: 'test@example.com',
      password: 'test1234',
      email_confirm: true,
      user_metadata: {
        name: 'テストユーザー'
      }
    })

    if (testUserError) {
      console.error('❌ Error creating test user:', testUserError)
      return
    }

    const testUserId = testUserData.user.id
    console.log('✅ Test user created:', testUserId)

    // 3. Create companies
    console.log('🏢 Creating companies...')
    const companies = [
      {
        id: '550e8400-e29b-41d4-a716-446655440001',
        name: 'フィットネスジムA',
        code: 'FJA',
        description: '総合フィットネスジム',
        logo_url: null
      }
    ]

    const { data: companyData, error: companyError } = await supabase
      .from('companies')
      .insert(companies)
      .select()

    if (companyError) {
      console.error('❌ Company creation error:', companyError.message)
      console.error('Details:', companyError)
      return
    }
    console.log('✅ Companies created:', companyData)

    // 4. Create facilities
    console.log('🏋️ Creating facilities...')
    const facilities = [
      {
        id: '770e8400-e29b-41d4-a716-446655440001',
        company_id: '550e8400-e29b-41d4-a716-446655440001',
        branch_id: null,
        name: 'メインジム',
        code: 'MAIN',
        facility_type: 'gym',
        qr_code: 'QR_FJA_MAIN',
        address: '東京都渋谷区',
        opening_hours: { mon_fri: '6:00-23:00', sat_sun: '8:00-21:00' },
        features: ['free_weights', 'machines', 'cardio', 'pool']
      }
    ]

    const { error: facilityError } = await supabase
      .from('facilities')
      .insert(facilities)

    if (facilityError) {
      console.error('❌ Facility creation error:', facilityError)
      return
    }

    // 5. Create activity types
    console.log('🎯 Creating activity types...')
    const activityTypes = [
      {
        id: '880e8400-e29b-41d4-a716-446655440001',
        facility_id: '770e8400-e29b-41d4-a716-446655440001',
        name: 'ウェイトトレーニング',
        code: 'WEIGHT',
        category: 'training',
        description: 'フリーウェイトとマシントレーニング',
        duration_minutes: 60,
        calories_per_hour: 300
      },
      {
        id: '880e8400-e29b-41d4-a716-446655440002',
        facility_id: '770e8400-e29b-41d4-a716-446655440001',
        name: 'カーディオ',
        code: 'CARDIO',
        category: 'training',
        description: 'ランニング、バイク、エリプティカル',
        duration_minutes: 30,
        calories_per_hour: 400
      },
      {
        id: '880e8400-e29b-41d4-a716-446655440003',
        facility_id: '770e8400-e29b-41d4-a716-446655440001',
        name: 'ヨガ',
        code: 'YOGA',
        category: 'yoga',
        description: 'ヨガクラス',
        duration_minutes: 60,
        calories_per_hour: 200
      }
    ]

    const { error: activityTypeError } = await supabase
      .from('activity_types')
      .insert(activityTypes)

    if (activityTypeError) {
      console.error('❌ Activity type creation error:', activityTypeError)
      return
    }

    // 6. Create user profile
    console.log('📝 Creating user profile...')
    const userProfiles = [
      {
        user_id: testUserId,
        display_name: 'テストユーザー',
        date_of_birth: '1990-01-01',
        gender: 'male',
        phone: '090-1234-5678',
        preferences: {
          units: 'metric',
          notifications: true
        }
      }
    ]

    const { error: profileError } = await supabase
      .from('user_profiles')
      .insert(userProfiles)

    if (profileError) {
      console.error('❌ Profile creation error:', profileError)
      return
    }

    // 7. Create user membership
    console.log('🎫 Creating membership...')
    const memberships = [
      {
        user_id: testUserId,
        company_id: '550e8400-e29b-41d4-a716-446655440001',
        membership_number: 'FJA-2025-001',
        membership_type: 'regular',
        start_date: '2025-01-01',
        end_date: '2025-12-31'
      }
    ]

    const { error: membershipError } = await supabase
      .from('user_memberships')
      .insert(memberships)

    if (membershipError) {
      console.error('❌ Membership creation error:', membershipError)
      return
    }

    // 8. Create sample activity logs
    console.log('📊 Creating activity logs...')
    const now = new Date()
    const activityLogs = [
      {
        user_id: testUserId,
        company_id: '550e8400-e29b-41d4-a716-446655440001',
        facility_id: '770e8400-e29b-41d4-a716-446655440001',
        activity_type_id: '880e8400-e29b-41d4-a716-446655440001',
        check_in_time: new Date(now.getTime() - 1 * 24 * 60 * 60 * 1000).toISOString(),
        check_out_time: new Date(now.getTime() - 1 * 24 * 60 * 60 * 1000 + 60 * 60 * 1000).toISOString(),
        duration_minutes: 60,
        calories_burned: 300,
        notes: '胸と背中のトレーニング'
      },
      {
        user_id: testUserId,
        company_id: '550e8400-e29b-41d4-a716-446655440001',
        facility_id: '770e8400-e29b-41d4-a716-446655440001',
        activity_type_id: '880e8400-e29b-41d4-a716-446655440002',
        check_in_time: new Date(now.getTime() - 3 * 24 * 60 * 60 * 1000).toISOString(),
        check_out_time: new Date(now.getTime() - 3 * 24 * 60 * 60 * 1000 + 30 * 60 * 1000).toISOString(),
        duration_minutes: 30,
        calories_burned: 200,
        notes: '5kmラン'
      },
      {
        user_id: testUserId,
        company_id: '550e8400-e29b-41d4-a716-446655440001',
        facility_id: '770e8400-e29b-41d4-a716-446655440001',
        activity_type_id: '880e8400-e29b-41d4-a716-446655440003',
        check_in_time: new Date(now.getTime() - 5 * 24 * 60 * 60 * 1000).toISOString(),
        check_out_time: new Date(now.getTime() - 5 * 24 * 60 * 60 * 1000 + 60 * 60 * 1000).toISOString(),
        duration_minutes: 60,
        calories_burned: 200,
        notes: 'モーニングヨガ'
      }
    ]

    const { error: activityLogError } = await supabase
      .from('activity_logs')
      .insert(activityLogs)

    if (activityLogError) {
      console.error('❌ Activity log creation error:', activityLogError)
      return
    }

    // 9. Create measurements
    console.log('📏 Creating measurements...')
    const measurements = [
      {
        user_id: testUserId,
        company_id: '550e8400-e29b-41d4-a716-446655440001',
        facility_id: '770e8400-e29b-41d4-a716-446655440001',
        measurement_date: new Date().toISOString().split('T')[0],
        weight: 70.5,
        body_fat_percentage: 18.5,
        muscle_mass: 45.2,
        bmi: 22.1,
        notes: '朝食前に測定'
      },
      {
        user_id: testUserId,
        company_id: '550e8400-e29b-41d4-a716-446655440001',
        facility_id: '770e8400-e29b-41d4-a716-446655440001',
        measurement_date: new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        weight: 71.0,
        body_fat_percentage: 19.0,
        muscle_mass: 44.8,
        bmi: 22.3
      }
    ]

    const { error: measurementError } = await supabase
      .from('measurements')
      .insert(measurements)

    if (measurementError) {
      console.error('❌ Measurement creation error:', measurementError)
      return
    }

    console.log('🎉 Seed completed successfully!')
    console.log('')
    console.log('📧 Test User Credentials:')
    console.log('- Email: test@example.com')
    console.log('- Password: test1234')
    console.log('- User ID:', testUserId)
    console.log('')
    console.log('🏢 Company: フィットネスジムA')
    console.log('🏋️ Facility: メインジム')
    console.log('📊 Sample data: 3 workouts, 2 measurements')
    
  } catch (error) {
    console.error('💥 Seed error:', error)
  }
}

seed()