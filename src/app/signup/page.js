'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'
import Button from '@/components/ui/Button'
import Spinner from '@/components/ui/Spinner'
import { validationConfig, securityConfig, appConfig } from '@/lib/config'

export default function SignUp() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState('')
  const router = useRouter()
  const supabase = createClient()

  const handleSignUp = async (e) => {
    e.preventDefault()
    setLoading(true)
    setMessage('')

    // Validate McGill email using configuration (allow test emails in development)
    const isDevelopment = process.env.NODE_ENV === 'development'
    const isTestEmail = email.includes('+test') || email.includes('test@')
    const isValidDomain = validationConfig.allowedEmailDomains.some(domain =>
      email.endsWith(domain)
    )

    if (!isValidDomain && !(isDevelopment && isTestEmail)) {
      setMessage(`Please use your McGill email address (${validationConfig.allowedEmailDomains.join(' or ')})`)
      setLoading(false)
      return
    }

    // Validate password confirmation
    if (password !== confirmPassword) {
      setMessage('Passwords do not match. Please try again.')
      setLoading(false)
      return
    }

    // Validate password strength using configuration
    if (password.length < securityConfig.password.minLength) {
      setMessage(`Password must be at least ${securityConfig.password.minLength} characters long.`)
      setLoading(false)
      return
    }

    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          emailRedirectTo: `${window.location.origin}/auth/callback`,
        }
      })

      if (error) {
        setMessage(error.message)
      } else if (data.user && !data.user.email_confirmed_at) {
        setMessage('✅ Verification email sent to your McGill email! Please check your inbox (including spam folder) and click the verification link. Note: Links expire after 24 hours.')
      } else {
        router.push('/profile/setup')
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
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(120,119,198,0.3),rgba(255,255,255,0))]"></div>
        <div className="absolute top-20 left-20 w-32 h-32 bg-purple-500/10 rounded-full blur-xl animate-pulse"></div>
        <div className="absolute bottom-20 right-20 w-40 h-40 bg-pink-500/10 rounded-full blur-xl animate-pulse delay-700"></div>
      </div>

      <div className="max-w-md w-full space-y-8 relative z-10">
        <div className="text-center">
          <div className="flex justify-center mb-6">
            <div className="relative">
              <div className="text-6xl animate-pulse">🧠</div>
              <div className="absolute -top-2 -right-2 w-4 h-4 bg-purple-400 rounded-full animate-ping"></div>
            </div>
          </div>
          <h2 className="text-3xl font-bold text-white">
            Join the <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-400">Neural Network</span>
          </h2>
          <p className="mt-2 text-gray-300">
            Connect your curiosity with McGill's brightest minds
          </p>
        </div>

        <div className="bg-slate-800/80 backdrop-blur-sm rounded-2xl p-8 border border-purple-500/20 shadow-2xl">
          <form className="space-y-6" onSubmit={handleSignUp}>
            <div className="space-y-4">
              <div>
                <label htmlFor="email" className="block text-sm font-medium text-gray-300">
                  McGill Neural Address
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
                  autoComplete="new-password"
                  required
                  minLength={securityConfig.password.minLength}
                  className="mt-1 appearance-none relative block w-full px-4 py-3 border border-purple-500/30 placeholder-gray-400 text-white bg-slate-700/50 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent backdrop-blur-sm transition-all duration-300"
                  placeholder={`Secure your neural pathway (min ${securityConfig.password.minLength} chars)`}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
              </div>

              <div>
                <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-300">
                  Confirm Security Key
                </label>
                <input
                  id="confirmPassword"
                  name="confirmPassword"
                  type="password"
                  autoComplete="new-password"
                  required
                  className="mt-1 appearance-none relative block w-full px-4 py-3 border border-purple-500/30 placeholder-gray-400 text-white bg-slate-700/50 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent backdrop-blur-sm transition-all duration-300"
                  placeholder="Verify your security key"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                />
                {confirmPassword && password !== confirmPassword && (
                  <p className="mt-1 text-xs text-pink-400">Neural keys do not synchronize</p>
                )}
              </div>
            </div>

            {message && (
              <div className={`p-4 rounded-xl text-sm border ${message.includes('email sent')
                ? 'bg-green-900/20 text-green-400 border-green-500/30'
                : 'bg-red-900/20 text-red-400 border-red-500/30'
                }`}>
                {message}
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
                    Establishing neural link...
                  </div>
                ) : (
                  <span className="flex items-center">
                    ⚡ Activate Neural Account
                  </span>
                )}
              </Button>
            </div>

            <div className="text-center">
              <span className="text-sm text-gray-400">
                Already connected to the network?{' '}
                <Link href="/login" className="font-medium text-purple-400 hover:text-purple-300 transition-colors duration-300">
                  Sign in here
                </Link>
              </span>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}
