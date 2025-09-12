import { createClient } from '@/lib/supabase/server'
import { resend, emailConfig } from '@/lib/resend'
import { NextResponse } from 'next/server'
import { adminConfig, appConfig } from '@/lib/config'

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

    // SECURITY: Only allow system/admin to send match notifications
    const isAdmin = adminConfig.emails.includes(user.email)
    
    if (!isAdmin) {
      return NextResponse.json(
        { error: 'Forbidden: Only system can send match notifications' },
        { status: 403 }
      )
    }

    // Get match details with request and user information
    const { data: matchData, error: matchError } = await supabase
      .from('matches')
      .select(`
        id,
        match_score,
        created_at,
        requests!inner (
          id,
          request_text,
          requester_id,
          profiles!requests_requester_id_fkey (
            name,
            faculty,
            program,
            year
          )
        ),
        profiles!matches_matched_user_id_fkey (
          name
        )
      `)
      .eq('id', matchId)
      .single()

    if (matchError || !matchData) {
      console.error('Match not found:', matchError)
      return NextResponse.json(
        { error: 'Match not found' },
        { status: 404 }
      )
    }

    // Get the matched user's email
    const { data: userData, error: userError } = await supabase.auth.admin
      .getUserById(matchData.matched_user_id)

    if (userError || !userData.user) {
      console.error('User not found:', userError)
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      )
    }

    const matchedUserEmail = userData.user.email
    const requesterName = matchData.requests.profiles.name
    const requesterInfo = `${matchData.requests.profiles.faculty}, ${matchData.requests.profiles.program}, ${matchData.requests.profiles.year}`
    const requestText = matchData.requests.request_text
    const matchScore = matchData.match_score

    // Create the accept link
    const acceptUrl = `${appConfig.url}/match/${matchId}/accept`

    // Send the email
    const { data: emailData, error: emailError } = await resend.emails.send({
      from: emailConfig.from,
      to: [matchedUserEmail],
      subject: '🎯 You\'ve been matched with a curious McGill student!',
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="utf-8">
          <title>New Match Request - Synapse</title>
        </head>
        <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
          <div style="background: linear-gradient(135deg, #EE3124 0%, #C41E3A 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0;">
            <h1 style="margin: 0; font-size: 28px;">🧠 Synapse</h1>
            <p style="margin: 10px 0 0 0; font-size: 18px;">Curiosity Connector</p>
          </div>
          
          <div style="background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px;">
            <h2 style="color: #EE3124; margin-top: 0;">You've been matched!</h2>
            
            <p>Hi there! 👋</p>
            
            <p>A fellow McGill student has a question that matches your knowledge areas. Our algorithm found you as a great match (Score: <strong>${matchScore} points</strong>)!</p>
            
            <div style="background: white; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #EE3124;">
              <h3 style="margin: 0 0 10px 0; color: #333;">Student Information:</h3>
              <p style="margin: 5px 0;"><strong>Name:</strong> ${requesterName}</p>
              <p style="margin: 5px 0;"><strong>Background:</strong> ${requesterInfo}</p>
            </div>
            
            <div style="background: white; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #007BFF;">
              <h3 style="margin: 0 0 10px 0; color: #333;">Their Question:</h3>
              <p style="margin: 0; font-style: italic; color: #555;">"${requestText}"</p>
            </div>
            
            <div style="background: #FFF3CD; padding: 15px; border-radius: 8px; margin: 20px 0; border: 1px solid #FFEAA7;">
              <h4 style="margin: 0 0 10px 0; color: #856404;">💡 Why you were matched:</h4>
              <p style="margin: 0; color: #856404; font-size: 14px;">Our algorithm found connections between their question and your knowledge/curiosity tags. This is a great opportunity for interdisciplinary learning!</p>
            </div>
            
            <div style="text-align: center; margin: 30px 0;">
              <a href="${acceptUrl}" style="background: #EE3124; color: white; padding: 15px 30px; text-decoration: none; border-radius: 5px; font-weight: bold; font-size: 16px; display: inline-block;">
                ✅ Accept & Connect
              </a>
            </div>
            
            <div style="background: #E8F5E8; padding: 15px; border-radius: 8px; margin: 20px 0;">
              <h4 style="margin: 0 0 10px 0; color: #155724;">What happens if you accept?</h4>
              <ul style="margin: 0; color: #155724; font-size: 14px;">
                <li>Both you and ${requesterName} will receive an introduction email</li>
                <li>You'll get each other's contact information to arrange a chat</li>
                <li>You can connect via your preferred method (video call, coffee, etc.)</li>
                <li>Help foster interdisciplinary learning at McGill!</li>
              </ul>
            </div>
            
            <p style="font-size: 14px; color: #666; text-align: center; margin-top: 30px;">
              <strong>No pressure!</strong> Only accept if you're genuinely interested and have time to help.<br>
              This link will expire in 7 days.
            </p>
            
            <hr style="border: none; border-top: 1px solid #eee; margin: 30px 0;">
            
            <p style="font-size: 12px; color: #999; text-align: center;">
              This email was sent by Synapse, McGill University's curiosity connector.<br>
              If you have questions, please contact support.
            </p>
          </div>
        </body>
        </html>
      `
    })

    if (emailError) {
      console.error('Email send error:', emailError)
      return NextResponse.json(
        { error: 'Failed to send email' },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      emailId: emailData.id,
      message: 'Match notification email sent'
    })

  } catch (error) {
    console.error('Send match notification error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
