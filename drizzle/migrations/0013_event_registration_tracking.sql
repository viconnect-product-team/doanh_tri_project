ALTER TABLE public.leads ADD COLUMN event_id uuid REFERENCES public.events(id), ADD COLUMN participant_count integer;
ALTER TABLE public.leads ADD CONSTRAINT event_participant_count_valid CHECK (participant_count IS NULL OR (participant_count >= 1 AND event_id IS NOT NULL AND source = 'event'));
CREATE INDEX leads_event_registration_idx ON public.leads(event_id) WHERE event_id IS NOT NULL;
CREATE FUNCTION public.public_event_registration_counts() RETURNS TABLE(event_id uuid, participants bigint) LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
 SELECT e.id, COALESCE(sum(r.quantity), 0)::bigint FROM public.events e LEFT JOIN (
 SELECT l.event_id, lower(trim(l.email)) AS email, max(l.participant_count) AS quantity FROM public.leads l WHERE l.source = 'event' AND l.event_id IS NOT NULL AND l.participant_count IS NOT NULL GROUP BY l.event_id, lower(trim(l.email))
 ) r ON r.event_id = e.id WHERE e.published = true GROUP BY e.id;
$$;
REVOKE ALL ON FUNCTION public.public_event_registration_counts() FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.public_event_registration_counts() TO anon, authenticated, service_role;
COMMENT ON FUNCTION public.public_event_registration_counts() IS 'Public aggregate only; counts requested participants once per normalized email/event, never confirms attendance or reveals CRM details.';