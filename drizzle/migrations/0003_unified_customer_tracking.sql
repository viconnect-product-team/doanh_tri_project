CREATE TABLE public.customers (
 id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
 email text NOT NULL UNIQUE,
 full_name text NOT NULL,
 phone text,
 organization text,
 status public.lead_status NOT NULL DEFAULT 'new',
 notes text,
 created_at timestamptz NOT NULL DEFAULT now(),
 updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, UPDATE ON public.customers TO authenticated;
GRANT ALL ON public.customers TO service_role;
ALTER TABLE public.customers ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Staff read customers" ON public.customers FOR SELECT TO authenticated USING (public.has_role(auth.uid(), 'admin') OR public.has_role(auth.uid(), 'staff'));
CREATE POLICY "Staff update customers" ON public.customers FOR UPDATE TO authenticated USING (public.has_role(auth.uid(), 'admin') OR public.has_role(auth.uid(), 'staff')) WITH CHECK (public.has_role(auth.uid(), 'admin') OR public.has_role(auth.uid(), 'staff'));
ALTER TABLE public.leads ADD COLUMN customer_id uuid REFERENCES public.customers(id);
INSERT INTO public.customers (email,full_name,phone,organization,status,notes,created_at,updated_at)
SELECT DISTINCT ON (lower(btrim(email))) lower(btrim(email)),full_name,phone,organization,status,notes,created_at,updated_at FROM public.leads ORDER BY lower(btrim(email)),updated_at DESC,created_at DESC,id DESC;
UPDATE public.leads l SET customer_id=c.id,status=c.status FROM public.customers c WHERE lower(btrim(l.email))=c.email;
CREATE INDEX leads_customer_idx ON public.leads(customer_id);
CREATE TRIGGER customers_touch BEFORE UPDATE ON public.customers FOR EACH ROW EXECUTE FUNCTION public.touch_updated_at();
CREATE FUNCTION public.link_lead_customer() RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path=public AS $$
DECLARE linked public.customers;
BEGIN
 INSERT INTO public.customers(email,full_name,phone,organization) VALUES(lower(btrim(NEW.email)),NEW.full_name,NEW.phone,NEW.organization)
 ON CONFLICT(email) DO UPDATE SET email=EXCLUDED.email RETURNING * INTO linked;
 NEW.customer_id := linked.id;
 NEW.status := linked.status;
 RETURN NEW;
END $$;
CREATE TRIGGER lead_customer_link BEFORE INSERT OR UPDATE OF email,customer_id ON public.leads FOR EACH ROW EXECUTE FUNCTION public.link_lead_customer();
CREATE FUNCTION public.sync_customer_status_to_leads() RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path=public AS $$
BEGIN
 IF NEW.status IS DISTINCT FROM OLD.status THEN
 UPDATE public.leads SET status=NEW.status WHERE customer_id=NEW.id AND status IS DISTINCT FROM NEW.status;
 END IF;
 RETURN NEW;
END $$;
CREATE TRIGGER customer_status_sync AFTER UPDATE OF status ON public.customers FOR EACH ROW EXECUTE FUNCTION public.sync_customer_status_to_leads();
CREATE FUNCTION public.sync_lead_status_to_customer() RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path=public AS $$
BEGIN
 IF NEW.status IS DISTINCT FROM OLD.status THEN
 UPDATE public.customers SET status=NEW.status WHERE id=NEW.customer_id AND status IS DISTINCT FROM NEW.status;
 END IF;
 RETURN NEW;
END $$;
CREATE TRIGGER lead_status_sync AFTER UPDATE OF status ON public.leads FOR EACH ROW EXECUTE FUNCTION public.sync_lead_status_to_customer();
REVOKE ALL ON FUNCTION public.link_lead_customer(),public.sync_customer_status_to_leads(),public.sync_lead_status_to_customer() FROM PUBLIC,anon,authenticated;
COMMENT ON TABLE public.customers IS 'One customer per normalized email; leads retain each submission and share customer status.';