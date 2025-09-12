'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'
import Button from '@/components/ui/Button'
import Spinner from '@/components/ui/Spinner'

export default function Dashboard() {
  const [user, setUser] = useState(null)
  const [profile, setProfile] = useState(null)
  const [requests, setRequests] = useState([])
  const [matches, setMatches] = useState([])
  const [loading, setLoading] = useState(true)
  const router = useRouter()
  const supabase = createClient()

  useEffect(() => {
    const loadData = async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser()
        if (!user) {
          router.push('/login')
          return
        }

        setUser(user)

        // Load profile
        const { data: profileData } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', user.id)
          .single()

        if (!profileData || !profileData.profile_completed) {
          router.push('/profile/setup')
          return
        }

        setProfile(profileData)

        // Load user's requests
        const { data: requestsData } = await supabase
          .from('requests')
          .select('*')
          .eq('requester_id', user.id)
          .order('created_at', { ascending: false })

        setRequests(requestsData || [])

        // Load user's matches
        const { data: matchesData } = await supabase
          .from('matches')
          .select(`
            *,
            requests!inner(*)
          `)
          .eq('matched_user_id', user.id)
          .order('created_at', { ascending: false })

        setMatches(matchesData || [])

      } catch (error) {
        console.error('Error loading dashboard:', error)
      } finally {
        setLoading(false)
      }
    }

    loadData()
  }, [supabase, router])

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    })
  }

  const getStatusColor = (status) => {
    const colors = {
      pending: 'bg-yellow-100 text-yellow-800',
      matched: 'bg-blue-100 text-blue-800',
      confirmed: 'bg-green-100 text-green-800',
      completed: 'bg-gray-100 text-gray-800',
      notified: 'bg-purple-100 text-purple-800',
      accepted: 'bg-green-100 text-green-800',
      declined: 'bg-red-100 text-red-800',
      expired: 'bg-gray-100 text-gray-800'
    }
    return colors[status] || 'bg-gray-100 text-gray-800'
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Spinner size="lg" />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">
            Welcome back, {profile?.name}!
          </h1>
          <p className="mt-2 text-gray-600">
            {profile?.faculty} • {profile?.program} • {profile?.year}
          </p>
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
          <Link href="/request">
            <div className="bg-white p-6 rounded-lg shadow hover:shadow-md transition-shadow cursor-pointer">
              <div className="flex items-center">
                <div className="p-3 bg-red-100 rounded-lg">
                  <span className="text-2xl">❓</span>
                </div>
                <div className="ml-4">
                  <h3 className="text-lg font-semibold text-gray-900">Make a Request</h3>
                  <p className="text-gray-600">Submit a new curiosity request</p>
                </div>
              </div>
            </div>
          </Link>

          <Link href="/profile">
            <div className="bg-white p-6 rounded-lg shadow hover:shadow-md transition-shadow cursor-pointer">
              <div className="flex items-center">
                <div className="p-3 bg-blue-100 rounded-lg">
                  <span className="text-2xl">👤</span>
                </div>
                <div className="ml-4">
                  <h3 className="text-lg font-semibold text-gray-900">Edit Profile</h3>
                  <p className="text-gray-600">Update your interests and info</p>
                </div>
              </div>
            </div>
          </Link>

          <div className="bg-white p-6 rounded-lg shadow">
            <div className="flex items-center">
              <div className="p-3 bg-green-100 rounded-lg">
                <span className="text-2xl">📊</span>
              </div>
              <div className="ml-4">
                <h3 className="text-lg font-semibold text-gray-900">Your Stats</h3>
                <p className="text-gray-600">
                  {requests.length} requests • {matches.length} matches
                </p>
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Your Requests */}
          <div className="bg-white rounded-lg shadow">
            <div className="p-6 border-b border-gray-200">
              <h2 className="text-xl font-semibold text-gray-900">Your Requests</h2>
            </div>
            <div className="p-6">
              {requests.length === 0 ? (
                <div className="text-center py-8">
                  <span className="text-4xl mb-4 block">💭</span>
                  <p className="text-gray-500 mb-4">No requests yet</p>
                  <Link href="/request">
                    <Button size="sm">Make Your First Request</Button>
                  </Link>
                </div>
              ) : (
                <div className="space-y-4">
                  {requests.slice(0, 3).map((request) => (
                    <div key={request.id} className="border-l-4 border-red-400 pl-4">
                      <div className="flex items-center justify-between mb-2">
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(request.status)}`}>
                          {request.status}
                        </span>
                        <span className="text-sm text-gray-500">
                          {formatDate(request.created_at)}
                        </span>
                      </div>
                      <p className="text-gray-900 text-sm line-clamp-2">
                        {request.request_text}
                      </p>
                    </div>
                  ))}
                  {requests.length > 3 && (
                    <Link href="/requests" className="text-red-600 hover:text-red-500 text-sm font-medium">
                      View all {requests.length} requests →
                    </Link>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* Match Requests */}
          <div className="bg-white rounded-lg shadow">
            <div className="p-6 border-b border-gray-200">
              <h2 className="text-xl font-semibold text-gray-900">Match Requests</h2>
            </div>
            <div className="p-6">
              {matches.length === 0 ? (
                <div className="text-center py-8">
                  <span className="text-4xl mb-4 block">🔗</span>
                  <p className="text-gray-500">No match requests yet</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {matches.slice(0, 3).map((match) => (
                    <div key={match.id} className="border-l-4 border-blue-400 pl-4">
                      <div className="flex items-center justify-between mb-2">
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(match.status)}`}>
                          {match.status}
                        </span>
                        <span className="text-sm text-gray-500">
                          {formatDate(match.created_at)}
                        </span>
                      </div>
                      <p className="text-gray-900 text-sm line-clamp-2">
                        {match.requests.request_text}
                      </p>
                      {match.status === 'notified' && (
                        <div className="mt-2 flex space-x-2">
                          <Button size="sm" variant="primary">Accept</Button>
                          <Button size="sm" variant="outline">Decline</Button>
                        </div>
                      )}
                    </div>
                  ))}
                  {matches.length > 3 && (
                    <Link href="/matches" className="text-red-600 hover:text-red-500 text-sm font-medium">
                      View all {matches.length} matches →
                    </Link>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Profile Preview */}
        <div className="mt-8 bg-white rounded-lg shadow">
          <div className="p-6 border-b border-gray-200">
            <h2 className="text-xl font-semibold text-gray-900">Your Profile</h2>
          </div>
          <div className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h3 className="text-sm font-medium text-gray-900 mb-2">Knowledge Tags</h3>
                <div className="flex flex-wrap gap-2">
                  {profile?.knowledgeTags?.slice(0, 5).map((tag, index) => (
                    <span key={index} className="px-2 py-1 bg-green-100 text-green-800 text-xs rounded-full">
                      {tag}
                    </span>
                  ))}
                  {profile?.knowledgeTags?.length > 5 && (
                    <span className="px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded-full">
                      +{profile.knowledgeTags.length - 5} more
                    </span>
                  )}
                </div>
              </div>
              <div>
                <h3 className="text-sm font-medium text-gray-900 mb-2">Curiosity Tags</h3>
                <div className="flex flex-wrap gap-2">
                  {profile?.curiosityTags?.slice(0, 5).map((tag, index) => (
                    <span key={index} className="px-2 py-1 bg-purple-100 text-purple-800 text-xs rounded-full">
                      {tag}
                    </span>
                  ))}
                  {profile?.curiosityTags?.length > 5 && (
                    <span className="px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded-full">
                      +{profile.curiosityTags.length - 5} more
                    </span>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
