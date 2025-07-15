import { supabase } from './client'
import type { 
  WorkoutTemplate, 
  TemplateExercise, 
  TemplateUsage,
  CreateWorkoutTemplateInput,
  CreateTemplateExerciseInput,
  Workout,
  CreateWorkoutInput
} from '@fitness-tracker/types'

// ワークアウトテンプレート取得（自分のテンプレート + 公開テンプレート）
export async function getWorkoutTemplates(userId: string) {
  const { data, error } = await supabase
    .from('workout_templates')
    .select(`
      *,
      template_exercises:template_exercises(
        *,
        exercise:exercises(*)
      )
    `)
    .or(`user_id.eq.${userId},is_public.eq.true`)
    .order('created_at', { ascending: false })

  return { data, error }
}

// 特定のテンプレート取得
export async function getWorkoutTemplate(templateId: string) {
  const { data, error } = await supabase
    .from('workout_templates')
    .select(`
      *,
      template_exercises:template_exercises(
        *,
        exercise:exercises(*)
      )
    `)
    .eq('id', templateId)
    .single()

  return { data, error }
}

// 自分のテンプレートのみ取得
export async function getMyWorkoutTemplates(userId: string) {
  const { data, error } = await supabase
    .from('workout_templates')
    .select(`
      *,
      template_exercises:template_exercises(
        *,
        exercise:exercises(*)
      )
    `)
    .eq('user_id', userId)
    .order('created_at', { ascending: false })

  return { data, error }
}

// 公開テンプレートのみ取得
export async function getPublicWorkoutTemplates() {
  const { data, error } = await supabase
    .from('workout_templates')
    .select(`
      *,
      template_exercises:template_exercises(
        *,
        exercise:exercises(*)
      )
    `)
    .eq('is_public', true)
    .order('created_at', { ascending: false })

  return { data, error }
}

// カテゴリ別テンプレート取得
export async function getWorkoutTemplatesByCategory(userId: string, category: string) {
  const { data, error } = await supabase
    .from('workout_templates')
    .select(`
      *,
      template_exercises:template_exercises(
        *,
        exercise:exercises(*)
      )
    `)
    .eq('category', category)
    .or(`user_id.eq.${userId},is_public.eq.true`)
    .order('created_at', { ascending: false })

  return { data, error }
}

// ワークアウトテンプレート作成
export async function createWorkoutTemplate(userId: string, template: CreateWorkoutTemplateInput) {
  const { data, error } = await supabase
    .from('workout_templates')
    .insert({
      user_id: userId,
      ...template
    })
    .select()
    .single()

  return { data, error }
}

// ワークアウトテンプレート更新
export async function updateWorkoutTemplate(templateId: string, updates: Partial<CreateWorkoutTemplateInput>) {
  const { data, error } = await supabase
    .from('workout_templates')
    .update({
      ...updates,
      updated_at: new Date().toISOString()
    })
    .eq('id', templateId)
    .select()
    .single()

  return { data, error }
}

// ワークアウトテンプレート削除
export async function deleteWorkoutTemplate(templateId: string) {
  const { data, error } = await supabase
    .from('workout_templates')
    .delete()
    .eq('id', templateId)

  return { data, error }
}

// テンプレートエクササイズ追加
export async function addTemplateExercise(templateId: string, exercise: CreateTemplateExerciseInput) {
  const { data, error } = await supabase
    .from('template_exercises')
    .insert({
      template_id: templateId,
      ...exercise
    })
    .select(`
      *,
      exercise:exercises(*)
    `)
    .single()

  return { data, error }
}

// テンプレートエクササイズ更新
export async function updateTemplateExercise(exerciseId: string, updates: Partial<CreateTemplateExerciseInput>) {
  const { data, error } = await supabase
    .from('template_exercises')
    .update(updates)
    .eq('id', exerciseId)
    .select(`
      *,
      exercise:exercises(*)
    `)
    .single()

  return { data, error }
}

// テンプレートエクササイズ削除
export async function deleteTemplateExercise(exerciseId: string) {
  const { data, error } = await supabase
    .from('template_exercises')
    .delete()
    .eq('id', exerciseId)

  return { data, error }
}

// テンプレートエクササイズの順序更新
export async function reorderTemplateExercises(templateId: string, exerciseOrders: Array<{ id: string; order_index: number }>) {
  const promises = exerciseOrders.map(({ id, order_index }) =>
    supabase
      .from('template_exercises')
      .update({ order_index })
      .eq('id', id)
      .eq('template_id', templateId)
  )

  const results = await Promise.all(promises)
  const errors = results.filter(result => result.error).map(result => result.error)
  
  return { 
    data: results.every(result => !result.error), 
    error: errors.length > 0 ? errors[0] : null 
  }
}

