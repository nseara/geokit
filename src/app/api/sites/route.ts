import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { createServiceClient } from "@/lib/supabase/server";
import { TIER_LIMITS, type Tier } from "@/lib/supabase/types";

/**
 * Normalize a domain string - removes protocol, www, trailing slashes, and paths
 */
function normalizeDomain(input: string): string {
  let domain = input.toLowerCase().trim();

  // Remove protocol
  domain = domain.replace(/^https?:\/\//, "");

  // Remove www.
  domain = domain.replace(/^www\./, "");

  // Remove path and query string
  domain = domain.split("/")[0];
  domain = domain.split("?")[0];

  // Remove port
  domain = domain.split(":")[0];

  return domain;
}

/**
 * Validate if string is a valid domain
 */
function isValidDomain(domain: string): boolean {
  // Basic domain validation regex
  const domainRegex = /^[a-z0-9]+([\-\.]{1}[a-z0-9]+)*\.[a-z]{2,}$/;
  return domainRegex.test(domain);
}

// GET - List user's sites
export async function GET() {
  const session = await auth();

  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const supabase = createServiceClient();

  const { data: sites, error } = await supabase
    .from("sites")
    .select("*")
    .eq("user_id", session.user.id)
    .order("created_at", { ascending: false });

  if (error) {
    console.error("Failed to fetch sites:", error);
    return NextResponse.json(
      { error: "Failed to fetch sites" },
      { status: 500 }
    );
  }

  return NextResponse.json({ sites });
}

// POST - Add a new site
export async function POST(request: NextRequest) {
  const session = await auth();

  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await request.json();
  const { domain: rawDomain } = body;

  if (!rawDomain || typeof rawDomain !== "string") {
    return NextResponse.json(
      { error: "Domain is required" },
      { status: 400 }
    );
  }

  // Normalize and validate domain
  const domain = normalizeDomain(rawDomain);

  if (!isValidDomain(domain)) {
    return NextResponse.json(
      { error: "Invalid domain format. Please enter a valid domain like 'example.com'" },
      { status: 400 }
    );
  }

  const supabase = createServiceClient();

  // Get user's tier and current site count
  const [userResult, sitesCountResult] = await Promise.all([
    supabase
      .from("users")
      .select("tier")
      .eq("id", session.user.id)
      .single() as unknown as Promise<{ data: { tier: Tier } | null; error: Error | null }>,
    supabase
      .from("sites")
      .select("*", { count: "exact", head: true })
      .eq("user_id", session.user.id),
  ]);

  const tier = (userResult.data?.tier || "free") as Tier;
  const currentSiteCount = sitesCountResult.count || 0;
  const limits = TIER_LIMITS[tier];

  // Check site limit
  if (limits.sites !== -1 && currentSiteCount >= limits.sites) {
    return NextResponse.json(
      {
        error: `You've reached your limit of ${limits.sites} site${limits.sites === 1 ? "" : "s"}. Upgrade to add more sites.`,
        limitReached: true,
        currentCount: currentSiteCount,
        limit: limits.sites,
      },
      { status: 429 }
    );
  }

  // Check if domain already exists for this user
  const { data: existingSite } = await supabase
    .from("sites")
    .select("id")
    .eq("user_id", session.user.id)
    .eq("domain", domain)
    .single();

  if (existingSite) {
    return NextResponse.json(
      { error: "You have already added this domain" },
      { status: 409 }
    );
  }

  // Insert the new site
  const { data: newSite, error } = await supabase
    .from("sites")
    .insert({
      user_id: session.user.id,
      domain,
      name: domain,
      verified: false,
    } as never)
    .select()
    .single();

  if (error) {
    console.error("Failed to add site:", error);
    return NextResponse.json(
      { error: "Failed to add site" },
      { status: 500 }
    );
  }

  return NextResponse.json({ site: newSite }, { status: 201 });
}

// DELETE - Remove a site
export async function DELETE(request: NextRequest) {
  const session = await auth();

  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const siteId = searchParams.get("id");

  if (!siteId) {
    return NextResponse.json(
      { error: "Site ID is required" },
      { status: 400 }
    );
  }

  const supabase = createServiceClient();

  // Verify the site belongs to the user before deleting
  const { data: site } = await supabase
    .from("sites")
    .select("id")
    .eq("id", siteId)
    .eq("user_id", session.user.id)
    .single();

  if (!site) {
    return NextResponse.json(
      { error: "Site not found" },
      { status: 404 }
    );
  }

  const { error } = await supabase
    .from("sites")
    .delete()
    .eq("id", siteId)
    .eq("user_id", session.user.id);

  if (error) {
    console.error("Failed to delete site:", error);
    return NextResponse.json(
      { error: "Failed to delete site" },
      { status: 500 }
    );
  }

  return NextResponse.json({ success: true });
}
