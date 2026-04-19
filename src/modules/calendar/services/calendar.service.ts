import { supabase } from '../../../supabaseClient';
import { CalendarEvent } from '../types/calendar.types';

export const calendarService = {
  /**
   * Busca agendamentos para uma organização e intervalo de datas
   */
  async fetchEvents(organizationId: string, startDate: Date, endDate: Date) {
    const { data, error } = await supabase
      .from('appointments')
      .select(`
        *,
        leads (
          id,
          name,
          email
        )
      `)
      .eq('organization_id', organizationId)
      .gte('start_at', startDate.toISOString())
      .lte('start_at', endDate.toISOString())
      .is('deleted_at', null)
      .order('start_at', { ascending: true });

    if (error) throw new Error(error.message);
    return data as CalendarEvent[];
  },

  /**
   * Cria um novo agendamento
   * O sync é feito automaticamente pelo Webhook do Supabase
   */
  async createEvent(event: Partial<CalendarEvent>) {
    console.log("[CalendarService] Iniciando createEvent...");
    const { data: { user }, error: userError } = await supabase.auth.getUser();
    if (userError) {
        console.error("[CalendarService] Erro ao obter user:", userError);
        throw new Error('Falha de autenticação ao criar agenda.');
    }
    if (!user) throw new Error('Usuário não autenticado');

    const payload = {
      title: event.title,
      description: event.description || null,
      location: event.location || null,
      start_at: event.start_at,
      end_at: event.end_at,
      status: event.status || 'scheduled',
      organization_id: event.organization_id,
      user_id: user.id,
      created_by: user.id,
      lead_id: event.lead_id || null,
      sync_status: 'pending',
    };

    console.log("[CalendarService] Realizando insert no banco payload:", payload);

    try {
      // Retirado o abortSignal e o single() fixo para evitar Hangs silenciosos
      const { data, error } = await supabase
        .from('appointments')
        .insert([payload])
        .select();

      console.log("[CalendarService] Resposta do insert:", { data, error });

      if (error) throw new Error(error.message);
      
      if (!data || data.length === 0) {
         // Fallback se o Select for bloqueado pelo RLS mas o Insert funcionou
         console.warn("[CalendarService] Insert funcionou mas dados não retornaram (RLS). Retornando payload estático.");
         return { id: crypto.randomUUID(), ...payload } as CalendarEvent;
      }

      return data[0] as CalendarEvent;
    } catch (error: any) {
      console.error("[CalendarService] Erro brutal no Insert:", error);
      throw error;
    }
  },

  /**
   * Atualiza um agendamento
   */
  async updateEvent(id: string, updates: Partial<CalendarEvent>) {
    const updatePayload = {
      title: updates.title,
      description: updates.description || null,
      location: updates.location || null,
      start_at: updates.start_at,
      end_at: updates.end_at,
      status: updates.status,
      lead_id: updates.lead_id || null,
      updated_at: new Date().toISOString(),
      sync_status: 'pending',
    };

    const { error: updateError } = await supabase
      .from('appointments')
      .update(updatePayload)
      .eq('id', id);

    if (updateError) throw new Error(updateError.message);

    const { data, error: fetchError } = await supabase
      .from('appointments')
      .select('*')
      .eq('id', id)
      .single();

    if (fetchError || !data) return { id, ...updates } as CalendarEvent;
    return data as CalendarEvent;
  },

  /**
   * Soft delete
   */
  async deleteEvent(id: string) {
    const { error } = await supabase
      .from('appointments')
      .update({ deleted_at: new Date().toISOString() })
      .eq('id', id);

    if (error) throw new Error(error.message);
    return true;
  },
};
