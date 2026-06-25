export type GameVocabularyItem = {
  id: string;
  image_keyword: string;
  image_type?: string | null;
  image_url?: string | null;
  en?: string | null;
  zh?: string | null;
  ja?: string | null;
  grade: string;
  difficulty?: string | null;
  category?: string | null;
  status?: string | null;
};

export const loadGameVocabularyItems = async ({
  supabase,
  grade,
  limit = 500,
}: {
  supabase: any;
  grade: string;
  limit?: number;
}) => {
  const { data, error } = await supabase
    .from("game_vocabulary_items")
    .select("id, image_keyword, image_type, image_url, en, zh, ja, grade, difficulty, category, status")
    .eq("grade", grade)
    .order("created_at", { ascending: false })
    .limit(limit);

  if (error) {
    return {
      items: [] as GameVocabularyItem[],
      error,
    };
  }

  return {
    items: (data || []) as GameVocabularyItem[],
    error: null,
  };
};
