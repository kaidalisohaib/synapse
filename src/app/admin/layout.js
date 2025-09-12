'use client'

import { useState, useEffect } from 'react'
import { useRouter, usePathname } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'
import Spinner from '@/components/ui/Spinner'

import { adminConfig } from '@/lib/config'

const adminEmails = adminConfig.emails

const navItems = [
  { href: '/admin', label: 'Overview', icon: '📊' },
  { href: '/admin/users', label: 'Users', icon: '👥' },
  { href: '/admin/requests', label: 'Requests', icon: '💭' },
  { href: '/admin/matches', label: 'Matches', icon: '🔗' },
  { href: '/admin/analytics', label: 'Analytics', icon: '📈' },
  { href: '/admin/system', label: 'System', icon: '⚙️' }
]

export default function AdminLayout({ children }) {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)
  const [isAdmin, setIsAdmin] = useState(false)
  const router = useRouter()
  const pathname = usePathname()
  const supabase = createClient()

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser()
        
        if (!user) {
          router.push('/login')
          return
        }

        // Check if user is admin
        if (!adminEmails.includes(user.email)) {
          router.push('/dashboard')
          return
        }

        setUser(user)
        setIsAdmin(true)
      } catch (error) {
        console.error('Auth check error:', error)
        router.push('/login')
      } finally {
        setLoading(false)
      }
    }

    checkAuth()
  }, [supabase, router])

  const handleSignOut = async () => {
    await supabase.auth.signOut()
    router.push('/')
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Spinner size="lg" />
      </div>
    )
  }

  if (!isAdmin) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="text-6xl mb-4">🚫</div>
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Access Denied</h2>
          <p className="text-gray-600 mb-6">You don't have permission to access the admin dashboard.</p>
          <Link href="/dashboard" className="text-red-600 hover:text-red-500">
            Go to Dashboard
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Admin Header */}
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <Link href="/admin" className="flex items-center">
                <span className="text-2xl font-bold text-red-600">🧠 Synapse</span>
                <span className="ml-2 px-2 py-1 bg-red-100 text-red-800 text-xs rounded-full font-medium">
                  ADMIN
                </span>
              </Link>
            </div>
            
            <div className="flex items-center space-x-4">
              <span className="text-sm text-gray-600">
                {user?.email}
              </span>
              <button
                onClick={handleSignOut}
                className="text-sm text-gray-500 hover:text-gray-700"
              >
                Sign Out
              </button>
            </div>
          </div>
        </div>
      </header>

      <div className="flex">
        {/* Sidebar */}
        <nav className="w-64 bg-white shadow-sm h-screen sticky top-0">
          <div className="p-4">
            <ul className="space-y-2">
              {navItems.map((item) => (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    className={`flex items-center px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                      pathname === item.href
                        ? 'bg-red-100 text-red-700'
                        : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
                    }`}
                  >
                    <span className="mr-3">{item.icon}</span>
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
          
          {/* Quick Stats */}
          <div className="p-4 border-t border-gray-200 mt-8">
            <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">
              Quick Stats
            </h3>
            <div className="space-y-2">
              <QuickStat label="Active Users" />
              <QuickStat label="Open Requests" />
              <QuickStat label="Pending Matches" />
            </div>
          </div>
        </nav>

        {/* Main Content */}
        <main className="flex-1 p-8">
          {children}
        </main>
      </div>
    </div>
  )
}

function QuickStat({ label }) {
  const [value, setValue] = useState('...')
  const supabase = createClient()

  useEffect(() => {
    const fetchStat = async () => {
      try {
        let query
        switch (label) {
          case 'Active Users':
            query = supabase.from('profiles').select('id', { count: 'exact' }).eq('profile_completed', true)
            break
          case 'Open Requests':
            query = supabase.from('requests').select('id', { count: 'exact' }).eq('status', 'pending')
            break
          case 'Pending Matches':
            query = supabase.from('matches').select('id', { count: 'exact' }).eq('status', 'notified')
            break
          default:
            return
        }
        
        const { count } = await query
        setValue(count || 0)
      } catch (error) {
        console.error(`Error fetching ${label}:`, error)
        setValue('Error')
      }
    }

    fetchStat()
  }, [label, supabase])

  return (
    <div className="text-sm">
      <div className="text-gray-500">{label}</div>
      <div className="font-semibold text-gray-900">{value}</div>
    </div>
  )
}
