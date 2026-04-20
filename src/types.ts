export type LeadStatus = 'new' | 'contacted' | 'qualified' | 'converted' | 'lost' | 'archived';

export interface PipelineStage {
  id: string;
  organization_id: string;
  name: string;
  description?: string;
  color: string;
  order_index: number;
  is_system: boolean;
  created_at: string;
}

export interface Organization {
  id: string;
  name: string;
  logo_url?: string;
  phone?: string;
  created_at: string;
}

export interface Lead {
  id: string;
  organization_id?: string; // Multi-tenant ID
  user_id?: string; // Owner ID
  name: string;
  email: string;
  phone: string;
  message: string;
  created_at: string;
  updated_at?: string;
  status: LeadStatus;
  // Marketing & Tracking fields
  utm_source?: string;
  utm_medium?: string;
  utm_campaign?: string;
  traffic_source?: string;
  pipeline_stage_id?: string;
  value?: number;
  tags?: string[];
}

export type ActivityType = 'call' | 'whatsapp' | 'meeting' | 'note' | 'appointment_created';

export interface Activity {
  id: string;
  organization_id?: string; // Multi-tenant ID
  lead_id: string;
  activity_type: ActivityType;
  description: string;
  created_at: string;
}

export interface UserProfile {
  id: string;
  email: string;
  full_name?: string;
  avatar_url?: string;
  onboarding_completed?: boolean;
}

export interface DashboardStats {
  totalLeads: number;
  newLeads: number;
  contactedLeads: number;
  qualifiedLeads: number;
  convertedLeads: number;
  conversionRate: number;
  costPerLead: number;
  qualityScore: number;
  avgResponseTime?: string;
  contactRate?: number;
  stalledLeads?: number;
  avgSalesCycle?: string;
  trends?: {
    totalLeads: number;
    conversionRate: number;
    qualifiedLeads: number;
    qualityScore: number;
    avgResponseTime: number; // Percentage change
    contactRate: number;
    stalledLeads: number; // Percentage change (lower is better usually, but we track change)
    avgSalesCycle: number;
  };
}

export interface ChartData {
  date: string;
  count: number;
  visitors?: number;
}

export interface ChannelData {
  name: string;
  value: number;
  color: string;
}

export interface Insight {
  type: 'positive' | 'negative' | 'neutral' | 'warning';
  message: string;
  metric?: string;
}

export interface Appointment {
  id: string;
  organization_id: string;
  lead_id?: string;
  user_id?: string;
  title: string;
  description?: string;
  location?: string;
  start_at: string;
  end_at: string;
  status: 'scheduled' | 'confirmed' | 'cancelled' | 'completed' | 'no_show';
  sync_status: 'pending' | 'synced' | 'failed' | 'conflict';
  google_event_id?: string;
}

export interface CalendarIntegration {
  id: string;
  user_id: string;
  organization_id: string;
  provider: string;
  provider_account_id: string;
  is_active: boolean;
  last_synced_at?: string;
}