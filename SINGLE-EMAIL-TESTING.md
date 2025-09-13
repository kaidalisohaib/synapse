# Single Email Testing Guide for Synapse

This guide helps you test the complete Synapse platform functionality using only one McGill email address.

## Setup Instructions

### Step 1: Update Test Script
1. Open `setup-test-data.js`
2. Replace all instances of `your.email` with your actual McGill email prefix
   ```javascript
   // Change this:
   email: 'your.email+requester@mail.mcgill.ca'
   // To this (example):
   email: 'john.doe+requester@mail.mcgill.ca'
   ```

### Step 2: Install Dependencies
```bash
npm install @supabase/supabase-js dotenv
```

### Step 3: Set Up Test Data
```bash
node setup-test-data.js
```

## Testing Workflow

### Phase 1: Basic Authentication Testing
1. **Test Sign Up**
   - Use `your.email+test1@mail.mcgill.ca`
   - Verify email verification works
   - Complete profile setup

2. **Test Sign In**
   - Sign out and sign back in
   - Verify session persistence

### Phase 2: Profile and Request Testing
1. **Create Different User Profiles**
   - Sign up with `your.email+science@mail.mcgill.ca` (Science faculty)
   - Sign up with `your.email+arts@mail.mcgill.ca` (Arts faculty)
   - Give them different knowledge/curiosity tags

2. **Submit Test Requests**
   - Sign in as Science user
   - Submit request mentioning psychology topics
   - Sign in as Arts user  
   - Submit request mentioning programming topics

### Phase 3: Matching System Testing
1. **Trigger Matching**
   - Submit requests that should match based on tags
   - Check database for created matches
   - Verify match scores are calculated correctly

2. **Email Verification**
   - Check your email inbox for match notifications
   - All emails will come to your main inbox
   - Look for emails with different "To" addresses (the aliases)

### Phase 4: Match Acceptance Testing
1. **Accept Matches**
   - Click accept links in emails
   - Verify you're signed in as the correct user
   - Test both accept and decline flows

2. **Connection Emails**
   - Verify connection emails are sent to both users
   - Check that contact information is shared correctly

## Database Inspection Commands

Use these SQL queries in Supabase to inspect test data:

```sql
-- View all test users
SELECT email, name, faculty, program FROM auth.users 
JOIN profiles ON auth.users.id = profiles.id 
WHERE email LIKE '%+%@mail.mcgill.ca';

-- View all requests and their status
SELECT r.id, r.request_text, r.status, p.name, p.faculty 
FROM requests r 
JOIN profiles p ON r.requester_id = p.id;

-- View all matches with scores
SELECT m.id, m.status, m.match_score, 
       req.name as requester, mat.name as matched_user
FROM matches m
JOIN profiles req ON m.request_id IN (
  SELECT id FROM requests WHERE requester_id = req.id
)
JOIN profiles mat ON m.matched_user_id = mat.id;
```

## Email Testing Tips

### Gmail Alias Testing
If using Gmail, these all deliver to the same inbox:
- `your.email+requester@mail.mcgill.ca`
- `your.email+matcher@mail.mcgill.ca`
- `your.email+test@mail.mcgill.ca`

### Email Organization
1. **Create Gmail Labels**
   - "Synapse Requester" for +requester emails
   - "Synapse Matcher" for +matcher emails
   - Set up filters to auto-label

2. **Email Filters**
   ```
   To: your.email+requester@mail.mcgill.ca
   Apply label: Synapse Requester
   ```

## Testing Checklist

### ✅ Authentication Flow
- [ ] Sign up with email alias works
- [ ] Email verification received and works
- [ ] Profile setup completes successfully
- [ ] Sign in/out works correctly

### ✅ Profile Management
- [ ] Different faculties can be selected
- [ ] Knowledge/curiosity tags save correctly
- [ ] Profile editing works
- [ ] Dashboard displays user info

### ✅ Request and Matching
- [ ] Curiosity requests can be submitted
- [ ] Matching algorithm creates matches
- [ ] Match scores calculated correctly
- [ ] Email notifications sent automatically

### ✅ Match Acceptance
- [ ] Accept links work correctly
- [ ] User authentication verified
- [ ] Match status updates properly
- [ ] Connection emails sent to both users

### ✅ Admin Dashboard
- [ ] Admin can view all users
- [ ] System statistics display correctly
- [ ] Request and match data visible

## Troubleshooting

### Common Issues

1. **Emails Not Received**
   - Check spam folder
   - Verify Resend API key is configured
   - Check Supabase logs for email errors

2. **Authentication Issues**
   - Clear browser cookies/localStorage
   - Check Supabase auth settings
   - Verify email confirmation status

3. **Matching Not Working**
   - Check that users have different faculties
   - Verify knowledge/curiosity tags overlap
   - Check minimum score threshold in config

4. **Database Errors**
   - Check RLS policies are enabled
   - Verify user has proper permissions
   - Check foreign key constraints

## Advanced Testing

### Load Testing with Multiple Aliases
Create many aliases to test:
- `your.email+user1@mail.mcgill.ca`
- `your.email+user2@mail.mcgill.ca`
- `your.email+user3@mail.mcgill.ca`
- etc.

### Automated Testing
Run the basic functionality test:
```bash
node test-basic-functionality.js
```

### Manual API Testing
Use curl or Postman to test API endpoints:
```bash
# Test unauthenticated request (should return 401)
curl -X POST http://localhost:3000/api/match-request \
  -H "Content-Type: application/json" \
  -d '{"requestId": "test"}'
```

## Cleanup

After testing, clean up test data:
```bash
node setup-test-data.js --cleanup
```

This removes all test users and associated data from your database.

## Production Testing

Before going live:
1. Test with real McGill email addresses from friends/colleagues
2. Verify email delivery to different email providers
3. Test on different devices and browsers
4. Confirm all security measures work correctly

Remember: This testing approach simulates multiple users but all emails come to your inbox. In production, each user will have their own separate email address.