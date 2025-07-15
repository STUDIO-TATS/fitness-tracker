'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { 
  getCurrentUser, 
  createWorkout, 
  getExercises,
  addExerciseToWorkout,
  addSet,
  searchExercises
} from '@fitness-tracker/supabase'
import type { User, Exercise, CreateWorkoutInput, CreateSetInput } from '@fitness-tracker/types'

interface WorkoutExercise {
  exercise: Exercise
  sets: CreateSetInput[]
}

export default function NewWorkoutPage() {
  const [user, setUser] = useState<User | null>(null)
  const [workoutName, setWorkoutName] = useState('')
  const [workoutDate, setWorkoutDate] = useState(new Date().toISOString().split('T')[0])
  const [workoutNotes, setWorkoutNotes] = useState('')
  const [exercises, setExercises] = useState<Exercise[]>([])
  const [selectedExercises, setSelectedExercises] = useState<WorkoutExercise[]>([])
  const [searchTerm, setSearchTerm] = useState('')
  const [loading, setLoading] = useState(false)
  const [showExerciseModal, setShowExerciseModal] = useState(false)
  const router = useRouter()

  useEffect(() => {
    loadInitialData()
  }, [])

  const loadInitialData = async () => {
    const { data: userData, error: userError } = await getCurrentUser()
    if (userError || !userData) {
      router.push('/auth')
      return
    }
    setUser(userData)

    const { data: exerciseData } = await getExercises()
    if (exerciseData) {
      setExercises(exerciseData)
    }
  }

  const handleSearch = async () => {
    if (searchTerm.trim()) {
      const { data } = await searchExercises(searchTerm)
      if (data) {
        setExercises(data)
      }
    } else {
      const { data } = await getExercises()
      if (data) {
        setExercises(data)
      }
    }
  }

  const addExercise = (exercise: Exercise) => {
    setSelectedExercises([
      ...selectedExercises,
      {
        exercise,
        sets: [{ set_number: 1, reps: 0, weight: 0 }]
      }
    ])
    setShowExerciseModal(false)
  }

  const removeExercise = (index: number) => {
    setSelectedExercises(selectedExercises.filter((_, i) => i !== index))
  }

  const addSetToExercise = (exerciseIndex: number) => {
    const updated = [...selectedExercises]
    const lastSetNumber = updated[exerciseIndex].sets.length
    updated[exerciseIndex].sets.push({
      set_number: lastSetNumber + 1,
      reps: 0,
      weight: 0
    })
    setSelectedExercises(updated)
  }

  const updateSet = (exerciseIndex: number, setIndex: number, field: keyof CreateSetInput, value: number) => {
    const updated = [...selectedExercises]
    updated[exerciseIndex].sets[setIndex] = {
      ...updated[exerciseIndex].sets[setIndex],
      [field]: value
    }
    setSelectedExercises(updated)
  }

  const removeSet = (exerciseIndex: number, setIndex: number) => {
    const updated = [...selectedExercises]
    updated[exerciseIndex].sets = updated[exerciseIndex].sets.filter((_, i) => i !== setIndex)
    // Update set numbers
    updated[exerciseIndex].sets.forEach((set, i) => {
      set.set_number = i + 1
    })
    setSelectedExercises(updated)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!user || selectedExercises.length === 0) return

    setLoading(true)
    try {
      // Create workout
      const workoutData: CreateWorkoutInput = {
        name: workoutName,
        date: workoutDate,
        notes: workoutNotes
      }
      
      const { data: workout, error: workoutError } = await createWorkout(user.id, workoutData)
      if (workoutError || !workout) throw workoutError

      // Add exercises and sets
      for (let i = 0; i < selectedExercises.length; i++) {
        const { exercise, sets } = selectedExercises[i]
        
        const { data: workoutExercise, error: exerciseError } = await addExerciseToWorkout(
          workout.id,
          exercise.id,
          i
        )
        if (exerciseError || !workoutExercise) throw exerciseError

        // Add sets
        for (const set of sets) {
          const { error: setError } = await addSet(workoutExercise.id, set)
          if (setError) throw setError
        }
      }

      router.push('/workouts')
    } catch (error) {
      console.error('Error creating workout:', error)
      alert('Error creating workout. Please try again.')
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
              <Link href="/workouts" className="text-gray-700 dark:text-gray-300 hover:text-gray-900">
                Workouts
              </Link>
              <span className="text-gray-500">/</span>
              <span className="text-gray-700 dark:text-gray-300">New</span>
            </div>
          </div>
        </div>
      </nav>

      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <h1 className="text-3xl font-bold mb-8">Create New Workout</h1>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
            <h2 className="text-xl font-semibold mb-4">Workout Details</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-2">Workout Name</label>
                <input
                  type="text"
                  value={workoutName}
                  onChange={(e) => setWorkoutName(e.target.value)}
                  className="w-full px-3 py-2 border rounded-md dark:bg-gray-700 dark:border-gray-600"
                  required
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium mb-2">Date</label>
                <input
                  type="date"
                  value={workoutDate}
                  onChange={(e) => setWorkoutDate(e.target.value)}
                  className="w-full px-3 py-2 border rounded-md dark:bg-gray-700 dark:border-gray-600"
                  required
                />
              </div>
            </div>
            
            <div className="mt-4">
              <label className="block text-sm font-medium mb-2">Notes (optional)</label>
              <textarea
                value={workoutNotes}
                onChange={(e) => setWorkoutNotes(e.target.value)}
                className="w-full px-3 py-2 border rounded-md dark:bg-gray-700 dark:border-gray-600"
                rows={3}
              />
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-semibold">Exercises</h2>
              <button
                type="button"
                onClick={() => setShowExerciseModal(true)}
                className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
              >
                Add Exercise
              </button>
            </div>

            {selectedExercises.length === 0 ? (
              <p className="text-gray-500 text-center py-8">
                No exercises added yet. Click "Add Exercise" to get started.
              </p>
            ) : (
              <div className="space-y-6">
                {selectedExercises.map((item, exerciseIndex) => (
                  <div key={exerciseIndex} className="border rounded-lg p-4 dark:border-gray-600">
                    <div className="flex justify-between items-start mb-4">
                      <div>
                        <h3 className="font-semibold text-lg">{item.exercise.name}</h3>
                        <p className="text-sm text-gray-500">{item.exercise.muscle_group}</p>
                      </div>
                      <button
                        type="button"
                        onClick={() => removeExercise(exerciseIndex)}
                        className="text-red-600 hover:text-red-700"
                      >
                        Remove
                      </button>
                    </div>

                    <div className="space-y-2">
                      {item.sets.map((set, setIndex) => (
                        <div key={setIndex} className="flex items-center gap-4">
                          <span className="text-sm font-medium w-16">Set {set.set_number}</span>
                          
                          <div className="flex items-center gap-2">
                            <input
                              type="number"
                              placeholder="Reps"
                              value={set.reps || ''}
                              onChange={(e) => updateSet(exerciseIndex, setIndex, 'reps', parseInt(e.target.value) || 0)}
                              className="w-20 px-2 py-1 border rounded dark:bg-gray-700 dark:border-gray-600"
                            />
                            <span className="text-sm">reps</span>
                          </div>
                          
                          <div className="flex items-center gap-2">
                            <input
                              type="number"
                              placeholder="Weight"
                              value={set.weight || ''}
                              onChange={(e) => updateSet(exerciseIndex, setIndex, 'weight', parseFloat(e.target.value) || 0)}
                              className="w-20 px-2 py-1 border rounded dark:bg-gray-700 dark:border-gray-600"
                            />
                            <span className="text-sm">kg</span>
                          </div>
                          
                          {item.sets.length > 1 && (
                            <button
                              type="button"
                              onClick={() => removeSet(exerciseIndex, setIndex)}
                              className="text-red-600 hover:text-red-700 text-sm"
                            >
                              Remove
                            </button>
                          )}
                        </div>
                      ))}
                    </div>

                    <button
                      type="button"
                      onClick={() => addSetToExercise(exerciseIndex)}
                      className="mt-4 text-blue-600 hover:text-blue-700 text-sm"
                    >
                      Add Set
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="flex gap-4">
            <button
              type="submit"
              disabled={loading || selectedExercises.length === 0}
              className="bg-green-600 text-white px-6 py-3 rounded hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'Creating...' : 'Create Workout'}
            </button>
            <Link
              href="/workouts"
              className="bg-gray-300 text-gray-700 px-6 py-3 rounded hover:bg-gray-400"
            >
              Cancel
            </Link>
          </div>
        </form>
      </main>

      {/* Exercise Selection Modal */}
      {showExerciseModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 max-w-2xl w-full max-h-[80vh] overflow-y-auto">
            <h3 className="text-xl font-semibold mb-4">Select Exercise</h3>
            
            <div className="mb-4">
              <input
                type="text"
                placeholder="Search exercises..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                onKeyUp={handleSearch}
                className="w-full px-3 py-2 border rounded-md dark:bg-gray-700 dark:border-gray-600"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-4">
              {exercises.map((exercise) => (
                <button
                  key={exercise.id}
                  type="button"
                  onClick={() => addExercise(exercise)}
                  className="text-left p-3 border rounded hover:bg-gray-50 dark:hover:bg-gray-700 dark:border-gray-600"
                >
                  <div className="font-medium">{exercise.name}</div>
                  <div className="text-sm text-gray-500">{exercise.muscle_group}</div>
                </button>
              ))}
            </div>

            <button
              type="button"
              onClick={() => setShowExerciseModal(false)}
              className="w-full bg-gray-300 text-gray-700 px-4 py-2 rounded hover:bg-gray-400"
            >
              Cancel
            </button>
          </div>
        </div>
      )}
    </div>
  )
}