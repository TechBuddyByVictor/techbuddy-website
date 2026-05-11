export type TicketStatus = 'open' | 'in_progress' | 'waiting_on_customer' | 'resolved' | 'closed'
export type UserRole = 'customer' | 'admin'

export type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[]

export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string
          email: string
          full_name: string
          phone: string | null
          alternate_phone: string | null
          preferred_contact: string
          role: UserRole
          created_at: string
          updated_at: string
        }
        Insert: {
          id: string
          email: string
          full_name: string
          phone?: string | null
          alternate_phone?: string | null
          preferred_contact?: string
          role?: UserRole
          created_at?: string
          updated_at?: string
        }
        Update: {
          email?: string
          full_name?: string
          phone?: string | null
          alternate_phone?: string | null
          preferred_contact?: string
          role?: UserRole
          updated_at?: string
        }
        Relationships: []
      }
      support_tickets: {
        Row: {
          id: string
          customer_id: string
          customer_name: string | null
          customer_email: string | null
          customer_phone: string | null
          title: string
          description: string
          category: string
          status: TicketStatus
          urgency: string
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          customer_id: string
          customer_name?: string | null
          customer_email?: string | null
          customer_phone?: string | null
          title: string
          description: string
          category?: string
          status?: TicketStatus
          urgency?: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          title?: string
          customer_name?: string | null
          customer_email?: string | null
          customer_phone?: string | null
          description?: string
          category?: string
          status?: TicketStatus
          urgency?: string
          updated_at?: string
        }
        Relationships: []
      }
      ticket_messages: {
        Row: {
          id: string
          ticket_id: string
          sender_id: string
          sender_role: UserRole
          message: string
          created_at: string
        }
        Insert: {
          id?: string
          ticket_id: string
          sender_id: string
          sender_role: UserRole
          message: string
          created_at?: string
        }
        Update: {
          message?: string
        }
        Relationships: []
      }
      ticket_photos: {
        Row: {
          id: string
          ticket_id: string
          uploaded_by: string
          customer_id: string
          file_name: string
          file_type: string | null
          file_size: number | null
          storage_path: string
          public_url: string
          created_at: string
        }
        Insert: {
          id?: string
          ticket_id: string
          uploaded_by: string
          customer_id: string
          file_name: string
          file_type?: string | null
          file_size?: number | null
          storage_path: string
          public_url: string
          created_at?: string
        }
        Update: {
          uploaded_by?: string
          customer_id?: string
          file_name?: string
          file_type?: string | null
          file_size?: number | null
          storage_path?: string
          public_url?: string
        }
        Relationships: []
      }
      customer_addresses: {
        Row: {
          id: string
          customer_id: string
          label: string
          street_line_1: string
          street_line_2: string | null
          city: string
          state: string
          postal_code: string
          notes: string | null
          is_primary: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          customer_id: string
          label?: string
          street_line_1?: string
          street_line_2?: string | null
          city?: string
          state?: string
          postal_code?: string
          notes?: string | null
          is_primary?: boolean
          created_at?: string
          updated_at?: string
        }
        Update: {
          label?: string
          street_line_1?: string
          street_line_2?: string | null
          city?: string
          state?: string
          postal_code?: string
          notes?: string | null
          is_primary?: boolean
          updated_at?: string
        }
        Relationships: []
      }
      membership_plans: {
        Row: {
          id: string
          name: string
          slug: string
          price_label: string
          description: string
          features: string[]
          priority_level: number
          is_active: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          name: string
          slug: string
          price_label: string
          description: string
          features?: string[]
          priority_level?: number
          is_active?: boolean
          created_at?: string
          updated_at?: string
        }
        Update: {
          name?: string
          slug?: string
          price_label?: string
          description?: string
          features?: string[]
          priority_level?: number
          is_active?: boolean
          updated_at?: string
        }
        Relationships: []
      }
      customer_memberships: {
        Row: {
          id: string
          customer_id: string
          plan_id: string | null
          plan_name: string
          status: string
          start_date: string | null
          renewal_date: string | null
          notes: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          customer_id: string
          plan_id?: string | null
          plan_name: string
          status?: string
          start_date?: string | null
          renewal_date?: string | null
          notes?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          plan_id?: string | null
          plan_name?: string
          status?: string
          start_date?: string | null
          renewal_date?: string | null
          notes?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      service_records: {
        Row: {
          id: string
          customer_id: string
          ticket_id: string | null
          title: string
          category: string
          status: string
          service_date: string | null
          completed_at: string | null
          service_location: string | null
          technician: string | null
          devices_serviced: string | null
          issue_found: string | null
          work_performed: string | null
          parts_used: string | null
          labor_minutes: number
          follow_up_recommended: boolean
          follow_up_notes: string | null
          technician_notes: string | null
          customer_summary: string | null
          warranty_status: string
          warranty_expires_at: string | null
          warranty_terms: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          customer_id: string
          ticket_id?: string | null
          title: string
          category?: string
          status?: string
          service_date?: string | null
          completed_at?: string | null
          service_location?: string | null
          technician?: string | null
          devices_serviced?: string | null
          issue_found?: string | null
          work_performed?: string | null
          parts_used?: string | null
          labor_minutes?: number
          follow_up_recommended?: boolean
          follow_up_notes?: string | null
          technician_notes?: string | null
          customer_summary?: string | null
          warranty_status?: string
          warranty_expires_at?: string | null
          warranty_terms?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          ticket_id?: string | null
          title?: string
          category?: string
          status?: string
          service_date?: string | null
          completed_at?: string | null
          service_location?: string | null
          technician?: string | null
          devices_serviced?: string | null
          issue_found?: string | null
          work_performed?: string | null
          parts_used?: string | null
          labor_minutes?: number
          follow_up_recommended?: boolean
          follow_up_notes?: string | null
          technician_notes?: string | null
          customer_summary?: string | null
          warranty_status?: string
          warranty_expires_at?: string | null
          warranty_terms?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      service_record_photos: {
        Row: {
          id: string
          service_record_id: string
          customer_id: string
          uploaded_by: string
          file_name: string
          file_type: string | null
          file_size: number | null
          file_path: string
          storage_path: string
          public_url: string
          caption: string | null
          created_at: string
        }
        Insert: {
          id?: string
          service_record_id: string
          customer_id: string
          uploaded_by: string
          file_name: string
          file_type?: string | null
          file_size?: number | null
          file_path: string
          storage_path: string
          public_url: string
          caption?: string | null
          created_at?: string
        }
        Update: {
          service_record_id?: string
          customer_id?: string
          uploaded_by?: string
          file_name?: string
          file_type?: string | null
          file_size?: number | null
          file_path?: string
          storage_path?: string
          public_url?: string
          caption?: string | null
        }
        Relationships: []
      }
      invoices: {
        Row: {
          id: string
          customer_id: string
          service_record_id: string | null
          invoice_number: string
          status: string
          amount_cents: number
          due_date: string | null
          sent_at: string | null
          paid_at: string | null
          hosted_url: string | null
          notes: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          customer_id: string
          service_record_id?: string | null
          invoice_number: string
          status?: string
          amount_cents?: number
          due_date?: string | null
          sent_at?: string | null
          paid_at?: string | null
          hosted_url?: string | null
          notes?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          service_record_id?: string | null
          invoice_number?: string
          status?: string
          amount_cents?: number
          due_date?: string | null
          sent_at?: string | null
          paid_at?: string | null
          hosted_url?: string | null
          notes?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      appointments: {
        Row: {
          id: string
          customer_id: string
          appointment_type: string
          scheduled_at: string
          duration_minutes: number
          status: string
          notes: string | null
          address: string | null
          technician: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          customer_id: string
          appointment_type?: string
          scheduled_at: string
          duration_minutes?: number
          status?: string
          notes?: string | null
          address?: string | null
          technician?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          customer_id?: string
          appointment_type?: string
          scheduled_at?: string
          duration_minutes?: number
          status?: string
          notes?: string | null
          address?: string | null
          technician?: string | null
          updated_at?: string
        }
        Relationships: []
      }
    }
    Views: Record<string, never>
    Functions: {
      is_admin: {
        Args: {
          user_id?: string
        }
        Returns: boolean
      }
    }
    Enums: Record<string, never>
    CompositeTypes: Record<string, never>
  }
}

export interface TicketWithRelations {
  id: string
  customer_id: string
  customer_name: string | null
  customer_email: string | null
  customer_phone: string | null
  title: string
  description: string
  category: string
  status: TicketStatus
  urgency: string
  created_at: string
  updated_at: string
  ticket_messages?: Array<{
    id: string
    sender_id: string
    sender_role: UserRole
    message: string
    created_at: string
  }>
  ticket_photos?: Array<{
    id: string
    ticket_id: string
    uploaded_by: string
    customer_id: string
    file_name: string
    file_type: string | null
    file_size: number | null
    storage_path: string
    public_url: string
    created_at: string
  }>
}
