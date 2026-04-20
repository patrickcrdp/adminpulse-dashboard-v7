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

// 1. Variáveis de Ambiente do Supabase (Auto-injetadas)
const SUPABASE_URL = Deno.env.get('SUPABASE_URL')!;
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;

// O cliente do Supabase Ignora RLS (Service Role) para conseguir gravar livremente no backend
const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

// Token Global de Verificação do Webhook (Configure no Supabase Secrets ou painel da Meta)
// É como uma "senha" entre a Vercel e o Facebook.
const META_VERIFY_TOKEN = Deno.env.get('META_VERIFY_TOKEN') || 'adminpulse_secure_token_v1';


Deno.serve(async (req: Request) => {
  // --- 1. CORS Preflight ---
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders, status: 200 });
  }

  // --- 2. REGISTRO DE WEBHOOK (GET) ---
  // A Meta / WhatsApp manda um GET com parâmetros para validar que este webhook é nosso.
  if (req.method === 'GET') {
    const url = new URL(req.url);
    const mode = url.searchParams.get('hub.mode');
    const token = url.searchParams.get('hub.verify_token');
    const challenge = url.searchParams.get('hub.challenge');

    if (mode === 'subscribe' && token === META_VERIFY_TOKEN) {
      console.log('[Webhook] ✅ Verificação da Meta Aprovada!');
      return new Response(challenge, { status: 200 }); // Deve retornar apenas o challenge
    } else {
      console.error('[Webhook] ❌ Falha na verificação de Token da Meta.');
      return new Response('Forbidden', { status: 403 });
    }
  }

  // --- 3. RECEBIMENTO DE MENSAGENS E ALERTAS (POST) ---
  if (req.method === 'POST') {
    try {
      const body = await req.json();

      // OMNICHANNEL LISTENER: Tratamos payload do WhatsApp, Instagram e Messenger
      const isWhatsApp = body.object === 'whatsapp_business_account';
      const isInstagram = body.object === 'instagram';
      const isMessenger = body.object === 'page';

      if (isWhatsApp || isInstagram || isMessenger) {
        let channelPlatform = isWhatsApp ? 'whatsapp' : isInstagram ? 'instagram' : 'messenger';

        // O payload da Meta muda drasticamente entre WhatsApp e o ecossistema FB/IG.
        for (const entry of body.entry || []) {
            
          // -----------------------------------------------------
          // PARSER 1: ESTRUTURA DO WHATSAPP (Usa "changes")
          // -----------------------------------------------------
          if (isWhatsApp) {
            for (const change of entry.changes || []) {
              if (change.value && change.value.messages) {
                const phoneNumberId = change.value.metadata.phone_number_id;

                // Busca o canal pelo phone_number_id
                const { data: channelData } = await supabase
                  .from('whatsapp_channels')
                  .select('id, organization_id, access_token')
                  .eq('phone_number_id', phoneNumberId)
                  .single();

                if (!channelData) continue;

                for (const msg of change.value.messages) {
                  const contactPhone = msg.from; 
                  const contactName = change.value.contacts?.[0]?.profile?.name || 'Cliente WhatsApp';
                  const messageId = msg.id;
                  const msgBody = msg.text?.body;
                  
                  if (msgBody) {
                    await processAndReplyOmnichannel(
                      channelData, 
                      contactPhone, 
                      contactName, 
                      messageId, 
                      msgBody, 
                      channelPlatform
                    );
                  }
                }
              }
            }
          }

          // --------------------------------------------------------------------------
          // PARSER 2: ESTRUTURA DO INSTAGRAM DIRECT & MESSENGER FB (Usa "messaging")
          // --------------------------------------------------------------------------
          else if (isInstagram || isMessenger) {
            const accountId = entry.id; // O ID da página do Facebook ou Conta do IG

            // Identifica o canal pelo "phone_number_id" que para FB/IG na vdd seria o PageId/IgId
            // Como as labels do DB focavam em Whats, assumiremos que "phone_number_id" abriga o Page/IG ID
            const { data: channelData } = await supabase
               .from('whatsapp_channels')
               .select('id, organization_id, access_token')
               .eq('phone_number_id', accountId)
               .single();
            
            if (!channelData) continue;

            for (const messagingEvent of entry.messaging || []) {
              if (messagingEvent.message && !messagingEvent.message.is_echo) {
                  const senderId = messagingEvent.sender.id; // PSID ou IGSID
                  const messageId = messagingEvent.message.mid;
                  const msgBody = messagingEvent.message.text;

                  const contactName = isInstagram ? 'Lead Instagram' : 'Lead Messenger';

                  if (msgBody) {
                      await processAndReplyOmnichannel(
                        channelData, 
                        senderId, 
                        contactName, 
                        messageId, 
                        msgBody, 
                        channelPlatform
                      );
                  }
              }
            }
          }
        }
      }

      // IMPORTANTE: Responder rápido (status 200) senão a Meta reenvia a mesma mensagem num loop
      return new Response('EVENT_RECEIVED', { status: 200 });

    } catch (e: any) {
      console.error("[Webhook] Erro massivo no processamento:", e);
      return new Response('SERVER_ERROR', { status: 500 });
    }
  }

  return new Response('Method Not Allowed', { status: 405 });
});

