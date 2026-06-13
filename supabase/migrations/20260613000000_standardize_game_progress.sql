-- Standard game progress system for all Luna games.
-- This replaces per-game progress table design with a shared schema that can
-- support future XP, streaks, achievements, sessions, and leaderboards by data.

-- ========== GAME CATALOG ==========
CREATE TABLE IF NOT EXISTS public.game_definitions (
  key TEXT PRIMARY KEY,
  display_name TEXT NOT NULL,
  description TEXT,
  status TEXT NOT NULL DEFAULT 'active',
  sort_order INT NOT NULL DEFAULT 0,
  config JSONB NOT NULL DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.game_definitions ENABLE ROW LEVEL SECURITY;

INSERT INTO public.game_definitions (key, display_name, status, sort_order, config)
VALUES
  ('memory_flip', 'Memory Flip', 'active', 10, '{"difficulties":["Easy","Medium","Hard","Advanced"]}'::jsonb),
  ('word_search', 'Word Search', 'planned', 20, '{}'::jsonb),
  ('word_drive', 'Word Drive', 'planned', 30, '{}'::jsonb),
  ('grammar_runner', 'Grammar Runner', 'planned', 40, '{}'::jsonb),
  ('listening_challenge', 'Listening Challenge', 'planned', 50, '{}'::jsonb),
  ('cat4_patterns', 'CAT4 Patterns', 'planned', 60, '{}'::jsonb)
ON CONFLICT (key) DO UPDATE SET
  display_name = EXCLUDED.display_name,
  status = EXCLUDED.status,
  sort_order = EXCLUDED.sort_order,
  config = public.game_definitions.config || EXCLUDED.config,
  updated_at = now();

-- ========== STUDENT GAME PROGRESS ==========
CREATE TABLE IF NOT EXISTS public.student_game_progress (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  student_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  game_key TEXT NOT NULL REFERENCES public.game_definitions(key) ON DELETE RESTRICT,

  -- One row per student + game + learning scope. Examples:
  -- memory_flip / zh_en:Grade 1, word_search / zh_en:Grade 2.
  scope_key TEXT NOT NULL DEFAULT 'default',
  scope JSONB NOT NULL DEFAULT '{}'::jsonb,

  unlocked_difficulty TEXT NOT NULL DEFAULT 'Easy',
  current_difficulty TEXT,
  highest_level INT NOT NULL DEFAULT 1,

  total_plays INT NOT NULL DEFAULT 0,
  total_wins INT NOT NULL DEFAULT 0,
  total_losses INT NOT NULL DEFAULT 0,
  total_score BIGINT NOT NULL DEFAULT 0,
  best_score BIGINT NOT NULL DEFAULT 0,

  xp_total INT NOT NULL DEFAULT 0,
  xp_current_level INT NOT NULL DEFAULT 0,
  current_streak INT NOT NULL DEFAULT 0,
  best_streak INT NOT NULL DEFAULT 0,

  last_played_at TIMESTAMPTZ,
  last_won_at TIMESTAMPTZ,
  last_lost_at TIMESTAMPTZ,

  -- Flexible surfaces for game-specific counters and future systems.
  stats JSONB NOT NULL DEFAULT '{}'::jsonb,
  achievement_state JSONB NOT NULL DEFAULT '{}'::jsonb,
  leaderboard_state JSONB NOT NULL DEFAULT '{}'::jsonb,

  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),

  UNIQUE (student_id, game_key, scope_key)
);

ALTER TABLE public.student_game_progress ENABLE ROW LEVEL SECURITY;

CREATE INDEX IF NOT EXISTS idx_student_game_progress_student
  ON public.student_game_progress(student_id);
CREATE INDEX IF NOT EXISTS idx_student_game_progress_game_scope
  ON public.student_game_progress(game_key, scope_key);
CREATE INDEX IF NOT EXISTS idx_student_game_progress_xp
  ON public.student_game_progress(game_key, xp_total DESC);
