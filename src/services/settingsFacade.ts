import { supabase } from '../supabaseClient';
import { PipelineStage } from '../types';

export class SettingsFacade {
  static async fetchMarketingConfig(organizationId: string) {
    const { data, error } = await supabase
      .from('marketing_config')
      .select('*')
      .eq('organization_id', organizationId)
      .maybeSingle();

    if (error) throw error;
    return data;
  }

  static async fetchMarketingIntegrations(organizationId: string) {
    const { data, error } = await supabase
      .from('marketing_integrations')
      .select('*')
      .eq('organization_id', organizationId);

    if (error) throw error;
    return data || [];
  }

  static async updateMarketingConfig(organizationId: string, config: any) {
    const { data, error } = await supabase
      .from('marketing_config')
      .upsert({
        organization_id: organizationId,
        ...config,
        updated_at: new Date().toISOString()
      });

    if (error) throw error;
    return data;
  }

  static async connectAdsProvider(provider: string, origin: string) {
    const { data, error } = await supabase.functions.invoke(`ads-oauth/connect?provider=${provider}&origin=${origin}`, {
      method: 'GET',
    });

    if (error) throw error;
    return data;
  }

  static async fetchPipelineStages(organizationId: string): Promise<PipelineStage[]> {
    const { data, error } = await supabase
      .from('pipeline_stages')
      .select('*')
      .eq('organization_id', organizationId)
      .order('order_index', { ascending: true });

    if (error) throw error;
    return data as PipelineStage[] || [];
  }

  static async insertPipelineStage(organizationId: string, name: string, orderIndex: number) {
    const { data, error } = await supabase
      .from('pipeline_stages')
      .insert([{
        organization_id: organizationId,
        name: name,
        order_index: orderIndex,
        color: 'border-slate-500/50'
      }]);

    if (error) throw error;
    return data;
  }

  static async deletePipelineStage(stageId: string) {
    const { error } = await supabase
      .from('pipeline_stages')
      .delete()
      .eq('id', stageId);

    if (error) throw error;
  }

  static async fetchAIConfig(organizationId: string) {
    const { data, error } = await supabase
      .from('ai_agent_configs')
      .select('*')
      .eq('organization_id', organizationId)
      .maybeSingle();
      
    if (error && error.code !== 'PGRST116') throw error; // Ignora row not found
    return data;
  }

  static async createAIConfig(organizationId: string) {
    const { data, error } = await supabase
      .from('ai_agent_configs')
      .insert([{
        organization_id: organizationId,
        agent_name: 'IA de Atendimento'
      }])
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  static async updateProfile(userId: string, fullName: string, avatarUrl: string) {
    const { error } = await supabase
      .from('profiles')
      .update({
        full_name: fullName,
        avatar_url: avatarUrl,
        updated_at: new Date().toISOString(),
      })
      .eq('id', userId);

    if (error) throw error;
  }

  static async updateOrganization(orgId: string, name: string, phone: string, logoUrl: string) {
    const { data, error } = await supabase
      .from('organizations')
      .update({
        name: name,
        phone: phone,
        logo_url: logoUrl,
      })
      .eq('id', orgId)
      .select();

    if (error) throw error;
    if (!data || data.length === 0) {
      throw new Error('Nenhuma alteração foi salva. Verifique se você tem permissão de dono.');
    }
    return data;
  }

  static async uploadAsset(filePath: string, file: File) {
    const { error } = await supabase.storage
      .from('public-assets')
      .upload(filePath, file);

    if (error) throw error;
    
    const { data } = supabase.storage
      .from('public-assets')
      .getPublicUrl(filePath);

    return data.publicUrl;
  }
}
