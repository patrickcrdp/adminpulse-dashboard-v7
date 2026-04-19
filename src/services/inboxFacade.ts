import { supabase } from '../supabaseClient';

export interface InboxMessage {
    id?: string;
    conversation_id: string;
    organization_id: string;
    content: string;
    is_from_customer: boolean;
    type: 'text' | 'image' | 'file';
    created_at?: string;
}

export class InboxFacade {
    static async fetchConversations(organizationId: string, status: string) {
        const { data, error } = await supabase
            .from('inbox_conversations')
            .select('*')
            .eq('organization_id', organizationId)
            .eq('status', status)
            .order('last_message_at', { ascending: false });
        
        if (error) throw error;
        return data || [];
    }

    static async fetchStats(organizationId: string) {
        const { data, error } = await supabase
            .from('inbox_conversations')
            .select('status')
            .eq('organization_id', organizationId);
            
        if (error) throw error;
        
        return {
            waiting: data?.filter(c => c.status === 'new').length || 0,
            active: data?.filter(c => c.status === 'in_progress').length || 0,
            closedToday: data?.filter(c => c.status === 'closed').length || 0
        };
    }

    static async fetchMessages(conversationId: string) {
        const { data, error } = await supabase
            .from('inbox_messages')
            .select('*')
            .eq('conversation_id', conversationId)
            .order('created_at', { ascending: true });
            
        if (error) throw error;
        return data || [];
    }

    static async sendMessage(message: InboxMessage) {
        const { data, error } = await supabase
            .from('inbox_messages')
            .insert([message])
            .select()
            .single();
            
        if (error) throw error;
        return data;
    }

    static async claimConversation(conversationId: string, userId: string) {
        const { error } = await supabase
            .from('inbox_conversations')
            .update({ status: 'in_progress', assigned_to: userId })
            .eq('id', conversationId);
            
        if (error) throw error;
    }

    static async fetchIntegrations(organizationId: string) {
        const { data, error } = await supabase
            .from('inbox_integrations')
            .select('*')
            .eq('organization_id', organizationId);
            
        if (error) throw error;
        return data || [];
    }

    static async saveIntegration(integrationData: any) {
        const { error } = await supabase
            .from('inbox_integrations')
            .upsert(integrationData, { onConflict: 'organization_id, provider' });

        if (error) throw error;
    }
}
