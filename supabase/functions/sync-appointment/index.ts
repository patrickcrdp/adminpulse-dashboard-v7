import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from "https://esm.sh/@supabase/supabase-js@2"

async function decrypt(encryptedBase64: string, keyString: string) {
  try {
    const keyData = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(keyString));
    const key = await crypto.subtle.importKey("raw", keyData, { name: "AES-GCM" }, false, ["decrypt"]);
    const data = Uint8Array.from(atob(encryptedBase64), c => c.charCodeAt(0));
    const iv = data.slice(0, 12);
    const encrypted = data.slice(12);
    const decrypted = await crypto.subtle.decrypt({ name: "AES-GCM", iv }, key, encrypted);
    return new TextDecoder().decode(decrypted);
  } catch (e) {
    console.error("Erro na descriptografia:", e.message);
    throw new Error("Chave de criptografia inválida ou corrompida");
  }
}

async function encrypt(text: string, keyString: string) {
  const keyData = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(keyString));
  const key = await crypto.subtle.importKey("raw", keyData, { name: "AES-GCM" }, false, ["encrypt"]);
  const iv = crypto.getRandomValues(new Uint8Array(12));
  const encrypted = await crypto.subtle.encrypt({ name: "AES-GCM", iv }, key, new TextEncoder().encode(text));
  const combined = new Uint8Array(iv.length + encrypted.byteLength);
  combined.set(iv);
  combined.set(new Uint8Array(encrypted), iv.length);
  return btoa(String.fromCharCode(...combined));
}

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
}

