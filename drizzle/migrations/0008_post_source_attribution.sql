ALTER TABLE public.posts ADD COLUMN IF NOT EXISTS source_name text NOT NULL DEFAULT '', ADD COLUMN IF NOT EXISTS source_url text NOT NULL DEFAULT '';
COMMENT ON COLUMN public.posts.source_name IS 'Original publisher for attributed editorial summaries.';
COMMENT ON COLUMN public.posts.source_url IS 'Original source article URL; retained for public attribution and CMS editing.';