"use client";

import { useState } from "react";
import { Plus, Globe, Trash2, CheckCircle, XCircle, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

export default function SitesPage() {
  const [sites, setSites] = useState<{ id: string; domain: string; name: string; verified: boolean }[]>([]);
  const [newDomain, setNewDomain] = useState("");
  const [isAdding, setIsAdding] = useState(false);

  const handleAddSite = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newDomain) return;

    setIsAdding(true);
    // API call would go here
    setTimeout(() => {
      setSites([...sites, { id: Date.now().toString(), domain: newDomain, name: newDomain, verified: false }]);
      setNewDomain("");
      setIsAdding(false);
    }, 1000);
  };

  return (
    <div className="p-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Sites</h1>
        <p className="text-muted-foreground">
          Manage your tracked sites and domains
        </p>
      </div>

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
            <Button type="submit" disabled={isAdding || !newDomain}>
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
                          <Badge variant="success" className="gap-1">
                            <CheckCircle className="h-3 w-3" />
                            Verified
                          </Badge>
                        ) : (
                          <Badge variant="secondary" className="gap-1">
                            <XCircle className="h-3 w-3" />
                            Unverified
                          </Badge>
                        )}
                      </div>
                    </div>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="text-destructive hover:text-destructive"
                    onClick={() => setSites(sites.filter((s) => s.id !== site.id))}
                  >
                    <Trash2 className="h-4 w-4" />
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
