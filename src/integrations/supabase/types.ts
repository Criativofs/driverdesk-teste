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
    PostgrestVersion: "14.5"
  }
  public: {
    Tables: {
      clients: {
        Row: {
          created_at: string
          favorite_driver_id: string | null
          favorites: string[]
          id: string
          last_ride_at: string | null
          name: string
          notes: string | null
          phone: string
          rating: number
          rides_total: number
          updated_at: string
        }
        Insert: {
          created_at?: string
          favorite_driver_id?: string | null
          favorites?: string[]
          id?: string
          last_ride_at?: string | null
          name: string
          notes?: string | null
          phone: string
          rating?: number
          rides_total?: number
          updated_at?: string
        }
        Update: {
          created_at?: string
          favorite_driver_id?: string | null
          favorites?: string[]
          id?: string
          last_ride_at?: string | null
          name?: string
          notes?: string | null
          phone?: string
          rating?: number
          rides_total?: number
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "clients_favorite_driver_id_fkey"
            columns: ["favorite_driver_id"]
            isOneToOne: false
            referencedRelation: "drivers"
            referencedColumns: ["id"]
          },
        ]
      }
      drivers: {
        Row: {
          active: boolean
          code: string
          created_at: string
          id: string
          last_activity_at: string | null
          last_lat: number | null
          last_lng: number | null
          name: string
          op_status: Database["public"]["Enums"]["op_status"]
          phone: string
          route: string | null
          status: Database["public"]["Enums"]["driver_status"]
          updated_at: string
        }
        Insert: {
          active?: boolean
          code: string
          created_at?: string
          id?: string
          last_activity_at?: string | null
          last_lat?: number | null
          last_lng?: number | null
          name: string
          op_status?: Database["public"]["Enums"]["op_status"]
          phone: string
          route?: string | null
          status?: Database["public"]["Enums"]["driver_status"]
          updated_at?: string
        }
        Update: {
          active?: boolean
          code?: string
          created_at?: string
          id?: string
          last_activity_at?: string | null
          last_lat?: number | null
          last_lng?: number | null
          name?: string
          op_status?: Database["public"]["Enums"]["op_status"]
          phone?: string
          route?: string | null
          status?: Database["public"]["Enums"]["driver_status"]
          updated_at?: string
        }
        Relationships: []
      }
      messages: {
        Row: {
          body: string | null
          created_at: string
          direction: Database["public"]["Enums"]["message_direction"]
          driver_id: string | null
          id: string
          kind: Database["public"]["Enums"]["message_kind"]
          media_url: string | null
          operator_id: string | null
          ride_id: string | null
          status: Database["public"]["Enums"]["message_status"] | null
          wa_message_id: string | null
        }
        Insert: {
          body?: string | null
          created_at?: string
          direction: Database["public"]["Enums"]["message_direction"]
          driver_id?: string | null
          id?: string
          kind?: Database["public"]["Enums"]["message_kind"]
          media_url?: string | null
          operator_id?: string | null
          ride_id?: string | null
          status?: Database["public"]["Enums"]["message_status"] | null
          wa_message_id?: string | null
        }
        Update: {
          body?: string | null
          created_at?: string
          direction?: Database["public"]["Enums"]["message_direction"]
          driver_id?: string | null
          id?: string
          kind?: Database["public"]["Enums"]["message_kind"]
          media_url?: string | null
          operator_id?: string | null
          ride_id?: string | null
          status?: Database["public"]["Enums"]["message_status"] | null
          wa_message_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "messages_driver_id_fkey"
            columns: ["driver_id"]
            isOneToOne: false
            referencedRelation: "drivers"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "messages_ride_id_fkey"
            columns: ["ride_id"]
            isOneToOne: false
            referencedRelation: "rides"
            referencedColumns: ["id"]
          },
        ]
      }
      notifications: {
        Row: {
          created_at: string
          driver_id: string | null
          id: string
          kind: Database["public"]["Enums"]["notification_kind"]
          ride_id: string | null
          target_user_id: string | null
          title: string
          unread: boolean
        }
        Insert: {
          created_at?: string
          driver_id?: string | null
          id?: string
          kind: Database["public"]["Enums"]["notification_kind"]
          ride_id?: string | null
          target_user_id?: string | null
          title: string
          unread?: boolean
        }
        Update: {
          created_at?: string
          driver_id?: string | null
          id?: string
          kind?: Database["public"]["Enums"]["notification_kind"]
          ride_id?: string | null
          target_user_id?: string | null
          title?: string
          unread?: boolean
        }
        Relationships: [
          {
            foreignKeyName: "notifications_driver_id_fkey"
            columns: ["driver_id"]
            isOneToOne: false
            referencedRelation: "drivers"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "notifications_ride_id_fkey"
            columns: ["ride_id"]
            isOneToOne: false
            referencedRelation: "rides"
            referencedColumns: ["id"]
          },
        ]
      }
      operators: {
        Row: {
          active: boolean
          avatar_url: string | null
          created_at: string
          email: string | null
          id: string
          name: string
          phone: string | null
          updated_at: string
        }
        Insert: {
          active?: boolean
          avatar_url?: string | null
          created_at?: string
          email?: string | null
          id: string
          name: string
          phone?: string | null
          updated_at?: string
        }
        Update: {
          active?: boolean
          avatar_url?: string | null
          created_at?: string
          email?: string | null
          id?: string
          name?: string
          phone?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      ratings: {
        Row: {
          client_id: string
          comment: string | null
          created_at: string
          driver_id: string | null
          id: string
          ride_id: string
          stars: number
        }
        Insert: {
          client_id: string
          comment?: string | null
          created_at?: string
          driver_id?: string | null
          id?: string
          ride_id: string
          stars: number
        }
        Update: {
          client_id?: string
          comment?: string | null
          created_at?: string
          driver_id?: string | null
          id?: string
          ride_id?: string
          stars?: number
        }
        Relationships: [
          {
            foreignKeyName: "ratings_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "clients"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "ratings_driver_id_fkey"
            columns: ["driver_id"]
            isOneToOne: false
            referencedRelation: "drivers"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "ratings_ride_id_fkey"
            columns: ["ride_id"]
            isOneToOne: true
            referencedRelation: "rides"
            referencedColumns: ["id"]
          },
        ]
      }
      ride_events: {
        Row: {
          actor_id: string | null
          created_at: string
          event_type: string
          from_status: Database["public"]["Enums"]["ride_status"] | null
          id: string
          payload: Json | null
          ride_id: string
          to_status: Database["public"]["Enums"]["ride_status"] | null
        }
        Insert: {
          actor_id?: string | null
          created_at?: string
          event_type: string
          from_status?: Database["public"]["Enums"]["ride_status"] | null
          id?: string
          payload?: Json | null
          ride_id: string
          to_status?: Database["public"]["Enums"]["ride_status"] | null
        }
        Update: {
          actor_id?: string | null
          created_at?: string
          event_type?: string
          from_status?: Database["public"]["Enums"]["ride_status"] | null
          id?: string
          payload?: Json | null
          ride_id?: string
          to_status?: Database["public"]["Enums"]["ride_status"] | null
        }
        Relationships: [
          {
            foreignKeyName: "ride_events_ride_id_fkey"
            columns: ["ride_id"]
            isOneToOne: false
            referencedRelation: "rides"
            referencedColumns: ["id"]
          },
        ]
      }
      rides: {
        Row: {
          client_id: string
          created_at: string
          created_by: string | null
          destination: string
          driver_id: string | null
          finished_at: string | null
          id: string
          notes: string | null
          origin: string
          price: number
          scheduled_for: string | null
          status: Database["public"]["Enums"]["ride_status"]
          updated_at: string
        }
        Insert: {
          client_id: string
          created_at?: string
          created_by?: string | null
          destination: string
          driver_id?: string | null
          finished_at?: string | null
          id?: string
          notes?: string | null
          origin: string
          price?: number
          scheduled_for?: string | null
          status?: Database["public"]["Enums"]["ride_status"]
          updated_at?: string
        }
        Update: {
          client_id?: string
          created_at?: string
          created_by?: string | null
          destination?: string
          driver_id?: string | null
          finished_at?: string | null
          id?: string
          notes?: string | null
          origin?: string
          price?: number
          scheduled_for?: string | null
          status?: Database["public"]["Enums"]["ride_status"]
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "rides_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "clients"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "rides_driver_id_fkey"
            columns: ["driver_id"]
            isOneToOne: false
            referencedRelation: "drivers"
            referencedColumns: ["id"]
          },
        ]
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
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
      is_staff: { Args: { _user_id: string }; Returns: boolean }
    }
    Enums: {
      app_role: "admin" | "operator" | "viewer"
      driver_status: "online" | "idle" | "offline"
      message_direction: "in" | "out"
      message_kind: "text" | "audio" | "image" | "template" | "location"
      message_status: "queued" | "sent" | "delivered" | "read" | "failed"
      notification_kind: "photo" | "silence" | "offline" | "nf" | "info"
      op_status:
        | "disponivel"
        | "indo_buscar"
        | "cliente_embarcado"
        | "finalizando"
        | "pausa"
        | "offline"
      ride_status:
        | "procurando"
        | "aceita"
        | "indo_buscar"
        | "cliente_embarcado"
        | "em_andamento"
        | "finalizando"
        | "concluida"
        | "cancelada"
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
      app_role: ["admin", "operator", "viewer"],
      driver_status: ["online", "idle", "offline"],
      message_direction: ["in", "out"],
      message_kind: ["text", "audio", "image", "template", "location"],
      message_status: ["queued", "sent", "delivered", "read", "failed"],
      notification_kind: ["photo", "silence", "offline", "nf", "info"],
      op_status: [
        "disponivel",
        "indo_buscar",
        "cliente_embarcado",
        "finalizando",
        "pausa",
        "offline",
      ],
      ride_status: [
        "procurando",
        "aceita",
        "indo_buscar",
        "cliente_embarcado",
        "em_andamento",
        "finalizando",
        "concluida",
        "cancelada",
      ],
    },
  },
} as const
