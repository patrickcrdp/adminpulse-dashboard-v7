import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { SettingsFacade } from '../services/settingsFacade';
import { PipelineStage } from '../types';

export const useSettingsData = () => {
    const { user, profile, organization, refreshProfile, refreshOrganization } = useAuth();
    
    const [loading, setLoading] = useState(false);
    const [success, setSuccess] = useState<string | null>(null);
    const [error, setError] = useState<string | null>(null);

    // Profile Form State
    const [fullName, setFullName] = useState(profile?.full_name || '');
    const [avatarUrl, setAvatarUrl] = useState(profile?.avatar_url || '');

    // Organization Form State
    const [orgName, setOrgName] = useState(organization?.name || '');
    const [orgPhone, setOrgPhone] = useState(organization?.phone || '');
    const [logoUrl, setLogoUrl] = useState(organization?.logo_url || '');

    // AI Integration State
    const [aiConfig, setAiConfig] = useState<any>(null);
    const [copySuccess, setCopySuccess] = useState(false);

    // Pipeline Management State
    const [stages, setStages] = useState<PipelineStage[]>([]);
    const [newStageName, setNewStageName] = useState('');

    // Marketing & Ads State
    const [marketingConfig, setMarketingConfig] = useState<{
        industry: string;
        monthly_budget_goal: number;
        monthly_revenue_goal: number;
        average_ticket: number;
        target_cac: number;
    }>({
        industry: '',
        monthly_budget_goal: 0,
        monthly_revenue_goal: 0,
        average_ticket: 0,
        target_cac: 0
    });
    const [integrations, setIntegrations] = useState<any[]>([]);

    useEffect(() => {
        if (profile) {
            setFullName(profile.full_name || '');
            setAvatarUrl(profile.avatar_url || '');
        }
        if (organization) {
            setOrgName(organization.name || '');
            setOrgPhone(organization.phone || '');
            setLogoUrl(organization.logo_url || '');
            fetchAIConfig();
            fetchStages();
            fetchMarketingData();
        }
    }, [profile, organization]);

    const fetchMarketingData = async () => {
        if (!organization?.id) return;
        
        try {
            const config = await SettingsFacade.fetchMarketingConfig(organization.id);
            if (config) {
                setMarketingConfig({
                    industry: config.industry || '',
                    monthly_budget_goal: config.monthly_budget_goal || 0,
                    monthly_revenue_goal: config.monthly_revenue_goal || 0,
                    average_ticket: config.average_ticket || 0,
                    target_cac: config.target_cac || 0
                });
            }

            const ints = await SettingsFacade.fetchMarketingIntegrations(organization.id);
            setIntegrations(ints || []);
        } catch (err: any) {
            console.error('Error fetching marketing data', err);
        }
    };

    const handleUpdateMarketing = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!organization?.id) return;

        setLoading(true);
        try {
            await SettingsFacade.updateMarketingConfig(organization.id, marketingConfig);
            setSuccess('Configurações de marketing salvas!');
        } catch (err: any) {
            setError('Erro ao salvar marketing: ' + err.message);
        } finally {
            setLoading(false);
        }
    };

    const handleConnectAds = async (provider: string) => {
        setLoading(true);
        try {
            const origin = window.location.origin;
            const data = await SettingsFacade.connectAdsProvider(provider, origin);

            if (data && data.url) {
                window.location.href = data.url;
            } else {
                throw new Error('URL de conexão não retornada pela função');
            }
        } catch (err: any) {
            console.error('[Ads Connection Error]', err);
            setError(`Erro ao conectar ${provider}: ${err.message || 'Erro desconhecido'}`);
        } finally {
            setLoading(false);
        }
    };

    const fetchStages = async () => {
        if (!organization?.id) return;
        try {
            const data = await SettingsFacade.fetchPipelineStages(organization.id);
            setStages(data);
        } catch (err) {
             console.error('Error fetching stages', err);
        }
    };

    const handleAddStage = async () => {
        if (!newStageName.trim() || !organization?.id) return;

        setLoading(true);
        try {
            const newOrder = stages.length;
            await SettingsFacade.insertPipelineStage(organization.id, newStageName.trim(), newOrder);
            setNewStageName('');
            await fetchStages();
            setSuccess('Novo estágio adicionado ao funil!');
        } catch (err: any) {
            setError('Erro ao adicionar estágio: ' + err.message);
        } finally {
            setLoading(false);
        }
    };

    const handleDeleteStage = async (stageId: string, isSystem: boolean) => {
        if (isSystem) {
            setError('Estágios do sistema não podem ser excluídos para manter a integridade.');
            return;
        }

        if (!window.confirm('Tem certeza? Leads neste estágio ficarão sem coluna no pipeline.')) return;

        setLoading(true);
        try {
            await SettingsFacade.deletePipelineStage(stageId);
            await fetchStages();
            setSuccess('Estágio removido com sucesso.');
        } catch (err: any) {
            setError('Erro ao remover estágio: ' + err.message);
        } finally {
            setLoading(false);
        }
    };

    const fetchAIConfig = async () => {
        if (!organization?.id) return;
        try {
            const data = await SettingsFacade.fetchAIConfig(organization.id);
            setAiConfig(data);
        } catch (err) {
            console.error('Error fetching AI config', err);
        }
    };

    const handleCreateAIKey = async () => {
        if (!organization?.id) return;
        setLoading(true);
        try {
            const data = await SettingsFacade.createAIConfig(organization.id);
            setAiConfig(data);
            setSuccess('Chave de API gerada com sucesso para sua IA!');
        } catch (err: any) {
            console.error('[AI Integration] Erro ao criar chave:', err);
            setError('Erro ao gerar chave de IA: ' + err.message);
        } finally {
            setLoading(false);
        }
    };

    const copyToClipboard = (text: string) => {
        navigator.clipboard.writeText(text);
        setCopySuccess(true);
        setTimeout(() => setCopySuccess(false), 2000);
    };

    const handleUpdateProfile = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!user) return;

        setLoading(true);
        setSuccess(null);
        setError(null);

        try {
            await SettingsFacade.updateProfile(user.id, fullName, avatarUrl);
            await refreshProfile();
            setSuccess('Perfil atualizado com sucesso!');
        } catch (err: any) {
            setError(err.message || 'Erro ao atualizar perfil');
        } finally {
            setLoading(false);
        }
    };

    const handleUpdateOrganization = async (e: React.FormEvent) => {
        e.preventDefault();
        console.log('[Settings] Iniciando atualização da organização:', organization?.id);

        if (!organization?.id) {
            setError('ID da organização não encontrado. Tente atualizar a página.');
            return;
        }

        setLoading(true);
        setSuccess(null);
        setError(null);

        try {
            await SettingsFacade.updateOrganization(organization.id, orgName.trim(), orgPhone.trim(), logoUrl);
            await refreshOrganization();
            setSuccess('Dados da empresa atualizados com sucesso!');
        } catch (err: any) {
            console.error('[Settings] Erro ao salvar:', err);
            setError(err.message || 'Erro ao atualizar empresa');
        } finally {
            setLoading(false);
        }
    };

    const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>, type: 'avatar' | 'logo') => {
        const file = e.target.files?.[0];
        if (!file || !user) return;

        const MAX_SIZE = 2 * 1024 * 1024; // 2MB
        if (file.size > MAX_SIZE) {
            setError('A imagem é muito grande. O tamanho máximo permitido é 2MB.');
            return;
        }

        const allowedTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/svg+xml'];
        if (!allowedTypes.includes(file.type)) {
            setError('Formato inválido. Use JPG, PNG, WebP ou SVG.');
            return;
        }

        setLoading(true);
        setSuccess(null);
        setError(null);

        try {
            const fileExt = file.name.split('.').pop();
            const fileName = `${user.id}-${Math.random()}.${fileExt}`;
            const filePath = `${type}s/${fileName}`;

            const publicUrl = await SettingsFacade.uploadAsset(filePath, file);

            if (type === 'avatar') {
                setAvatarUrl(publicUrl);
            } else {
                setLogoUrl(publicUrl);
            }
            setSuccess('Imagem carregada! Clique em salvar para aplicar.');
        } catch (err: any) {
            console.error('[Settings] Erro no upload:', err);
            setError('Erro no upload: Certifique-se que o bucket "public-assets" existe e está público.');
        } finally {
            setLoading(false);
        }
    };

    return {
        user,
        loading,
        success,
        error,
        fullName, setFullName,
        avatarUrl, setAvatarUrl,
        orgName, setOrgName,
        orgPhone, setOrgPhone,
        logoUrl, setLogoUrl,
        aiConfig,
        copySuccess,
        stages,
        newStageName, setNewStageName,
        marketingConfig, setMarketingConfig,
        integrations,
        handleUpdateMarketing,
        handleConnectAds,
        handleAddStage,
        handleDeleteStage,
        handleCreateAIKey,
        copyToClipboard,
        handleUpdateProfile,
        handleUpdateOrganization,
        handleFileUpload
    };
};
