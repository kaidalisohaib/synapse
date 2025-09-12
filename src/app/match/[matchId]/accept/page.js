'use client'

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import Button from '@/components/ui/Button'
import Spinner from '@/components/ui/Spinner'

export default function AcceptMatch() {
  const [loading, setLoading] = useState(true)
  const [actionLoading, setActionLoading] = useState(false)
  const [match, setMatch] = useState(null)
  const [user, setUser] = useState(null)
  const [message, setMessage] = useState('')
  const [accepted, setAccepted] = useState(false)
  const params = useParams()
  const router = useRouter()
  const supabase = createClient()
  const matchId = params.matchId

  useEffect(() => {
    const loadMatch = async () => {
      try {
        // Get current user
        const { data: { user } } = await supabase.auth.getUser()
        if (!user) {
          router.push('/login')
          return
        }
        setUser(user)

        // Get match details
        const { data: matchData, error: matchError } = await supabase
          .from('matches')
          .select(`
            id,
            status,
            match_score,
            expires_at,
            created_at,
            requests!inner (
              id,
              request_text,
              created_at,
              profiles!requests_requester_id_fkey (
                name,
                faculty,
                program,
                year
              )
            )
          `)
          .eq('id', matchId)
          .eq('matched_user_id', user.id)
          .single()

        if (matchError || !matchData) {
          setMessage('Match not found or you don\'t have permission to view it.')
          setLoading(false)
          return
        }

        // Check if match has expired
        const now = new Date()
        const expiresAt = new Date(matchData.expires_at)
        
        if (now > expiresAt && matchData.status === 'notified') {
          // Update status to expired
          await supabase
            .from('matches')
            .update({ status: 'expired' })
            .eq('id', matchId)
          
          matchData.status = 'expired'
        }

        setMatch(matchData)
      } catch (error) {
        console.error('Error loading match:', error)
        setMessage('An error occurred while loading the match.')
      } finally {
        setLoading(false)
      }
    }

    if (matchId) {
      loadMatch()
    }
  }, [matchId, supabase, router])

  const handleAccept = async () => {
    setActionLoading(true)
    
    try {
      // Update match status
      const { error: updateError } = await supabase
        .from('matches')
        .update({ 
          status: 'accepted',
          updated_at: new Date().toISOString()
        })
        .eq('id', matchId)

      if (updateError) {
        setMessage('Failed to accept match. Please try again.')
        setActionLoading(false)
        return
      }

      // Update request status
      await supabase
        .from('requests')
        .update({ status: 'confirmed' })
        .eq('id', match.requests.id)

      // Trigger connection email
      const response = await fetch('/api/send-connection-email', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ matchId }),
      })

      if (!response.ok) {
        console.error('Connection email error:', response.statusText)
      }

      setAccepted(true)
      setMatch(prev => ({ ...prev, status: 'accepted' }))
    } catch (error) {
      console.error('Accept match error:', error)
      setMessage('An error occurred. Please try again.')
    } finally {
      setActionLoading(false)
    }
  }

  const handleDecline = async () => {
    setActionLoading(true)
    
    try {
      const { error } = await supabase
        .from('matches')
        .update({ 
          status: 'declined',
          updated_at: new Date().toISOString()
        })
        .eq('id', matchId)

      if (error) {
        setMessage('Failed to decline match. Please try again.')
      } else {
        setMatch(prev => ({ ...prev, status: 'declined' }))
        setMessage('Match declined. The system will look for other potential matches for this student.')
      }
    } catch (error) {
      console.error('Decline match error:', error)
      setMessage('An error occurred. Please try again.')
    } finally {
      setActionLoading(false)
    }
  }

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Spinner size="lg" />
      </div>
    )
  }

  if (!match || message) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-md w-full text-center">
          <div className="text-6xl mb-4">❌</div>
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Unable to Load Match</h2>
          <p className="text-gray-600 mb-6">{message || 'This match request is no longer available.'}</p>
          <Button onClick={() => router.push('/dashboard')}>
            Go to Dashboard
          </Button>
        </div>
      </div>
    )
  }

  if (accepted || match.status === 'accepted') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-2xl w-full">
          <div className="bg-white rounded-lg shadow-lg p-8 text-center">
            <div className="text-6xl mb-6">🎉</div>
            <h1 className="text-3xl font-bold text-gray-900 mb-4">
              Match Accepted!
            </h1>
            <p className="text-lg text-gray-600 mb-6">
              Wonderful! You've agreed to help {match.requests.profiles.name} with their curiosity.
            </p>
            
            <div className="bg-green-50 p-6 rounded-lg mb-6">
              <h3 className="font-medium text-green-800 mb-2">What happens next?</h3>
              <ul className="text-sm text-green-700 space-y-2 text-left">
                <li>• Both you and {match.requests.profiles.name} will receive an introduction email</li>
                <li>• The email will include contact information for both of you</li>
                <li>• You can then reach out to arrange a convenient time to chat</li>
                <li>• Consider meeting for coffee, a video call, or whatever works best</li>
              </ul>
            </div>

            <div className="space-y-4">
              <Button
                onClick={() => router.push('/matches')}
                className="w-full sm:w-auto"
              >
                View All My Matches
              </Button>
              
              <Button
                onClick={() => router.push('/dashboard')}
                variant="outline"
                className="w-full sm:w-auto sm:ml-4"
              >
                Go to Dashboard
              </Button>
            </div>
          </div>
        </div>
      </div>
    )
  }

  if (match.status === 'declined') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-md w-full text-center">
          <div className="text-6xl mb-4">✋</div>
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Match Declined</h2>
          <p className="text-gray-600 mb-6">You've declined this match request. The system will look for other potential matches for this student.</p>
          <Button onClick={() => router.push('/dashboard')}>
            Go to Dashboard
          </Button>
        </div>
      </div>
    )
  }

  if (match.status === 'expired') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-md w-full text-center">
          <div className="text-6xl mb-4">⏰</div>
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Match Expired</h2>
          <p className="text-gray-600 mb-6">This match request has expired. The system will look for other potential matches for this student.</p>
          <Button onClick={() => router.push('/dashboard')}>
            Go to Dashboard
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-2xl mx-auto">
        <div className="bg-white rounded-lg shadow-lg p-8">
          <div className="text-center mb-8">
            <div className="text-6xl mb-4">🎯</div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              You've Been Matched!
            </h1>
            <p className="text-gray-600">
              A fellow McGill student has a question that matches your expertise.
            </p>
          </div>

          <div className="bg-blue-50 p-6 rounded-lg mb-6">
            <h3 className="font-medium text-blue-800 mb-3">Student Information:</h3>
            <div className="space-y-2 text-sm text-blue-700">
              <p><strong>Name:</strong> {match.requests.profiles.name}</p>
              <p><strong>Faculty:</strong> {match.requests.profiles.faculty}</p>
              <p><strong>Program:</strong> {match.requests.profiles.program}</p>
              <p><strong>Year:</strong> {match.requests.profiles.year}</p>
              <p><strong>Match Score:</strong> {match.match_score} points</p>
            </div>
          </div>

          <div className="bg-gray-50 p-6 rounded-lg mb-6">
            <h3 className="font-medium text-gray-800 mb-3">Their Question:</h3>
            <p className="text-gray-700 italic">"{match.requests.request_text}"</p>
            <p className="text-sm text-gray-500 mt-2">
              Submitted: {formatDate(match.requests.created_at)}
            </p>
          </div>

          <div className="bg-yellow-50 p-6 rounded-lg mb-8">
            <h3 className="font-medium text-yellow-800 mb-2">💡 Why you were matched:</h3>
            <p className="text-sm text-yellow-700">
              Our algorithm found connections between their question and your knowledge/curiosity tags. 
              This is a great opportunity for interdisciplinary learning at McGill!
            </p>
          </div>

          <div className="space-y-4">
            <div className="text-center">
              <p className="text-gray-600 mb-6">
                Would you like to help this student with their curiosity?
              </p>
              
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Button
                  onClick={handleAccept}
                  disabled={actionLoading}
                  className="flex-1 sm:flex-none"
                  size="lg"
                >
                  {actionLoading ? (
                    <div className="flex items-center">
                      <Spinner size="sm" className="mr-2" />
                      Accepting...
                    </div>
                  ) : (
                    '✅ Accept & Connect'
                  )}
                </Button>
                
                <Button
                  onClick={handleDecline}
                  disabled={actionLoading}
                  variant="outline"
                  className="flex-1 sm:flex-none"
                  size="lg"
                >
                  Decline
                </Button>
              </div>
            </div>

            <div className="text-center">
              <p className="text-xs text-gray-500">
                This match request expires on {formatDate(match.expires_at)}
              </p>
            </div>
          </div>

          {message && (
            <div className="mt-6 p-3 rounded-lg text-sm bg-red-50 text-red-700">
              {message}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
