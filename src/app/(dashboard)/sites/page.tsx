"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Plus, Globe, Trash2, CheckCircle, XCircle, Loader2, AlertCircle, Crown } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

interface Site {
  id: string;
  domain: string;
  name: string | null;
  verified: boolean;
  created_at: string;
}

interface ApiError {
  error: string;
  limitReached?: boolean;
  currentCount?: number;
  limit?: number;
}

export default function SitesPage() {
  const [sites, setSites] = useState<Site[]>([]);
  const [newDomain, setNewDomain] = useState("");
  const [isAdding, setIsAdding] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [limitReached, setLimitReached] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  // Fetch sites on mount
  useEffect(() => {
    fetchSites();
  }, []);

  async function fetchSites() {
    try {
      setIsLoading(true);
      const response = await fetch("/api/sites");
      if (!response.ok) {
        throw new Error("Failed to fetch sites");
      }
      const data = await response.json();
      setSites(data.sites || []);
    } catch {
      setError("Failed to load sites. Please try again.");
    } finally {
      setIsLoading(false);
    }
  }

  async function handleAddSite(e: React.FormEvent) {
    e.preventDefault();
    if (!newDomain.trim()) return;

    setIsAdding(true);
    setError(null);
    setLimitReached(false);

    try {
      const response = await fetch("/api/sites", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ domain: newDomain }),
      });

      const data = await response.json();

      if (!response.ok) {
        const apiError = data as ApiError;
        setError(apiError.error);
        if (apiError.limitReached) {
          setLimitReached(true);
        }
        return;
      }

      setSites([data.site, ...sites]);
      setNewDomain("");
    } catch {
      setError("Failed to add site. Please try again.");
    } finally {
      setIsAdding(false);
    }
  }

  async function handleDeleteSite(siteId: string) {
    setDeletingId(siteId);
    setError(null);

    try {
      const response = await fetch(`/api/sites?id=${siteId}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || "Failed to delete site");
      }

      setSites(sites.filter((s) => s.id !== siteId));
      setLimitReached(false); // May have room for more sites now
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to delete site");
    } finally {
      setDeletingId(null);
    }
  }

  if (isLoading) {
    return (
      <div className="p-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">Sites</h1>
          <p className="text-muted-foreground">
            Manage your tracked sites and domains
          </p>
        </div>
        <Card>
          <CardContent className="py-12 text-center">
            <Loader2 className="h-8 w-8 animate-spin mx-auto text-muted-foreground" />
            <p className="mt-4 text-muted-foreground">Loading sites...</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="p-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Sites</h1>
        <p className="text-muted-foreground">
          Manage your tracked sites and domains
        </p>
      </div>

      {/* Error display */}
      {error && (
        <Card className="mb-6 border-destructive/50 bg-destructive/5">
          <CardContent className="py-4 flex items-center gap-3">
            <AlertCircle className="h-5 w-5 text-destructive flex-shrink-0" />
            <p className="text-destructive flex-1">{error}</p>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setError(null)}
              className="text-destructive hover:text-destructive"
            >
              Dismiss
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Upgrade prompt when limit reached */}
      {limitReached && (
        <Card className="mb-6 border-primary/50 bg-primary/5">
          <CardContent className="py-4 flex items-center gap-3">
            <Crown className="h-5 w-5 text-primary flex-shrink-0" />
            <div className="flex-1">
              <p className="font-medium">Site limit reached</p>
              <p className="text-sm text-muted-foreground">
                Upgrade your plan to track more sites and unlock additional features.
              </p>
            </div>
            <Link href="/pricing">
              <Button size="sm">
                Upgrade Plan
              </Button>
            </Link>
          </CardContent>
        </Card>
      )}

      {/* Add site form */}
      <Card className="mb-8">
        <CardHeader>
          <CardTitle>Add a Site</CardTitle>
          <CardDescription>
            Add a domain to track and get aggregated insights
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleAddSite} className="flex gap-3">
            <div className="flex-1">
              <Input
                placeholder="example.com"
                value={newDomain}
                onChange={(e) => setNewDomain(e.target.value)}
                disabled={isAdding}
              />
            </div>
            <Button type="submit" disabled={isAdding || !newDomain.trim()}>
              {isAdding ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Plus className="h-4 w-4" />
              )}
              <span className="ml-2">Add Site</span>
            </Button>
          </form>
        </CardContent>
      </Card>

      {/* Sites list */}
      {sites.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center">
            <Globe className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="font-semibold mb-2">No sites yet</h3>
            <p className="text-muted-foreground">
              Add a domain above to start tracking
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {sites.map((site) => (
            <Card key={site.id}>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="h-10 w-10 rounded-lg bg-muted flex items-center justify-center">
                      <Globe className="h-5 w-5 text-muted-foreground" />
                    </div>
                    <div>
                      <h3 className="font-semibold">{site.domain}</h3>
                      <div className="flex items-center gap-2 mt-1">
                        {site.verified ? (
                          <Badge variant="default" className="gap-1 bg-green-600">
                            <CheckCircle className="h-3 w-3" />
                            Verified
                          </Badge>
                        ) : (
                          <Badge variant="secondary" className="gap-1">
                            <XCircle className="h-3 w-3" />
                            Unverified
                          </Badge>
                        )}
                        <span className="text-xs text-muted-foreground">
                          Added {new Date(site.created_at).toLocaleDateString()}
                        </span>
                      </div>
                    </div>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="text-destructive hover:text-destructive hover:bg-destructive/10"
                    onClick={() => handleDeleteSite(site.id)}
                    disabled={deletingId === site.id}
                  >
                    {deletingId === site.id ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <Trash2 className="h-4 w-4" />
                    )}
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
