-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create tier enum
CREATE TYPE tier AS ENUM ('free', 'pro', 'team', 'enterprise');

-- Users table
CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  email TEXT UNIQUE NOT NULL,
  name TEXT,
  avatar_url TEXT,
  tier tier DEFAULT 'free' NOT NULL,
  stripe_customer_id TEXT UNIQUE,
  stripe_subscription_id TEXT UNIQUE,
  scans_this_month INTEGER DEFAULT 0 NOT NULL,
  scans_reset_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- Scans table
CREATE TABLE scans (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES users(id) ON DELETE SET NULL,
  url TEXT NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  overall_score INTEGER NOT NULL,
  readability_score INTEGER NOT NULL,
  structure_score INTEGER NOT NULL,
  entities_score INTEGER NOT NULL,
  sources_score INTEGER NOT NULL,
  word_count INTEGER NOT NULL,
  has_schema BOOLEAN DEFAULT FALSE,
  author TEXT,
  insights JSONB DEFAULT '[]'::jsonb,
  full_result JSONB,
  is_public BOOLEAN DEFAULT FALSE,
  share_id TEXT UNIQUE,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- Sites table (for claimed domains)
CREATE TABLE sites (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE NOT NULL,
  domain TEXT NOT NULL,
  name TEXT,
  verified BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  UNIQUE(user_id, domain)
);

-- Leaderboard entries
CREATE TABLE leaderboard_entries (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  scan_id UUID REFERENCES scans(id) ON DELETE CASCADE NOT NULL,
  domain TEXT NOT NULL,
  url TEXT NOT NULL,
  title TEXT NOT NULL,
  overall_score INTEGER NOT NULL,
  industry TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- Indexes for performance
CREATE INDEX idx_scans_user_id ON scans(user_id);
CREATE INDEX idx_scans_share_id ON scans(share_id) WHERE share_id IS NOT NULL;
CREATE INDEX idx_scans_created_at ON scans(created_at DESC);
CREATE INDEX idx_scans_url ON scans(url);
CREATE INDEX idx_sites_user_id ON sites(user_id);
CREATE INDEX idx_sites_domain ON sites(domain);
CREATE INDEX idx_leaderboard_score ON leaderboard_entries(overall_score DESC);
CREATE INDEX idx_leaderboard_industry ON leaderboard_entries(industry) WHERE industry IS NOT NULL;
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_stripe_customer ON users(stripe_customer_id) WHERE stripe_customer_id IS NOT NULL;

-- Function to increment user scans
CREATE OR REPLACE FUNCTION increment_user_scans(p_user_id UUID)
RETURNS INTEGER AS $$
DECLARE
  current_count INTEGER;
  reset_date TIMESTAMPTZ;
BEGIN
  SELECT scans_this_month, scans_reset_at INTO current_count, reset_date
  FROM users WHERE id = p_user_id;

  -- Reset count if we're in a new month
  IF reset_date < date_trunc('month', NOW()) THEN
    UPDATE users
    SET scans_this_month = 1,
        scans_reset_at = date_trunc('month', NOW()),
        updated_at = NOW()
    WHERE id = p_user_id;
    RETURN 1;
  ELSE
    UPDATE users
    SET scans_this_month = scans_this_month + 1,
        updated_at = NOW()
    WHERE id = p_user_id;
    RETURN current_count + 1;
  END IF;
END;
$$ LANGUAGE plpgsql;

-- Row Level Security
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE scans ENABLE ROW LEVEL SECURITY;
ALTER TABLE sites ENABLE ROW LEVEL SECURITY;
ALTER TABLE leaderboard_entries ENABLE ROW LEVEL SECURITY;

-- Users can read and update their own data
CREATE POLICY "Users can view own data" ON users
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update own data" ON users
  FOR UPDATE USING (auth.uid() = id);

-- Scans policies
CREATE POLICY "Users can view own scans" ON scans
  FOR SELECT USING (user_id = auth.uid() OR is_public = TRUE);

CREATE POLICY "Users can insert own scans" ON scans
  FOR INSERT WITH CHECK (user_id = auth.uid() OR user_id IS NULL);

CREATE POLICY "Users can update own scans" ON scans
  FOR UPDATE USING (user_id = auth.uid());

CREATE POLICY "Public scans are viewable" ON scans
  FOR SELECT USING (is_public = TRUE);

-- Sites policies
CREATE POLICY "Users can manage own sites" ON sites
  FOR ALL USING (user_id = auth.uid());

-- Leaderboard is public
CREATE POLICY "Leaderboard is public" ON leaderboard_entries
  FOR SELECT USING (TRUE);

-- Updated at trigger
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER users_updated_at
  BEFORE UPDATE ON users
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER sites_updated_at
  BEFORE UPDATE ON sites
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();
