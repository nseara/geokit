import Link from "next/link";
import { formatDistanceToNow, format } from "date-fns";
import { auth } from "@/lib/auth";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import { ExternalLink, Share2, Filter } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

export default async function HistoryPage() {
  const session = await auth();
  const supabase = await createServerSupabaseClient();
  const userId = session?.user?.id || "";

  const { data: scans } = await supabase
    .from("scans")
    .select("*")
    .eq("user_id", userId)
    .order("created_at", { ascending: false })
    .limit(50) as unknown as { data: Array<{
      id: string;
      url: string;
      title: string;
      overall_score: number;
      readability_score: number;
      structure_score: number;
      entities_score: number;
      sources_score: number;
      word_count: number;
      has_schema: boolean;
      share_id: string | null;
      created_at: string;
    }> | null };

  return (
    <div className="p-8">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold mb-2">Scan History</h1>
          <p className="text-muted-foreground">
            View all your past AI visibility scans
          </p>
        </div>
      </div>

      {!scans?.length ? (
        <Card>
          <CardContent className="py-12 text-center">
            <p className="text-muted-foreground mb-4">
              No scans yet. Start by scanning a URL!
            </p>
            <Link href="/dashboard">
              <Button>Go to Dashboard</Button>
            </Link>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {scans.map((scan) => (
            <Card key={scan.id} className="hover:bg-muted/30 transition-colors">
              <CardContent className="p-6">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex items-start gap-4 min-w-0">
                    <ScoreCircle score={scan.overall_score} />
                    <div className="min-w-0">
                      <h3 className="font-semibold truncate">{scan.title}</h3>
                      <a
                        href={scan.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-sm text-muted-foreground hover:text-primary truncate block max-w-lg"
                      >
                        {scan.url}
                      </a>
                      <div className="flex items-center gap-4 mt-2 text-sm text-muted-foreground">
                        <span>{format(new Date(scan.created_at), "MMM d, yyyy 'at' h:mm a")}</span>
                        <span>{scan.word_count} words</span>
                        {scan.has_schema && <Badge variant="outline">Schema</Badge>}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <ScoreBreakdown
                      readability={scan.readability_score}
                      structure={scan.structure_score}
                      entities={scan.entities_score}
                      sources={scan.sources_score}
                    />
                    <div className="flex flex-col gap-1">
                      {scan.share_id ? (
                        <Link href={`/report/${scan.share_id}`}>
                          <Button variant="outline" size="sm" className="gap-2">
                            <Share2 className="h-4 w-4" />
                            View Report
                          </Button>
                        </Link>
                      ) : (
                        <ShareScanButton scanId={scan.id} />
                      )}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}

function ScoreCircle({ score }: { score: number }) {
  const getColor = () => {
    if (score >= 80) return "border-green-500 text-green-600";
    if (score >= 60) return "border-green-400 text-green-500";
    if (score >= 40) return "border-yellow-500 text-yellow-600";
    return "border-red-500 text-red-600";
  };

  return (
    <div className={`h-16 w-16 rounded-full border-4 ${getColor()} flex items-center justify-center flex-shrink-0`}>
      <span className="text-xl font-bold">{score}</span>
    </div>
  );
}

function ScoreBreakdown({
  readability,
  structure,
  entities,
  sources,
}: {
  readability: number;
  structure: number;
  entities: number;
  sources: number;
}) {
  const scores = [
    { label: "Read", value: readability },
    { label: "Struct", value: structure },
    { label: "Entity", value: entities },
    { label: "Source", value: sources },
  ];

  return (
    <div className="hidden md:flex gap-2">
      {scores.map((s) => (
        <div key={s.label} className="text-center">
          <div className="text-xs text-muted-foreground">{s.label}</div>
          <div className="font-medium">{s.value}</div>
        </div>
      ))}
    </div>
  );
}

function ShareScanButton({ scanId }: { scanId: string }) {
  return (
    <form
      action={async () => {
        "use server";
        // This would call the reports API to create a share link
        // For now, we'll just redirect
      }}
    >
      <Button variant="outline" size="sm" className="gap-2">
        <Share2 className="h-4 w-4" />
        Share
      </Button>
    </form>
  );
}
