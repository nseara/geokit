import Link from "next/link";
import { formatDistanceToNow } from "date-fns";
import { ExternalLink, Share2 } from "lucide-react";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

interface RecentScansProps {
  userId?: string;
  limit?: number;
}

export async function RecentScans({ userId, limit = 5 }: RecentScansProps) {
  if (!userId) {
    return (
      <div className="text-center py-8 text-muted-foreground">
        Sign in to see your scan history
      </div>
    );
  }

  const supabase = await createServerSupabaseClient();

  const { data: scans } = await supabase
    .from("scans")
    .select("id, url, title, overall_score, share_id, created_at")
    .eq("user_id", userId)
    .order("created_at", { ascending: false })
    .limit(limit) as unknown as { data: Array<{
      id: string;
      url: string;
      title: string;
      overall_score: number;
      share_id: string | null;
      created_at: string;
    }> | null };

  if (!scans?.length) {
    return (
      <div className="text-center py-8 text-muted-foreground">
        No scans yet. Try scanning a URL above!
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {scans.map((scan) => (
        <div
          key={scan.id}
          className="flex items-center justify-between p-4 rounded-lg border bg-card hover:bg-muted/50 transition-colors"
        >
          <div className="flex items-center gap-4 min-w-0">
            <div className="flex-shrink-0">
              <ScoreIndicator score={scan.overall_score} />
            </div>
            <div className="min-w-0">
              <p className="font-medium truncate">{scan.title}</p>
              <p className="text-sm text-muted-foreground truncate max-w-md">
                {scan.url}
              </p>
              <p className="text-xs text-muted-foreground mt-1">
                {formatDistanceToNow(new Date(scan.created_at), { addSuffix: true })}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            {scan.share_id ? (
              <Link href={`/report/${scan.share_id}`}>
                <Button variant="ghost" size="sm">
                  <Share2 className="h-4 w-4" />
                </Button>
              </Link>
            ) : null}
            <a
              href={scan.url}
              target="_blank"
              rel="noopener noreferrer"
            >
              <Button variant="ghost" size="sm">
                <ExternalLink className="h-4 w-4" />
              </Button>
            </a>
          </div>
        </div>
      ))}
    </div>
  );
}

function ScoreIndicator({ score }: { score: number }) {
  const getColor = () => {
    if (score >= 80) return "bg-green-500";
    if (score >= 60) return "bg-green-400";
    if (score >= 40) return "bg-yellow-500";
    return "bg-red-500";
  };

  return (
    <div className={`h-12 w-12 rounded-full ${getColor()} flex items-center justify-center`}>
      <span className="text-white font-bold">{score}</span>
    </div>
  );
}
