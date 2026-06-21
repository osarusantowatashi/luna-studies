import { lazy, Suspense, useCallback, useEffect, useRef, useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { useTranslation } from "react-i18next";
import {
  BarChart3,
  Blocks,
  BookOpen,
  Brain,
  Car,
  ChevronRight,
  Gamepad2,
  Gem,
  GraduationCap,
  Headphones,
  Maximize2,
  MessageCircle,
  Minimize2,
  Puzzle,
  RotateCcw,
  Search,
  Sparkles,
  Target,
} from "lucide-react";
import SeoHelmet from "@/components/SeoHelmet";
import Footer from "@/components/Footer";

type Lang = "en" | "zh" | "ja";
type DemoGame = "memory" | "word" | "letter";
type FaqItem = { q: string; a: string };
type PerfectForItem = { title: string; description: string };

const baseUrl = "https://www.lunastudies.com";
const MemoryFlip = lazy(() => import("@/pages/student/games/MemoryFlip"));
const WordSearch = lazy(() => import("@/pages/student/games/WordSearch"));
const LetterMatch = lazy(() => import("@/pages/student/games/LetterMatch"));

const getLang = (pathname: string): Lang => {
  if (pathname.startsWith("/zh")) return "zh";
  if (pathname.startsWith("/ja")) return "ja";
  return "en";
};

const asStringArray = (value: unknown) =>
  Array.isArray(value) ? value.filter((item): item is string => typeof item === "string") : [];

const asFaqArray = (value: unknown) =>
  Array.isArray(value)
    ? value.filter(
        (item): item is FaqItem =>
          !!item &&
          typeof item === "object" &&
          typeof (item as FaqItem).q === "string" &&
          typeof (item as FaqItem).a === "string"
      )
    : [];

const asPerfectForArray = (value: unknown) =>
  Array.isArray(value)
    ? value.filter(
        (item): item is PerfectForItem =>
          !!item &&
          typeof item === "object" &&
          typeof (item as PerfectForItem).title === "string" &&
          typeof (item as PerfectForItem).description === "string"
      )
    : [];

export default function ArcadeLanding() {
  const location = useLocation();
  const { t } = useTranslation();
  const lang = getLang(location.pathname);
  const [game, setGame] = useState<DemoGame>("memory");
  const demoFrameRef = useRef<HTMLDivElement | null>(null);
  const [demoFullscreen, setDemoFullscreen] = useState(false);
  const [activeDemoFullscreen, setActiveDemoFullscreen] = useState(false);

  const withLang = (path: string) => `/${lang}${path}`;
  const tr = (key: string) => t(`arcadePage.${key}`);
  const seoTitle = tr("seo.title");
  const seoDescription = tr("seo.description");
  const demoProps = {
    demoMode: true,
    fixedGrade: "Grade 1" as const,
    fixedDifficulty: "Easy" as const,
    maxDemoPairs: 50 as const,
    hideStudentIdentity: true,
    disableProgressSaving: true,
    disableUnlocking: true,
    disableResume: true,
  };

  useEffect(() => {
    const handleFullscreenChange = () => {
      const active = document.fullscreenElement === demoFrameRef.current;
      setDemoFullscreen(active);
      setActiveDemoFullscreen(active);
    };

    document.addEventListener("fullscreenchange", handleFullscreenChange);

    return () => {
      document.removeEventListener("fullscreenchange", handleFullscreenChange);
    };
  }, []);

  const toggleDemoFullscreen = async () => {
    const demoFrame = demoFrameRef.current;
    if (!demoFrame) return;

    try {
      if (document.fullscreenElement === demoFrame) {
        await document.exitFullscreen();
        setActiveDemoFullscreen(false);
        return;
      }

      await demoFrame.requestFullscreen();
      setActiveDemoFullscreen(true);
    } catch {
      // Fullscreen is optional for the public preview.
    }
  };

  const handleDemoFullscreenChange = useCallback(
    (active: boolean) => {
      setActiveDemoFullscreen(demoFullscreen || active);
    },
    [demoFullscreen]
  );

  const whyCards = [
    { title: tr("why.cards.interactiveGames"), icon: Gamepad2 },
    { title: tr("why.cards.progressTracking"), icon: BarChart3 },
    { title: tr("why.cards.longTermRetention"), icon: Brain },
  ];
  const ecosystemTitles = asStringArray(
    t("arcadePage.ecosystem.cards", { returnObjects: true })
  );
  const ecosystem = [
    { title: ecosystemTitles[0] || "", icon: Target },
    { title: ecosystemTitles[1] || "", icon: BookOpen },
    { title: ecosystemTitles[2] || "", icon: MessageCircle },
    { title: ecosystemTitles[3] || "", icon: RotateCcw },
    { title: ecosystemTitles[4] || "", icon: BarChart3 },
  ];
  const perfectForItems = asPerfectForArray(
    t("arcadePage.perfectFor.items", { returnObjects: true })
  );
  const faqs = asFaqArray(t("arcadePage.faq.items", { returnObjects: true }));
  const perfectForIcons = [Target, Brain, BookOpen, GraduationCap, MessageCircle, Sparkles];
  const demoIntro = {
    en: {
      title: "Try Luna Arcade Demo",
      subtitle: "Explore a sample of our vocabulary games before creating an account.",
      cta: "Create an account to save progress, unlock levels, and access full vocabulary sets.",
      chips: [
        "No account needed",
        "Free public preview",
        "Grade 1 sample",
        "English vocabulary focus",
        "Progress is not saved",
        "Full levels unlock after joining",
      ],
    },
    zh: {
      title: "试玩 Luna Arcade Demo",
      subtitle: "在创建账户前，先体验 Luna 的词汇游戏样本。",
      cta: "创建账户后即可保存进度、解锁等级，并使用完整词汇库。",
      chips: [
        "无需账户",
        "免费公开预览",
        "Grade 1 样本",
        "英语词汇重点",
        "进度不会保存",
        "加入后解锁完整等级",
      ],
    },
    ja: {
      title: "Luna Arcade Demo を試す",
      subtitle: "アカウント作成前に、語彙ゲームのサンプルを体験できます。",
      cta: "アカウントを作成すると、進捗保存、レベル解放、完全な語彙セットを利用できます。",
      chips: [
        "アカウント不要",
        "無料公開プレビュー",
        "Grade 1 サンプル",
        "英語語彙にフォーカス",
        "進捗は保存されません",
        "参加後に全レベル解放",
      ],
    },
  }[lang];
  const demoGames = [
    {
      key: "memory" as const,
      title: tr("demo.games.memory"),
      status: tr("demo.available"),
      icon: Brain,
      available: true,
    },
    {
      key: "word" as const,
      title: tr("demo.games.word"),
      status: tr("demo.available"),
      icon: Search,
      available: true,
    },
    {
      key: "letter" as const,
      title: "Letter Match",
      status: tr("demo.available"),
      icon: Gem,
      available: true,
    },
    {
      key: "wordDrive",
      title: tr("moreGames.wordDrive"),
      status: tr("demo.comingSoon"),
      icon: Car,
      available: false,
    },
    {
      key: "grammar",
      title: tr("demo.games.grammar"),
      status: tr("demo.comingSoon"),
      icon: Puzzle,
      available: false,
    },
    {
      key: "listening",
      title: tr("demo.games.listening"),
      status: tr("demo.comingSoon"),
      icon: Headphones,
      available: false,
    },
    {
      key: "cat4",
      title: tr("demo.games.cat4"),
      status: tr("demo.comingSoon"),
      icon: Blocks,
      available: false,
    },
  ];

  return (
    <>
      <SeoHelmet
        title={seoTitle}
        description={seoDescription}
        canonicalUrl={`${baseUrl}/${lang}/arcade`}
        currentLang={lang}
      />

      <main className="overflow-hidden bg-[#fffdf8]">
        <section className="relative px-4 pb-16 pt-24 sm:px-6 lg:px-8">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_15%_20%,#f0eaff_0%,transparent_28%),radial-gradient(circle_at_85%_70%,#fff1bd_0%,transparent_30%)]" />

          <div className="relative z-10 mx-auto grid max-w-7xl items-center gap-10 lg:grid-cols-[1fr_440px]">
            <div>
              <p className="inline-flex items-center gap-2 rounded-full border border-[#8d73ff]/25 bg-white/70 px-4 py-2 text-xs font-black uppercase tracking-[0.2em] text-[#8d73ff]">
                <Sparkles className="h-4 w-4" />
                {tr("hero.label")}
              </p>
              <h1 className="mt-6 max-w-4xl font-poppins text-[3.2rem] font-black leading-[0.95] tracking-[-0.045em] text-primary sm:text-[5rem]">
                {tr("hero.title")}
              </h1>
              <p className="mt-6 max-w-2xl text-base leading-8 text-primary/60 sm:text-lg">
                {tr("hero.subtitle")}
              </p>
              <div className="mt-8 flex flex-col gap-3 sm:flex-row">
                <a
                  href="#demo"
                  className="inline-flex h-13 items-center justify-center rounded-2xl bg-primary px-6 py-4 text-sm font-black text-white shadow-[0_15px_40px_rgba(8,42,85,0.18)]"
                >
                  {tr("hero.playDemo")}
                </a>
                <Link
                  to={withLang("/enquiry")}
                  className="inline-flex h-13 items-center justify-center rounded-2xl border border-primary/10 bg-white px-6 py-4 text-sm font-black text-primary"
                >
                  {tr("hero.bookConsultation")}
                </Link>
              </div>
            </div>

            <div className="relative mx-auto w-full max-w-[420px]">
              <div className="absolute inset-0 rounded-[3rem] bg-[#8d73ff]/20 blur-3xl" />
              <div className="relative overflow-hidden rounded-[3rem] border border-white/60 bg-white/80 p-6 shadow-[0_30px_90px_rgba(66,56,120,0.18)]">
                <img
                  src="/mascot/hapiko-step-2.png"
                  alt={tr("hero.visualAlt")}
                  className="mx-auto h-56 object-contain drop-shadow-[0_18px_40px_rgba(139,115,255,0.35)]"
                />
                <div className="mt-4 rounded-[2rem] bg-[#071426] p-4 text-white">
                  <p className="mb-3 text-center text-[11px] font-black uppercase tracking-[0.18em] text-[#C4B5FD]">
                    Chinese → English → Japanese
                  </p>
                  <div className="grid grid-cols-3 gap-2">
                    {["猫", "Cat", "ねこ", "书", "Book", "本"].map((item) => (
                      <div
                        key={item}
                        className="flex aspect-square items-center justify-center rounded-xl bg-white/10 text-lg font-black"
                      >
                        {item}
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="px-4 py-16 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-7xl">
            <div className="max-w-3xl">
              <h2 className="font-poppins text-4xl font-black text-primary">{tr("why.title")}</h2>
              <p className="mt-4 text-base leading-8 text-primary/60">{tr("why.text")}</p>
            </div>
            <div className="mt-8 grid gap-5 md:grid-cols-3">
              {whyCards.map(({ title, icon: Icon }) => (
                <div
                  key={title}
                  className="rounded-[2rem] border border-[#eee8ff] bg-white p-6 shadow-[0_18px_55px_rgba(66,56,120,0.08)]"
                >
                  <Icon className="h-9 w-9 text-[#8d73ff]" />
                  <h3 className="mt-5 text-xl font-black text-primary">{title}</h3>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section id="demo" className="px-4 py-16 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-7xl">
            <div className="mb-7">
              <h2 className="font-poppins text-4xl font-black text-primary">{tr("demo.title")}</h2>
              <p className="mt-3 text-base leading-8 text-primary/60">{tr("demo.subtitle")}</p>
            </div>

            <div className="mb-5 overflow-hidden rounded-[2rem] border border-[#eee8ff] bg-white p-5 shadow-[0_18px_55px_rgba(66,56,120,0.08)] sm:p-6">
              <div className="flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
                <div className="max-w-xl">
                  <p className="text-xs font-black uppercase tracking-[0.2em] text-[#8B5CF6]">
                    Luna Arcade Preview
                  </p>
                  <h3 className="mt-2 font-poppins text-2xl font-black text-primary sm:text-3xl">
                    {demoIntro.title}
                  </h3>
                  <p className="mt-2 text-sm leading-7 text-primary/60">
                    {demoIntro.subtitle}
                  </p>
                  <p className="mt-3 text-sm font-bold leading-6 text-primary/70">
                    {demoIntro.cta}
                  </p>
                </div>

                <div className="flex max-w-2xl flex-wrap gap-2">
                  {demoIntro.chips.map((item) => (
                    <span
                      key={item}
                      className="rounded-full border border-[#8B5CF6]/15 bg-[#f6f1ff] px-3 py-2 text-xs font-black text-primary/75"
                    >
                      {item}
                    </span>
                  ))}
                </div>
              </div>
            </div>

            <div
              ref={demoFrameRef}
              className={`relative overflow-hidden rounded-[2rem] bg-[#071426] p-2 shadow-[0_24px_80px_rgba(0,0,0,0.24)] sm:p-3 ${demoFullscreen ? "flex h-[100dvh] flex-col rounded-none p-0 shadow-none sm:p-0" : ""}`}
            >
              <button
                type="button"
                onClick={toggleDemoFullscreen}
                className="absolute right-3 top-3 z-40 flex h-11 w-11 items-center justify-center rounded-full border border-white/10 bg-[#071426]/85 text-white backdrop-blur-xl transition hover:bg-white/10"
                title={demoFullscreen ? "Exit Fullscreen" : "Fullscreen"}
                aria-label={demoFullscreen ? "Exit demo fullscreen" : "Open demo fullscreen"}
              >
                {demoFullscreen ? (
                  <Minimize2 className="h-5 w-5" />
                ) : (
                  <Maximize2 className="h-5 w-5" />
                )}
              </button>

              <div className={`overflow-hidden rounded-[2rem] bg-[#071426] sm:rounded-[2.5rem] ${demoFullscreen ? "h-full min-h-0 flex-1 rounded-none sm:rounded-none" : ""}`}>
                <Suspense
                  fallback={
                    <div className="flex min-h-[420px] items-center justify-center bg-[#071426] text-sm font-black uppercase tracking-[0.2em] text-[#C4B5FD]">
                      {tr("demo.loading")}
                    </div>
                  }
                >
                  {game === "memory" && (
                    <MemoryFlip
                      {...demoProps}
                      demoFullscreenActive={demoFullscreen}
                      onDemoFullscreenChange={handleDemoFullscreenChange}
                      onRequestSwitchGame={(nextGame) => setGame(nextGame)}
                    />
                  )}
                  {game === "word" && (
                    <WordSearch
                      {...demoProps}
                      demoFullscreenActive={demoFullscreen}
                      onDemoFullscreenChange={handleDemoFullscreenChange}
                      onRequestSwitchGame={(nextGame) => setGame(nextGame)}
                    />
                  )}
                  {game === "letter" && (
                    <LetterMatch
                      {...demoProps}
                      demoFullscreenActive={demoFullscreen}
                      onDemoFullscreenChange={handleDemoFullscreenChange}
                      onRequestSwitchGame={(nextGame) => setGame(nextGame)}
                    />
                  )}
                </Suspense>
              </div>

              {!activeDemoFullscreen && <div className="mt-3 border-t border-white/10 px-2 pb-2 pt-4 sm:px-3">
                <div className="mb-3 flex items-center justify-between gap-3">
                  <p className="text-xs font-black uppercase tracking-[0.22em] text-[#C4B5FD]">
                    {tr("moreGames.title")}
                  </p>
                  <p className="hidden text-xs font-bold text-slate-400 sm:block">
                    {game === "memory"
                      ? tr("demo.games.memory")
                      : game === "word"
                        ? tr("demo.games.word")
                        : "Letter Match"}
                  </p>
                </div>

                <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 lg:grid-cols-6">
                  {demoGames.map(({ key, title, status, icon: Icon, available }) => {
                    const active = key === game;

                    return (
                      <button
                        key={key}
                        type="button"
                        disabled={!available}
                        onClick={() => {
                          if (key === "memory" || key === "word" || key === "letter") setGame(key);
                        }}
                        className={`rounded-[1rem] border p-3 text-left transition ${
                          active
                            ? "border-[#8B5CF6]/45 bg-[#8B5CF6]/18"
                            : available
                              ? "border-white/10 bg-white/[0.055] hover:-translate-y-0.5 hover:bg-white/10"
                              : "border-white/[0.08] bg-white/[0.035]"
                        }`}
                      >
                        <div className="mb-2 flex h-9 w-9 items-center justify-center rounded-xl bg-white/10">
                          <Icon className={`h-5 w-5 ${available ? "text-white" : "text-white/65"}`} />
                        </div>
                        <p className={`text-xs font-black sm:text-sm ${available ? "text-white" : "text-white/70"}`}>
                          {title}
                        </p>
                        <p className="mt-1 text-[11px] font-bold text-slate-400">{status}</p>
                      </button>
                    );
                  })}
                </div>
              </div>}
            </div>
          </div>
        </section>

        <section className="px-4 py-16 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-7xl">
            <h2 className="font-poppins text-4xl font-black text-primary">{tr("ecosystem.title")}</h2>
            <p className="mt-4 max-w-3xl text-base leading-8 text-primary/60">{tr("ecosystem.text")}</p>
            <div className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-5">
              {ecosystem.map(({ title, icon: Icon }) => (
                <div
                  key={title}
                  className="rounded-[1.8rem] border border-[#eee8ff] bg-white p-5 shadow-[0_18px_55px_rgba(66,56,120,0.08)]"
                >
                  <Icon className="h-8 w-8 text-[#8d73ff]" />
                  <h3 className="mt-4 text-base font-black text-primary">{title}</h3>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="px-4 py-16 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-7xl">
            <h2 className="font-poppins text-4xl font-black text-primary">{tr("perfectFor.title")}</h2>

            <div className="mt-8 grid gap-5 md:grid-cols-2 lg:grid-cols-3">
              {perfectForItems.map((item, index) => {
                const Icon = perfectForIcons[index % perfectForIcons.length];

                return (
                  <div
                    key={item.title}
                    className="relative overflow-hidden rounded-[2rem] border border-[#eee8ff] bg-white p-6 shadow-[0_18px_55px_rgba(66,56,120,0.08)]"
                  >
                    <div className="absolute right-[-28px] top-[-28px] h-28 w-28 rounded-full bg-[#f0eaff]" />
                    <div className="relative flex h-12 w-12 items-center justify-center rounded-2xl bg-[#f6f2ff] text-[#8d73ff]">
                      <Icon className="h-6 w-6" />
                    </div>
                    <h3 className="relative mt-5 text-xl font-black text-primary">
                      {item.title}
                    </h3>
                    <p className="relative mt-3 text-sm leading-7 text-primary/60">
                      {item.description}
                    </p>
                  </div>
                );
              })}
            </div>
          </div>
        </section>

        <section className="px-4 py-16 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-5xl">
            <h2 className="font-poppins text-4xl font-black text-primary">{tr("faq.title")}</h2>
            <div className="mt-7 grid gap-4">
              {faqs.map((item) => (
                <div key={item.q} className="rounded-[1.8rem] border border-[#eee8ff] bg-white p-6">
                  <h3 className="text-lg font-black text-primary">{item.q}</h3>
                  <p className="mt-3 text-sm leading-7 text-primary/60">{item.a}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="px-4 pb-24 pt-10 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-5xl rounded-[3rem] bg-primary p-8 text-center text-white shadow-[0_25px_80px_rgba(8,42,85,0.22)] sm:p-12">
            <GraduationCap className="mx-auto h-12 w-12 text-[#F6C65B]" />
            <h2 className="mt-5 font-poppins text-4xl font-black">{tr("cta.title")}</h2>
            <p className="mx-auto mt-4 max-w-2xl leading-8 text-white/75">{tr("cta.description")}</p>
            <Link
              to={withLang("/enquiry")}
              className="mt-7 inline-flex items-center gap-2 rounded-2xl bg-[#F6C65B] px-6 py-4 text-sm font-black text-primary"
            >
              {tr("cta.button")}
              <ChevronRight className="h-4 w-4" />
            </Link>
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}
