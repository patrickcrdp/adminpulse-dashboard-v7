import { supabase } from '../supabaseClient';
import { Lead } from '../types';

export class ReportsFacade {
  static async fetchLeads(organizationId: string, startDate?: string, endDate?: string): Promise<Lead[]> {
    let query = supabase
      .from('leads')
      .select('*')
      .eq('organization_id', organizationId);

    if (startDate) {
        query = query.gte('created_at', startDate);
    }
    if (endDate) {
        query = query.lte('created_at', endDate);
    }

    const { data, error } = await query;
    if (error) throw error;
    return data || [];
  }

  static async fetchActivities(organizationId: string, startDate?: string, endDate?: string): Promise<any[]> {
    let query = supabase
      .from('activities')
      .select('*')
      .eq('organization_id', organizationId);

    if (startDate) {
        query = query.gte('created_at', startDate);
    }
    if (endDate) {
        query = query.lte('created_at', endDate);
    }

    const { data, error } = await query;
    if (error) throw error;
    return data || [];
  }
}