// テンプレートからワークアウト作成
export async function createWorkoutFromTemplate(
  userId: string, 
  templateId: string, 
  workoutData: CreateWorkoutInput
) {
  try {
    // テンプレート情報を取得
    const { data: template, error: templateError } = await getWorkoutTemplate(templateId)
    if (templateError || !template) {
      return { data: null, error: templateError || new Error('Template not found') }
    }

    // ワークアウト作成
    const { data: workout, error: workoutError } = await supabase
      .from('workouts')
      .insert({
        user_id: userId,
        name: workoutData.name || template.name,
        date: workoutData.date,
        duration: workoutData.duration || template.estimated_duration,
        notes: workoutData.notes
      })
      .select()
      .single()

    if (workoutError || !workout) {
      return { data: null, error: workoutError }
    }

    // テンプレートエクササイズをワークアウトエクササイズとして追加
    if (template.template_exercises && template.template_exercises.length > 0) {
      const workoutExercises = template.template_exercises.map(te => ({
        workout_id: workout.id,
        exercise_id: te.exercise_id,
        order_index: te.order_index
      }))

      const { data: createdExercises, error: exerciseError } = await supabase
        .from('workout_exercises')
        .insert(workoutExercises)
        .select(`
          *,
          exercise:exercises(*)
        `)

      if (exerciseError) {
        return { data: null, error: exerciseError }
      }

      // テンプレートの推奨セットを基にセットを作成
      const sets = []
      for (const te of template.template_exercises) {
        const workoutExercise = createdExercises?.find(we => we.exercise_id === te.exercise_id)
        if (workoutExercise && te.suggested_sets) {
          for (let i = 1; i <= te.suggested_sets; i++) {
            sets.push({
              workout_exercise_id: workoutExercise.id,
              set_number: i,
              reps: te.suggested_reps_min || null,
              weight: null, // ユーザーが後で入力
              rest_time: te.suggested_rest_seconds || null,
              notes: i === 1 ? te.notes : null // 最初のセットにのみメモを追加
            })
          }
        }
      }

      if (sets.length > 0) {
        const { error: setsError } = await supabase
          .from('sets')
          .insert(sets)

        if (setsError) {
          return { data: null, error: setsError }
        }
      }
    }

    // テンプレート使用履歴を記録
    await supabase
      .from('template_usage')
      .insert({
        template_id: templateId,
        user_id: userId,
        workout_id: workout.id
      })

    // 完成したワークアウトを取得して返す
    const { data: finalWorkout, error: finalError } = await supabase
      .from('workouts')
      .select(`
        *,
        workout_exercises:workout_exercises(
          *,
          exercise:exercises(*),
          sets:sets(*)
        )
      `)
      .eq('id', workout.id)
      .single()

    return { data: finalWorkout, error: finalError }

  } catch (error) {
    return { data: null, error: error as Error }
  }
}

// テンプレート使用履歴取得
export async function getTemplateUsage(templateId: string) {
  const { data, error } = await supabase
    .from('template_usage')
    .select('*')
    .eq('template_id', templateId)
    .order('used_at', { ascending: false })

  return { data, error }
}

// ユーザーのテンプレート使用履歴取得
export async function getUserTemplateUsage(userId: string) {
  const { data, error } = await supabase
    .from('template_usage')
    .select(`
      *,
      template:workout_templates(*),
      workout:workouts(*)
    `)
    .eq('user_id', userId)
    .order('used_at', { ascending: false })

  return { data, error }
}

// テンプレートの使用回数取得
export async function getTemplateUsageCount(templateId: string) {
  const { count, error } = await supabase
    .from('template_usage')
    .select('*', { count: 'exact', head: true })
    .eq('template_id', templateId)

  return { data: count || 0, error }
}

// 人気のテンプレート取得（使用回数順）
export async function getPopularTemplates(limit: number = 10) {
  const { data, error } = await supabase
    .rpc('get_popular_templates', { limit_count: limit })

  return { data, error }
}

// テンプレートを複製
export async function duplicateTemplate(templateId: string, userId: string, newName?: string) {
  try {
    // 元のテンプレートを取得
    const { data: originalTemplate, error: templateError } = await getWorkoutTemplate(templateId)
    if (templateError || !originalTemplate) {
      return { data: null, error: templateError || new Error('Template not found') }
    }

    // 新しいテンプレートを作成
    const { data: newTemplate, error: createError } = await createWorkoutTemplate(userId, {
      name: newName || `${originalTemplate.name} (コピー)`,
      description: originalTemplate.description || undefined,
      category: originalTemplate.category || undefined,
      estimated_duration: originalTemplate.estimated_duration || undefined,
      difficulty_level: originalTemplate.difficulty_level || undefined,
      is_public: false // 複製は非公開にする
    })

    if (createError || !newTemplate) {
      return { data: null, error: createError }
    }

    // テンプレートエクササイズを複製
    if (originalTemplate.template_exercises && originalTemplate.template_exercises.length > 0) {
      const exercisesToAdd = originalTemplate.template_exercises.map(te => ({
        exercise_id: te.exercise_id,
        order_index: te.order_index,
        suggested_sets: te.suggested_sets || undefined,
        suggested_reps_min: te.suggested_reps_min || undefined,
        suggested_reps_max: te.suggested_reps_max || undefined,
        suggested_weight_percentage: te.suggested_weight_percentage || undefined,
        suggested_rest_seconds: te.suggested_rest_seconds || undefined,
        notes: te.notes || undefined
      }))

      const promises = exercisesToAdd.map(exercise => 
        addTemplateExercise(newTemplate.id, exercise)
      )

      const results = await Promise.all(promises)
      const errors = results.filter(result => result.error)
      
      if (errors.length > 0) {
        return { data: null, error: errors[0].error }
      }
    }

    // 完成したテンプレートを取得して返す
    const { data: finalTemplate, error: finalError } = await getWorkoutTemplate(newTemplate.id)
    return { data: finalTemplate, error: finalError }

  } catch (error) {
    return { data: null, error: error as Error }
  }
}