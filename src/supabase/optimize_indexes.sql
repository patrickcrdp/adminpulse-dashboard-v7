-- ==============================================================================
-- OTIMIZAÇÃO DE PERFORMANCE (VELO4)
-- Criação de índices para acelerar filtros de Dashboard e Leads
-- ==============================================================================

-- 1. Índice composto para filtrar leads por organização e data (Dashboard)
-- Acelera: SELECT * FROM leads WHERE organization_id = ... AND created_at >= ...
CREATE INDEX IF NOT EXISTS idx_leads_org_created_at 
ON public.leads (organization_id, created_at DESC);

-- 2. Índice para status de leads (Filtros de Kanban/Lista)
-- Acelera: SELECT * FROM leads WHERE status = ...
CREATE INDEX IF NOT EXISTS idx_leads_status 
ON public.leads (status);

-- 3. Índice para busca de texto (Nome/Email/Telefone) - Opcional, mas útil
-- Usando índice GIN para busca mais complexa se usarmos ILIKE com %
CREATE INDEX IF NOT EXISTS idx_leads_email 
ON public.leads (email);

-- 4. Índice para Atividades Recentes
-- Acelera o feed de atividades do Dashboard
CREATE INDEX IF NOT EXISTS idx_activities_created_at 
ON public.activities (created_at DESC);

CREATE INDEX IF NOT EXISTS idx_activities_lead_id 
ON public.activities (lead_id);

-- 5. Índice para Organization Members (Login/Auth rápido)
CREATE INDEX IF NOT EXISTS idx_org_members_user_id 
ON public.organization_members (user_id);
