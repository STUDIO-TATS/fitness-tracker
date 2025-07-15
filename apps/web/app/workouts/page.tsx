'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { getCurrentUser, getWorkouts, deleteWorkout } from '@fitness-tracker/supabase'
import type { User, Workout } from '@fitness-tracker/types'

export default function WorkoutsPage() {
  const [user, setUser] = useState<User | null>(null)
  const [workouts, setWorkouts] = useState<Workout[]>([])
  const [loading, setLoading] = useState(true)
  const router = useRouter()

  useEffect(() => {
    loadWorkouts()
  }, [])

  const loadWorkouts = async () => {
    try {
      const { data: userData, error: userError } = await getCurrentUser()
      if (userError || !userData) {
        router.push('/auth')
        return
      }

      setUser(userData)

      const { data: workoutData, error } = await getWorkouts(userData.id)
      if (error) {
        console.error('Error loading workouts:', error)
      } else {
        setWorkouts(workoutData || [])
      }
    } catch (error) {
      console.error('Error:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleDeleteWorkout = async (workoutId: string) => {
    if (!confirm('Are you sure you want to delete this workout?')) return

    const { error } = await deleteWorkout(workoutId)
    if (error) {
      alert('Error deleting workout')
    } else {
      setWorkouts(workouts.filter(w => w.id !== workoutId))
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-xl">Loading...</div>
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
              <span className="text-gray-700 dark:text-gray-300">Workouts</span>
            </div>
            <div className="flex items-center space-x-4">
              <Link
                href="/templates"
                className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700"
              >
                テンプレートから作成
              </Link>
              <Link
                href="/workouts/new"
                className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
              >
                新しいワークアウト
              </Link>
            </div>
          </div>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <h1 className="text-3xl font-bold mb-8">My Workouts</h1>

        {workouts.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-gray-500 mb-4">No workouts yet. Start your fitness journey!</p>
            <Link
              href="/workouts/new"
              className="bg-blue-600 text-white px-6 py-3 rounded hover:bg-blue-700"
            >
              Create Your First Workout
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {workouts.map((workout) => (
              <div
                key={workout.id}
                className="bg-white dark:bg-gray-800 rounded-lg shadow p-6 hover:shadow-lg transition-shadow"
              >
                <div className="flex justify-between items-start mb-4">
                  <h3 className="text-xl font-semibold">{workout.name}</h3>
                  <button
                    onClick={() => handleDeleteWorkout(workout.id)}
                    className="text-red-600 hover:text-red-700"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                  </button>
                </div>

                <div className="space-y-2 mb-4">
                  <p className="text-gray-600 dark:text-gray-400">
                    <span className="font-medium">Date:</span>{' '}
                    {new Date(workout.date).toLocaleDateString()}
                  </p>
                  {workout.duration && (
                    <p className="text-gray-600 dark:text-gray-400">
                      <span className="font-medium">Duration:</span> {workout.duration} minutes
                    </p>
                  )}
                  {workout.workout_exercises && (
                    <p className="text-gray-600 dark:text-gray-400">
                      <span className="font-medium">Exercises:</span>{' '}
                      {workout.workout_exercises.length}
                    </p>
                  )}
                </div>

                {workout.notes && (
                  <p className="text-gray-600 dark:text-gray-400 mb-4 line-clamp-2">
                    {workout.notes}
                  </p>
                )}

                <div className="flex gap-2">
                  <Link
                    href={`/workouts/${workout.id}`}
                    className="flex-1 text-center bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 px-3 py-2 rounded hover:bg-gray-200 dark:hover:bg-gray-600"
                  >
                    View Details
                  </Link>
                  <Link
                    href={`/workouts/${workout.id}/edit`}
                    className="flex-1 text-center bg-blue-600 text-white px-3 py-2 rounded hover:bg-blue-700"
                  >
                    Edit
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  )
}