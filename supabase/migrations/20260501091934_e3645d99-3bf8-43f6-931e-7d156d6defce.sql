-- ========== ENUMS ==========
CREATE TYPE public.app_role AS ENUM ('student', 'tutor', 'head_tutor');
CREATE TYPE public.question_type AS ENUM ('multiple_choice', 'fill_blank');

-- ========== PROFILES ==========
CREATE TABLE public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name TEXT NOT NULL DEFAULT '',
  email TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- ========== USER ROLES ==========
CREATE TABLE public.user_roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role public.app_role NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (user_id, role)
);
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

-- Security definer role checker (avoids RLS recursion)
CREATE OR REPLACE FUNCTION public.has_role(_user_id UUID, _role public.app_role)
RETURNS BOOLEAN
LANGUAGE SQL
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.user_roles
    WHERE user_id = _user_id AND role = _role
  )
$$;

-- ========== GRADE LEVELS ==========
CREATE TABLE public.grade_levels (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  subject TEXT NOT NULL,
  grade INT NOT NULL,
  description TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.grade_levels ENABLE ROW LEVEL SECURITY;

-- ========== QUESTIONS ==========
CREATE TABLE public.questions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  grade_level_id UUID NOT NULL REFERENCES public.grade_levels(id) ON DELETE CASCADE,
  skill_tag TEXT NOT NULL,
  type public.question_type NOT NULL,
  prompt TEXT NOT NULL,
  passage TEXT,
  choices JSONB,
  correct_answer TEXT NOT NULL,
  explanation TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.questions ENABLE ROW LEVEL SECURITY;
CREATE INDEX idx_questions_grade ON public.questions(grade_level_id);
CREATE INDEX idx_questions_skill ON public.questions(skill_tag);

-- ========== STUDENT ASSIGNMENTS ==========
-- Links a student to a grade level (unlocked) and optionally a tutor.
CREATE TABLE public.student_assignments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  student_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  grade_level_id UUID NOT NULL REFERENCES public.grade_levels(id) ON DELETE CASCADE,
  tutor_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  unlocked BOOLEAN NOT NULL DEFAULT TRUE,
  assigned_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (student_id, grade_level_id)
);
ALTER TABLE public.student_assignments ENABLE ROW LEVEL SECURITY;
CREATE INDEX idx_assignments_student ON public.student_assignments(student_id);
CREATE INDEX idx_assignments_tutor ON public.student_assignments(tutor_id);

-- Helper: does a student have access to a given grade level?
CREATE OR REPLACE FUNCTION public.student_has_grade_access(_student_id UUID, _grade_level_id UUID)
RETURNS BOOLEAN
LANGUAGE SQL
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.student_assignments
    WHERE student_id = _student_id
      AND grade_level_id = _grade_level_id
      AND unlocked = TRUE
  )
$$;

-- Helper: is _tutor the tutor of _student?
CREATE OR REPLACE FUNCTION public.is_tutor_of(_tutor_id UUID, _student_id UUID)
RETURNS BOOLEAN
LANGUAGE SQL
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.student_assignments
    WHERE student_id = _student_id
      AND tutor_id = _tutor_id
  )
$$;

-- ========== ATTEMPTS ==========
CREATE TABLE public.attempts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  student_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  question_id UUID NOT NULL REFERENCES public.questions(id) ON DELETE CASCADE,
  given_answer TEXT NOT NULL,
  is_correct BOOLEAN NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.attempts ENABLE ROW LEVEL SECURITY;
CREATE INDEX idx_attempts_student ON public.attempts(student_id);
CREATE INDEX idx_attempts_question ON public.attempts(question_id);
CREATE INDEX idx_attempts_correct ON public.attempts(student_id, is_correct);

-- ========== TRIGGERS: profile + default role on signup ==========
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (id, full_name, email)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.raw_user_meta_data->>'name', ''),
    NEW.email
  );
  -- Default new users to student role
  INSERT INTO public.user_roles (user_id, role)
  VALUES (NEW.id, 'student')
  ON CONFLICT DO NOTHING;
  RETURN NEW;
END;
$$;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- updated_at trigger for profiles
CREATE OR REPLACE FUNCTION public.set_updated_at()
RETURNS TRIGGER LANGUAGE plpgsql AS $$
BEGIN NEW.updated_at = now(); RETURN NEW; END;
$$;
CREATE TRIGGER profiles_updated_at BEFORE UPDATE ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- ========== RLS POLICIES ==========

-- profiles
CREATE POLICY "Users view own profile" ON public.profiles FOR SELECT TO authenticated
  USING (auth.uid() = id OR public.has_role(auth.uid(), 'head_tutor') OR public.is_tutor_of(auth.uid(), id));
