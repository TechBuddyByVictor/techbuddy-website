-- TechBuddy by Victor Supabase schema
-- Run this in the Supabase SQL editor before using the live app.

create extension if not exists "pgcrypto";

do $$
begin
  if not exists (select 1 from pg_type where typname = 'ticket_status') then
    create type public.ticket_status as enum ('open', 'in_progress', 'waiting_on_customer', 'resolved', 'closed');
  end if;

  if not exists (select 1 from pg_type where typname = 'user_role') then
    create type public.user_role as enum ('customer', 'admin');
  end if;
end
$$;

create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  email text not null,
  full_name text not null,
  phone text,
  alternate_phone text,
  preferred_contact text not null default 'email',
  role public.user_role not null default 'customer',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- If you created profiles before the portal profile fields existed, run:
-- alter table public.profiles add column if not exists alternate_phone text;
-- alter table public.profiles add column if not exists preferred_contact text not null default 'email';

create table if not exists public.support_tickets (
  id uuid primary key default gen_random_uuid(),
  customer_id uuid not null references public.profiles(id) on delete cascade,
  customer_name text,
  customer_email text,
  customer_phone text,
  title text not null,
  description text not null,
  category text not null default 'General Support',
  status public.ticket_status not null default 'open',
  urgency text not null default 'normal',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.ticket_messages (
  id uuid primary key default gen_random_uuid(),
  ticket_id uuid not null references public.support_tickets(id) on delete cascade,
  sender_id uuid not null references public.profiles(id) on delete cascade,
  sender_role public.user_role not null default 'customer',
  message text not null,
  created_at timestamptz not null default now()
);

-- If you created support_tickets before customer fields existed, run:
-- alter table public.support_tickets add column if not exists customer_name text;
-- alter table public.support_tickets add column if not exists customer_email text;
-- alter table public.support_tickets add column if not exists customer_phone text;

-- If you created ticket_messages before sender_role/message existed, run:
-- alter table public.ticket_messages add column if not exists sender_role public.user_role not null default 'customer';
-- alter table public.ticket_messages rename column body to message;

create table if not exists public.ticket_photos (
  id uuid primary key default gen_random_uuid(),
  ticket_id uuid not null references public.support_tickets(id) on delete cascade,
  uploaded_by uuid not null references public.profiles(id) on delete cascade,
  customer_id uuid not null references public.profiles(id) on delete cascade,
  file_name text not null,
  file_type text,
  file_size integer,
  storage_path text not null,
  public_url text not null,
  created_at timestamptz not null default now()
);

-- If you created ticket_photos before file metadata existed, run:
-- alter table public.ticket_photos add column if not exists uploaded_by uuid references public.profiles(id) on delete cascade;
-- update public.ticket_photos set uploaded_by = customer_id where uploaded_by is null;
-- alter table public.ticket_photos alter column uploaded_by set not null;
-- alter table public.ticket_photos add column if not exists file_type text;
-- alter table public.ticket_photos add column if not exists file_size integer;

create table if not exists public.customer_addresses (
  id uuid primary key default gen_random_uuid(),
  customer_id uuid not null references public.profiles(id) on delete cascade,
  label text not null default 'Home',
  street_line_1 text not null default '',
  street_line_2 text,
  city text not null default '',
  state text not null default '',
  postal_code text not null default '',
  notes text,
  is_primary boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.membership_plans (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  slug text not null unique,
  price_label text not null,
  description text not null,
  features text[] not null default array[]::text[],
  priority_level integer not null default 1,
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.customer_memberships (
  id uuid primary key default gen_random_uuid(),
  customer_id uuid not null references public.profiles(id) on delete cascade,
  plan_id uuid references public.membership_plans(id) on delete set null,
  plan_name text not null,
  status text not null default 'interested',
  start_date date,
  renewal_date date,
  notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.service_records (
  id uuid primary key default gen_random_uuid(),
  customer_id uuid not null references public.profiles(id) on delete cascade,
  ticket_id uuid references public.support_tickets(id) on delete set null,
  title text not null,
  category text not null default 'General Support',
  status text not null default 'scheduled',
  service_date date,
  completed_at timestamptz,
  service_location text,
  technician text,
  devices_serviced text,
  issue_found text,
  work_performed text,
  parts_used text,
  labor_minutes integer not null default 0,
  follow_up_recommended boolean not null default false,
  follow_up_notes text,
  technician_notes text,
  customer_summary text,
  warranty_status text not null default 'not_started',
  warranty_expires_at date,
  warranty_terms text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.service_records add column if not exists service_location text;
alter table public.service_records add column if not exists technician text;
alter table public.service_records add column if not exists devices_serviced text;
alter table public.service_records add column if not exists issue_found text;
alter table public.service_records add column if not exists work_performed text;
alter table public.service_records add column if not exists parts_used text;
alter table public.service_records add column if not exists labor_minutes integer not null default 0;
alter table public.service_records add column if not exists follow_up_recommended boolean not null default false;
alter table public.service_records add column if not exists follow_up_notes text;
alter table public.service_records add column if not exists warranty_terms text;

create table if not exists public.service_record_photos (
  id uuid primary key default gen_random_uuid(),
  service_record_id uuid not null references public.service_records(id) on delete cascade,
  customer_id uuid not null references public.profiles(id) on delete cascade,
  uploaded_by uuid not null references public.profiles(id) on delete cascade,
  file_name text not null,
  file_type text,
  file_size integer,
  file_path text not null,
  storage_path text not null,
  public_url text not null,
  caption text,
  created_at timestamptz not null default now()
);

alter table public.service_record_photos add column if not exists file_path text;
update public.service_record_photos
set file_path = storage_path
where file_path is null;
alter table public.service_record_photos alter column file_path set not null;

create table if not exists public.invoices (
  id uuid primary key default gen_random_uuid(),
  customer_id uuid not null references public.profiles(id) on delete cascade,
  service_record_id uuid references public.service_records(id) on delete set null,
  invoice_number text not null unique,
  status text not null default 'draft',
  amount_cents integer not null default 0,
  due_date date,
  sent_at timestamptz,
  paid_at timestamptz,
  hosted_url text,
  notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.appointments (
  id uuid primary key default gen_random_uuid(),
  customer_id uuid not null references public.profiles(id) on delete cascade,
  appointment_type text not null default 'service',
  scheduled_at timestamptz not null,
  duration_minutes integer not null default 60 check (duration_minutes > 0),
  status text not null default 'scheduled' check (status in ('scheduled', 'confirmed', 'completed', 'cancelled')),
  notes text,
  address text,
  technician text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.appointments
  add column if not exists appointment_type text not null default 'service',
  add column if not exists scheduled_at timestamptz not null default now(),
  add column if not exists duration_minutes integer not null default 60,
  add column if not exists status text not null default 'scheduled',
  add column if not exists notes text,
  add column if not exists address text,
  add column if not exists technician text,
  add column if not exists created_at timestamptz not null default now(),
  add column if not exists updated_at timestamptz not null default now();

do $$
begin
  if exists (
    select 1
    from information_schema.columns
    where table_schema = 'public'
      and table_name = 'appointments'
      and column_name = 'location'
  ) then
    execute 'update public.appointments set address = coalesce(address, location)';
  end if;
end $$;

alter table public.appointments
  drop column if exists title,
  drop column if exists location;

alter table public.appointments
  drop constraint if exists appointments_duration_minutes_check,
  drop constraint if exists appointments_status_check,
  add constraint appointments_duration_minutes_check check (duration_minutes > 0),
  add constraint appointments_status_check check (status in ('scheduled', 'confirmed', 'completed', 'cancelled'));

alter table public.appointments
  alter column scheduled_at drop default;

create index if not exists appointments_customer_id_idx
on public.appointments(customer_id);

create index if not exists appointments_scheduled_at_idx
on public.appointments(scheduled_at);

create index if not exists appointments_status_idx
on public.appointments(status);

comment on table public.appointments is 'Customer appointments scheduled and managed by TechBuddy admins.';
comment on column public.appointments.customer_id is 'Customer profile that owns the appointment.';
comment on column public.appointments.appointment_type is 'Type of appointment, such as service, remote_support, consultation, follow_up, or installation.';
comment on column public.appointments.scheduled_at is 'Appointment start time stored as timestamptz.';
comment on column public.appointments.duration_minutes is 'Expected appointment duration in minutes.';
comment on column public.appointments.status is 'Appointment lifecycle status: scheduled, confirmed, completed, or cancelled.';
comment on column public.appointments.address is 'Service address or remote appointment location details.';
comment on column public.appointments.technician is 'Assigned technician name.';

create or replace function public.touch_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists profiles_touch_updated_at on public.profiles;
create trigger profiles_touch_updated_at
before update on public.profiles
for each row execute function public.touch_updated_at();

drop trigger if exists support_tickets_touch_updated_at on public.support_tickets;
create trigger support_tickets_touch_updated_at
before update on public.support_tickets
for each row execute function public.touch_updated_at();

drop trigger if exists addresses_touch_updated_at on public.customer_addresses;
create trigger addresses_touch_updated_at
before update on public.customer_addresses
for each row execute function public.touch_updated_at();

drop trigger if exists membership_plans_touch_updated_at on public.membership_plans;
create trigger membership_plans_touch_updated_at
before update on public.membership_plans
for each row execute function public.touch_updated_at();

drop trigger if exists customer_memberships_touch_updated_at on public.customer_memberships;
create trigger customer_memberships_touch_updated_at
before update on public.customer_memberships
for each row execute function public.touch_updated_at();

drop trigger if exists service_records_touch_updated_at on public.service_records;
create trigger service_records_touch_updated_at
before update on public.service_records
for each row execute function public.touch_updated_at();

create index if not exists service_record_photos_record_id_idx on public.service_record_photos(service_record_id);
create index if not exists service_record_photos_customer_id_idx on public.service_record_photos(customer_id);

drop trigger if exists invoices_touch_updated_at on public.invoices;
create trigger invoices_touch_updated_at
before update on public.invoices
for each row execute function public.touch_updated_at();

drop trigger if exists appointments_touch_updated_at on public.appointments;
create trigger appointments_touch_updated_at
before update on public.appointments
for each row execute function public.touch_updated_at();

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, email, full_name, role)
  values (
    new.id,
    coalesce(new.email, ''),
    coalesce(new.raw_user_meta_data ->> 'full_name', split_part(coalesce(new.email, ''), '@', 1)),
    'customer'
  )
  on conflict (id) do nothing;

  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
after insert on auth.users
for each row execute function public.handle_new_user();

create or replace function public.is_admin(user_id uuid default auth.uid())
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1
    from public.profiles
    where id = user_id
      and role = 'admin'
  );
$$;

alter table public.profiles enable row level security;
alter table public.support_tickets enable row level security;
alter table public.ticket_messages enable row level security;
alter table public.ticket_photos enable row level security;
alter table public.customer_addresses enable row level security;
alter table public.membership_plans enable row level security;
alter table public.customer_memberships enable row level security;
alter table public.service_records enable row level security;
alter table public.service_record_photos enable row level security;
alter table public.invoices enable row level security;
alter table public.appointments enable row level security;

drop policy if exists "profiles_select_own_or_admin" on public.profiles;
create policy "profiles_select_own_or_admin"
on public.profiles for select
to authenticated
using (id = auth.uid() or public.is_admin());

drop policy if exists "profiles_update_own" on public.profiles;
create policy "profiles_update_own"
on public.profiles for update
to authenticated
using (id = auth.uid())
with check (id = auth.uid() and role = (select role from public.profiles where id = auth.uid()));

drop policy if exists "profiles_admin_update" on public.profiles;
create policy "profiles_admin_update"
on public.profiles for update
to authenticated
using (public.is_admin())
with check (public.is_admin());

drop policy if exists "tickets_select_own_or_admin" on public.support_tickets;
create policy "tickets_select_own_or_admin"
on public.support_tickets for select
to authenticated
using (customer_id = auth.uid() or public.is_admin());

drop policy if exists "tickets_insert_own" on public.support_tickets;
create policy "tickets_insert_own"
on public.support_tickets for insert
to authenticated
with check (customer_id = auth.uid());

drop policy if exists "tickets_update_own_or_admin" on public.support_tickets;
create policy "tickets_update_own_or_admin"
on public.support_tickets for update
to authenticated
using (customer_id = auth.uid() or public.is_admin())
with check (customer_id = auth.uid() or public.is_admin());

drop policy if exists "messages_select_ticket_participants" on public.ticket_messages;
create policy "messages_select_ticket_participants"
on public.ticket_messages for select
to authenticated
using (
  public.is_admin()
  or exists (
    select 1 from public.support_tickets
    where support_tickets.id = ticket_messages.ticket_id
      and support_tickets.customer_id = auth.uid()
  )
);

drop policy if exists "messages_insert_ticket_participants" on public.ticket_messages;
create policy "messages_insert_ticket_participants"
on public.ticket_messages for insert
to authenticated
with check (
  sender_id = auth.uid()
  and sender_role in ('customer', 'admin')
  and (
    public.is_admin()
    or exists (
      select 1 from public.support_tickets
      where support_tickets.id = ticket_messages.ticket_id
        and support_tickets.customer_id = auth.uid()
    )
  )
);

drop policy if exists "photos_select_ticket_participants" on public.ticket_photos;
create policy "photos_select_ticket_participants"
on public.ticket_photos for select
to authenticated
using (
  public.is_admin()
  or customer_id = auth.uid()
  or exists (
    select 1 from public.support_tickets
    where support_tickets.id = ticket_photos.ticket_id
      and support_tickets.customer_id = auth.uid()
  )
);

drop policy if exists "photos_insert_own" on public.ticket_photos;
create policy "photos_insert_own"
on public.ticket_photos for insert
to authenticated
with check (customer_id = auth.uid() and uploaded_by = auth.uid());

drop policy if exists "addresses_select_own_or_admin" on public.customer_addresses;
create policy "addresses_select_own_or_admin"
on public.customer_addresses for select
to authenticated
using (customer_id = auth.uid() or public.is_admin());

drop policy if exists "addresses_insert_own" on public.customer_addresses;
drop policy if exists "addresses_insert_own_or_admin" on public.customer_addresses;
create policy "addresses_insert_own_or_admin"
on public.customer_addresses for insert
to authenticated
with check (customer_id = auth.uid() or public.is_admin());

drop policy if exists "addresses_update_own_or_admin" on public.customer_addresses;
create policy "addresses_update_own_or_admin"
on public.customer_addresses for update
to authenticated
using (customer_id = auth.uid() or public.is_admin())
with check (customer_id = auth.uid() or public.is_admin());

drop policy if exists "membership_plans_select_authenticated" on public.membership_plans;
create policy "membership_plans_select_authenticated"
on public.membership_plans for select
to authenticated
using (is_active = true or public.is_admin());

drop policy if exists "membership_plans_admin_all" on public.membership_plans;
create policy "membership_plans_admin_all"
on public.membership_plans for all
to authenticated
using (public.is_admin())
with check (public.is_admin());

drop policy if exists "customer_memberships_select_own_or_admin" on public.customer_memberships;
create policy "customer_memberships_select_own_or_admin"
on public.customer_memberships for select
to authenticated
using (customer_id = auth.uid() or public.is_admin());

drop policy if exists "customer_memberships_insert_own_or_admin" on public.customer_memberships;
create policy "customer_memberships_insert_own_or_admin"
on public.customer_memberships for insert
to authenticated
with check (customer_id = auth.uid() or public.is_admin());

drop policy if exists "customer_memberships_update_own_or_admin" on public.customer_memberships;
create policy "customer_memberships_update_own_or_admin"
on public.customer_memberships for update
to authenticated
using (customer_id = auth.uid() or public.is_admin())
with check (customer_id = auth.uid() or public.is_admin());

drop policy if exists "service_records_select_own_or_admin" on public.service_records;
create policy "service_records_select_own_or_admin"
on public.service_records for select
to authenticated
using (customer_id = auth.uid() or public.is_admin());

drop policy if exists "service_records_admin_all" on public.service_records;
create policy "service_records_admin_all"
on public.service_records for all
to authenticated
using (public.is_admin())
with check (public.is_admin());

drop policy if exists "service_record_photos_select_own_or_admin" on public.service_record_photos;
create policy "service_record_photos_select_own_or_admin"
on public.service_record_photos for select
to authenticated
using (customer_id = auth.uid() or public.is_admin());

drop policy if exists "service_record_photos_admin_all" on public.service_record_photos;
create policy "service_record_photos_admin_all"
on public.service_record_photos for all
to authenticated
using (public.is_admin())
with check (public.is_admin());

drop policy if exists "invoices_select_own_or_admin" on public.invoices;
create policy "invoices_select_own_or_admin"
on public.invoices for select
to authenticated
using (customer_id = auth.uid() or public.is_admin());

drop policy if exists "invoices_admin_all" on public.invoices;
create policy "invoices_admin_all"
on public.invoices for all
to authenticated
using (public.is_admin())
with check (public.is_admin());

drop policy if exists "appointments_select_own_or_admin" on public.appointments;
create policy "appointments_select_own_or_admin"
on public.appointments for select
to authenticated
using (customer_id = auth.uid() or public.is_admin());

drop policy if exists "appointments_admin_all" on public.appointments;
create policy "appointments_admin_all"
on public.appointments for all
to authenticated
using (public.is_admin())
with check (public.is_admin());

insert into public.membership_plans (name, slug, price_label, description, features, priority_level)
values
  (
    'Basic',
    'basic',
    '$14.99/month',
    'Perfect for occasional support and everyday tech help.',
    array['1 Remote Support Session Per Month', 'Priority Scheduling', 'Member Pricing On Services'],
    1
  ),
  (
    'Plus',
    'plus',
    '$24.99/month',
    'Designed for customers who want faster support and better savings.',
    array['2 Remote Support Sessions Per Month', 'Faster Response Times', 'Priority Support', 'Better Member Discounts'],
    2
  ),
  (
    'Premium',
    'premium',
    '$39.99/month',
    'For households that rely heavily on technology and want premium support access.',
    array['4 Remote Support Sessions Per Month', 'Highest Priority Support', 'Same-Day Response When Available', 'Bigger Member Discounts', 'Annual Tech Checkup'],
    3
  )
on conflict (slug) do update
set name = excluded.name,
    price_label = excluded.price_label,
    description = excluded.description,
    features = excluded.features,
    priority_level = excluded.priority_level,
    is_active = true;

update public.membership_plans
set is_active = false
where slug in ('techbuddy-care', 'home-network-plus', 'small-office-partner');

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'ticket-photos',
  'ticket-photos',
  true,
  10485760,
  array['image/png', 'image/jpeg', 'image/webp', 'image/gif']
)
on conflict (id) do update
set public = excluded.public,
    file_size_limit = excluded.file_size_limit,
    allowed_mime_types = excluded.allowed_mime_types;

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'service-record-photos',
  'service-record-photos',
  true,
  10485760,
  array['image/png', 'image/jpeg', 'image/webp', 'image/gif']
)
on conflict (id) do update
set public = excluded.public,
    file_size_limit = excluded.file_size_limit,
    allowed_mime_types = excluded.allowed_mime_types;

drop policy if exists "ticket_photos_read_authenticated" on storage.objects;
create policy "ticket_photos_read_authenticated"
on storage.objects for select
to authenticated
using (bucket_id = 'ticket-photos');

drop policy if exists "ticket_photos_upload_own_folder" on storage.objects;
create policy "ticket_photos_upload_own_folder"
on storage.objects for insert
to authenticated
with check (
  bucket_id = 'ticket-photos'
  and (storage.foldername(name))[1] = auth.uid()::text
);

drop policy if exists "ticket_photos_update_own_folder" on storage.objects;
create policy "ticket_photos_update_own_folder"
on storage.objects for update
to authenticated
using (
  bucket_id = 'ticket-photos'
  and ((storage.foldername(name))[1] = auth.uid()::text or public.is_admin())
);

drop policy if exists "ticket_photos_delete_own_folder_or_admin" on storage.objects;
create policy "ticket_photos_delete_own_folder_or_admin"
on storage.objects for delete
to authenticated
using (
  bucket_id = 'ticket-photos'
  and ((storage.foldername(name))[1] = auth.uid()::text or public.is_admin())
);

drop policy if exists "service_record_photos_read_authenticated" on storage.objects;
create policy "service_record_photos_read_authenticated"
on storage.objects for select
to authenticated
using (bucket_id = 'service-record-photos');

drop policy if exists "service_record_photos_admin_upload" on storage.objects;
create policy "service_record_photos_admin_upload"
on storage.objects for insert
to authenticated
with check (
  bucket_id = 'service-record-photos'
  and public.is_admin()
);

drop policy if exists "service_record_photos_admin_update" on storage.objects;
create policy "service_record_photos_admin_update"
on storage.objects for update
to authenticated
using (
  bucket_id = 'service-record-photos'
  and public.is_admin()
);

drop policy if exists "service_record_photos_admin_delete" on storage.objects;
create policy "service_record_photos_admin_delete"
on storage.objects for delete
to authenticated
using (
  bucket_id = 'service-record-photos'
  and public.is_admin()
);

-- To make Victor an admin after signing up, run this with his auth email:
-- update public.profiles set role = 'admin' where email = 'victor@example.com';
