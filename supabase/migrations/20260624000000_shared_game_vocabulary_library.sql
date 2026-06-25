-- Shared multilingual game vocabulary library.
-- This adds reusable vocabulary infrastructure while preserving the legacy
-- game_questions / vocab_images flow.

CREATE TABLE IF NOT EXISTS public.game_vocabulary_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  image_keyword TEXT NOT NULL,
  image_type TEXT NOT NULL DEFAULT 'object',
  image_url TEXT,
  vocab_image_id UUID,

  en TEXT NOT NULL,
  zh TEXT,
  ja TEXT,

  grade TEXT NOT NULL,
  difficulty TEXT,
  category TEXT,
  status TEXT NOT NULL DEFAULT 'needs_review',
  metadata JSONB NOT NULL DEFAULT '{}'::jsonb,

  created_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),

  CONSTRAINT game_vocabulary_items_status_check
    CHECK (status IN ('needs_review', 'approved', 'rejected'))
);

CREATE TABLE IF NOT EXISTS public.game_vocabulary_generation_batches (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  grade TEXT NOT NULL,
  category TEXT,
  difficulty TEXT,
  requested_count INT NOT NULL,
  target_languages TEXT[] NOT NULL DEFAULT ARRAY['en', 'zh', 'ja'],
  generate_images BOOLEAN NOT NULL DEFAULT TRUE,
  generated_item_ids UUID[] NOT NULL DEFAULT ARRAY[]::UUID[],
  metadata JSONB NOT NULL DEFAULT '{}'::jsonb,
  status TEXT NOT NULL DEFAULT 'completed',
  error_message TEXT,
  created_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),

  CONSTRAINT game_vocabulary_generation_batches_status_check
    CHECK (status IN ('completed', 'partial', 'failed'))
);

CREATE TABLE IF NOT EXISTS public.game_vocabulary_pair_rules (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  vocabulary_item_id UUID NOT NULL
    REFERENCES public.game_vocabulary_items(id) ON DELETE CASCADE,
  language_pair TEXT NOT NULL,
  rule_type TEXT NOT NULL,
  reason TEXT,
  metadata JSONB NOT NULL DEFAULT '{}'::jsonb,
  created_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),

  CONSTRAINT game_vocabulary_pair_rules_type_check
    CHECK (rule_type IN ('banned', 'recently_mastered', 'rejected_pair')),
  CONSTRAINT game_vocabulary_pair_rules_pair_check
    CHECK (language_pair IN ('zh_en', 'zh_ja', 'en_ja')),
  UNIQUE (vocabulary_item_id, language_pair, rule_type)
);

ALTER TABLE public.game_vocabulary_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.game_vocabulary_generation_batches ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.game_vocabulary_pair_rules ENABLE ROW LEVEL SECURITY;

CREATE INDEX IF NOT EXISTS idx_game_vocabulary_items_grade
  ON public.game_vocabulary_items(grade);
CREATE INDEX IF NOT EXISTS idx_game_vocabulary_items_scope
  ON public.game_vocabulary_items(grade, category, difficulty, status);
CREATE INDEX IF NOT EXISTS idx_game_vocabulary_items_status
  ON public.game_vocabulary_items(status);
CREATE INDEX IF NOT EXISTS idx_game_vocabulary_items_en
  ON public.game_vocabulary_items(lower(en));
CREATE UNIQUE INDEX IF NOT EXISTS idx_game_vocabulary_items_unique_scope
  ON public.game_vocabulary_items(
    grade,
    lower(en),
    lower(coalesce(category, '')),
    lower(coalesce(difficulty, ''))
  );
CREATE INDEX IF NOT EXISTS idx_game_vocabulary_items_metadata_gin
  ON public.game_vocabulary_items USING GIN (metadata);

CREATE INDEX IF NOT EXISTS idx_game_vocabulary_batches_created
  ON public.game_vocabulary_generation_batches(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_game_vocabulary_batches_scope
  ON public.game_vocabulary_generation_batches(grade, category, difficulty);

CREATE INDEX IF NOT EXISTS idx_game_vocabulary_pair_rules_item
  ON public.game_vocabulary_pair_rules(vocabulary_item_id);
CREATE INDEX IF NOT EXISTS idx_game_vocabulary_pair_rules_pair
  ON public.game_vocabulary_pair_rules(language_pair, rule_type);

DROP TRIGGER IF EXISTS game_vocabulary_items_updated_at ON public.game_vocabulary_items;
CREATE TRIGGER game_vocabulary_items_updated_at
  BEFORE UPDATE ON public.game_vocabulary_items
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

DROP TRIGGER IF EXISTS game_vocabulary_generation_batches_updated_at
  ON public.game_vocabulary_generation_batches;
CREATE TRIGGER game_vocabulary_generation_batches_updated_at
  BEFORE UPDATE ON public.game_vocabulary_generation_batches
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

DROP TRIGGER IF EXISTS game_vocabulary_pair_rules_updated_at
  ON public.game_vocabulary_pair_rules;
CREATE TRIGGER game_vocabulary_pair_rules_updated_at
  BEFORE UPDATE ON public.game_vocabulary_pair_rules
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

CREATE POLICY "Admins manage game vocabulary items"
  ON public.game_vocabulary_items
  FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE profiles.id = auth.uid()
        AND profiles.role = 'admin'
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE profiles.id = auth.uid()
        AND profiles.role = 'admin'
    )
  );

CREATE POLICY "Authenticated users read approved game vocabulary items"
  ON public.game_vocabulary_items
  FOR SELECT
  USING (auth.uid() IS NOT NULL AND status = 'approved');

CREATE POLICY "Admins manage game vocabulary batches"
  ON public.game_vocabulary_generation_batches
  FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE profiles.id = auth.uid()
        AND profiles.role = 'admin'
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE profiles.id = auth.uid()
        AND profiles.role = 'admin'
    )
  );

CREATE POLICY "Admins manage game vocabulary pair rules"
  ON public.game_vocabulary_pair_rules
  FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE profiles.id = auth.uid()
        AND profiles.role = 'admin'
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE profiles.id = auth.uid()
        AND profiles.role = 'admin'
    )
  );
