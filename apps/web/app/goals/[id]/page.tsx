'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { getGoal, updateGoalProgress } from '@fitness-tracker/supabase'
import type { Goal } from '@fitness-tracker/types'

export default function GoalDetailPage({ params }: { params: { id: string } }) {
  const [goal, setGoal] = useState<Goal | null>(null)
  const [loading, setLoading] = useState(true)
  const [updateValue, setUpdateValue] = useState('')
  const [updating, setUpdating] = useState(false)
  const router = useRouter()

  useEffect(() => {
    loadGoal()
  }, [params.id])

  const loadGoal = async () => {
    try {
      const { data, error } = await getGoal(params.id)
      if (error) {
        console.error('Error loading goal:', error)
        router.push('/goals')
      } else {
        setGoal(data)
        setUpdateValue(data?.current_value.toString() || '0')
      }
    } catch (error) {
      console.error('Error:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleUpdateProgress = async () => {
    if (!goal || !updateValue) return

    setUpdating(true)
    try {
      const newValue = parseFloat(updateValue)
      const { data, error } = await updateGoalProgress(goal.id, newValue)
      if (error) throw error
      
      if (data) {
        setGoal(data)
        if (data.status === 'completed') {
          alert('Congratulations! You\'ve completed your goal!')
        }
      }
    } catch (error) {
      console.error('Error updating progress:', error)
      alert('Error updating progress. Please try again.')
    } finally {
      setUpdating(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-xl">Loading...</div>
      </div>
    )
  }

  if (!goal) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-xl">Goal not found</div>
      </div>
    )
  }

  const progressPercentage = goal.target_value 
    ? Math.min((goal.current_value / goal.target_value) * 100, 100)
    : 0

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
              <Link href="/goals" className="text-gray-700 dark:text-gray-300 hover:text-gray-900">
                Goals
              </Link>
              <span className="text-gray-500">/</span>
              <span className="text-gray-700 dark:text-gray-300">{goal.title}</span>
            </div>
          </div>
        </div>
      </nav>

      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6 mb-6">
          <div className="flex justify-between items-start mb-4">
            <h1 className="text-3xl font-bold">{goal.title}</h1>
            <span className={`px-3 py-1 rounded text-sm font-semibold ${
              goal.status === 'active' ? 'bg-green-100 text-green-800' :
              goal.status === 'completed' ? 'bg-blue-100 text-blue-800' :
              goal.status === 'paused' ? 'bg-yellow-100 text-yellow-800' :
              'bg-gray-100 text-gray-800'
            }`}>
              {goal.status}
            </span>
          </div>

          {goal.description && (
            <p className="text-gray-600 dark:text-gray-400 mb-6">{goal.description}</p>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h3 className="font-medium mb-2">Created</h3>
              <p className="text-gray-600 dark:text-gray-400">
                {new Date(goal.created_at).toLocaleDateString('en-US', {
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric'
                })}
              </p>
            </div>

            {goal.target_date && (
              <div>
                <h3 className="font-medium mb-2">Target Date</h3>
                <p className="text-gray-600 dark:text-gray-400">
                  {new Date(goal.target_date).toLocaleDateString('en-US', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric'
                  })}
                </p>
              </div>
            )}
          </div>
        </div>

        {goal.target_value && (
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6 mb-6">
            <h2 className="text-xl font-semibold mb-4">Progress</h2>
            
            <div className="mb-6">
              <div className="flex justify-between mb-2">
                <span className="text-2xl font-bold">
                  {goal.current_value} / {goal.target_value} {goal.unit}
                </span>
                <span className="text-2xl font-bold">{Math.round(progressPercentage)}%</span>
              </div>
              
              <div className="w-full bg-gray-200 rounded-full h-4">
                <div
                  className="bg-gradient-to-r from-green-500 to-green-600 h-4 rounded-full transition-all duration-500"
                  style={{ width: `${progressPercentage}%` }}
                />
              </div>
            </div>

            {goal.status === 'active' && (
              <div>
                <h3 className="font-medium mb-2">Update Progress</h3>
                <div className="flex gap-2">
                  <input
                    type="number"
                    step="0.01"
                    value={updateValue}
                    onChange={(e) => setUpdateValue(e.target.value)}
                    className="flex-1 px-3 py-2 border rounded-md dark:bg-gray-700 dark:border-gray-600"
                    placeholder="Enter current value"
                  />
                  <button
                    onClick={handleUpdateProgress}
                    disabled={updating}
                    className="bg-blue-600 text-white px-6 py-2 rounded hover:bg-blue-700 disabled:opacity-50"
                  >
                    {updating ? 'Updating...' : 'Update'}
                  </button>
                </div>
              </div>
            )}
          </div>
        )}

        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
          <h2 className="text-xl font-semibold mb-4">Progress History</h2>
          <p className="text-gray-500">Progress history feature coming soon...</p>
        </div>

        <div className="mt-8 flex gap-4">
          <Link
            href="/goals"
            className="bg-gray-300 text-gray-700 px-6 py-3 rounded hover:bg-gray-400"
          >
            Back to Goals
          </Link>
        </div>
      </main>
    </div>
  )
}