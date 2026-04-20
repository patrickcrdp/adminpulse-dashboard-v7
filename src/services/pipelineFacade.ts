import { supabase } from '../supabaseClient';
import { PipelineStage, Lead } from '../types';

export class PipelineFacade {
  static async fetchStages(organizationId: string): Promise<PipelineStage[]> {
    const { data, error } = await supabase
      .from('pipeline_stages')
      .select('*')
      .eq('organization_id', organizationId)
      .order('order_index', { ascending: true });
    
    if (error) throw error;
    
    // Auto-cria as colunas se for o primeiro acesso da clinica
    if (!data || data.length === 0) {
        console.log("Criando estágios padrão para a organização...");
        const defaultStages = [
            { organization_id: organizationId, name: 'Novos Leads', color: 'border-blue-500/50', order_index: 0, is_system: true },
            { organization_id: organizationId, name: 'Em Contato', color: 'border-amber-500/50', order_index: 1, is_system: true },
            { organization_id: organizationId, name: 'Orçamento Enviado', color: 'border-emerald-500/50', order_index: 2, is_system: true },
            { organization_id: organizationId, name: 'Fechado / Ganho', color: 'border-purple-500/50', order_index: 3, is_system: true }
        ];

        const { data: newStages, error: insertError } = await supabase
            .from('pipeline_stages')
            .insert(defaultStages)
            .select();

        if (insertError) {
             console.error("Failed to seed pipeline stages", insertError);
             return [];
        }
        return newStages || [];
    }

    return data;
  }

  static async fetchLeads(organizationId: string): Promise<Lead[]> {
    const { data, error } = await supabase
        .from('leads')
        .select('*')
        .eq('organization_id', organizationId)
        .neq('status', 'archived')
        .order('created_at', { ascending: false });
        
    if (error) throw error;
    return data || [];
  }

  static async updateLeadStage(leadId: string, stageId: string): Promise<void> {
    const { error } = await supabase
        .from('leads')
        .update({ pipeline_stage_id: stageId })
        .eq('id', leadId);
        
    if (error) throw error;
  }
}
