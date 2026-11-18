ALTER TABLE public.leads ADD COLUMN membership_tier text REFERENCES public.membership_plans(id);
ALTER TABLE public.member_profiles ADD COLUMN registration_request_id uuid UNIQUE REFERENCES public.leads(id);
COMMENT ON COLUMN public.member_profiles.registration_request_id IS 'Explicit institute-admin approved membership request; never an automatic email match.';