// ==== NÚCLEO OMNICHANNEL DE PROCESSAMENTO (Ticket -> DB -> IA LLM -> Saída Meta) ==== //
async function processAndReplyOmnichannel(
    channelData: any, 
    contactId: string, 
    contactName: string, 
    messageId: string, 
    msgBody: string,
    platform: string
) {
    // A) Localizar Ticket Aberto ou Criar
    let { data: ticket } = await supabase
      .from('tickets')
      .select('id, status')
      .eq('channel_id', channelData.id)
      .eq('contact_phone', contactId)
      .in('status', ['open', 'pending'])
      .maybeSingle();

    if (!ticket) {
      const { data: newTicket } = await supabase
        .from('tickets')
        .insert([{
          organization_id: channelData.organization_id,
          channel_id: channelData.id,
          contact_phone: contactId,
          contact_name: contactName,
          status: 'open',
          last_message: msgBody
        }])
        .select('id, status')
        .single();
      ticket = newTicket;
    } else {
      await supabase
        .from('tickets')
        .update({ last_message: msgBody, updated_at: new Date().toISOString() })
        .eq('id', ticket.id);
    }

    // B) Salvar a Mensagem em si
    if (ticket) {
      const { error: insertMsgErr } = await supabase
        .from('messages')
        .insert([{
            organization_id: channelData.organization_id,
            ticket_id: ticket.id,
            wam_id: messageId,
            body: msgBody,
            is_from_me: false,
            status: 'delivered'
        }]);

      if (insertMsgErr) return; // Evita loop na IA se for duplicada
      console.log(`[Webhook-${platform}] ✅ Mensagem salva: ${contactName} -> ${msgBody.substring(0,20)}`);
      
      // --- C) MOTOR DE IA & GATILHO DE SAÍDA META --- //
      if (ticket.status === 'open') {
          const { data: aiSettings } = await supabase
              .from('ai_settings')
              .select('*')
              .eq('organization_id', channelData.organization_id)
              .maybeSingle();

          if (aiSettings && aiSettings.api_key && aiSettings.api_key.length > 5) {
              try {
                  // 1. LLM via fetch nativo com Function Calling
                  const systemPrompt = (aiSettings.system_prompt || "Você é um assistente prestativo.") + 
                      "\n\nINSTRUÇÃO CRÍTICA: Se o paciente demonstrar claro interesse em AGENDAR UMA CONSULTA, OBTER ORÇAMENTO FINAL ou CONTRATAR o serviço, você DEVE disparar a função 'create_crm_lead'. Extraia o nome do paciente e o serviço desejado da conversa. Isso é obrigatório para que a equipe humana assuma a venda.";

                  const gptResponse = await fetch('https://api.openai.com/v1/chat/completions', {
                      method: 'POST',
                      headers: {
                          'Authorization': `Bearer ${aiSettings.api_key}`,
                          'Content-Type': 'application/json'
                      },
                      body: JSON.stringify({
                          model: "gpt-4o-mini",
                          messages: [
                              { role: "system", content: systemPrompt },
                              { role: "user", content: msgBody }
                          ],
                          tools: [
                              {
                                  type: "function",
                                  function: {
                                      name: "create_crm_lead",
                                      description: "Cria um card no Funil de Vendas CRM para equipe humana finalizar o agendamento/venda.",
                                      parameters: {
                                          type: "object",
                                          properties: {
                                              patient_name: { type: "string", description: "Nome do paciente detectado na conversa" },
                                              service_requested: { type: "string", description: "O procedimento ou exame que o paciente pediu" },
                                              suggested_tags: { 
                                                  type: "array", 
                                                  items: { type: "string" }, 
                                                  description: "Matriz de 1 a 3 etiquetas curtas para classificar o paciente (Ex: 'Urgente', 'Particular', 'Plano de Saúde', 'Retorno')" 
                                              }
                                          },
                                          required: ["patient_name", "service_requested"]
                                      }
                                  }
                              }
                          ],
                          temperature: 0.7,
                          max_tokens: 300
                      })
                  });

                  const gptData = await gptResponse.json();
                  const responseMsg = gptData.choices?.[0]?.message;
                  
                  let aiReplyText = responseMsg?.content;

                  // 1.5 Handle Function Call (CRM Pipeline Injection)
                  if (responseMsg?.tool_calls && responseMsg.tool_calls.length > 0) {
                      for (const tool of responseMsg.tool_calls) {
                          if (tool.function.name === 'create_crm_lead') {
                              const args = JSON.parse(tool.function.arguments);
                              console.log(`[AI-TOOL] Disparando Leads CRM para: ${args.patient_name}`);

                              // Busca a primeira coluna do funil
                              const { data: firstStage } = await supabase
                                  .from('pipeline_stages')
                                  .select('id')
                                  .eq('organization_id', channelData.organization_id)
                                  .order('order_index', { ascending: true })
                                  .limit(1)
                                  .single();

                              // Cria o Card na Tabela Leads
                              await supabase.from('leads').insert({
                                  organization_id: channelData.organization_id,
                                  name: args.patient_name || contactName || 'Lead via IA',
                                  phone: contactId, // Usamos o ID que é o número no Whats
                                  status: 'new', // Para retrocompatibilidade
                                  pipeline_stage_id: firstStage?.id,
                                  value: 0,
                                  tags: args.suggested_tags || []
                              });

                              // Move o Ticket para "Pendente" (Em Atendimento Humano) para parar a IA
                              await supabase.from('tickets').update({
                                  status: 'pending',
                                  updated_at: new Date().toISOString()
                              }).eq('id', ticket.id);

                              // Informa o paciente que a transferência ocorreu
                              aiReplyText = `Perfeito, ${args.patient_name || ''}! Acabei de separar a sua ficha de ${args.service_requested || 'atendimento'}. 📋\n\nNossa recepção humana já recebeu o alerta na tela dela e vai te chamar por aqui agora mesmo para confirmar o seu horário/pagamento!`;
                          }
                      }
                  }

                  if (aiReplyText && channelData.access_token) {
                      
                      // 2. Disparo de Saída (WhatsApp Graph ou Messenger Graph possuem endpoints diferentes)
                      let metaUrl = `https://graph.facebook.com/v19.0/me/messages?access_token=${channelData.access_token}`;
                      let metaPayload: any = {
                          recipient: { id: contactId },
                          message: { text: aiReplyText }
                      };

                      // Adapta o Payload se for especificamente WhatsApp
                      if (platform === 'whatsapp') {
                          // O IG/FB ID usa "me/messages", mas o Whats usa "PHONE_ID/messages" com headers Bearer
                          // Precisaremos pegar o PhoneID de novo do channelData, que está como phone_number_id no banco
                          const { data: phoneCheck } = await supabase
                              .from('whatsapp_channels')
                              .select('phone_number_id')
                              .eq('id', channelData.id)
                              .single();

                          metaUrl = `https://graph.facebook.com/v19.0/${phoneCheck?.phone_number_id}/messages`;
                          metaPayload = {
                              messaging_product: "whatsapp",
                              to: contactId,
                              type: "text",
                              text: { body: aiReplyText }
                          };
                      }

                      const hdrs: any = { 'Content-Type': 'application/json' };
                      if (platform === 'whatsapp') {
                          hdrs['Authorization'] = `Bearer ${channelData.access_token}`;
                      }

                      const metaResponse = await fetch(metaUrl, {
                          method: 'POST',
                          headers: hdrs,
                          body: JSON.stringify(metaPayload)
                      });

                      const metaData = await metaResponse.json();
                      
                      // 3. Salva a resposta da IA na tela do AdminPulse
                      const outboundId = metaData.messages?.[0]?.id || metaData.message_id || `sys-${Date.now()}`;
                      
                      await supabase.from('messages').insert([{
                          organization_id: channelData.organization_id,
                          ticket_id: ticket.id,
                          body: aiReplyText,
                          is_from_me: true,
                          message_type: 'text',
                          wam_id: outboundId,
                          status: 'sent'
                      }]);

                      await supabase.from('tickets').update({
                          last_message: aiReplyText,
                          last_message_at: new Date().toISOString()
                      }).eq('id', ticket.id);
                  }
              } catch (aiError) {
                  console.error(`[🤖 IA] Falha no circuito neural:`, aiError);
              }
          }
      }
    }
}
