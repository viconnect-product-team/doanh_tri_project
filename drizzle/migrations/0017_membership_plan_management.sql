ALTER TABLE public.membership_plans DROP CONSTRAINT membership_plans_id_check;
ALTER TABLE public.membership_plans ALTER COLUMN id SET DEFAULT gen_random_uuid()::text;
GRANT INSERT, DELETE ON public.membership_plans TO authenticated;
CREATE POLICY "Staff insert membership plans" ON public.membership_plans FOR INSERT TO authenticated WITH CHECK (public.has_role(auth.uid(), 'admin') OR public.has_role(auth.uid(), 'staff'));
CREATE POLICY "Staff delete unused membership plans" ON public.membership_plans FOR DELETE TO authenticated USING (public.has_role(auth.uid(), 'admin') OR public.has_role(auth.uid(), 'staff'));
COMMENT ON TABLE public.membership_plans IS 'CMS-managed catalog with stable IDs. Foreign keys preserve plans referenced by requests or member profiles; hide those plans instead of deleting.';