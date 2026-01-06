# GeoKit Specification

## Overview

GeoKit is an open-source AI visibility scanner - the SEMrush for the AI era. It helps websites understand how AI search engines (ChatGPT, Perplexity, Claude, Google AI Overviews) view their content and provides actionable recommendations to improve AI visibility.

## Vision

**The SEMrush for the AI era** - a comprehensive, beautiful web platform helping sites get discovered and cited by AI search engines. Open-source, community-driven, designed for marketers and SEO professionals.

## Strategic Philosophy

### 1. Future-Proofing for AI-Leveled Playing Field

Today's non-technical users will become tomorrow's power users as AI closes the technical gap. Design for this:

- **Expose complexity progressively**: Simple scores on surface, but full data/APIs underneath for when users level up
- **Build for composability**: Every feature should have an API, every insight exportable, every workflow automatable
- **Assume AI assistants**: Users will increasingly interact via their own AI agents - provide structured data, not just pretty dashboards
- **No dumbing down**: Explain the "why" behind every score - educate users rather than hide complexity

### 2. Open Source + Monetization Strategy

**The Core Insight**: Data compounds. A single scan is worth little, but patterns across time and across sites are invaluable.

```
┌─────────────────────────────────────────────────────────────┐
│                    OPEN SOURCE (Free)                       │
│  - Core scanning engine                                     │
│  - All analyzers/algorithms                                 │
│  - Self-hostable instance                                   │
│  - Single-site, point-in-time analysis                      │
│  - Community plugins                                        │
└─────────────────────────────────────────────────────────────┘
                            │
                            ▼
┌─────────────────────────────────────────────────────────────┐
│                    PAID CLOUD (SaaS)                        │
│  - Historical data & trends ("Your score 3 months ago")     │
│  - Cross-site intelligence ("Sites like yours average...")  │
│  - AI-powered rewrites & suggestions (LLM costs)            │
│  - Real-time monitoring & alerts                            │
│  - Competitive tracking                                     │
│  - Team collaboration                                       │
│  - White-label reports (agencies)                           │
│  - Priority scanning queue                                  │
│  - API rate limits lifted                                   │
└─────────────────────────────────────────────────────────────┘
```

### 3. Pricing Tiers

| Tier | Price | For | Key Features |
|------|-------|-----|--------------|
| **Free** | $0 | Individuals exploring | 50 scans/mo, 1 site, current data only |
| **Pro** | $29/mo | Freelancers, small sites | Unlimited scans, 5 sites, 6mo history, AI suggestions |
| **Team** | $79/mo | Agencies, growing companies | 20 sites, team seats, white-label, competitive tracking |
| **Enterprise** | Custom | Large organizations | Unlimited, API, SSO, dedicated support |

**The "Clever Catch"**: Free users can see their current score, but the moment they want to answer "am I improving?" or "how do I compare?" - that requires historical/aggregate data that only exists in the paid cloud.

### 4. AI-Agent-Ready Architecture

Users will increasingly interact via AI assistants (Claude, ChatGPT, custom agents). Design for this:

- Every UI action maps to a documented API endpoint
- Return structured, machine-readable responses (not just HTML)
- Build an MCP (Model Context Protocol) server from day one
- Provide code snippets, not just descriptions ("Add this schema" with copyable code)
- Webhooks for automation (Zapier, n8n, custom pipelines)

---

## Tech Stack

| Layer | Choice | Rationale |
|-------|--------|-----------|
| Framework | Next.js 15 (App Router) | Fast, SEO-friendly, great DX |
| UI | shadcn/ui + Tailwind CSS | Beautiful, accessible, customizable |
| Components | Radix UI primitives | Comes with shadcn |
| Charts | Recharts or Tremor | Dashboard visualizations |
| Animations | Framer Motion | Delightful micro-interactions |
| State | Zustand | Simple, performant |
| Database | PostgreSQL + Drizzle ORM | Type-safe, scalable |
| Auth | NextAuth.js v5 | Easy OAuth, magic links |
| Queue | Inngest or Trigger.dev | Background jobs (scans) |
| Payments | Stripe | Subscriptions, usage billing |
| Hosting | Vercel | Optimal for Next.js |
| Analytics | PostHog | Open-source, self-hostable |
| MCP | @anthropic/mcp-sdk | AI agent integration |

---

## Core Features

