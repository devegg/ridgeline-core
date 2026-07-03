// ============================================================
// Status enums
// ============================================================

export type ClientStatus = 'active' | 'prospective' | 'past' | 'archived' | 'scheduled_delete'
export type ProjectStatus = 'active' | 'on_hold' | 'completed' | 'archived' | 'scheduled_delete'
export type ProposalStatus = 'draft' | 'pending' | 'approved' | 'rejected' | 'archived' | 'scheduled_delete'
export type AssessmentStatus = 'scheduled' | 'in_progress' | 'completed' | 'scheduled_delete'
export type DeliverableStatus = 'pending' | 'in_progress' | 'completed' | 'approved' | 'delivered' | 'scheduled_delete'
export type InvoiceStatus = 'draft' | 'sent' | 'paid' | 'overdue' | 'cancelled' | 'scheduled_delete'
export type RateType = 'hourly' | 'daily' | 'fixed'
export type ContactRole = 'owner' | 'project_contact' | 'billing' | 'technical' | 'other'
export type LeadStage = 'identified' | 'contacted' | 'meeting_scheduled' | 'proposal_sent' | 'won' | 'lost'
export type LeadSource = 'card_drop' | 'referral' | 'networking_event' | 'cold_outreach' | 'inbound' | 'other'

// ============================================================
// Entities
// ============================================================

export interface Client {
  id: string
  created_at: string
  updated_at: string
  name: string
  primary_contact: string | null
  email: string | null
  phone: string | null
  industry: string | null
  location: string | null
  relationship_notes: string | null
  status: ClientStatus
}

export interface Project {
  id: string
  created_at: string
  updated_at: string
  client_id: string | null
  name: string
  description: string | null
  scope: string | null
  status: ProjectStatus
  start_date: string | null
  end_date: string | null
  client?: Pick<Client, 'id' | 'name'>
}

export interface Milestone {
  id: string
  created_at: string
  project_id: string
  title: string
  due_date: string | null
  completed_at: string | null
  sort_order: number
}

export interface Proposal {
  id: string
  created_at: string
  updated_at: string
  client_id: string | null
  project_id: string | null
  title: string
  scope: string | null
  pricing_notes: string | null
  total_amount: number | null
  status: ProposalStatus
  sent_at: string | null
  accepted_at: string | null
  client?: Pick<Client, 'id' | 'name'>
  project?: Pick<Project, 'id' | 'name'>
}

export interface Assessment {
  id: string
  created_at: string
  updated_at: string
  client_id: string | null
  project_id: string | null
  title: string
  scheduled_date: string | null
  findings: string | null
  recommendations: string | null
  status: AssessmentStatus
  completed_at: string | null
  follow_up_project_id: string | null
  client?: Pick<Client, 'id' | 'name'>
  project?: Pick<Project, 'id' | 'name'>
}

export interface Deliverable {
  id: string
  created_at: string
  updated_at: string
  project_id: string | null
  title: string
  description: string | null
  due_date: string | null
  status: DeliverableStatus
  approved_at: string | null
  delivered_at: string | null
  project?: Pick<Project, 'id' | 'name'>
}

export interface LineItem {
  description: string
  quantity: number
  rate: number
  amount: number
}

export interface Invoice {
  id: string
  created_at: string
  updated_at: string
  client_id: string | null
  project_id: string | null
  invoice_number: string | null
  line_items: LineItem[]
  subtotal: number
  total: number
  status: InvoiceStatus
  due_date: string | null
  paid_at: string | null
  notes: string | null
  client?: Pick<Client, 'id' | 'name'>
  project?: Pick<Project, 'id' | 'name'>
}

export type DocumentEntityType = 'assessment' | 'proposal' | 'project' | 'client'

export interface Document {
  id: string
  created_at: string
  updated_at: string
  entity_type: DocumentEntityType
  entity_id: string
  name: string
  content: string
  is_shared: boolean
}

export interface Lead {
  id: string
  created_at: string
  updated_at: string
  business_name: string
  contact_name: string | null
  contact_title: string | null
  email: string | null
  phone: string | null
  industry: string | null
  location: string | null
  stage: LeadStage
  lost_reason: string | null
  follow_up_date: string | null
  source: LeadSource
  referred_by: string | null
  notes: string | null
  linkedin_url: string | null
  x_url: string | null
  facebook_url: string | null
  instagram_url: string | null
  website: string | null
  converted_client_id: string | null
}

export interface Contact {
  id: string
  created_at: string
  updated_at: string
  client_id: string
  name: string
  title: string | null
  role: ContactRole
  email: string | null
  phone: string | null
  is_portal_user: boolean
  notes: string | null
  linkedin_url: string | null
  x_url: string | null
  facebook_url: string | null
  instagram_url: string | null
  website: string | null
}

export interface BillingRate {
  id: string
  created_at: string
  label: string
  rate: number
  rate_type: RateType
  project_id: string | null
  is_default: boolean
  project?: Pick<Project, 'id' | 'name'>
}

// ============================================================
// Server action return type
// ============================================================

export type ActionState = {
  errors?: Record<string, string>
  message?: string
} | null
