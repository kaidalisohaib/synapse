'use client'

import { useSearchParams } from 'next/navigation'
import Link from 'next/link'
import Button from '@/components/ui/Button'

export default function AuthCodeError() {
  const searchParams = useSearchParams()
  const error = searchParams.get('error')
  const error_code = searchParams.get('error_code')
  const error_description = searchParams.get('error_description')

  const getErrorMessage = () => {
    if (error_code === 'otp_expired') {
      return {
        title: 'Email Link Expired',
        description: 'Your verification link has expired. This is common if you wait too long to click the link.',
        suggestions: [
          'Verification links expire after 24 hours for security',
          'Please sign up again to get a new verification email',
          'Check your spam folder for the new email'
        ]
      }
    }

    if (error === 'access_denied') {
      return {
        title: 'Access Denied',
        description: 'There was an issue with the verification link.',
        suggestions: [
          'The link may have been corrupted by your email client',
          'Try copying the link directly instead of clicking it',
          'Sign up again for a fresh verification link'
        ]
      }
    }

    return {
      title: 'Authentication Error',
      description: 'There was an error verifying your email.',
      suggestions: [
        'The verification link has expired',
        'The link has already been used',
        'There was a technical issue'
      ]
    }
  }

  const errorInfo = getErrorMessage()

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-lg w-full space-y-8 text-center">
        <div>
          <div className="text-6xl mb-4">❌</div>
          <h2 className="mt-6 text-3xl font-bold text-gray-900">
            {errorInfo.title}
          </h2>
          <p className="mt-2 text-sm text-gray-600">
            {errorInfo.description}
          </p>
          
          <div className="mt-6 p-4 bg-yellow-50 rounded-lg">
            <h3 className="text-sm font-medium text-yellow-800 mb-2">What happened:</h3>
            <ul className="text-sm text-yellow-700 text-left space-y-1">
              {errorInfo.suggestions.map((suggestion, index) => (
                <li key={index}>• {suggestion}</li>
              ))}
            </ul>
          </div>

          {error_description && (
            <div className="mt-4 p-3 bg-gray-100 rounded text-xs text-gray-600">
              <strong>Technical details:</strong> {decodeURIComponent(error_description)}
            </div>
          )}
        </div>
        
        <div className="space-y-4">
          <Link href="/auth/resend">
            <Button className="w-full">
              Get New Verification Email
            </Button>
          </Link>
          
          <Link href="/login">
            <Button variant="outline" className="w-full">
              Already Verified? Sign In
            </Button>
          </Link>
        </div>
        
        <div className="text-sm text-gray-500 space-y-2">
          <p><strong>💡 Tip:</strong> Check your spam folder for the verification email</p>
          <p><strong>⏰ Note:</strong> Verification links expire after 24 hours</p>
        </div>
      </div>
    </div>
  )
}
