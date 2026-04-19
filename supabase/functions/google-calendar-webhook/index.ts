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

async function getValidToken(supabase: any, integration: any, encryptionKey: string) {
    const expiresAt = new Date(integration.token_expires_at);
    if (expiresAt > new Date(Date.now() + 5 * 60 * 1000)) {
        return await decrypt(integration.access_token_enc, encryptionKey);
    }
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
    if (!data.access_token) throw new Error('Falha ao renovar token no webhook');
    const encryptedAccess = await encrypt(data.access_token, encryptionKey);
    await supabase.from('calendar_integrations').update({
        access_token_enc: encryptedAccess,
        token_expires_at: new Date(Date.now() + data.expires_in * 1000).toISOString()
    }).eq('id', integration.id);
    return data.access_token;
}

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders })

  const channelId = req.headers.get('x-goog-channel-id')
  const resourceId = req.headers.get('x-goog-resource-id')
  const resourceState = req.headers.get('x-goog-resource-state')

  console.log(`[Google Webhook] Channel: ${channelId}, State: ${resourceState}`);

  if (resourceState === 'sync') return new Response('OK', { status: 200 })

  const supabaseAdmin = createClient(
    Deno.env.get('SUPABASE_URL') ?? '',
    Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
  )

  try {
    const { data: integration, error: intError } = await supabaseAdmin
      .from('calendar_integrations')
      .select('*')
      .eq('watch_resource_id', resourceId)
      .eq('is_active', true)
      .maybeSingle();

    if (intError || !integration) {
      console.warn("Integração não encontrada para o recurso:", resourceId)
      return new Response('Not Found', { status: 404 })
    }

    const encryptionKey = Deno.env.get('TOKEN_ENCRYPTION_KEY');
    if (!encryptionKey) throw new Error("Chave de criptografia ausente");

    const accessToken = await getValidToken(supabaseAdmin, integration, encryptionKey);
    
    // Busca os eventos atualizados recentemente (últimos 10 minutos, para cobrir delay)
    const updatedMin = new Date(Date.now() - 10 * 60 * 1000).toISOString();
    const calendarUrl = `https://www.googleapis.com/calendar/v3/calendars/primary/events?updatedMin=${updatedMin}`;
    
    const res = await fetch(calendarUrl, {
      headers: { Authorization: `Bearer ${accessToken}` }
    });
    
    if (!res.ok) throw new Error(`Falha ao buscar eventos: ${await res.text()}`);
    
    const data = await res.json();
    const items = data.items || [];
    
    for (const item of items) {
       if (item.status === 'cancelled') {
           // Deleta ou marca como cancelado
           await supabaseAdmin.from('appointments').update({ 
               sync_status: 'synced', 
               status: 'cancelled',
               deleted_at: new Date().toISOString()
           }).eq('google_event_id', item.id).eq('organization_id', integration.organization_id);
       } else {
           const startAt = item.start?.dateTime || item.start?.date;
           const endAt = item.end?.dateTime || item.end?.date;
           
           if (!startAt) continue;
           
           // Apenas atualiza agendamentos existentes para mantê-los sincronizados com o Dashboard.
           await supabaseAdmin.from('appointments').update({
               title: item.summary,
               description: item.description,
               location: item.location,
               start_at: startAt,
               end_at: endAt,
               sync_status: 'synced'
           }).eq('google_event_id', item.id).eq('organization_id', integration.organization_id);
       }
    }
    
    console.log(`[Google Webhook] Sincronizados ${items.length} eventos da Org:`, integration.organization_id);
    return new Response('OK', { status: 200 })

  } catch (error) {
    console.error('Erro no processamento do webhook:', error.message)
    return new Response(error.message, { status: 500 })
  }
})