CREATE INDEX IF NOT EXISTS idx_student_game_progress_best_score
  ON public.student_game_progress(game_key, best_score DESC);
CREATE INDEX IF NOT EXISTS idx_student_game_progress_scope_gin
  ON public.student_game_progress USING GIN (scope);
CREATE INDEX IF NOT EXISTS idx_student_game_progress_stats_gin
  ON public.student_game_progress USING GIN (stats);

-- ========== GAME SESSIONS ==========
CREATE TABLE IF NOT EXISTS public.student_game_sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  student_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  progress_id UUID REFERENCES public.student_game_progress(id) ON DELETE SET NULL,
  game_key TEXT NOT NULL REFERENCES public.game_definitions(key) ON DELETE RESTRICT,
  scope_key TEXT NOT NULL DEFAULT 'default',
  scope JSONB NOT NULL DEFAULT '{}'::jsonb,

  difficulty TEXT,
  level_reached INT,
  score BIGINT NOT NULL DEFAULT 0,
  xp_earned INT NOT NULL DEFAULT 0,
  passed BOOLEAN,
  result TEXT,

  started_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  ended_at TIMESTAMPTZ,
  duration_seconds INT,

  metrics JSONB NOT NULL DEFAULT '{}'::jsonb,
  metadata JSONB NOT NULL DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.student_game_sessions ENABLE ROW LEVEL SECURITY;

CREATE INDEX IF NOT EXISTS idx_student_game_sessions_student
  ON public.student_game_sessions(student_id, started_at DESC);
CREATE INDEX IF NOT EXISTS idx_student_game_sessions_game_score
  ON public.student_game_sessions(game_key, score DESC, ended_at DESC);
CREATE INDEX IF NOT EXISTS idx_student_game_sessions_game_scope
  ON public.student_game_sessions(game_key, scope_key, started_at DESC);
CREATE INDEX IF NOT EXISTS idx_student_game_sessions_metrics_gin
  ON public.student_game_sessions USING GIN (metrics);

-- ========== GAME EVENTS ==========
CREATE TABLE IF NOT EXISTS public.student_game_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  student_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  progress_id UUID REFERENCES public.student_game_progress(id) ON DELETE SET NULL,
  session_id UUID REFERENCES public.student_game_sessions(id) ON DELETE SET NULL,
  game_key TEXT NOT NULL REFERENCES public.game_definitions(key) ON DELETE RESTRICT,
  scope_key TEXT NOT NULL DEFAULT 'default',

  event_type TEXT NOT NULL,
  event_key TEXT,
  points_delta INT NOT NULL DEFAULT 0,
  xp_delta INT NOT NULL DEFAULT 0,
  payload JSONB NOT NULL DEFAULT '{}'::jsonb,

  occurred_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.student_game_events ENABLE ROW LEVEL SECURITY;

CREATE INDEX IF NOT EXISTS idx_student_game_events_student
  ON public.student_game_events(student_id, occurred_at DESC);
CREATE INDEX IF NOT EXISTS idx_student_game_events_game_type
  ON public.student_game_events(game_key, event_type, occurred_at DESC);
CREATE INDEX IF NOT EXISTS idx_student_game_events_payload_gin
  ON public.student_game_events USING GIN (payload);

-- ========== ACHIEVEMENTS ==========
CREATE TABLE IF NOT EXISTS public.game_achievement_definitions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  game_key TEXT NOT NULL REFERENCES public.game_definitions(key) ON DELETE CASCADE,
  achievement_key TEXT NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  xp_reward INT NOT NULL DEFAULT 0,
  config JSONB NOT NULL DEFAULT '{}'::jsonb,
  is_active BOOLEAN NOT NULL DEFAULT TRUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (game_key, achievement_key)
);

ALTER TABLE public.game_achievement_definitions ENABLE ROW LEVEL SECURITY;

