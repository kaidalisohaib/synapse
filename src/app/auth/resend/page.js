'use client'

import { useState, useEffect } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'
import Button from '@/components/ui/Button'
import Spinner from '@/components/ui/Spinner'

export default function ResendVerification() {
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState('')
  const [sent, setSent] = useState(false)
  const [userEmail, setUserEmail] = useState('')
  const router = useRouter()
  const searchParams = useSearchParams()
  const supabase = createClient()

  useEffect(() => {
    // Get email from URL params if coming from login page
    const emailParam = searchParams.get('email')
    if (emailParam) {
      setUserEmail(emailParam)
    } else {
      // If no email provided, redirect to login
      router.push('/login')
    }
  }, [searchParams, router])

  const handleResend = async () => {
    setLoading(true)
    setMessage('')

    try {
      const { error } = await supabase.auth.resend({
        type: 'signup',
        email: userEmail,
        options: {
          emailRedirectTo: `${window.location.origin}/auth/callback`,
        }
      })

      if (error) {
        console.error('Resend error:', error)
        setMessage('Failed to resend verification email. Please try signing up again.')
      } else {
        setMessage('✅ Verification email sent! Please check your inbox and spam folder.')
        setSent(true)
      }
    } catch (error) {
      console.error('Resend error:', error)
      setMessage('Failed to resend verification email. Please try signing up again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div>
          <div className="text-center text-6xl mb-4">📧</div>
          <h2 className="mt-6 text-center text-3xl font-bold text-gray-900">
            Resend Verification Email
          </h2>
          <p className="mt-2 text-center text-sm text-gray-600">
            We'll send a new verification link to your registered email
          </p>
        </div>
        
        {!sent ? (
          <div className="mt-8 space-y-6">
            <div className="bg-blue-50 p-4 rounded-lg">
              <h3 className="text-sm font-medium text-blue-800 mb-2">Your Email Address:</h3>
              <p className="text-blue-700 font-mono text-sm">{userEmail}</p>
              <p className="text-blue-600 text-xs mt-2">
                For security, we can only send verification emails to your registered address.
              </p>
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

            <div>
              <Button
                onClick={handleResend}
                disabled={loading}
                className="group relative w-full flex justify-center"
                size="md"
              >
                {loading ? (
                  <div className="flex items-center">
                    <Spinner size="sm" className="mr-2" />
                    Sending...
                  </div>
                ) : (
                  'Send Verification Email'
                )}
              </Button>
            </div>
          </div>
        ) : (
          <div className="text-center space-y-6">
            <div className="p-6 bg-green-50 rounded-lg">
              <div className="text-4xl mb-4">✅</div>
              <h3 className="text-lg font-medium text-green-800 mb-2">Email Sent!</h3>
              <p className="text-green-700 text-sm">
                We've sent a new verification email to <strong>{userEmail}</strong>
              </p>
            </div>

            <div className="bg-yellow-50 p-4 rounded-lg">
              <h4 className="font-medium text-yellow-800 mb-2">Important Tips:</h4>
              <ul className="text-sm text-yellow-700 space-y-1 text-left">
                <li>• Check your spam/junk folder</li>
                <li>• The link expires in 24 hours</li>
                <li>• If using Outlook, try copying the link instead of clicking it</li>
                <li>• Only one verification email per account for security</li>
              </ul>
            </div>

            <div className="space-y-3">
              <Button
                onClick={() => {setSent(false); setMessage('')}}
                variant="outline"
                className="w-full"
              >
                Send Again
              </Button>
              
              <Link href="/login">
                <Button variant="ghost" className="w-full">
                  Back to Sign In
                </Button>
              </Link>
            </div>
          </div>
        )}

        {!sent && (
          <div className="text-center">
            <span className="text-sm text-gray-600">
              Remember your password?{' '}
              <Link href="/login" className="font-medium text-red-600 hover:text-red-500">
                Try signing in
              </Link>
            </span>
          </div>
        )}
      </div>
    </div>
  )
}
