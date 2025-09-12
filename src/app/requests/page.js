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
      pending: 'bg-yellow-100 text-yellow-800',
      matched: 'bg-blue-100 text-blue-800',
      confirmed: 'bg-green-100 text-green-800',
      completed: 'bg-gray-100 text-gray-800'
    }
    return colors[status] || 'bg-gray-100 text-gray-800'
  }

  const getStatusDescription = (request) => {
    switch (request.status) {
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
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Your Requests</h1>
          <p className="mt-2 text-gray-600">
            Track all your curiosity requests and their matching status.
          </p>
        </div>

        <div className="flex justify-between items-center mb-6">
          <div className="text-sm text-gray-500">
            {requests.length} total request{requests.length !== 1 ? 's' : ''}
          </div>
          <Link href="/request">
            <Button>Submit New Request</Button>
          </Link>
        </div>

        {requests.length === 0 ? (
          <div className="bg-white rounded-lg shadow p-8 text-center">
            <div className="text-6xl mb-4">💭</div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">No requests yet</h3>
            <p className="text-gray-500 mb-6">
              Start your learning journey by submitting your first curiosity request.
            </p>
            <Link href="/request">
              <Button>Submit Your First Request</Button>
            </Link>
          </div>
        ) : (
          <div className="space-y-6">
            {requests.map((request) => (
              <div key={request.id} className="bg-white rounded-lg shadow p-6">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    <div className="flex items-center mb-2">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(request.status)}`}>
                        {request.status}
                      </span>
                      <span className="ml-3 text-sm text-gray-500">
                        {formatDate(request.created_at)}
                      </span>
                    </div>
                    <p className="text-gray-600 text-sm mb-3">
                      {getStatusDescription(request)}
                    </p>
                  </div>
                </div>

                <div className="mb-4">
                  <h3 className="text-lg font-medium text-gray-900 mb-2">Your Question:</h3>
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <p className="text-gray-800">{request.request_text}</p>
                  </div>
                </div>

                {request.matches && request.matches.length > 0 && (
                  <div className="border-t pt-4">
                    <h4 className="text-md font-medium text-gray-900 mb-3">Match Information:</h4>
                    {request.matches.map((match) => (
                      <div key={match.id} className="bg-blue-50 p-4 rounded-lg mb-3">
                        <div className="flex items-center justify-between mb-2">
                          <div className="flex items-center">
                            <span className="font-medium text-blue-900">
                              {match.profiles?.name || 'Anonymous Student'}
                            </span>
                            <span className="ml-2 text-sm text-blue-700">
                              ({match.profiles?.faculty})
                            </span>
                          </div>
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                            match.status === 'accepted' ? 'bg-green-100 text-green-800' :
                            match.status === 'declined' ? 'bg-red-100 text-red-800' :
                            'bg-yellow-100 text-yellow-800'
                          }`}>
                            {match.status}
                          </span>
                        </div>
                        <div className="text-sm text-blue-700">
                          <p>Program: {match.profiles?.program}</p>
                          <p>Match Score: {match.match_score} points</p>
                          <p>Matched: {formatDate(match.created_at)}</p>
                        </div>
                        {match.status === 'accepted' && (
                          <div className="mt-2 p-2 bg-green-50 rounded text-sm text-green-800">
                            ✅ This student has accepted your request! Check your email for connection details.
                          </div>
                        )}
                        {match.status === 'declined' && (
                          <div className="mt-2 p-2 bg-red-50 rounded text-sm text-red-700">
                            ❌ This student declined your request. We'll keep looking for other matches.
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                )}

                {request.status === 'pending' && (!request.matches || request.matches.length === 0) && (
                  <div className="border-t pt-4">
                    <div className="flex items-center text-sm text-gray-500">
                      <Spinner size="sm" className="mr-2" />
                      Our algorithm is searching for the perfect match for your curiosity...
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
