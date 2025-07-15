'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { getWorkout } from '@fitness-tracker/supabase'
import type { Workout } from '@fitness-tracker/types'

export default function WorkoutDetailPage({ params }: { params: { id: string } }) {
  const [workout, setWorkout] = useState<Workout | null>(null)
  const [loading, setLoading] = useState(true)
  const router = useRouter()

  useEffect(() => {
    loadWorkout()
  }, [params.id])

  const loadWorkout = async () => {
    try {
      const { data, error } = await getWorkout(params.id)
      if (error) {
        console.error('Error loading workout:', error)
        router.push('/workouts')
      } else {
        setWorkout(data)
      }
    } catch (error) {
      console.error('Error:', error)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-xl">Loading...</div>
      </div>
    )
  }

  if (!workout) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-xl">Workout not found</div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <nav className="bg-white dark:bg-gray-800 shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center space-x-4">
              <Link href="/dashboard" className="text-xl font-semibold">
                Fitness Tracker
              </Link>
              <span className="text-gray-500">/</span>
              <Link href="/workouts" className="text-gray-700 dark:text-gray-300 hover:text-gray-900">
                Workouts
              </Link>
              <span className="text-gray-500">/</span>
              <span className="text-gray-700 dark:text-gray-300">{workout.name}</span>
            </div>
            <div className="flex items-center">
              <Link
                href={`/workouts/${workout.id}/edit`}
                className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
              >
                Edit Workout
              </Link>
            </div>
          </div>
        </div>
      </nav>

      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6 mb-6">
          <h1 className="text-3xl font-bold mb-4">{workout.name}</h1>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
            <div>
              <span className="font-medium">Date:</span>{' '}
              {new Date(workout.date).toLocaleDateString('en-US', {
                weekday: 'long',
                year: 'numeric',
                month: 'long',
                day: 'numeric'
              })}
            </div>
            {workout.duration && (
              <div>
                <span className="font-medium">Duration:</span> {workout.duration} minutes
              </div>
            )}
          </div>

          {workout.notes && (
            <div className="mt-4">
              <span className="font-medium">Notes:</span>
              <p className="mt-1 text-gray-600 dark:text-gray-400">{workout.notes}</p>
            </div>
          )}
        </div>

        <div className="space-y-6">
          <h2 className="text-2xl font-semibold">Exercises</h2>
          
          {workout.workout_exercises && workout.workout_exercises.length > 0 ? (
            workout.workout_exercises
              .sort((a, b) => a.order_index - b.order_index)
              .map((workoutExercise) => (
                <div
                  key={workoutExercise.id}
                  className="bg-white dark:bg-gray-800 rounded-lg shadow p-6"
                >
                  <h3 className="text-xl font-semibold mb-2">
                    {workoutExercise.exercise?.name}
                  </h3>
                  <p className="text-sm text-gray-500 mb-4">
                    {workoutExercise.exercise?.muscle_group} • {workoutExercise.exercise?.category}
                  </p>

                  {workoutExercise.sets && workoutExercise.sets.length > 0 ? (
                    <div className="overflow-x-auto">
                      <table className="min-w-full">
                        <thead>
                          <tr className="border-b dark:border-gray-700">
                            <th className="text-left py-2 px-4">Set</th>
                            <th className="text-left py-2 px-4">Reps</th>
                            <th className="text-left py-2 px-4">Weight</th>
                            {workoutExercise.sets.some(s => s.distance) && (
                              <th className="text-left py-2 px-4">Distance</th>
                            )}
                            {workoutExercise.sets.some(s => s.duration) && (
                              <th className="text-left py-2 px-4">Duration</th>
                            )}
                            {workoutExercise.sets.some(s => s.notes) && (
                              <th className="text-left py-2 px-4">Notes</th>
                            )}
                          </tr>
                        </thead>
                        <tbody>
                          {workoutExercise.sets
                            .sort((a, b) => a.set_number - b.set_number)
                            .map((set) => (
                              <tr key={set.id} className="border-b dark:border-gray-700">
                                <td className="py-2 px-4">{set.set_number}</td>
                                <td className="py-2 px-4">{set.reps || '-'}</td>
                                <td className="py-2 px-4">
                                  {set.weight ? `${set.weight} kg` : '-'}
                                </td>
                                {workoutExercise.sets.some(s => s.distance) && (
                                  <td className="py-2 px-4">
                                    {set.distance ? `${set.distance} km` : '-'}
                                  </td>
                                )}
                                {workoutExercise.sets.some(s => s.duration) && (
                                  <td className="py-2 px-4">
                                    {set.duration ? `${set.duration} sec` : '-'}
                                  </td>
                                )}
                                {workoutExercise.sets.some(s => s.notes) && (
                                  <td className="py-2 px-4">{set.notes || '-'}</td>
                                )}
                              </tr>
                            ))}
                        </tbody>
                      </table>
                    </div>
                  ) : (
                    <p className="text-gray-500">No sets recorded</p>
                  )}
                </div>
              ))
          ) : (
            <p className="text-gray-500 text-center py-8">No exercises in this workout</p>
          )}
        </div>

        <div className="mt-8 flex gap-4">
          <Link
            href="/workouts"
            className="bg-gray-300 text-gray-700 px-6 py-3 rounded hover:bg-gray-400"
          >
            Back to Workouts
          </Link>
        </div>
      </main>
    </div>
  )
}