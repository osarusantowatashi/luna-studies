DO $$
BEGIN
  DROP POLICY IF EXISTS "Students delete own attempts" ON public.attempts;

  IF EXISTS (
    SELECT 1
    FROM information_schema.columns
    WHERE table_schema = 'public'
      AND table_name = 'attempts'
      AND column_name = 'user_id'
  ) THEN
    EXECUTE $policy$
      CREATE POLICY "Students delete own attempts"
      ON public.attempts
      FOR DELETE
      TO authenticated
      USING (auth.uid() = user_id)
    $policy$;
  ELSIF EXISTS (
    SELECT 1
    FROM information_schema.columns
    WHERE table_schema = 'public'
      AND table_name = 'attempts'
      AND column_name = 'student_id'
  ) THEN
    EXECUTE $policy$
      CREATE POLICY "Students delete own attempts"
      ON public.attempts
      FOR DELETE
      TO authenticated
      USING (auth.uid() = student_id)
    $policy$;
  END IF;
END $$;