### 1. AI Visibility Scanner (MVP - Implemented)

Analyze any URL and get an AI visibility score with detailed breakdown.

**Analyzers:**
- **Readability**: Content length, sentence structure, paragraph organization, complexity, voice
- **Structure**: Heading hierarchy, lists, schema markup, images, meta description
- **Entities**: Topic definition, questions addressed, facts/statistics, named entities, comparisons
- **Sources**: Author info, dates, citations, trust signals, expertise indicators

**Output:**
- Overall score (0-100)
- Category scores with explanations
- Factor-by-factor breakdown
- Actionable insights sorted by impact
- Metadata extraction (author, dates, schema, etc.)

### 2. Shareable Reports (Phase 2)

Generate public report URLs for viral sharing.

**Features:**
- Public report URLs (`geokit.dev/report/[id]`)
- OpenGraph/Twitter cards with score preview
- "Share your score" with copy-to-clipboard
- Social share buttons (Twitter, LinkedIn)
- "Scan your site" CTA on report pages
- Dynamic OG images with score

### 3. User Dashboard (Phase 3)

Authenticated experience with history and site management.

**Features:**
- Scan history
- Site management (add/claim sites)
- Score trends over time (Pro feature)
- Scan limits for free tier (50/month)
- Upgrade prompts

### 4. Payments + Pro Features (Phase 4)

Monetization through premium features.

**Pro Features:**
- Historical trend data (6 months)
- AI-powered suggestions (Claude API)
- Priority scanning queue
- Unlimited scans
- Competitive analysis

### 5. Growth Features (Phase 5)

Network effects and community building.

**Features:**
- Public leaderboards by industry
- Embeddable badge generator
- Competitive analysis (scan competitor sites)
- Industry benchmarks ("Sites like yours average 72")
- Contributor system (for open source)
- API documentation + MCP server

---

## Scoring System

### Overall Score Calculation

Weighted average of category scores:
- Readability: 30%
- Structure: 25%
- Entities: 25%
- Sources: 20%

### Score Levels

| Range | Level | Label |
|-------|-------|-------|
| 80-100 | Excellent | "Excellent" |
| 60-79 | Good | "Good" |
| 40-59 | Moderate | "Needs Work" |
| 0-39 | Poor | "Poor" |

### Insight Types

- **Improvement**: Action items with specific recommendations
- **Warning**: Borderline areas needing attention
- **Success**: Positive signals to maintain

### Impact Levels

- **High**: Critical for AI visibility (schema, author, headings)
- **Medium**: Important improvements (lists, citations, meta)
- **Low**: Nice-to-have optimizations

---

## Growth Mechanics

### 1. Data Flywheel

```
More Users → More Scans → Better Benchmarks → More Valuable Insights → More Users
```

### 2. Viral Score Reports

- Beautiful branded pages with animated score reveal
- "Beat this score" CTA triggers competitive sharing
- Optimized social cards for Twitter/LinkedIn

### 3. Public Leaderboards (SEO Incentive)

- Industry-specific rankings
- Backlinks to ranked sites
- Monthly "Most Improved" spotlights

### 4. Contributor Attribution (Expert Magnet)

- Profile pages with dofollow backlinks
- "Analyzer by @contributor" attribution in UI
- Free Pro tier for contributors

### 5. Embeddable Badges

```html
<a href="geokit.dev/site/example.com">
  <img src="geokit.dev/badge/example.com.svg" />
</a>
```

### 6. Agency Partner Program

- White-label reports
- 20% recurring referral commission
- Bulk client management

---

## Project Structure

```
geokit/
├── src/
│   ├── app/
│   │   ├── page.tsx                 # Landing page
│   │   ├── layout.tsx               # Root layout
│   │   ├── globals.css              # Global styles + theme
│   │   ├── api/
│   │   │   └── scan/
│   │   │       └── route.ts         # Scan API endpoint
│   │   └── scan/
│   │       └── [url]/
│   │           └── page.tsx         # Scan results page
│   ├── components/
│   │   ├── ui/                      # shadcn components
│   │   │   ├── button.tsx
│   │   │   ├── card.tsx
│   │   │   ├── input.tsx
│   │   │   └── badge.tsx
│   │   └── scanner/
│   │       └── url-input.tsx        # URL input component
│   └── lib/
│       ├── utils.ts                 # Utility functions (cn)
│       ├── scanner/
│       │   ├── index.ts             # Main scanner orchestrator
│       │   ├── types.ts             # Type definitions
│       │   ├── fetcher.ts           # URL fetching
│       │   └── extractor.ts         # Content extraction
│       └── analyzers/
│           ├── readability.ts       # Readability analyzer
│           ├── structure.ts         # Structure analyzer
│           ├── entities.ts          # Entity analyzer
│           ├── sources.ts           # Source credibility analyzer
│           └── insights.ts          # Insight generator
├── public/
├── package.json
├── next.config.ts
├── tailwind.config.ts
└── tsconfig.json
```

