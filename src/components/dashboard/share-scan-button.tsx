"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Share2, Loader2, Check, Copy, ExternalLink } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";

interface ShareScanButtonProps {
  scanId: string;
}

export function ShareScanButton({ scanId }: ShareScanButtonProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [shareUrl, setShareUrl] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const router = useRouter();

  async function handleShare() {
    if (shareUrl) return; // Already have a share URL

    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch("/api/reports", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ scanId }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to create share link");
      }

      const fullUrl = `${window.location.origin}${data.url}`;
      setShareUrl(fullUrl);
      router.refresh(); // Refresh the page to update the share_id in the list
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to create share link");
    } finally {
      setIsLoading(false);
    }
  }

  async function handleCopy() {
    if (!shareUrl) return;

    try {
      await navigator.clipboard.writeText(shareUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Fallback for browsers that don't support clipboard API
      const textArea = document.createElement("textarea");
      textArea.value = shareUrl;
      document.body.appendChild(textArea);
      textArea.select();
      document.execCommand("copy");
      document.body.removeChild(textArea);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  }

  function handleOpenReport() {
    if (shareUrl) {
      window.open(shareUrl, "_blank");
    }
  }

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          size="sm"
          className="gap-2"
          onClick={handleShare}
          disabled={isLoading}
        >
          {isLoading ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <Share2 className="h-4 w-4" />
          )}
          Share
        </Button>
      </PopoverTrigger>
      {shareUrl && (
        <PopoverContent className="w-80" align="end">
          <div className="space-y-3">
            <div>
              <h4 className="font-medium mb-1">Share this report</h4>
              <p className="text-sm text-muted-foreground">
                Anyone with this link can view the report
              </p>
            </div>

            <div className="flex items-center gap-2">
              <code className="flex-1 text-xs bg-muted px-3 py-2 rounded truncate">
                {shareUrl}
              </code>
              <Button
                variant="outline"
                size="sm"
                onClick={handleCopy}
                className="flex-shrink-0"
              >
                {copied ? (
                  <Check className="h-4 w-4 text-green-600" />
                ) : (
                  <Copy className="h-4 w-4" />
                )}
              </Button>
            </div>

            <div className="flex justify-end gap-2">
              <Button variant="outline" size="sm" onClick={handleOpenReport}>
                <ExternalLink className="h-4 w-4 mr-2" />
                Open Report
              </Button>
            </div>
          </div>
        </PopoverContent>
      )}
      {error && (
        <PopoverContent className="w-60" align="end">
          <p className="text-sm text-destructive">{error}</p>
        </PopoverContent>
      )}
    </Popover>
  );
}
