-- Create profiles table
CREATE TABLE IF NOT EXISTS public.profiles (
    id UUID REFERENCES auth.users ON DELETE CASCADE,
    name TEXT,
    faculty TEXT,
    program TEXT,
    year TEXT,
    "knowledgeTags" TEXT[],
    "curiosityTags" TEXT[],
    email_verified BOOLEAN DEFAULT false,
    profile_completed BOOLEAN DEFAULT false,
    created_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL,
    PRIMARY KEY (id)
);

-- Create requests table
CREATE TABLE IF NOT EXISTS public.requests (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    requester_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
    request_text TEXT NOT NULL,
    status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'matched', 'confirmed', 'completed')),
    created_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Create matches table
CREATE TABLE IF NOT EXISTS public.matches (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    request_id UUID REFERENCES public.requests(id) ON DELETE CASCADE,
    matched_user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
    status TEXT DEFAULT 'notified' CHECK (status IN ('notified', 'accepted', 'declined', 'expired')),
    match_score INTEGER,
    expires_at TIMESTAMPTZ DEFAULT (timezone('utc'::text, now()) + INTERVAL '7 days'),
    created_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Create conversation_feedback table
CREATE TABLE IF NOT EXISTS public.conversation_feedback (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    match_id UUID REFERENCES public.matches(id) ON DELETE CASCADE,
    feedback_rating INTEGER CHECK (feedback_rating >= 1 AND feedback_rating <= 5),
    feedback_text TEXT,
    submitted_by UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
    created_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Create user_activity table
CREATE TABLE IF NOT EXISTS public.user_activity (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
    activity_type TEXT NOT NULL,
    metadata JSONB,
    created_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS profiles_faculty_idx ON public.profiles(faculty);
CREATE INDEX IF NOT EXISTS profiles_program_idx ON public.profiles(program);
CREATE INDEX IF NOT EXISTS profiles_knowledge_tags_idx ON public.profiles USING GIN("knowledgeTags");
CREATE INDEX IF NOT EXISTS profiles_curiosity_tags_idx ON public.profiles USING GIN("curiosityTags");
CREATE INDEX IF NOT EXISTS requests_requester_id_idx ON public.requests(requester_id);
CREATE INDEX IF NOT EXISTS requests_status_idx ON public.requests(status);
CREATE INDEX IF NOT EXISTS requests_created_at_idx ON public.requests(created_at);
CREATE INDEX IF NOT EXISTS matches_request_id_idx ON public.matches(request_id);
CREATE INDEX IF NOT EXISTS matches_matched_user_id_idx ON public.matches(matched_user_id);
CREATE INDEX IF NOT EXISTS matches_status_idx ON public.matches(status);
CREATE INDEX IF NOT EXISTS user_activity_user_id_idx ON public.user_activity(user_id);
CREATE INDEX IF NOT EXISTS user_activity_type_idx ON public.user_activity(activity_type);

-- Set up Row Level Security (RLS) policies

-- Profiles: Users can view all profiles but only update their own
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public profiles are viewable by everyone" ON public.profiles
    FOR SELECT USING (true);

CREATE POLICY "Users can insert their own profile" ON public.profiles
    FOR INSERT WITH CHECK (auth.uid() = id);

CREATE POLICY "Users can update own profile" ON public.profiles
    FOR UPDATE USING (auth.uid() = id);

-- Requests: Users can view all requests but only insert their own
ALTER TABLE public.requests ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Requests are viewable by everyone" ON public.requests
    FOR SELECT USING (true);

CREATE POLICY "Users can insert their own requests" ON public.requests
    FOR INSERT WITH CHECK (auth.uid() = requester_id);

CREATE POLICY "Users can update their own requests" ON public.requests
    FOR UPDATE USING (auth.uid() = requester_id);

-- Matches: Users can view matches they're involved in
ALTER TABLE public.matches ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own matches" ON public.matches
    FOR SELECT USING (
        auth.uid() = matched_user_id OR 
        auth.uid() IN (
            SELECT requester_id FROM public.requests WHERE id = request_id
        )
    );

CREATE POLICY "System can insert matches" ON public.matches
    FOR INSERT WITH CHECK (true);

CREATE POLICY "Users can update matches they're involved in" ON public.matches
    FOR UPDATE USING (
        auth.uid() = matched_user_id OR 
        auth.uid() IN (
            SELECT requester_id FROM public.requests WHERE id = request_id
        )
    );

-- Conversation feedback: Users can insert feedback for their matches
ALTER TABLE public.conversation_feedback ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view feedback for their matches" ON public.conversation_feedback
    FOR SELECT USING (
        auth.uid() = submitted_by OR
        auth.uid() IN (
            SELECT matched_user_id FROM public.matches WHERE id = match_id
        ) OR
        auth.uid() IN (
            SELECT requester_id FROM public.requests 
            WHERE id IN (SELECT request_id FROM public.matches WHERE id = match_id)
        )
    );

CREATE POLICY "Users can insert feedback for their matches" ON public.conversation_feedback
    FOR INSERT WITH CHECK (
        auth.uid() = submitted_by AND
        (
            auth.uid() IN (
                SELECT matched_user_id FROM public.matches WHERE id = match_id
            ) OR
            auth.uid() IN (
                SELECT requester_id FROM public.requests 
                WHERE id IN (SELECT request_id FROM public.matches WHERE id = match_id)
            )
        )
    );

-- User activity: Users can only view their own activity
ALTER TABLE public.user_activity ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own activity" ON public.user_activity
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "System can insert user activity" ON public.user_activity
    FOR INSERT WITH CHECK (true);

-- Function to automatically create a profile when a user signs up
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger AS $$
BEGIN
    INSERT INTO public.profiles (id, email_verified)
    VALUES (new.id, new.email_confirmed_at IS NOT NULL);
    RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger to call the function when a new user is created
CREATE OR REPLACE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS trigger AS $$
BEGIN
    NEW.updated_at = timezone('utc'::text, now());
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Triggers for updated_at
CREATE OR REPLACE TRIGGER handle_updated_at_profiles
    BEFORE UPDATE ON public.profiles
    FOR EACH ROW EXECUTE PROCEDURE public.handle_updated_at();

CREATE OR REPLACE TRIGGER handle_updated_at_matches
    BEFORE UPDATE ON public.matches
    FOR EACH ROW EXECUTE PROCEDURE public.handle_updated_at();
