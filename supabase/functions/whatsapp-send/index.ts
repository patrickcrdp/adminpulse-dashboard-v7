// @ts-ignore
import "jsr:@supabase/functions-js/edge-runtime.d.ts";
// @ts-ignore
import { createClient } from 'npm:@supabase/supabase-js@2';

declare const Deno: any;

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'GET, POST, OPTIONS'
};

const SUPABASE_URL = Deno.env.get('SUPABASE_URL')!;
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

Deno.serve(async (req: Request) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders, status: 200 });
  }

  try {
    const { ticketId, organizationId, textBody } = await req.json();

    if (!ticketId || !textBody) {
      return new Response(JSON.stringify({ error: 'Faltam parametros (ticketId, textBody)' }), { status: 400, headers: corsHeaders });
    }

    // 1. Busca os dados do Ticket e do Canal vinculado a ele
    const { data: ticket } = await supabase
        .from('tickets')
        .select(`
            contact_phone,
            channel:whatsapp_channels (
                phone_number_id,
                access_token
            )
        `)
        .eq('id', ticketId)
        .single();
        
    if (!ticket || !ticket.channel) {
         return new Response(JSON.stringify({ error: 'Ticket/Canal não encontrados' }), { status: 404, headers: corsHeaders });
    }

    const { contact_phone, channel } = ticket;
    const { phone_number_id, access_token } = channel;

    // 2. Dispara a mensagem via Meta Graph API
    console.log(`[Send-API] Disparando msg manual para ${contact_phone}...`);
    const metaResponse = await fetch(`https://graph.facebook.com/v19.0/${phone_number_id}/messages`, {
        method: 'POST',
        headers: {
            'Authorization': `Bearer ${access_token}`,
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            messaging_product: "whatsapp",
            to: contact_phone,
            type: "text",
            text: { body: textBody }
        })
    });

    const metaData = await metaResponse.json();

    if (metaData.error) {
         console.error(`[Send-API] Erro da Meta:`, metaData.error);
         return new Response(JSON.stringify({ error: metaData.error }), { status: 400, headers: corsHeaders });
    }

    // 3. Salva a mensagem no Supabase como enviada pelo atendente
    const wamId = metaData.messages?.[0]?.id || `sys-${Date.now()}`;
    
    await supabase.from('messages').insert([{
        organization_id: organizationId,
        ticket_id: ticketId,
        body: textBody,
        is_from_me: true,
        message_type: 'text',
        wam_id: wamId,
        status: 'sent'
    }]);

    await supabase.from('tickets').update({
        last_message: textBody,
        last_message_at: new Date().toISOString()
    }).eq('id', ticketId);

    return new Response(JSON.stringify({ success: true, messageId: wamId }), { status: 200, headers: corsHeaders });

  } catch (err: any) {
    console.error("[Send-API] Falha fatal:", err);
    return new Response(JSON.stringify({ error: 'Erro de Servidor', details: err.message }), { status: 500, headers: corsHeaders });
  }
});
