import { ImageResponse } from "next/og";
import { NextRequest } from "next/server";
import { createServiceClient } from "@/lib/supabase/server";

export const runtime = "edge";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const id = searchParams.get("id");

  let score = 75;
  let title = "AI Visibility Score";
  let url = "geokit.dev";

  if (id) {
    const supabase = createServiceClient();
    const { data: scan } = await supabase
      .from("scans")
      .select("title, url, overall_score")
      .eq("share_id", id)
      .eq("is_public", true)
      .single();

    if (scan) {
      score = scan.overall_score;
      title = scan.title;
      try {
        url = new URL(scan.url).hostname;
      } catch {
        url = scan.url;
      }
    }
  }

  const getScoreColor = (s: number) => {
    if (s >= 80) return "#22c55e";
    if (s >= 60) return "#84cc16";
    if (s >= 40) return "#eab308";
    return "#ef4444";
  };

  const getScoreLabel = (s: number) => {
    if (s >= 80) return "Excellent";
    if (s >= 60) return "Good";
    if (s >= 40) return "Needs Work";
    return "Poor";
  };

  return new ImageResponse(
    (
      <div
        style={{
          height: "100%",
          width: "100%",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          backgroundColor: "#0a0a0a",
          backgroundImage:
            "radial-gradient(circle at 25% 25%, #1a1a2e 0%, transparent 50%), radial-gradient(circle at 75% 75%, #16213e 0%, transparent 50%)",
        }}
      >
        {/* Logo */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "12px",
            position: "absolute",
            top: "40px",
            left: "40px",
          }}
        >
          <div
            style={{
              width: "48px",
              height: "48px",
              borderRadius: "12px",
              background: "linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <svg
              width="28"
              height="28"
              viewBox="0 0 24 24"
              fill="none"
              stroke="white"
              strokeWidth="2"
            >
              <path d="M11.017 2.814a1 1 0 0 1 1.966 0l1.051 5.558a2 2 0 0 0 1.594 1.594l5.558 1.051a1 1 0 0 1 0 1.966l-5.558 1.051a2 2 0 0 0-1.594 1.594l-1.051 5.558a1 1 0 0 1-1.966 0l-1.051-5.558a2 2 0 0 0-1.594-1.594l-5.558-1.051a1 1 0 0 1 0-1.966l5.558-1.051a2 2 0 0 0 1.594-1.594z" />
            </svg>
          </div>
          <span
            style={{
              fontSize: "28px",
              fontWeight: "bold",
              color: "white",
            }}
          >
            GeoKit
          </span>
        </div>

        {/* Main content */}
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            gap: "24px",
          }}
        >
          {/* Score circle */}
          <div
            style={{
              width: "200px",
              height: "200px",
              borderRadius: "100px",
              background: `conic-gradient(${getScoreColor(score)} ${score * 3.6}deg, #333 0deg)`,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              padding: "12px",
            }}
          >
            <div
              style={{
                width: "100%",
                height: "100%",
                borderRadius: "100px",
                backgroundColor: "#0a0a0a",
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <span
                style={{
                  fontSize: "64px",
                  fontWeight: "bold",
                  color: getScoreColor(score),
                }}
              >
                {score}
              </span>
              <span
                style={{
                  fontSize: "18px",
                  color: "#888",
                }}
              >
                {getScoreLabel(score)}
              </span>
            </div>
          </div>

          {/* Title */}
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              gap: "8px",
              maxWidth: "800px",
            }}
          >
            <span
              style={{
                fontSize: "16px",
                color: "#888",
                textTransform: "uppercase",
                letterSpacing: "2px",
              }}
            >
              AI Visibility Score
            </span>
            <span
              style={{
                fontSize: "36px",
                fontWeight: "600",
                color: "white",
                textAlign: "center",
                lineHeight: "1.2",
                overflow: "hidden",
                textOverflow: "ellipsis",
                maxWidth: "100%",
              }}
            >
              {title.length > 60 ? title.substring(0, 60) + "..." : title}
            </span>
            <span
              style={{
                fontSize: "20px",
                color: "#666",
              }}
            >
              {url}
            </span>
          </div>
        </div>

        {/* Footer */}
        <div
          style={{
            position: "absolute",
            bottom: "40px",
            display: "flex",
            alignItems: "center",
            gap: "8px",
          }}
        >
          <span style={{ color: "#666", fontSize: "18px" }}>
            Scan your site at
          </span>
          <span
            style={{
              color: "#8b5cf6",
              fontSize: "18px",
              fontWeight: "600",
            }}
          >
            geokit.dev
          </span>
        </div>
      </div>
    ),
    {
      width: 1200,
      height: 630,
    }
  );
}
