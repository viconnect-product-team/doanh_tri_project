ALTER TABLE public.events ADD COLUMN is_recurring boolean NOT NULL DEFAULT false;
ALTER TABLE public.events ADD COLUMN capacity integer;
ALTER TABLE public.events ADD CONSTRAINT events_capacity_positive CHECK (capacity IS NULL OR capacity > 0);
COMMENT ON COLUMN public.events.is_recurring IS 'Each recurring event row represents one independently scheduled occurrence.';
COMMENT ON COLUMN public.events.capacity IS 'Total seat capacity for this occurrence; NULL means not specified.';