import { supabase } from '../supabaseClient';

export interface InboxMessage {
    id?: string;
    ticket_id: string; // was conversation_id
    organization_id: string;
    body: string; // was content
    is_from_me: boolean; // was !is_from_customer
    message_type: 'text' | 'image' | 'audio' | 'document' | 'template'; // was type
    media_url?: string;
    created_at?: string;
}

export class InboxFacade {
    static async fetchConversations(organizationId: string, status: string) {
        // status map: 'new' -> 'open', 'in_progress' -> 'pending', 'closed' -> 'resolved'
        const dbStatus = status === 'new' ? 'open' : status === 'in_progress' ? 'pending' : 'resolved';
        
        const { data, error } = await supabase
            .from('tickets')
            .select('*, channel:whatsapp_channels(name)')
            .eq('organization_id', organizationId)
            .eq('status', dbStatus)
            .order('last_message_at', { ascending: false });
        
        if (error) throw error;
        
        // Transform the payload to match what useUnifiedInbox expects temporarily until we refactor it too
        return data?.map(ticket => ({
            id: ticket.id,
            customer_name: ticket.contact_name,
            customer_phone: ticket.contact_phone,
            customer_avatar: '',
            last_message: ticket.last_message,
            last_message_at: ticket.last_message_at,
            unread_count: 0, // Realtime logic could calculate this
            status: status, // mapped back to original expectations
            provider: 'whatsapp'
        })) || [];
    }

    static async fetchStats(organizationId: string) {
        const { data, error } = await supabase
            .from('tickets')
            .select('status')
            .eq('organization_id', organizationId);
            
        if (error) throw error;
        
        return {
            waiting: data?.filter(c => c.status === 'open').length || 0,
            active: data?.filter(c => c.status === 'pending').length || 0,
            closedToday: data?.filter(c => c.status === 'resolved').length || 0
        };
    }

    static async fetchMessages(ticketId: string) {
        const { data, error } = await supabase
            .from('messages')
            .select('*')
            .eq('ticket_id', ticketId)
            .order('created_at', { ascending: true });
            
        if (error) throw error;
        
        // Map messages back to the old frontend component expected format slightly
        return data?.map(msg => ({
            id: msg.id,
            conversation_id: msg.ticket_id,
            content: msg.body,
            is_from_customer: !msg.is_from_me,
            type: msg.message_type,
            created_at: msg.created_at
        })) || [];
    }

    static async sendMessage(message: InboxMessage) {
        // Envia comando para a Edge Function de disparo Oficial Meta
        const { data, error } = await supabase.functions.invoke('whatsapp-send', {
            body: {
                ticketId: message.ticket_id,
                organizationId: message.organization_id,
                textBody: message.body
            }
        });

        if (error || (data && data.error)) {
            console.error("Falha ao invocar whatsapp-send", error, data);
            throw error || new Error(data?.error);
        }

        // A Edge Function já trata a inserção na tabela messages.
        // A interface será atualizada magicamente pelo Realtime.
        return data;
    }

    static async claimConversation(ticketId: string, userId: string) {
        const { error } = await supabase
            .from('tickets')
            .update({ status: 'pending', assigned_to: userId })
            .eq('id', ticketId);
            
        if (error) throw error;
    }

    static async resolveConversation(ticketId: string) {
        const { error } = await supabase
            .from('tickets')
            .update({ status: 'resolved' })
            .eq('id', ticketId);
            
        if (error) throw error;
    }

    static async fetchIntegrations(organizationId: string) {
        const { data, error } = await supabase
            .from('whatsapp_channels')
            .select('*')
            .eq('organization_id', organizationId);
            
        if (error) throw error;
        return data || [];
    }

    static async saveIntegration(integrationData: any) {
        // Stub for adding channels via UI if needed later
        const { error } = await supabase
            .from('whatsapp_channels')
            .upsert(integrationData);

        if (error) throw error;
    }

    static async fetchAiSettings(organizationId: string) {
        const { data, error } = await supabase
            .from('ai_settings')
            .select('*')
            .eq('organization_id', organizationId)
            .maybeSingle();

        if (error) throw error;
        return data;
    }

    static async saveAiSettings(settingsData: any) {
        const { error } = await supabase
            .from('ai_settings')
            .upsert(settingsData, { onConflict: 'organization_id' });

        if (error) throw error;
    }

    static async fetchChatFlows(organizationId: string) {
        const { data, error } = await supabase
            .from('chat_flows')
            .select('*')
            .eq('organization_id', organizationId)
            .order('created_at', { ascending: false });

        if (error) throw error;
        return data || [];
    }

    static async saveChatFlow(flowData: any) {
        const { id, organization_id, name, nodes, edges, is_active } = flowData;
        
        let query = supabase.from('chat_flows');
        let result;

        if (id && !id.startsWith('temp_')) {
             result = await query.update({ name, nodes, edges, is_active, updated_at: new Date() }).eq('id', id);
        } else {
             result = await query.insert([{ organization_id, name, nodes, edges, is_active }]).select('id').single();
        }

        if (result.error) throw result.error;
        return result.data;
    }
}
