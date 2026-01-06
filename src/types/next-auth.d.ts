import { DefaultSession } from "next-auth";
import type { Tier } from "@/lib/supabase/types";

declare module "next-auth" {
  interface Session {
    user: {
      id: string;
      tier: Tier;
      scansThisMonth: number;
    } & DefaultSession["user"];
  }
}
