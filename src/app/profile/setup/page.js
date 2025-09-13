'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import Button from '@/components/ui/Button'
import TagInput from '@/components/ui/TagInput'
import Spinner from '@/components/ui/Spinner'
import { mcgillConfig, matchingConfig } from '@/lib/config'

export default function ProfileSetup() {
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
      
      // Check if profile already exists
      const { data: profile } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single()
      
      if (profile && profile.profile_completed) {
        router.push('/dashboard')
      } else if (profile) {
        setFormData({
          name: profile.name || '',
          faculty: profile.faculty || '',
          program: profile.program || '',
          year: profile.year || '',
          knowledgeTags: profile.knowledgeTags || [],
          curiosityTags: profile.curiosityTags || []
        })
      }
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
        .upsert({
          id: user.id,
          ...formData,
          profile_completed: true,
          updated_at: new Date().toISOString()
        })

      if (error) {
        setMessage(error.message)
      } else {
        // Trigger re-matching for unmatched requests (in background)
        try {
          fetch('/api/retry-matching', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({ 
              trigger: 'new_user',
              systemWide: true // Flag to indicate this is a legitimate system-wide retry
            }),
          }).catch(error => {
            console.log('Background re-matching failed:', error)
            // Don't show error to user - this is a background operation
          })
        } catch (error) {
          console.log('Background re-matching trigger failed:', error)
        }
        
        router.push('/dashboard')
      }
    } catch (error) {
      setMessage('An unexpected error occurred. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Spinner size="lg" />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-2xl mx-auto">
        <div className="bg-white shadow rounded-lg p-6">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900">Complete Your Profile</h1>
            <p className="mt-2 text-gray-600">
              Help us connect you with the right people by telling us about yourself.
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label htmlFor="name" className="block text-sm font-medium text-gray-700">
                Full Name *
              </label>
              <input
                type="text"
                id="name"
                required
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-red-500 focus:border-red-500 sm:text-sm bg-white text-gray-900"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              />
            </div>

            <div>
              <label htmlFor="faculty" className="block text-sm font-medium text-gray-700">
                Faculty *
              </label>
              <select
                id="faculty"
                required
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-red-500 focus:border-red-500 sm:text-sm bg-white text-gray-900"
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
              <label htmlFor="program" className="block text-sm font-medium text-gray-700">
                Program/Major *
              </label>
              <input
                type="text"
                id="program"
                required
                placeholder="e.g., Computer Science, Psychology, etc."
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-red-500 focus:border-red-500 sm:text-sm bg-white text-gray-900"
                value={formData.program}
                onChange={(e) => setFormData({ ...formData, program: e.target.value })}
              />
            </div>

            <div>
              <label htmlFor="year" className="block text-sm font-medium text-gray-700">
                Academic Year *
              </label>
              <select
                id="year"
                required
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-red-500 focus:border-red-500 sm:text-sm bg-white text-gray-900"
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
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Knowledge Tags *
              </label>
              <p className="text-sm text-gray-500 mb-3">
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
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Curiosity Tags *
              </label>
              <p className="text-sm text-gray-500 mb-3">
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
              <div className="p-3 rounded-lg text-sm bg-red-50 text-red-700">
                {message}
              </div>
            )}

            <div className="flex justify-end">
              <Button
                type="submit"
                disabled={loading}
                size="lg"
              >
                {loading ? (
                  <div className="flex items-center">
                    <Spinner size="sm" className="mr-2" />
                    Saving...
                  </div>
                ) : (
                  'Complete Profile'
                )}
              </Button>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}
