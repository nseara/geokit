# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Rules

- **Never mention AI in commits or code**: Do not add "Generated with Claude", "Co-Authored-By: Claude", or any AI attribution to commits, comments, or documentation. Keep commits clean and professional.

## Project Overview

GeoKit is an open-source AI visibility scanner - "SEMrush for the AI era". It analyzes web pages to score how well they're optimized for AI search engines (ChatGPT, Perplexity, Claude, Google AI Overviews).

## Commands

```bash
pnpm dev      # Start development server at localhost:3000
pnpm build    # Production build
pnpm lint     # Run ESLint
pnpm start    # Start production server
```

## Architecture

### Scanning Pipeline

The core scanning flow in `src/lib/scanner/`:

1. **Fetcher** (`fetcher.ts`) - Fetches URL with proper user-agent, handles timeouts and redirects
2. **Extractor** (`extractor.ts`) - Parses HTML with Cheerio, extracts content with Mozilla Readability, pulls metadata (schema, author, dates)
3. **Analyzers** (`src/lib/analyzers/`) - Four parallel analyzers score the content:
   - `readability.ts` - Content length, sentence structure, complexity, voice
   - `structure.ts` - Heading hierarchy, lists, schema markup, meta description
   - `entities.ts` - Topic definition, questions addressed, facts/statistics
   - `sources.ts` - Author info, dates, citations, trust signals
4. **Insights** (`insights.ts`) - Generates actionable recommendations from analyzer results

Entry point: `scanUrl()` in `src/lib/scanner/index.ts` orchestrates the pipeline.

### Scoring System

- Overall score: Weighted average (readability 30%, structure 25%, entities 25%, sources 20%)
- Each analyzer returns `ScoreDetail` with factors explaining the score
- Insights are sorted by impact (high/medium/low) and type (improvement/warning/success)

### Type Definitions

All types are in `src/lib/scanner/types.ts`:
- `ScanResult` - Complete scan response
- `CategoryScores` - The four analyzer scores
- `ScoreDetail` - Individual score with factors
- `Insight` - Actionable recommendation

### UI Components

- `src/components/ui/` - shadcn/ui components (Button, Card, Input, Badge)
- `src/components/scanner/url-input.tsx` - URL input with validation and loading state

### API

`POST /api/scan` or `GET /api/scan?url=...` - Returns full `ScanResult` JSON.

## Tech Stack

- Next.js 15 (App Router) + TypeScript
- shadcn/ui + Tailwind CSS v4 + Framer Motion
- Cheerio + @mozilla/readability for content extraction
- pnpm for package management

## Adding New Analyzers

1. Create `src/lib/analyzers/[name].ts` exporting a function that takes `ExtractionResult` and returns `ScoreDetail`
2. Add to `CategoryScores` type in `types.ts`
3. Import and call in `src/lib/scanner/index.ts`
4. Update weight in overall score calculation
5. Add insight generation rules in `insights.ts`
