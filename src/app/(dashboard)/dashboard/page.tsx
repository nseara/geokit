import { Suspense } from "react";
import Link from "next/link";
import { auth } from "@/lib/auth";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import { TIER_LIMITS } from "@/lib/supabase/types";
import {
  ArrowRight,
  TrendingUp,
  FileText,
  Globe,
  Zap,
  Bot,
  BarChart3,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { UrlInput } from "@/components/scanner/url-input";
import { RecentScans } from "@/components/dashboard/recent-scans";
import { AnalyticsPreview } from "@/components/dashboard/analytics-preview";

export default async function DashboardPage() {
  const session = await auth();
  const supabase = await createServerSupabaseClient();
  const userId = session?.user?.id || "";

  const { data: user } = await supabase
    .from("users")
    .select("scans_this_month, tier")
    .eq("id", userId)
    .single() as { data: { scans_this_month: number; tier: string } | null };

  const { count: totalScans } = await supabase
    .from("scans")
    .select("*", { count: "exact", head: true })
    .eq("user_id", userId);

  const { count: totalSites } = await supabase
    .from("sites")
    .select("*", { count: "exact", head: true })
    .eq("user_id", userId);

  const tier = (user?.tier || "free") as keyof typeof TIER_LIMITS;
  const limits = TIER_LIMITS[tier];
  const scansUsed = user?.scans_this_month || 0;
  const scansRemaining = limits.scansPerMonth === -1 ? "Unlimited" : limits.scansPerMonth - scansUsed;

  return (
    <div className="p-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Dashboard</h1>
        <p className="text-muted-foreground">
          Welcome back, {session?.user?.name || "there"}! Scan URLs and track your AI visibility.
        </p>
      </div>

      {/* Quick scan */}
      <Card className="mb-8 bg-gradient-to-r from-primary/5 via-primary/10 to-primary/5">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Zap className="h-5 w-5 text-primary" />
            Quick Scan
          </CardTitle>
          <CardDescription>
            Enter any URL to analyze its AI visibility score
          </CardDescription>
        </CardHeader>
        <CardContent>
          <UrlInput />
        </CardContent>
      </Card>

      {/* Stats grid */}
      <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Scans This Month</CardDescription>
            <CardTitle className="text-3xl">
              {scansUsed}
              {limits.scansPerMonth !== -1 && (
                <span className="text-lg text-muted-foreground font-normal">
                  /{limits.scansPerMonth}
                </span>
              )}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">
              {typeof scansRemaining === "number" ? `${scansRemaining} remaining` : scansRemaining}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Total Scans</CardDescription>
            <CardTitle className="text-3xl">{totalScans || 0}</CardTitle>
          </CardHeader>
          <CardContent>
            <Link href="/history" className="text-sm text-primary hover:underline flex items-center gap-1">
              View history <ArrowRight className="h-3 w-3" />
            </Link>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Sites Tracked</CardDescription>
            <CardTitle className="text-3xl">
              {totalSites || 0}
              {limits.sites !== -1 && (
                <span className="text-lg text-muted-foreground font-normal">
                  /{limits.sites}
                </span>
              )}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Link href="/sites" className="text-sm text-primary hover:underline flex items-center gap-1">
              Manage sites <ArrowRight className="h-3 w-3" />
            </Link>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Your Plan</CardDescription>
            <CardTitle className="text-3xl capitalize">{tier}</CardTitle>
          </CardHeader>
          <CardContent>
            {tier === "free" ? (
              <Link href="/pricing" className="text-sm text-primary hover:underline flex items-center gap-1">
                Upgrade <ArrowRight className="h-3 w-3" />
              </Link>
            ) : (
              <Badge variant="success">Active</Badge>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Analytics preview and Recent scans */}
      <div className="grid lg:grid-cols-2 gap-6">
        {/* Analytics Preview */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <BarChart3 className="h-5 w-5" />
                AI Traffic
              </CardTitle>
              <CardDescription>Traffic from LLM providers (last 7 days)</CardDescription>
            </div>
            <Link href="/analytics">
              <Button variant="outline" size="sm">
                View analytics
              </Button>
            </Link>
          </CardHeader>
          <CardContent>
            <Suspense fallback={<div className="h-48 flex items-center justify-center text-muted-foreground">Loading...</div>}>
              <AnalyticsPreview />
            </Suspense>
          </CardContent>
        </Card>

        {/* Recent scans */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle>Recent Scans</CardTitle>
              <CardDescription>Your latest AI visibility scans</CardDescription>
            </div>
            <Link href="/history">
              <Button variant="outline" size="sm">
                View all
              </Button>
            </Link>
          </CardHeader>
          <CardContent>
            <Suspense fallback={<div className="h-48 flex items-center justify-center text-muted-foreground">Loading...</div>}>
              <RecentScans userId={session?.user?.id} />
            </Suspense>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
