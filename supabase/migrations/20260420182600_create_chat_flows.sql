CREATE TABLE IF NOT EXISTS public.chat_flows (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  organization_id uuid REFERENCES public.organizations(id) ON DELETE CASCADE,
  name text NOT NULL,
  nodes jsonb DEFAULT '[]'::jsonb,
  edges jsonb DEFAULT '[]'::jsonb,
  is_active boolean DEFAULT true,
  created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL
);

ALTER TABLE public.chat_flows ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Usuários podem ver chat flows"
  ON public.chat_flows FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM organization_members
      WHERE organization_members.user_id = auth.uid()
      AND organization_members.organization_id = chat_flows.organization_id
    )
  );

CREATE POLICY "Admins podem inserir chat flows"
  ON public.chat_flows FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM organization_members
      WHERE organization_members.user_id = auth.uid()
      AND organization_members.organization_id = chat_flows.organization_id
      AND organization_members.role IN ('owner', 'admin')
    )
  );

CREATE POLICY "Admins podem alterar chat flows"
  ON public.chat_flows FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM organization_members
      WHERE organization_members.user_id = auth.uid()
      AND organization_members.organization_id = chat_flows.organization_id
      AND organization_members.role IN ('owner', 'admin')
    )
  );
