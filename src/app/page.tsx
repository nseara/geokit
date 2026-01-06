import { UrlInput } from "@/components/scanner/url-input";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import {
  Sparkles,
  Zap,
  Target,
  TrendingUp,
  Github,
  ArrowRight,
} from "lucide-react";
import Link from "next/link";

const features = [
  {
    icon: Sparkles,
    title: "AI Readability",
    description: "See how easily AI engines can parse and understand your content",
  },
  {
    icon: Target,
    title: "Citation Potential",
    description: "Measure your likelihood of being cited in AI-generated responses",
  },
  {
    icon: Zap,
    title: "Instant Results",
    description: "Get your AI visibility score in under 10 seconds",
  },
  {
    icon: TrendingUp,
    title: "Actionable Insights",
    description: "Clear recommendations to improve your AI search presence",
  },
];

const aiEngines = [
  "ChatGPT",
  "Perplexity",
  "Claude",
  "Google AI",
  "Bing Chat",
];

export default function Home() {
  return (
    <div className="flex flex-col min-h-screen">
      {/* Header */}
      <header className="border-b">
        <div className="container mx-auto px-4 h-16 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2">
            <div className="h-8 w-8 rounded-lg bg-primary flex items-center justify-center">
              <Sparkles className="h-5 w-5 text-primary-foreground" />
            </div>
            <span className="font-bold text-xl">GeoKit</span>
          </Link>
          <nav className="flex items-center gap-4">
            <Link
              href="https://github.com/geokit/geokit"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
            >
              <Github className="h-4 w-4" />
              <span className="hidden sm:inline">Star on GitHub</span>
            </Link>
          </nav>
        </div>
      </header>

      {/* Hero Section */}
      <main className="flex-1">
        <section className="container mx-auto px-4 py-16 md:py-24 lg:py-32">
          <div className="max-w-3xl mx-auto text-center space-y-8">
            {/* Badge */}
            <div className="flex justify-center">
              <Badge variant="secondary" className="px-4 py-1.5 text-sm">
                Open Source AI SEO Toolkit
              </Badge>
            </div>

            {/* Headline */}
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight">
              How do AI engines{" "}
              <span className="text-primary">see your content?</span>
            </h1>

            {/* Subheadline */}
            <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto">
              Get your AI visibility score in seconds. See what ChatGPT, Perplexity,
              and other AI search engines think of your content.
            </p>

            {/* URL Input */}
            <div className="max-w-2xl mx-auto pt-4">
              <UrlInput size="lg" />
              <p className="mt-3 text-sm text-muted-foreground">
                No signup required. Scan any public URL instantly.
              </p>
            </div>

            {/* AI Engines */}
            <div className="flex flex-wrap justify-center gap-2 pt-4">
              <span className="text-sm text-muted-foreground">Optimized for:</span>
              {aiEngines.map((engine) => (
                <Badge key={engine} variant="outline" className="font-normal">
                  {engine}
                </Badge>
              ))}
            </div>
          </div>
        </section>

        {/* Features Section */}
        <section className="container mx-auto px-4 py-16 border-t">
          <div className="text-center mb-12">
            <h2 className="text-2xl md:text-3xl font-bold mb-4">
              Understand your AI visibility
            </h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              GeoKit analyzes your content across multiple dimensions that matter
              for AI search engine optimization.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 max-w-5xl mx-auto">
            {features.map((feature) => (
              <Card key={feature.title} className="border-0 shadow-none bg-muted/50">
                <CardContent className="p-6">
                  <feature.icon className="h-10 w-10 text-primary mb-4" />
                  <h3 className="font-semibold mb-2">{feature.title}</h3>
                  <p className="text-sm text-muted-foreground">
                    {feature.description}
                  </p>
                </CardContent>
              </Card>
            ))}
          </div>
        </section>

        {/* CTA Section */}
        <section className="container mx-auto px-4 py-16 border-t">
          <div className="max-w-2xl mx-auto text-center space-y-6">
            <h2 className="text-2xl md:text-3xl font-bold">
              Ready to optimize for AI search?
            </h2>
            <p className="text-muted-foreground">
              Join thousands of sites already using GeoKit to improve their AI visibility.
              Open source and free to use.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                href="https://github.com/geokit/geokit"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center justify-center gap-2 h-12 px-6 rounded-lg bg-secondary text-secondary-foreground font-medium hover:bg-secondary/80 transition-colors"
              >
                <Github className="h-5 w-5" />
                View on GitHub
              </Link>
              <Link
                href="#"
                className="inline-flex items-center justify-center gap-2 h-12 px-6 rounded-lg bg-primary text-primary-foreground font-medium hover:bg-primary/90 transition-colors"
              >
                Get Started
                <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="border-t py-8">
        <div className="container mx-auto px-4">
          <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
            <div className="flex items-center gap-2">
              <div className="h-6 w-6 rounded bg-primary flex items-center justify-center">
                <Sparkles className="h-4 w-4 text-primary-foreground" />
              </div>
              <span className="font-semibold">GeoKit</span>
            </div>
            <p className="text-sm text-muted-foreground">
              Open source AI SEO toolkit. MIT License.
            </p>
            <div className="flex items-center gap-4">
              <Link
                href="https://github.com/geokit/geokit"
                target="_blank"
                rel="noopener noreferrer"
                className="text-muted-foreground hover:text-foreground transition-colors"
              >
                <Github className="h-5 w-5" />
              </Link>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
