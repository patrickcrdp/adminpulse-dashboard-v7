import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from "https://esm.sh/@supabase/supabase-js@2"

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-ai-key',
}

serve(async (req) => {
  // Handle CORS
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const supabaseAdmin = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    // 1. Verificar API KEY do Agente de IA (Header Profissional: api_key)
    const aiKey = req.headers.get('api_key')
    if (!aiKey) {
      return new Response(JSON.stringify({ error: 'Autenticação necessária. Forneça "api_key" no header.' }), { 
        status: 401, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      })
    }

    const { data: agentConfig, error: authError } = await supabaseAdmin
      .from('ai_agent_configs')
      .select('*')
      .eq('api_key', aiKey)
      .eq('is_active', true)
      .single()

    if (authError || !agentConfig) {
      return new Response(JSON.stringify({ error: 'Chave de API inválida ou agente inativo' }), { 
        status: 401, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      })
    }

    // 2. Processar Body
    const body = await req.json()
    const { 
      appointment_title, 
      start_at, 
      end_at, 
      description, 
      location,
      customer_name,
      customer_email,
      customer_phone,
      customer_whatsapp 
    } = body

    if (!appointment_title || !start_at) {
        throw new Error('Campos "appointment_title" e "start_at" são obrigatórios.')
    }

    let leadId = null

    // 3. Criar ou Vincular Lead (Se solicitado)
    const emailToSearch = customer_email || null;
    const phoneToSearch = customer_phone || customer_whatsapp || null;

    if (emailToSearch || phoneToSearch) {
        // Busca lead existente
        let query = supabaseAdmin
            .from('leads')
            .select('id')
            .eq('organization_id', agentConfig.organization_id);
        
        if (emailToSearch) {
            query = query.eq('email', emailToSearch);
        } else {
            query = query.eq('phone', phoneToSearch);
        }

        const { data: existingLead } = await query.maybeSingle();

        if (existingLead) {
            leadId = existingLead.id
        } else if (agentConfig.settings?.allow_lead_creation) {
            // Cria novo lead
            const { data: newLead, error: leadError } = await supabaseAdmin
                .from('leads')
                .insert([{
                    name: customer_name || 'Desconhecido (Via IA)',
                    email: customer_email,
                    phone: customer_phone || customer_whatsapp,
                    organization_id: agentConfig.organization_id,
                    source: 'IA de Atendimento (API)',
                    status: 'new',
                    metadata: {
                        whatsapp: customer_whatsapp,
                        origin: 'API_INTEGRATION_AI'
                    }
                }])
                .select()
                .single()
            
            if (leadError) console.error('Erro ao criar lead:', leadError)
            else leadId = newLead.id
        }
    }

    // 4. Buscar um usuário responsável (O dono da organização por padrão)
    // Isso é necessário porque o campo user_id em appointments é obrigatório
    const { data: member } = await supabaseAdmin
        .from('organization_members')
        .select('user_id')
        .eq('organization_id', agentConfig.organization_id)
        .eq('role', 'owner')
        .limit(1)
        .single()

    if (!member) throw new Error('Nenhum responsável encontrado para a organização.')

    // 5. Criar o Agendamento
    const { data: appointment, error: apptError } = await supabaseAdmin
        .from('appointments')
        .insert([{
            organization_id: agentConfig.organization_id,
            user_id: member.user_id,
            title: appointment_title,
            description: description || `Agendado automaticamente por ${agentConfig.agent_name}`,
            location: location,
            start_at: start_at,
            end_at: end_at || new Date(new Date(start_at).getTime() + (agentConfig.settings?.default_duration_minutes || 30) * 60000).toISOString(),
            lead_id: leadId,
            status: 'scheduled',
            sync_status: 'pending'
        }])
        .select()
        .single()

    if (apptError) throw apptError

    // 6. Registrar Log de Sucesso
    await supabaseAdmin.from('ai_booking_logs').insert([{
        agent_id: agentConfig.id,
        organization_id: agentConfig.organization_id,
        payload: body,
        status: 'success'
    }])

    return new Response(JSON.stringify({ 
        message: 'Agendamento realizado com sucesso!',
        appointment_id: appointment.id,
        lead_id: leadId
    }), { 
        status: 200, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
    })

  } catch (error) {
    console.error('ERRO NO WEBHOOK IA:', error.message)
    return new Response(JSON.stringify({ error: error.message }), { 
        status: 400, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
    })
  }
})