CREATE TABLE IF NOT EXISTS public.student_game_achievements (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  student_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  game_key TEXT NOT NULL REFERENCES public.game_definitions(key) ON DELETE CASCADE,
  achievement_key TEXT NOT NULL,
  scope_key TEXT NOT NULL DEFAULT 'default',
  status TEXT NOT NULL DEFAULT 'in_progress',
  progress_value NUMERIC NOT NULL DEFAULT 0,
  target_value NUMERIC,
  unlocked_at TIMESTAMPTZ,
  metadata JSONB NOT NULL DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (student_id, game_key, achievement_key, scope_key)
);

ALTER TABLE public.student_game_achievements ENABLE ROW LEVEL SECURITY;

CREATE INDEX IF NOT EXISTS idx_student_game_achievements_student
  ON public.student_game_achievements(student_id, game_key);
CREATE INDEX IF NOT EXISTS idx_student_game_achievements_unlocked
  ON public.student_game_achievements(game_key, unlocked_at DESC);

-- ========== LEADERBOARDS ==========
CREATE TABLE IF NOT EXISTS public.game_leaderboards (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  game_key TEXT NOT NULL REFERENCES public.game_definitions(key) ON DELETE CASCADE,
  leaderboard_key TEXT NOT NULL,
  title TEXT NOT NULL,
  metric_key TEXT NOT NULL DEFAULT 'score',
  direction TEXT NOT NULL DEFAULT 'desc',
  period TEXT NOT NULL DEFAULT 'all_time',
  config JSONB NOT NULL DEFAULT '{}'::jsonb,
  is_active BOOLEAN NOT NULL DEFAULT TRUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (game_key, leaderboard_key)
);

ALTER TABLE public.game_leaderboards ENABLE ROW LEVEL SECURITY;

CREATE TABLE IF NOT EXISTS public.student_game_leaderboard_entries (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  student_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  game_key TEXT NOT NULL REFERENCES public.game_definitions(key) ON DELETE CASCADE,
  leaderboard_key TEXT NOT NULL DEFAULT 'global',
  scope_key TEXT NOT NULL DEFAULT 'default',
  score_value NUMERIC NOT NULL DEFAULT 0,
  rank_cache INT,
  is_public BOOLEAN NOT NULL DEFAULT FALSE,
  metadata JSONB NOT NULL DEFAULT '{}'::jsonb,
  achieved_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (student_id, game_key, leaderboard_key, scope_key)
);

ALTER TABLE public.student_game_leaderboard_entries ENABLE ROW LEVEL SECURITY;

CREATE INDEX IF NOT EXISTS idx_student_game_leaderboard_entries_board
  ON public.student_game_leaderboard_entries(game_key, leaderboard_key, scope_key, score_value DESC);
CREATE INDEX IF NOT EXISTS idx_student_game_leaderboard_entries_student
  ON public.student_game_leaderboard_entries(student_id, game_key);

-- ========== UPDATED_AT TRIGGERS ==========
DROP TRIGGER IF EXISTS game_definitions_updated_at ON public.game_definitions;
CREATE TRIGGER game_definitions_updated_at
  BEFORE UPDATE ON public.game_definitions
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

DROP TRIGGER IF EXISTS student_game_progress_updated_at ON public.student_game_progress;
CREATE TRIGGER student_game_progress_updated_at
  BEFORE UPDATE ON public.student_game_progress
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

DROP TRIGGER IF EXISTS game_achievement_definitions_updated_at ON public.game_achievement_definitions;
CREATE TRIGGER game_achievement_definitions_updated_at
  BEFORE UPDATE ON public.game_achievement_definitions
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

DROP TRIGGER IF EXISTS student_game_achievements_updated_at ON public.student_game_achievements;
CREATE TRIGGER student_game_achievements_updated_at
  BEFORE UPDATE ON public.student_game_achievements
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

DROP TRIGGER IF EXISTS game_leaderboards_updated_at ON public.game_leaderboards;
CREATE TRIGGER game_leaderboards_updated_at
  BEFORE UPDATE ON public.game_leaderboards
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

