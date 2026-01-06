import { NextResponse } from "next/server";
import { nanoid } from "nanoid";
import { auth } from "@/lib/auth";
import { createServerSupabaseClient, createServiceClient } from "@/lib/supabase/server";

// Make a scan public and get a share link
export async function POST(req: Request) {
  const { scanId } = await req.json();

  if (!scanId) {
    return NextResponse.json({ error: "Scan ID required" }, { status: 400 });
  }

  const session = await auth();
  const supabase = session?.user?.id
    ? await createServerSupabaseClient()
    : createServiceClient();

  // Check if scan exists and belongs to user (if authenticated)
  const { data: scan } = await supabase
    .from("scans")
    .select("id, share_id, user_id")
    .eq("id", scanId)
    .single() as unknown as { data: { id: string; share_id: string | null; user_id: string | null } | null };

  if (!scan) {
    return NextResponse.json({ error: "Scan not found" }, { status: 404 });
  }

  // If scan already has a share_id, return it
  if (scan.share_id) {
    return NextResponse.json({
      shareId: scan.share_id,
      url: `/report/${scan.share_id}`,
    });
  }

  // Generate new share ID
  const shareId = nanoid(10);

  const serviceClient = createServiceClient();
  const { error } = await serviceClient
    .from("scans")
    .update({ is_public: true, share_id: shareId } as never)
    .eq("id", scanId);

  if (error) {
    return NextResponse.json({ error: "Failed to create share link" }, { status: 500 });
  }

  return NextResponse.json({
    shareId,
    url: `/report/${shareId}`,
  });
}

// Get a public report
export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const shareId = searchParams.get("id");

  if (!shareId) {
    return NextResponse.json({ error: "Share ID required" }, { status: 400 });
  }

  const supabase = createServiceClient();

  const { data: scan, error } = await supabase
    .from("scans")
    .select("*")
    .eq("share_id", shareId)
    .eq("is_public", true)
    .single();

  if (error || !scan) {
    return NextResponse.json({ error: "Report not found" }, { status: 404 });
  }

  return NextResponse.json(scan);
}
