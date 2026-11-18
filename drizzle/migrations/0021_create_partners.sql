CREATE TABLE public.partners (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  category text NOT NULL DEFAULT 'partner' CHECK (category IN ('client','partner','sponsor')),
  name text NOT NULL,
  name_en text,
  description text NOT NULL DEFAULT '',
  description_en text,
  image_url text NOT NULL DEFAULT '',
  image_thumb_url text NOT NULL DEFAULT '',
  website_url text NOT NULL DEFAULT '',
  sort_order integer NOT NULL DEFAULT 0,
  published boolean NOT NULL DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT ON public.partners TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.partners TO authenticated;
GRANT ALL ON public.partners TO service_role;
ALTER TABLE public.partners ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public read published partners" ON public.partners FOR SELECT TO anon, authenticated USING (published);
CREATE POLICY "Staff read all partners" ON public.partners FOR SELECT TO authenticated USING (has_role(auth.uid(),'admin') OR has_role(auth.uid(),'staff'));
CREATE POLICY "Staff insert partners" ON public.partners FOR INSERT TO authenticated WITH CHECK (has_role(auth.uid(),'admin') OR has_role(auth.uid(),'staff'));
CREATE POLICY "Staff update partners" ON public.partners FOR UPDATE TO authenticated USING (has_role(auth.uid(),'admin') OR has_role(auth.uid(),'staff'));
CREATE POLICY "Staff delete partners" ON public.partners FOR DELETE TO authenticated USING (has_role(auth.uid(),'admin') OR has_role(auth.uid(),'staff'));
CREATE TRIGGER partners_touch BEFORE UPDATE ON public.partners FOR EACH ROW EXECUTE FUNCTION public.touch_updated_at();