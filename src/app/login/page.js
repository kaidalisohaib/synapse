'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'
import Button from '@/components/ui/Button'
import Spinner from '@/components/ui/Spinner'

export default function Login() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState('')
  const router = useRouter()
  const supabase = createClient()

  const handleLogin = async (e) => {
    e.preventDefault()
    setLoading(true)
    setMessage('')

    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      })

      if (error) {
        if (error.message.includes('Email not confirmed')) {
          setMessage('Please verify your email address first. Check your inbox (and spam folder) for the verification link.')
        } else {
          setMessage(error.message)
        }
      } else {
        // Check if user has completed profile setup
        const { data: profile } = await supabase
          .from('profiles')
          .select('profile_completed')
          .eq('id', data.user.id)
          .single()

        if (profile && !profile.profile_completed) {
          router.push('/profile/setup')
        } else {
          router.push('/dashboard')
        }
      }
    } catch (error) {
      setMessage('An unexpected error occurred. Please try again.')
    } finally {
      setLoading(false)
    }
  }


  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 py-12 px-4 sm:px-6 lg:px-8">
      {/* Animated background */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_70%,rgba(120,119,198,0.3),rgba(255,255,255,0))]"></div>
        <div className="absolute top-20 right-20 w-32 h-32 bg-purple-500/10 rounded-full blur-xl animate-pulse"></div>
        <div className="absolute bottom-20 left-20 w-40 h-40 bg-pink-500/10 rounded-full blur-xl animate-pulse delay-700"></div>
      </div>

      <div className="max-w-md w-full space-y-8 relative z-10">
        <div className="text-center">
          <div className="flex justify-center mb-6">
            <div className="relative">
              <div className="text-6xl animate-pulse">🧠</div>
              <div className="absolute -top-2 -right-2 w-4 h-4 bg-pink-400 rounded-full animate-ping"></div>
            </div>
          </div>
          <h2 className="text-3xl font-bold text-white">
            Reconnect to the <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-400">Network</span>
          </h2>
          <p className="mt-2 text-gray-300">
            Welcome back to your neural hub
          </p>
        </div>
        
        <div className="bg-slate-800/80 backdrop-blur-sm rounded-2xl p-8 border border-purple-500/20 shadow-2xl">
          <form className="space-y-6" onSubmit={handleLogin}>
            <div className="space-y-4">
              <div>
                <label htmlFor="email" className="block text-sm font-medium text-gray-300">
                  Neural Address
                </label>
                <input
                  id="email"
                  name="email"
                  type="email"
                  autoComplete="email"
                  required
                  className="mt-1 appearance-none relative block w-full px-4 py-3 border border-purple-500/30 placeholder-gray-400 text-white bg-slate-700/50 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent backdrop-blur-sm transition-all duration-300"
                  placeholder="your.name@mail.mcgill.ca"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </div>
              
              <div>
                <label htmlFor="password" className="block text-sm font-medium text-gray-300">
                  Neural Security Key
                </label>
                <input
                  id="password"
                  name="password"
                  type="password"
                  autoComplete="current-password"
                  required
                  className="mt-1 appearance-none relative block w-full px-4 py-3 border border-purple-500/30 placeholder-gray-400 text-white bg-slate-700/50 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent backdrop-blur-sm transition-all duration-300"
                  placeholder="Enter your security key"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
              </div>
            </div>

            {message && (
              <div className={`p-4 rounded-xl text-sm border ${
                message.includes('✅') 
                  ? 'bg-green-900/20 text-green-400 border-green-500/30' 
                  : 'bg-red-900/20 text-red-400 border-red-500/30'
              }`}>
                {message}
              </div>
            )}

            {message.includes('verify your email') && email && (
              <div className="text-center">
                <Link href={`/auth/resend?email=${encodeURIComponent(email)}`}>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    className="w-full border-purple-500/50 text-purple-400 hover:bg-purple-600/20 hover:text-purple-300"
                  >
                    Resend Neural Verification
                  </Button>
                </Link>
              </div>
            )}

            <div>
              <Button
                type="submit"
                disabled={loading}
                className="group relative w-full flex justify-center py-4 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white font-semibold rounded-xl shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-200"
                size="md"
              >
                {loading ? (
                  <div className="flex items-center">
                    <Spinner size="sm" className="mr-2" />
                    Establishing connection...
                  </div>
                ) : (
                  <span className="flex items-center">
                    🔮 Connect to Network
                  </span>
                )}
              </Button>
            </div>

            <div className="text-center">
              <span className="text-sm text-gray-400">
                New to the neural network?{' '}
                <Link href="/signup" className="font-medium text-purple-400 hover:text-purple-300 transition-colors duration-300">
                  Join here
                </Link>
              </span>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}
