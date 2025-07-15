'use client'

import { useState } from 'react'
import { signIn, signUp } from '@fitness-tracker/supabase'
import { useRouter } from 'next/navigation'

type AuthMode = 'signin' | 'signup'

export default function AuthForm() {
  const [mode, setMode] = useState<AuthMode>('signin')
  const [email, setEmail] = useState('demo@fitness-tracker.com')
  const [password, setPassword] = useState('demo123456')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const router = useRouter()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setLoading(true)

    try {
      if (mode === 'signup') {
        if (password !== confirmPassword) {
          setError('Passwords do not match')
          setLoading(false)
          return
        }
        
        const { error } = await signUp(email, password)
        if (error) throw error
        
        setError('Check your email for the confirmation link!')
        setMode('signin')
      } else {
        const { error } = await signIn(email, password)
        if (error) throw error
        
        router.push('/dashboard')
      }
    } catch (err: any) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="w-full max-w-md mx-auto">
      <form onSubmit={handleSubmit} className="bg-white shadow-md rounded px-8 pt-6 pb-8 mb-4">
        <h2 className="text-2xl font-bold mb-6 text-center text-gray-800">
          {mode === 'signin' ? 'Sign In' : 'Sign Up'}
        </h2>

        {mode === 'signin' && (
          <div className="mb-4 p-3 bg-blue-50 border border-blue-200 rounded">
            <h3 className="font-semibold text-blue-800 mb-2">デモアカウント</h3>
            <p className="text-sm text-blue-700 mb-1">
              <strong>Email:</strong> demo@fitness-tracker.com
            </p>
            <p className="text-sm text-blue-700">
              <strong>Password:</strong> demo123456
            </p>
            <p className="text-xs text-blue-600 mt-2">
              ※ 上記の認証情報が既に入力されています
            </p>
          </div>
        )}

        {error && (
          <div className={`mb-4 p-3 rounded ${
            error.includes('Check your email') 
              ? 'bg-green-100 text-green-700' 
              : 'bg-red-100 text-red-700'
          }`}>
            {error}
          </div>
        )}

        <div className="mb-4">
          <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="email">
            Email
          </label>
          <input
            className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
            id="email"
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
        </div>

        <div className="mb-4">
          <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="password">
            Password
          </label>
          <input
            className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
            id="password"
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            minLength={6}
          />
        </div>

        {mode === 'signup' && (
          <div className="mb-6">
            <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="confirmPassword">
              Confirm Password
            </label>
            <input
              className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
              id="confirmPassword"
              type="password"
              placeholder="Confirm Password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
              minLength={6}
            />
          </div>
        )}

        <div className="flex items-center justify-between mb-6">
          <button
            className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline disabled:opacity-50"
            type="submit"
            disabled={loading}
          >
            {loading ? 'Loading...' : mode === 'signin' ? 'Sign In' : 'Sign Up'}
          </button>
        </div>

        <div className="text-center">
          <button
            type="button"
            className="text-blue-500 hover:text-blue-700 text-sm"
            onClick={() => {
              const newMode = mode === 'signin' ? 'signup' : 'signin'
              setMode(newMode)
              setError(null)
              // 新規登録モードの場合はフィールドをクリア、サインインモードの場合はデモデータを復元
              if (newMode === 'signup') {
                setEmail('')
                setPassword('')
                setConfirmPassword('')
              } else {
                setEmail('demo@fitness-tracker.com')
                setPassword('demo123456')
                setConfirmPassword('')
              }
            }}
          >
            {mode === 'signin' 
              ? "Don't have an account? Sign up" 
              : 'Already have an account? Sign in'}
          </button>
        </div>
      </form>
    </div>
  )
}