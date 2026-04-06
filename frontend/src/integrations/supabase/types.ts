export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "13.0.5"
  }
  public: {
    Tables: {
      matches: {
        Row: {
          completed_at: string | null
          created_at: string
          donor_id: string
          id: string
          notes: string | null
          requester_id: string
          resource_id: string
          scheduled_at: string | null
          status: Database["public"]["Enums"]["resource_status"]
          updated_at: string
        }
        Insert: {
          completed_at?: string | null
          created_at?: string
          donor_id: string
          id?: string
          notes?: string | null
          requester_id: string
          resource_id: string
          scheduled_at?: string | null
          status?: Database["public"]["Enums"]["resource_status"]
          updated_at?: string
        }
        Update: {
          completed_at?: string | null
          created_at?: string
          donor_id?: string
          id?: string
          notes?: string | null
          requester_id?: string
          resource_id?: string
          scheduled_at?: string | null
          status?: Database["public"]["Enums"]["resource_status"]
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "matches_resource_id_fkey"
            columns: ["resource_id"]
            isOneToOne: false
            referencedRelation: "resources"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          blood_type: Database["public"]["Enums"]["blood_type"] | null
          created_at: string
          full_name: string
          id: string
          kyc_verified: boolean | null
          location: Json
          organization_name: string | null
          phone: string | null
          updated_at: string
        }
        Insert: {
          blood_type?: Database["public"]["Enums"]["blood_type"] | null
          created_at?: string
          full_name: string
          id: string
          kyc_verified?: boolean | null
          location: Json
          organization_name?: string | null
          phone?: string | null
          updated_at?: string
        }
        Update: {
          blood_type?: Database["public"]["Enums"]["blood_type"] | null
          created_at?: string
          full_name?: string
          id?: string
          kyc_verified?: boolean | null
          location?: Json
          organization_name?: string | null
          phone?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      resources: {
        Row: {
          blood_type: Database["public"]["Enums"]["blood_type"] | null
          created_at: string
          description: string | null
          expires_at: string | null
          id: string
          location: Json
          quantity: string
          resource_type: Database["public"]["Enums"]["resource_type"]
          status: Database["public"]["Enums"]["resource_status"]
          updated_at: string
          user_id: string
        }
        Insert: {
          blood_type?: Database["public"]["Enums"]["blood_type"] | null
          created_at?: string
          description?: string | null
          expires_at?: string | null
          id?: string
          location: Json
          quantity: string
          resource_type: Database["public"]["Enums"]["resource_type"]
          status?: Database["public"]["Enums"]["resource_status"]
          updated_at?: string
          user_id: string
        }
        Update: {
          blood_type?: Database["public"]["Enums"]["blood_type"] | null
          created_at?: string
          description?: string | null
          expires_at?: string | null
          id?: string
          location?: Json
          quantity?: string
          resource_type?: Database["public"]["Enums"]["resource_type"]
          status?: Database["public"]["Enums"]["resource_status"]
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      user_roles: {
        Row: {
          created_at: string
          id: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id?: string
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
      app_role: "donor" | "requester" | "ngo" | "hospital" | "admin"
      blood_type: "A+" | "A-" | "B+" | "B-" | "AB+" | "AB-" | "O+" | "O-"
      resource_status: "available" | "pending" | "completed" | "cancelled"
      resource_type: "blood" | "food"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {
      app_role: ["donor", "requester", "ngo", "hospital", "admin"],
      blood_type: ["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-"],
      resource_status: ["available", "pending", "completed", "cancelled"],
      resource_type: ["blood", "food"],
    },
  },
} as const
