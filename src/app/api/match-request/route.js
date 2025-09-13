import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'
import { rateLimit } from '@/lib/rateLimit'
import { adminConfig, matchingConfig, securityConfig } from '@/lib/config'
import { sendMatchNotificationEmail } from '@/lib/emailUtils'

export async function POST(request) {
  try {
    const body = await request.json()
    const { requestId } = body
    
    // Input validation
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

    // SECURITY: Rate limiting - configurable match requests per user per hour
    const rateLimitResult = rateLimit(
      user.id, 
      securityConfig.rateLimit.matchRequestsPerHour, 
      securityConfig.rateLimit.windowMs
    )
    if (!rateLimitResult.success) {
      return NextResponse.json(
        { 
          error: 'Rate limit exceeded. Please try again later.',
          resetTime: rateLimitResult.resetTime
        },
        { status: 429 }
      )
    }

    // Get the request details
    const { data: requestData, error: requestError } = await supabase
      .from('requests')
      .select(`
        id,
        requester_id,
        request_text,
        profiles!requests_requester_id_fkey (
          faculty,
          program
        )
      `)
      .eq('id', requestId)
      .single()

    if (requestError || !requestData) {
      console.error('Request not found:', requestError)
      return NextResponse.json(
        { error: 'Request not found' },
        { status: 404 }
      )
    }

    // SECURITY: Verify user owns this request or is admin
    const isAdmin = adminConfig.emails.includes(user.email)
    const isOwner = requestData.requester_id === user.id

    if (!isOwner && !isAdmin) {
      return NextResponse.json(
        { error: 'Forbidden: You can only trigger matching for your own requests' },
        { status: 403 }
      )
    }

    // Get all potential matches (excluding the requester)
    const { data: potentialMatches, error: matchesError } = await supabase
      .from('profiles')
      .select('id, faculty, program, knowledgeTags, curiosityTags')
      .neq('id', requestData.requester_id)
      .eq('profile_completed', true)

    if (matchesError) {
      console.error('Error fetching potential matches:', matchesError)
      return NextResponse.json(
        { error: 'Error finding matches' },
        { status: 500 }
      )
    }

    if (!potentialMatches || potentialMatches.length === 0) {
      return NextResponse.json(
        { message: 'No potential matches found' },
        { status: 200 }
      )
    }

    // Calculate scores for each potential match
    const scoredMatches = potentialMatches.map(user => {
      const score = calculateMatchScore(
        requestData.request_text.toLowerCase(),
        requestData.profiles.faculty,
        requestData.profiles.program,
        user
      )
      return { ...user, score }
    })

    // Filter matches with minimum threshold and sort by score
    const minThreshold = matchingConfig.scoreThreshold
    const validMatches = scoredMatches
      .filter(match => match.score >= minThreshold)
      .sort((a, b) => b.score - a.score)

    if (validMatches.length === 0) {
      // Update request status to indicate no match found
      await supabase
        .from('requests')
        .update({ status: 'no_match_found' })
        .eq('id', requestId)

      return NextResponse.json(
        { message: 'No matches found above threshold' },
        { status: 200 }
      )
    }

    // Get the best match
    let bestMatch = validMatches[0]

    // Check if this user pair has been matched recently (cooldown period)
    const cooldownDays = matchingConfig.cooldownDays
    const cooldownDate = new Date()
    cooldownDate.setDate(cooldownDate.getDate() - cooldownDays)

    const { data: recentMatches } = await supabase
      .from('matches')
      .select('id')
      .eq('matched_user_id', bestMatch.id)
      .gte('created_at', cooldownDate.toISOString())
      .limit(1)

    if (recentMatches && recentMatches.length > 0) {
      // Try the next best match
      const alternativeMatch = validMatches.find(match => 
        match.id !== bestMatch.id
      )
      
      if (!alternativeMatch) {
        return NextResponse.json(
          { message: 'Best match in cooldown period, no alternatives' },
          { status: 200 }
        )
      }
      
      bestMatch = alternativeMatch
    }

    // RACE CONDITION PROTECTION: Check if request already has active matches
    const { data: existingMatches, error: existingError } = await supabase
      .from('matches')
      .select('id, status')
      .eq('request_id', requestId)
      .not('status', 'in', '(declined,expired)')

    if (existingError) {
      console.error('Error checking existing matches:', existingError)
      return NextResponse.json(
        { error: 'Error checking existing matches' },
        { status: 500 }
      )
    }

    if (existingMatches && existingMatches.length > 0) {
      return NextResponse.json(
        { message: 'Request already has active matches' },
        { status: 409 }
      )
    }

    // Create the match record with atomic operation
    const expiresAt = new Date()
    expiresAt.setDate(expiresAt.getDate() + matchingConfig.expiryDays)

    // Create the match record
    const { data: matchData, error: matchError } = await supabase
      .from('matches')
      .insert({
        request_id: requestId,
        matched_user_id: bestMatch.id,
        status: 'notified',
        match_score: bestMatch.score,
        expires_at: expiresAt.toISOString()
      })
      .select()
      .single()

    if (matchError) {
      console.error('Error creating match:', matchError)
      return NextResponse.json(
        { error: 'Error creating match' },
        { status: 500 }
      )
    }

    // Update request status
    await supabase
      .from('requests')
      .update({ status: 'matched' })
      .eq('id', requestId)

    if (matchError) {
      console.error('Error creating match:', matchError)
      
      // Handle specific error cases
      if (matchError.message?.includes('already has active matches') || 
          matchError.message?.includes('Active match already exists')) {
        return NextResponse.json(
          { message: 'Request already has active matches' },
          { status: 409 }
        )
      }
      
      if (matchError.message?.includes('cannot be matched with themselves')) {
        return NextResponse.json(
          { message: 'Invalid match: self-matching not allowed' },
          { status: 400 }
        )
      }
      
      return NextResponse.json(
        { error: 'Error creating match' },
        { status: 500 }
      )
    }

    // Automatically send match notification email
    try {
      await sendMatchNotificationEmail(matchData.id)
      console.log(`Match created and notification sent: ${matchData.id} with score ${bestMatch.score}`)
    } catch (emailError) {
      console.error('Error sending match notification email:', emailError)
      // Don't fail the entire request if email fails - log and continue
    }

    return NextResponse.json({
      success: true,
      matchId: matchData.id,
      matchScore: bestMatch.score,
      message: 'Match found, created, and notification sent'
    })

  } catch (error) {
    console.error('Matching algorithm error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

function calculateMatchScore(requestText, requesterFaculty, requesterProgram, candidate) {
  let score = 0

  // Keyword Match (Knowledge): configurable points for each knowledge tag in request
  if (candidate.knowledgeTags) {
    candidate.knowledgeTags.forEach(tag => {
      if (requestText.includes(tag.toLowerCase())) {
        score += matchingConfig.scoring.knowledgeTag
      }
    })
  }

  // Keyword Match (Curiosity): configurable points for each curiosity tag in request
  if (candidate.curiosityTags) {
    candidate.curiosityTags.forEach(tag => {
      if (requestText.includes(tag.toLowerCase())) {
        score += matchingConfig.scoring.curiosityTag
      }
    })
  }

  // Faculty Bonus: configurable points if different faculty (interdisciplinary)
  if (candidate.faculty !== requesterFaculty) {
    score += matchingConfig.scoring.facultyBonus
  }

  // Program Penalty: configurable penalty if same program
  if (candidate.program === requesterProgram) {
    score -= matchingConfig.scoring.sameProgramPenalty
  }

  return Math.max(0, score) // Ensure score is not negative
}

// Email notifications should be handled by a separate system or cron job
// This prevents circular dependencies and improves reliability