CREATE POLICY "Users update own profile" ON public.profiles FOR UPDATE TO authenticated
  USING (auth.uid() = id);
CREATE POLICY "Admins manage profiles" ON public.profiles FOR ALL TO authenticated
  USING (public.has_role(auth.uid(), 'head_tutor'))
  WITH CHECK (public.has_role(auth.uid(), 'head_tutor'));

-- user_roles
CREATE POLICY "Users view own roles" ON public.user_roles FOR SELECT TO authenticated
  USING (auth.uid() = user_id OR public.has_role(auth.uid(), 'head_tutor'));
CREATE POLICY "Admins manage roles" ON public.user_roles FOR ALL TO authenticated
  USING (public.has_role(auth.uid(), 'head_tutor'))
  WITH CHECK (public.has_role(auth.uid(), 'head_tutor'));

-- grade_levels: all authenticated can read catalog (just metadata, not content)
CREATE POLICY "Authenticated read grade levels" ON public.grade_levels FOR SELECT TO authenticated
  USING (true);
CREATE POLICY "Admins manage grade levels" ON public.grade_levels FOR ALL TO authenticated
  USING (public.has_role(auth.uid(), 'head_tutor'))
  WITH CHECK (public.has_role(auth.uid(), 'head_tutor'));

-- questions: STRICT — students only see questions in unlocked grade levels.
-- Tutors can only see questions their assigned students answered incorrectly (enforced via attempts query, not direct read).
CREATE POLICY "Students read assigned questions" ON public.questions FOR SELECT TO authenticated
  USING (
    public.has_role(auth.uid(), 'student')
    AND public.student_has_grade_access(auth.uid(), grade_level_id)
  );
CREATE POLICY "Admins read all questions" ON public.questions FOR SELECT TO authenticated
  USING (public.has_role(auth.uid(), 'head_tutor'));
CREATE POLICY "Tutors read questions their students missed" ON public.questions FOR SELECT TO authenticated
  USING (
    public.has_role(auth.uid(), 'tutor')
    AND EXISTS (
      SELECT 1 FROM public.attempts a
      JOIN public.student_assignments sa ON sa.student_id = a.student_id
      WHERE a.question_id = questions.id
        AND a.is_correct = FALSE
        AND sa.tutor_id = auth.uid()
    )
  );
CREATE POLICY "Admins manage questions" ON public.questions FOR ALL TO authenticated
  USING (public.has_role(auth.uid(), 'head_tutor'))
  WITH CHECK (public.has_role(auth.uid(), 'head_tutor'));

-- student_assignments
CREATE POLICY "Students view own assignments" ON public.student_assignments FOR SELECT TO authenticated
  USING (auth.uid() = student_id);
CREATE POLICY "Tutors view their student assignments" ON public.student_assignments FOR SELECT TO authenticated
  USING (auth.uid() = tutor_id);
CREATE POLICY "Admins manage assignments" ON public.student_assignments FOR ALL TO authenticated
  USING (public.has_role(auth.uid(), 'head_tutor'))
  WITH CHECK (public.has_role(auth.uid(), 'head_tutor'));

-- attempts
CREATE POLICY "Students view own attempts" ON public.attempts FOR SELECT TO authenticated
  USING (auth.uid() = student_id);
CREATE POLICY "Students insert own attempts" ON public.attempts FOR INSERT TO authenticated
  WITH CHECK (
    auth.uid() = student_id
    AND public.has_role(auth.uid(), 'student')
    AND EXISTS (
      SELECT 1 FROM public.questions q
      WHERE q.id = question_id
        AND public.student_has_grade_access(auth.uid(), q.grade_level_id)
    )
  );
CREATE POLICY "Tutors view assigned student attempts" ON public.attempts FOR SELECT TO authenticated
  USING (
    public.has_role(auth.uid(), 'tutor')
    AND public.is_tutor_of(auth.uid(), student_id)
  );
CREATE POLICY "Admins view all attempts" ON public.attempts FOR SELECT TO authenticated
  USING (public.has_role(auth.uid(), 'head_tutor'));

-- ========== SEED DATA ==========
INSERT INTO public.grade_levels (name, subject, grade, description) VALUES
  ('Grade 3 Reading', 'Reading', 3, 'Foundational reading comprehension and inference'),
  ('Grade 3 Vocabulary', 'Vocabulary', 3, 'Core vocabulary and word relationships'),
  ('Grade 4 Math', 'Math', 4, 'Multiplication, division, and word problems'),
  ('Grade 5 Reading', 'Reading', 5, 'Advanced inference and main idea practice');
