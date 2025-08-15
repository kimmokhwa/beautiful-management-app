export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  public: {
    Tables: {
      materials: {
        Row: {
          cost: number
          created_at: string | null
          id: number
          name: string
          updated_at: string | null
        }
        Insert: {
          cost: number
          created_at?: string | null
          id?: number
          name: string
          updated_at?: string | null
        }
        Update: {
          cost?: number
          created_at?: string | null
          id?: number
          name?: string
          updated_at?: string | null
        }
        Relationships: []
      }
      procedure_materials: {
        Row: {
          created_at: string | null
          id: number
          material_name: string
          procedure_id: number | null
        }
        Insert: {
          created_at?: string | null
          id?: number
          material_name: string
          procedure_id?: number | null
        }
        Update: {
          created_at?: string | null
          id?: number
          material_name?: string
          procedure_id?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "procedure_materials_procedure_id_fkey"
            columns: ["procedure_id"]
            isOneToOne: false
            referencedRelation: "procedures"
            referencedColumns: ["id"]
          }
        ]
      }
      procedures: {
        Row: {
          category: string
          cost: number | null
          created_at: string | null
          customer_price: number
          id: number
          margin: number | null
          margin_rate: number | null
          materials: string[] | null
          name: string
          updated_at: string | null
        }
        Insert: {
          category: string
          cost?: number | null
          created_at?: string | null
          customer_price: number
          id?: number
          margin?: number | null
          margin_rate?: number | null
          materials?: string[] | null
          name: string
          updated_at?: string | null
        }
        Update: {
          category?: string
          cost?: number | null
          created_at?: string | null
          customer_price?: number
          id?: number
          margin?: number | null
          margin_rate?: number | null
          materials?: string[] | null
          name?: string
          updated_at?: string | null
        }
        Relationships: []
      }
      system_info: {
        Row: {
          id: number
          last_updated: string | null
          total_materials: number | null
          total_procedures: number | null
        }
        Insert: {
          id?: number
          last_updated?: string | null
          total_materials?: number | null
          total_procedures?: number | null
        }
        Update: {
          id?: number
          last_updated?: string | null
          total_materials?: number | null
          total_procedures?: number | null
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
} 