import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

export async function GET(request) {
  const { searchParams, origin } = new URL(request.url)
  const code = searchParams.get('code')
  const error = searchParams.get('error')
  const error_code = searchParams.get('error_code')
  const error_description = searchParams.get('error_description')

  // Handle errors from Supabase auth
  if (error) {
    console.error('Auth callback error:', { error, error_code, error_description })
    
    // Redirect to error page with error details
    const errorParams = new URLSearchParams({
      error: error,
      error_code: error_code || '',
      error_description: error_description || ''
    })
    
    return NextResponse.redirect(`${origin}/auth/auth-code-error?${errorParams}`)
  }

  if (code) {
    const supabase = await createClient()
    
    try {
      const { data, error: exchangeError } = await supabase.auth.exchangeCodeForSession(code)
      
      if (exchangeError) {
        console.error('Exchange code error:', exchangeError)
        return NextResponse.redirect(`${origin}/auth/auth-code-error?error=exchange_failed`)
      }

      if (data.user) {
        // Update email verification status
        const { error: updateError } = await supabase
          .from('profiles')
          .upsert({
            id: data.user.id,
            email_verified: true,
            updated_at: new Date().toISOString()
          }, {
            onConflict: 'id'
          })

        if (updateError) {
          console.error('Profile update error:', updateError)
        }

        // Check if user has completed profile setup
        const { data: profile, error: profileError } = await supabase
          .from('profiles')
          .select('profile_completed')
          .eq('id', data.user.id)
          .single()

        if (profileError) {
          console.error('Profile check error:', profileError)
          // If profile doesn't exist yet, go to setup
          return NextResponse.redirect(`${origin}/profile/setup`)
        }

        // Redirect based on profile completion status
        const next = profile?.profile_completed ? '/dashboard' : '/profile/setup'
        return NextResponse.redirect(`${origin}${next}`)
      }
    } catch (error) {
      console.error('Callback processing error:', error)
      return NextResponse.redirect(`${origin}/auth/auth-code-error?error=processing_failed`)
    }
  }

  // No code and no error - something went wrong
  return NextResponse.redirect(`${origin}/auth/auth-code-error?error=missing_code`)
}
