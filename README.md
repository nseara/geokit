<div align="center">

# GeoKit

### The SEMrush for the AI Era

**Open-source AI visibility scanner that shows how ChatGPT, Perplexity, Claude, and other AI search engines see your content.**

[![MIT License](https://img.shields.io/badge/License-MIT-blue.svg)](LICENSE)
[![Next.js](https://img.shields.io/badge/Next.js-15-black)](https://nextjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5-blue)](https://www.typescriptlang.org/)
[![PRs Welcome](https://img.shields.io/badge/PRs-welcome-brightgreen.svg)](CONTRIBUTING.md)

[Demo](https://geokit.dev) · [Documentation](spec.md) · [Report Bug](https://github.com/nseara/geokit/issues) · [Request Feature](https://github.com/nseara/geokit/issues)

</div>

---

## Why GeoKit?

Traditional SEO tools optimize for Google's crawlers. But the search landscape is changing:

- **ChatGPT** now searches the web and cites sources
- **Perplexity** is becoming a primary research tool
- **Google AI Overviews** synthesize content instead of linking
- **Claude** and other AI assistants fetch and reference web content

**Your content needs to be optimized for AI, not just search engines.**

GeoKit analyzes your pages and tells you exactly how to improve your AI visibility with actionable, prioritized recommendations.

---

## Features

### Instant Analysis
Scan any URL in seconds. No signup required.

### Four-Dimensional Scoring

| Category | What It Measures |
|----------|-----------------|
| **Readability** | Content length, sentence structure, complexity, voice |
| **Structure** | Heading hierarchy, lists, schema markup, meta tags |
| **Entities** | Topic clarity, facts & statistics, named entities |
| **Sources** | Author info, citations, dates, trust signals |

### Actionable Insights
Every score comes with specific recommendations sorted by impact:
- **High Impact**: Schema markup, author attribution, heading structure
- **Medium Impact**: Lists, citations, meta descriptions
- **Low Impact**: Fine-tuning and optimization

### Beautiful Results
- Animated score reveal
- Category breakdowns with explanations
- "Why this score?" for every metric
- Mobile-responsive design

---

## Quick Start

```bash
# Clone the repository
git clone https://github.com/nseara/geokit.git
cd geokit

# Install dependencies
pnpm install

# Start development server
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000) and scan your first URL.

---

## API Usage

GeoKit exposes a simple API for programmatic access:

```bash
# POST request
curl -X POST http://localhost:3000/api/scan \
  -H "Content-Type: application/json" \
  -d '{"url": "https://example.com"}'

# GET request
curl "http://localhost:3000/api/scan?url=https://example.com"
```

### Response

```json
{
  "url": "https://example.com",
  "title": "Example Domain",
  "overallScore": 72,
  "scores": {
    "readability": { "percentage": 75, "label": "Good" },
    "structure": { "percentage": 68, "label": "Good" },
    "entities": { "percentage": 70, "label": "Good" },
    "sources": { "percentage": 65, "label": "Good" }
  },
  "insights": [
    {
      "type": "improvement",
      "title": "Add Schema Markup",
      "description": "Schema.org structured data is critical for AI visibility",
      "impact": "high",
      "action": "Implement JSON-LD structured data"
    }
  ]
}
```

---

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Framework | [Next.js 15](https://nextjs.org/) (App Router) |
| Language | [TypeScript](https://www.typescriptlang.org/) |
| Styling | [Tailwind CSS](https://tailwindcss.com/) + [shadcn/ui](https://ui.shadcn.com/) |
| Animations | [Framer Motion](https://www.framer.com/motion/) |
| Parsing | [Cheerio](https://cheerio.js.org/) + [Mozilla Readability](https://github.com/mozilla/readability) |

---

## Project Structure

```
src/
├── app/
│   ├── page.tsx              # Landing page
│   ├── api/scan/route.ts     # Scan API endpoint
│   └── scan/[url]/page.tsx   # Results page
├── components/
│   ├── ui/                   # shadcn components
│   └── scanner/              # Scanner-specific components
└── lib/
    ├── scanner/              # Core scanning engine
    │   ├── fetcher.ts        # URL fetching
    │   ├── extractor.ts      # Content extraction
    │   └── types.ts          # Type definitions
    └── analyzers/            # Scoring algorithms
        ├── readability.ts
        ├── structure.ts
        ├── entities.ts
        ├── sources.ts
        └── insights.ts       # Recommendation generator
```

---

## Roadmap

- [x] **Phase 1**: Core scanner with instant results
- [ ] **Phase 2**: Shareable report URLs with social cards
- [ ] **Phase 3**: User accounts and scan history
- [ ] **Phase 4**: Pro features (AI suggestions, trends)
- [ ] **Phase 5**: Public leaderboards and badges
- [ ] **Phase 6**: MCP server for AI agent integration

See [spec.md](spec.md) for the complete product specification.

---

## Contributing

We welcome contributions! GeoKit is designed to be extended:

### Adding a New Analyzer

1. Create `src/lib/analyzers/[name].ts`
2. Export a function: `(extraction: ExtractionResult) => ScoreDetail`
3. Add to `CategoryScores` type in `types.ts`
4. Import and call in `src/lib/scanner/index.ts`
5. Add insight rules in `insights.ts`

### Development Commands

```bash
pnpm dev      # Start dev server
pnpm build    # Production build
pnpm lint     # Run ESLint
```

---

## Why Open Source?

GeoKit follows an **open core** model:

| Free & Open Source | Paid Cloud |
|--------------------|-----------|
| Core scanning engine | Historical trends |
| All analyzers | Cross-site benchmarks |
| Self-hostable | AI-powered suggestions |
| Community plugins | Team collaboration |

The core insight: **A single scan is worth little, but patterns across time and sites are invaluable.**

Free users contribute data that makes paid features better. Paid features cost money to provide (storage, LLMs, monitoring).

---

## License

MIT License - free to use, modify, and distribute.

---

<div align="center">

**Built for the AI era.**

[Get Started](https://geokit.dev) · [Star on GitHub](https://github.com/nseara/geokit)

</div>
