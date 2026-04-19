import { supabase } from '../supabaseClient';
import { Lead, Activity } from '../types';

/**
 * Padrão Façade: Esconde a complexidade da comunicação com o Supabase e bancos de dados.
 * Reduz o acoplamento entre as páginas de UI e o serviço de persistência de dados.
 */
export class DashboardFacade {
  static async fetchLeadsFromDate(startDate: string): Promise<Lead[]> {
    const { data, error } = await supabase
      .from('leads')
      .select('*')
      .gte('created_at', startDate)
      .order('created_at', { ascending: true });

    if (error) throw error;
    return data as Lead[] || [];
  }

  static async fetchRecentActivities(limit: number = 10): Promise<Activity[]> {
    const { data, error } = await supabase
      .from('activities')
      .select('*')
      .lte('created_at', new Date().toISOString())
      .order('created_at', { ascending: false })
      .limit(limit);

    if (error) throw error;
    return data as Activity[] || [];
  }

  static async fetchUpcomingAppointments(limit: number = 5): Promise<Activity[]> {
    const { data, error } = await supabase
      .from('activities')
      .select('*')
      .gte('created_at', new Date(new Date().setHours(0, 0, 0, 0)).toISOString())
      .order('created_at', { ascending: true })
      .limit(limit);

    if (error) throw error;
    return data as Activity[] || [];
  }

  static async fetchActivitiesByDateRange(startDate: string): Promise<Pick<Activity, 'id' | 'created_at' | 'lead_id' | 'activity_type'>[]> {
    const { data, error } = await supabase
      .from('activities')
      .select('id, created_at, lead_id, activity_type')
      .gte('created_at', startDate);

    if (error) throw error;
    return data as Pick<Activity, 'id' | 'created_at' | 'lead_id' | 'activity_type'>[] || [];
  }

  static async getAverageResponseTime(): Promise<string> {
    const { data, error } = await supabase.rpc('get_average_response_time');
    if (error) return '--';
    return data as unknown as string;
  }

  static async fetchLeadsBasicInfo(leadIds: string[]): Promise<{ id: string; name: string; phone: string }[]> {
    if (!leadIds || leadIds.length === 0) return [];
    const { data, error } = await supabase
      .from('leads')
      .select('id, name, phone')
      .in('id', leadIds);

    if (error) throw error;
    return data || [];
  }

  static async fetchLeadById(leadId: string): Promise<Lead | null> {
    const { data, error } = await supabase
      .from('leads')
      .select('*')
      .eq('id', leadId)
      .single();
      
    if (error && error.code !== 'PGRST116') {
      throw error;
    }
    
    return data as Lead | null;
  }
}
