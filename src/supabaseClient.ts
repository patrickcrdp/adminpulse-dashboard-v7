import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = 'https://qcbihcjgscjxeqvlbpdz.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InFjYmloY2pnc2NqeGVxdmxicGR6Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjkyMTE4NDEsImV4cCI6MjA4NDc4Nzg0MX0.Qo-LZPEFUQyPhkYBZx03dJBD1nq5MhEmUkLLtJRnCp0';

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

/**
 * ==========================================
 * MULTI-TENANCY SQL SETUP (RUN IN SUPABASE SQL EDITOR)
 * ==========================================
 * 
 * -- 1. CREATE ORGANIZATIONS & MEMBERS
 * create table organizations (
 *   id uuid default gen_random_uuid() primary key,
 *   name text not null,
 *   created_at timestamp with time zone default timezone('utc'::text, now()) not null
 * );
 * 
 * create table organization_members (
 *   id uuid default gen_random_uuid() primary key,
 *   organization_id uuid references organizations(id) on delete cascade not null,
 *   user_id uuid references auth.users(id) on delete cascade not null,
 *   role text default 'admin',
 *   unique(organization_id, user_id)
 * );
 * 
 * -- 2. UPDATE EXISTING TABLES WITH ORGANIZATION_ID
 * alter table leads add column if not exists organization_id uuid references organizations(id);
 * alter table activities add column if not exists organization_id uuid references organizations(id);
 * 
 * -- !!! IMPORTANT FIX FOR "PGRST204" ERROR !!!
 * -- If you see "Could not find the 'status' column", run these two lines:
 * ALTER TABLE leads ADD COLUMN IF NOT EXISTS status text DEFAULT 'new';
 * NOTIFY pgrst, 'reload config';
 * 
 * -- 3. ENABLE RLS (ROW LEVEL SECURITY)
 * alter table organizations enable row level security;
 * alter table organization_members enable row level security;
 * alter table leads enable row level security;
 * alter table activities enable row level security;
 * 
 * -- 4. CREATE HELPER FUNCTION FOR RLS (Get Org IDs for current user)
 * create or replace function get_auth_user_org_ids()
 * returns setof uuid
 * language sql
 * security definer
 * set search_path = public
 * stable
 * as $$
 *   select organization_id from organization_members where user_id = auth.uid()
 * $$;
 * 
 * -- 5. CREATE POLICIES (Users can only see data from their orgs)
 * 
 * -- Leads Policy
 * create policy "Users can view own org leads" on leads
 *   for select using (organization_id in (select get_auth_user_org_ids()));
 * 
 * create policy "Users can insert own org leads" on leads
 *   for insert with check (organization_id in (select get_auth_user_org_ids()));
 * 
 * create policy "Users can update own org leads" on leads
 *   for update using (organization_id in (select get_auth_user_org_ids()));
 * 
 * create policy "Users can delete own org leads" on leads
 *   for delete using (organization_id in (select get_auth_user_org_ids()));
 * 
 * -- Activities Policy
 * create policy "Users can view own org activities" on activities
 *   for select using (organization_id in (select get_auth_user_org_ids()));
 * 
 * create policy "Users can insert own org activities" on activities
 *   for insert with check (organization_id in (select get_auth_user_org_ids()));
 * 
 * -- Org Members Policy (Users can see their own membership)
 * create policy "Users can view own membership" on organization_members
 *   for select using (user_id = auth.uid());
 * 
 * create policy "Users can insert own membership" on organization_members
 *   for insert with check (user_id = auth.uid());
 * 
 * -- Organizations Policy
 * create policy "Users can view own organizations" on organizations
 *   for select using (id in (select get_auth_user_org_ids()));
 * 
 * create policy "Users can insert organizations" on organizations
 *   for insert with check (true);
 */