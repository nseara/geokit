"use client";

import Link from "next/link";
import { Crown, AlertTriangle, Zap } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";

interface UpgradePromptProps {
  type: "scans" | "sites" | "history" | "generic";
  currentCount?: number;
  limit?: number;
  className?: string;
  variant?: "warning" | "info" | "urgent";
}

const messages = {
  scans: {
    title: "Scan limit approaching",
    description: "Upgrade to Pro for unlimited scans and track your AI visibility without limits.",
    urgentTitle: "Scan limit reached",
    urgentDescription: "You've used all your scans this month. Upgrade now to continue scanning.",
  },
  sites: {
    title: "Site limit reached",
    description: "Upgrade your plan to track more sites and get aggregated insights across your domains.",
    urgentTitle: "Site limit reached",
    urgentDescription: "Upgrade to add more sites and unlock advanced tracking features.",
  },
  history: {
    title: "Unlock scan history",
    description: "Free plan shows current scans only. Upgrade to Pro to see your historical trends.",
    urgentTitle: "Historical data locked",
    urgentDescription: "Upgrade to see how your AI visibility score has improved over time.",
  },
  generic: {
    title: "Upgrade to Pro",
    description: "Unlock unlimited scans, more sites, historical data, and AI-powered suggestions.",
    urgentTitle: "Unlock Pro features",
    urgentDescription: "Get the most out of GeoKit with a Pro subscription.",
  },
};

export function UpgradePrompt({
  type,
  currentCount,
  limit,
  className,
  variant = "info",
}: UpgradePromptProps) {
  const isUrgent = variant === "urgent";
  const isWarning = variant === "warning";
  const config = messages[type];

  const title = isUrgent ? config.urgentTitle : config.title;
  const description = isUrgent ? config.urgentDescription : config.description;

  const Icon = isUrgent ? AlertTriangle : isWarning ? Zap : Crown;

  return (
    <Card
      className={cn(
        "border",
        isUrgent && "border-orange-500/50 bg-orange-50 dark:bg-orange-950/20",
        isWarning && "border-yellow-500/50 bg-yellow-50 dark:bg-yellow-950/20",
        !isUrgent && !isWarning && "border-primary/50 bg-primary/5",
        className
      )}
    >
      <CardContent className="py-4 flex items-center gap-4">
        <Icon
          className={cn(
            "h-5 w-5 flex-shrink-0",
            isUrgent && "text-orange-600",
            isWarning && "text-yellow-600",
            !isUrgent && !isWarning && "text-primary"
          )}
        />
        <div className="flex-1 min-w-0">
          <p className="font-medium">{title}</p>
          <p className="text-sm text-muted-foreground">{description}</p>
          {currentCount !== undefined && limit !== undefined && (
            <p className="text-sm font-medium mt-1">
              {currentCount}/{limit} used
            </p>
          )}
        </div>
        <Link href="/pricing">
          <Button
            size="sm"
            variant={isUrgent ? "default" : "outline"}
            className={cn(
              isUrgent && "bg-orange-600 hover:bg-orange-700",
              !isUrgent && !isWarning && "border-primary/50 text-primary hover:bg-primary/10"
            )}
          >
            <Crown className="h-4 w-4 mr-2" />
            Upgrade
          </Button>
        </Link>
      </CardContent>
    </Card>
  );
}

/**
 * Shows a banner when user is close to or at their scan limit
 */
interface ScanLimitBannerProps {
  scansUsed: number;
  scansLimit: number;
  className?: string;
}

export function ScanLimitBanner({ scansUsed, scansLimit, className }: ScanLimitBannerProps) {
  // Don't show if unlimited
  if (scansLimit === -1) return null;

  const percentUsed = (scansUsed / scansLimit) * 100;

  // Only show if at 80% or more
  if (percentUsed < 80) return null;

  const variant = percentUsed >= 100 ? "urgent" : "warning";

  return (
    <UpgradePrompt
      type="scans"
      currentCount={scansUsed}
      limit={scansLimit}
      variant={variant}
      className={className}
    />
  );
}
