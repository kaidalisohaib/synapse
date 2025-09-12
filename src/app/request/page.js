'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import Button from '@/components/ui/Button'
import Spinner from '@/components/ui/Spinner'

export default function RequestPage() {
  const [user, setUser] = useState(null)
  const [profile, setProfile] = useState(null)
  const [requestText, setRequestText] = useState('')
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState('')
  const [submitted, setSubmitted] = useState(false)
  const router = useRouter()
  const supabase = createClient()

  useEffect(() => {
    const getUser = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) {
        router.push('/login')
        return
      }

      setUser(user)

      // Load profile to check if completed
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
    }

    getUser()
  }, [supabase, router])

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    setMessage('')

    if (!requestText.trim()) {
      setMessage('Please describe what you\'re curious about.')
      setLoading(false)
      return
    }

    if (requestText.trim().length < 10) {
      setMessage('Please provide more details about your curiosity (at least 10 characters).')
      setLoading(false)
      return
    }

    try {
      // Submit the request
      const { data, error } = await supabase
        .from('requests')
        .insert({
          requester_id: user.id,
          request_text: requestText.trim(),
          status: 'pending'
        })
        .select()
        .single()

      if (error) {
        console.error('Request submission error:', error)
        setMessage('Failed to submit your request. Please try again.')
      } else {
        // Trigger the matching algorithm
        await triggerMatching(data.id)
        setSubmitted(true)
      }
    } catch (error) {
      console.error('Request submission error:', error)
      setMessage('An unexpected error occurred. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const triggerMatching = async (requestId) => {
    try {
      // Call the matching API endpoint
      const response = await fetch('/api/match-request', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ requestId }),
      })

      if (!response.ok) {
        console.error('Matching API error:', response.statusText)
      }
    } catch (error) {
      console.error('Matching trigger error:', error)
      // Don't show error to user - matching can happen in background
    }
  }

  if (!user || !profile) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Spinner size="lg" />
      </div>
    )
  }

  if (submitted) {
    return (
      <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-2xl mx-auto">
          <div className="bg-white shadow rounded-lg p-8 text-center">
            <div className="text-6xl mb-6">🎯</div>
            <h1 className="text-3xl font-bold text-gray-900 mb-4">
              Request Submitted!
            </h1>
            <p className="text-lg text-gray-600 mb-6">
              We're searching for the perfect match for your curiosity. You'll receive an email when someone accepts your request.
            </p>
            
            <div className="bg-blue-50 p-6 rounded-lg mb-6">
              <h3 className="font-medium text-blue-800 mb-2">What happens next?</h3>
              <ul className="text-sm text-blue-700 space-y-2 text-left">
                <li>• Our algorithm searches for students who can help with your question</li>
                <li>• The best match will receive an email invitation</li>
                <li>• If they accept, you'll both get an introduction email</li>
                <li>• You can then connect directly to have your conversation</li>
              </ul>
            </div>

            <div className="space-y-4">
              <Button
                onClick={() => router.push('/dashboard')}
                className="w-full sm:w-auto"
              >
                Go to Dashboard
              </Button>
              
              <Button
                onClick={() => {setSubmitted(false); setRequestText(''); setMessage('')}}
                variant="outline"
                className="w-full sm:w-auto sm:ml-4"
              >
                Submit Another Request
              </Button>
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-2xl mx-auto">
        <div className="bg-white shadow rounded-lg p-6">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900">Submit a Curiosity Request</h1>
            <p className="mt-2 text-gray-600">
              Describe something you're curious about and we'll connect you with a fellow McGill student who can help.
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label htmlFor="request" className="block text-sm font-medium text-gray-700 mb-2">
                What are you curious about? *
              </label>
              <textarea
                id="request"
                rows={6}
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-red-500 focus:border-red-500 sm:text-sm bg-white text-gray-900"
                placeholder="e.g., I've been wondering about how machine learning algorithms are used in climate science research. I'm a psychology student but I'm really curious about the intersection of AI and environmental studies..."
                value={requestText}
                onChange={(e) => setRequestText(e.target.value)}
                maxLength={1000}
              />
              <p className="mt-1 text-xs text-gray-500">
                {requestText.length}/1000 characters
              </p>
            </div>

            <div className="bg-yellow-50 p-4 rounded-lg">
              <h3 className="text-sm font-medium text-yellow-800 mb-2">Tips for a great request:</h3>
              <ul className="text-sm text-yellow-700 space-y-1">
                <li>• Be specific about what you want to learn</li>
                <li>• Mention your background and why you're curious</li>
                <li>• Ask open-ended questions that invite discussion</li>
                <li>• Consider interdisciplinary connections</li>
              </ul>
            </div>

            <div className="bg-blue-50 p-4 rounded-lg">
              <h3 className="text-sm font-medium text-blue-800 mb-2">Your profile tags:</h3>
              <div className="space-y-2">
                <div>
                  <span className="text-xs font-medium text-blue-700">Knowledge: </span>
                  <div className="flex flex-wrap gap-1 mt-1">
                    {profile?.knowledgeTags?.map((tag, index) => (
                      <span key={index} className="px-2 py-1 bg-green-100 text-green-800 text-xs rounded-full">
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>
                <div>
                  <span className="text-xs font-medium text-blue-700">Curiosities: </span>
                  <div className="flex flex-wrap gap-1 mt-1">
                    {profile?.curiosityTags?.map((tag, index) => (
                      <span key={index} className="px-2 py-1 bg-purple-100 text-purple-800 text-xs rounded-full">
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {message && (
              <div className="p-3 rounded-lg text-sm bg-red-50 text-red-700">
                {message}
              </div>
            )}

            <div className="flex justify-end space-x-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => router.push('/dashboard')}
              >
                Cancel
              </Button>
              
              <Button
                type="submit"
                disabled={loading}
              >
                {loading ? (
                  <div className="flex items-center">
                    <Spinner size="sm" className="mr-2" />
                    Submitting...
                  </div>
                ) : (
                  'Submit Request'
                )}
              </Button>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}
