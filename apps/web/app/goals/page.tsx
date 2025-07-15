'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { getCurrentUser, getGoals, deleteGoal, updateGoal } from '@fitness-tracker/supabase'
import type { User, Goal } from '@fitness-tracker/types'

export default function GoalsPage() {
  const [user, setUser] = useState<User | null>(null)
  const [goals, setGoals] = useState<Goal[]>([])
  const [loading, setLoading] = useState(true)
  const router = useRouter()

  useEffect(() => {
    loadGoals()
  }, [])

  const loadGoals = async () => {
    try {
      const { data: userData, error: userError } = await getCurrentUser()
      if (userError || !userData) {
        router.push('/auth')
        return
      }

      setUser(userData)

      const { data: goalData, error } = await getGoals(userData.id)
      if (error) {
        console.error('Error loading goals:', error)
      } else {
        setGoals(goalData || [])
      }
    } catch (error) {
      console.error('Error:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleDeleteGoal = async (goalId: string) => {
    if (!confirm('Are you sure you want to delete this goal?')) return

    const { error } = await deleteGoal(goalId)
    if (error) {
      alert('Error deleting goal')
    } else {
      setGoals(goals.filter(g => g.id !== goalId))
    }
  }

  const handleStatusChange = async (goalId: string, status: Goal['status']) => {
    const { error } = await updateGoal(goalId, { status })
    if (error) {
      alert('Error updating goal status')
    } else {
      setGoals(goals.map(g => g.id === goalId ? { ...g, status } : g))
    }
  }

  const getStatusColor = (status: Goal['status']) => {
    switch (status) {
      case 'active':
        return 'bg-green-100 text-green-800 dark:bg-green-800 dark:text-green-100'
      case 'completed':
        return 'bg-blue-100 text-blue-800 dark:bg-blue-800 dark:text-blue-100'
      case 'paused':
        return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-800 dark:text-yellow-100'
      case 'cancelled':
        return 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-100'
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
              <span className="text-gray-700 dark:text-gray-300">Goals</span>
            </div>
            <div className="flex items-center">
              <Link
                href="/goals/new"
                className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700"
              >
                New Goal
              </Link>
            </div>
          </div>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <h1 className="text-3xl font-bold mb-8">My Goals</h1>

        {goals.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-gray-500 mb-4">No goals yet. Set your first fitness goal!</p>
            <Link
              href="/goals/new"
              className="bg-green-600 text-white px-6 py-3 rounded hover:bg-green-700"
            >
              Create Your First Goal
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {goals.map((goal) => (
              <div
                key={goal.id}
                className="bg-white dark:bg-gray-800 rounded-lg shadow p-6 hover:shadow-lg transition-shadow"
              >
                <div className="flex justify-between items-start mb-4">
                  <h3 className="text-xl font-semibold flex-1">{goal.title}</h3>
                  <button
                    onClick={() => handleDeleteGoal(goal.id)}
                    className="text-red-600 hover:text-red-700 ml-2"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                  </button>
                </div>

                <div className="mb-4">
                  <span className={`inline-block px-2 py-1 rounded text-xs font-semibold ${getStatusColor(goal.status)}`}>
                    {goal.status}
                  </span>
                </div>

                {goal.description && (
                  <p className="text-gray-600 dark:text-gray-400 mb-4 line-clamp-2">
                    {goal.description}
                  </p>
                )}

                <div className="space-y-2 mb-4">
                  {goal.target_value && (
                    <div>
                      <div className="flex justify-between text-sm mb-1">
                        <span>Progress</span>
                        <span>
                          {goal.current_value}/{goal.target_value} {goal.unit}
                        </span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div
                          className="bg-green-600 h-2 rounded-full transition-all"
                          style={{
                            width: `${Math.min(
                              (goal.current_value / goal.target_value) * 100,
                              100
                            )}%`,
                          }}
                        />
                      </div>
                      <p className="text-xs text-gray-500 mt-1">
                        {Math.round((goal.current_value / goal.target_value) * 100)}% complete
                      </p>
                    </div>
                  )}
                  
                  {goal.target_date && (
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      <span className="font-medium">Target Date:</span>{' '}
                      {new Date(goal.target_date).toLocaleDateString()}
                    </p>
                  )}
                </div>

                <div className="flex gap-2">
                  <Link
                    href={`/goals/${goal.id}`}
                    className="flex-1 text-center bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 px-3 py-2 rounded hover:bg-gray-200 dark:hover:bg-gray-600"
                  >
                    View Details
                  </Link>
                  
                  {goal.status === 'active' && (
                    <button
                      onClick={() => handleStatusChange(goal.id, 'paused')}
                      className="flex-1 text-center bg-yellow-600 text-white px-3 py-2 rounded hover:bg-yellow-700"
                    >
                      Pause
                    </button>
                  )}
                  
                  {goal.status === 'paused' && (
                    <button
                      onClick={() => handleStatusChange(goal.id, 'active')}
                      className="flex-1 text-center bg-green-600 text-white px-3 py-2 rounded hover:bg-green-700"
                    >
                      Resume
                    </button>
                  )}
                  
                  {(goal.status === 'active' || goal.status === 'paused') && (
                    <button
                      onClick={() => handleStatusChange(goal.id, 'completed')}
                      className="flex-1 text-center bg-blue-600 text-white px-3 py-2 rounded hover:bg-blue-700"
                    >
                      Complete
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  )
}