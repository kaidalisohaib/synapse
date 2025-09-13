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
  const [actionLoading, setActionLoading] = useState({})
  const [deleteLoading, setDeleteLoading] = useState({})
  const [expandedItems, setExpandedItems] = useState({})
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

        // Check if email is verified
        if (!user.email_confirmed_at) {
          router.push(`/auth/resend?email=${encodeURIComponent(user.email)}`)
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

        // Load user's requests with match information
        const { data: requestsData } = await supabase
          .from('requests')
          .select(`
            *,
            matches (
              id,
              matched_user_id,
              status,
              match_score,
              created_at,
              profiles!matches_matched_user_id_fkey (
                name,
                faculty,
                program
              )
            )
          `)
          .eq('requester_id', user.id)
          .order('created_at', { ascending: false })

        setRequests(requestsData || [])

        // Load user's matches (both as requester and as matched user)
        const { data: matchesAsMatchedUser } = await supabase
          .from('matches')
          .select(`
            *,
            requests!inner(
              *,
              profiles!requests_requester_id_fkey(name, faculty, program, year)
            ),
            profiles!matches_matched_user_id_fkey(name, faculty, program)
          `)
          .eq('matched_user_id', user.id)
          .order('created_at', { ascending: false })

        const { data: matchesAsRequester } = await supabase
          .from('matches')
          .select(`
            *,
            requests!inner(
              *,
              profiles!requests_requester_id_fkey(name, faculty, program, year)
            ),
            profiles!matches_matched_user_id_fkey(name, faculty, program)
          `)
          .eq('requests.requester_id', user.id)
          .order('created_at', { ascending: false })

        // Combine and deduplicate matches
        const allMatches = [
          ...(matchesAsMatchedUser || []).map(match => ({ ...match, userRole: 'matched' })),
          ...(matchesAsRequester || []).map(match => ({ ...match, userRole: 'requester' }))
        ]

        setMatches(allMatches)

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

  const handleDeclineMatch = async (matchId) => {
    setActionLoading(prev => ({ ...prev, [matchId]: true }))

    try {
      const response = await fetch('/api/confirm-match', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          matchId,
          action: 'decline'
        }),
      })

      const result = await response.json()

      if (response.ok) {
        // Update the match status locally
        setMatches(prev => prev.map(match =>
          match.id === matchId
            ? { ...match, status: 'declined' }
            : match
        ))

        // Refresh the data to get updated request statuses
        setTimeout(() => {
          window.location.reload()
        }, 1000)
      } else {
        alert(result.error || 'Failed to decline match. Please try again.')
      }
    } catch (error) {
      console.error('Decline match error:', error)
      alert('An error occurred. Please try again.')
    } finally {
      setActionLoading(prev => ({ ...prev, [matchId]: false }))
    }
  }

  const toggleExpanded = (type, id) => {
    const key = `${type}-${id}`
    setExpandedItems(prev => ({
      ...prev,
      [key]: !prev[key]
    }))
  }

  const getEffectiveStatus = (request) => {
    // Check if all matches are declined
    const hasActiveMatches = request.matches && request.matches.some(match =>
      match.status !== 'declined' && match.status !== 'expired'
    )

    // Override status based on actual match states
    if (request.status === 'matched' && !hasActiveMatches) {
      return 'pending'
    }

    return request.status
  }

  const handleDeleteRequest = async (requestId) => {
    if (!confirm('Are you sure you want to delete this request? This action cannot be undone.')) {
      return
    }

    setDeleteLoading(prev => ({ ...prev, [requestId]: true }))

    try {
      const response = await fetch(`/api/delete-request?id=${requestId}`, {
        method: 'DELETE',
      })

      const result = await response.json()

      if (result.success) {
        // Remove the request from local state
        setRequests(prev => prev.filter(req => req.id !== requestId))
      } else {
        alert(result.error || 'Failed to delete request. Please try again.')
      }
    } catch (error) {
      console.error('Delete request error:', error)
      alert('Failed to delete request. Please try again.')
    } finally {
      setDeleteLoading(prev => ({ ...prev, [requestId]: false }))
    }
  }

  const canDeleteRequest = (request) => {
    // Can delete if no accepted matches
    const hasAcceptedMatches = request.matches && request.matches.some(match =>
      match.status === 'accepted'
    )
    return !hasAcceptedMatches
  }

  const getStatusDescription = (request) => {
    const effectiveStatus = getEffectiveStatus(request)

    switch (effectiveStatus) {
      case 'pending':
        return 'Looking for a match...'
      case 'matched':
        return 'Match found! Waiting for confirmation.'
      case 'confirmed':
        return 'Match confirmed! You should have received connection details.'
      case 'completed':
        return 'Conversation completed.'
      default:
        return 'Unknown status'
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Spinner size="lg" />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
      {/* Animated background */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_80%,rgba(120,119,198,0.2),rgba(255,255,255,0))]"></div>
        <div className="absolute top-20 left-20 w-32 h-32 bg-purple-500/10 rounded-full blur-xl animate-pulse"></div>
        <div className="absolute top-40 right-32 w-24 h-24 bg-pink-500/10 rounded-full blur-xl animate-pulse delay-300"></div>
        <div className="absolute bottom-32 left-1/4 w-40 h-40 bg-purple-500/10 rounded-full blur-xl animate-pulse delay-700"></div>
      </div>

      <div className="relative z-10 py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Header */}
          <div className="mb-8">
            <div className="flex items-center mb-4">
              <div className="text-4xl animate-pulse mr-4">🧠</div>
              <div>
                <h1 className="text-3xl font-bold text-white">
                  Welcome back, <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-400">{profile?.name}</span>!
                </h1>
                <p className="mt-2 text-gray-300">
                  <span className="text-purple-400">{profile?.faculty}</span> • <span className="text-pink-400">{profile?.program}</span> • <span className="text-purple-400">{profile?.year}</span>
                </p>
              </div>
            </div>
          </div>

          {/* Neural Action Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
            <Link href="/request">
              <div className="group bg-gradient-to-br from-slate-800/80 to-slate-900/80 backdrop-blur-sm p-6 rounded-2xl border border-purple-500/20 shadow-xl hover:shadow-purple-500/25 transition-all duration-300 cursor-pointer hover:scale-105">
                <div className="flex items-center">
                  <div className="p-4 bg-gradient-to-br from-purple-500 to-pink-500 rounded-xl shadow-lg group-hover:shadow-purple-500/50 transition-all duration-300">
                    <span className="text-2xl">⚡</span>
                  </div>
                  <div className="ml-4">
                    <h3 className="text-lg font-semibold text-white group-hover:text-purple-400 transition-colors duration-300">
                      Spark Curiosity
                    </h3>
                    <p className="text-gray-300 group-hover:text-gray-200 transition-colors duration-300">
                      Ignite a new neural pathway
                    </p>
                  </div>
                </div>
              </div>
            </Link>

            <Link href="/profile">
              <div className="group bg-gradient-to-br from-slate-800/80 to-slate-900/80 backdrop-blur-sm p-6 rounded-2xl border border-pink-500/20 shadow-xl hover:shadow-pink-500/25 transition-all duration-300 cursor-pointer hover:scale-105">
                <div className="flex items-center">
                  <div className="p-4 bg-gradient-to-br from-pink-500 to-purple-500 rounded-xl shadow-lg group-hover:shadow-pink-500/50 transition-all duration-300">
                    <span className="text-2xl">🔮</span>
                  </div>
                  <div className="ml-4">
                    <h3 className="text-lg font-semibold text-white group-hover:text-pink-400 transition-colors duration-300">
                      Neural Profile
                    </h3>
                    <p className="text-gray-300 group-hover:text-gray-200 transition-colors duration-300">
                      Enhance your synaptic signature
                    </p>
                  </div>
                </div>
              </div>
            </Link>

            <div className="bg-slate-800/80 backdrop-blur-sm p-6 rounded-2xl border border-purple-500/20 shadow-xl">
              <div className="flex items-center">
                <div className="p-3 bg-gradient-to-br from-green-500 to-teal-500 rounded-xl shadow-lg">
                  <span className="text-2xl">📊</span>
                </div>
                <div className="ml-4">
                  <h3 className="text-lg font-semibold text-white">Your Stats</h3>
                  <p className="text-gray-300">
                    {requests.length} requests • {matches.length} matches
                  </p>
                </div>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Your Requests */}
            <div className="bg-slate-800/80 backdrop-blur-sm rounded-2xl border border-purple-500/20 shadow-xl">
              <div className="p-6 border-b border-purple-500/20">
                <h2 className="text-xl font-semibold text-white">Your Neural Requests</h2>
              </div>
              <div className="p-6">
                {requests.length === 0 ? (
                  <div className="text-center py-8">
                    <span className="text-4xl mb-4 block">💭</span>
                    <p className="text-gray-300 mb-4">No requests yet</p>
                    <Link href="/request">
                      <Button size="sm" className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white">Spark Your First Request</Button>
                    </Link>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {requests.slice(0, 3).map((request) => {
                      const isExpanded = expandedItems[`request-${request.id}`]
                      return (
                        <div
                          key={request.id}
                          className="border-l-4 border-pink-500/50 pl-4 cursor-pointer hover:bg-slate-900/30 p-2 rounded transition-colors"
                          onClick={() => toggleExpanded('request', request.id)}
                        >
                          <div className="flex items-center justify-between mb-2">
                            <div className="flex items-center space-x-2">
                              <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(getEffectiveStatus(request))}`}>
                                {getEffectiveStatus(request)}
                              </span>
                              <span className="text-xs text-gray-300">
                                {isExpanded ? '▼' : '▶'} Click for details
                              </span>
                            </div>
                            <span className="text-sm text-gray-300">
                              {formatDate(request.created_at)}
                            </span>
                          </div>
                          <p className={`text-gray-200 text-sm ${isExpanded ? '' : 'line-clamp-2'}`}>
                            {request.request_text}
                          </p>
                          {isExpanded && (
                            <div className="mt-3 pt-3 border-t border-purple-500/20">
                              <div className="flex justify-between items-center">
                                <Link
                                  href="/requests"
                                  className="text-pink-400 hover:text-pink-300 text-sm font-medium"
                                  onClick={(e) => e.stopPropagation()}
                                >
                                  View Full Details →
                                </Link>
                                <div className="text-xs text-gray-300 mt-1">
                                  {getStatusDescription(request)}
                                  {request.matches && request.matches.some(match => match.status === 'declined') && (
                                    <div className="text-xs text-orange-300 mt-1">
                                      ⚠️ Some matches were declined - looking for new ones
                                    </div>
                                  )}
                                </div>
                              </div>
                            </div>
                          )}
                        </div>
                      )
                    })}
                    {requests.length > 3 && (
                      <Link href="/requests" className="text-pink-400 hover:text-pink-300 text-sm font-medium">
                        View all {requests.length} requests →
                      </Link>
                    )}
                  </div>
                )}
              </div>
            </div>

            {/* Your Matches */}
            <div className="bg-slate-800/80 backdrop-blur-sm rounded-2xl border border-purple-500/20 shadow-xl">
              <div className="p-6 border-b border-purple-500/20">
                <h2 className="text-xl font-semibold text-white">Your Neural Matches</h2>
              </div>
              <div className="p-6">
                {matches.length === 0 ? (
                  <div className="text-center py-8">
                    <span className="text-4xl mb-4 block">🔗</span>
                    <p className="text-gray-300">No matches yet</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {matches.slice(0, 3).map((match) => {
                      const isExpanded = expandedItems[`match-${match.id}`]
                      return (
                        <div
                          key={match.id}
                          className={`border-l-4 pl-4 cursor-pointer hover:bg-slate-900/30 p-2 rounded transition-colors ${match.userRole === 'requester' ? 'border-green-400/60' : 'border-blue-400/60'
                            }`}
                          onClick={() => toggleExpanded('match', match.id)}
                        >
                          <div className="flex items-center justify-between mb-2">
                            <div className="flex items-center space-x-2">
                              <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(match.status)}`}>
                                {match.status}
                              </span>
                              <span className={`px-2 py-1 rounded-full text-xs font-medium ${match.userRole === 'requester'
                                  ? 'bg-green-900/30 text-green-200 border border-green-500/30'
                                  : 'bg-blue-900/30 text-blue-200 border border-blue-500/30'
                                }`}>
                                {match.userRole === 'requester' ? 'Your Request' : 'Match Request'}
                              </span>
                              <span className="text-xs text-gray-300">
                                {isExpanded ? '▼' : '▶'} Click for details
                              </span>
                            </div>
                            <span className="text-sm text-gray-300">
                              {formatDate(match.created_at)}
                            </span>
                          </div>

                          {match.userRole === 'requester' ? (
                            <div>
                              <p className={`text-gray-200 text-sm mb-1 ${isExpanded ? '' : 'line-clamp-2'}`}>
                                {match.requests.request_text}
                              </p>
                              <p className="text-xs text-gray-300">
                                Matched with: {match.profiles?.name || 'Unknown'}
                              </p>
                              {isExpanded && (
                                <div className="mt-3 pt-3 border-t border-purple-500/20">
                                  <div className="text-sm text-gray-300 space-y-1">
                                    <p><strong>Match Score:</strong> {match.match_score || 'N/A'} points</p>
                                    <p><strong>Faculty:</strong> {match.profiles?.faculty || 'Unknown'}</p>
                                    <p><strong>Program:</strong> {match.profiles?.program || 'Unknown'}</p>
                                  </div>
                                  <Link
                                    href="/requests"
                                    className="inline-block mt-2 text-pink-400 hover:text-pink-300 text-sm font-medium"
                                    onClick={(e) => e.stopPropagation()}
                                  >
                                    View Full Details →
                                  </Link>
                                </div>
                              )}
                            </div>
                          ) : (
                            <div>
                              <p className={`text-gray-200 text-sm ${isExpanded ? '' : 'line-clamp-2'}`}>
                                {match.requests.request_text}
                              </p>
                              {isExpanded && (
                                <div className="mt-3 pt-3 border-t border-purple-500/20">
                                  <div className="text-sm text-gray-300 space-y-1">
                                    <p><strong>Match Score:</strong> {match.match_score || 'N/A'} points</p>
                                    <p><strong>Requester:</strong> {match.requests?.profiles?.name || 'Unknown'}</p>
                                    <p><strong>Faculty:</strong> {match.requests?.profiles?.faculty || 'Unknown'}</p>
                                    <p><strong>Program:</strong> {match.requests?.profiles?.program || 'Unknown'}</p>
                                  </div>
                                  <Link
                                    href="/matches"
                                    className="inline-block mt-2 text-pink-400 hover:text-pink-300 text-sm font-medium"
                                    onClick={(e) => e.stopPropagation()}
                                  >
                                    View Full Details →
                                  </Link>
                                </div>
                              )}
                              {match.status === 'notified' && (
                                <div className="mt-2 flex space-x-2" onClick={(e) => e.stopPropagation()}>
                                  <Link href={`/match/${match.id}/accept`}>
                                    <Button size="sm" className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white">Accept</Button>
                                  </Link>
                                  <Button
                                    size="sm"
                                    variant="outline"
                                    onClick={(e) => {
                                      e.stopPropagation()
                                      handleDeclineMatch(match.id)
                                    }}
                                    disabled={actionLoading[match.id]}
                                    className="border-purple-500/50 text-purple-400 hover:bg-purple-600/20 hover:text-purple-300"
                                  >
                                    {actionLoading[match.id] ? 'Declining...' : 'Decline'}
                                  </Button>
                                </div>
                              )}
                            </div>
                          )}
                        </div>
                      )
                    })}
                    {matches.length > 3 && (
                      <Link href="/matches" className="text-pink-400 hover:text-pink-300 text-sm font-medium">
                        View all {matches.length} matches →
                      </Link>
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Profile Preview */}
          <div className="mt-8 bg-slate-800/80 backdrop-blur-sm rounded-2xl border border-purple-500/20 shadow-xl">
            <div className="p-6 border-b border-purple-500/20">
              <h2 className="text-xl font-semibold text-white">Your Neural Profile</h2>
            </div>
            <div className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h3 className="text-sm font-medium text-white mb-2">Knowledge Tags</h3>
                  <div className="flex flex-wrap gap-2">
                    {profile?.knowledgeTags?.slice(0, 5).map((tag, index) => (
                      <span key={index} className="px-2 py-1 bg-green-900/30 text-green-200 border border-green-500/30 text-xs rounded-full">
                        {tag}
                      </span>
                    ))}
                    {profile?.knowledgeTags?.length > 5 && (
                      <span className="px-2 py-1 bg-slate-900/40 text-gray-300 border border-purple-500/20 text-xs rounded-full">
                        +{profile.knowledgeTags.length - 5} more
                      </span>
                    )}
                  </div>
                </div>
                <div>
                  <h3 className="text-sm font-medium text-white mb-2">Curiosity Tags</h3>
                  <div className="flex flex-wrap gap-2">
                    {profile?.curiosityTags?.slice(0, 5).map((tag, index) => (
                      <span key={index} className="px-2 py-1 bg-purple-900/30 text-purple-200 border border-purple-500/30 text-xs rounded-full">
                        {tag}
                      </span>
                    ))}
                    {profile?.curiosityTags?.length > 5 && (
                      <span className="px-2 py-1 bg-slate-900/40 text-gray-300 border border-purple-500/20 text-xs rounded-full">
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
    </div>
  )
}
