import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { supabase } from "@/lib/supabase";
import { Button } from "@/components/ui/button";
import { BookOpen, Sparkles, Trash2 } from "lucide-react";

type Deck = {
  id: string;
  deck_name: string;
  word_language: string;
  helper_language: string;
  difficulty: string;
  cards: any[];
  created_at: string;
};

export default function SavedFlashcardDecks() {
  const [decks, setDecks] = useState<Deck[]>([]);
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState("");

  const loadDecks = async () => {
    setLoading(true);
    setErrorMsg("");

    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) throw new Error("Please log in to view saved decks.");

      const { data, error } = await supabase
        .from("flashcard_decks")
        .select("*")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false });

      if (error) throw error;

      setDecks(data || []);
    } catch (err: any) {
      setErrorMsg(err.message || "Failed to load decks.");
    } finally {
      setLoading(false);
    }
  };

  const deleteDeck = async (id: string) => {
    const { error } = await supabase
      .from("flashcard_decks")
      .delete()
      .eq("id", id);

    if (error) {
      setErrorMsg(error.message);
      return;
    }

    setDecks((prev) => prev.filter((deck) => deck.id !== id));
  };

  useEffect(() => {
    loadDecks();
  }, []);

  return (
    <div className="min-h-screen overflow-hidden bg-white px-4 py-6 sm:px-6 sm:py-14">
      <div className="pointer-events-none fixed inset-0 bg-[radial-gradient(circle_at_15%_15%,#f0eaff_0%,transparent_28%),radial-gradient(circle_at_85%_75%,#fff1bd_0%,transparent_30%)]" />

      <div className="relative z-10 mx-auto max-w-[1180px] space-y-8">
        <section className="relative overflow-hidden rounded-[2rem] border border-[#eee8ff] bg-white p-5 shadow-[0_25px_80px_rgba(66,56,120,0.10)] sm:rounded-[3rem] sm:p-8">
          <p className="flex items-center gap-2 text-sm font-black uppercase tracking-[0.25em] text-[#8d73ff]">
            <Sparkles className="h-5 w-5" />
            Saved Flashcards
          </p>

          <h1 className="mt-4 font-poppins text-[2.5rem] font-black leading-[1] text-primary sm:text-[4rem]">
            Your saved decks.
          </h1>
        </section>

        {errorMsg && (
          <div className="rounded-2xl bg-red-50 p-4 font-bold text-red-700">
            {errorMsg}
          </div>
        )}

        {loading ? (
          <div className="rounded-[2rem] bg-white p-8 text-center font-black text-primary shadow-[0_25px_80px_rgba(66,56,120,0.10)]">
            Loading decks...
          </div>
        ) : decks.length === 0 ? (
          <div className="rounded-[2rem] bg-white p-8 text-center text-primary/60 shadow-[0_25px_80px_rgba(66,56,120,0.10)]">
            No saved decks yet.
          </div>
        ) : (
          <section className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {decks.map((deck) => (
              <div
                key={deck.id}
                className="rounded-[2rem] bg-white p-5 shadow-[0_18px_55px_rgba(66,56,120,0.08)]"
              >
                <div className="flex h-16 w-16 items-center justify-center rounded-[1.4rem] bg-[#f6f1ff]">
                  <BookOpen className="h-8 w-8 text-[#8d73ff]" />
                </div>

                <h2 className="mt-5 font-poppins text-2xl font-black text-primary">
                  {deck.deck_name}
                </h2>

                <p className="mt-3 text-sm font-bold text-primary/50">
                  {deck.word_language} → {deck.helper_language}
                </p>

                <p className="mt-1 text-sm font-bold text-primary/50">
                  {deck.cards?.length || 0} cards · {deck.difficulty}
                </p>

                <div className="mt-6 flex gap-2">
                  <Link to={`/flashcards?deck=${deck.id}`} className="flex-1">
                    <Button className="h-12 w-full rounded-2xl bg-primary font-black text-white">
                      Open
                    </Button>
                  </Link>

                  <Button
                    variant="destructive"
                    onClick={() => deleteDeck(deck.id)}
                    className="h-12 rounded-2xl"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            ))}
          </section>
        )}
      </div>
    </div>
  );
}