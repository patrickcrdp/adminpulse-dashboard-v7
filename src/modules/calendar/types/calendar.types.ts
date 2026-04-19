export type AppointmentStatus = 'scheduled' | 'confirmed' | 'cancelled' | 'completed' | 'no_show';
export type SyncStatus = 'pending' | 'synced' | 'failed' | 'conflict';

export interface CalendarEvent {
  id: string;
  organization_id: string;
  lead_id?: string;
  user_id: string;
  created_by: string;
  title: string;
  description?: string;
  location?: string;
  start_at: string;
  end_at: string;
  timezone: string;
  status: AppointmentStatus;
  google_event_id?: string;
  sync_status: SyncStatus;
  created_at: string;
  updated_at?: string;
  leads?: {
    id: string;
    name: string;
    email?: string;
  };
}

export type CalendarViewType = 'month' | 'week' | 'day';

export interface CalendarState {
  currentDate: Date;
  view: CalendarViewType;
  events: CalendarEvent[];
  loading: boolean;
  error: string | null;
}
