import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { scanUrl, FetchError } from "@/lib/scanner";
import { createServiceClient } from "@/lib/supabase/server";
import { TIER_LIMITS } from "@/lib/supabase/types";

export const runtime = "nodejs";
export const maxDuration = 30;

async function performScan(url: string, userId?: string) {
  const result = await scanUrl(url);
  const supabase = createServiceClient();

  // Save scan to database
  const scanData = {
    user_id: userId || null,
    url: result.url,
    title: result.title,
    description: result.description || null,
    overall_score: result.overallScore,
    readability_score: result.scores.readability.percentage,
    structure_score: result.scores.structure.percentage,
    entities_score: result.scores.entities.percentage,
    sources_score: result.scores.sources.percentage,
    word_count: result.content.wordCount,
    has_schema: result.metadata.hasSchema,
    author: result.metadata.author || null,
    insights: result.insights,
    full_result: result,
    is_public: false,
  };

  const { data: savedScan, error } = await supabase
    .from("scans")
    .insert(scanData as never)
    .select("id")
    .single() as unknown as { data: { id: string } | null; error: Error | null };

  if (error) {
    console.error("Failed to save scan:", error);
  }

  // Increment user scan count if authenticated
  if (userId) {
    await supabase.rpc("increment_user_scans" as never, { p_user_id: userId } as never);
  }

  return {
    ...result,
    scanId: savedScan?.id,
  };
}

async function checkScanLimits(userId: string) {
  const supabase = createServiceClient();

  const { data: user } = await supabase
    .from("users")
    .select("tier, scans_this_month, scans_reset_at")
    .eq("id", userId)
    .single() as unknown as { data: { tier: string; scans_this_month: number; scans_reset_at: string } | null };

  if (!user) return { allowed: true };

  const tier = user.tier as keyof typeof TIER_LIMITS;
  const limits = TIER_LIMITS[tier];

  // Unlimited scans
  if (limits.scansPerMonth === -1) return { allowed: true };

  // Check if we need to reset the count (new month)
  const resetDate = new Date(user.scans_reset_at);
  const now = new Date();
  if (resetDate.getMonth() !== now.getMonth() || resetDate.getFullYear() !== now.getFullYear()) {
    return { allowed: true };
  }

  // Check if under limit
  if (user.scans_this_month < limits.scansPerMonth) {
    return { allowed: true, remaining: limits.scansPerMonth - user.scans_this_month - 1 };
  }

  return {
    allowed: false,
    message: `You've reached your monthly limit of ${limits.scansPerMonth} scans. Upgrade to Pro for unlimited scans.`,
  };
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { url } = body;

    if (!url || typeof url !== "string") {
      return NextResponse.json(
        { error: "URL is required" },
        { status: 400 }
      );
    }

    // Check auth and limits
    const session = await auth();
    const userId = session?.user?.id;

    if (userId) {
      const limitCheck = await checkScanLimits(userId);
      if (!limitCheck.allowed) {
        return NextResponse.json(
          { error: limitCheck.message, limitReached: true },
          { status: 429 }
        );
      }
    }

    const result = await performScan(url, userId);

    return NextResponse.json(result);
  } catch (error) {
    console.error("Scan error:", error);

    if (error instanceof FetchError) {
      return NextResponse.json(
        {
          error: error.message,
          statusCode: error.statusCode,
          url: error.url,
        },
        { status: error.statusCode || 500 }
      );
    }

    if (error instanceof Error) {
      return NextResponse.json(
        { error: error.message },
        { status: 500 }
      );
    }

    return NextResponse.json(
      { error: "An unexpected error occurred" },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const url = searchParams.get("url");

  if (!url) {
    return NextResponse.json(
      { error: "URL parameter is required" },
      { status: 400 }
    );
  }

  try {
    // Check auth and limits
    const session = await auth();
    const userId = session?.user?.id;

    if (userId) {
      const limitCheck = await checkScanLimits(userId);
      if (!limitCheck.allowed) {
        return NextResponse.json(
          { error: limitCheck.message, limitReached: true },
          { status: 429 }
        );
      }
    }

    const result = await performScan(url, userId);
    return NextResponse.json(result);
  } catch (error) {
    console.error("Scan error:", error);

    if (error instanceof FetchError) {
      return NextResponse.json(
        {
          error: error.message,
          statusCode: error.statusCode,
          url: error.url,
        },
        { status: error.statusCode || 500 }
      );
    }

    if (error instanceof Error) {
      return NextResponse.json(
        { error: error.message },
        { status: 500 }
      );
    }

    return NextResponse.json(
      { error: "An unexpected error occurred" },
      { status: 500 }
    );
  }
}