DROP TRIGGER IF EXISTS student_game_leaderboard_entries_updated_at ON public.student_game_leaderboard_entries;
CREATE TRIGGER student_game_leaderboard_entries_updated_at
  BEFORE UPDATE ON public.student_game_leaderboard_entries
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- ========== RLS POLICIES ==========

-- Catalog/config tables.
DROP POLICY IF EXISTS "Authenticated read game definitions" ON public.game_definitions;
CREATE POLICY "Authenticated read game definitions"
  ON public.game_definitions FOR SELECT TO authenticated
  USING (true);
DROP POLICY IF EXISTS "Admins manage game definitions" ON public.game_definitions;
CREATE POLICY "Admins manage game definitions"
  ON public.game_definitions FOR ALL TO authenticated
  USING (public.has_role(auth.uid(), 'head_tutor'))
  WITH CHECK (public.has_role(auth.uid(), 'head_tutor'));

DROP POLICY IF EXISTS "Authenticated read achievement definitions" ON public.game_achievement_definitions;
CREATE POLICY "Authenticated read achievement definitions"
  ON public.game_achievement_definitions FOR SELECT TO authenticated
  USING (is_active = TRUE OR public.has_role(auth.uid(), 'head_tutor'));
DROP POLICY IF EXISTS "Admins manage achievement definitions" ON public.game_achievement_definitions;
CREATE POLICY "Admins manage achievement definitions"
  ON public.game_achievement_definitions FOR ALL TO authenticated
  USING (public.has_role(auth.uid(), 'head_tutor'))
  WITH CHECK (public.has_role(auth.uid(), 'head_tutor'));

DROP POLICY IF EXISTS "Authenticated read leaderboard definitions" ON public.game_leaderboards;
CREATE POLICY "Authenticated read leaderboard definitions"
  ON public.game_leaderboards FOR SELECT TO authenticated
  USING (is_active = TRUE OR public.has_role(auth.uid(), 'head_tutor'));
DROP POLICY IF EXISTS "Admins manage leaderboard definitions" ON public.game_leaderboards;
CREATE POLICY "Admins manage leaderboard definitions"
  ON public.game_leaderboards FOR ALL TO authenticated
  USING (public.has_role(auth.uid(), 'head_tutor'))
  WITH CHECK (public.has_role(auth.uid(), 'head_tutor'));

-- Student-owned gameplay data.
DROP POLICY IF EXISTS "Students view own game progress" ON public.student_game_progress;
CREATE POLICY "Students view own game progress"
  ON public.student_game_progress FOR SELECT TO authenticated
  USING (
    auth.uid() = student_id
    OR public.has_role(auth.uid(), 'head_tutor')
    OR public.is_tutor_of(auth.uid(), student_id)
  );
DROP POLICY IF EXISTS "Students insert own game progress" ON public.student_game_progress;
CREATE POLICY "Students insert own game progress"
  ON public.student_game_progress FOR INSERT TO authenticated
  WITH CHECK (auth.uid() = student_id AND public.has_role(auth.uid(), 'student'));
DROP POLICY IF EXISTS "Students update own game progress" ON public.student_game_progress;
CREATE POLICY "Students update own game progress"
  ON public.student_game_progress FOR UPDATE TO authenticated
  USING (auth.uid() = student_id AND public.has_role(auth.uid(), 'student'))
  WITH CHECK (auth.uid() = student_id AND public.has_role(auth.uid(), 'student'));
DROP POLICY IF EXISTS "Admins manage game progress" ON public.student_game_progress;
CREATE POLICY "Admins manage game progress"
  ON public.student_game_progress FOR ALL TO authenticated
  USING (public.has_role(auth.uid(), 'head_tutor'))
  WITH CHECK (public.has_role(auth.uid(), 'head_tutor'));

