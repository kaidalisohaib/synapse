import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function DELETE(request) {
  try {
    const { searchParams } = new URL(request.url)
    const requestId = searchParams.get('id')
    
    if (!requestId) {
      return NextResponse.json(
        { error: 'Request ID is required' },
        { status: 400 }
      )
    }

    // Validate requestId is a valid UUID format
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i
    if (!uuidRegex.test(requestId)) {
      return NextResponse.json(
        { error: 'Invalid request ID format' },
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

    // Get request details and verify ownership
    const { data: requestData, error: requestError } = await supabase
      .from('requests')
      .select(`
        id,
        requester_id,
        status,
        matches (
          id,
          status
        )
      `)
      .eq('id', requestId)
      .single()

    if (requestError || !requestData) {
      return NextResponse.json(
        { error: 'Request not found' },
        { status: 404 }
      )
    }

    // SECURITY: Only allow the requester to delete their own request
    if (requestData.requester_id !== user.id) {
      return NextResponse.json(
        { error: 'Forbidden: You can only delete your own requests' },
        { status: 403 }
      )
    }

    // Check if request has any active matches (accepted, pending, or notified)
    const hasActiveMatches = requestData.matches && requestData.matches.some(match => 
      match.status === 'accepted' || match.status === 'pending' || match.status === 'notified'
    )

    if (hasActiveMatches) {
      return NextResponse.json(
        { error: 'Cannot delete request with active matches. Please wait for the match to be resolved or contact support.' },
        { status: 409 }
      )
    }

    // Delete the request (this will cascade delete matches due to foreign key constraints)
    const { error: deleteError } = await supabase
      .from('requests')
      .delete()
      .eq('id', requestId)

    if (deleteError) {
      console.error('Error deleting request:', deleteError)
      return NextResponse.json(
        { error: 'Failed to delete request' },
        { status: 500 }
      )
    }

    console.log(`✅ Request deleted: ${requestId} by user ${user.id}`)

    return NextResponse.json({
      success: true,
      message: 'Request deleted successfully'
    })

  } catch (error) {
    console.error('Delete request API error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}