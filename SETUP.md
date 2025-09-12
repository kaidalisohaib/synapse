# Synapse Project Setup Guide

This guide will help you set up the Synapse project from scratch.

## Prerequisites

- Node.js 18+ installed
- A Supabase account
- A Resend account (for email functionality)

## Step 1: Environment Variables

Create a `.env.local` file in the root directory with the following variables:

```bash
# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key

# Resend Configuration
RESEND_API_KEY=your_resend_api_key

# App Configuration
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

## Step 2: Supabase Setup

1. Create a new project at [supabase.com](https://supabase.com)
2. Go to Settings > API to get your project URL and API keys
3. In the Supabase dashboard, go to the SQL Editor
4. Copy and paste the contents of `supabase-schema.sql` and run it
5. This will create all necessary tables, indexes, and RLS policies

**Note**: If you get an error about `auth.users` table permissions, that's normal - we've already removed that line from the schema. The `auth.users` table is managed by Supabase automatically.

### Database Tables Created:
- `profiles` - User profile information
- `requests` - Curiosity requests submitted by users
- `matches` - Matches between requests and users
- `conversation_feedback` - Post-conversation feedback
- `user_activity` - User activity tracking

## Step 3: Resend Setup

1. Create an account at [resend.com](https://resend.com)
2. Get your API key from the dashboard
3. Add your API key to the `.env.local` file

## Step 4: Install Dependencies

```bash
npm install
```

## Step 5: Run the Development Server

```bash
npm run dev
```

The application will be available at [http://localhost:3000](http://localhost:3000).

## Step 6: Test the Application

1. Visit the homepage
2. Click "Sign Up" and create an account with a McGill email
3. Check your email for verification
4. Complete your profile setup
5. Try the core features

## Authentication Flow

The application uses Supabase Auth with the following flow:

1. User signs up with McGill email
2. Email verification is required
3. After verification, user completes profile setup
4. User is redirected to dashboard

## Database Security

The application uses Row Level Security (RLS) with the following policies:

- Users can view all profiles but only edit their own
- Users can view all requests but only create their own
- Users can only view matches they're involved in
- Feedback is restricted to participants in the conversation

## File Structure

```
src/
├── app/                    # Next.js 13+ app directory
│   ├── auth/              # Authentication pages
│   ├── login/             # Login page
│   ├── signup/            # Signup page
│   ├── profile/           # Profile pages
│   └── page.js            # Homepage
├── components/            # React components
│   ├── ui/               # Reusable UI components
│   └── Navbar.js         # Navigation component
└── lib/                  # Utility libraries
    ├── supabase/         # Supabase configuration
    └── resend.js         # Email configuration
```

## Next Steps

After completing the basic setup, you can:

1. Create the dashboard page
2. Implement the request submission flow
3. Build the matching algorithm
4. Set up email notifications
5. Create the admin dashboard

## Troubleshooting

### Common Issues:

1. **Authentication errors**: Check that your Supabase URL and keys are correct
2. **Database errors**: Ensure the schema has been applied correctly
3. **Email issues**: Verify your Resend API key and domain setup
4. **CORS errors**: Make sure your domain is added to Supabase auth settings

### Support

If you encounter issues, check:
- Supabase dashboard for database errors
- Browser console for JavaScript errors
- Next.js terminal output for server errors