DROP POLICY IF EXISTS "Students view own game sessions" ON public.student_game_sessions;
CREATE POLICY "Students view own game sessions"
  ON public.student_game_sessions FOR SELECT TO authenticated
  USING (
    auth.uid() = student_id
    OR public.has_role(auth.uid(), 'head_tutor')
    OR public.is_tutor_of(auth.uid(), student_id)
  );
DROP POLICY IF EXISTS "Students insert own game sessions" ON public.student_game_sessions;
CREATE POLICY "Students insert own game sessions"
  ON public.student_game_sessions FOR INSERT TO authenticated
  WITH CHECK (auth.uid() = student_id AND public.has_role(auth.uid(), 'student'));
DROP POLICY IF EXISTS "Students update own game sessions" ON public.student_game_sessions;
CREATE POLICY "Students update own game sessions"
  ON public.student_game_sessions FOR UPDATE TO authenticated
  USING (auth.uid() = student_id AND public.has_role(auth.uid(), 'student'))
  WITH CHECK (auth.uid() = student_id AND public.has_role(auth.uid(), 'student'));
DROP POLICY IF EXISTS "Admins manage game sessions" ON public.student_game_sessions;
CREATE POLICY "Admins manage game sessions"
  ON public.student_game_sessions FOR ALL TO authenticated
  USING (public.has_role(auth.uid(), 'head_tutor'))
  WITH CHECK (public.has_role(auth.uid(), 'head_tutor'));

DROP POLICY IF EXISTS "Students view own game events" ON public.student_game_events;
CREATE POLICY "Students view own game events"
  ON public.student_game_events FOR SELECT TO authenticated
  USING (
    auth.uid() = student_id
    OR public.has_role(auth.uid(), 'head_tutor')
    OR public.is_tutor_of(auth.uid(), student_id)
  );
DROP POLICY IF EXISTS "Students insert own game events" ON public.student_game_events;
CREATE POLICY "Students insert own game events"
  ON public.student_game_events FOR INSERT TO authenticated
  WITH CHECK (auth.uid() = student_id AND public.has_role(auth.uid(), 'student'));
DROP POLICY IF EXISTS "Admins manage game events" ON public.student_game_events;
CREATE POLICY "Admins manage game events"
  ON public.student_game_events FOR ALL TO authenticated
  USING (public.has_role(auth.uid(), 'head_tutor'))
  WITH CHECK (public.has_role(auth.uid(), 'head_tutor'));

DROP POLICY IF EXISTS "Students view own achievements" ON public.student_game_achievements;
CREATE POLICY "Students view own achievements"
  ON public.student_game_achievements FOR SELECT TO authenticated
  USING (
    auth.uid() = student_id
    OR public.has_role(auth.uid(), 'head_tutor')
    OR public.is_tutor_of(auth.uid(), student_id)
  );
DROP POLICY IF EXISTS "Students insert own achievements" ON public.student_game_achievements;
CREATE POLICY "Students insert own achievements"
  ON public.student_game_achievements FOR INSERT TO authenticated
  WITH CHECK (auth.uid() = student_id AND public.has_role(auth.uid(), 'student'));
DROP POLICY IF EXISTS "Students update own achievements" ON public.student_game_achievements;
CREATE POLICY "Students update own achievements"
  ON public.student_game_achievements FOR UPDATE TO authenticated
  USING (auth.uid() = student_id AND public.has_role(auth.uid(), 'student'))
  WITH CHECK (auth.uid() = student_id AND public.has_role(auth.uid(), 'student'));
DROP POLICY IF EXISTS "Admins manage achievements" ON public.student_game_achievements;
CREATE POLICY "Admins manage achievements"
  ON public.student_game_achievements FOR ALL TO authenticated
  USING (public.has_role(auth.uid(), 'head_tutor'))
  WITH CHECK (public.has_role(auth.uid(), 'head_tutor'));

