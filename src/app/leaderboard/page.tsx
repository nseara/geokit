import Link from "next/link";
import { Suspense } from "react";
import { formatDistanceToNow } from "date-fns";
import { Sparkles, Trophy, Medal, Award, ExternalLink, TrendingUp } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { createServiceClient } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Leaderboard - GeoKit",
  description: "See the top-scoring sites for AI visibility. Compare your site against the best.",
};

export default function LeaderboardPage() {
  return (
    <div className="min-h-screen">
      {/* Header */}
      <header className="border-b">
        <div className="container mx-auto px-4 h-16 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2">
            <div className="h-8 w-8 rounded-lg bg-primary flex items-center justify-center">
              <Sparkles className="h-5 w-5 text-primary-foreground" />
            </div>
            <span className="font-bold text-xl">GeoKit</span>
          </Link>
          <div className="flex items-center gap-4">
            <Link href="/signin">
              <Button variant="ghost">Sign in</Button>
            </Link>
            <Link href="/">
              <Button>Scan Your Site</Button>
            </Link>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-16">
        <div className="text-center mb-12">
          <Badge variant="secondary" className="mb-4">
            <Trophy className="h-3 w-3 mr-1" />
            Leaderboard
          </Badge>
          <h1 className="text-4xl md:text-5xl font-bold mb-4">
            Top AI-Optimized Sites
          </h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            See which sites are leading in AI visibility. Get inspired and learn from the best.
          </p>
        </div>

        <Suspense fallback={<LeaderboardSkeleton />}>
          <LeaderboardList />
        </Suspense>

        {/* CTA */}
        <div className="mt-16 text-center">
          <Card className="max-w-2xl mx-auto bg-gradient-to-r from-primary/5 via-primary/10 to-primary/5">
            <CardContent className="py-8">
              <TrendingUp className="h-12 w-12 text-primary mx-auto mb-4" />
              <h2 className="text-2xl font-bold mb-2">Want to join the leaderboard?</h2>
              <p className="text-muted-foreground mb-6">
                Scan your site and opt-in to the public leaderboard to showcase your AI visibility score.
              </p>
              <Link href="/">
                <Button size="lg">Scan Your Site Now</Button>
              </Link>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
}

interface LeaderboardEntry {
  id: string;
  domain: string;
  url: string;
  title: string;
  overall_score: number;
  industry: string | null;
  created_at: string;
}

async function LeaderboardList() {
  const supabase = createServiceClient();

  const { data: entries } = await supabase
    .from("leaderboard_entries")
    .select("*")
    .order("overall_score", { ascending: false })
    .limit(50) as unknown as { data: LeaderboardEntry[] | null };

  if (!entries?.length) {
    return (
      <Card>
        <CardContent className="py-12 text-center">
          <Trophy className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
          <h3 className="font-semibold mb-2">No entries yet</h3>
          <p className="text-muted-foreground">
            Be the first to join the leaderboard!
          </p>
        </CardContent>
      </Card>
    );
  }

  const getRankIcon = (index: number) => {
    if (index === 0) return <Trophy className="h-6 w-6 text-yellow-500" />;
    if (index === 1) return <Medal className="h-6 w-6 text-gray-400" />;
    if (index === 2) return <Award className="h-6 w-6 text-amber-600" />;
    return <span className="text-lg font-bold text-muted-foreground">#{index + 1}</span>;
  };

  return (
    <div className="space-y-4 max-w-4xl mx-auto">
      {entries.map((entry, index) => (
        <Card key={entry.id} className={`${index < 3 ? "border-primary/30" : ""}`}>
          <CardContent className="p-6">
            <div className="flex items-center gap-6">
              <div className="flex-shrink-0 w-12 flex justify-center">
                {getRankIcon(index)}
              </div>
              <div className="flex-shrink-0">
                <ScoreCircle score={entry.overall_score} />
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="font-semibold truncate">{entry.title}</h3>
                <p className="text-sm text-muted-foreground truncate">{entry.domain}</p>
                {entry.industry && (
                  <Badge variant="outline" className="mt-1 text-xs">
                    {entry.industry}
                  </Badge>
                )}
              </div>
              <div className="flex-shrink-0 text-sm text-muted-foreground hidden md:block">
                {formatDistanceToNow(new Date(entry.created_at), { addSuffix: true })}
              </div>
              <a
                href={entry.url}
                target="_blank"
                rel="noopener noreferrer"
              >
                <Button variant="ghost" size="sm">
                  <ExternalLink className="h-4 w-4" />
                </Button>
              </a>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}

function ScoreCircle({ score }: { score: number }) {
  const getColor = () => {
    if (score >= 80) return "border-green-500 text-green-600 bg-green-50 dark:bg-green-900/20";
    if (score >= 60) return "border-green-400 text-green-500 bg-green-50 dark:bg-green-900/20";
    if (score >= 40) return "border-yellow-500 text-yellow-600 bg-yellow-50 dark:bg-yellow-900/20";
    return "border-red-500 text-red-600 bg-red-50 dark:bg-red-900/20";
  };

  return (
    <div className={`h-14 w-14 rounded-full border-4 ${getColor()} flex items-center justify-center`}>
      <span className="text-lg font-bold">{score}</span>
    </div>
  );
}

function LeaderboardSkeleton() {
  return (
    <div className="space-y-4 max-w-4xl mx-auto">
      {[...Array(5)].map((_, i) => (
        <Card key={i}>
          <CardContent className="p-6">
            <div className="flex items-center gap-6">
              <div className="w-12 h-6 bg-muted animate-pulse rounded" />
              <div className="h-14 w-14 bg-muted animate-pulse rounded-full" />
              <div className="flex-1">
                <div className="h-4 w-48 bg-muted animate-pulse rounded mb-2" />
                <div className="h-3 w-32 bg-muted animate-pulse rounded" />
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