---

## API Reference

### POST /api/scan

Scan a URL and return AI visibility analysis.

**Request:**
```json
{
  "url": "https://example.com/page"
}
```

**Response:**
```json
{
  "url": "https://example.com/page",
  "title": "Page Title",
  "description": "Meta description...",
  "content": {
    "text": "Extracted text content...",
    "html": "<article>...</article>",
    "wordCount": 1500,
    "readingTime": 8
  },
  "scores": {
    "readability": {
      "score": 75,
      "maxScore": 100,
      "percentage": 75,
      "label": "Good",
      "description": "How easily AI engines can parse your content",
      "factors": [
        {
          "name": "Content Length",
          "value": "1500 words",
          "impact": "positive"
        }
      ]
    },
    "structure": { ... },
    "entities": { ... },
    "sources": { ... }
  },
  "overallScore": 72,
  "insights": [
    {
      "type": "improvement",
      "category": "structure",
      "title": "Add Schema Markup",
      "description": "Schema.org structured data is critical...",
      "impact": "high",
      "action": "Implement JSON-LD structured data"
    }
  ],
  "metadata": {
    "favicon": "https://example.com/favicon.ico",
    "ogImage": "https://example.com/og.jpg",
    "author": "John Doe",
    "publishDate": "2024-01-15T00:00:00Z",
    "modifiedDate": "2024-06-01T00:00:00Z",
    "language": "en",
    "hasSchema": true,
    "schemaTypes": ["Article", "FAQ"]
  },
  "scannedAt": "2024-12-15T10:30:00Z"
}
```

---

## Design Principles

1. **Speed**: Every scan < 5 seconds, instant UI feedback
2. **Clarity**: Scores are meaningless without explanations - always show "why"
3. **Action**: Every insight has a "Fix this" path
4. **Delight**: Micro-interactions, smooth animations, satisfying feedback
5. **Trust**: Show methodology, be transparent about scoring

---

## Competitive Differentiation vs SEMrush/Ahrefs

| Feature | SEMrush | GeoKit |
|---------|---------|--------|
| Focus | Traditional SEO | AI Search Optimization |
| AI Citations | No | Yes - track AI engine citations |
| Pricing | $129+/mo | Free tier + affordable paid |
| Open Source | No | Yes - community-driven |
| Speed | Minutes for audits | Seconds |
| UX | Complex, cluttered | Clean, focused |

---

## Success Metrics

1. **User Activation**: 50%+ of signups complete first scan
2. **Viral Coefficient**: 10%+ of scans are shared
3. **Retention**: 40%+ weekly active users
4. **Contributors**: 20+ GitHub contributors in 3 months
5. **Stars**: 2,000+ GitHub stars in 3 months

---

## Future Roadmap

### Phase 6: Scale + Polish
- Background job queue (Inngest/Trigger.dev)
- Caching layer (Redis/Upstash)
- Rate limiting
- Error monitoring (Sentry)
- Performance optimization
- Onboarding flow
- Email notifications
- Mobile responsive polish

### Phase 7: AI Search Tracker
- Monitor keywords in ChatGPT, Perplexity, Claude, Google AI
- Track which pages get cited
- Track competitors' citations
- Alert when you gain/lose citations

### Phase 8: Content Optimizer
- Real-time editor with AI visibility suggestions
- Live score updates as you edit
- Suggestions panel (like Grammarly for GEO)
- Competitor content comparison

### Phase 9: Site Audit
- Bulk page scanning
- Issue prioritization by impact
- Filter by issue type
- Progress tracking
- Scheduled re-audits

### Phase 10: MCP Server + API
- Full API documentation
- MCP server for AI agents
- Webhooks for automation
- SDK packages (npm, pip)

---

## License

MIT License - Open source, free to use, modify, and distribute.
