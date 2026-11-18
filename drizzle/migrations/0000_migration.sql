create type public.app_role as enum ('admin', 'staff');
create type public.lead_status as enum ('new', 'contacted', 'consulting', 'enrolled', 'lost');

create table public.user_roles (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete cascade not null,
  role public.app_role not null,
  unique (user_id, role)
);
grant select on public.user_roles to authenticated;
grant all on public.user_roles to service_role;
alter table public.user_roles enable row level security;

create or replace function public.has_role(_user_id uuid, _role public.app_role)
returns boolean language sql stable security definer set search_path = public as $$
  select exists (select 1 from public.user_roles where user_id = _user_id and role = _role)
$$;

create policy "Users read own roles" on public.user_roles for select to authenticated using (user_id = auth.uid());

-- First account ever created becomes admin
create or replace function public.assign_first_admin()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  if not exists (select 1 from public.user_roles where role = 'admin') then
    insert into public.user_roles (user_id, role) values (new.id, 'admin');
  end if;
  return new;
end $$;
create trigger on_auth_user_created_first_admin after insert on auth.users
  for each row execute function public.assign_first_admin();

create table public.leads (
  id uuid primary key default gen_random_uuid(),
  full_name text not null,
  email text not null,
  phone text,
  organization text,
  source text not null default 'contact',
  interest text,
  message text,
  ai_suggestions jsonb,
  status public.lead_status not null default 'new',
  notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
grant select, update, delete on public.leads to authenticated;
grant all on public.leads to service_role;
alter table public.leads enable row level security;

create policy "Staff read leads" on public.leads for select to authenticated
  using (public.has_role(auth.uid(), 'admin') or public.has_role(auth.uid(), 'staff'));
create policy "Staff update leads" on public.leads for update to authenticated
  using (public.has_role(auth.uid(), 'admin') or public.has_role(auth.uid(), 'staff'));
create policy "Admins delete leads" on public.leads for delete to authenticated
  using (public.has_role(auth.uid(), 'admin'));

create or replace function public.touch_updated_at()
returns trigger language plpgsql set search_path = public as $$
begin new.updated_at = now(); return new; end $$;
create trigger leads_touch before update on public.leads
  for each row execute function public.touch_updated_at();

create index leads_created_idx on public.leads (created_at desc);