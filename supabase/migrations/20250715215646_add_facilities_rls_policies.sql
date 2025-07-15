-- Add RLS policies to allow public read access to facilities-related tables
-- This enables the FacilitiesScreen to display facility data

-- Enable RLS on tables if not already enabled
ALTER TABLE public.facilities ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.companies ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.branches ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.activity_types ENABLE ROW LEVEL SECURITY;

-- Create policies for public read access
CREATE POLICY "Anyone can view facilities" ON public.facilities
    FOR SELECT USING (true);

CREATE POLICY "Anyone can view companies" ON public.companies
    FOR SELECT USING (true);

CREATE POLICY "Anyone can view branches" ON public.branches
    FOR SELECT USING (true);

CREATE POLICY "Anyone can view activity types" ON public.activity_types
    FOR SELECT USING (true);