import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { retryAllUnmatchedRequests, retryMatchingForRequest } from '@/lib/rematchingUtils'
import { adminConfig } from '@/lib/config'
import { rateLimit } from '@/lib/rateLimit'

export async function POST(request) {
  try {
    const body = await request.json()
    const { requestId, trigger, systemWide } = body
    
    const supabase = await createClient()

    // SECURITY: Verify the request came from an authenticated user
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    // RATE LIMITING: Prevent spam retries (3 retries per hour per user)
    const rateLimitResult = rateLimit(user.id, 3, 3600000) // 3 requests per hour
    if (!rateLimitResult.success) {
      return NextResponse.json(
        { 
          error: 'Rate limit exceeded. You can only retry matching 3 times per hour.',
          resetTime: rateLimitResult.resetTime
        },
        { status: 429 }
      )
    }

    // For system-wide retry, require admin privileges OR legitimate system triggers
    const isLegitimateSystemTrigger = systemWide && (
      trigger === 'new_user' || 
      trigger === 'profile_update'
    )
    
    if (!requestId && !adminConfig.emails.includes(user.email) && !isLegitimateSystemTrigger) {
      return NextResponse.json(
        { error: 'Forbidden: Admin access required for system-wide retry' },
        { status: 403 }
      )
    }

    console.log(`🔄 Retry matching triggered by ${user.email}`, { requestId, trigger })

    let result

    if (requestId) {
      // Retry matching for a specific request
      // Verify user owns this request or is admin
      if (!adminConfig.emails.includes(user.email)) {
        const { data: requestData, error: requestError } = await supabase
          .from('requests')
          .select('requester_id')
          .eq('id', requestId)
          .single()

        if (requestError || !requestData || requestData.requester_id !== user.id) {
          return NextResponse.json(
            { error: 'Forbidden: You can only retry your own requests' },
            { status: 403 }
          )
        }
      }

      result = await retryMatchingForRequest(requestId)
    } else {
      // Retry matching for all unmatched requests (admin only)
      result = await retryAllUnmatchedRequests()
    }

    if (result.success || (result.total !== undefined)) {
      return NextResponse.json({
        success: true,
        ...result,
        message: requestId 
          ? 'Request retry completed'
          : `System-wide retry completed: ${result.successful} successful, ${result.failed} failed`
      })
    } else {
      return NextResponse.json({
        success: false,
        error: result.error || 'Retry matching failed'
      }, { status: 400 })
    }

  } catch (error) {
    console.error('Retry matching API error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}