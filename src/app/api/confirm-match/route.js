import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'
import { sendConnectionEmail } from '@/lib/emailUtils'

export async function POST(request) {
  try {
    const body = await request.json()
    const { matchId, action } = body
    
    // Input validation
    if (!matchId) {
      return NextResponse.json(
        { error: 'Match ID is required' },
        { status: 400 }
      )
    }

    if (!action || !['accept', 'decline'].includes(action)) {
      return NextResponse.json(
        { error: 'Action must be either "accept" or "decline"' },
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

    // Get match details and verify user authorization
    const { data: matchData, error: matchError } = await supabase
      .from('matches')
      .select(`
        id,
        status,
        matched_user_id,
        expires_at,
        requests!inner (
          id,
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

    // SECURITY: Only the matched user can confirm/decline
    if (matchData.matched_user_id !== user.id) {
      return NextResponse.json(
        { error: 'Forbidden: You can only confirm your own matches' },
        { status: 403 }
      )
    }

    // Check if match has expired
    const now = new Date()
    const expiresAt = new Date(matchData.expires_at)
    
    if (now > expiresAt && matchData.status === 'notified') {
      // Update status to expired
      await supabase
        .from('matches')
        .update({ status: 'expired', updated_at: new Date().toISOString() })
        .eq('id', matchId)
      
      return NextResponse.json(
        { error: 'This match has expired' },
        { status: 410 }
      )
    }

    // Check if match is already processed
    if (matchData.status !== 'notified') {
      return NextResponse.json(
        { error: `Match has already been ${matchData.status}` },
        { status: 409 }
      )
    }

    if (action === 'accept') {
      // Accept the match
      const { error: updateError } = await supabase
        .from('matches')
        .update({ 
          status: 'accepted',
          updated_at: new Date().toISOString()
        })
        .eq('id', matchId)

      if (updateError) {
        console.error('Match update error:', updateError)
        return NextResponse.json(
          { error: 'Failed to accept match' },
          { status: 500 }
        )
      }

      // Update request status
      await supabase
        .from('requests')
        .update({ status: 'confirmed' })
        .eq('id', matchData.requests.id)

      // Send connection emails
      let emailSuccess = false
      try {
        const emailResult = await sendConnectionEmail(matchId)
        emailSuccess = emailResult.success
        
        if (!emailResult.success) {
          console.error('Connection email error:', emailResult.error)
          // Don't fail the request if email fails - match is still accepted
        }
      } catch (emailError) {
        console.error('Connection email error:', emailError)
        // Don't fail the request if email fails - match is still accepted
      }

      return NextResponse.json({
        success: true,
        action: 'accepted',
        message: emailSuccess 
          ? 'Match accepted and connection emails sent'
          : 'Match accepted (email sending failed but match is confirmed)',
        emailSent: emailSuccess
      })

    } else if (action === 'decline') {
      // Decline the match
      const { error: updateError } = await supabase
        .from('matches')
        .update({ 
          status: 'declined',
          updated_at: new Date().toISOString()
        })
        .eq('id', matchId)

      if (updateError) {
        console.error('Match update error:', updateError)
        return NextResponse.json(
          { error: 'Failed to decline match' },
          { status: 500 }
        )
      }

      // Check if this was the only active match for the request
      const { data: otherActiveMatches, error: matchCheckError } = await supabase
        .from('matches')
        .select('id, status')
        .eq('request_id', matchData.requests.id)
        .neq('status', 'declined')
        .neq('status', 'expired')

      console.log('Checking other active matches:', {
        requestId: matchData.requests.id,
        otherActiveMatches,
        matchCheckError
      })

      // If no other active matches, set request back to pending
      if (!otherActiveMatches || otherActiveMatches.length === 0) {
        console.log('No other active matches found, setting request back to pending')
        const { error: requestUpdateError } = await supabase
          .from('requests')
          .update({ status: 'pending' })
          .eq('id', matchData.requests.id)
        
        if (requestUpdateError) {
          console.error('Error updating request status to pending:', requestUpdateError)
        } else {
          console.log('Successfully updated request status to pending')
        }
      } else {
        console.log(`Found ${otherActiveMatches.length} other active matches, keeping request as matched`)
      }

      // Trigger re-matching for this request after a short delay
      setTimeout(async () => {
        try {
          const { retryMatchingForRequest } = await import('@/lib/rematchingUtils')
          const retryResult = await retryMatchingForRequest(matchData.requests.id)
          
          if (retryResult.success) {
            console.log(`🔄 Auto-retry successful after decline: ${retryResult.matchId}`)
          } else {
            console.log(`🔄 Auto-retry failed after decline: ${retryResult.error}`)
          }
        } catch (error) {
          console.error('Auto-retry error after decline:', error)
        }
      }, 5000) // 5 second delay to allow the decline to be processed

      return NextResponse.json({
        success: true,
        action: 'declined',
        message: 'Match declined. Looking for other potential matches...'
      })
    }

  } catch (error) {
    console.error('Confirm match error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}