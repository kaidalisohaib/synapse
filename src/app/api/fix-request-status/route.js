import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { adminConfig } from '@/lib/config'

export async function POST(request) {
  try {
    const body = await request.json()
    const { requestId } = body
    
    const supabase = await createClient()

    // SECURITY: Verify the request came from an authenticated user
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    let targetRequestId = requestId

    if (!targetRequestId) {
      // If no specific request ID, fix all requests for this user
      const { data: userRequests } = await supabase
        .from('requests')
        .select('id')
        .eq('requester_id', user.id)

      if (!userRequests || userRequests.length === 0) {
        return NextResponse.json({
          success: true,
          message: 'No requests found to fix'
        })
      }

      let fixedCount = 0
      for (const req of userRequests) {
        const fixed = await fixRequestStatus(supabase, req.id)
        if (fixed) fixedCount++
      }

      return NextResponse.json({
        success: true,
        message: `Fixed ${fixedCount} request statuses`
      })
    } else {
      // Fix specific request
      // Verify user owns this request or is admin
      if (!adminConfig.emails.includes(user.email)) {
        const { data: requestData, error: requestError } = await supabase
          .from('requests')
          .select('requester_id')
          .eq('id', requestId)
          .single()

        if (requestError || !requestData || requestData.requester_id !== user.id) {
          return NextResponse.json(
            { error: 'Forbidden: You can only fix your own requests' },
            { status: 403 }
          )
        }
      }

      const fixed = await fixRequestStatus(supabase, requestId)
      
      return NextResponse.json({
        success: true,
        message: fixed ? 'Request status fixed' : 'Request status was already correct'
      })
    }

  } catch (error) {
    console.error('Fix request status API error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

async function fixRequestStatus(supabase, requestId) {
  try {
    // Get all matches for this request
    const { data: matches } = await supabase
      .from('matches')
      .select('id, status')
      .eq('request_id', requestId)

    // Check if there are any active matches
    const hasActiveMatches = matches && matches.some(match => 
      match.status !== 'declined' && match.status !== 'expired'
    )

    // Get current request status
    const { data: requestData } = await supabase
      .from('requests')
      .select('status')
      .eq('id', requestId)
      .single()

    if (!requestData) {
      console.error('Request not found:', requestId)
      return false
    }

    let newStatus = null

    if (hasActiveMatches) {
      // Has active matches - should be 'matched'
      if (requestData.status !== 'matched') {
        newStatus = 'matched'
      }
    } else {
      // No active matches - should be 'pending'
      if (requestData.status !== 'pending') {
        newStatus = 'pending'
      }
    }

    if (newStatus) {
      console.log(`Fixing request ${requestId}: ${requestData.status} -> ${newStatus}`)
      
      const { error } = await supabase
        .from('requests')
        .update({ status: newStatus })
        .eq('id', requestId)

      if (error) {
        console.error('Error fixing request status:', error)
        return false
      }

      return true
    }

    return false // No fix needed
  } catch (error) {
    console.error('Error in fixRequestStatus:', error)
    return false
  }
}