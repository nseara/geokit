-- Traffic Analytics Schema
-- Tracks visits to pages from LLM providers and AI search engines

-- Enum for AI traffic sources
CREATE TYPE ai_source AS ENUM (
  'chatgpt',
  'perplexity',
  'claude',
  'google_ai',
  'bing_copilot',
  'gemini',
  'other_ai',
  'organic',
  'direct',
  'referral',
  'unknown'
);

-- Traffic events table - stores individual visit events
CREATE TABLE traffic_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  site_id UUID REFERENCES sites(id) ON DELETE CASCADE,
  scan_id UUID REFERENCES scans(id) ON DELETE SET NULL,
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,

  -- Event details
  url TEXT NOT NULL,
  path TEXT,
  domain TEXT NOT NULL,

  -- Source classification
  source ai_source NOT NULL DEFAULT 'unknown',
  referrer TEXT,
  referrer_domain TEXT,
  user_agent TEXT,

  -- Metadata
  country_code CHAR(2),
  device_type TEXT, -- 'desktop', 'mobile', 'tablet', 'bot'

  -- Timestamps
  timestamp TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Daily aggregated traffic stats for faster queries
CREATE TABLE traffic_daily_stats (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  site_id UUID REFERENCES sites(id) ON DELETE CASCADE,
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  date DATE NOT NULL,

  -- Traffic counts by source
  chatgpt_visits INTEGER DEFAULT 0,
  perplexity_visits INTEGER DEFAULT 0,
  claude_visits INTEGER DEFAULT 0,
  google_ai_visits INTEGER DEFAULT 0,
  bing_copilot_visits INTEGER DEFAULT 0,
  gemini_visits INTEGER DEFAULT 0,
  other_ai_visits INTEGER DEFAULT 0,
  organic_visits INTEGER DEFAULT 0,
  direct_visits INTEGER DEFAULT 0,
  referral_visits INTEGER DEFAULT 0,
  unknown_visits INTEGER DEFAULT 0,

  -- Totals
  total_visits INTEGER DEFAULT 0,
  total_ai_visits INTEGER DEFAULT 0,

  -- Unique visitors (approximation)
  unique_visitors INTEGER DEFAULT 0,

  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

  UNIQUE(site_id, date)
);

-- Score history for tracking improvements over time
CREATE TABLE score_history (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  site_id UUID REFERENCES sites(id) ON DELETE CASCADE,
  scan_id UUID REFERENCES scans(id) ON DELETE SET NULL,
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,

  url TEXT NOT NULL,
  domain TEXT NOT NULL,

  -- Scores
  overall_score INTEGER NOT NULL,
  readability_score INTEGER,
  structure_score INTEGER,
  entities_score INTEGER,
  sources_score INTEGER,

  -- Timestamp
  scanned_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Indexes for efficient queries
CREATE INDEX idx_traffic_events_site_timestamp ON traffic_events(site_id, timestamp DESC);
CREATE INDEX idx_traffic_events_user_timestamp ON traffic_events(user_id, timestamp DESC);
CREATE INDEX idx_traffic_events_source ON traffic_events(source);
CREATE INDEX idx_traffic_events_domain ON traffic_events(domain);

CREATE INDEX idx_traffic_daily_stats_site_date ON traffic_daily_stats(site_id, date DESC);
CREATE INDEX idx_traffic_daily_stats_user_date ON traffic_daily_stats(user_id, date DESC);

CREATE INDEX idx_score_history_site_date ON score_history(site_id, scanned_at DESC);
CREATE INDEX idx_score_history_user_date ON score_history(user_id, scanned_at DESC);
CREATE INDEX idx_score_history_domain ON score_history(domain);

-- RLS Policies
ALTER TABLE traffic_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE traffic_daily_stats ENABLE ROW LEVEL SECURITY;
ALTER TABLE score_history ENABLE ROW LEVEL SECURITY;

-- Users can only see their own traffic data
CREATE POLICY "Users can view own traffic events"
  ON traffic_events FOR SELECT
  USING (auth.uid()::text = user_id::text);

CREATE POLICY "Users can insert own traffic events"
  ON traffic_events FOR INSERT
  WITH CHECK (auth.uid()::text = user_id::text);

CREATE POLICY "Users can view own daily stats"
  ON traffic_daily_stats FOR SELECT
  USING (auth.uid()::text = user_id::text);

CREATE POLICY "Users can view own score history"
  ON score_history FOR SELECT
  USING (auth.uid()::text = user_id::text);

CREATE POLICY "Users can insert own score history"
  ON score_history FOR INSERT
  WITH CHECK (auth.uid()::text = user_id::text);

-- Function to aggregate daily stats
CREATE OR REPLACE FUNCTION aggregate_daily_traffic(p_site_id UUID, p_date DATE)
RETURNS void AS $$
DECLARE
  v_user_id UUID;
BEGIN
  -- Get user_id from site
  SELECT user_id INTO v_user_id FROM sites WHERE id = p_site_id;

  INSERT INTO traffic_daily_stats (
    site_id, user_id, date,
    chatgpt_visits, perplexity_visits, claude_visits, google_ai_visits,
    bing_copilot_visits, gemini_visits, other_ai_visits,
    organic_visits, direct_visits, referral_visits, unknown_visits,
    total_visits, total_ai_visits
  )
  SELECT
    p_site_id,
    v_user_id,
    p_date,
    COUNT(*) FILTER (WHERE source = 'chatgpt'),
    COUNT(*) FILTER (WHERE source = 'perplexity'),
    COUNT(*) FILTER (WHERE source = 'claude'),
    COUNT(*) FILTER (WHERE source = 'google_ai'),
    COUNT(*) FILTER (WHERE source = 'bing_copilot'),
    COUNT(*) FILTER (WHERE source = 'gemini'),
    COUNT(*) FILTER (WHERE source = 'other_ai'),
    COUNT(*) FILTER (WHERE source = 'organic'),
    COUNT(*) FILTER (WHERE source = 'direct'),
    COUNT(*) FILTER (WHERE source = 'referral'),
    COUNT(*) FILTER (WHERE source = 'unknown'),
    COUNT(*),
    COUNT(*) FILTER (WHERE source IN ('chatgpt', 'perplexity', 'claude', 'google_ai', 'bing_copilot', 'gemini', 'other_ai'))
  FROM traffic_events
  WHERE site_id = p_site_id
    AND timestamp::date = p_date
  ON CONFLICT (site_id, date) DO UPDATE SET
    chatgpt_visits = EXCLUDED.chatgpt_visits,
    perplexity_visits = EXCLUDED.perplexity_visits,
    claude_visits = EXCLUDED.claude_visits,
    google_ai_visits = EXCLUDED.google_ai_visits,
    bing_copilot_visits = EXCLUDED.bing_copilot_visits,
    gemini_visits = EXCLUDED.gemini_visits,
    other_ai_visits = EXCLUDED.other_ai_visits,
    organic_visits = EXCLUDED.organic_visits,
    direct_visits = EXCLUDED.direct_visits,
    referral_visits = EXCLUDED.referral_visits,
    unknown_visits = EXCLUDED.unknown_visits,
    total_visits = EXCLUDED.total_visits,
    total_ai_visits = EXCLUDED.total_ai_visits,
    updated_at = NOW();
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Grant execute permission
GRANT EXECUTE ON FUNCTION aggregate_daily_traffic(UUID, DATE) TO authenticated;
