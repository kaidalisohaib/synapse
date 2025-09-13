'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import Button from '@/components/ui/Button'

export default function Navbar() {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const router = useRouter()
  const supabase = createClient()

  useEffect(() => {
    const getUser = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      setUser(user)
      setLoading(false)
    }

    getUser()

    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        setUser(session?.user ?? null)
        setLoading(false)
      }
    )

    return () => subscription.unsubscribe()
  }, [supabase.auth])

  const handleSignOut = async () => {
    await supabase.auth.signOut()
    router.push('/')
  }

  return (
    <nav className="bg-slate-900/95 backdrop-blur-sm shadow-lg border-b border-purple-500/20 relative z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <Link href="/" className="flex items-center group">
            <div className="text-2xl animate-pulse mr-2">🧠</div>
            <span className="text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-400 group-hover:from-purple-300 group-hover:to-pink-300 transition-all duration-300">
              Synapse
            </span>
          </Link>

          {/* Navigation Links */}
          <div className="hidden md:flex items-center space-x-8">
            {user ? (
              <>
                <Link 
                  href="/dashboard" 
                  className="text-gray-300 hover:text-purple-400 transition-colors duration-300 font-medium"
                >
                  Neural Hub
                </Link>
                <Link 
                  href="/request" 
                  className="text-gray-300 hover:text-pink-400 transition-colors duration-300 font-medium"
                >
                  Spark Curiosity
                </Link>
                <Link 
                  href="/profile" 
                  className="text-gray-300 hover:text-purple-400 transition-colors duration-300 font-medium"
                >
                  Profile
                </Link>
                <Button 
                  variant="ghost" 
                  size="sm"
                  onClick={handleSignOut}
                  disabled={loading}
                  className="text-gray-300 hover:text-white hover:bg-purple-600/20 transition-all duration-300"
                >
                  Sign Out
                </Button>
              </>
            ) : (
              <>
                <Link 
                  href="/login"
                  className="text-gray-300 hover:text-purple-400 transition-colors duration-300 font-medium"
                >
                  Log In
                </Link>
                <Link href="/signup">
                  <Button size="sm" className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white">
                    Sign Up
                  </Button>
                </Link>
              </>
            )}
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden">
            <button 
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="text-gray-300 hover:text-purple-400 transition-colors duration-300"
            >
              <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </button>
          </div>
        </div>

        {/* Mobile menu */}
        {mobileMenuOpen && (
          <div className="md:hidden">
            <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3 bg-slate-800/95 backdrop-blur-sm border-t border-purple-500/20">
              {user ? (
                <>
                  <Link 
                    href="/dashboard" 
                    className="block px-3 py-2 text-gray-300 hover:text-purple-400 transition-colors duration-300 rounded-lg hover:bg-purple-600/20"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    Neural Hub
                  </Link>
                  <Link 
                    href="/request" 
                    className="block px-3 py-2 text-gray-300 hover:text-pink-400 transition-colors duration-300 rounded-lg hover:bg-pink-600/20"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    Spark Curiosity
                  </Link>
                  <Link 
                    href="/profile" 
                    className="block px-3 py-2 text-gray-300 hover:text-purple-400 transition-colors duration-300 rounded-lg hover:bg-purple-600/20"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    Profile
                  </Link>
                  <button
                    onClick={() => {
                      handleSignOut()
                      setMobileMenuOpen(false)
                    }}
                    disabled={loading}
                    className="block w-full text-left px-3 py-2 text-gray-300 hover:text-white transition-colors duration-300 rounded-lg hover:bg-red-600/20"
                  >
                    Sign Out
                  </button>
                </>
              ) : (
                <>
                  <Link 
                    href="/login"
                    className="block px-3 py-2 text-gray-300 hover:text-purple-400 transition-colors duration-300 rounded-lg hover:bg-purple-600/20"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    Log In
                  </Link>
                  <Link 
                    href="/signup"
                    className="block px-3 py-2 text-gray-300 hover:text-pink-400 transition-colors duration-300 rounded-lg hover:bg-pink-600/20"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    Sign Up
                  </Link>
                </>
              )}
            </div>
          </div>
        )}
      </div>
    </nav>
  )
}
