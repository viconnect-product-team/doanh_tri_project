CREATE TABLE public.membership_plans (
 id text PRIMARY KEY CHECK (id IN ('standard','vip','vvip','diamond')),
 title text NOT NULL, title_en text, description text NOT NULL DEFAULT '', description_en text,
 fee integer NOT NULL DEFAULT 0 CHECK (fee >= 0),
 knowledge integer NOT NULL DEFAULT 0 CHECK (knowledge >= 0), dinners integer NOT NULL DEFAULT 0 CHECK (dinners >= 0),
 press integer NOT NULL DEFAULT 0 CHECK (press >= 0), visits integer NOT NULL DEFAULT 0 CHECK (visits >= 0), flowers integer NOT NULL DEFAULT 0 CHECK (flowers >= 0), mentoring integer NOT NULL DEFAULT 0 CHECK (mentoring >= 0), speaking integer NOT NULL DEFAULT 0 CHECK (speaking >= 0), overseas integer NOT NULL DEFAULT 0 CHECK (overseas >= 0), ceo integer NOT NULL DEFAULT 0 CHECK (ceo >= 0),
 sort_order integer NOT NULL DEFAULT 0, published boolean NOT NULL DEFAULT true,
 created_at timestamptz NOT NULL DEFAULT now(), updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT ON public.membership_plans TO anon;
GRANT SELECT, UPDATE ON public.membership_plans TO authenticated;
GRANT ALL ON public.membership_plans TO service_role;
ALTER TABLE public.membership_plans ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public read published membership plans" ON public.membership_plans FOR SELECT TO anon, authenticated USING (published);
CREATE POLICY "Staff read membership plans" ON public.membership_plans FOR SELECT TO authenticated USING (public.has_role(auth.uid(),'admin') OR public.has_role(auth.uid(),'staff'));
CREATE POLICY "Staff update membership plans" ON public.membership_plans FOR UPDATE TO authenticated USING (public.has_role(auth.uid(),'admin') OR public.has_role(auth.uid(),'staff')) WITH CHECK (public.has_role(auth.uid(),'admin') OR public.has_role(auth.uid(),'staff'));
CREATE TRIGGER membership_plans_updated_at BEFORE UPDATE ON public.membership_plans FOR EACH ROW EXECUTE FUNCTION public.touch_updated_at();