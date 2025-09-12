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
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-2xl mx-auto">
        <div className="bg-white shadow rounded-lg p-6">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900">Edit Your Profile</h1>
            <p className="mt-2 text-gray-600">
              Update your information to improve your matching with other students.
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
