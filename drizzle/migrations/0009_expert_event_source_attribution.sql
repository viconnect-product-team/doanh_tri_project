ALTER TABLE public.experts ADD COLUMN IF NOT EXISTS source_name text NOT NULL DEFAULT '', ADD COLUMN IF NOT EXISTS source_url text NOT NULL DEFAULT '';
ALTER TABLE public.events ADD COLUMN IF NOT EXISTS source_name text NOT NULL DEFAULT '', ADD COLUMN IF NOT EXISTS source_url text NOT NULL DEFAULT '';
COMMENT ON COLUMN public.experts.source_url IS 'Verified public profile source; an external speaker is not necessarily institute staff.';
COMMENT ON COLUMN public.events.source_url IS 'Verified original event source; original event date differs from publication date.';