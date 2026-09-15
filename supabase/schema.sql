-- ============================================================================
-- RailGaadi v2 Supabase PostgreSQL Schema
-- Platform: Supabase PostgreSQL
-- Features: Profiles, Favourites, Saved Journeys, Delay Records (ML/Analytics),
--           Push Subscriptions, Notifications, Search History
-- ============================================================================

-- 1. Profiles Table (syncs with Supabase Auth)
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT NOT NULL,
  name TEXT,
  avatar_url TEXT,
  role TEXT DEFAULT 'user' CHECK (role IN ('user', 'admin')),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public profiles are viewable by everyone"
  ON public.profiles FOR SELECT
  USING (true);

CREATE POLICY "Users can insert their own profile"
  ON public.profiles FOR INSERT
  WITH CHECK (auth.uid() = id);

CREATE POLICY "Users can update their own profile"
  ON public.profiles FOR UPDATE
  USING (auth.uid() = id);

-- 2. Favourites Table (Trains & Stations)
CREATE TABLE IF NOT EXISTS public.favourites (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
  type TEXT NOT NULL CHECK (type IN ('train', 'station')),
  reference_id TEXT NOT NULL, -- trainNumber or stationCode
  title TEXT NOT NULL,
  subtitle TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_favourites_user_id ON public.favourites(user_id);
CREATE INDEX IF NOT EXISTS idx_favourites_ref ON public.favourites(reference_id);

ALTER TABLE public.favourites ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own favourites"
  ON public.favourites FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own favourites"
  ON public.favourites FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own favourites"
  ON public.favourites FOR DELETE
  USING (auth.uid() = user_id);

-- 3. Saved Journeys Table
CREATE TABLE IF NOT EXISTS public.saved_journeys (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
  train_id TEXT NOT NULL,
  train_name TEXT NOT NULL,
  source_code TEXT NOT NULL,
  source_name TEXT NOT NULL,
  destination_code TEXT NOT NULL,
  destination_name TEXT NOT NULL,
  journey_date DATE NOT NULL,
  share_token TEXT UNIQUE DEFAULT encode(gen_random_bytes(12), 'hex'),
  status TEXT DEFAULT 'ACTIVE' CHECK (status IN ('ACTIVE', 'UPCOMING', 'COMPLETED')),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_saved_journeys_user ON public.saved_journeys(user_id);
CREATE INDEX IF NOT EXISTS idx_saved_journeys_token ON public.saved_journeys(share_token);

ALTER TABLE public.saved_journeys ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own saved journeys"
  ON public.saved_journeys FOR SELECT
  USING (auth.uid() = user_id OR share_token IS NOT NULL);

CREATE POLICY "Users can manage their own saved journeys"
  ON public.saved_journeys FOR ALL
  USING (auth.uid() = user_id);

-- 4. Delay Records Table (Continuous ML & Analytics collection)
CREATE TABLE IF NOT EXISTS public.delay_records (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  train_number TEXT NOT NULL,
  station_code TEXT NOT NULL,
  station_name TEXT,
  scheduled_arrival TIMESTAMPTZ,
  actual_arrival TIMESTAMPTZ,
  delay_minutes INTEGER NOT NULL DEFAULT 0,
  speed_kmh NUMERIC,
  recorded_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_delay_train_num ON public.delay_records(train_number);
CREATE INDEX IF NOT EXISTS idx_delay_station ON public.delay_records(station_code);
CREATE INDEX IF NOT EXISTS idx_delay_recorded_at ON public.delay_records(recorded_at DESC);

ALTER TABLE public.delay_records ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public can read delay records for analytics"
  ON public.delay_records FOR SELECT
  USING (true);

CREATE POLICY "Service role can insert delay records"
  ON public.delay_records FOR INSERT
  WITH CHECK (true);

-- 5. Web Push Subscriptions Table
CREATE TABLE IF NOT EXISTS public.push_subscriptions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  train_number TEXT NOT NULL,
  endpoint TEXT NOT NULL UNIQUE,
  p256dh_key TEXT NOT NULL,
  auth_key TEXT NOT NULL,
  delay_threshold_min INTEGER DEFAULT 15,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_push_train ON public.push_subscriptions(train_number);

ALTER TABLE public.push_subscriptions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can manage their push subscription"
  ON public.push_subscriptions FOR ALL
  USING (true);

-- 6. Notifications Table
CREATE TABLE IF NOT EXISTS public.notifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
  train_number TEXT NOT NULL,
  title TEXT NOT NULL,
  body TEXT NOT NULL,
  type TEXT NOT NULL CHECK (type IN ('DELAY', 'STATION_APPROACH', 'DEPARTURE', 'COMPLETED')),
  is_read BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_notifications_user ON public.notifications(user_id);

ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users view their own notifications"
  ON public.notifications FOR SELECT
  USING (auth.uid() = user_id);

-- 7. Search History Table
CREATE TABLE IF NOT EXISTS public.search_history (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
  query TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_search_hist_user ON public.search_history(user_id);

ALTER TABLE public.search_history ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users manage their search history"
  ON public.search_history FOR ALL
  USING (auth.uid() = user_id);