serve(async (req) => {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  let body;
  try {
    body = await req.json();
    console.log("=== NOVA REQUISIÇÃO DE SYNC ===");
    console.log("Tipo:", body.type);
    console.log("ID do Registro:", body.record?.id || body.old_record?.id);
  } catch (e) {
    console.error("Erro ao ler JSON do body:", e.message);
    return new Response("Invalid JSON", { status: 400, headers: corsHeaders });
  }

  const appointment = body.record || body.old_record;
  const type = body.type;

  if (!appointment) return new Response('Sem dados de agendamento', { status: 400, headers: corsHeaders });

  // ============================================================
  // ANTI-LOOP: Ignora webhooks disparados por mudanças internas
  // Se sync_status já é 'synced' ou 'failed', não processa de novo
  // ============================================================
  if (type === 'UPDATE' && body.old_record) {
    const oldRec = body.old_record;
    const newRec = body.record;
    
    // Se a única coisa que mudou foram campos de sync, ignorar
    if (oldRec.title === newRec.title &&
        oldRec.description === newRec.description &&
        oldRec.start_at === newRec.start_at &&
        oldRec.end_at === newRec.end_at &&
        oldRec.location === newRec.location &&
        oldRec.status === newRec.status &&
        oldRec.lead_id === newRec.lead_id) {
      console.log("⏭️ Apenas campos de sync mudaram. Ignorando para evitar loop infinito.");
      return new Response('Skip - sync fields only', { headers: corsHeaders });
    }
    
    // Se sync_status já está synced e não houve mudança real, ignorar
    if (newRec.sync_status === 'synced' && oldRec.sync_status === 'synced') {
      console.log("⏭️ Evento já sincronizado. Ignorando.");
      return new Response('Already synced', { headers: corsHeaders });
    }
  }

  const supabaseAdmin = createClient(
    Deno.env.get('SUPABASE_URL') ?? '',
    Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
  );

  const encryptionKey = Deno.env.get('TOKEN_ENCRYPTION_KEY');

  try {
    // 1. Busca integração ativa da Organização (Modelo Enterprise)
    console.log(`[Sync] Procurando integração para Org: ${appointment.organization_id} ou Usuário: ${appointment.user_id}`);
    
    let { data: integration, error: intError } = await supabaseAdmin
      .from('calendar_integrations')
      .select('*')
      .eq('organization_id', appointment.organization_id)
      .eq('is_active', true)
      .limit(1)
      .maybeSingle();

    // 2. Fallback: Se não achou pela organização, tenta pelo usuário criador
    if (!integration) {
      console.log(`[Sync] Integração por Org não encontrada. Tentando por User ID: ${appointment.user_id}`);
      const { data: userInt } = await supabaseAdmin
        .from('calendar_integrations')
        .select('*')
        .eq('user_id', appointment.user_id)
        .eq('is_active', true)
        .limit(1)
        .maybeSingle();
      
      integration = userInt;
    }

    if (!integration) {
      console.error(`[Sync] ❌ Nenhuma integração encontrada para Org ${appointment.organization_id} ou User ${appointment.user_id}`);
      await supabaseAdmin.from('appointments').update({ 
        sync_status: 'failed', 
        sync_error: 'Nenhuma conta Google conectada para esta organização.' 
      }).eq('id', appointment.id);
      return new Response('Integração não configurada', { headers: corsHeaders });
    }

    console.log(`[Sync] ✅ Integração encontrada: ${integration.id} (Provider: ${integration.provider})`);

    const accessToken = await getValidToken(supabaseAdmin, integration, encryptionKey!);
    const calendarUrl = 'https://www.googleapis.com/calendar/v3/calendars/primary/events';

    // Payload padrão do Google Calendar com timezone
    const googleEventPayload = {
      summary: appointment.title,
      location: appointment.location || '',
      description: appointment.description || '',
      start: { 
        dateTime: appointment.start_at,
        timeZone: 'America/Sao_Paulo'
      },
      end: { 
        dateTime: appointment.end_at,
        timeZone: 'America/Sao_Paulo'
      },
    };

    let res;
    if (type === 'DELETE' || (type === 'UPDATE' && appointment.deleted_at)) {
      if (appointment.google_event_id) {
        res = await fetch(`${calendarUrl}/${appointment.google_event_id}`, {
          method: 'DELETE',
          headers: { Authorization: `Bearer ${accessToken}` }
        });
        console.log("Google Delete Res:", res.status);
      }
    } 
    else if (type === 'INSERT' || (type === 'UPDATE' && !appointment.google_event_id)) {
      res = await fetch(calendarUrl, {
        method: 'POST',
        headers: { Authorization: `Bearer ${accessToken}`, 'Content-Type': 'application/json' },
        body: JSON.stringify(googleEventPayload)
      });
      const googleEvent = await res.json();
      console.log("Google Insert Res:", res.status, googleEvent);

      if (googleEvent.id) {
        await supabaseAdmin.from('appointments').update({ 
          google_event_id: googleEvent.id, 
          sync_status: 'synced',
          sync_error: null
        }).eq('id', appointment.id);
      } else {
         throw new Error(googleEvent.error?.message || "Erro desconhecido no Google");
      }
    } 
    else if (type === 'UPDATE' && appointment.google_event_id) {
      res = await fetch(`${calendarUrl}/${appointment.google_event_id}`, {
        method: 'PATCH',
        headers: { Authorization: `Bearer ${accessToken}`, 'Content-Type': 'application/json' },
        body: JSON.stringify(googleEventPayload)
      });
      console.log("Google Update Res:", res.status);
      
      if (res.ok) {
        await supabaseAdmin.from('appointments').update({ 
          sync_status: 'synced',
          sync_error: null 
        }).eq('id', appointment.id);
      } else {
        const errBody = await res.text();
        throw new Error(`Google PATCH falhou: ${res.status} - ${errBody}`);
      }
    }

    return new Response('OK', { headers: corsHeaders });
  } catch (error) {
    console.error('ERRO CRÍTICO NO SYNC:', error.message);
    await supabaseAdmin.from('appointments').update({ 
      sync_status: 'failed', 
      sync_error: error.message 
    }).eq('id', appointment.id);
    return new Response(error.message, { status: 500, headers: corsHeaders });
  }
});

async function getValidToken(supabase: any, integration: any, encryptionKey: string) {
    const expiresAt = new Date(integration.token_expires_at);
    if (expiresAt > new Date(Date.now() + 5 * 60 * 1000)) {
        return await decrypt(integration.access_token_enc, encryptionKey);
    }

    console.log("Token expirado. Renovando...");
    const refreshToken = await decrypt(integration.refresh_token_enc, encryptionKey);
    const res = await fetch('https://oauth2.googleapis.com/token', {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: new URLSearchParams({
            refresh_token: refreshToken,
            client_id: Deno.env.get('GOOGLE_CLIENT_ID')!,
            client_secret: Deno.env.get('GOOGLE_CLIENT_SECRET')!,
            grant_type: 'refresh_token',
        })
    });
    
    const data = await res.json();
    if (!data.access_token) throw new Error('Falha ao renovar token: ' + JSON.stringify(data));

    const encryptedAccess = await encrypt(data.access_token, encryptionKey);
    await supabase.from('calendar_integrations').update({
        access_token_enc: encryptedAccess,
        token_expires_at: new Date(Date.now() + data.expires_in * 1000).toISOString()
    }).eq('id', integration.id);

    return data.access_token;
}
