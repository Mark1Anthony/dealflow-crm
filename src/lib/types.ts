// ============================================================
// DealFlow CRM — Domain Types
// ============================================================

export interface PipelineStage {
  id: string;
  user_id: string;
  name: string;
  position: number;
  color: string | null;
  created_at: string;
  updated_at: string;
}

export interface Contact {
  id: string;
  user_id: string;
  name: string;
  email: string | null;
  phone: string | null;
  company: string | null;
  position: string | null;
  notes: string | null;
  created_at: string;
  updated_at: string;
}

export interface Deal {
  id: string;
  user_id: string;
  title: string;
  value: number | null;
  contact_id: string | null;
  stage_id: string;
  expected_close: string | null;
  description: string | null;
  created_at: string;
  updated_at: string;

  // joined relations
  contact?: Contact;
  stage?: PipelineStage;
}

export interface Note {
  id: string;
  user_id: string;
  content: string;
  contact_id: string | null;
  deal_id: string | null;
  created_at: string;

  // joined relations
  contact?: Contact;
  deal?: Deal;
}

export interface Activity {
  id: string;
  user_id: string;
  type: 'call' | 'email' | 'meeting' | 'task';
  description: string;
  contact_id: string | null;
  deal_id: string | null;
  completed_at: string | null;
  created_at: string;

  // joined relations
  contact?: Contact;
  deal?: Deal;
}

export interface Tag {
  id: string;
  user_id: string;
  name: string;
  color: string | null;
  created_at: string;
}

export interface ContactTag {
  id: string;
  contact_id: string;
  tag_id: string;
}

export interface DashboardStats {
  totalContacts: number;
  activeDeals: number;
  pipelineValue: number;
  activitiesThisWeek: number;
}
