CREATE TABLE public.assistant_threads (
 id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
 user_id uuid NOT NULL,
 title text NOT NULL DEFAULT '',
 messages jsonb NOT NULL DEFAULT '[]'::jsonb,
 blocked_reason text,
 updated_at timestamptz NOT NULL DEFAULT now(),
 created_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.assistant_threads TO authenticated;
GRANT ALL ON public.assistant_threads TO service_role;
ALTER TABLE public.assistant_threads ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Owners read conversations" ON public.assistant_threads FOR SELECT TO authenticated USING (user_id = auth.uid());
CREATE POLICY "Owners create conversations" ON public.assistant_threads FOR INSERT TO authenticated WITH CHECK (user_id = auth.uid());
CREATE POLICY "Owners update conversations" ON public.assistant_threads FOR UPDATE TO authenticated USING (user_id = auth.uid()) WITH CHECK (user_id = auth.uid());
CREATE POLICY "Owners delete conversations" ON public.assistant_threads FOR DELETE TO authenticated USING (user_id = auth.uid());
CREATE INDEX assistant_threads_owner_updated ON public.assistant_threads(user_id, updated_at DESC);