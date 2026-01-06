import NextAuth from "next-auth";
import GitHub from "next-auth/providers/github";
import Google from "next-auth/providers/google";
import Resend from "next-auth/providers/resend";
import { createServiceClient } from "@/lib/supabase/server";

export const { handlers, signIn, signOut, auth } = NextAuth({
  providers: [
    GitHub({
      clientId: process.env.AUTH_GITHUB_ID,
      clientSecret: process.env.AUTH_GITHUB_SECRET,
    }),
    Google({
      clientId: process.env.AUTH_GOOGLE_ID,
      clientSecret: process.env.AUTH_GOOGLE_SECRET,
    }),
    Resend({
      from: "GeoKit <noreply@geokit.dev>",
    }),
  ],
  pages: {
    signIn: "/signin",
    error: "/signin",
  },
  callbacks: {
    async signIn({ user, account }) {
      if (!user.email) return false;

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
        });
      } else if (account?.provider !== "resend") {
        // Update user info from OAuth
        await supabase
          .from("users")
          .update({
            name: user.name || undefined,
            avatar_url: user.image || undefined,
          })
          .eq("email", user.email);
      }

      return true;
    },
    async session({ session }) {
      if (session.user?.email) {
        const supabase = createServiceClient();
        const { data: dbUser } = await supabase
          .from("users")
          .select("id, tier, scans_this_month")
          .eq("email", session.user.email)
          .single();

        if (dbUser) {
          session.user.id = dbUser.id;
          session.user.tier = dbUser.tier;
          session.user.scansThisMonth = dbUser.scans_this_month;
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
