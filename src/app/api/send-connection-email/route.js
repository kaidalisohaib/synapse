import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'
import { adminConfig } from '@/lib/config'
import { sendConnectionEmail } from '@/lib/emailUtils'

export async function POST(request) {
  try {
    const body = await request.json()
    const { matchId } = body
    
    // Input validation
    if (!matchId) {
      return NextResponse.json(
        { error: 'Match ID is required' },
        { status: 400 }
      )
    }

    // Validate matchId is a valid UUID format
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i
    if (!uuidRegex.test(matchId)) {
      return NextResponse.json(
        { error: 'Invalid match ID format' },
        { status: 400 }
      )
    }

    const supabase = await createClient()

    // SECURITY: Verify the request came from an authenticated user
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    // Verify user is authorized to send connection email for this match
    const { data: matchData, error: matchError } = await supabase
      .from('matches')
      .select(`
        matched_user_id,
        requests!inner (
          requester_id
        )
      `)
      .eq('id', matchId)
      .single()

    if (matchError || !matchData) {
      return NextResponse.json(
        { error: 'Match not found' },
        { status: 404 }
      )
    }

    // Check if user is authorized (admin, matched user, or requester)
    const isAdmin = adminConfig.emails.includes(user.email)
    const isMatchedUser = matchData.matched_user_id === user.id
    const isRequester = matchData.requests.requester_id === user.id

    if (!isAdmin && !isMatchedUser && !isRequester) {
      return NextResponse.json(
        { error: 'Forbidden: You are not authorized to send connection emails for this match' },
        { status: 403 }
      )
    }

    // Use shared email utility to send connection email
    const result = await sendConnectionEmail(matchId)

    if (!result.success) {
      return NextResponse.json(
        { error: result.error },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      emailIds: result.emailIds,
      message: 'Connection emails sent to both users'
    })

  } catch (error) {
    console.error('Send connection email error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}