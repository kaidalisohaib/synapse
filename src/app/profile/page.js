'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import Button from '@/components/ui/Button'
import TagInput from '@/components/ui/TagInput'
import Spinner from '@/components/ui/Spinner'
import { mcgillConfig, matchingConfig } from '@/lib/config'

export default function ProfileEdit() {
  const [loading, setLoading] = useState(false)
  const [user, setUser] = useState(null)
  const [formData, setFormData] = useState({
    name: '',
    faculty: '',
    program: '',
    year: '',
    knowledgeTags: [],
    curiosityTags: []
  })
  const [message, setMessage] = useState('')
  const [initialLoad, setInitialLoad] = useState(true)
  
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
      
      // Load existing profile
      const { data: profile, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single()
      
      if (error) {
        console.error('Profile load error:', error)
        router.push('/profile/setup')
        return
      }

      if (profile) {
        setFormData({
          name: profile.name || '',
          faculty: profile.faculty || '',
          program: profile.program || '',
          year: profile.year || '',
          knowledgeTags: profile.knowledgeTags || [],
          curiosityTags: profile.curiosityTags || []
        })
      }
      
      setInitialLoad(false)
    }

    getUser()
  }, [supabase, router])

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    setMessage('')

    if (!formData.name || !formData.faculty || !formData.program || !formData.year) {
      setMessage('Please fill in all required fields.')
      setLoading(false)
      return
    }

    if (formData.knowledgeTags.length === 0) {
      setMessage('Please add at least one knowledge tag.')
      setLoading(false)
      return
    }

    if (formData.curiosityTags.length === 0) {
      setMessage('Please add at least one curiosity tag.')
      setLoading(false)
      return
    }

    try {
      const { error } = await supabase
        .from('profiles')
        .update({
          ...formData,
          profile_completed: true,
          updated_at: new Date().toISOString()
        })
        .eq('id', user.id)

      if (error) {
        console.error('Profile update error:', error)
        setMessage(error.message)
      } else {
        setMessage('✅ Profile updated successfully!')
        
        // Trigger re-matching for unmatched requests (in background)
        try {
          fetch('/api/retry-matching', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({ 
              trigger: 'profile_update',
              systemWide: true // Flag to indicate this is a legitimate system-wide retry
            }),
          }).catch(error => {
            console.log('Background re-matching failed:', error)
            // Don't show error to user - this is a background operation
          })
        } catch (error) {
          console.log('Background re-matching trigger failed:', error)
        }
        
        // Redirect to dashboard after a short delay
        setTimeout(() => {
          router.push('/dashboard')
        }, 1500)
      }
    } catch (error) {
      console.error('Profile update error:', error)
      setMessage('An unexpected error occurred. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  if (initialLoad) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Spinner size="lg" />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 py-12 px-4 sm:px-6 lg:px-8">
      {/* Animated background */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_60%_40%,rgba(120,119,198,0.2),rgba(255,255,255,0))]"></div>
        <div className="absolute top-20 right-20 w-32 h-32 bg-purple-500/10 rounded-full blur-xl animate-pulse"></div>
        <div className="absolute bottom-32 left-32 w-40 h-40 bg-pink-500/10 rounded-full blur-xl animate-pulse delay-500"></div>
      </div>

      <div className="max-w-2xl mx-auto relative z-10">
        <div className="bg-slate-800/80 backdrop-blur-sm shadow-2xl rounded-2xl p-8 border border-purple-500/20">
          <div className="mb-8">
            <div className="flex items-center mb-4">
              <div className="text-4xl animate-pulse mr-4">🔮</div>
              <div>
                <h1 className="text-3xl font-bold text-white">
                  Configure Your <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-400">Neural Profile</span>
                </h1>
                <p className="mt-2 text-gray-300">
                  Enhance your synaptic signature to optimize neural connections.
                </p>
              </div>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label htmlFor="name" className="block text-sm font-medium text-gray-300">
                Neural Identity *
              </label>
              <input
                type="text"
                id="name"
                required
                className="mt-1 block w-full px-4 py-3 border border-purple-500/30 rounded-xl shadow-sm focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent sm:text-sm bg-slate-700/50 text-white placeholder-gray-400 backdrop-blur-sm transition-all duration-300"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              />
            </div>

            <div>
              <label htmlFor="faculty" className="block text-sm font-medium text-gray-300">
                Faculty *
              </label>
              <select
                id="faculty"
                required
                className="mt-1 block w-full px-4 py-3 border border-gray-300 rounded-xl shadow-sm focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent sm:text-sm bg-slate-700/50 text-white placeholder-gray-400 backdrop-blur-sm transition-all duration-300"
                value={formData.faculty}
                onChange={(e) => setFormData({ ...formData, faculty: e.target.value })}
              >
                <option value="">Select your faculty</option>
                {mcgillConfig.faculties.map(faculty => (
                  <option key={faculty} value={faculty}>{faculty}</option>
                ))}
              </select>
            </div>

            <div>
              <label htmlFor="program" className="block text-sm font-medium text-gray-300">
                Program/Major *
              </label>
              <input
                type="text"
                id="program"
                required
                placeholder="e.g., Computer Science, Psychology, etc."
                className="mt-1 block w-full px-4 py-3 border border-purple-500/30 rounded-xl shadow-sm focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent sm:text-sm bg-slate-700/50 text-white placeholder-gray-400 backdrop-blur-sm transition-all duration-300"
                value={formData.program}
                onChange={(e) => setFormData({ ...formData, program: e.target.value })}
              />
            </div>

            <div>
              <label htmlFor="year" className="block text-sm font-medium text-gray-300">
                Academic Year *
              </label>
              <select
                id="year"
                required
                className="mt-1 block w-full px-4 py-3 border border-purple-500/30 rounded-xl shadow-sm focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent sm:text-sm bg-slate-700/50 text-white placeholder-gray-400 backdrop-blur-sm transition-all duration-300"
                value={formData.year}
                onChange={(e) => setFormData({ ...formData, year: e.target.value })}
              >
                <option value="">Select your year</option>
                {mcgillConfig.academicYears.map(year => (
                  <option key={year} value={year}>{year}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Knowledge Tags *
              </label>
              <p className="text-sm text-gray-400 mb-3">
                What topics do you enjoy talking about? What are you knowledgeable in?
              </p>
              <TagInput
                tags={formData.knowledgeTags}
                setTags={(tags) => setFormData({ ...formData, knowledgeTags: tags })}
                placeholder="Add topics you know about (e.g., machine learning, philosophy, music theory)"
                maxTags={matchingConfig.limits.maxTagsPerCategory}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Curiosity Tags *
              </label>
              <p className="text-sm text-gray-400 mb-3">
                What topics are you curious about? What would you like to learn more about?
              </p>
              <TagInput
                tags={formData.curiosityTags}
                setTags={(tags) => setFormData({ ...formData, curiosityTags: tags })}
                placeholder="Add topics you're curious about (e.g., quantum physics, art history, entrepreneurship)"
                maxTags={matchingConfig.limits.maxTagsPerCategory}
              />
            </div>

            {message && (
              <div className={`p-3 rounded-lg text-sm ${
                message.includes('✅') 
                  ? 'bg-green-50 text-green-700' 
                  : 'bg-red-50 text-red-700'
              }`}>
                {message}
              </div>
            )}

            <div className="flex justify-between items-center">
              <Button
                type="button"
                variant="outline"
                onClick={() => router.push('/profile/password')}
                className="text-gray-600 hover:text-gray-800"
              >
                🔒 Change Password
              </Button>
              
              <div className="flex space-x-4">
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
                      Saving...
                    </div>
                  ) : (
                    'Save Changes'
                  )}
                </Button>
              </div>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}
