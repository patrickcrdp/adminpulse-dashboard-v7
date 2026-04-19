-- ==============================================================================
-- SISTEMA DE NOTIFICAÇÕES E LEMBRETES (VERSÃO DEFINITIVA E SEGURA)
-- Este script é idempotente (pode ser executado várias vezes sem erros).
-- ==============================================================================

-- 1. TIPOS DE NOTIFICAÇÃO
DO $$ BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'notification_type') THEN
        CREATE TYPE public.notification_type AS ENUM ('appointment_reminder', 'lead_assigned', 'system_alert', 'mention');
    END IF;
END $$;

-- 2. TABELA DE NOTIFICAÇÕES
CREATE TABLE IF NOT EXISTS public.notifications (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    organization_id UUID NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    message TEXT NOT NULL,
    type public.notification_type NOT NULL DEFAULT 'system_alert',
    link TEXT,
    read_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc', now()),
    metadata JSONB DEFAULT '{}'
);

-- 3. SEGURANÇA (RLS)
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;

-- Remove políticas antigas antes de recriar para evitar erros de duplicidade
DROP POLICY IF EXISTS "Users can view their own notifications" ON public.notifications;
DROP POLICY IF EXISTS "Users can update their own notifications (mark as read)" ON public.notifications;

CREATE POLICY "Users can view their own notifications" ON public.notifications
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can update their own notifications (mark as read)" ON public.notifications
    FOR UPDATE USING (auth.uid() = user_id)
    WITH CHECK (auth.uid() = user_id);

-- 4. ÍNDICES DE PERFORMANCE
CREATE INDEX IF NOT EXISTS idx_notifications_user_read ON public.notifications(user_id, read_at) WHERE read_at IS NULL;
CREATE INDEX IF NOT EXISTS idx_notifications_created_at ON public.notifications(created_at DESC);

-- 5. SUPORTE A LEMBRETES NA TABELA DE AGENDAMENTOS
DO $$ BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'appointments' AND column_name = 'reminder_sent') THEN
        ALTER TABLE public.appointments ADD COLUMN reminder_sent BOOLEAN DEFAULT false;
    END IF;
END $$;

-- 6. FUNÇÃO: NOTIFICAR NOVO AGENDAMENTO (TRIGGER)
-- Roda sempre que um agendamento é criado para um usuário específico
CREATE OR REPLACE FUNCTION public.notify_appointment_assignment()
RETURNS TRIGGER AS $$
BEGIN
    -- Notifica se o agendamento foi atribuído a alguém diferente do criador
    -- (ou notificações gerais de novos agendamentos se preferir)
    IF (NEW.user_id IS NOT NULL AND (TG_OP = 'INSERT' OR OLD.user_id IS DISTINCT FROM NEW.user_id)) THEN
        INSERT INTO public.notifications (user_id, organization_id, title, message, type, link, metadata)
        VALUES (
            NEW.user_id,
            NEW.organization_id,
            'Novo Agendamento',
            format('Você tem um novo compromisso: "%s" em %s', NEW.title, to_char(NEW.start_at, 'DD/MM às HH24:MI')),
            'appointment_reminder',
            '/calendar',
            jsonb_build_object('appointment_id', NEW.id)
        );
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Limpa e aplica a trigger de criação/atribuição
DROP TRIGGER IF EXISTS trg_notify_appointment_creation ON public.appointments;
CREATE TRIGGER trg_notify_appointment_creation
    AFTER INSERT OR UPDATE OF user_id ON public.appointments
    FOR EACH ROW EXECUTE FUNCTION public.notify_appointment_assignment();

-- 8. FUNÇÃO: NOTIFICAR LEAD ATRIBUÍDO
-- Roda quando um lead ganha um novo responsável
CREATE OR REPLACE FUNCTION public.notify_lead_assignment()
RETURNS TRIGGER AS $$
BEGIN
    -- Notifica apenas se houver um responsável e este for diferente do criador (evita auto-notificação de admin)
    -- Ou se for um novo lead sendo distribuído
    IF (NEW.user_id IS NOT NULL AND (TG_OP = 'INSERT' OR OLD.user_id IS DISTINCT FROM NEW.user_id)) THEN
        INSERT INTO public.notifications (user_id, organization_id, title, message, type, link, metadata)
        VALUES (
            NEW.user_id,
            NEW.organization_id,
            'Novo Lead Recebido',
            format('Você recebeu um novo lead: "%s". Acesse para ver os detalhes.', NEW.name),
            'lead_assigned',
            '/leads',
            jsonb_build_object('lead_id', NEW.id)
        );
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Aplica a trigger na tabela de leads
DROP TRIGGER IF EXISTS trg_notify_lead_assignment ON public.leads;
CREATE TRIGGER trg_notify_lead_assignment
    AFTER INSERT OR UPDATE OF user_id ON public.leads
    FOR EACH ROW EXECUTE FUNCTION public.notify_lead_assignment();

-- 9. FUNÇÃO: VERIFICAR COMPROMISSOS PRÓXIMOS (LEMBRETES AUTOMÁTICOS)
-- Esta função é para ser chamada pelo CRON (ex: a cada 1 minuto)
CREATE OR REPLACE FUNCTION public.check_upcoming_appointments()
RETURNS void AS $$
DECLARE
    appt RECORD;
BEGIN
    FOR appt IN 
        SELECT a.id, a.user_id, a.organization_id, a.title, a.start_at, a.timezone
        FROM public.appointments a
        WHERE a.start_at <= (now() + interval '15 minutes')
          AND a.start_at > now()
          AND a.reminder_sent = false
          AND a.deleted_at IS NULL
          AND a.status = 'scheduled'
    LOOP
        -- Cria a notificação de lembrete
        INSERT INTO public.notifications (user_id, organization_id, title, message, type, link, metadata)
        VALUES (
            appt.user_id,
            appt.organization_id,
            'Compromisso em breve',
            format('Lembrete: "%s" começa em 15 minutos (às %s)', appt.title, to_char(appt.start_at AT TIME ZONE appt.timezone, 'HH24:MI')),
            'appointment_reminder',
            '/calendar',
            jsonb_build_object('appointment_id', appt.id)
        );

        -- Marca como lembrete enviado para não repetir
        UPDATE public.appointments SET reminder_sent = true WHERE id = appt.id;
    END LOOP;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ==============================================================================
-- NOTA: Para ativar os lembretes automáticos, execute o comando abaixo separadamente:
-- SELECT cron.schedule('appointment-reminder-job', '* * * * *', 'SELECT check_upcoming_appointments();');
-- ==============================================================================
