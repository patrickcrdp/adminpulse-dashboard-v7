-- ==========================================
-- AUTOMATIC ORGANIZATION PROVISIONING
-- Run this in the Supabase SQL Editor
-- ==========================================

-- 1. Create the function that will run securely on the server
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer set search_path = public -- Runs with superuser privileges
as $$
declare
  new_org_id uuid;
begin
  -- Step 1: Create a default organization for the new user
  insert into public.organizations (name)
  values ('Minha Empresa')
  returning id into new_org_id;

  -- Step 2: Add the user as the 'owner' of this organization
  insert into public.organization_members (organization_id, user_id, role)
  values (new_org_id, new.id, 'owner');

  return new;
end;
$$;

-- 2. Create the trigger that fires whenever a new user is inserted into auth.users
-- Drop if exists to avoid errors on re-run
drop trigger if exists on_auth_user_created on auth.users;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- Optional: Check if it works
-- You can't easy check triggers without creating a user, but this setup is standard.
