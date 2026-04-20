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
    const [formData, setFormData] = useState({ 
        phone_number_id: '', 
        waba_id: '',
        access_token: '',
        verify_token: 'AdminPulseV7OmnichannelSecurityToken'
    });

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
                name: `Canal ${selectedProvider.name}`,
                provider: selectedProvider.id, // Fundamental para diferenciar WABA, IG ou Messenger
                phone_number_id: formData.phone_number_id,
                waba_id: formData.waba_id,
                access_token: formData.access_token,
                verify_token: formData.verify_token || 'adminpulse_secure_token_v1',
                status: 'CONNECTED'
            });

            setSuccess(`Integração Oficial com ${selectedProvider.name} da Meta salva e roteada no banco de dados!`);
            setIsModalOpen(false);
            setFormData({ phone_number_id: '', waba_id: '', access_token: '', verify_token: 'adminpulse_secure_token_v1' });
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
