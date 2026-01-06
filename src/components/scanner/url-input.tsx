"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { Search, ArrowRight, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface UrlInputProps {
  size?: "default" | "lg";
  className?: string;
}

export function UrlInput({ size = "default", className }: UrlInputProps) {
  const [url, setUrl] = React.useState("");
  const [isLoading, setIsLoading] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);
  const router = useRouter();

  const isLarge = size === "lg";

  const validateUrl = (input: string): string | null => {
    if (!input.trim()) {
      return "Please enter a URL";
    }

    // Add https:// if no protocol specified
    let normalizedUrl = input.trim();
    if (!/^https?:\/\//i.test(normalizedUrl)) {
      normalizedUrl = `https://${normalizedUrl}`;
    }

    try {
      const parsed = new URL(normalizedUrl);
      if (!parsed.hostname.includes(".")) {
        return "Please enter a valid domain";
      }
      return null;
    } catch {
      return "Please enter a valid URL";
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    const validationError = validateUrl(url);
    if (validationError) {
      setError(validationError);
      return;
    }

    // Normalize URL
    let normalizedUrl = url.trim();
    if (!/^https?:\/\//i.test(normalizedUrl)) {
      normalizedUrl = `https://${normalizedUrl}`;
    }

    setIsLoading(true);

    // Encode URL for routing
    const encodedUrl = encodeURIComponent(normalizedUrl);
    router.push(`/scan/${encodedUrl}`);
  };

  return (
    <form onSubmit={handleSubmit} className={cn("w-full", className)}>
      <div
        className={cn(
          "relative flex items-center w-full rounded-xl border bg-background shadow-sm transition-shadow focus-within:shadow-md focus-within:ring-2 focus-within:ring-ring focus-within:ring-offset-2",
          isLarge ? "h-16" : "h-12",
          error && "border-destructive focus-within:ring-destructive"
        )}
      >
        <Search
          className={cn(
            "absolute left-4 text-muted-foreground",
            isLarge ? "h-5 w-5" : "h-4 w-4"
          )}
        />
        <input
          type="text"
          value={url}
          onChange={(e) => {
            setUrl(e.target.value);
            setError(null);
          }}
          placeholder="Enter any URL to scan..."
          className={cn(
            "flex-1 bg-transparent border-0 outline-none placeholder:text-muted-foreground",
            isLarge ? "pl-12 pr-4 text-lg h-16" : "pl-10 pr-4 text-base h-12"
          )}
          disabled={isLoading}
        />
        <div className={cn("pr-2", isLarge ? "pr-3" : "pr-2")}>
          <Button
            type="submit"
            size={isLarge ? "lg" : "default"}
            disabled={isLoading}
            className={cn(
              "rounded-lg font-semibold",
              isLarge && "px-6"
            )}
          >
            {isLoading ? (
              <>
                <Loader2 className="animate-spin" />
                <span className="hidden sm:inline">Scanning...</span>
              </>
            ) : (
              <>
                <span>Scan</span>
                <ArrowRight className="h-4 w-4" />
              </>
            )}
          </Button>
        </div>
      </div>
      {error && (
        <p className="mt-2 text-sm text-destructive">{error}</p>
      )}
    </form>
  );
}
