import { useState, useEffect } from 'react';
import { supabase } from '../supabaseClient';
import { useAuth } from '../context/AuthContext';
import { InboxFacade } from '../services/inboxFacade';

export interface Conversation {
    id: string;
    customer_name: string;
    customer_avatar: string;
    last_message: string;
    last_message_at: string;
    unread_count: number;
    status: 'new' | 'in_progress' | 'closed';
    provider: 'whatsapp' | 'instagram' | 'facebook';
}

export const useUnifiedInbox = () => {
    const { organization, user } = useAuth();
    const [conversations, setConversations] = useState<Conversation[]>([]);
    const [selectedConvoId, setSelectedConvoId] = useState<string | null>(null);
    const [messages, setMessages] = useState<any[]>([]);
    const [newMessage, setNewMessage] = useState('');
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState<'new' | 'in_progress' | 'closed'>('new');
    const [stats, setStats] = useState({ waiting: 0, active: 0, closedToday: 0 });

    const fetchConversations = async () => {
        if (!organization?.id) return;
        setLoading(true);
        try {
            const data = await InboxFacade.fetchConversations(organization.id, activeTab);
            setConversations(data as Conversation[]);

            const newStats = await InboxFacade.fetchStats(organization.id);
            if (newStats) setStats(newStats);
        } catch (error) {
            console.error('Error fetching conversations:', error);
        } finally {
            setLoading(false);
        }
    };

    const setupRealtime = () => {
        if (!organization?.id) return () => {};
        
        const channel = supabase
            .channel('inbox_changes')
            .on('postgres_changes', { event: '*', schema: 'public', table: 'inbox_conversations' }, () => {
                fetchConversations();
            })
            .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'inbox_messages' }, (payload) => {
                if (payload.new.conversation_id === selectedConvoId) {
                    setMessages(prev => [...prev, payload.new]);
                }
            })
            .subscribe();

        return () => {
            supabase.removeChannel(channel);
        };
    };

    useEffect(() => {
        if (organization?.id) {
            fetchConversations();
            const cleanup = setupRealtime();
            return cleanup;
        }
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [organization?.id, activeTab, selectedConvoId]);

    const fetchMessages = async (convoId: string) => {
        try {
            const data = await InboxFacade.fetchMessages(convoId);
            setMessages(data);
        } catch (error) {
            console.error('Error fetching messages:', error);
        }
    };

    const handleSendMessage = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!newMessage.trim() || !selectedConvoId || !organization) return;

        try {
            await InboxFacade.sendMessage({
                conversation_id: selectedConvoId,
                organization_id: organization.id,
                content: newMessage.trim(),
                is_from_customer: false,
                type: 'text'
            });

            setNewMessage('');
            // Optional: trigger Meta API sending via Edge Function here
        } catch (err) {
            console.error('Erro ao enviar mensagem:', err);
        }
    };

    const handleClaimConvo = async () => {
        if (!selectedConvoId || !user) return;
        try {
            await InboxFacade.claimConversation(selectedConvoId, user.id);
            await fetchConversations();
            setSelectedConvoId(null);
        } catch (err) {
            console.error('Erro ao assumir atendimento:', err);
        }
    };

    const selectedConvo = conversations.find(c => c.id === selectedConvoId);

    return {
        conversations,
        selectedConvoId,
        setSelectedConvoId,
        messages,
        newMessage,
        setNewMessage,
        loading,
        activeTab,
        setActiveTab,
        stats,
        fetchMessages,
        handleSendMessage,
        handleClaimConvo,
        selectedConvo
    };
};
