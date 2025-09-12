'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import Button from '@/components/ui/Button'
import Spinner from '@/components/ui/Spinner'
import { securityConfig } from '@/lib/config'

export default function ChangePassword() {
  const [user, setUser] = useState(null)
  const [currentPassword, setCurrentPassword] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [loading, setLoading] = useState(false)
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
      setInitialLoad(false)
    }

    getUser()
  }, [supabase, router])

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    setMessage('')

    // Validate new password
    if (newPassword.length < securityConfig.password.minLength) {
      setMessage(`New password must be at least ${securityConfig.password.minLength} characters long.`)
      setLoading(false)
      return
    }

    // Validate password confirmation
    if (newPassword !== confirmPassword) {
      setMessage('New passwords do not match.')
      setLoading(false)
      return
    }

    // Validate current password is different from new password
    if (currentPassword === newPassword) {
      setMessage('New password must be different from your current password.')
      setLoading(false)
      return
    }

    try {
      // First verify current password by attempting to sign in
      const { error: verifyError } = await supabase.auth.signInWithPassword({
        email: user.email,
        password: currentPassword
      })

      if (verifyError) {
        setMessage('Current password is incorrect.')
        setLoading(false)
        return
      }

      // Update password
      const { error: updateError } = await supabase.auth.updateUser({
        password: newPassword
      })

      if (updateError) {
        setMessage(updateError.message)
      } else {
        setMessage('✅ Password changed successfully!')
        // Clear form
        setCurrentPassword('')
        setNewPassword('')
        setConfirmPassword('')
        
        // Redirect after a short delay
        setTimeout(() => {
          router.push('/profile')
        }, 2000)
      }
    } catch (error) {
      console.error('Password change error:', error)
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
      <div className="max-w-md mx-auto">
        <div className="bg-white shadow rounded-lg p-6">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900">Change Password</h1>
            <p className="mt-2 text-gray-600">
              Update your password for enhanced security.
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label htmlFor="currentPassword" className="block text-sm font-medium text-gray-700">
                Current Password *
              </label>
              <input
                type="password"
                id="currentPassword"
                required
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-red-500 focus:border-red-500 sm:text-sm bg-white text-gray-900"
                placeholder="Enter your current password"
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
              />
            </div>

            <div>
              <label htmlFor="newPassword" className="block text-sm font-medium text-gray-700">
                New Password *
              </label>
              <input
                type="password"
                id="newPassword"
                required
                minLength={securityConfig.password.minLength}
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-red-500 focus:border-red-500 sm:text-sm bg-white text-gray-900"
                placeholder={`Enter new password (min ${securityConfig.password.minLength} characters)`}
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
              />
            </div>

            <div>
              <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700">
                Confirm New Password *
              </label>
              <input
                type="password"
                id="confirmPassword"
                required
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-red-500 focus:border-red-500 sm:text-sm bg-white text-gray-900"
                placeholder="Confirm your new password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
              />
              {confirmPassword && newPassword !== confirmPassword && (
                <p className="mt-1 text-xs text-red-600">Passwords do not match</p>
              )}
            </div>

            <div className="bg-blue-50 p-4 rounded-lg">
              <h3 className="text-sm font-medium text-blue-800 mb-2">Password Requirements:</h3>
              <ul className="text-xs text-blue-700 space-y-1">
                <li>• At least {securityConfig.password.minLength} characters long</li>
                <li>• Different from your current password</li>
                <li>• Consider using a mix of letters, numbers, and symbols</li>
              </ul>
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

            <div className="flex justify-end space-x-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => router.push('/profile')}
              >
                Cancel
              </Button>
              
              <Button
                type="submit"
                disabled={loading || !currentPassword || !newPassword || !confirmPassword || newPassword !== confirmPassword}
              >
                {loading ? (
                  <div className="flex items-center">
                    <Spinner size="sm" className="mr-2" />
                    Changing Password...
                  </div>
                ) : (
                  'Change Password'
                )}
              </Button>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}
