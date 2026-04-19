-- ==============================================================================
-- MÓDULO DE ATENDIMENTOS UNIFICADOS (INBOX)
-- Tabelas para centralizar WhatsApp, Instagram e Facebook Messenger.
-- ==============================================================================

-- 1. Tabela de Integrações de Atendimento (Tokens Meta)
CREATE TABLE IF NOT EXISTS public.inbox_integrations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id UUID NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
    provider TEXT NOT NULL, -- 'whatsapp', 'instagram', 'facebook'
    provider_id TEXT, -- ID do app/número/página na Meta
    access_token TEXT,
    verify_token TEXT, -- Para validação de Webhook
    status TEXT DEFAULT 'active',
    settings JSONB DEFAULT '{}',
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now(),
    UNIQUE(organization_id, provider)
);

-- 2. Tabela de Conversas
CREATE TABLE IF NOT EXISTS public.inbox_conversations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id UUID NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
    contact_id UUID REFERENCES public.leads(id) ON DELETE SET NULL, -- Vincula ao lead se existir
    provider TEXT NOT NULL,
    external_convo_id TEXT NOT NULL, -- ID da conversa no provedor (ex: número do whatsapp)
    customer_name TEXT,
    customer_avatar TEXT,
    status TEXT DEFAULT 'new', -- 'new' (caixa entrada), 'in_progress' (atendimento), 'closed' (finalizado)
    assigned_to UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    last_message TEXT,
    last_message_at TIMESTAMPTZ DEFAULT now(),
    unread_count INTEGER DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now(),
    UNIQUE(organization_id, provider, external_convo_id)
);

-- 3. Tabela de Mensagens
CREATE TABLE IF NOT EXISTS public.inbox_messages (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    conversation_id UUID NOT NULL REFERENCES public.inbox_conversations(id) ON DELETE CASCADE,
    organization_id UUID NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
    sender_id UUID REFERENCES auth.users(id), -- NULL se for o cliente
    content TEXT,
    type TEXT DEFAULT 'text', -- 'text', 'image', 'audio', 'video', 'file'
    media_url TEXT,
    external_id TEXT, -- ID da mensagem na plataforma externa
    is_from_customer BOOLEAN DEFAULT false,
    created_at TIMESTAMPTZ DEFAULT now()
);

-- Habilitar RLS
ALTER TABLE public.inbox_integrations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.inbox_conversations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.inbox_messages ENABLE ROW LEVEL SECURITY;

-- Políticas de Segurança (Multi-tenancy)
DO $$ 
BEGIN
    -- Integrações
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Users can view inbox integrations') THEN
        CREATE POLICY "Users can view inbox integrations" ON public.inbox_integrations
            FOR ALL TO authenticated USING (EXISTS (SELECT 1 FROM public.organization_members WHERE organization_id = public.inbox_integrations.organization_id AND user_id = auth.uid()));
    END IF;

    -- Conversas
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Users can view organization conversations') THEN
        CREATE POLICY "Users can view organization conversations" ON public.inbox_conversations
            FOR ALL TO authenticated USING (EXISTS (SELECT 1 FROM public.organization_members WHERE organization_id = public.inbox_conversations.organization_id AND user_id = auth.uid()));
    END IF;

    -- Mensagens
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Users can view organization messages') THEN
        CREATE POLICY "Users can view organization messages" ON public.inbox_messages
            FOR ALL TO authenticated USING (EXISTS (SELECT 1 FROM public.organization_members WHERE organization_id = public.inbox_messages.organization_id AND user_id = auth.uid()));
    END IF;
END $$;

-- Índices para Performance
CREATE INDEX IF NOT EXISTS idx_inbox_convos_org_status ON public.inbox_conversations(organization_id, status);
CREATE INDEX IF NOT EXISTS idx_inbox_messages_convo ON public.inbox_messages(conversation_id);
CREATE INDEX IF NOT EXISTS idx_inbox_convos_contact ON public.inbox_conversations(contact_id);
