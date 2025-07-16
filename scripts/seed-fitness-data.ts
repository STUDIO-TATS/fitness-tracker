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

async function seedData() {
  console.log('🌱 Starting database seeding...\n');

  try {
    // ユーザーを取得
    const { data: users, error: usersError } = await supabase.auth.admin.listUsers();
    
    if (usersError) {
      console.error('Error fetching users:', usersError);
      return;
    }

    console.log(`Found ${users.users.length} users\n`);

    for (const user of users.users) {
      console.log(`\n📊 Creating data for ${user.email}...`);

      // Goals
      const goals = [
        {
          user_id: user.id,
          title: '週3回のワークアウト',
          description: '毎週最低3回はジムでトレーニングする',
          target_value: 3,
          current_value: 2,
          unit: '回',
          category: 'weekly',
          target_date: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
          color: '#6366F1',
          status: 'active'
        },
        {
          user_id: user.id,
          title: '体重を減らす',
          description: '3ヶ月で3kg減量する',
          target_value: 3,
          current_value: 1.5,
          unit: 'kg',
          category: 'monthly',
          target_date: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
          color: '#A855F7',
          status: 'active'
        },
        {
          user_id: user.id,
          title: '水分摂取',
          description: '毎日2リットルの水を飲む',
          target_value: 2,
          current_value: 1.8,
          unit: 'L',
          category: 'daily',
          target_date: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString().split('T')[0],
          color: '#14B8A6',
          status: 'active'
        }
      ];

      const { error: goalsError } = await supabase
        .from('goals')
        .insert(goals);

      if (goalsError) {
        console.error('Error creating goals:', goalsError);
      } else {
        console.log('✅ Goals created');
      }

      // Workouts
      const workoutDates = [
        new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
        new Date(Date.now() - 4 * 24 * 60 * 60 * 1000),
        new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)
      ];

      for (const date of workoutDates) {
        const workout = {
          user_id: user.id,
          name: ['上半身トレーニング', '下半身トレーニング', '有酸素運動'][Math.floor(Math.random() * 3)],
          date: date.toISOString().split('T')[0],
          duration_minutes: 45 + Math.floor(Math.random() * 45),
          calories_burned: 300 + Math.floor(Math.random() * 300),
          notes: '良いトレーニングができた'
        };

        const { data: workoutData, error: workoutError } = await supabase
          .from('workouts')
          .insert(workout)
          .select()
          .single();

        if (workoutError) {
          console.error('Error creating workout:', workoutError);
          continue;
        }

        // Workout exercises
        const exercises = [
          {
            workout_id: workoutData.id,
            exercise_name: 'ベンチプレス',
            sets: 4,
            reps: 8,
            weight: 60 + Math.floor(Math.random() * 40),
            rest_seconds: 120,
            order_index: 1
          },
          {
            workout_id: workoutData.id,
            exercise_name: 'スクワット',
            sets: 3,
            reps: 12,
            weight: 80 + Math.floor(Math.random() * 40),
            rest_seconds: 90,
            order_index: 2
          },
          {
            workout_id: workoutData.id,
            exercise_name: 'デッドリフト',
            sets: 3,
            reps: 10,
            weight: 70 + Math.floor(Math.random() * 50),
            rest_seconds: 120,
            order_index: 3
          }
        ];

        const { error: exercisesError } = await supabase
          .from('workout_exercises')
          .insert(exercises);

        if (exercisesError) {
          console.error('Error creating exercises:', exercisesError);
        }
      }

      console.log('✅ Workouts and exercises created');

      // Measurements
      const measurementDates = [
        new Date(),
        new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
        new Date(Date.now() - 14 * 24 * 60 * 60 * 1000),
        new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)
      ];

      const baseMeasurements = {
        weight: 70 + Math.random() * 10,
        body_fat_percentage: 20 + Math.random() * 5,
        muscle_mass: 30 + Math.random() * 5,
        bmi: 22 + Math.random() * 3,
      };

      const extraMeasurements = {
        body_water_percentage: 55 + Math.random() * 5,
        bone_mass: 2.5 + Math.random() * 1,
        visceral_fat_level: 5 + Math.floor(Math.random() * 5),
        metabolic_age: 25 + Math.floor(Math.random() * 10),
        protein_percentage: 16 + Math.random() * 4,
        basal_metabolic_rate: 1500 + Math.floor(Math.random() * 300)
      };

      for (let i = 0; i < measurementDates.length; i++) {
        const measurement = {
          user_id: user.id,
          measurement_date: measurementDates[i].toISOString().split('T')[0],
          weight: baseMeasurements.weight - (i * 0.5),
          body_fat_percentage: baseMeasurements.body_fat_percentage - (i * 0.3),
          muscle_mass: baseMeasurements.muscle_mass + (i * 0.2),
          bmi: baseMeasurements.bmi - (i * 0.1),
          measurements: extraMeasurements, // Store extra measurements in JSONB field
          notes: '定期測定'
        };

        const { error: measurementError } = await supabase
          .from('measurements')
          .insert(measurement);

        if (measurementError) {
          console.error('Error creating measurement:', measurementError);
        }
      }

      console.log('✅ Measurements created');
    }

    console.log('\n✅ Database seeding completed successfully!');
  } catch (error) {
    console.error('\n❌ Error during seeding:', error);
  }
}

// 実行
seedData();