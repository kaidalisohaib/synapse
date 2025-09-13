import { createClient } from '@/lib/supabase/server'
import { createClient as createSupabaseClient } from '@supabase/supabase-js'
import { resend, emailConfig } from '@/lib/resend'
import { appConfig } from '@/lib/config'

// Create admin client for user management operations
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
 * Send match notification email to the matched user
 * @param {string} matchId - The ID of the match
 * @returns {Promise<{success: boolean, emailId?: string, error?: string}>}
 */
export async function sendMatchNotificationEmail(matchId) {
  try {
    // Validate matchId is a valid UUID format
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i
    if (!uuidRegex.test(matchId)) {
      throw new Error('Invalid match ID format')
    }

    const supabase = await createClient()

    // Get match details first
    const { data: matchData, error: matchError } = await supabase
      .from('matches')
      .select(`
        id,
        match_score,
        matched_user_id,
        request_id,
        created_at
      `)
      .eq('id', matchId)
      .single()

    if (matchError || !matchData) {
      throw new Error(`Match not found: ${matchError?.message || 'Unknown error'}`)
    }

    // Get request details separately
    const { data: requestData, error: requestError } = await supabase
      .from('requests')
      .select(`
        id,
        request_text,
        requester_id,
        profiles!requests_requester_id_fkey (
          name,
          faculty,
          program,
          year
        )
      `)
      .eq('id', matchData.request_id)
      .single()

    if (requestError || !requestData) {
      throw new Error(`Request not found: ${requestError?.message || 'Unknown error'}`)
    }

    // Get the matched user's email using admin client
    const adminClient = createAdminClient()
    const { data: userData, error: userError } = await adminClient.auth.admin
      .getUserById(matchData.matched_user_id)

    if (userError || !userData.user) {
      throw new Error(`User not found: ${userError?.message || 'Unknown error'}`)
    }

    const matchedUserEmail = userData.user.email
    const requesterName = requestData.profiles.name
    const requesterInfo = `${requestData.profiles.faculty}, ${requestData.profiles.program}, ${requestData.profiles.year}`
    const requestText = requestData.request_text
    const matchScore = matchData.match_score

    // Create the accept link
    const acceptUrl = `${appConfig.url}/match/${matchId}/accept`

    // In development mode, override email recipient for testing
    const isDevelopment = process.env.NODE_ENV === 'development'
    const testEmailOverride = isDevelopment ? process.env.TEST_EMAIL_OVERRIDE : null
    const finalRecipient = testEmailOverride || matchedUserEmail

    if (testEmailOverride) {
      console.log(`🧪 DEVELOPMENT MODE: Sending match notification to ${testEmailOverride} instead of ${matchedUserEmail}`)
    }

    // Send the email
    const { data: emailData, error: emailError } = await resend.emails.send({
      from: emailConfig.from,
      to: [finalRecipient],
      subject: testEmailOverride
        ? '[DEV] 🎯 You\'ve been matched with a curious McGill student!'
        : '🎯 You\'ve been matched with a curious McGill student!',
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
              ${testEmailOverride ? `<br><br><strong>🧪 DEVELOPMENT MODE:</strong> This email would normally go to ${matchedUserEmail}` : ''}
            </p>
          </div>
        </body>
        </html>
      `
    })

    if (emailError) {
      console.error('Resend API error details:', emailError)
      throw new Error(`Failed to send email: ${emailError.message || JSON.stringify(emailError)}`)
    }

    return {
      success: true,
      emailId: emailData.id
    }

  } catch (error) {
    console.error('Send match notification error:', error)
    return {
      success: false,
      error: error.message
    }
  }
}

/**
 * Send connection email to both users when a match is accepted
 * @param {string} matchId - The ID of the match
 * @returns {Promise<{success: boolean, emailIds?: string[], error?: string}>}
 */
export async function sendConnectionEmail(matchId) {
  try {
    // Validate matchId is a valid UUID format
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i
    if (!uuidRegex.test(matchId)) {
      throw new Error('Invalid match ID format')
    }

    const supabase = await createClient()

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
      throw new Error(`Match not found: ${matchError?.message || 'Unknown error'}`)
    }

    // Get both users' emails and profile information
    const adminClient = createAdminClient()
    const { data: requesterUser, error: requesterError } = await adminClient.auth.admin
      .getUserById(matchData.requests.requester_id)

    const { data: matchedUser, error: matchedError } = await adminClient.auth.admin
      .getUserById(matchData.matched_user_id)

    if (requesterError || matchedError || !requesterUser.user || !matchedUser.user) {
      throw new Error(`Users not found: ${requesterError?.message || matchedError?.message || 'Unknown error'}`)
    }

    // Get matched user's profile
    const { data: matchedProfile, error: profileError } = await supabase
      .from('profiles')
      .select('name, faculty, program, year')
      .eq('id', matchData.matched_user_id)
      .single()

    if (profileError) {
      throw new Error(`Matched user profile not found: ${profileError.message}`)
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

    // In development mode, override email recipients for testing
    const isDevelopment = process.env.NODE_ENV === 'development'
    const testEmailOverride = isDevelopment ? process.env.TEST_EMAIL_OVERRIDE : null
    const finalRequesterEmail = testEmailOverride || requesterEmail
    const finalMatchedEmail = testEmailOverride || matchedEmail

    if (testEmailOverride) {
      console.log(`🧪 DEVELOPMENT MODE: Sending connection emails to ${testEmailOverride} instead of ${requesterEmail} and ${matchedEmail}`)
    }

    // Send both emails
    console.log('Sending connection emails to:', {
      requester: finalRequesterEmail,
      matched: finalMatchedEmail
    })
    console.log('Email config:', emailConfig)

    const emailPromises = [
      resend.emails.send({
        from: emailConfig.from,
        to: [finalRequesterEmail],
        subject: testEmailOverride
          ? '[DEV - REQUESTER] 🎉 You\'re connected! Your match has been confirmed'
          : '🎉 You\'re connected! Your match has been confirmed',
        html: requesterEmailHtml
      }),
      resend.emails.send({
        from: emailConfig.from,
        to: [finalMatchedEmail],
        subject: testEmailOverride
          ? '[DEV - MATCHED] ✅ Connection confirmed! Time to help a fellow student'
          : '✅ Connection confirmed! Time to help a fellow student',
        html: matchedEmailHtml
      })
    ]

    const emailResults = await Promise.all(emailPromises)

    // Log all results for debugging
    console.log('Email results:', emailResults)

    const emailErrors = emailResults.filter(result => result.error)
    if (emailErrors.length > 0) {
      console.error('Email errors details:', emailErrors)
      const errorMessages = emailErrors.map(e =>
        e.error?.message || JSON.stringify(e.error) || 'Unknown email error'
      ).join(', ')
      throw new Error(`Failed to send one or more emails: ${errorMessages}`)
    }

    return {
      success: true,
      emailIds: emailResults.map(result => result.data.id)
    }

  } catch (error) {
    console.error('Send connection email error:', error)
    return {
      success: false,
      error: error.message
    }
  }
}