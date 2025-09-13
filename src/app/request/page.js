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

      // Check if email is verified
      if (!user.email_confirmed_at) {
        router.push(`/auth/resend?email=${encodeURIComponent(user.email)}`)
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
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 py-12 px-4 sm:px-6 lg:px-8">
        {/* Animated background */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(120,119,198,0.3),rgba(255,255,255,0))]"></div>
          <div className="absolute top-20 left-20 w-32 h-32 bg-purple-500/10 rounded-full blur-xl animate-pulse"></div>
          <div className="absolute bottom-32 right-32 w-40 h-40 bg-pink-500/10 rounded-full blur-xl animate-pulse delay-500"></div>
        </div>

        <div className="max-w-2xl mx-auto relative z-10">
          <div className="bg-slate-800/80 backdrop-blur-sm shadow-2xl rounded-2xl p-8 text-center border border-purple-500/20">
            <div className="relative mb-6">
              <div className="text-6xl animate-pulse">🌟</div>
              <div className="absolute inset-0 bg-gradient-to-r from-purple-400/20 to-pink-400/20 rounded-full animate-ping"></div>
            </div>
            
            <h1 className="text-3xl font-bold text-white mb-4">
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-400">Neural Spark</span> Ignited!
            </h1>
            <p className="text-lg text-gray-300 mb-6">
              Your curiosity signal is propagating through the network. You'll receive a synaptic notification when a brilliant mind connects.
            </p>
            
            <div className="bg-gradient-to-br from-purple-900/30 to-pink-900/30 p-6 rounded-xl mb-6 border border-purple-500/20">
              <h3 className="font-medium text-purple-400 mb-3">Neural Pathway Activation:</h3>
              <ul className="text-sm text-gray-300 space-y-2 text-left">
                <li className="flex items-center">
                  <span className="text-purple-400 mr-2">⚡</span>
                  Algorithm scanning neural network for optimal synaptic matches
                </li>
                <li className="flex items-center">
                  <span className="text-pink-400 mr-2">🔮</span>
                  Best match receives electromagnetic invitation signal
                </li>
                <li className="flex items-center">
                  <span className="text-purple-400 mr-2">🌟</span>
                  Upon acceptance, both minds receive connection coordinates
                </li>
                <li className="flex items-center">
                  <span className="text-pink-400 mr-2">🧠</span>
                  Direct neural link established for knowledge transfer
                </li>
              </ul>
            </div>

            <div className="space-y-4">
              <Button
                onClick={() => router.push('/dashboard')}
                className="w-full sm:w-auto bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white font-semibold rounded-xl shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-200"
              >
                🧠 Return to Neural Hub
              </Button>
              
              <Button
                onClick={() => {setSubmitted(false); setRequestText(''); setMessage('')}}
                variant="outline"
                className="w-full sm:w-auto sm:ml-4 border-purple-500/50 text-purple-400 hover:bg-purple-600/20 hover:text-purple-300"
              >
                ⚡ Spark Another Connection
              </Button>
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 py-12 px-4 sm:px-6 lg:px-8">
      {/* Animated background */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_40%_60%,rgba(120,119,198,0.2),rgba(255,255,255,0))]"></div>
        <div className="absolute top-20 left-20 w-32 h-32 bg-purple-500/10 rounded-full blur-xl animate-pulse"></div>
        <div className="absolute bottom-32 right-32 w-40 h-40 bg-pink-500/10 rounded-full blur-xl animate-pulse delay-500"></div>
      </div>

      <div className="max-w-2xl mx-auto relative z-10">
        <div className="bg-slate-800/80 backdrop-blur-sm shadow-2xl rounded-2xl p-8 border border-purple-500/20">
          <div className="mb-8">
            <div className="flex items-center mb-4">
              <div className="text-4xl animate-pulse mr-4">⚡</div>
              <div>
                <h1 className="text-3xl font-bold text-white">
                  Spark a <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-400">Neural Connection</span>
                </h1>
                <p className="mt-2 text-gray-300">
                  Ignite your curiosity and let our algorithm find the perfect synaptic match.
                </p>
              </div>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label htmlFor="request" className="block text-sm font-medium text-gray-300 mb-2">
                What neural pathway are you curious about? *
              </label>
              <textarea
                id="request"
                rows={6}
                className="mt-1 block w-full px-4 py-3 border border-purple-500/30 rounded-xl shadow-sm focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent sm:text-sm bg-slate-700/50 text-white placeholder-gray-400 backdrop-blur-sm transition-all duration-300"
                placeholder="e.g., I've been wondering about how machine learning algorithms create neural networks that mimic brain synapses. I'm a psychology student but I'm fascinated by the intersection of AI consciousness and human cognition..."
                value={requestText}
                onChange={(e) => setRequestText(e.target.value)}
                maxLength={1000}
              />
              <p className="mt-1 text-xs text-purple-400">
                {requestText.length}/1000 neural signals
              </p>
            </div>

            <div className="bg-amber-900/20 border border-amber-500/30 p-4 rounded-lg">
              <h3 className="text-sm font-medium text-amber-200 mb-2">Tips for a great request:</h3>
              <ul className="text-sm text-amber-200 space-y-1">
                <li>• Be specific about what you want to learn</li>
                <li>• Mention your background and why you're curious</li>
                <li>• Ask open-ended questions that invite discussion</li>
                <li>• Consider interdisciplinary connections</li>
              </ul>
            </div>

            <div className="bg-slate-900/40 border border-blue-500/20 p-4 rounded-lg">
              <h3 className="text-sm font-medium text-blue-200 mb-2">Your profile tags:</h3>
              <div className="space-y-2">
                <div>
                  <span className="text-xs font-medium text-blue-300">Knowledge: </span>
                  <div className="flex flex-wrap gap-1 mt-1">
                    {profile?.knowledgeTags?.map((tag, index) => (
                      <span key={index} className="px-2 py-1 bg-green-900/30 text-green-200 border border-green-500/30 text-xs rounded-full">
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>
                <div>
                  <span className="text-xs font-medium text-blue-300">Curiosities: </span>
                  <div className="flex flex-wrap gap-1 mt-1">
                    {profile?.curiosityTags?.map((tag, index) => (
                      <span key={index} className="px-2 py-1 bg-purple-900/30 text-purple-200 border border-purple-500/30 text-xs rounded-full">
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {message && (
              <div className="p-3 rounded-lg text-sm bg-red-900/20 border border-red-500/30 text-red-200">
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
