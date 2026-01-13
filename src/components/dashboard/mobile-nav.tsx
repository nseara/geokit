"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { signOut } from "next-auth/react";
import {
  Sparkles,
  LayoutDashboard,
  History,
  Globe,
  Menu,
  X,
  Crown,
  BarChart3,
  LogOut,
  Search,
  Loader2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

interface User {
  name?: string | null;
  email?: string | null;
  image?: string | null;
  tier?: string;
}

interface MobileNavProps {
  user: User;
}

const navItems = [
  { href: "/dashboard", icon: LayoutDashboard, label: "Dashboard" },
  { href: "/analytics", icon: BarChart3, label: "Analytics" },
  { href: "/history", icon: History, label: "Scan History" },
  { href: "/sites", icon: Globe, label: "Sites" },
];

export function MobileNav({ user }: MobileNavProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [searchUrl, setSearchUrl] = useState("");
  const [isSearching, setIsSearching] = useState(false);
  const pathname = usePathname();
  const router = useRouter();

  const closeMenu = () => setIsOpen(false);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchUrl.trim()) return;

    let normalizedUrl = searchUrl.trim();
    if (!/^https?:\/\//i.test(normalizedUrl)) {
      normalizedUrl = `https://${normalizedUrl}`;
    }

    try {
      const parsed = new URL(normalizedUrl);
      if (!parsed.hostname.includes(".")) return;

      setIsSearching(true);
      const encodedUrl = encodeURIComponent(normalizedUrl);
      router.push(`/scan/${encodedUrl}`);
    } catch {
      // Invalid URL, do nothing
    }
  };

  return (
    <div className="md:hidden">
      {/* Mobile Header */}
      <div className="flex items-center gap-3 p-3 border-b bg-background">
        {/* Logo - compact */}
        <Link href="/" className="flex-shrink-0" onClick={closeMenu}>
          <div className="h-9 w-9 rounded-lg bg-primary flex items-center justify-center">
            <Sparkles className="h-5 w-5 text-primary-foreground" />
          </div>
        </Link>

        {/* Search Box - centered, takes available space */}
        <form onSubmit={handleSearch} className="flex-1 min-w-0">
          <div className="relative flex items-center">
            <Search className="absolute left-3 h-4 w-4 text-muted-foreground pointer-events-none" />
            <input
              type="text"
              value={searchUrl}
              onChange={(e) => setSearchUrl(e.target.value)}
              placeholder="Scan any URL..."
              disabled={isSearching}
              className="w-full h-9 pl-9 pr-3 text-sm bg-muted/50 border border-border rounded-lg outline-none placeholder:text-muted-foreground focus:ring-2 focus:ring-ring focus:border-transparent transition-shadow"
            />
            {isSearching && (
              <Loader2 className="absolute right-3 h-4 w-4 text-muted-foreground animate-spin" />
            )}
          </div>
        </form>

        {/* Menu Button */}
        <Button
          variant="ghost"
          size="icon"
          className="flex-shrink-0 h-9 w-9"
          onClick={() => setIsOpen(!isOpen)}
          aria-label={isOpen ? "Close menu" : "Open menu"}
        >
          {isOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </Button>
      </div>

      {/* Mobile Menu Overlay */}
      {isOpen && (
        <div className="fixed inset-0 top-[61px] z-50 bg-background">
          <nav className="flex flex-col p-4 space-y-1">
            {navItems.map((item) => {
              const isActive = pathname === item.href;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={closeMenu}
                  className={`flex items-center gap-3 px-3 py-3 rounded-lg transition-colors ${
                    isActive
                      ? "bg-primary/10 text-primary"
                      : "text-muted-foreground hover:text-foreground hover:bg-muted"
                  }`}
                >
                  <item.icon className="h-5 w-5" />
                  <span className="text-base">{item.label}</span>
                </Link>
              );
            })}
          </nav>

          {/* User section */}
          <div className="absolute bottom-0 left-0 right-0 p-4 border-t bg-background space-y-3">
            {user.tier === "free" && (
              <Link href="/pricing" onClick={closeMenu}>
                <Button
                  variant="outline"
                  className="w-full justify-start gap-2 border-primary/50 text-primary hover:bg-primary/10"
                >
                  <Crown className="h-4 w-4" />
                  Upgrade to Pro
                </Button>
              </Link>
            )}

            <div className="flex items-center gap-3 px-3 py-2">
              {user.image ? (
                <img
                  src={user.image}
                  alt={user.name || "Avatar"}
                  className="h-8 w-8 rounded-full"
                />
              ) : (
                <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center">
                  <span className="text-sm font-medium">
                    {user.name?.[0] || user.email?.[0]}
                  </span>
                </div>
              )}
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium truncate">
                  {user.name || "User"}
                </p>
                <Badge variant="secondary" className="text-xs capitalize">
                  {user.tier}
                </Badge>
              </div>
            </div>

            <Button
              variant="ghost"
              className="w-full justify-start gap-2 text-muted-foreground"
              onClick={() => {
                closeMenu();
                signOut({ callbackUrl: "/" });
              }}
            >
              <LogOut className="h-4 w-4" />
              Sign out
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
