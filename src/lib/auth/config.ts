import NextAuth from "next-auth";
import GitHub from "next-auth/providers/github";
import Google from "next-auth/providers/google";
import Resend from "next-auth/providers/resend";
import { SupabaseAdapter } from "@auth/supabase-adapter";
import { createServiceClient, isSupabaseServiceConfigured } from "@/lib/supabase/server";
import type { Provider } from "next-auth/providers";

// Supabase configuration
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "";
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || "";

// Check if Supabase adapter can be configured
// IMPORTANT: Both values must be present AND not empty strings
const canUseAdapter = Boolean(supabaseUrl && supabaseServiceKey);

// Log configuration status for debugging
if (process.env.NODE_ENV !== "production") {
  console.log("[Auth] Configuration status:", {
    supabaseUrlConfigured: Boolean(supabaseUrl),
    supabaseServiceKeyConfigured: Boolean(supabaseServiceKey),
    adapterEnabled: canUseAdapter,
  });
}

// Build providers array dynamically based on available env vars
const providers: Provider[] = [];

// Only add GitHub if credentials are configured
if (process.env.AUTH_GITHUB_ID && process.env.AUTH_GITHUB_SECRET) {
  providers.push(
    GitHub({
      clientId: process.env.AUTH_GITHUB_ID,
      clientSecret: process.env.AUTH_GITHUB_SECRET,
    })
  );
}

// Only add Google if credentials are configured
if (process.env.AUTH_GOOGLE_ID && process.env.AUTH_GOOGLE_SECRET) {
  providers.push(
    Google({
      clientId: process.env.AUTH_GOOGLE_ID,
      clientSecret: process.env.AUTH_GOOGLE_SECRET,
    })
  );
}

// Only add Resend if API key is configured AND we have an adapter (email requires adapter)
if (process.env.AUTH_RESEND_KEY && canUseAdapter) {
  providers.push(
    Resend({
      from: process.env.AUTH_RESEND_FROM || "GeoKit <noreply@geokit.dev>",
    })
  );
}

/**
 * Configure adapter for email/magic link support and account linking.
 * Requires NextAuth tables in Supabase (see migrations/003_nextauth_adapter.sql)
 * 
 * If the adapter is not configured (missing env vars), authentication will still
 * work with OAuth providers using JWT strategy, but:
 * - Email/magic link auth will not work
 * - Account linking across providers won't be persisted
 */
const adapter = canUseAdapter
  ? SupabaseAdapter({
      url: supabaseUrl,
      secret: supabaseServiceKey,
    })
  : undefined;

export const { handlers, signIn, signOut, auth } = NextAuth({
  adapter,
  providers,
  pages: {
    signIn: "/signin",
    error: "/signin",
  },
  callbacks: {
    async signIn({ user, account }) {
      if (!user.email) return false;

      // Skip Supabase operations if service role is not configured
      if (!isSupabaseServiceConfigured()) {
        return true;
      }

      try {
        const supabase = createServiceClient();

        // Check if user exists
        const { data: existingUser } = await supabase
          .from("users")
          .select("id")
          .eq("email", user.email)
          .single();

        if (!existingUser) {
          // Create new user
          await supabase.from("users").insert({
            email: user.email,
            name: user.name || null,
            avatar_url: user.image || null,
          } as never);
        } else if (account?.provider !== "resend") {
          // Update user info from OAuth
          await supabase
            .from("users")
            .update({
              name: user.name || undefined,
              avatar_url: user.image || undefined,
            } as never)
            .eq("email", user.email);
        }
      } catch (error) {
        console.error("Error syncing user to Supabase:", error);
        // Still allow sign in even if Supabase sync fails
      }

      return true;
    },
    async session({ session }) {
      if (session.user?.email && isSupabaseServiceConfigured()) {
        try {
          const supabase = createServiceClient();
          const { data: dbUser } = await supabase
            .from("users")
            .select("id, tier, scans_this_month")
            .eq("email", session.user.email)
            .single() as unknown as { data: { id: string; tier: string; scans_this_month: number } | null };

          if (dbUser) {
            session.user.id = dbUser.id;
            session.user.tier = dbUser.tier as "free" | "pro" | "team" | "enterprise";
            session.user.scansThisMonth = dbUser.scans_this_month;
          }
        } catch (error) {
          console.error("Error fetching user data from Supabase:", error);
        }
      }
      return session;
    },
    async jwt({ token, user }) {
      if (user?.email) {
        token.email = user.email;
      }
      return token;
    },
  },
  session: {
    strategy: "jwt",
  },
});
