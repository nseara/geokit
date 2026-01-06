import { NextRequest, NextResponse } from "next/server";
import { scanUrl, FetchError } from "@/lib/scanner";

export const runtime = "nodejs";
export const maxDuration = 30;

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

    const result = await scanUrl(url);

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
    const result = await scanUrl(url);
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
