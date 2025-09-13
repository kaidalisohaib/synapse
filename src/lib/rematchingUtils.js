import { createClient } from '@/lib/supabase/server'
import { createClient as createSupabaseClient } from '@supabase/supabase-js'
import { sendMatchNotificationEmail } from '@/lib/emailUtils'
import { matchingConfig } from '@/lib/config'

// Create admin client for system operations
function createAdminClient() {
  if (!process.env.SUPABASE_SERVICE_ROLE_KEY) {
    throw new Error('SUPABASE_SERVICE_ROLE_KEY environment variable is required for admin operations')
  }
  
  return createSupabaseClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY,
    {
      auth: {
        autoRefreshToken: false,
        persistSession: false
      }
    }
  )
}

/**
 * Find unmatched requests that could potentially be matched with new/updated users
 */
export async function findUnmatchedRequests() {
  const supabase = createAdminClient()
  
  try {
    // Find requests that are either:
    // 1. Still pending (no matches created)
    // 2. Had matches that were all declined
    const { data: unmatchedRequests, error } = await supabase
      .from('requests')
      .select(`
        id,
        requester_id,
        request_text,
        created_at,
        profiles!requests_requester_id_fkey (
          faculty,
          program
        )
      `)
      .in('status', ['pending', 'matched']) // Include 'matched' in case all matches were declined
      .order('created_at', { ascending: false })

    if (error) {
      console.error('Error finding unmatched requests:', error)
      return []
    }

    // Filter out requests that have active (non-declined, non-expired) matches
    const requestsToRetry = []
    
    for (const request of unmatchedRequests || []) {
      const { data: activeMatches } = await supabase
        .from('matches')
        .select('id, status')
        .eq('request_id', request.id)
        .not('status', 'in', '(declined,expired)')

      // If no active matches, this request can be retried
      if (!activeMatches || activeMatches.length === 0) {
        requestsToRetry.push(request)
      }
    }

    return requestsToRetry
  } catch (error) {
    console.error('Error in findUnmatchedRequests:', error)
    return []
  }
}

/**
 * Retry matching for a specific request
 */
export async function retryMatchingForRequest(requestId) {
  const supabase = createAdminClient()
  
  try {
    console.log(`🔄 Retrying matching for request: ${requestId}`)

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
      console.error('Request not found for retry:', requestError)
      return { success: false, error: 'Request not found' }
    }

    // Get all potential matches (excluding the requester and users who already declined)
    const { data: declinedUserIds } = await supabase
      .from('matches')
      .select('matched_user_id')
      .eq('request_id', requestId)
      .eq('status', 'declined')

    const excludedUserIds = [
      requestData.requester_id,
      ...(declinedUserIds || []).map(m => m.matched_user_id)
    ]

    const { data: potentialMatches, error: matchesError } = await supabase
      .from('profiles')
      .select('id, faculty, program, knowledgeTags, curiosityTags')
      .not('id', 'in', `(${excludedUserIds.join(',')})`)
      .eq('profile_completed', true)

    if (matchesError) {
      console.error('Error fetching potential matches for retry:', matchesError)
      return { success: false, error: 'Error finding matches' }
    }

    if (!potentialMatches || potentialMatches.length === 0) {
      console.log('No new potential matches found for retry')
      return { success: false, error: 'No new potential matches' }
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
      console.log('No matches found above threshold for retry')
      return { success: false, error: 'No matches above threshold' }
    }

    // Get the best match
    const bestMatch = validMatches[0]

    // Check cooldown period
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
      console.log('Best match in cooldown period for retry')
      return { success: false, error: 'Best match in cooldown period' }
    }

    // Create the new match record
    const expiresAt = new Date()
    expiresAt.setDate(expiresAt.getDate() + matchingConfig.expiryDays)

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
      console.error('Error creating retry match:', matchError)
      return { success: false, error: 'Error creating match' }
    }

    // Update request status
    await supabase
      .from('requests')
      .update({ status: 'matched' })
      .eq('id', requestId)

    // Send notification email
    try {
      const emailResult = await sendMatchNotificationEmail(matchData.id)
      if (emailResult.success) {
        console.log(`✅ Retry match created and notification sent: ${matchData.id} with score ${bestMatch.score}`)
      } else {
        console.error('Failed to send retry notification email:', emailResult.error)
      }
    } catch (emailError) {
      console.error('Error sending retry notification email:', emailError)
    }

    return {
      success: true,
      matchId: matchData.id,
      matchScore: bestMatch.score,
      message: 'Retry match created successfully'
    }

  } catch (error) {
    console.error('Error in retryMatchingForRequest:', error)
    return { success: false, error: 'Internal error' }
  }
}

/**
 * Retry matching for all unmatched requests
 */
export async function retryAllUnmatchedRequests() {
  console.log('🔄 Starting retry matching for all unmatched requests...')
  
  const unmatchedRequests = await findUnmatchedRequests()
  console.log(`Found ${unmatchedRequests.length} unmatched requests to retry`)

  const results = []
  
  for (const request of unmatchedRequests) {
    const result = await retryMatchingForRequest(request.id)
    results.push({
      requestId: request.id,
      ...result
    })
    
    // Add a small delay to avoid overwhelming the system
    await new Promise(resolve => setTimeout(resolve, 100))
  }

  const successful = results.filter(r => r.success).length
  const failed = results.filter(r => !r.success).length
  
  console.log(`✅ Retry matching complete: ${successful} successful, ${failed} failed`)
  
  return {
    total: results.length,
    successful,
    failed,
    results
  }
}

// Matching algorithm (same as in match-request route)
function calculateMatchScore(requestText, requesterFaculty, requesterProgram, candidate) {
  let score = 0

  // Keyword Match (Knowledge)
  if (candidate.knowledgeTags) {
    candidate.knowledgeTags.forEach(tag => {
      if (requestText.includes(tag.toLowerCase())) {
        score += matchingConfig.scoring.knowledgeTag
      }
    })
  }

  // Keyword Match (Curiosity)
  if (candidate.curiosityTags) {
    candidate.curiosityTags.forEach(tag => {
      if (requestText.includes(tag.toLowerCase())) {
        score += matchingConfig.scoring.curiosityTag
      }
    })
  }

  // Faculty Bonus
  if (candidate.faculty !== requesterFaculty) {
    score += matchingConfig.scoring.facultyBonus
  }

  // Program Penalty
  if (candidate.program === requesterProgram) {
    score -= matchingConfig.scoring.sameProgramPenalty
  }

  return Math.max(0, score)
}