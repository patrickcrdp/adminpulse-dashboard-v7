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
    return data || [];
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
