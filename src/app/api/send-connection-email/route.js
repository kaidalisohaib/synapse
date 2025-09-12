import { createClient } from '@/lib/supabase/server'
import { resend, emailConfig } from '@/lib/resend'
import { NextResponse } from 'next/server'
import { adminConfig } from '@/lib/config'

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

    // Get match details with request and user information
    const { data: matchData, error: matchError } = await supabase
      .from('matches')
      .select(`
        id,
        match_score,
        matched_user_id,
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

    // SECURITY: Verify user is authorized to send connection email for this match
    const isAdmin = adminConfig.emails.includes(user.email)
    const isMatchedUser = matchData.matched_user_id === user.id
    const isRequester = matchData.requests.requester_id === user.id

    if (!isAdmin && !isMatchedUser && !isRequester) {
      return NextResponse.json(
        { error: 'Forbidden: You are not authorized to send connection emails for this match' },
        { status: 403 }
      )
    }

    // Get both users' emails and profile information
    const { data: requesterUser, error: requesterError } = await supabase.auth.admin
      .getUserById(matchData.requests.requester_id)

    const { data: matchedUser, error: matchedError } = await supabase.auth.admin
      .getUserById(matchData.matched_user_id)

    if (requesterError || matchedError || !requesterUser.user || !matchedUser.user) {
      console.error('User lookup error:', requesterError || matchedError)
      return NextResponse.json(
        { error: 'Users not found' },
        { status: 404 }
      )
    }

    // Get matched user's profile
    const { data: matchedProfile, error: profileError } = await supabase
      .from('profiles')
      .select('name, faculty, program, year')
      .eq('id', matchData.matched_user_id)
      .single()

    if (profileError) {
      console.error('Matched user profile not found:', profileError)
      return NextResponse.json(
        { error: 'Matched user profile not found' },
        { status: 404 }
      )
    }

    const requesterEmail = requesterUser.user.email
    const matchedEmail = matchedUser.user.email
    const requesterName = matchData.requests.profiles.name
    const matchedName = matchedProfile.name
    const requestText = matchData.requests.request_text

    // Send email to requester
    const requesterEmailHtml = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <title>You're Connected! - Synapse</title>
      </head>
      <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
        <div style="background: linear-gradient(135deg, #10B981 0%, #059669 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0;">
          <h1 style="margin: 0; font-size: 28px;">🎉 You're Connected!</h1>
          <p style="margin: 10px 0 0 0; font-size: 18px;">Synapse - Curiosity Connector</p>
        </div>
        
        <div style="background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px;">
          <h2 style="color: #10B981; margin-top: 0;">Great news, ${requesterName}!</h2>
          
          <p>Your curiosity request has been accepted! 🎯</p>
          
          <div style="background: white; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #10B981;">
            <h3 style="margin: 0 0 10px 0; color: #333;">Your Matched Student:</h3>
            <p style="margin: 5px 0;"><strong>Name:</strong> ${matchedName}</p>
            <p style="margin: 5px 0;"><strong>Faculty:</strong> ${matchedProfile.faculty}</p>
            <p style="margin: 5px 0;"><strong>Program:</strong> ${matchedProfile.program}</p>
            <p style="margin: 5px 0;"><strong>Year:</strong> ${matchedProfile.year}</p>
            <p style="margin: 5px 0;"><strong>Email:</strong> <a href="mailto:${matchedEmail}" style="color: #10B981;">${matchedEmail}</a></p>
          </div>
          
          <div style="background: white; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #007BFF;">
            <h3 style="margin: 0 0 10px 0; color: #333;">Your Original Question:</h3>
            <p style="margin: 0; font-style: italic; color: #555;">"${requestText}"</p>
          </div>
          
          <div style="background: #E8F5E8; padding: 15px; border-radius: 8px; margin: 20px 0;">
            <h4 style="margin: 0 0 10px 0; color: #155724;">💡 Next Steps:</h4>
            <ol style="margin: 0; color: #155724; font-size: 14px;">
              <li>Reach out to ${matchedName} at the email above</li>
              <li>Introduce yourself and reference your question</li>
              <li>Arrange a convenient time to chat (coffee, video call, etc.)</li>
              <li>Enjoy your interdisciplinary conversation!</li>
            </ol>
          </div>
          
          <div style="background: #FFF3CD; padding: 15px; border-radius: 8px; margin: 20px 0; border: 1px solid #FFEAA7;">
            <h4 style="margin: 0 0 10px 0; color: #856404;">🤝 Tips for a great conversation:</h4>
            <ul style="margin: 0; color: #856404; font-size: 14px;">
              <li>Be respectful of their time and expertise</li>
              <li>Come prepared with specific questions</li>
              <li>Be open to learning new perspectives</li>
              <li>Consider this the start of a valuable connection</li>
            </ul>
          </div>
          
          <hr style="border: none; border-top: 1px solid #eee; margin: 30px 0;">
          
          <p style="font-size: 12px; color: #999; text-align: center;">
            This email was sent by Synapse, McGill University's curiosity connector.<br>
            If you have questions, please contact support.
          </p>
        </div>
      </body>
      </html>
    `

    // Send email to matched user
    const matchedEmailHtml = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <title>Connection Confirmed! - Synapse</title>
      </head>
      <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
        <div style="background: linear-gradient(135deg, #10B981 0%, #059669 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0;">
          <h1 style="margin: 0; font-size: 28px;">✅ Connection Confirmed!</h1>
          <p style="margin: 10px 0 0 0; font-size: 18px;">Synapse - Curiosity Connector</p>
        </div>
        
        <div style="background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px;">
          <h2 style="color: #10B981; margin-top: 0;">Thank you, ${matchedName}!</h2>
          
          <p>You've confirmed your match and agreed to help a fellow student. This is what makes the McGill community special! 🌟</p>
          
          <div style="background: white; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #10B981;">
            <h3 style="margin: 0 0 10px 0; color: #333;">Student You're Helping:</h3>
            <p style="margin: 5px 0;"><strong>Name:</strong> ${requesterName}</p>
            <p style="margin: 5px 0;"><strong>Faculty:</strong> ${matchData.requests.profiles.faculty}</p>
            <p style="margin: 5px 0;"><strong>Program:</strong> ${matchData.requests.profiles.program}</p>
            <p style="margin: 5px 0;"><strong>Year:</strong> ${matchData.requests.profiles.year}</p>
            <p style="margin: 5px 0;"><strong>Email:</strong> <a href="mailto:${requesterEmail}" style="color: #10B981;">${requesterEmail}</a></p>
          </div>
          
          <div style="background: white; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #007BFF;">
            <h3 style="margin: 0 0 10px 0; color: #333;">Their Question:</h3>
            <p style="margin: 0; font-style: italic; color: #555;">"${requestText}"</p>
          </div>
          
          <div style="background: #E8F5E8; padding: 15px; border-radius: 8px; margin: 20px 0;">
            <h4 style="margin: 0 0 10px 0; color: #155724;">💡 What to expect:</h4>
            <ul style="margin: 0; color: #155724; font-size: 14px;">
              <li>${requesterName} will likely reach out to you via email</li>
              <li>You can arrange a time that works for both of you</li>
              <li>The conversation can be in-person, video call, or whatever you prefer</li>
              <li>Share your knowledge and enjoy learning about their perspective too!</li>
            </ul>
          </div>
          
          <div style="background: #FFF3CD; padding: 15px; border-radius: 8px; margin: 20px 0; border: 1px solid #FFEAA7;">
            <h4 style="margin: 0 0 10px 0; color: #856404;">🎓 Making the most of it:</h4>
            <ul style="margin: 0; color: #856404; font-size: 14px;">
              <li>Share your expertise but also listen to their insights</li>
              <li>Ask about their field too - learn from each other!</li>
              <li>Consider this the start of a valuable interdisciplinary connection</li>
              <li>You're contributing to the research on student connections at McGill</li>
            </ul>
          </div>
          
          <hr style="border: none; border-top: 1px solid #eee; margin: 30px 0;">
          
          <p style="font-size: 12px; color: #999; text-align: center;">
            This email was sent by Synapse, McGill University's curiosity connector.<br>
            If you have questions, please contact support.
          </p>
        </div>
      </body>
      </html>
    `

    // Send both emails
    const emailPromises = [
      resend.emails.send({
        from: emailConfig.from,
        to: [requesterEmail],
        subject: '🎉 You\'re connected! Your match has been confirmed',
        html: requesterEmailHtml
      }),
      resend.emails.send({
        from: emailConfig.from,
        to: [matchedEmail],
        subject: '✅ Connection confirmed! Time to help a fellow student',
        html: matchedEmailHtml
      })
    ]

    const emailResults = await Promise.all(emailPromises)

    const emailErrors = emailResults.filter(result => result.error)
    if (emailErrors.length > 0) {
      console.error('Email send errors:', emailErrors)
      return NextResponse.json(
        { error: 'Failed to send one or more emails' },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      emailIds: emailResults.map(result => result.data.id),
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
