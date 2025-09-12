# Email Verification Troubleshooting Guide

## Common Email Verification Issues

### Issue: "Email Link Expired" Error

This happens when clicking verification links, especially in Outlook or corporate email systems.

### Root Causes:

1. **Outlook SafeLinks**: Outlook wraps URLs in a "SafeLinks" protection system that can corrupt the verification token
2. **Email client delays**: Some email clients pre-scan links, causing them to expire before you click them
3. **Time delays**: Verification links have a 24-hour expiration for security

### Solutions:

#### Option 1: Try a Different Email Client
- Use Gmail, Apple Mail, or another email client instead of Outlook
- Forward the verification email to a personal email account

#### Option 2: Copy the Link Manually
1. Right-click the verification link in your email
2. Select "Copy link address" (don't click the link directly)
3. Paste the URL directly into your browser address bar
4. Remove any Outlook SafeLinks wrapper if present

#### Option 3: Use the Resend Feature
1. Go to the login page
2. Enter your email address
3. Try to sign in (it will show an error about email verification)
4. Click "Resend Verification Email"
5. Check your inbox for a fresh link

#### Option 4: Disable SafeLinks (Corporate Users)
If you're using a corporate Outlook account:
1. Contact your IT department about SafeLinks interfering with application verification
2. Ask them to whitelist `*.supabase.co` domains
3. Or request an exception for McGill email addresses

### For McGill IT: Whitelist Suggestions

To improve the verification experience for McGill students:

1. **Whitelist Supabase domains** in SafeLinks:
   - `*.supabase.co`
   - `*.supabase.io`

2. **Allow direct links** for educational applications
3. **Consider domain exceptions** for `.mcgill.ca` applications

### Prevention Tips:

1. **Click verification links quickly** after receiving them
2. **Check spam/junk folders** regularly
3. **Use personal email clients** when possible for verification
4. **Don't forward verification emails** - they're tied to the original recipient

### Still Having Issues?

If verification continues to fail:

1. Try signing up with a different email address temporarily
2. Contact the Synapse support team
3. Use the manual account approval process (if available)

### Technical Details

The verification flow uses:
- PKCE (Proof Key for Code Exchange) for security
- JWT tokens with 24-hour expiration
- OAuth 2.0 redirect flow
- Supabase Auth with email confirmation required

Email client interference can break this flow by:
- Modifying or wrapping the callback URL
- Pre-accessing links during scanning
- Adding tracking parameters that invalidate the token
