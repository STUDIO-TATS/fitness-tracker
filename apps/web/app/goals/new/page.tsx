'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { getCurrentUser, createGoal } from '@fitness-tracker/supabase'
import type { User, CreateGoalInput } from '@fitness-tracker/types'

export default function NewGoalPage() {
  const [user, setUser] = useState<User | null>(null)
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [targetValue, setTargetValue] = useState('')
  const [unit, setUnit] = useState('')
  const [targetDate, setTargetDate] = useState('')
  const [loading, setLoading] = useState(false)
  const router = useRouter()

  useEffect(() => {
    loadUser()
  }, [])

  const loadUser = async () => {
    const { data: userData, error: userError } = await getCurrentUser()
    if (userError || !userData) {
      router.push('/auth')
      return
    }
    setUser(userData)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!user) return

    setLoading(true)
    try {
      const goalData: CreateGoalInput = {
        title,
        description: description || undefined,
        target_value: targetValue ? parseFloat(targetValue) : undefined,
        unit: unit || undefined,
        target_date: targetDate || undefined
      }

      const { error } = await createGoal(user.id, goalData)
      if (error) throw error

      router.push('/goals')
    } catch (error) {
      console.error('Error creating goal:', error)
      alert('Error creating goal. Please try again.')
    } finally {
      setLoading(false)
    }
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
              <Link href="/goals" className="text-gray-700 dark:text-gray-300 hover:text-gray-900">
                Goals
              </Link>
              <span className="text-gray-500">/</span>
              <span className="text-gray-700 dark:text-gray-300">New</span>
            </div>
          </div>
        </div>
      </nav>

      <main className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <h1 className="text-3xl font-bold mb-8">Create New Goal</h1>

        <form onSubmit={handleSubmit} className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
          <div className="space-y-6">
            <div>
              <label className="block text-sm font-medium mb-2">Goal Title *</label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="w-full px-3 py-2 border rounded-md dark:bg-gray-700 dark:border-gray-600"
                placeholder="e.g., Lose 10 pounds, Run a 5K, Bench press 225 lbs"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Description</label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="w-full px-3 py-2 border rounded-md dark:bg-gray-700 dark:border-gray-600"
                placeholder="Add more details about your goal..."
                rows={3}
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-2">Target Value</label>
                <input
                  type="number"
                  step="0.01"
                  value={targetValue}
                  onChange={(e) => setTargetValue(e.target.value)}
                  className="w-full px-3 py-2 border rounded-md dark:bg-gray-700 dark:border-gray-600"
                  placeholder="e.g., 10, 5, 225"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Unit</label>
                <input
                  type="text"
                  value={unit}
                  onChange={(e) => setUnit(e.target.value)}
                  className="w-full px-3 py-2 border rounded-md dark:bg-gray-700 dark:border-gray-600"
                  placeholder="e.g., pounds, km, lbs"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Target Date</label>
              <input
                type="date"
                value={targetDate}
                onChange={(e) => setTargetDate(e.target.value)}
                className="w-full px-3 py-2 border rounded-md dark:bg-gray-700 dark:border-gray-600"
                min={new Date().toISOString().split('T')[0]}
              />
            </div>

            <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-md p-4">
              <h3 className="font-medium text-blue-900 dark:text-blue-100 mb-2">Goal Examples:</h3>
              <ul className="text-sm text-blue-800 dark:text-blue-200 space-y-1">
                <li>• Weight Loss: "Lose 10 pounds" with target value 10 and unit "pounds"</li>
                <li>• Strength: "Bench press 225 lbs" with target value 225 and unit "lbs"</li>
                <li>• Endurance: "Run a 5K" with target value 5 and unit "km"</li>
                <li>• Consistency: "Work out 30 times" with target value 30 and unit "workouts"</li>
              </ul>
            </div>
          </div>

          <div className="flex gap-4 mt-8">
            <button
              type="submit"
              disabled={loading || !title}
              className="bg-green-600 text-white px-6 py-3 rounded hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'Creating...' : 'Create Goal'}
            </button>
            <Link
              href="/goals"
              className="bg-gray-300 text-gray-700 px-6 py-3 rounded hover:bg-gray-400"
            >
              Cancel
            </Link>
          </div>
        </form>
      </main>
    </div>
  )
}