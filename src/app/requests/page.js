'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'
import Button from '@/components/ui/Button'
import Spinner from '@/components/ui/Spinner'

export default function RequestsList() {
  const [user, setUser] = useState(null)
  const [requests, setRequests] = useState([])
  const [loading, setLoading] = useState(true)
  const [retryLoading, setRetryLoading] = useState({})
  const [deleteLoading, setDeleteLoading] = useState({})
  const [retryCooldowns, setRetryCooldowns] = useState({})
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

        // Check retry cooldowns from localStorage
        const cooldowns = {}
        const now = Date.now()
        const cooldownMs = 60000 // 1 minute

        // Clean up old cooldowns and set active ones
        Object.keys(localStorage).forEach(key => {
          if (key.startsWith('retry_')) {
            const requestId = key.replace('retry_', '')
            const lastRetryTime = parseInt(localStorage.getItem(key))
            const remainingTime = cooldownMs - (now - lastRetryTime)

            if (remainingTime > 0) {
              cooldowns[requestId] = Math.ceil(remainingTime / 1000)
            } else {
              localStorage.removeItem(key) // Clean up expired cooldowns
            }
          }
        })
        setRetryCooldowns(cooldowns)

        // Load user's requests with match information
        const { data: requestsData, error } = await supabase
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

        if (error) {
          console.error('Error loading requests:', error)
        } else {
          setRequests(requestsData || [])
        }
      } catch (error) {
        console.error('Error loading requests:', error)
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
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  const getStatusColor = (status) => {
    const colors = {
      pending: 'bg-yellow-900/30 text-yellow-200 border border-yellow-500/30',
      matched: 'bg-blue-900/30 text-blue-200 border border-blue-500/30',
      confirmed: 'bg-green-900/30 text-green-200 border border-green-500/30',
      completed: 'bg-slate-900/40 text-gray-200 border border-gray-500/30'
    }
    return colors[status] || 'bg-slate-900/40 text-gray-200 border border-gray-500/30'
  }

  const getStatusDescription = (request) => {
    // Check if all matches are declined
    const hasActiveMatches = request.matches && request.matches.some(match =>
      match.status !== 'declined' && match.status !== 'expired'
    )

    // Override status based on actual match states
    let effectiveStatus = request.status
    if (request.status === 'matched' && !hasActiveMatches) {
      effectiveStatus = 'pending'
    }

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

  const handleRetryRequest = async (requestId) => {
    // Check if user has retried this request recently (prevent spam)
    const lastRetryKey = `retry_${requestId}`
    const lastRetryTime = localStorage.getItem(lastRetryKey)
    const now = Date.now()
    const cooldownMs = 60000 // 1 minute cooldown

    if (lastRetryTime && (now - parseInt(lastRetryTime)) < cooldownMs) {
      const remainingSeconds = Math.ceil((cooldownMs - (now - parseInt(lastRetryTime))) / 1000)
      alert(`Please wait ${remainingSeconds} seconds before retrying this request again.`)
      return
    }

    setRetryLoading(prev => ({ ...prev, [requestId]: true }))

    try {
      const response = await fetch('/api/retry-matching', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          requestId,
          trigger: 'manual_retry'
        }),
      })

      const result = await response.json()

      if (result.success) {
        // Store the retry timestamp
        localStorage.setItem(lastRetryKey, now.toString())

        // Refresh the requests data to show the new match
        window.location.reload()
      } else {
        alert(result.error || 'No new matches found. Try updating your profile or check back later.')
      }
    } catch (error) {
      console.error('Retry request error:', error)
      alert('Failed to retry matching. Please try again.')
    } finally {
      setRetryLoading(prev => ({ ...prev, [requestId]: false }))
    }
  }

  const handleFixAllStatuses = async () => {
    setLoading(true)

    try {
      const response = await fetch('/api/fix-request-status', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({}), // Fix all requests for this user
      })

      const result = await response.json()

      if (result.success) {
        // Refresh the page to show updated statuses
        window.location.reload()
      } else {
        alert(result.error || 'Failed to fix request statuses.')
      }
    } catch (error) {
      console.error('Fix status error:', error)
      alert('Failed to fix request statuses. Please try again.')
    } finally {
      setLoading(false)
    }
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
    // Can delete if no active matches (accepted, pending, or notified)
    const hasActiveMatches = request.matches && request.matches.some(match =>
      match.status === 'accepted' || match.status === 'pending' || match.status === 'notified'
    )
    return !hasActiveMatches
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
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_70%,rgba(120,119,198,0.2),rgba(255,255,255,0))]"></div>
        <div className="absolute top-20 left-20 w-32 h-32 bg-purple-500/10 rounded-full blur-xl animate-pulse"></div>
        <div className="absolute bottom-32 right-32 w-40 h-40 bg-pink-500/10 rounded-full blur-xl animate-pulse delay-500"></div>
      </div>

      <div className="relative z-10 py-8">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="mb-8">
            <div className="flex items-center mb-4">
              <div className="text-4xl animate-pulse mr-4">⚡</div>
              <div>
                <h1 className="text-3xl font-bold text-white">
                  Your <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-400">Neural Requests</span>
                </h1>
                <p className="mt-2 text-gray-300">
                  Monitor your curiosity sparks and their synaptic connections.
                </p>
              </div>
            </div>
          </div>

          <div className="flex justify-between items-center mb-6">
            <div className="text-sm text-purple-400">
              {requests.length} neural pathway{requests.length !== 1 ? 's' : ''} active
            </div>
            <div className="flex space-x-3">
              <Button
                variant="outline"
                size="sm"
                onClick={handleFixAllStatuses}
                disabled={loading}
                className="border-purple-500/50 text-purple-400 hover:bg-purple-600/20 hover:text-purple-300"
              >
                Sync Neural State
              </Button>
              <Link href="/request">
                <Button className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white">
                  ⚡ Spark New Request
                </Button>
              </Link>
            </div>
          </div>

          {requests.length === 0 ? (
            <div className="bg-slate-800/80 backdrop-blur-sm rounded-2xl p-8 text-center border border-purple-500/20 shadow-2xl">
              <div className="text-6xl mb-4">💭</div>
              <h3 className="text-lg font-medium text-white mb-2">No requests yet</h3>
              <p className="text-gray-300 mb-6">
                Start your learning journey by submitting your first curiosity request.
              </p>
              <Link href="/request">
                <Button className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white">Submit Your First Request</Button>
              </Link>
            </div>
          ) : (
            <div className="space-y-6">
              {requests.map((request) => (
                <div key={request.id} className="bg-slate-800/80 backdrop-blur-sm rounded-2xl p-6 border border-purple-500/20 shadow-2xl">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex-1">
                      <div className="flex items-center mb-2">
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(getEffectiveStatus(request))}`}>
                          {getEffectiveStatus(request)}
                        </span>
                        <span className="ml-3 text-sm text-gray-300">
                          {formatDate(request.created_at)}
                        </span>
                      </div>
                      <p className="text-gray-300 text-sm mb-3">
                        {getStatusDescription(request)}
                      </p>
                    </div>

                    {canDeleteRequest(request) && (
                      <div className="ml-4">
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => handleDeleteRequest(request.id)}
                          disabled={deleteLoading[request.id]}
                          className="text-red-600 hover:text-red-700 hover:bg-red-50"
                        >
                          {deleteLoading[request.id] ? (
                            <div className="flex items-center">
                              <Spinner size="sm" className="mr-1" />
                              Deleting...
                            </div>
                          ) : (
                            '🗑️ Delete'
                          )}
                        </Button>
                      </div>
                    )}
                  </div>

                  <div className="mb-4">
                    <h3 className="text-lg font-medium text-white mb-2">Your Question:</h3>
                    <div className="bg-slate-900/40 border border-purple-500/20 p-4 rounded-lg">
                      <p className="text-gray-200">{request.request_text}</p>
                    </div>
                  </div>

                  {request.matches && request.matches.length > 0 && (
                    <div className="border-t pt-4">
                      <h4 className="text-md font-medium text-white mb-3">Match Information:</h4>
                      {request.matches.map((match) => (
                        <div key={match.id} className="bg-slate-900/40 border border-blue-500/20 p-4 rounded-lg mb-3">
                          <div className="flex items-center justify-between mb-2">
                            <div className="flex items-center">
                              <span className="font-medium text-blue-300">
                                {match.profiles?.name || 'Anonymous Student'}
                              </span>
                              <span className="ml-2 text-sm text-blue-300">
                                ({match.profiles?.faculty})
                              </span>
                            </div>
                            <span className={`px-2 py-1 rounded-full text-xs font-medium ${match.status === 'accepted' ? 'bg-green-100 text-green-800' :
                              match.status === 'declined' ? 'bg-red-100 text-red-800' :
                                'bg-yellow-100 text-yellow-800'
                              }`}>
                              {match.status}
                            </span>
                          </div>
                          <div className="text-sm text-blue-300">
                            <p>Program: {match.profiles?.program}</p>
                            <p>Match Score: {match.match_score} points</p>
                            <p>Matched: {formatDate(match.created_at)}</p>
                          </div>
                          {match.status === 'accepted' && (
                            <div className="mt-2 p-2 bg-green-900/20 border border-green-500/30 rounded text-sm text-green-200">
                              ✅ This student has accepted your request! Check your email for connection details.
                            </div>
                          )}
                          {match.status === 'declined' && (
                            <div className="mt-2 p-2 bg-red-900/20 border border-red-500/30 rounded text-sm text-red-200">
                              ❌ This student declined your request. We'll keep looking for other matches.
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  )}

                  {getEffectiveStatus(request) === 'pending' && (
                    <div className="border-t pt-4">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center text-sm text-gray-300">
                          <Spinner size="sm" className="mr-2" />
                          Our algorithm is searching for the perfect match for your curiosity...
                        </div>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleRetryRequest(request.id)}
                          disabled={retryLoading[request.id] || retryCooldowns[request.id]}
                          className="text-xs border-purple-500/50 text-purple-400 hover:bg-purple-600/20 hover:text-purple-300"
                        >
                          {retryLoading[request.id]
                            ? 'Retrying...'
                            : retryCooldowns[request.id]
                              ? `Wait ${retryCooldowns[request.id]}s`
                              : 'Retry Matching'
                          }
                        </Button>
                      </div>
                    </div>
                  )}

                </div>
              ))}
            </div>
          )}

          <div className="mt-8 text-center">
            <Link href="/dashboard">
              <Button variant="outline" className="border-purple-500/50 text-purple-400 hover:bg-purple-600/20 hover:text-purple-300">Back to Neural Hub</Button>
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}
