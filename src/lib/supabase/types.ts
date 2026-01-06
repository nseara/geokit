export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export type Database = {
  public: {
    Tables: {
      users: {
        Row: {
          id: string;
          email: string;
          name: string | null;
          avatar_url: string | null;
          tier: "free" | "pro" | "team" | "enterprise";
          stripe_customer_id: string | null;
          stripe_subscription_id: string | null;
          scans_this_month: number;
          scans_reset_at: string;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          email: string;
          name?: string | null;
          avatar_url?: string | null;
          tier?: "free" | "pro" | "team" | "enterprise";
          stripe_customer_id?: string | null;
          stripe_subscription_id?: string | null;
          scans_this_month?: number;
          scans_reset_at?: string;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          email?: string;
          name?: string | null;
          avatar_url?: string | null;
          tier?: "free" | "pro" | "team" | "enterprise";
          stripe_customer_id?: string | null;
          stripe_subscription_id?: string | null;
          scans_this_month?: number;
          scans_reset_at?: string;
          created_at?: string;
          updated_at?: string;
        };
      };
      scans: {
        Row: {
          id: string;
          user_id: string | null;
          url: string;
          title: string;
          description: string | null;
          overall_score: number;
          readability_score: number;
          structure_score: number;
          entities_score: number;
          sources_score: number;
          word_count: number;
          has_schema: boolean;
          author: string | null;
          insights: Json;
          full_result: Json;
          is_public: boolean;
          share_id: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          user_id?: string | null;
          url: string;
          title: string;
          description?: string | null;
          overall_score: number;
          readability_score: number;
          structure_score: number;
          entities_score: number;
          sources_score: number;
          word_count: number;
          has_schema?: boolean;
          author?: string | null;
          insights?: Json;
          full_result?: Json;
          is_public?: boolean;
          share_id?: string | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string | null;
          url?: string;
          title?: string;
          description?: string | null;
          overall_score?: number;
          readability_score?: number;
          structure_score?: number;
          entities_score?: number;
          sources_score?: number;
          word_count?: number;
          has_schema?: boolean;
          author?: string | null;
          insights?: Json;
          full_result?: Json;
          is_public?: boolean;
          share_id?: string | null;
          created_at?: string;
        };
      };
      sites: {
        Row: {
          id: string;
          user_id: string;
          domain: string;
          name: string | null;
          verified: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          domain: string;
          name?: string | null;
          verified?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          domain?: string;
          name?: string | null;
          verified?: boolean;
          created_at?: string;
          updated_at?: string;
        };
      };
      leaderboard_entries: {
        Row: {
          id: string;
          scan_id: string;
          domain: string;
          url: string;
          title: string;
          overall_score: number;
          industry: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          scan_id: string;
          domain: string;
          url: string;
          title: string;
          overall_score: number;
          industry?: string | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          scan_id?: string;
          domain?: string;
          url?: string;
          title?: string;
          overall_score?: number;
          industry?: string | null;
          created_at?: string;
        };
      };
    };
    Views: {
      [_ in never]: never;
    };
    Functions: {
      increment_user_scans: {
        Args: { user_id: string };
        Returns: number;
      };
    };
    Enums: {
      tier: "free" | "pro" | "team" | "enterprise";
    };
  };
};

export type User = Database["public"]["Tables"]["users"]["Row"];
export type Scan = Database["public"]["Tables"]["scans"]["Row"];
export type Site = Database["public"]["Tables"]["sites"]["Row"];
export type LeaderboardEntry = Database["public"]["Tables"]["leaderboard_entries"]["Row"];

export type Tier = "free" | "pro" | "team" | "enterprise";

export const TIER_LIMITS: Record<Tier, { scansPerMonth: number; sites: number; historyMonths: number }> = {
  free: { scansPerMonth: 50, sites: 1, historyMonths: 0 },
  pro: { scansPerMonth: -1, sites: 5, historyMonths: 6 },
  team: { scansPerMonth: -1, sites: 20, historyMonths: 12 },
  enterprise: { scansPerMonth: -1, sites: -1, historyMonths: -1 },
};
