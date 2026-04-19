import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { InboxFacade } from '../services/inboxFacade';

export const useInboxIntegrations = () => {
    const { organization } = useAuth();
    const [loading, setLoading] = useState(false);
    const [integrations, setIntegrations] = useState<any[]>([]);
    const [success, setSuccess] = useState<string | null>(null);
    const [error, setError] = useState<string | null>(null);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedProvider, setSelectedProvider] = useState<any>(null);
    const [formData, setFormData] = useState({ provider_id: '', access_token: '' });

    const fetchIntegrations = async () => {
        if (!organization?.id) return;
        try {
            const data = await InboxFacade.fetchIntegrations(organization.id);
            setIntegrations(data);
        } catch (err) {
            console.error("Error fetching integrations", err);
        }
    };

    useEffect(() => {
        if (organization?.id) {
            fetchIntegrations();
        }
    }, [organization]);

    const handleConnectMeta = (provider: any) => {
        setSelectedProvider(provider);
        setIsModalOpen(true);
    };

    const handleSaveIntegration = async () => {
        if (!organization?.id || !selectedProvider) return;
        setLoading(true);
        setError(null);
        setSuccess(null);

        try {
            await InboxFacade.saveIntegration({
                organization_id: organization.id,
                provider: selectedProvider.id,
                provider_id: formData.provider_id,
                access_token: formData.access_token,
                status: 'active'
            });

            setSuccess(`Integração com ${selectedProvider.name} realizada com sucesso!`);
            setIsModalOpen(false);
            setFormData({ provider_id: '', access_token: '' });
            fetchIntegrations();
        } catch (err: any) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    return {
        loading,
        integrations,
        success,
        error,
        isModalOpen,
        setIsModalOpen,
        selectedProvider,
        formData,
        setFormData,
        handleConnectMeta,
        handleSaveIntegration
    };
};
