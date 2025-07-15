import Link from 'next/link'

export default function Home() {
  return (
    <main className="min-h-screen flex flex-col items-center justify-center p-8">
      <div className="max-w-4xl mx-auto text-center">
        <h1 className="text-5xl font-bold mb-6 bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
          Fitness Tracker
        </h1>
        <p className="text-xl mb-8 text-gray-600 dark:text-gray-300">
          Track your workouts, monitor progress, and achieve your fitness goals
        </p>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
          <div className="p-6 bg-white dark:bg-gray-800 rounded-lg shadow-lg">
            <h3 className="text-xl font-semibold mb-3">Track Workouts</h3>
            <p className="text-gray-600 dark:text-gray-300">
              Log your exercises, sets, reps, and weights with ease
            </p>
          </div>
          
          <div className="p-6 bg-white dark:bg-gray-800 rounded-lg shadow-lg">
            <h3 className="text-xl font-semibold mb-3">Set Goals</h3>
            <p className="text-gray-600 dark:text-gray-300">
              Create and track your fitness goals to stay motivated
            </p>
          </div>
          
          <div className="p-6 bg-white dark:bg-gray-800 rounded-lg shadow-lg">
            <h3 className="text-xl font-semibold mb-3">Monitor Progress</h3>
            <p className="text-gray-600 dark:text-gray-300">
              Visualize your progress with detailed charts and analytics
            </p>
          </div>
        </div>
        
        <div className="flex gap-4 justify-center">
          <Link 
            href="/auth"
            className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-8 rounded-lg transition-colors"
          >
            Get Started
          </Link>
          <Link 
            href="/auth"
            className="border border-gray-300 hover:border-gray-400 font-bold py-3 px-8 rounded-lg transition-colors"
          >
            Sign In
          </Link>
        </div>
      </div>
    </main>
  )
}