DROP POLICY IF EXISTS "Read public or own leaderboard entries" ON public.student_game_leaderboard_entries;
CREATE POLICY "Read public or own leaderboard entries"
  ON public.student_game_leaderboard_entries FOR SELECT TO authenticated
  USING (
    is_public = TRUE
    OR auth.uid() = student_id
    OR public.has_role(auth.uid(), 'head_tutor')
    OR public.is_tutor_of(auth.uid(), student_id)
  );
DROP POLICY IF EXISTS "Students insert own leaderboard entries" ON public.student_game_leaderboard_entries;
CREATE POLICY "Students insert own leaderboard entries"
  ON public.student_game_leaderboard_entries FOR INSERT TO authenticated
  WITH CHECK (auth.uid() = student_id AND public.has_role(auth.uid(), 'student'));
DROP POLICY IF EXISTS "Students update own leaderboard entries" ON public.student_game_leaderboard_entries;
CREATE POLICY "Students update own leaderboard entries"
  ON public.student_game_leaderboard_entries FOR UPDATE TO authenticated
  USING (auth.uid() = student_id AND public.has_role(auth.uid(), 'student'))
  WITH CHECK (auth.uid() = student_id AND public.has_role(auth.uid(), 'student'));
DROP POLICY IF EXISTS "Admins manage leaderboard entries" ON public.student_game_leaderboard_entries;
CREATE POLICY "Admins manage leaderboard entries"
  ON public.student_game_leaderboard_entries FOR ALL TO authenticated
  USING (public.has_role(auth.uid(), 'head_tutor'))
  WITH CHECK (public.has_role(auth.uid(), 'head_tutor'));

-- ========== OPTIONAL LEGACY BACKFILL ==========
-- If the old Memory Flip progress table exists in a deployed database, copy it
-- into the shared table once. This block is safe in environments without it.
DO $$
BEGIN
  IF to_regclass('public.student_memory_flip_progress') IS NOT NULL THEN
    EXECUTE $backfill$
      INSERT INTO public.student_game_progress (
        student_id,
        game_key,
        scope_key,
        scope,
        unlocked_difficulty,
        highest_level,
        total_wins,
        total_losses,
        current_streak,
        best_streak,
        last_played_at,
        stats,
        created_at,
        updated_at
      )
      SELECT
        student_id,
        'memory_flip',
        COALESCE(language_pair, 'default') || ':' || COALESCE(grade, 'default'),
        jsonb_build_object(
          'language_pair', language_pair,
          'grade', grade,
          'source', 'student_memory_flip_progress'
        ),
        COALESCE(unlocked_difficulty, 'Easy'),
        COALESCE(highest_level, 1),
        COALESCE(total_wins, 0),
        COALESCE(total_losses, 0),
        COALESCE(streak, 0),
        COALESCE(streak, 0),
        last_played_at,
        jsonb_build_object('legacy_table', 'student_memory_flip_progress'),
        now(),
        now()
      FROM public.student_memory_flip_progress
      ON CONFLICT (student_id, game_key, scope_key) DO UPDATE SET
        unlocked_difficulty = EXCLUDED.unlocked_difficulty,
        highest_level = GREATEST(public.student_game_progress.highest_level, EXCLUDED.highest_level),
        total_wins = GREATEST(public.student_game_progress.total_wins, EXCLUDED.total_wins),
        total_losses = GREATEST(public.student_game_progress.total_losses, EXCLUDED.total_losses),
        current_streak = GREATEST(public.student_game_progress.current_streak, EXCLUDED.current_streak),
        best_streak = GREATEST(public.student_game_progress.best_streak, EXCLUDED.best_streak),
        last_played_at = GREATEST(
          COALESCE(public.student_game_progress.last_played_at, '-infinity'::timestamptz),
          COALESCE(EXCLUDED.last_played_at, '-infinity'::timestamptz)
        ),
        stats = public.student_game_progress.stats || EXCLUDED.stats,
        updated_at = now()
    $backfill$;
  END IF;
END $$;
