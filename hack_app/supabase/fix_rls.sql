-- Fix RLS Policies for Profiles and Consents

-- Enable RLS on tables ensures that no one can access the table without a policy
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.consents ENABLE ROW LEVEL SECURITY;

-- Drop existing policies to prevent conflicts
DROP POLICY IF EXISTS "Users can view own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can insert own profile" ON public.profiles;

DROP POLICY IF EXISTS "Users can view own consents" ON public.consents;
DROP POLICY IF EXISTS "Users can update own consents" ON public.consents;
DROP POLICY IF EXISTS "Users can insert own consents" ON public.consents;
DROP POLICY IF EXISTS "Users can delete own consents" ON public.consents;

-- PROFILES POLICIES
-- Allow users to view their own profile
CREATE POLICY "Users can view own profile" 
ON public.profiles 
FOR SELECT 
USING (auth.uid() = id);

-- Allow users to insert their own profile
-- WITH CHECK ensures the inserted row's id matches the authenticated user
CREATE POLICY "Users can insert own profile" 
ON public.profiles 
FOR INSERT 
WITH CHECK (auth.uid() = id);

-- Allow users to update their own profile
-- USING ensures they can only update their own row
-- WITH CHECK ensures they can't change the id to someone else's (though id is PK, so it's immutable usually, but good for completeness)
CREATE POLICY "Users can update own profile" 
ON public.profiles 
FOR UPDATE 
USING (auth.uid() = id)
WITH CHECK (auth.uid() = id);


-- CONSENTS POLICIES
-- Allow users to view their own consents
CREATE POLICY "Users can view own consents" 
ON public.consents 
FOR SELECT 
USING (auth.uid() = user_id);

-- Allow users to insert their own consents
CREATE POLICY "Users can insert own consents" 
ON public.consents 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

-- Allow users to update their own consents
CREATE POLICY "Users can update own consents" 
ON public.consents 
FOR UPDATE 
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);
