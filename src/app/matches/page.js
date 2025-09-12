'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'
import Button from '@/components/ui/Button'
import Spinner from '@/components/ui/Spinner'

export default function MatchesList() {
  const [user, setUser] = useState(null)
  const [matches, setMatches] = useState([])
  const [loading, setLoading] = useState(true)
  const [actionLoading, setActionLoading] = useState({})
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

        // Load matches where this user is the matched person
        const { data: matchesData, error } = await supabase
          .from('matches')
          .select(`
            *,
            requests!inner (
              id,
              request_text,
              requester_id,
              created_at,
              profiles!requests_requester_id_fkey (
                name,
                faculty,
                program,
                year
              )
            )
          `)
          .eq('matched_user_id', user.id)
          .order('created_at', { ascending: false })

        if (error) {
          console.error('Error loading matches:', error)
        } else {
          setMatches(matchesData || [])
        }
      } catch (error) {
        console.error('Error loading matches:', error)
      } finally {
        setLoading(false)
      }
    }

    loadData()
  }, [supabase, router])

  const handleMatchAction = async (matchId, action) => {
    setActionLoading(prev => ({ ...prev, [matchId]: true }))

    try {
      const { error } = await supabase
        .from('matches')
        .update({ 
          status: action,
          updated_at: new Date().toISOString()
        })
        .eq('id', matchId)

      if (error) {
        console.error(`Error ${action} match:`, error)
        alert(`Failed to ${action} match. Please try again.`)
      } else {
        // Update local state
        setMatches(prev => prev.map(match => 
          match.id === matchId 
            ? { ...match, status: action }
            : match
        ))

        // If accepted, trigger connection email
        if (action === 'accepted') {
          await triggerConnectionEmail(matchId)
        }
      }
    } catch (error) {
      console.error(`Error ${action} match:`, error)
      alert(`Failed to ${action} match. Please try again.`)
    } finally {
      setActionLoading(prev => ({ ...prev, [matchId]: false }))
    }
  }

  const triggerConnectionEmail = async (matchId) => {
    try {
      const response = await fetch('/api/send-connection-email', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ matchId }),
      })

      if (!response.ok) {
        console.error('Connection email API error:', response.statusText)
      }
    } catch (error) {
      console.error('Connection email trigger error:', error)
    }
  }

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
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Match Requests</h1>
          <p className="mt-2 text-gray-600">
            Students who are curious about topics you know well.
          </p>
        </div>

        <div className="mb-6">
          <div className="text-sm text-gray-500">
            {matches.length} total match{matches.length !== 1 ? 'es' : ''}
          </div>
        </div>

        {matches.length === 0 ? (
          <div className="bg-white rounded-lg shadow p-8 text-center">
            <div className="text-6xl mb-4">🔗</div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">No match requests yet</h3>
            <p className="text-gray-500 mb-6">
              When someone has a question that matches your knowledge areas, you'll see their requests here.
            </p>
            <Link href="/profile">
              <Button variant="outline" className="mr-4">
                Update Your Knowledge Tags
              </Button>
            </Link>
            <Link href="/dashboard">
              <Button>Back to Dashboard</Button>
            </Link>
          </div>
        ) : (
          <div className="space-y-6">
            {matches.map((match) => (
              <div key={match.id} className="bg-white rounded-lg shadow p-6">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    <div className="flex items-center mb-2">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(match.status)}`}>
                        {match.status}
                      </span>
                      <span className="ml-3 text-sm text-gray-500">
                        Matched: {formatDate(match.created_at)}
                      </span>
                      <span className="ml-3 text-sm text-gray-500">
                        Score: {match.match_score} points
                      </span>
                    </div>
                  </div>
                </div>

                <div className="mb-4">
                  <div className="flex items-center mb-3">
                    <h3 className="text-lg font-medium text-gray-900">
                      Request from {match.requests.profiles?.name || 'Anonymous Student'}
                    </h3>
                    <span className="ml-2 text-sm text-gray-500">
                      ({match.requests.profiles?.faculty}, {match.requests.profiles?.year})
                    </span>
                  </div>
                  <p className="text-sm text-gray-600 mb-3">
                    Program: {match.requests.profiles?.program}
                  </p>
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <h4 className="font-medium text-gray-900 mb-2">Their Question:</h4>
                    <p className="text-gray-800">{match.requests.request_text}</p>
                  </div>
                </div>

                <div className="mb-4">
                  <p className="text-sm text-gray-600">
                    Submitted: {formatDate(match.requests.created_at)}
                  </p>
                </div>

                {match.status === 'notified' && (
                  <div className="border-t pt-4">
                    <div className="bg-yellow-50 p-4 rounded-lg mb-4">
                      <h4 className="font-medium text-yellow-800 mb-2">Action Required:</h4>
                      <p className="text-sm text-yellow-700 mb-4">
                        This student is curious about something you might know about. Would you like to help them learn?
                      </p>
                      <div className="flex space-x-3">
                        <Button
                          onClick={() => handleMatchAction(match.id, 'accepted')}
                          disabled={actionLoading[match.id]}
                          size="sm"
                        >
                          {actionLoading[match.id] ? (
                            <div className="flex items-center">
                              <Spinner size="sm" className="mr-1" />
                              Accepting...
                            </div>
                          ) : (
                            'Accept & Connect'
                          )}
                        </Button>
                        
                        <Button
                          variant="outline"
                          onClick={() => handleMatchAction(match.id, 'declined')}
                          disabled={actionLoading[match.id]}
                          size="sm"
                        >
                          Decline
                        </Button>
                      </div>
                    </div>
                  </div>
                )}

                {match.status === 'accepted' && (
                  <div className="border-t pt-4">
                    <div className="bg-green-50 p-4 rounded-lg">
                      <div className="flex items-center">
                        <span className="text-green-500 text-lg mr-2">✅</span>
                        <div>
                          <h4 className="font-medium text-green-800">Connection Established!</h4>
                          <p className="text-sm text-green-700">
                            You've accepted this request. Both you and the requester should have received an email with connection details.
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {match.status === 'declined' && (
                  <div className="border-t pt-4">
                    <div className="bg-red-50 p-4 rounded-lg">
                      <div className="flex items-center">
                        <span className="text-red-500 text-lg mr-2">❌</span>
                        <div>
                          <h4 className="font-medium text-red-800">Request Declined</h4>
                          <p className="text-sm text-red-700">
                            You declined this request. The system will look for other matches for this student.
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {match.status === 'expired' && (
                  <div className="border-t pt-4">
                    <div className="bg-gray-50 p-4 rounded-lg">
                      <div className="flex items-center">
                        <span className="text-gray-500 text-lg mr-2">⏰</span>
                        <div>
                          <h4 className="font-medium text-gray-800">Request Expired</h4>
                          <p className="text-sm text-gray-700">
                            This match request has expired. The system will look for other matches for this student.
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}

        <div className="mt-8 text-center">
          <Link href="/dashboard">
            <Button variant="outline">Back to Dashboard</Button>
          </Link>
        </div>
      </div>
    </div>
  )
}
